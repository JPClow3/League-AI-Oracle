// Script to check all npm package dependencies
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const npmPackages = new Set();
const missingPackages = new Set();

// Function to extract package name from import
function getPackageName(importPath) {
  // Handle scoped packages like @vercel/analytics
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    return parts.slice(0, 2).join('/');
  }
  // Handle regular packages
  return importPath.split('/')[0];
}

// Read all TypeScript/JavaScript files
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        const pkg = getPackageName(importPath);
        npmPackages.add(pkg);
        if (!allDeps[pkg] && !isBuiltIn(pkg)) {
          missingPackages.add(pkg);
        }
      }
    }

    while ((match = requireRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        const pkg = getPackageName(importPath);
        npmPackages.add(pkg);
        if (!allDeps[pkg] && !isBuiltIn(pkg)) {
          missingPackages.add(pkg);
        }
      }
    }
  } catch (err) {
    // Ignore errors for files we can't read
  }
}

// Check if package is a Node.js built-in
function isBuiltIn(pkg) {
  const builtins = [
    'fs',
    'path',
    'http',
    'https',
    'crypto',
    'stream',
    'util',
    'events',
    'buffer',
    'url',
    'querystring',
    'assert',
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'domain',
    'net',
    'os',
    'perf_hooks',
    'punycode',
    'readline',
    'repl',
    'string_decoder',
    'timers',
    'tls',
    'tty',
    'v8',
    'vm',
    'worker_threads',
    'zlib',
  ];
  return builtins.includes(pkg);
}

// Recursively scan directories
function scanDir(dir, exclude = ['node_modules', 'dist', 'test-results', '.git']) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !exclude.includes(file)) {
      scanDir(filePath, exclude);
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(file)) {
      scanFile(filePath);
    }
  });
}

console.log('Scanning for npm package imports...\n');
scanDir('.');

console.log('📦 All npm packages found in code:', Array.from(npmPackages).sort());
console.log('\n✅ Packages in package.json:', Object.keys(allDeps).sort());

if (missingPackages.size > 0) {
  console.log('\n❌ Missing packages (used in code but not in package.json):');
  Array.from(missingPackages)
    .sort()
    .forEach(pkg => console.log(`  - ${pkg}`));
  process.exit(1);
} else {
  console.log('\n✅ All packages are declared in package.json!');
  console.log('\n📊 Summary:');
  console.log(`  Total unique packages used: ${npmPackages.size}`);
  console.log(`  Total packages declared: ${Object.keys(allDeps).length}`);
}
