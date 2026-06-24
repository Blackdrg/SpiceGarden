// migrate-inline-styles-simple.js
// Second‑pass migration: only extracts plain static style objects (no spreads, no ternaries).
// Designed for the SpiceGarden customer‑web codebase.

const fs = require('fs');
const path = require('path');

// Root of the customer‑web app (scripts/ is sibling to apps/)
const ROOT = path.resolve(__dirname, '..', 'apps', 'customer-web');

function toKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function objToCss(styleObj) {
  return Object.entries(styleObj)
    .map(([k, v]) => `${toKebab(k)}: ${v};`)
    .join('\n');
}

function isSimpleStyle(styleStr) {
  // Reject if contains spread operator or interpolation, functions, ternary, parentheses, braces
  if (/\.\.\.|\?|\(|\{|\}/.test(styleStr)) return false;
  // Split by commas to get individual declarations
  const parts = styleStr.split(',').map(p => p.trim()).filter(p => p.length);
  for (const part of parts) {
    // Expect key: value where value is a number or string literal (single or double quotes)
    if (!/^([a-zA-Z][a-zA-Z0-9]*)\s*:\s*(\d+|['"][^'\"]*['"])$/.test(part)) {
      return false;
    }
  }
  return true;
}

function parseStyle(styleStr) {
  const obj = {};
  const parts = styleStr.split(',').map(p => p.trim()).filter(p => p.length);
  for (const part of parts) {
    const [key, rawVal] = part.split(':').map(s => s.trim());
    // Strip quotes for strings, keep numeric as is, but keep as is for CSS output
    if (/^['"]/.test(rawVal)) {
      obj[key] = rawVal;
    } else {
      obj[key] = rawVal; // numeric
    }
  }
  return obj;
}

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  const componentName = path.basename(filePath, path.extname(filePath));
  const styleRegex = /style=\{\{([^}]+)\}\}/g;
  let match;
  let idx = 0;
  const cssEntries = [];
  while ((match = styleRegex.exec(code)) !== null) {
    const full = match[0];
    const styleContent = match[1].trim();
    if (!isSimpleStyle(styleContent)) {
      continue; // skip complex styles – will need manual handling later
    }
    const styleObj = parseStyle(styleContent);
    const className = `${componentName}Inline${idx}`;
    const css = `.${className} {\n${objToCss(styleObj)}\n}`;
    cssEntries.push(css);
    const replacement = `className={styles.${className}}`;
    code = code.replace(full, replacement);
    idx++;
  }
  if (cssEntries.length > 0) {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, path.extname(filePath));
    const cssFile = path.join(dir, `${base}.module.css`);
    // Ensure import exists
    const importLine = `import styles from './${base}.module.css';`;
    if (!code.includes(importLine)) {
      code = importLine + '\n' + code;
    }
    // Write updates
    fs.writeFileSync(filePath, code, 'utf8');
    // Append CSS (create file if missing)
    const existing = fs.existsSync(cssFile) ? '\n' : '';
    fs.appendFileSync(cssFile, existing + cssEntries.join('\n') + '\n', 'utf8');
    console.log(`Processed ${filePath} – added ${cssEntries.length} classes`);
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
