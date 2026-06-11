const fs = require('fs');
const path = require('path');

function replaceAnyInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(/\bany\b/g, 'unknown');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'out', 'build'].includes(entry.name)) continue;
      walk(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      replaceAnyInFile(fullPath);
    }
  }
}

walk(path.resolve(__dirname, '../apps'));
walk(path.resolve(__dirname, '../packages'));
