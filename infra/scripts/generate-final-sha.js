const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const baseDir = path.resolve(__dirname, '../../qa');
const targets = [
  { dir: path.join(baseDir, 'final'), prefix: '' },
  { dir: path.join(baseDir, 'scalability', '500k'), prefix: 'qa/scalability/500k/' }
];

let lines = [];

for (const target of targets) {
  if (!fs.existsSync(target.dir)) continue;
  const files = fs.readdirSync(target.dir).filter(f => f !== 'FINAL_EVIDENCE_SHA256.txt' && fs.statSync(path.join(target.dir, f)).isFile()).sort();
  for (const f of files) {
    const fullPath = path.join(target.dir, f);
    const content = fs.readFileSync(fullPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const label = target.prefix ? `${target.prefix}${f}` : f;
    lines.push(`${hash}  ${label}`);
  }
}

const outputPath = path.join(baseDir, 'final', 'FINAL_EVIDENCE_SHA256.txt');
fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8');
console.log(`Successfully generated SHA256 hashes for ${lines.length} files at ${outputPath}`);

