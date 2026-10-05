export type FileClassification = 'SAFE' | 'SENSITIVE' | 'IGNORED' | 'BINARY' | 'UNSUPPORTED';

export type ConfidenceLevel = 'High confidence' | 'Medium confidence' | 'Inferred' | 'Potential';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  size: number;
  lines: number;
  extension: string;
  classification: FileClassification;
  classificationReason?: string;
  content?: string;
  isRedacted?: boolean;
  redactedCount?: number;
  isAnalyzed?: boolean;
  parseError?: string;
}

export interface FunctionAnalysis {
  name: string;
  line: number;
  endLine?: number;
  isAsync: boolean;
  isExported: boolean;
  params: string[];
  purpose?: string;
  simpleExplanation?: string;
  calledBy?: string[];
  calls?: string[];
  returns?: string;
  confidence: ConfidenceLevel;
}

export interface ClassAnalysis {
  name: string;
  line: number;
  isExported: boolean;
  superClass?: string;
  methods: string[];
  properties: string[];
}

export interface ComponentAnalysis {
  name: string;
  line: number;
  isExported: boolean;
  type: 'React' | 'Vue' | 'Svelte' | 'WebComponent' | 'Unknown';
  hooksUsed: string[];
  props: string[];
  subComponentsRendered: string[];
}

export interface ImportItem {
  source: string;
  specifiers: string[];
  isDefault: boolean;
  line: number;
}

export interface ExportItem {
  name: string;
  isDefault: boolean;
  line: number;
}

export interface DomOperation {
  api: string;
  selector?: string;
  inferredTarget?: string;
  purpose: string;
  file: string;
  line: number;
  codeSnippet: string;
  enclosingFunction?: string;
  confidence: ConfidenceLevel;
}

export interface DomStats {
  totalOperations: number;
  apiBreakdown: Record<string, number>;
  selectorBreakdown: Record<string, number>;
  eventsBreakdown: Record<string, number>;
  mostUsedFile: string;
  operations: DomOperation[];
}

export interface ApiCall {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'WS' | 'GQL' | 'UNKNOWN';
  endpoint: string;
  fullUrl?: string;
  domain?: string;
  clientType: 'fetch' | 'axios' | 'xhr' | 'websocket' | 'graphql' | 'other';
  file: string;
  line: number;
  codeSnippet: string;
  headersRedacted: boolean;
  enclosingFunction?: string;
}

export interface BackendRoute {
  method: string;
  path: string;
  handler: string;
  file: string;
  line: number;
  middleware: string[];
  authRequired: boolean;
  associatedModel?: string;
}

export interface DatabaseOperation {
  databaseType: 'MongoDB' | 'PostgreSQL' | 'MySQL' | 'SQLite' | 'Firebase' | 'Supabase' | 'Redis' | 'Unknown';
  collectionOrTable: string;
  operation: string;
  file: string;
  line: number;
  codeSnippet: string;
}

export interface ChromeExtensionArchitecture {
  isExtension: boolean;
  manifestVersion?: 2 | 3;
  name?: string;
  permissions: string[];
  hostPermissions: string[];
  contentScripts: { matches: string[]; js: string[]; css?: string[] }[];
  backgroundScript?: string;
  popupHtml?: string;
  sidePanelHtml?: string;
  messagePassing: {
    senders: { file: string; line: number; messageType?: string }[];
    listeners: { file: string; line: number; type: string }[];
  };
  storageUsed: boolean;
}

export interface DependencyItem {
  name: string;
  version: string;
  isDev: boolean;
  category: 'Frontend' | 'Backend' | 'Database' | 'Styling' | 'Testing' | 'Build/Tooling' | 'Security' | 'Other';
  isDirect: boolean;
  usageCount: number;
  usedInFiles: string[];
  usageEvidence?: string;
  isLikelyUnused: boolean;
}

export interface SecurityConcern {
  id: string;
  title: string;
  category: 'Secrets' | 'Code Injection' | 'XSS' | 'Insecure Auth' | 'Permissions' | 'Network' | 'Filesystem';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  file: string;
  line: number;
  codeSnippet: string;
  reason: string;
  suggestedReview: string;
  confidence: ConfidenceLevel;
}

export interface PerformanceConcern {
  id: string;
  title: string;
  category: 'DOM Operations' | 'Event Handlers' | 'Loops' | 'Re-renders' | 'Network' | 'Memory';
  severity: 'High' | 'Medium' | 'Low';
  file: string;
  line: number;
  codeSnippet: string;
  reason: string;
  suggestedReview: string;
  confidence: ConfidenceLevel;
}

export interface DataFlowStep {
  id: string;
  stage: 'User Action' | 'UI Component' | 'State/Store' | 'Service/Hook' | 'API Call' | 'Backend Route' | 'Database' | 'Response' | 'UI Update';
  label: string;
  file?: string;
  line?: number;
  details: string;
}

export interface DataFlowTrace {
  id: string;
  name: string;
  description: string;
  steps: DataFlowStep[];
}

export interface ArchitectureNode {
  id: string;
  label: string;
  sublabel?: string;
  type: 'client' | 'frontend' | 'state' | 'api' | 'backend' | 'database' | 'service' | 'extension';
  technologies: string[];
  fileCount: number;
  files: string[];
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol?: string;
}

export interface TechStackDetection {
  frontend: string[];
  backend: string[];
  databases: string[];
  styling: string[];
  buildTools: string[];
  testing: string[];
  stateManagement: string[];
  primaryLanguage: string;
  languages: { name: string; percentage: number; filesCount: number; linesCount: number }[];
}

export interface FileAnalysisResult {
  file: ProjectFile;
  purpose: string;
  simpleExplanation: string;
  mainResponsibilities: string[];
  functions: FunctionAnalysis[];
  classes: ClassAnalysis[];
  components: ComponentAnalysis[];
  imports: ImportItem[];
  exports: ExportItem[];
  domOperations: DomOperation[];
  apiCalls: ApiCall[];
  dependencies: string[];
  dependents: string[];
  cyclomaticComplexity: number;
  deadCodeCandidates: { name: string; line: number; type: 'function' | 'variable'; reason: string }[];
  securityConcerns: SecurityConcern[];
  performanceConcerns: PerformanceConcern[];
}

export interface PrivacyAuditReport {
  totalDetectedFiles: number;
  analyzedFilesCount: number;
  sensitiveFilesBlockedCount: number;
  ignoredFilesCount: number;
  binaryFilesCount: number;
  secretsRedactedCount: number;
  blockedFilesList: { path: string; reason: string }[];
  ignoredFilesList: { path: string; reason: string }[];
  redactedSecretsSample: { file: string; line: number; rule: string }[];
  processingMode: '100% In-Browser (Zero External Upload)';
  dataRetention: 'Ephemeral session only. Memory automatically cleared upon reset.';
}

export interface FullProjectAnalysis {
  projectName: string;
  timestamp: string;
  overview: {
    totalFiles: number;
    analyzedFiles: number;
    linesOfCode: number;
    functionsCount: number;
    componentsCount: number;
    classesCount: number;
    domOperationsCount: number;
    apiCallsCount: number;
    securityConcernsCount: number;
    performanceConcernsCount: number;
  };
  techStack: TechStackDetection;
  fileTree: FileTreeNode;
  files: Record<string, FileAnalysisResult>;
  domStats: DomStats;
  apiCalls: ApiCall[];
  backendRoutes: BackendRoute[];
  databaseOperations: DatabaseOperation[];
  chromeExtension?: ChromeExtensionArchitecture;
  dependencies: DependencyItem[];
  securityConcerns: SecurityConcern[];
  performanceConcerns: PerformanceConcern[];
  architecture: {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
  };
  dataFlows: DataFlowTrace[];
  privacyReport: PrivacyAuditReport;
  aiProjectSummary: {
    developerSummary: string;
    simpleSummary: string;
    architectureOverview: string;
    keyHighlights: string[];
    recommendedNextSteps: string[];
  };
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  classification?: FileClassification;
  size?: number;
  children?: FileTreeNode[];
  fileData?: ProjectFile;
}
