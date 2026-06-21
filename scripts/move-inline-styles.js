// scripts/move-inline-styles.js
// Automated migration of static inline style props in .tsx files to CSS Modules
// NOTE: This script handles only static literal style values. Dynamic expressions are left unchanged and logged.

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

// Directory containing .tsx files (adjust if needed)
const SRC_GLOB = path.join(__dirname, '..', 'apps', 'customer-web', 'src', 'pages', '**', '*.tsx');

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isStaticLiteral(node) {
  return node.type === 'StringLiteral' || node.type === 'NumericLiteral';
}

function extractStaticStyles(styleObj) {
  const entries = [];
  for (const prop of styleObj.properties) {
    if (prop.type !== 'ObjectProperty') continue;
    const key = prop.key.name || prop.key.value; // Identifier or Literal
    const valueNode = prop.value;
    if (!isStaticLiteral(valueNode)) {
      // Non‑static value – abort conversion for this element
      return null;
    }
    const value = valueNode.value;
    entries.push({ key, value });
  }
  return entries;
}

function cssFromEntries(entries) {
  return entries
    .map(({ key, value }) => `${toKebabCase(key)}: ${value}${typeof value === 'number' ? 'px' : ''};`)
    .join('\n');
}

function ensureCssModule(tsxFile) {
  const dir = path.dirname(tsxFile);
  const base = path.basename(tsxFile, '.tsx');
  const cssModulePath = path.join(dir, `${base}.module.css`);
  if (!fs.existsSync(cssModulePath)) {
    fs.writeFileSync(cssModulePath, '/* Auto‑generated CSS module */\n', 'utf8');
  }
  return cssModulePath;
}

function addImportIfMissing(ast, cssModuleRelPath) {
  let hasImport = false;
  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === cssModuleRelPath) {
        hasImport = true;
        path.stop();
      }
    },
  });
  if (!hasImport) {
    const importDecl = parser.parse(`import styles from '${cssModuleRelPath}';`, { sourceType: 'module' }).program.body[0];
    ast.program.body.unshift(importDecl);
  }
}

function processFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  const cssModulePath = ensureCssModule(filePath);
  const relImportPath = `./${path.basename(cssModulePath)}`;
  addImportIfMissing(ast, relImportPath);

  const cssLines = [];
  let classCounter = 0;

  traverse(ast, {
    JSXAttribute(path) {
      if (path.node.name.name !== 'style') return;
      const value = path.node.value;
      if (!value || value.type !== 'JSXExpressionContainer') return;
      const expr = value.expression;
      if (!expr || expr.type !== 'ObjectExpression') return;

      const entries = extractStaticStyles(expr);
      if (!entries) {
        console.log(`Skipping dynamic style in ${filePath} at line ${path.node.loc.start.line}`);
        return;
      }

      const className = `inlineStyle${classCounter++}`;
      const css = `.\${className} {\n${cssFromEntries(entries)}\n}`;
      cssLines.push(css);

      // Replace style attribute with className={styles.className}
      const newAttr = parser.parseExpression(`className={styles.${className}}`);
      path.replaceWith(newAttr);
    },
  });

  if (cssLines.length > 0) {
    fs.appendFileSync(cssModulePath, '\n' + cssLines.join('\n\n'));
    const output = generate(ast, { /* options */ }, code).code;
    fs.writeFileSync(filePath, output, 'utf8');
    console.log(`Updated ${filePath} – added ${cssLines.length} class(es).`);
  }
}

glob(SRC_GLOB, (err, files) => {
  if (err) throw err;
  files.forEach(processFile);
  console.log('Inline style migration complete.');
});
