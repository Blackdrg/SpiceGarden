const fs = require('fs');
const path = require('path');

const files = [];
function findFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findFiles(full);
    else if (full.endsWith('.module.ts') && fs.readFileSync(full, 'utf8').includes('DbRepositoriesModule')) files.push(full);
  }
}
findFiles('.');

const target = path.join('db', 'db-repositories.module');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  const relPath = path.relative(path.dirname(file), target);
  const importPath = relPath.split(path.sep).join('/');

  content = content.replace(
    /import\s+\{\s*DbRepositoriesModule\s*\}\s+from\s+['"][^'"]+['"];?\n?/g,
    `import { DbRepositoriesModule } from '${importPath}';\n`
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed:', file, '->', importPath);
  }
}
