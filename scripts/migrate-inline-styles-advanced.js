// migrate-inline-styles-advanced.js
// Advanced migration: handle DESIGN_TOKENS references and simple conditional skips.
// Uses eval with a safe placeholder for DESIGN_TOKENS.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'apps', 'customer-web');

// Token placeholder – values match those defined in designTokens.module.css
const DESIGN_TOKENS = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  colors: {
    primary: '#0070f3',
    danger: '#e53935',
    textSecondary: '#666666',
    background: '#ffffff',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
};

function toKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function objToCss(styleObj) {
  return Object.entries(styleObj)
    .map(([k, v]) => {
      const prop = toKebab(k);
      const value = typeof v === 'number' ? `${v}px` : v;
      return `${prop}: ${value};`;
    })
    .join('\n');
}

function isSkippable(styleStr) {
  // Skip if contains spread or ternary or any identifier we cannot resolve.
  return /\.\.\.|\?|\(|\)/.test(styleStr);
}

function safeResolve(styleContent, tokens) {
  const resolved = styleContent.replace(/DESIGN_TOKENS\.([a-zA-Z_][a-zA-Z0-9_.]*)/g, (_, path) => {
    const parts = path.split('.');
    let val = tokens;
    for (const part of parts) {
      val = val?.[part];
    }
    return JSON.stringify(val);
  });
  return JSON.parse(resolved);
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
    if (isSkippable(styleContent)) continue; // complex – manual later
    let styleObj = {};
    try {
      styleObj = safeResolve(styleContent, DESIGN_TOKENS);
    } catch (e) {
      continue;
    }
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
    const importLine = `import styles from './${base}.module.css';`;
    if (!code.includes(importLine)) {
      code = importLine + '\n' + code;
    }
    fs.writeFileSync(filePath, code, 'utf8');
    // Append CSS (create file if missing)
    const prefix = fs.existsSync(cssFile) ? '\n' : '';
    fs.appendFileSync(cssFile, prefix + cssEntries.join('\n') + '\n', 'utf8');
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
