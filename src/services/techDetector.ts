import { DependencyItem, ProjectFile, TechStackDetection } from '../types/analyzer';

const KNOWN_PACKAGES: Record<string, { category: DependencyItem['category']; techName?: string }> = {
  // Frontend Frameworks
  react: { category: 'Frontend', techName: 'React' },
  'react-dom': { category: 'Frontend', techName: 'React DOM' },
  next: { category: 'Frontend', techName: 'Next.js' },
  vue: { category: 'Frontend', techName: 'Vue' },
  nuxt: { category: 'Frontend', techName: 'Nuxt' },
  svelte: { category: 'Frontend', techName: 'Svelte' },
  '@angular/core': { category: 'Frontend', techName: 'Angular' },
  astro: { category: 'Frontend', techName: 'Astro' },
  gatsby: { category: 'Frontend', techName: 'Gatsby' },

  // State Management
  zustand: { category: 'Frontend', techName: 'Zustand' },
  redux: { category: 'Frontend', techName: 'Redux' },
  '@reduxjs/toolkit': { category: 'Frontend', techName: 'Redux Toolkit' },
  'react-redux': { category: 'Frontend', techName: 'React Redux' },
  recoil: { category: 'Frontend', techName: 'Recoil' },
  jotai: { category: 'Frontend', techName: 'Jotai' },
  mobx: { category: 'Frontend', techName: 'MobX' },
  pinia: { category: 'Frontend', techName: 'Pinia' },

  // Styling & UI
  tailwindcss: { category: 'Styling', techName: 'Tailwind CSS' },
  '@tailwindcss/vite': { category: 'Styling', techName: 'Tailwind CSS v4' },
  bootstrap: { category: 'Styling', techName: 'Bootstrap' },
  'styled-components': { category: 'Styling', techName: 'Styled Components' },
  '@emotion/react': { category: 'Styling', techName: 'Emotion' },
  sass: { category: 'Styling', techName: 'Sass / SCSS' },
  'lucide-react': { category: 'Styling', techName: 'Lucide Icons' },
  '@heroicons/react': { category: 'Styling', techName: 'Heroicons' },
  '@radix-ui/react-dialog': { category: 'Styling', techName: 'Radix UI' },
  'framer-motion': { category: 'Styling', techName: 'Framer Motion' },

  // Backend Frameworks
  express: { category: 'Backend', techName: 'Express' },
  fastify: { category: 'Backend', techName: 'Fastify' },
  koa: { category: 'Backend', techName: 'Koa' },
  '@nestjs/core': { category: 'Backend', techName: 'NestJS' },
  hono: { category: 'Backend', techName: 'Hono' },
  cors: { category: 'Backend', techName: 'CORS Middleware' },
  jsonwebtoken: { category: 'Security', techName: 'JSON Web Tokens' },
  bcrypt: { category: 'Security', techName: 'bcrypt' },
  bcryptjs: { category: 'Security', techName: 'bcryptjs' },
  zod: { category: 'Backend', techName: 'Zod Validation' },

  // Databases & ORMs
  mongoose: { category: 'Database', techName: 'Mongoose (MongoDB)' },
  mongodb: { category: 'Database', techName: 'MongoDB Driver' },
  pg: { category: 'Database', techName: 'PostgreSQL (pg)' },
  mysql2: { category: 'Database', techName: 'MySQL2' },
  sqlite3: { category: 'Database', techName: 'SQLite3' },
  prisma: { category: 'Database', techName: 'Prisma ORM' },
  '@prisma/client': { category: 'Database', techName: 'Prisma Client' },
  typeorm: { category: 'Database', techName: 'TypeORM' },
  sequelize: { category: 'Database', techName: 'Sequelize' },
  '@supabase/supabase-js': { category: 'Database', techName: 'Supabase' },
  firebase: { category: 'Database', techName: 'Firebase' },
  'firebase-admin': { category: 'Database', techName: 'Firebase Admin' },
  ioredis: { category: 'Database', techName: 'Redis' },

  // Networking & Utilities
  axios: { category: 'Frontend', techName: 'Axios' },
  '@tanstack/react-query': { category: 'Frontend', techName: 'TanStack React Query' },
  'react-router-dom': { category: 'Frontend', techName: 'React Router' },
  lodash: { category: 'Other', techName: 'Lodash' },
  date_fns: { category: 'Other', techName: 'Date-fns' },

  // Build & Tooling
  vite: { category: 'Build/Tooling', techName: 'Vite' },
  webpack: { category: 'Build/Tooling', techName: 'Webpack' },
  rollup: { category: 'Build/Tooling', techName: 'Rollup' },
  typescript: { category: 'Build/Tooling', techName: 'TypeScript' },
  eslint: { category: 'Build/Tooling', techName: 'ESLint' },
  prettier: { category: 'Build/Tooling', techName: 'Prettier' },

  // Testing
  vitest: { category: 'Testing', techName: 'Vitest' },
  jest: { category: 'Testing', techName: 'Jest' },
  cypress: { category: 'Testing', techName: 'Cypress' },
  playwright: { category: 'Testing', techName: 'Playwright' },
  '@testing-library/react': { category: 'Testing', techName: 'React Testing Library' }
};

/**
 * Detect dependencies from package.json or requirements.txt and calculate file usages
 */
export function analyzeDependencies(files: ProjectFile[]): DependencyItem[] {
  const dependencyItems: DependencyItem[] = [];
  const packageJsonFile = files.find(f => f.name.toLowerCase() === 'package.json');

  if (packageJsonFile && packageJsonFile.content) {
    try {
      const pkg = JSON.parse(packageJsonFile.content);
      const prodDeps = pkg.dependencies || {};
      const devDeps = pkg.devDependencies || {};

      const allDeps = [
        ...Object.entries(prodDeps).map(([name, ver]) => ({ name, version: ver as string, isDev: false })),
        ...Object.entries(devDeps).map(([name, ver]) => ({ name, version: ver as string, isDev: true }))
      ];

      allDeps.forEach(dep => {
        const known = KNOWN_PACKAGES[dep.name];
        const category = known?.category || (dep.isDev ? 'Build/Tooling' : 'Other');

        // Check if imported across files
        const usedInFiles: string[] = [];
        const regex = new RegExp(`(?:from\\s+['"]${dep.name}(?:/[^'"]*)?['"]|require\\s*\\(\\s*['"]${dep.name}(?:/[^'"]*)?['"]\\))`);

        files.forEach(f => {
          if (f.content && f.classification === 'SAFE' && f.name !== 'package.json') {
            if (regex.test(f.content)) {
              usedInFiles.push(f.path);
            }
          }
        });

        const isLikelyUnused = usedInFiles.length === 0 && !dep.isDev && !['react-dom', 'tslib'].includes(dep.name);

        dependencyItems.push({
          name: dep.name,
          version: dep.version,
          isDev: dep.isDev,
          category,
          isDirect: true,
          usageCount: usedInFiles.length,
          usedInFiles,
          usageEvidence: usedInFiles.length > 0
            ? `Imported in ${usedInFiles.length} file(s)`
            : 'No direct usage detected in analyzed source files',
          isLikelyUnused
        });
      });
    } catch {
      // invalid json
    }
  }

  return dependencyItems;
}

/**
 * Detect full tech stack based on packages, imports, configurations, and AST structures
 */
export function detectTechStack(files: ProjectFile[], dependencies: DependencyItem[]): TechStackDetection {
  const frontendSet = new Set<string>();
  const backendSet = new Set<string>();
  const dbSet = new Set<string>();
  const stylingSet = new Set<string>();
  const buildToolsSet = new Set<string>();
  const testingSet = new Set<string>();
  const stateSet = new Set<string>();

  // 1. Inspect dependencies
  dependencies.forEach(dep => {
    const known = KNOWN_PACKAGES[dep.name];
    if (known?.techName) {
      if (known.category === 'Frontend') frontendSet.add(known.techName);
      if (known.category === 'Backend') backendSet.add(known.techName);
      if (known.category === 'Database') dbSet.add(known.techName);
      if (known.category === 'Styling') stylingSet.add(known.techName);
      if (known.category === 'Build/Tooling') buildToolsSet.add(known.techName);
      if (known.category === 'Testing') testingSet.add(known.techName);
    }
  });

  // 2. Inspect file signatures and configs
  const fileNames = new Set(files.map(f => f.name.toLowerCase()));
  const allContents = files.map(f => f.content || '').join('\n');

  if (fileNames.has('vite.config.ts') || fileNames.has('vite.config.js')) buildToolsSet.add('Vite');
  if (fileNames.has('tsconfig.json')) buildToolsSet.add('TypeScript');
  if (fileNames.has('tailwind.config.js') || fileNames.has('tailwind.config.ts') || allContents.includes('@tailwindcss')) {
    stylingSet.add('Tailwind CSS');
  }
  if (fileNames.has('next.config.js') || fileNames.has('next.config.mjs')) frontendSet.add('Next.js');
  if (fileNames.has('manifest.json')) frontendSet.add('Chrome Extension (MV3/MV2)');

  // Inspect source files for frameworks
  for (const file of files) {
    const content = file.content || '';
    if (/from\s+['"]react['"]|from\s+['"]react-dom['"]|jsx/i.test(content)) frontendSet.add('React');
    if (/from\s+['"]vue['"]/.test(content)) frontendSet.add('Vue.js');
    if (/from\s+['"]svelte['"]/.test(content)) frontendSet.add('Svelte');
    if (/from\s+['"]express['"]|require\(['"]express['"]\)/.test(content)) backendSet.add('Express.js');
    if (/from\s+['"]fastify['"]/.test(content)) backendSet.add('Fastify');
    if (/from\s+['"]mongoose['"]/.test(content) || /mongodb:\/\//.test(content)) dbSet.add('MongoDB');
    if (/from\s+['"]@supabase\/supabase-js['"]/.test(content)) dbSet.add('Supabase');
    if (/from\s+['"]firebase/.test(content)) dbSet.add('Firebase');
    if (/from\s+['"]zustand['"]/.test(content)) stateSet.add('Zustand');
    if (/from\s+['"]@reduxjs\/toolkit['"]|from\s+['"]redux['"]/.test(content)) stateSet.add('Redux');
    if (file.extension === 'py') {
      if (/from\s+flask\s+import|import\s+flask/i.test(content)) backendSet.add('Flask');
      if (/from\s+fastapi\s+import|import\s+fastapi/i.test(content)) backendSet.add('FastAPI');
      if (/from\s+django\s+import|import\s+django/i.test(content)) backendSet.add('Django');
      if (/sqlalchemy/i.test(content)) dbSet.add('SQLAlchemy');
    }
  }

  // If no frontend framework detected but HTML/CSS/JS present
  if (frontendSet.size === 0 && files.some(f => ['html', 'js'].includes(f.extension))) {
    frontendSet.add('Vanilla HTML5 / JavaScript');
  }

  // 3. Language breakdown
  const langMap: Record<string, { files: number; lines: number }> = {};
  const EXT_TO_LANG: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript (JSX)',
    js: 'JavaScript',
    jsx: 'JavaScript (JSX)',
    html: 'HTML',
    htm: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    py: 'Python',
    java: 'Java',
    go: 'Go',
    rs: 'Rust',
    php: 'PHP',
    sql: 'SQL',
    md: 'Markdown',
    yml: 'YAML',
    yaml: 'YAML'
  };

  let totalSourceLines = 0;
  files.forEach(f => {
    if (f.classification === 'SAFE') {
      const lang = EXT_TO_LANG[f.extension] || (f.extension ? f.extension.toUpperCase() : 'Plain Text');
      if (!langMap[lang]) langMap[lang] = { files: 0, lines: 0 };
      langMap[lang].files += 1;
      langMap[lang].lines += f.lines;
      totalSourceLines += f.lines;
    }
  });

  const languages = Object.entries(langMap).map(([name, data]) => ({
    name,
    filesCount: data.files,
    linesCount: data.lines,
    percentage: totalSourceLines > 0 ? Math.round((data.lines / totalSourceLines) * 100) : 0
  })).sort((a, b) => b.linesCount - a.linesCount);

  const primaryLanguage = languages[0]?.name || 'JavaScript';

  return {
    frontend: Array.from(frontendSet),
    backend: Array.from(backendSet),
    databases: Array.from(dbSet),
    styling: Array.from(stylingSet),
    buildTools: Array.from(buildToolsSet),
    testing: Array.from(testingSet),
    stateManagement: Array.from(stateSet),
    primaryLanguage,
    languages
  };
}
