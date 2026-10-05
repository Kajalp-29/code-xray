import {
  ArchitectureEdge,
  ArchitectureNode,
  BackendRoute,
  ChromeExtensionArchitecture,
  DatabaseOperation,
  DataFlowTrace,
  ProjectFile,
  TechStackDetection
} from '../types/analyzer';

/**
 * Generate high-level architecture diagram nodes and edges
 */
export function generateArchitecture(
  files: ProjectFile[],
  techStack: TechStackDetection,
  backendRoutes: BackendRoute[],
  databaseOps: DatabaseOperation[],
  extension?: ChromeExtensionArchitecture
): { nodes: ArchitectureNode[]; edges: ArchitectureEdge[] } {
  const nodes: ArchitectureNode[] = [];
  const edges: ArchitectureEdge[] = [];

  // 1. Chrome Extension Architecture
  if (extension && extension.isExtension) {
    nodes.push({
      id: 'ext_popup',
      label: 'Popup / Action UI',
      sublabel: extension.popupHtml || 'Popup Window',
      type: 'extension',
      technologies: ['HTML', 'JavaScript', 'CSS'],
      fileCount: 1,
      files: extension.popupHtml ? [extension.popupHtml] : []
    });

    nodes.push({
      id: 'ext_background',
      label: 'Background Service Worker',
      sublabel: extension.backgroundScript || 'Event Listener Hub',
      type: 'service',
      technologies: ['Service Worker', `MV${extension.manifestVersion || 3}`],
      fileCount: 1,
      files: extension.backgroundScript ? [extension.backgroundScript] : []
    });

    nodes.push({
      id: 'ext_content',
      label: 'Content Scripts',
      sublabel: 'DOM Injection Engine',
      type: 'frontend',
      technologies: ['Content Script', 'DOM API'],
      fileCount: extension.contentScripts.length,
      files: extension.contentScripts.flatMap(cs => cs.js)
    });

    nodes.push({
      id: 'ext_dom',
      label: 'Host Webpage DOM',
      sublabel: 'Target Web Pages',
      type: 'client',
      technologies: ['HTML5 DOM Tree'],
      fileCount: 0,
      files: []
    });

    edges.push({
      id: 'edge_popup_bg',
      source: 'ext_popup',
      target: 'ext_background',
      label: 'chrome.runtime.sendMessage',
      protocol: 'Extension IPC'
    });

    edges.push({
      id: 'edge_bg_content',
      source: 'ext_background',
      target: 'ext_content',
      label: 'chrome.tabs.sendMessage',
      protocol: 'Tab Message Stream'
    });

    edges.push({
      id: 'edge_content_dom',
      source: 'ext_content',
      target: 'ext_dom',
      label: 'DOM Query & Mutations',
      protocol: 'Direct DOM Access'
    });

    return { nodes, edges };
  }

  // 2. Standard Web & Fullstack Architecture
  // Tier 1: Client Environment
  nodes.push({
    id: 'node_client',
    label: 'Client Browser',
    sublabel: 'User Interface Runtime',
    type: 'client',
    technologies: ['Web Browser', 'V8 Engine'],
    fileCount: 0,
    files: []
  });

  // Tier 2: Frontend Layer
  const frontendFiles = files.filter(f =>
    f.path.includes('src/components') ||
    f.path.includes('src/pages') ||
    f.path.includes('src/views') ||
    f.path.includes('src/app') ||
    ['jsx', 'tsx', 'vue', 'svelte', 'html'].includes(f.extension)
  );

  nodes.push({
    id: 'node_frontend',
    label: 'Frontend UI Layer',
    sublabel: techStack.frontend.join(', ') || 'Web Client',
    type: 'frontend',
    technologies: techStack.frontend.concat(techStack.styling),
    fileCount: frontendFiles.length,
    files: frontendFiles.map(f => f.path).slice(0, 10)
  });

  edges.push({
    id: 'edge_client_ui',
    source: 'node_client',
    target: 'node_frontend',
    label: 'Renders DOM & Handles Events',
    protocol: 'UI Interactions'
  });

  // Tier 3: State / Client Service Layer (if present)
  const serviceFiles = files.filter(f =>
    f.path.includes('src/services') ||
    f.path.includes('src/store') ||
    f.path.includes('src/hooks') ||
    f.path.includes('src/api')
  );

  if (serviceFiles.length > 0 || techStack.stateManagement.length > 0) {
    nodes.push({
      id: 'node_services',
      label: 'State & API Client Layer',
      sublabel: techStack.stateManagement.join(', ') || 'HTTP & State Services',
      type: 'service',
      technologies: techStack.stateManagement.concat(['Axios/Fetch', 'Client Cache']),
      fileCount: serviceFiles.length,
      files: serviceFiles.map(f => f.path).slice(0, 10)
    });

    edges.push({
      id: 'edge_frontend_services',
      source: 'node_frontend',
      target: 'node_services',
      label: 'Actions & Queries',
      protocol: 'Async Hooks / Stores'
    });
  }

  // Tier 4: Backend Layer (if backend routes or server files detected)
  const backendFiles = files.filter(f =>
    f.path.includes('server') ||
    f.path.includes('controllers') ||
    f.path.includes('routes') ||
    f.path.includes('api/') ||
    backendRoutes.length > 0
  );

  if (backendFiles.length > 0 || techStack.backend.length > 0) {
    nodes.push({
      id: 'node_backend',
      label: 'Backend Server & APIs',
      sublabel: techStack.backend.join(', ') || 'Node.js / Express',
      type: 'backend',
      technologies: techStack.backend,
      fileCount: backendFiles.length,
      files: backendFiles.map(f => f.path).slice(0, 10)
    });

    const sourceNodeId = nodes.some(n => n.id === 'node_services') ? 'node_services' : 'node_frontend';
    edges.push({
      id: 'edge_to_backend',
      source: sourceNodeId,
      target: 'node_backend',
      label: 'REST Endpoints / JSON',
      protocol: 'HTTPS / TLS'
    });
  }

  // Tier 5: Database Layer (if database operations or models detected)
  if (databaseOps.length > 0 || techStack.databases.length > 0) {
    const dbTech = techStack.databases.join(', ') || 'Database Storage';
    nodes.push({
      id: 'node_db',
      label: 'Database & Data Storage',
      sublabel: dbTech,
      type: 'database',
      technologies: techStack.databases,
      fileCount: databaseOps.length,
      files: databaseOps.map(d => d.file).slice(0, 10)
    });

    const targetBackend = nodes.some(n => n.id === 'node_backend') ? 'node_backend' : 'node_frontend';
    edges.push({
      id: 'edge_backend_db',
      source: targetBackend,
      target: 'node_db',
      label: 'Queries & Mutations',
      protocol: 'Database Connection Driver'
    });
  }

  return { nodes, edges };
}

/**
 * Generate interactive data flow traces
 */
export function generateDataFlows(
  files: ProjectFile[],
  techStack: TechStackDetection,
  backendRoutes: BackendRoute[],
  databaseOps: DatabaseOperation[],
  extension?: ChromeExtensionArchitecture
): DataFlowTrace[] {
  const traces: DataFlowTrace[] = [];

  // Flow 1: User Action to State & UI Update
  traces.push({
    id: 'flow_user_interaction',
    name: 'User Action & UI State Synchronization',
    description: 'Traces how user clicks or inputs trigger components, update state management stores, and re-render the view.',
    steps: [
      {
        id: 'step_1',
        stage: 'User Action',
        label: 'User Triggers Event',
        details: 'User clicks a button, submits a form, or inputs text into the UI.'
      },
      {
        id: 'step_2',
        stage: 'UI Component',
        label: 'Component Handler Invocation',
        details: 'React/Vue event handler processes the synthetic DOM event and prepares payload.'
      },
      {
        id: 'step_3',
        stage: 'State/Store',
        label: 'State Mutation',
        details: 'Store state is immutably updated via dispatch, setter, or action reducer.'
      },
      {
        id: 'step_4',
        stage: 'UI Update',
        label: 'Virtual DOM Diff & Repaint',
        details: 'Component tree detects state change, recalculates virtual DOM, and commits paint updates.'
      }
    ]
  });

  // Flow 2: Asynchronous API Data Fetching
  traces.push({
    id: 'flow_api_request',
    name: 'End-to-End API Data Lifecycle',
    description: 'Traces how asynchronous data is fetched from the server and cached in client state.',
    steps: [
      {
        id: 'step_api_1',
        stage: 'UI Component',
        label: 'Lifecycle / Hook Trigger',
        details: 'Component mounts or user triggers a search, initiating an asynchronous query.'
      },
      {
        id: 'step_api_2',
        stage: 'Service/Hook',
        label: 'API Client Execution',
        details: 'Axios/Fetch wrapper attaches headers (with redacted auth tokens) and executes request.'
      },
      {
        id: 'step_api_3',
        stage: 'Backend Route',
        label: 'Route Handler & Middleware',
        details: backendRoutes.length > 0
          ? `Dispatches through route middlewares (${backendRoutes[0].path}) and executes business controller.`
          : 'Processes request through backend controller and validates input payload.'
      },
      {
        id: 'step_api_4',
        stage: 'Database',
        label: 'Query Execution',
        details: databaseOps.length > 0
          ? `Executes query against ${databaseOps[0].databaseType || 'Database'} (${databaseOps[0].operation}).`
          : 'Queries storage or persistent datastore for requested records.'
      },
      {
        id: 'step_api_5',
        stage: 'Response',
        label: 'JSON Response Serialization',
        details: 'Server formats HTTP 200 payload and transmits response stream over TLS.'
      },
      {
        id: 'step_api_6',
        stage: 'UI Update',
        label: 'Data Rendered in View',
        details: 'Client unpacks JSON payload, updates local cache, and renders data table/cards.'
      }
    ]
  });

  // Flow 3: Chrome Extension Message Flow (if extension)
  if (extension?.isExtension) {
    traces.push({
      id: 'flow_extension_comm',
      name: 'Extension IPC & DOM Mutation Flow',
      description: 'Traces message routing between Popup, Background Service Worker, Content Scripts, and Host Webpage.',
      steps: [
        {
          id: 'ext_step_1',
          stage: 'UI Component',
          label: 'Extension Popup Interaction',
          details: 'User changes extension setting or clicks action button in browser popup.'
        },
        {
          id: 'ext_step_2',
          stage: 'Service/Hook',
          label: 'Background Message Dispatch',
          details: 'chrome.runtime.sendMessage() dispatches action message to background service worker.'
        },
        {
          id: 'ext_step_3',
          stage: 'Backend Route',
          label: 'Worker Message Router',
          details: 'Background worker validates permissions, updates chrome.storage, and forwards to tab.'
        },
        {
          id: 'ext_step_4',
          stage: 'UI Component',
          label: 'Content Script DOM Injection',
          details: 'Content script executes querySelector on active web page and injects/modifies DOM elements.'
        }
      ]
    });
  }

  return traces;
}
