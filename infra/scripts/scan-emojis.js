const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

function searchDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === 'dist' || file === 'dist-web' || file === '.git' || file === 'coverage' || file === 'build') continue;
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      searchDir(full, fileList);
    } else if (/\.(tsx|jsx|js|ts|html|css|json|md)$/.test(file)) {
      fileList.push(full);
    }
  }
  return fileList;
}

const appsFiles = searchDir('apps');
const packagesFiles = searchDir('packages');
const allFiles = [...appsFiles, ...packagesFiles];

const findings = [];
for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      findings.push({ file: f, line: idx + 1, content: line.trim() });
    }
  });
}

console.log('Total emoji findings in apps/ and packages/:', findings.length);
findings.forEach(find => console.log(`${find.file}:${find.line} -> ${find.content.substring(0, 80)}`));
