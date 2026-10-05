import { ProjectFile, SecurityConcern } from '../types/analyzer';

/**
 * Scan analyzed files for potential security concerns
 */
export function analyzeSecurity(files: ProjectFile[]): SecurityConcern[] {
  const concerns: SecurityConcern[] = [];
  let idCounter = 1;

  for (const file of files) {
    if (file.classification !== 'SAFE' || !file.content) continue;

    const lines = file.content.split('\n');

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const cleanLine = lineText.trim();
      if (cleanLine.startsWith('//') || cleanLine.startsWith('/*')) return;

      // 1. Redacted Secrets Evidence
      if (cleanLine.includes('[REDACTED_SECRET]')) {
        concerns.push({
          id: `sec_${idCounter++}`,
          title: 'Potential Hardcoded Secret Detected',
          category: 'Secrets',
          severity: 'Critical',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'A credential or secret pattern was identified in source code and automatically redacted for privacy.',
          suggestedReview: 'Extract secrets into environment variables (.env) or runtime secret managers. Do not commit tokens into source control.',
          confidence: 'High confidence'
        });
      }

      // 2. Dangerous eval() or new Function()
      if (/\beval\s*\(/.test(cleanLine)) {
        concerns.push({
          id: `sec_${idCounter++}`,
          title: 'Dangerous eval() Execution',
          category: 'Code Injection',
          severity: 'Critical',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'eval() executes arbitrary code in the caller privileges and is susceptible to severe code injection attacks.',
          suggestedReview: 'Refactor using JSON.parse(), direct mathematical expressions, or structured AST evaluators instead of eval().',
          confidence: 'High confidence'
        });
      }

      if (/new\s+Function\s*\(/.test(cleanLine)) {
        concerns.push({
          id: `sec_${idCounter++}`,
          title: 'Dynamic Function() Constructor',
          category: 'Code Injection',
          severity: 'High',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'The Function constructor evaluates string code dynamically, creating code injection vectors similar to eval().',
          suggestedReview: 'Replace dynamic function construction with standard static functions or safe dispatch maps.',
          confidence: 'High confidence'
        });
      }

      // 3. Unsafe innerHTML / dangerouslySetInnerHTML
      if (/\.innerHTML\s*=/.test(cleanLine) && !/\.innerHTML\s*=\s*['"][a-zA-Z0-9\s<>/]*['"]/.test(cleanLine)) {
        concerns.push({
          id: `sec_${idCounter++}`,
          title: 'Potential Cross-Site Scripting (XSS) via innerHTML',
          category: 'XSS',
          severity: 'High',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'Dynamic content is assigned to innerHTML without explicit DOMPurify sanitization, which may allow malicious script injection.',
          suggestedReview: 'Use textContent / innerText for text, or sanitize with DOMPurify before assigning to innerHTML.',
          confidence: 'Medium confidence'
        });
      }

      if (/dangerouslySetInnerHTML/.test(cleanLine)) {
        concerns.push({
          id: `sec_${idCounter++}`,
          title: 'React dangerouslySetInnerHTML Usage',
          category: 'XSS',
          severity: 'Medium',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'dangerouslySetInnerHTML bypasses React built-in XSS protection and renders raw HTML.',
          suggestedReview: 'Ensure all input HTML passed to __html is sanitized using DOMPurify.',
          confidence: 'High confidence'
        });
      }

      // 4. Insecure HTTP Network requests
      if (/fetch\s*\(\s*['"]http:\/\//i.test(cleanLine) || /axios\.[a-z]+\s*\(\s*['"]http:\/\//i.test(cleanLine)) {
        concerns.push({
          id: `sec_${idCounter++}`,
          title: 'Insecure Cleartext HTTP Request',
          category: 'Network',
          severity: 'Medium',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'Network request uses unencrypted http:// protocol instead of encrypted https://, exposing traffic to eavesdropping or MITM interception.',
          suggestedReview: 'Upgrade endpoints to use HTTPS (TLS encryption).',
          confidence: 'High confidence'
        });
      }

      // 5. Insecure Child Process Exec
      if (/(?:child_process|exec)\s*\(\s*`[^`]*\${/.test(cleanLine) || /exec\s*\(\s*[a-zA-Z0-9_]+\s*\+/i.test(cleanLine)) {
        concerns.push({
          id: `sec_${idCounter++}`,
          title: 'Potential Command Injection in child_process.exec',
          category: 'Code Injection',
          severity: 'Critical',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'Command string constructed with string concatenation/interpolation and passed to shell exec.',
          suggestedReview: 'Use execFile or spawn with structured arguments array instead of shell interpolation.',
          confidence: 'High confidence'
        });
      }

      // 6. Loose CORS wildcard origin with credentials
      if (/cors\s*\(\s*\{[^}]*origin\s*:\s*['"]\*['"][^}]*credentials\s*:\s*true/i.test(cleanLine)) {
        concerns.push({
          id: `sec_${idCounter++}`,
          title: 'Insecure CORS Wildcard with Credentials',
          category: 'Network',
          severity: 'High',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'Allowing wildcard origin (*) combined with credentials exposes authenticated sessions to cross-origin abuse.',
          suggestedReview: 'Explicitly whitelist trusted client origins instead of wildcard (*).',
          confidence: 'High confidence'
        });
      }
    });

    // 7. Check Chrome Extension Manifest permissions
    if (file.name.toLowerCase() === 'manifest.json') {
      try {
        const manifest = JSON.parse(file.content);
        const permissions: string[] = manifest.permissions || [];
        const hostPermissions: string[] = manifest.host_permissions || [];

        if (permissions.includes('<all_urls>') || hostPermissions.includes('<all_urls>') || hostPermissions.includes('*://*/*')) {
          concerns.push({
            id: `sec_${idCounter++}`,
            title: 'Overly Broad Extension Host Permissions (<all_urls>)',
            category: 'Permissions',
            severity: 'Medium',
            file: file.path,
            line: 1,
            codeSnippet: `"permissions": ${JSON.stringify(permissions)}`,
            reason: 'Granting access to all URLs violates the principle of least privilege and increases attack surface if an extension script is compromised.',
            suggestedReview: 'Restrict host_permissions to specific required target domains or use activeTab.',
            confidence: 'High confidence'
          });
        }
      } catch {
        // ignore
      }
    }
  }

  return concerns;
}
