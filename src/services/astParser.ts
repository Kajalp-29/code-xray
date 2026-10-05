import * as babelParser from '@babel/parser';
import {
  ClassAnalysis,
  ComponentAnalysis,
  ExportItem,
  FunctionAnalysis,
  ImportItem,
  ProjectFile
} from '../types/analyzer';

export interface ParsedAstResult {
  functions: FunctionAnalysis[];
  classes: ClassAnalysis[];
  components: ComponentAnalysis[];
  imports: ImportItem[];
  exports: ExportItem[];
  cyclomaticComplexity: number;
  deadCodeCandidates: { name: string; line: number; type: 'function' | 'variable'; reason: string }[];
  parseError?: string;
  rawAst?: any;
}

/**
 * Determine Babel parser plugins based on file extension
 */
function getParserPlugins(extension: string): babelParser.ParserPlugin[] {
  const plugins: babelParser.ParserPlugin[] = [
    'jsx',
    'asyncGenerators',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'dynamicImport',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'nullishCoalescingOperator',
    'optionalChaining',
    'objectRestSpread',
    'topLevelAwait',
    ['decorators', { decoratorsBeforeExport: true }]
  ];

  if (['ts', 'tsx', 'mts', 'cts'].includes(extension)) {
    plugins.push('typescript');
  }

  return plugins;
}

/**
 * Recursive AST walker for Babel AST
 */
function traverseAst(node: any, visitors: Record<string, (node: any, parent?: any) => void>, parent?: any) {
  if (!node || typeof node !== 'object') return;

  if (node.type && visitors[node.type]) {
    visitors[node.type](node, parent);
  }

  for (const key of Object.keys(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object') {
          traverseAst(item, visitors, node);
        }
      }
    } else if (child && typeof child === 'object') {
      traverseAst(child, visitors, node);
    }
  }
}

/**
 * Extract called functions within an AST node
 */
function extractCalls(node: any): string[] {
  const calls = new Set<string>();
  traverseAst(node, {
    CallExpression(callNode) {
      if (callNode.callee.type === 'Identifier') {
        calls.add(callNode.callee.name);
      } else if (callNode.callee.type === 'MemberExpression') {
        const propName = callNode.callee.property?.name || callNode.callee.property?.value;
        if (propName) calls.add(propName);
      }
    }
  });
  return Array.from(calls);
}

/**
 * Estimate Cyclomatic Complexity by counting branching AST nodes
 */
function calculateComplexity(ast: any): number {
  let complexity = 1; // Base complexity
  traverseAst(ast, {
    IfStatement() { complexity++; },
    SwitchCase(caseNode) { if (caseNode.test) complexity++; },
    WhileStatement() { complexity++; },
    DoWhileStatement() { complexity++; },
    ForStatement() { complexity++; },
    ForInStatement() { complexity++; },
    ForOfStatement() { complexity++; },
    CatchClause() { complexity++; },
    ConditionalExpression() { complexity++; },
    LogicalExpression(logNode) {
      if (logNode.operator === '&&' || logNode.operator === '||' || logNode.operator === '??') {
        complexity++;
      }
    }
  });
  return complexity;
}

/**
 * Parse JS/TS files with Babel AST
 */
export function parseJavaScriptAst(file: ProjectFile): ParsedAstResult {
  const code = file.content || '';
  if (!code.trim()) {
    return {
      functions: [],
      classes: [],
      components: [],
      imports: [],
      exports: [],
      cyclomaticComplexity: 1,
      deadCodeCandidates: []
    };
  }

  try {
    const plugins = getParserPlugins(file.extension);
    const ast = babelParser.parse(code, {
      sourceType: 'unambiguous',
      plugins,
      tokens: true,
      errorRecovery: true
    });

    const functions: FunctionAnalysis[] = [];
    const classes: ClassAnalysis[] = [];
    const components: ComponentAnalysis[] = [];
    const imports: ImportItem[] = [];
    const exports: ExportItem[] = [];
    const identifierReferences = new Map<string, number>();
    const declaredIdentifiers = new Map<string, { line: number; isExported: boolean; type: 'function' | 'variable' }>();

    // 1. First pass: Collect Imports and Exports
    traverseAst(ast, {
      ImportDeclaration(node) {
        const source = node.source.value;
        const specifiers: string[] = [];
        let isDefault = false;

        node.specifiers.forEach((spec: any) => {
          if (spec.type === 'ImportDefaultSpecifier') {
            isDefault = true;
            specifiers.push(spec.local.name);
          } else if (spec.type === 'ImportSpecifier') {
            specifiers.push(spec.local.name);
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            specifiers.push(`* as ${spec.local.name}`);
          }
        });

        imports.push({
          source,
          specifiers,
          isDefault,
          line: node.loc?.start?.line || 1
        });
      },

      ExportNamedDeclaration(node) {
        if (node.declaration) {
          if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
            exports.push({ name: node.declaration.id.name, isDefault: false, line: node.loc?.start?.line || 1 });
          } else if (node.declaration.type === 'ClassDeclaration' && node.declaration.id) {
            exports.push({ name: node.declaration.id.name, isDefault: false, line: node.loc?.start?.line || 1 });
          } else if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl: any) => {
              if (decl.id.type === 'Identifier') {
                exports.push({ name: decl.id.name, isDefault: false, line: node.loc?.start?.line || 1 });
              }
            });
          }
        }
        if (node.specifiers) {
          node.specifiers.forEach((spec: any) => {
            if (spec.exported) {
              exports.push({
                name: spec.exported.name || spec.exported.value,
                isDefault: false,
                line: node.loc?.start?.line || 1
              });
            }
          });
        }
      },

      ExportDefaultDeclaration(node) {
        let name = 'default';
        if (node.declaration.id && node.declaration.id.name) {
          name = node.declaration.id.name;
        } else if (node.declaration.name) {
          name = node.declaration.name;
        }
        exports.push({ name, isDefault: true, line: node.loc?.start?.line || 1 });
      }
    });

    const exportedNames = new Set(exports.map(e => e.name));

    // 2. Second pass: Collect Functions, Classes, React Components, and Calls
    traverseAst(ast, {
      Identifier(node, parent) {
        // Track references for dead code detection
        const name = node.name;
        const isDeclaration =
          (parent?.type === 'FunctionDeclaration' && parent.id === node) ||
          (parent?.type === 'VariableDeclarator' && parent.id === node) ||
          (parent?.type === 'ClassDeclaration' && parent.id === node);

        if (!isDeclaration) {
          identifierReferences.set(name, (identifierReferences.get(name) || 0) + 1);
        }
      },

      FunctionDeclaration(node) {
        const name = node.id?.name || 'anonymous';
        const line = node.loc?.start?.line || 1;
        const endLine = node.loc?.end?.line;
        const params = node.params.map((p: any) => p.name || p.type);
        const calls = extractCalls(node.body);
        const isExported = exportedNames.has(name);

        functions.push({
          name,
          line,
          endLine,
          isAsync: node.async || false,
          isExported,
          params,
          calls,
          confidence: 'High confidence'
        });

        declaredIdentifiers.set(name, { line, isExported, type: 'function' });

        // Check if React component (Starts with uppercase and returns JSX)
        if (/^[A-Z]/.test(name)) {
          const hooks: string[] = [];
          const subComponents: string[] = [];

          traverseAst(node.body, {
            CallExpression(call) {
              if (call.callee.type === 'Identifier' && /^use[A-Z]/.test(call.callee.name)) {
                hooks.push(call.callee.name);
              }
            },
            JSXOpeningElement(jsx) {
              if (jsx.name.type === 'JSXIdentifier' && /^[A-Z]/.test(jsx.name.name)) {
                subComponents.push(jsx.name.name);
              }
            }
          });

          components.push({
            name,
            line,
            isExported,
            type: 'React',
            hooksUsed: Array.from(new Set(hooks)),
            props: params,
            subComponentsRendered: Array.from(new Set(subComponents))
          });
        }
      },

      VariableDeclarator(node) {
        if (node.id.type === 'Identifier' && node.init) {
          const name = node.id.name;
          const line = node.loc?.start?.line || 1;
          const isExported = exportedNames.has(name);

          // Arrow functions or Function Expressions
          if (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression') {
            const func = node.init;
            const params = func.params.map((p: any) => p.name || p.type);
            const calls = extractCalls(func.body);

            functions.push({
              name,
              line,
              endLine: func.loc?.end?.line,
              isAsync: func.async || false,
              isExported,
              params,
              calls,
              confidence: 'High confidence'
            });

            declaredIdentifiers.set(name, { line, isExported, type: 'function' });

            // Check if React functional component
            if (/^[A-Z]/.test(name)) {
              const hooks: string[] = [];
              const subComponents: string[] = [];

              traverseAst(func.body, {
                CallExpression(call) {
                  if (call.callee.type === 'Identifier' && /^use[A-Z]/.test(call.callee.name)) {
                    hooks.push(call.callee.name);
                  }
                },
                JSXOpeningElement(jsx) {
                  if (jsx.name.type === 'JSXIdentifier' && /^[A-Z]/.test(jsx.name.name)) {
                    subComponents.push(jsx.name.name);
                  }
                }
              });

              components.push({
                name,
                line,
                isExported,
                type: 'React',
                hooksUsed: Array.from(new Set(hooks)),
                props: params,
                subComponentsRendered: Array.from(new Set(subComponents))
              });
            }
          }
        }
      },

      ClassDeclaration(node) {
        const name = node.id?.name || 'AnonymousClass';
        const line = node.loc?.start?.line || 1;
        const superClass = node.superClass?.name;
        const methods: string[] = [];
        const properties: string[] = [];

        node.body.body.forEach((member: any) => {
          if (member.type === 'ClassMethod') {
            methods.push(member.key.name || 'method');
          } else if (member.type === 'ClassProperty') {
            properties.push(member.key.name || 'property');
          }
        });

        classes.push({
          name,
          line,
          isExported: exportedNames.has(name),
          superClass,
          methods,
          properties
        });
      }
    });

    // 3. Detect Dead Code Candidates (unexported & unreferenced)
    const deadCodeCandidates: { name: string; line: number; type: 'function' | 'variable'; reason: string }[] = [];
    declaredIdentifiers.forEach((info, name) => {
      if (!info.isExported && !name.startsWith('_')) {
        const refCount = identifierReferences.get(name) || 0;
        if (refCount === 0) {
          deadCodeCandidates.push({
            name,
            line: info.line,
            type: info.type,
            reason: `Local ${info.type} '${name}' declared but never referenced in file`
          });
        }
      }
    });

    const cyclomaticComplexity = calculateComplexity(ast);

    return {
      functions,
      classes,
      components,
      imports,
      exports,
      cyclomaticComplexity,
      deadCodeCandidates,
      rawAst: ast
    };
  } catch (err: any) {
    // Graceful degradation: If Babel throws, use regex/heuristic parser
    const fallback = parseGenericCodeHeuristics(file);
    return {
      ...fallback,
      parseError: `AST Parser notice: ${err.message?.split('\n')[0] || 'Syntax error'}`
    };
  }
}

/**
 * Heuristic/Regex-based structural parser for Python, HTML, CSS, JSON, Java, Go, PHP, or syntax error fallbacks
 */
export function parseGenericCodeHeuristics(file: ProjectFile): ParsedAstResult {
  const code = file.content || '';
  const lines = code.split('\n');
  const ext = file.extension.toLowerCase();

  const functions: FunctionAnalysis[] = [];
  const classes: ClassAnalysis[] = [];
  const components: ComponentAnalysis[] = [];
  const imports: ImportItem[] = [];
  const exports: ExportItem[] = [];
  let complexity = 1;

  if (ext === 'py') {
    // Python Parser
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const defMatch = lineText.match(/^\s*def\s+([a-zA-Z0-9_]+)\s*\((.*?)\):/);
      if (defMatch) {
        functions.push({
          name: defMatch[1],
          line: lineNum,
          isAsync: lineText.includes('async def'),
          isExported: !defMatch[1].startsWith('_'),
          params: defMatch[2].split(',').map(s => s.trim()).filter(Boolean),
          confidence: 'High confidence'
        });
      }
      const classMatch = lineText.match(/^\s*class\s+([a-zA-Z0-9_]+)(?:\((.*?)\))?:/);
      if (classMatch) {
        classes.push({
          name: classMatch[1],
          line: lineNum,
          isExported: true,
          superClass: classMatch[2] || undefined,
          methods: [],
          properties: []
        });
      }
      const importMatch = lineText.match(/^\s*(?:from\s+([a-zA-Z0-9_.]+)\s+import|import\s+([a-zA-Z0-9_.,\s]+))/);
      if (importMatch) {
        imports.push({
          source: importMatch[1] || importMatch[2],
          specifiers: [importMatch[2] || importMatch[1]],
          isDefault: false,
          line: lineNum
        });
      }
      if (/\b(if|elif|while|for|except)\b/.test(lineText)) complexity++;
    });
  } else if (ext === 'html' || ext === 'htm') {
    // HTML Elements & Scripts
    const scriptMatches = code.matchAll(/<script[^>]*src=["']([^"']+)["']/gi);
    for (const match of scriptMatches) {
      imports.push({
        source: match[1],
        specifiers: [match[1]],
        isDefault: true,
        line: 1
      });
    }
  } else if (ext === 'json') {
    // JSON files (e.g. package.json)
    try {
      const parsed = JSON.parse(code);
      if (file.name === 'manifest.json') {
        components.push({
          name: 'ChromeExtensionManifest',
          line: 1,
          isExported: true,
          type: 'WebComponent',
          hooksUsed: [],
          props: Object.keys(parsed),
          subComponentsRendered: []
        });
      }
    } catch {
      // ignore
    }
  } else {
    // Generic C-family / Java / Go / Rust regex matcher
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const fnMatch = lineText.match(/(?:function\s+|fn\s+|func\s+|def\s+|public\s+|private\s+)([a-zA-Z0-9_]+)\s*\((.*?)\)/);
      if (fnMatch && !['if', 'for', 'while', 'switch', 'catch'].includes(fnMatch[1])) {
        functions.push({
          name: fnMatch[1],
          line: lineNum,
          isAsync: lineText.includes('async'),
          isExported: /export|public/.test(lineText),
          params: fnMatch[2].split(',').map(p => p.trim()).filter(Boolean),
          confidence: 'Medium confidence'
        });
      }
      if (/\b(if|else if|switch|for|while|catch)\b/.test(lineText)) complexity++;
    });
  }

  return {
    functions,
    classes,
    components,
    imports,
    exports,
    cyclomaticComplexity: complexity,
    deadCodeCandidates: []
  };
}

/**
 * Universal AST Parser router
 */
export function parseFileAst(file: ProjectFile): ParsedAstResult {
  const jsExts = new Set(['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'vue', 'svelte']);
  if (jsExts.has(file.extension.toLowerCase())) {
    return parseJavaScriptAst(file);
  }
  return parseGenericCodeHeuristics(file);
}
