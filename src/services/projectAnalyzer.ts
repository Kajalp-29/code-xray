import JSZip from 'jszip';
import {
  FileAnalysisResult,
  FileTreeNode,
  FullProjectAnalysis,
  ProjectFile
} from '../types/analyzer';
import { explainFile, explainFunction, generateProjectExecutiveSummary } from './aiExplainer';
import {
  analyzeBackendRoutes,
  analyzeChromeExtension,
  analyzeDatabaseOperations,
  analyzeFileApiCalls
} from './apiAnalyzer';
import { generateArchitecture, generateDataFlows } from './architectureGenerator';
import { parseFileAst } from './astParser';
import { aggregateDomStats, analyzeFileDom } from './domAnalyzer';
import { analyzePerformance } from './performanceAnalyzer';
import { scanAndClassifyFiles } from './privacyScanner';
import { analyzeSecurity } from './securityAnalyzer';
import { analyzeDependencies, detectTechStack } from './techDetector';

export interface ScanProgress {
  stage: string;
  current: number;
  total: number;
  percentage: number;
}

/**
 * Build a nested FileTreeNode hierarchy from flat list of ProjectFile
 */
export function buildFileTree(files: ProjectFile[]): FileTreeNode {
  const root: FileTreeNode = {
    name: 'root',
    path: '',
    type: 'directory',
    children: []
  };

  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      if (isFile) {
        current.children = current.children || [];
        current.children.push({
          name: part,
          path: file.path,
          type: 'file',
          classification: file.classification,
          size: file.size,
          fileData: file
        });
      } else {
        current.children = current.children || [];
        let dir = current.children.find(c => c.name === part && c.type === 'directory');
        if (!dir) {
          dir = {
            name: part,
            path: currentPath,
            type: 'directory',
            children: []
          };
          current.children.push(dir);
        }
        current = dir;
      }
    });
  });

  return root;
}

/**
 * Extract raw files from a ZIP Blob/ArrayBuffer entirely in the browser
 */
export async function extractZipFiles(
  zipData: ArrayBuffer | Blob,
  onProgress?: (msg: string) => void
): Promise<{ path: string; size: number; content?: string }[]> {
  onProgress?.('Decompressing ZIP archive in memory...');
  const zip = await JSZip.loadAsync(zipData);
  const rawFiles: { path: string; size: number; content?: string }[] = [];

  const fileEntries = Object.entries(zip.files);
  let processed = 0;

  for (const [path, zipEntry] of fileEntries) {
    if (zipEntry.dir) continue;

    // Safety checks against ZIP bombs / corrupted sizes
    const size = (zipEntry as any)._data?.uncompressedSize || 0;
    if (size > 15 * 1024 * 1024) {
      // Skip enormous individual files (>15MB) to preserve browser memory
      continue;
    }

    try {
      const isText = /\.(js|jsx|ts|tsx|html|htm|css|scss|json|md|py|java|go|rs|php|rb|sql|yaml|yml|toml|txt|env.*|config.*)$/i.test(path) ||
        ['manifest.json', 'package.json', 'Dockerfile'].some(n => path.endsWith(n));

      let content: string | undefined = undefined;
      if (isText && size < 5 * 1024 * 1024) {
        content = await zipEntry.async('string');
      }

      rawFiles.push({
        path: path.replace(/^\/+/, ''),
        size,
        content
      });
    } catch {
      // non-text binary or decode error
      rawFiles.push({ path, size });
    }

    processed++;
    if (processed % 20 === 0) {
      onProgress?.(`Unpacking ${processed}/${fileEntries.length} files...`);
    }
  }

  return rawFiles;
}

/**
 * Stage 1: Privacy Scan & Initial Classification
 */
export function performPrivacyScan(
  rawFiles: { path: string; size: number; content?: string }[],
  projectName: string
): {
  projectName: string;
  projectFiles: ProjectFile[];
  fileTree: FileTreeNode;
  privacyReport: FullProjectAnalysis['privacyReport'];
} {
  const { projectFiles, summary } = scanAndClassifyFiles(rawFiles);
  const fileTree = buildFileTree(projectFiles);

  const blockedList = projectFiles
    .filter(f => f.classification === 'SENSITIVE')
    .map(f => ({ path: f.path, reason: f.classificationReason || 'Sensitive configuration/credential' }));

  const ignoredList = projectFiles
    .filter(f => f.classification === 'IGNORED')
    .map(f => ({ path: f.path, reason: f.classificationReason || 'Ignored directory' }));

  const redactedSamples = projectFiles
    .filter(f => f.isRedacted)
    .map(f => ({ file: f.path, line: 1, rule: 'Secret pattern matched and redacted to [REDACTED_SECRET]' }));

  const privacyReport: FullProjectAnalysis['privacyReport'] = {
    totalDetectedFiles: summary.total,
    analyzedFilesCount: summary.safe,
    sensitiveFilesBlockedCount: summary.sensitive,
    ignoredFilesCount: summary.ignored,
    binaryFilesCount: summary.binary,
    secretsRedactedCount: summary.secretsRedacted,
    blockedFilesList: blockedList,
    ignoredFilesList: ignoredList,
    redactedSecretsSample: redactedSamples,
    processingMode: '100% In-Browser (Zero External Upload)',
    dataRetention: 'Ephemeral session only. Memory automatically cleared upon reset.'
  };

  return {
    projectName,
    projectFiles,
    fileTree,
    privacyReport
  };
}

/**
 * Stage 2: Deep Project Analysis (AST, DOM, APIs, Dependencies, Architecture, AI Summaries)
 */
export async function performDeepAnalysis(
  projectName: string,
  projectFiles: ProjectFile[],
  fileTree: FileTreeNode,
  privacyReport: FullProjectAnalysis['privacyReport'],
  onProgress?: (progress: ScanProgress) => void
): Promise<FullProjectAnalysis> {
  const safeFiles = projectFiles.filter(f => f.classification === 'SAFE');
  const filesAnalysisMap: Record<string, FileAnalysisResult> = {};
  const allDomOps: any[] = [];
  const allApiCalls: any[] = [];
  let totalLOC = 0;
  let totalFunctions = 0;
  let totalComponents = 0;
  let totalClasses = 0;

  // Process safe files in chunks to avoid freezing the UI thread
  for (let i = 0; i < safeFiles.length; i++) {
    const file = safeFiles[i];
    totalLOC += file.lines;

    // Yield control periodically for smooth progress rendering
    if (i % 8 === 0) {
      onProgress?.({
        stage: `Analyzing ${file.name} (${i + 1}/${safeFiles.length})`,
        current: i + 1,
        total: safeFiles.length,
        percentage: Math.round(((i + 1) / safeFiles.length) * 100)
      });
      await new Promise(r => setTimeout(r, 0));
    }

    const astResult = parseFileAst(file);
    const domOps = analyzeFileDom(file);
    const apiCalls = analyzeFileApiCalls(file);

    allDomOps.push(...domOps);
    allApiCalls.push(...apiCalls);
    totalFunctions += astResult.functions.length;
    totalComponents += astResult.components.length;
    totalClasses += astResult.classes.length;

    // Enhance function explanations
    const enhancedFunctions = astResult.functions.map(fn => {
      const exp = explainFunction(fn, file);
      return {
        ...fn,
        purpose: exp.purpose,
        simpleExplanation: exp.simpleExplanation
      };
    });

    const fileSummary = explainFile(file, {
      functions: enhancedFunctions,
      components: astResult.components,
      domOperations: domOps,
      apiCalls,
      imports: astResult.imports,
      exports: astResult.exports
    });

    filesAnalysisMap[file.path] = {
      file,
      purpose: fileSummary.purpose,
      simpleExplanation: fileSummary.simpleExplanation,
      mainResponsibilities: fileSummary.mainResponsibilities,
      functions: enhancedFunctions,
      classes: astResult.classes,
      components: astResult.components,
      imports: astResult.imports,
      exports: astResult.exports,
      domOperations: domOps,
      apiCalls,
      dependencies: astResult.imports.map(i => i.source),
      dependents: [],
      cyclomaticComplexity: astResult.cyclomaticComplexity,
      deadCodeCandidates: astResult.deadCodeCandidates,
      securityConcerns: [],
      performanceConcerns: []
    };
  }

  // Cross-reference dependencies and dependents
  Object.keys(filesAnalysisMap).forEach(filePath => {
    const fileAnalysis = filesAnalysisMap[filePath];
    fileAnalysis.dependencies.forEach(depSource => {
      // check if relative local file
      Object.keys(filesAnalysisMap).forEach(targetPath => {
        if (targetPath !== filePath && targetPath.includes(depSource.replace(/^[./]+/, ''))) {
          if (!filesAnalysisMap[targetPath].dependents.includes(filePath)) {
            filesAnalysisMap[targetPath].dependents.push(filePath);
          }
        }
      });
    });
  });

  // Global Analyzers
  const domStats = aggregateDomStats(allDomOps);
  const backendRoutes = analyzeBackendRoutes(safeFiles);
  const databaseOperations = analyzeDatabaseOperations(safeFiles);
  const chromeExtension = analyzeChromeExtension(safeFiles);
  const dependencies = analyzeDependencies(safeFiles);
  const techStack = detectTechStack(safeFiles, dependencies);
  const securityConcerns = analyzeSecurity(safeFiles);
  const performanceConcerns = analyzePerformance(safeFiles);

  const architecture = generateArchitecture(
    safeFiles,
    techStack,
    backendRoutes,
    databaseOperations,
    chromeExtension
  );

  const dataFlows = generateDataFlows(
    safeFiles,
    techStack,
    backendRoutes,
    databaseOperations,
    chromeExtension
  );

  const overview = {
    totalFiles: projectFiles.length,
    analyzedFiles: safeFiles.length,
    linesOfCode: totalLOC,
    functionsCount: totalFunctions,
    componentsCount: totalComponents,
    classesCount: totalClasses,
    domOperationsCount: allDomOps.length,
    apiCallsCount: allApiCalls.length,
    securityConcernsCount: securityConcerns.length,
    performanceConcernsCount: performanceConcerns.length
  };

  const partialAnalysis: Partial<FullProjectAnalysis> = {
    projectName,
    overview,
    techStack,
    domStats,
    backendRoutes,
    databaseOperations,
    chromeExtension,
    dependencies,
    securityConcerns,
    performanceConcerns,
    privacyReport
  };

  const aiProjectSummary = generateProjectExecutiveSummary(partialAnalysis);

  return {
    projectName,
    timestamp: new Date().toLocaleString(),
    overview,
    techStack,
    fileTree,
    files: filesAnalysisMap,
    domStats,
    apiCalls: allApiCalls,
    backendRoutes,
    databaseOperations,
    chromeExtension,
    dependencies,
    securityConcerns,
    performanceConcerns,
    architecture,
    dataFlows,
    privacyReport,
    aiProjectSummary
  };
}
