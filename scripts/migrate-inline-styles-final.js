// migrate-inline-styles-final.js
// Comprehensive migration: convert remaining inline styles to CSS modules,
// translating DESIGN_TOKENS references to CSS variables (defined in designTokens.module.css).
// Complex cases (spreads, ternaries, function calls) are left untouched for manual review.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'apps', 'customer-web');
const TOKEN_MAP = {
  spacing: '--spacing',
  colors: '--color',
  radius: '--radius',
};

function toKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function replaceTokens(styleStr) {
  // Replace DESIGN_TOKENS.xxx.yyy with CSS var(--xxx-yyy)
  return styleStr.replace(/DESIGN_TOKENS\.([a-zA-Z]+)\.([a-zA-Z0-9_]+)/g, (_, group, name) => {
    const prefix = TOKEN_MAP[group];
    if (!prefix) return `var(${group}-${name})`;
    return `var(${prefix}-${name})`;
  });
}

function parseStyleObject(styleStr) {
  // Very naive parser: split on commas outside braces.
  // Assumes after token replacement values are either literals or CSS vars.
  const entries = styleStr.split(',').map(s => s.trim()).filter(Boolean);
  const obj = {};
  for (const entry of entries) {
    const [key, ...rest] = entry.split(':');
    const value = rest.join(':').trim();
    obj[key.trim()] = value;
  }
  return obj;
}

function styleObjToCss(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${toKebab(k)}: ${v};`)
    .join('\n');
}

function isComplex(styleStr) {
  // Detect spreads, ternaries, template literals, function calls.
  return /\.\.\.|\?|\(|\`/.test(styleStr);
}

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  const componentName = path.basename(filePath, path.extname(filePath));
  const regex = /style=\{\{([^}]+)\}\}/g;
  let match;
  let idx = 0;
  const cssBlocks = [];
  while ((match = regex.exec(code)) !== null) {
    const full = match[0];
    const inner = match[1].trim();
    if (isComplex(inner)) continue; // skip for manual handling
    const replaced = replaceTokens(inner);
    const styleObj = parseStyleObject(replaced);
    const className = `${componentName}Inline${idx}`;
    const css = `.${className} {\n${styleObjToCss(styleObj)}\n}`;
    cssBlocks.push(css);
    const replacement = `className={styles.${className}}`;
    code = code.replace(full, replacement);
    idx++;
  }
  if (cssBlocks.length > 0) {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, path.extname(filePath));
    const cssFile = path.join(dir, `${base}.module.css`);
    const importLine = `import styles from './${base}.module.css';`;
    if (!code.includes(importLine)) {
      code = importLine + '\n' + code;
    }
    fs.writeFileSync(filePath, code, 'utf8');
    const prepend = fs.existsSync(cssFile) ? '\n' : '';
    fs.appendFileSync(cssFile, prepend + cssBlocks.join('\n') + '\n', 'utf8');
    console.log(`Updated ${filePath} – added ${cssBlocks.length} classes`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.next', '.git'].includes(e.name)) continue;
      walk(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.jsx')) {
      processFile(full);
    }
  }
}

walk(ROOT);
