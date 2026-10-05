import {
  ApiCall,
  BackendRoute,
  ChromeExtensionArchitecture,
  DatabaseOperation,
  ProjectFile
} from '../types/analyzer';

/**
 * Extract API and network calls from file content
 */
export function analyzeFileApiCalls(file: ProjectFile): ApiCall[] {
  const content = file.content;
  if (!content) return [];

  const calls: ApiCall[] = [];
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    if (lineText.trim().startsWith('//') || lineText.trim().startsWith('/*')) return;

    // 1. fetch('url', { method: 'POST' })
    const fetchMatch = lineText.match(/fetch\s*\(\s*[`'"]([^`'"]+)[`'"]/);
    if (fetchMatch) {
      const url = fetchMatch[1];
      let method: ApiCall['method'] = 'GET';
      if (/method\s*:\s*['"]POST['"]/i.test(lineText) || /method\s*:\s*['"]POST['"]/i.test(content.slice(Math.max(0, content.indexOf(lineText) - 50), content.indexOf(lineText) + 200))) {
        method = 'POST';
      } else if (/method\s*:\s*['"]PUT['"]/i.test(lineText)) {
        method = 'PUT';
      } else if (/method\s*:\s*['"]DELETE['"]/i.test(lineText)) {
        method = 'DELETE';
      } else if (/method\s*:\s*['"]PATCH['"]/i.test(lineText)) {
        method = 'PATCH';
      }

      let domain: string | undefined;
      try {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          domain = new URL(url).hostname;
        }
      } catch {
        // relative url
      }

      calls.push({
        method,
        endpoint: url,
        fullUrl: url,
        domain,
        clientType: 'fetch',
        file: file.path,
        line: lineNum,
        codeSnippet: lineText.trim(),
        headersRedacted: /authorization/i.test(lineText)
      });
    }

    // 2. axios.get / axios.post / axios.put / axios.delete / axios()
    const axiosMatch = lineText.match(/axios\.(get|post|put|delete|patch)\s*\(\s*[`'"]([^`'"]+)[`'"]/i);
    if (axiosMatch) {
      const method = axiosMatch[1].toUpperCase() as ApiCall['method'];
      const url = axiosMatch[2];
      let domain: string | undefined;
      try {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          domain = new URL(url).hostname;
        }
      } catch {
        // relative url
      }

      calls.push({
        method,
        endpoint: url,
        fullUrl: url,
        domain,
        clientType: 'axios',
        file: file.path,
        line: lineNum,
        codeSnippet: lineText.trim(),
        headersRedacted: /authorization/i.test(lineText)
      });
    }

    // 3. WebSocket / EventSource
    const wsMatch = lineText.match(/new\s+WebSocket\s*\(\s*[`'"]([^`'"]+)[`'"]/);
    if (wsMatch) {
      calls.push({
        method: 'WS',
        endpoint: wsMatch[1],
        domain: wsMatch[1].replace(/wss?:\/\//, '').split('/')[0],
        clientType: 'websocket',
        file: file.path,
        line: lineNum,
        codeSnippet: lineText.trim(),
        headersRedacted: false
      });
    }

    // 4. GraphQL queries (gql`...` or useQuery(...))
    if (/gql`|\bgql\s*\(|useQuery\s*\(|useMutation\s*\(/.test(lineText)) {
      calls.push({
        method: 'GQL',
        endpoint: 'GraphQL Query/Mutation Operation',
        clientType: 'graphql',
        file: file.path,
        line: lineNum,
        codeSnippet: lineText.trim(),
        headersRedacted: false
      });
    }
  });

  return calls;
}

/**
 * Extract backend routes and controllers
 */
export function analyzeBackendRoutes(files: ProjectFile[]): BackendRoute[] {
  const routes: BackendRoute[] = [];

  for (const file of files) {
    const content = file.content;
    if (!content) continue;

    const lines = content.split('\n');

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      // Express / Fastify / Koa routes: app.get('/api/...', ...), router.post('/login', ...)
      const routeMatch = lineText.match(/(?:app|router|server)\.(get|post|put|delete|patch|use)\s*\(\s*['"`]([^'"`]+)['"`]/i);
      if (routeMatch) {
        const method = routeMatch[1].toUpperCase();
        const path = routeMatch[2];
        const authRequired = /auth|protect|jwt|isLoggedIn|verifyToken|authenticate/i.test(lineText);
        const middleware: string[] = [];
        if (/auth|jwt/i.test(lineText)) middleware.push('AuthGuard');
        if (/validate|zod|joi/i.test(lineText)) middleware.push('Validation');

        routes.push({
          method,
          path,
          handler: `Handler in ${file.name}`,
          file: file.path,
          line: lineNum,
          middleware,
          authRequired
        });
      }

      // Python Flask / FastAPI routes: @app.get("/items"), @router.post("/auth/login")
      const pyRouteMatch = lineText.match(/@(?:app|router|api)\.(get|post|put|delete|patch|route)\s*\(\s*['"]([^'"]+)['"]/i);
      if (pyRouteMatch) {
        routes.push({
          method: pyRouteMatch[1].toUpperCase() === 'ROUTE' ? 'ANY' : pyRouteMatch[1].toUpperCase(),
          path: pyRouteMatch[2],
          handler: lines[idx + 1] ? lines[idx + 1].trim() : `Route in ${file.name}`,
          file: file.path,
          line: lineNum,
          middleware: /Depends\(/i.test(lineText) ? ['FastAPI Depends'] : [],
          authRequired: /user|auth|token|security/i.test(lineText)
        });
      }
    });

    // Next.js App Router / Pages API routes by file path
    if (file.path.includes('app/api/') && /route\.(ts|js)/.test(file.name)) {
      const apiPath = '/' + file.path.substring(file.path.indexOf('app/api/'), file.path.lastIndexOf('/'));
      routes.push({
        method: 'REST (Next.js App Route)',
        path: apiPath,
        handler: file.name,
        file: file.path,
        line: 1,
        middleware: ['NextRequest Handler'],
        authRequired: /auth|session|getServerSession/i.test(content)
      });
    }
  }

  return routes;
}

/**
 * Extract Database operations (MongoDB, PostgreSQL, MySQL, SQLite, Supabase, Firebase)
 */
export function analyzeDatabaseOperations(files: ProjectFile[]): DatabaseOperation[] {
  const operations: DatabaseOperation[] = [];

  for (const file of files) {
    const content = file.content;
    if (!content) continue;

    const lines = content.split('\n');

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      if (lineText.trim().startsWith('//')) return;

      // MongoDB / Mongoose: .find(), .findOne(), .insertOne(), .updateOne(), .deleteOne(), .aggregate()
      const mongoMatch = lineText.match(/([a-zA-Z0-9_]+)\.(find|findOne|insertOne|insertMany|updateOne|updateMany|deleteOne|deleteMany|aggregate|countDocuments)\s*\(/);
      if (mongoMatch) {
        const collection = mongoMatch[1];
        const op = mongoMatch[2];
        if (!['Array', 'Object', 'document', 'window', 'Math', 'console'].includes(collection)) {
          operations.push({
            databaseType: 'MongoDB',
            collectionOrTable: collection,
            operation: `${op}()`,
            file: file.path,
            line: lineNum,
            codeSnippet: lineText.trim()
          });
        }
      }

      // Supabase: supabase.from('table').select()
      const supaMatch = lineText.match(/supabase\s*\.\s*from\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\.\s*(select|insert|update|delete|upsert)/);
      if (supaMatch) {
        operations.push({
          databaseType: 'Supabase',
          collectionOrTable: supaMatch[1],
          operation: `${supaMatch[2]}()`,
          file: file.path,
          line: lineNum,
          codeSnippet: lineText.trim()
        });
      }

      // Firebase Firestore: getDoc, setDoc, addDoc, collection(db, 'users')
      const firestoreMatch = lineText.match(/(?:getDoc|getDocs|setDoc|addDoc|deleteDoc|onSnapshot)\s*\(\s*(?:doc|collection)\s*\(\s*[^,]+,\s*['"`]([^'"`]+)['"`]/);
      if (firestoreMatch) {
        operations.push({
          databaseType: 'Firebase',
          collectionOrTable: firestoreMatch[1],
          operation: 'Firestore Document Operation',
          file: file.path,
          line: lineNum,
          codeSnippet: lineText.trim()
        });
      }

      // SQL Queries: SELECT ... FROM ... / INSERT INTO
      const sqlMatch = lineText.match(/(?:SELECT\s+.+?\s+FROM|INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM)\s+([a-zA-Z0-9_]+)/i);
      if (sqlMatch && !lineText.includes('class') && !lineText.includes('import')) {
        operations.push({
          databaseType: 'PostgreSQL',
          collectionOrTable: sqlMatch[1],
          operation: 'Raw SQL / Query Execution',
          file: file.path,
          line: lineNum,
          codeSnippet: lineText.trim()
        });
      }
    });
  }

  return operations;
}

/**
 * Detect and analyze Chrome Browser Extension architecture if present
 */
export function analyzeChromeExtension(files: ProjectFile[]): ChromeExtensionArchitecture | undefined {
  const manifestFile = files.find(f => f.name.toLowerCase() === 'manifest.json');
  let isExtension = false;
  let manifestData: any = null;

  if (manifestFile && manifestFile.content) {
    try {
      manifestData = JSON.parse(manifestFile.content);
      if (manifestData.manifest_version || manifestData.permissions || manifestData.content_scripts) {
        isExtension = true;
      }
    } catch {
      // invalid json
    }
  }

  // Check code signatures for chrome API calls
  let hasChromeApis = false;
  const senders: { file: string; line: number; messageType?: string }[] = [];
  const listeners: { file: string; line: number; type: string }[] = [];
  let storageUsed = false;

  for (const file of files) {
    const content = file.content;
    if (!content) continue;

    if (/chrome\.(runtime|tabs|storage|scripting|action)/.test(content)) {
      hasChromeApis = true;
    }

    if (/chrome\.storage\.(local|sync|session)/.test(content)) {
      storageUsed = true;
    }

    const lines = content.split('\n');
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      if (/chrome\.(runtime|tabs)\.sendMessage\s*\(/.test(lineText)) {
        senders.push({ file: file.path, line: lineNum, messageType: 'chrome.runtime.sendMessage' });
      }
      if (/chrome\.runtime\.onMessage\.addListener\s*\(/.test(lineText)) {
        listeners.push({ file: file.path, line: lineNum, type: 'chrome.runtime.onMessage' });
      }
    });
  }

  if (!isExtension && !hasChromeApis) {
    return undefined;
  }

  const permissions = manifestData?.permissions || [];
  const hostPermissions = manifestData?.host_permissions || [];
  const contentScripts = manifestData?.content_scripts?.map((cs: any) => ({
    matches: cs.matches || [],
    js: cs.js || [],
    css: cs.css || []
  })) || [];

  const backgroundScript = manifestData?.background?.service_worker ||
    (Array.isArray(manifestData?.background?.scripts) ? manifestData.background.scripts.join(', ') : undefined);

  const popupHtml = manifestData?.action?.default_popup || manifestData?.browser_action?.default_popup;
  const sidePanelHtml = manifestData?.side_panel?.default_path;

  return {
    isExtension: true,
    manifestVersion: manifestData?.manifest_version || (backgroundScript ? 3 : 2),
    name: manifestData?.name || 'Browser Extension',
    permissions,
    hostPermissions,
    contentScripts,
    backgroundScript,
    popupHtml,
    sidePanelHtml,
    messagePassing: {
      senders,
      listeners
    },
    storageUsed
  };
}
