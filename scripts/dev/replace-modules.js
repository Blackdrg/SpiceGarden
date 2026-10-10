const fs = require('fs');
const path = require('path');

const files = [];
function findFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findFiles(full);
    else if (full.endsWith('.module.ts') && fs.readFileSync(full, 'utf8').includes('LocalRepositoryModule')) files.push(full);
  }
}
findFiles('.');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  content = content.replace(/import\s+\{\s*LocalRepositoryModule\s*\}\s+from\s+['"][^'"]+['"];?\n?/g, "import { DbRepositoriesModule } from '../db/db-repositories.module';\n");
  content = content.replace(/LocalRepositoryModule/g, 'DbRepositoriesModule');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
  }
}
