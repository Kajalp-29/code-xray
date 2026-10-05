import {
  FileAnalysisResult,
  FullProjectAnalysis,
  FunctionAnalysis,
  ProjectFile
} from '../types/analyzer';

/**
 * Generate human-readable technical and plain English explanations for a file
 */
export function explainFile(
  file: ProjectFile,
  analysis: Partial<FileAnalysisResult>
): {
  purpose: string;
  simpleExplanation: string;
  mainResponsibilities: string[];
} {
  const fileName = file.name;
  const ext = file.extension.toLowerCase();
  const functions = analysis.functions || [];
  const components = analysis.components || [];
  const domOps = analysis.domOperations || [];
  const apis = analysis.apiCalls || [];
  const imports = analysis.imports || [];
  const exports = analysis.exports || [];

  // Determine primary archetype
  let archetype = 'General Source Code';
  const responsibilities: string[] = [];

  if (fileName === 'manifest.json') {
    archetype = 'Extension Manifest';
    responsibilities.push('Declares Chrome extension permissions, background scripts, and content script injection rules.');
  } else if (fileName.includes('config') || fileName.startsWith('.')) {
    archetype = 'Build Configuration';
    responsibilities.push('Configures compiler, bundling, style processing, or development tooling environment.');
  } else if (components.length > 0) {
    archetype = 'UI Component Module';
    responsibilities.push(`Renders ${components.map(c => `<${c.name} />`).join(', ')} interface elements.`);
    if (domOps.length > 0) responsibilities.push('Interacts directly with the browser DOM tree.');
    if (apis.length > 0) responsibilities.push('Executes asynchronous network requests for dynamic data fetching.');
  } else if (file.path.includes('api') || file.path.includes('routes') || file.path.includes('controllers')) {
    archetype = 'API Controller & Backend Route';
    responsibilities.push('Defines HTTP API endpoints, validates incoming payloads, and orchestrates services.');
  } else if (file.path.includes('service') || file.path.includes('client')) {
    archetype = 'Service & Networking Client';
    responsibilities.push('Encapsulates external API communication, data transformations, and business operations.');
  } else if (file.path.includes('store') || file.path.includes('hook')) {
    archetype = 'State Management & Custom Hook';
    responsibilities.push('Manages global or local application state, subscriptions, and cached entities.');
  } else if (domOps.length > 5 || fileName.includes('content')) {
    archetype = 'DOM Manipulation & Content Script';
    responsibilities.push('Inspects webpage DOM nodes, monitors mutations, and alters document structure.');
  } else if (functions.length > 0) {
    archetype = 'Utility & Helper Functions Module';
    responsibilities.push(`Provides ${functions.length} reusable computational functions (${functions.slice(0, 3).map(f => f.name).join(', ')}).`);
  }

  if (responsibilities.length === 0) {
    responsibilities.push('Provides application logic and structural support.');
  }

  // Developer summary
  let devPurpose = `This ${ext.toUpperCase()} file serves as a **${archetype}**. `;
  if (imports.length > 0) {
    devPurpose += `It integrates dependencies from ${imports.slice(0, 3).map(i => `'${i.source}'`).join(', ')}. `;
  }
  if (functions.length > 0) {
    devPurpose += `It exposes ${functions.length} primary function(s) including \`${functions[0].name}()\`. `;
  }
  if (domOps.length > 0) {
    devPurpose += `It performs ${domOps.length} direct DOM operation(s). `;
  }
  if (apis.length > 0) {
    devPurpose += `It executes ${apis.length} network API request(s).`;
  }

  // Plain English simple explanation
  let simpleExplanation = '';
  if (archetype === 'UI Component Module') {
    simpleExplanation = `This file is responsible for drawing a part of the user interface on screen. It controls how information is displayed to the user and responds when buttons or forms are clicked.`;
  } else if (archetype === 'DOM Manipulation & Content Script') {
    simpleExplanation = `This script directly interacts with the webpage elements (like buttons, videos, or text). It searches for specific items on the page and modifies or tracks them.`;
  } else if (archetype === 'API Controller & Backend Route') {
    simpleExplanation = `This file acts as a gatekeeper for incoming web requests. It receives data sent from the website, checks that it is valid, and asks the database to save or fetch data.`;
  } else if (archetype === 'State Management & Custom Hook') {
    simpleExplanation = `This file holds and updates important data (like user login status or cart items) so that all parts of the application stay synchronized.`;
  } else {
    simpleExplanation = `This file provides helper tools and background logic to support the main features of the project without displaying visual elements directly.`;
  }

  return {
    purpose: devPurpose,
    simpleExplanation,
    mainResponsibilities: responsibilities
  };
}

/**
 * Generate function explanations
 */
export function explainFunction(func: FunctionAnalysis, file: ProjectFile): { purpose: string; simpleExplanation: string } {
  const name = func.name;
  let devPurpose = '';
  let simple = '';

  if (/^(get|fetch|load|read)/i.test(name)) {
    devPurpose = `Retrieves or loads data asynchronously/synchronously. Accepts (${func.params.join(', ') || 'no arguments'}).`;
    simple = `Fetches data needed by the application.`;
  } else if (/^(set|save|update|write|put)/i.test(name)) {
    devPurpose = `Mutates or persists data state with parameters (${func.params.join(', ') || 'payload'}).`;
    simple = `Updates and saves new information.`;
  } else if (/^(handle|on|click|submit|change)/i.test(name)) {
    devPurpose = `Event handler callback responding to user or system trigger events.`;
    simple = `Runs automatically when the user performs an action (such as clicking or typing).`;
  } else if (/^(validate|check|verify|is)/i.test(name)) {
    devPurpose = `Validates input invariants and returns boolean or sanitized values.`;
    simple = `Checks whether information meets safety and format rules.`;
  } else if (/^(render|draw|paint)/i.test(name)) {
    devPurpose = `Constructs or returns UI markup elements.`;
    simple = `Draws visual elements onto the screen.`;
  } else if (/^(init|setup|mount|start)/i.test(name)) {
    devPurpose = `Initializes configuration, listeners, and runtime state on startup.`;
    simple = `Sets up everything required when the application or component first opens.`;
  } else {
    devPurpose = `Executes core computational logic for ${name}(). Calls internal utilities: ${func.calls?.slice(0, 3).join(', ') || 'none'}.`;
    simple = `Performs a specific task named '${name}' to help the program run.`;
  }

  return { purpose: devPurpose, simpleExplanation: simple };
}

/**
 * Generate overall project executive summary
 */
export function generateProjectExecutiveSummary(analysis: Partial<FullProjectAnalysis>): {
  developerSummary: string;
  simpleSummary: string;
  architectureOverview: string;
  keyHighlights: string[];
  recommendedNextSteps: string[];
} {
  const tech = analysis.techStack;
  const overview = analysis.overview;
  const sec = analysis.securityConcerns || [];
  const perf = analysis.performanceConcerns || [];
  const dom = analysis.domStats;
  const isExt = analysis.chromeExtension?.isExtension;

  const techNames = [
    ...(tech?.frontend || []),
    ...(tech?.backend || []),
    ...(tech?.databases || [])
  ].filter(Boolean);

  const developerSummary = `This project is a **${isExt ? 'Chrome Browser Extension' : 'Modern Web Application'}** built primarily with **${tech?.primaryLanguage || 'JavaScript'}** (${overview?.linesOfCode?.toLocaleString() || 0} analyzed LOC across ${overview?.analyzedFiles || 0} source files). It utilizes a stack composed of **${techNames.join(', ') || 'Standard Web Standards'}**. The codebase features ${overview?.functionsCount || 0} functions, ${overview?.componentsCount || 0} UI components, ${overview?.domOperationsCount || 0} DOM operations, and ${overview?.apiCallsCount || 0} API integration points.`;

  const simpleSummary = `This is a complete software project designed to run in the web browser${isExt ? ' as a browser extension' : ''}. It is written in ${tech?.primaryLanguage || 'code'} and consists of ${overview?.analyzedFiles || 0} analyzed files working together. The system handles user interfaces, background calculations, and data communication without exposing private credentials.`;

  const architectureOverview = isExt
    ? `The architecture follows Chrome Extension Manifest V3/V2 patterns with message-based IPC routing between Popup UI, Background Service Workers, and injected Content Scripts operating on the DOM.`
    : `The architecture implements a ${tech?.backend.length ? 'Fullstack Client-Server' : 'Single Page Application (SPA)'} pattern with layered component hierarchy, state management, asynchronous API service integration, and modular data handling.`;

  const keyHighlights = [
    `${overview?.analyzedFiles || 0} source files analyzed with 100% in-browser privacy isolation`,
    `Identified ${tech?.languages.length || 1} programming language(s) with ${tech?.primaryLanguage} as primary`,
    `Discovered ${overview?.domOperationsCount || 0} direct DOM operations across ${Object.keys(dom?.apiBreakdown || {}).length} API types`,
    `Detected ${overview?.apiCallsCount || 0} network requests and ${analysis.backendRoutes?.length || 0} backend route handlers`,
    `Privacy scanner safely blocked ${analysis.privacyReport?.sensitiveFilesBlockedCount || 0} sensitive credential files and redacted ${analysis.privacyReport?.secretsRedactedCount || 0} secret values`
  ];

  const recommendedNextSteps = [];
  if (sec.length > 0) {
    recommendedNextSteps.push(`Review ${sec.length} flagged security item(s), starting with high-severity items in the Security tab.`);
  }
  if (perf.length > 0) {
    recommendedNextSteps.push(`Optimize ${perf.length} detected performance bottleneck(s) regarding DOM queries and event handlers.`);
  }
  if (analysis.dependencies?.some(d => d.isLikelyUnused)) {
    recommendedNextSteps.push(`Prune unused dependencies to reduce bundle size.`);
  }
  recommendedNextSteps.push(`Export the complete technical report as PDF, Markdown, or JSON for team documentation.`);

  return {
    developerSummary,
    simpleSummary,
    architectureOverview,
    keyHighlights,
    recommendedNextSteps
  };
}
