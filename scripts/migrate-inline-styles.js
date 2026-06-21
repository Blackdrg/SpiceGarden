// migrate-inline-styles.js
// Simple migration script for customer-web project.
// NOTE: This is a minimal implementation and may need manual adjustments.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'apps', 'customer-web');

function toKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function objToCss(styleObj) {
  // Very naive conversion: replace camelCase keys with kebab-case, add 'px' to numeric values unless already a string.
  const entries = Object.entries(styleObj);
  return entries.map(([k, v]) => {
    const kebab = toKebab(k);
    const value = typeof v === 'number' ? `${v}px` : v;
    return `${kebab}: ${value};`;
  }).join('\n');
}

function processFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const styleRegex = /style=\{\{([^}]+)\}\}/g; // simplistic: captures content inside double braces
  let match;
  let newCode = code;
  const cssLines = [];
  let idx = 0;
  while ((match = styleRegex.exec(code)) !== null) {
    const fullMatch = match[0];
    const styleContent = match[1];
    // Attempt to evaluate the style object safely – we will use eval in a sandboxed way (NOTE: may fail for complex expressions).
    let styleObj = {};
    try {
      // Replace DESIGN_TOKENS with a placeholder object to avoid reference errors.
      const placeholder = { DESIGN_TOKENS: { spacing: {}, colors: {}, radius: {} } };
      const evalStr = '(' + styleContent + ')';
      const func = new Function('DESIGN_TOKENS', 'return ' + evalStr);
      styleObj = func(placeholder.DESIGN_TOKENS);
    } catch (e) {
      console.warn('Could not parse style object in', filePath, 'at', match.index);
      continue;
    }
    const className = `inlineStyle${idx}`;
    const css = `.${className} {\n${objToCss(styleObj)}\n}`;
    cssLines.push(css);
    const replacement = `className={styles.${className}}`;
    newCode = newCode.replace(fullMatch, replacement);
    idx++;
  }
  if (cssLines.length > 0) {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, path.extname(filePath));
    const cssFile = path.join(dir, `${base}.module.css`);
    const importLine = `import styles from './${base}.module.css';`;
    // Prepend import if not already present
    if (!newCode.includes(importLine)) {
      newCode = importLine + '\n' + newCode;
    }
    // Write updated TSX file
    fs.writeFileSync(filePath, newCode, 'utf8');
    // Append CSS
    fs.appendFileSync(cssFile, '\n' + cssLines.join('\n') + '\n', 'utf8');
    console.log(`Updated ${filePath}, wrote ${cssFile}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walk(ROOT);
