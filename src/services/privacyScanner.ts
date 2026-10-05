import { FileClassification, ProjectFile } from '../types/analyzer';

// Sensitive filename and pattern matchers
const SENSITIVE_FILE_PATTERNS: RegExp[] = [
  /^\.env(\..+)?$/i,
  /\.(pem|key|crt|p12|pfx|cer|der|jks|keystore)$/i,
  /^credentials?(\..+)?$/i,
  /^secrets?(\..+)?$/i,
  /^service-account.*\.json$/i,
  /^firebase-adminsdk.*\.json$/i,
  /^id_rsa(\.pub)?$/i,
  /^id_ed25519(\.pub)?$/i,
  /^id_dsa(\.pub)?$/i,
  /\.(sqlite|sqlite3|db|sql|dump|bak|backup)$/i,
  /^.*token.*\.json$/i,
  /^.*auth.*\.json$/i,
  /^\.htpasswd$/i,
  /^\.npmrc$/i,
  /^\.yarnrc$/i,
  /^\.dockercfg$/i,
  /^terraform\.tfvars$/i,
];

// Ignored folders and artifacts
const IGNORED_PATH_PATTERNS: RegExp[] = [
  /(^|\/)\.git\//i,
  /(^|\/)node_modules\//i,
  /(^|\/)vendor\//i,
  /(^|\/)dist\//i,
  /(^|\/)build\//i,
  /(^|\/)\.cache\//i,
  /(^|\/)\.next\//i,
  /(^|\/)\.nuxt\//i,
  /(^|\/)coverage\//i,
  /(^|\/)\.tmp\//i,
  /(^|\/)temp\//i,
  /(^|\/)\.turbo\//i,
  /(^|\/)\.svelte-kit\//i,
  /(^|\/)\.output\//i,
  /(^|\/)\.docusaurus\//i,
  /(^|\/)\.idea\//i,
  /(^|\/)\.vscode\//i,
  /(^|\/)__pycache__\//i,
  /(^|\/)\.pytest_cache\//i,
  /(^|\/)target\//i, // Rust/Java build output
  /(^|\/)\.DS_Store$/i,
  /(^|\/)Thumbs\.db$/i,
  /(^|\/)\.lock$/i,
];

// Binary/Media file extensions
const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'avif', 'bmp', 'tiff',
  'mp4', 'webm', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'ogg', 'flac',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'exe', 'dll', 'so', 'dylib', 'bin', 'class', 'jar', 'pyc', 'o', 'a',
  'wasm', 'iso', 'dmg'
]);

// Secret pattern matchers for in-memory redaction
interface SecretRule {
  name: string;
  pattern: RegExp;
  replace: (match: string, ...groups: any[]) => string;
}

const SECRET_PATTERNS: SecretRule[] = [
  // Key-value assignments like API_KEY = "xxx", AWS_SECRET_ACCESS_KEY="yyy"
  {
    name: 'Generic API/Secret Key assignment',
    pattern: /(?:\b(?:api[_-]?key|api[_-]?secret|secret[_-]?key|private[_-]?key|access[_-]?token|auth[_-]?token|password|db[_-]?password|database[_-]?url|jwt[_-]?secret|client[_-]?secret|aws[_-]?access[_-]?key[_-]?id|aws[_-]?secret[_-]?access[_-]?key|stripe[_-]?key|sendgrid[_-]?api[_-]?key)\b\s*[:=]\s*["'])([^"'\n\r]{4,})(["'])/gi,
    replace: (match, p1, p2) => match.replace(p1, '[REDACTED_SECRET]')
  },
  // Authorization Headers
  {
    name: 'Authorization Bearer Header',
    pattern: /(Authorization\s*:\s*Bearer\s+)[A-Za-z0-9\-._~+/]+=*/gi,
    replace: (match, p1) => `${p1}[REDACTED_SECRET]`
  },
  // Basic Auth Header
  {
    name: 'Authorization Basic Header',
    pattern: /(Authorization\s*:\s*Basic\s+)[A-Za-z0-9+/]+=*/gi,
    replace: (match, p1) => `${p1}[REDACTED_SECRET]`
  },
  // OpenAI API Key
  {
    name: 'OpenAI API Key (sk-...)',
    pattern: /\bsk-[a-zA-Z0-9_-]{20,}\b/g,
    replace: () => '[REDACTED_SECRET]'
  },
  // GitHub Personal Access Token
  {
    name: 'GitHub PAT (ghp_...)',
    pattern: /\bgh[pousr]_[a-zA-Z0-9]{36,}\b/g,
    replace: () => '[REDACTED_SECRET]'
  },
  // Google API Key
  {
    name: 'Google API Key (AIza...)',
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    replace: () => '[REDACTED_SECRET]'
  },
  // AWS Access Key ID
  {
    name: 'AWS Access Key ID',
    pattern: /\b(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/g,
    replace: () => '[REDACTED_SECRET]'
  },
  // Slack Tokens
  {
    name: 'Slack Token',
    pattern: /\bxox[baprs]-[0-9a-zA-Z]{10,}-[0-9a-zA-Z]{10,}-[0-9a-zA-Z]{24,}\b/g,
    replace: () => '[REDACTED_SECRET]'
  },
  // RSA/PGP/EC Private Key Blocks
  {
    name: 'Private Key Block',
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    replace: () => '-----BEGIN PRIVATE KEY-----\n[REDACTED_SECRET]\n-----END PRIVATE KEY-----'
  },
  // Database connection strings containing passwords: postgres://user:pass@host/db
  {
    name: 'Database Connection String with Credentials',
    pattern: /(mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/([^:]+):([^@\s]+)@/gi,
    replace: (match, protocol, user) => `${protocol}://${user}:[REDACTED_SECRET]@`
  }
];

export interface ClassificationResult {
  classification: FileClassification;
  reason: string;
}

/**
 * Central security function: Classify a file by path and filename
 */
export function classifyFile(filePath: string): ClassificationResult {
  // Normalize path separators to forward slash
  const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
  const fileName = normalizedPath.split('/').pop() || normalizedPath;
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

  // 1. Check if path is in ignored directories
  for (const pattern of IGNORED_PATH_PATTERNS) {
    if (pattern.test(normalizedPath) || pattern.test(normalizedPath + '/')) {
      return {
        classification: 'IGNORED',
        reason: `Matches ignored directory/artifact rule (${pattern.toString()})`
      };
    }
  }

  // 2. Check if file is explicitly sensitive
  for (const pattern of SENSITIVE_FILE_PATTERNS) {
    if (pattern.test(fileName)) {
      return {
        classification: 'SENSITIVE',
        reason: `Classified as sensitive credential or environment configuration (${fileName})`
      };
    }
  }

  // 3. Check if binary/media
  if (BINARY_EXTENSIONS.has(ext)) {
    return {
      classification: 'BINARY',
      reason: `Binary asset or media format (.${ext}) - excluded from AST analysis`
    };
  }

  // 4. Safe configs & code files
  // Explicitly protect essential config files from accidental exclusion
  const safeConfigFiles = [
    'package.json', 'package-lock.json', 'tsconfig.json', 'jsconfig.json',
    'vite.config.js', 'vite.config.ts', 'next.config.js', 'next.config.mjs', 'next.config.ts',
    'tailwind.config.js', 'tailwind.config.ts', 'postcss.config.js', 'postcss.config.mjs',
    'manifest.json', 'webpack.config.js', 'rollup.config.js', 'eslint.config.js',
    '.eslintrc.json', '.eslintrc.js', '.prettierrc', 'Dockerfile', 'docker-compose.yml',
    'requirements.txt', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'composer.json'
  ];

  if (safeConfigFiles.includes(fileName.toLowerCase())) {
    return {
      classification: 'SAFE',
      reason: 'Essential build or project configuration file'
    };
  }

  // Code files
  const safeCodeExtensions = new Set([
    'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
    'html', 'htm', 'css', 'scss', 'sass', 'less',
    'json', 'yaml', 'yml', 'toml', 'md', 'markdown',
    'py', 'java', 'go', 'rs', 'php', 'rb', 'c', 'cpp', 'h', 'hpp', 'cs', 'sh', 'vue', 'svelte'
  ]);

  if (safeCodeExtensions.has(ext)) {
    return {
      classification: 'SAFE',
      reason: 'Standard source code file'
    };
  }

  // Default to unsupported if unknown extension
  if (!ext || ext.length > 8) {
    return {
      classification: 'UNSUPPORTED',
      reason: 'Unknown or custom file extension without text source mapping'
    };
  }

  return {
    classification: 'SAFE',
    reason: 'Text/Source file'
  };
}

export interface RedactionResult {
  redactedContent: string;
  redactionCount: number;
  detections: { line: number; rule: string }[];
}

/**
 * In-memory secret detection & redaction engine
 * Ensures no plain secrets ever reach backend, AI, or rendering views
 */
export function redactSecrets(content: string, filePath?: string): RedactionResult {
  if (!content) {
    return { redactedContent: '', redactionCount: 0, detections: [] };
  }

  let redacted = content;
  let totalCount = 0;
  const detections: { line: number; rule: string }[] = [];

  for (const rule of SECRET_PATTERNS) {
    const matches = redacted.match(rule.pattern);
    if (matches && matches.length > 0) {
      // Find lines for telemetry
      const lines = redacted.split('\n');
      lines.forEach((line, idx) => {
        if (rule.pattern.test(line)) {
          detections.push({
            line: idx + 1,
            rule: rule.name
          });
        }
      });

      redacted = redacted.replace(rule.pattern, rule.replace as any);
      totalCount += matches.length;
    }
  }

  return {
    redactedContent: redacted,
    redactionCount: totalCount,
    detections
  };
}

/**
 * Scan an array of raw files, classify them, and apply redaction to SAFE files
 */
export function scanAndClassifyFiles(
  rawFiles: { path: string; size: number; content?: string }[]
): {
  projectFiles: ProjectFile[];
  summary: {
    total: number;
    safe: number;
    sensitive: number;
    ignored: number;
    binary: number;
    secretsRedacted: number;
  };
} {
  const projectFiles: ProjectFile[] = [];
  let safeCount = 0;
  let sensitiveCount = 0;
  let ignoredCount = 0;
  let binaryCount = 0;
  let secretsCount = 0;

  for (let i = 0; i < rawFiles.length; i++) {
    const raw = rawFiles[i];
    const { classification, reason } = classifyFile(raw.path);
    const fileName = raw.path.split(/[/|\\]/).pop() || raw.path;
    const parts = fileName.split('.');
    const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

    let content = raw.content;
    let isRedacted = false;
    let redactedCount = 0;
    let lines = 0;

    if (classification === 'SAFE' && content) {
      lines = content.split('\n').length;
      const redaction = redactSecrets(content, raw.path);
      if (redaction.redactionCount > 0) {
        content = redaction.redactedContent;
        isRedacted = true;
        redactedCount = redaction.redactionCount;
        secretsCount += redactedCount;
      }
      safeCount++;
    } else if (classification === 'SENSITIVE') {
      sensitiveCount++;
      // Zero out content for sensitive files immediately to guarantee privacy in memory!
      content = undefined;
    } else if (classification === 'IGNORED') {
      ignoredCount++;
      content = undefined;
    } else if (classification === 'BINARY') {
      binaryCount++;
      content = undefined;
    }

    projectFiles.push({
      id: `file_${i}_${Math.random().toString(36).substring(2, 7)}`,
      name: fileName,
      path: raw.path.replace(/\\/g, '/').replace(/^\.\//, ''),
      size: raw.size,
      lines,
      extension,
      classification,
      classificationReason: reason,
      content,
      isRedacted,
      redactedCount,
      isAnalyzed: classification === 'SAFE'
    });
  }

  return {
    projectFiles,
    summary: {
      total: rawFiles.length,
      safe: safeCount,
      sensitive: sensitiveCount,
      ignored: ignoredCount,
      binary: binaryCount,
      secretsRedacted: secretsCount
    }
  };
}
