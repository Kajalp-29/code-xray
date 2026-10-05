import type { DomOperation, DomStats, ProjectFile } from '../types/analyzer';

interface DomPatternRule {
  regex: RegExp;
  api: string;
  purpose: (...args: string[]) => string;
}

// Common DOM API patterns and their natural explanation templates
const DOM_API_PATTERNS: DomPatternRule[] = [
  {
    regex: /document\.querySelectorAll\s*\(\s*["'`]?([^"')`]+)["'`]?\s*\)/g,
    api: 'querySelectorAll()',
    purpose: (sel?: string) => `Finds all DOM elements matching selector '${sel || '*'}' for batch querying/manipulation.`
  },
  {
    regex: /document\.querySelector\s*\(\s*["'`]?([^"')`]+)["'`]?\s*\)/g,
    api: 'querySelector()',
    purpose: (sel?: string) => `Locates the first matching element for '${sel || '*'}' in the document tree.`
  },
  {
    regex: /document\.getElementById\s*\(\s*["'`]?([^"')`]+)["'`]?\s*\)/g,
    api: 'getElementById()',
    purpose: (id?: string) => `Direct ID lookup for element '#${id || ''}'.`
  },
  {
    regex: /document\.getElementsByClassName\s*\(\s*["'`]?([^"')`]+)["'`]?\s*\)/g,
    api: 'getElementsByClassName()',
    purpose: (cls?: string) => `Returns live HTMLCollection of elements with class '${cls || ''}'.`
  },
  {
    regex: /document\.createElement\s*\(\s*["'`]?([^"')`]+)["'`]?\s*\)/g,
    api: 'createElement()',
    purpose: (tag?: string) => `Dynamically creates a new <${tag || 'div'}> DOM node in memory.`
  },
  {
    regex: /document\.createTextNode\s*\(\s*([^)]*)\s*\)/g,
    api: 'createTextNode()',
    purpose: () => `Creates a text node to append to the DOM.`
  },
  {
    regex: /\.appendChild\s*\(\s*([^)]+)\s*\)/g,
    api: 'appendChild()',
    purpose: (child?: string) => `Inserts node '${(child || '').trim()}' as the last child of target element.`
  },
  {
    regex: /\.removeChild\s*\(\s*([^)]+)\s*\)/g,
    api: 'removeChild()',
    purpose: (child?: string) => `Removes child node '${(child || '').trim()}' from target parent.`
  },
  {
    regex: /\.remove\s*\(\s*\)/g,
    api: 'remove()',
    purpose: () => `Deletes the element directly from the DOM tree.`
  },
  {
    regex: /\.classList\.(add|remove|toggle|contains)\s*\(\s*["'`]?([^"')`]+)["'`]?\s*\)/g,
    api: 'classList operations',
    purpose: (op?: string, cls?: string) => `Modifies CSS class '${cls || ''}' (${op || 'add'}) on target element.`
  },
  {
    regex: /\.innerHTML\s*=\s*([^;]+)/g,
    api: 'innerHTML',
    purpose: () => `Directly assigns HTML markup to element (requires sanitization).`
  },
  {
    regex: /\.textContent\s*=\s*([^;]+)/g,
    api: 'textContent',
    purpose: () => `Sets plain text content of element safely.`
  },
  {
    regex: /\.innerText\s*=\s*([^;]+)/g,
    api: 'innerText',
    purpose: () => `Sets rendered text content of element.`
  },
  {
    regex: /\.addEventListener\s*\(\s*["'`]?([^"')`,\s]+)["'`]?\s*,\s*([^)]+)\)/g,
    api: 'addEventListener()',
    purpose: (evt?: string, handler?: string) => `Binds '${evt || 'event'}' event handler (${(handler || '').split(',')[0].trim()}).`
  },
  {
    regex: /new\s+MutationObserver\s*\(/g,
    api: 'MutationObserver',
    purpose: () => `Watches for DOM tree mutations/modifications in real-time.`
  },
  {
    regex: /new\s+IntersectionObserver\s*\(/g,
    api: 'IntersectionObserver',
    purpose: () => `Detects element visibility and viewport intersection (lazy loading/infinite scroll).`
  },
  {
    regex: /new\s+ResizeObserver\s*\(/g,
    api: 'ResizeObserver',
    purpose: () => `Monitors element dimension changes.`
  }
];

/**
 * Infer human-readable target container name from CSS selector
 */
function inferTargetContainer(selector: string): string {
  if (!selector) return 'General DOM node';
  const clean = selector.trim();

  if (clean.startsWith('#')) {
    const id = clean.slice(1);
    return `${id.replace(/[-_]/g, ' ')} element (#${id})`;
  }

  if (clean.startsWith('.')) {
    const cls = clean.slice(1);
    if (cls.includes('card')) return `Card container components (.${cls})`;
    if (cls.includes('header') || cls.includes('navbar') || cls.includes('nav')) return `Navigation/Header bar (.${cls})`;
    if (cls.includes('sidebar') || cls.includes('drawer')) return `Sidebar navigation panel (.${cls})`;
    if (cls.includes('modal') || cls.includes('dialog') || cls.includes('popup')) return `Modal dialog backdrop/content (.${cls})`;
    if (cls.includes('btn') || cls.includes('button')) return `Interactive button elements (.${cls})`;
    if (cls.includes('list') || cls.includes('item')) return `List items container (.${cls})`;
    if (cls.includes('video') || cls.includes('player')) return `Media/Video player container (.${cls})`;
    return `Elements styled with class .${cls}`;
  }

  if (/^(ytd-|yt-|app-|custom-)/.test(clean)) {
    return `Custom Web Component <${clean}>`;
  }

  if (/^(div|span|button|input|form|a|table|ul|li|p|h1|h2|h3|img|video|canvas)$/i.test(clean)) {
    return `Standard HTML <${clean}> elements`;
  }

  return `DOM elements matching '${clean}' (inferred from selector; runtime DOM may differ)`;
}

/**
 * Analyze a single file for DOM operations
 */
export function analyzeFileDom(file: ProjectFile): DomOperation[] {
  const content = file.content;
  if (!content) return [];

  const operations: DomOperation[] = [];
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    // Skip comments
    if (lineText.trim().startsWith('//') || lineText.trim().startsWith('/*') || lineText.trim().startsWith('*')) {
      return;
    }

    for (const pat of DOM_API_PATTERNS) {
      // Reset regex index
      pat.regex.lastIndex = 0;
      let match;
      while ((match = pat.regex.exec(lineText)) !== null) {
        let selector: string | undefined = undefined;
        let inferredTarget: string | undefined = undefined;
        let purpose = '';

        if (pat.api === 'querySelectorAll()' || pat.api === 'querySelector()') {
          selector = match[1];
          inferredTarget = inferTargetContainer(selector);
          purpose = pat.purpose(selector);
        } else if (pat.api === 'getElementById()') {
          selector = `#${match[1]}`;
          inferredTarget = inferTargetContainer(selector);
          purpose = pat.purpose(match[1]);
        } else if (pat.api === 'getElementsByClassName()') {
          selector = `.${match[1]}`;
          inferredTarget = inferTargetContainer(selector);
          purpose = pat.purpose(match[1]);
        } else if (pat.api === 'createElement()') {
          selector = match[1];
          inferredTarget = `<${match[1]}> element`;
          purpose = pat.purpose(match[1]);
        } else if (pat.api === 'appendChild()' || pat.api === 'removeChild()') {
          purpose = pat.purpose(match[1]);
        } else if (pat.api === 'classList operations') {
          selector = match[2];
          purpose = pat.purpose(match[1], match[2]);
        } else if (pat.api === 'addEventListener()') {
          selector = match[1]; // event name
          purpose = pat.purpose(match[1], match[2] || 'callback');
        } else {
          purpose = pat.purpose();
        }

        operations.push({
          api: pat.api,
          selector,
          inferredTarget,
          purpose,
          file: file.path,
          line: lineNum,
          codeSnippet: lineText.trim(),
          confidence: selector ? 'High confidence' : 'Medium confidence'
        });
      }
    }
  });

  return operations;
}

/**
 * Aggregate DOM statistics across all files
 */
export function aggregateDomStats(operations: DomOperation[]): DomStats {
  const apiBreakdown: Record<string, number> = {};
  const selectorBreakdown: Record<string, number> = {};
  const eventsBreakdown: Record<string, number> = {};
  const fileCounts: Record<string, number> = {};

  operations.forEach(op => {
    // API counts
    apiBreakdown[op.api] = (apiBreakdown[op.api] || 0) + 1;

    // Selector counts
    if (op.selector) {
      selectorBreakdown[op.selector] = (selectorBreakdown[op.selector] || 0) + 1;
    }

    // Event listeners
    if (op.api === 'addEventListener()' && op.selector) {
      const evt = op.selector.toLowerCase();
      eventsBreakdown[evt] = (eventsBreakdown[evt] || 0) + 1;
    }

    // File breakdown
    fileCounts[op.file] = (fileCounts[op.file] || 0) + 1;
  });

  // Find most-used file
  let mostUsedFile = 'None';
  let maxCount = 0;
  Object.entries(fileCounts).forEach(([file, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedFile = file;
    }
  });

  return {
    totalOperations: operations.length,
    apiBreakdown,
    selectorBreakdown,
    eventsBreakdown,
    mostUsedFile,
    operations
  };
}
