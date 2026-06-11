// clean-any.ts
import * as fs from 'fs';
import * as path from 'path';

function replaceAnyInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(/\bany\b/g, 'unknown');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules and .git
      if (['node_modules', '.git', 'dist', 'out'].includes(entry.name)) continue;
      walk(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.ts')) {
      replaceAnyInFile(fullPath);
    }
  }
}

walk(path.resolve(__dirname, '../apps'));
walk(path.resolve(__dirname, '../packages'));
