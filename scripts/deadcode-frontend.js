const fs = require('fs');
const path = require('path');
function walk(dir){let f=[];for(const x of fs.readdirSync(dir)){const fp=path.join(dir,x);if(fs.statSync(fp).isDirectory())f=f.concat(walk(fp));else if(x.endsWith('.tsx')||x.endsWith('.ts'))f.push(fp);}return f;}
const appRoot = 'D:/SpiceGarden/apps/customer-web/src';
const files = walk(appRoot);
// collect component/hook/context definitions (exported function or const arrow)
const defs = {};
for (const f of files){
  const s = fs.readFileSync(f,'utf8');
  const re = /export\s+(?:default\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9_]*)/g; let m;
  while((m=re.exec(s))) defs[m[1]]=(defs[m[1]]||0)+1;
  // also 'export const X = () =>' and 'export function X'
}
// count usages of each def across all files (excluding its own def line minimally - we count all occurrences)
const allSrc = files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const report = [];
for (const [name, defCount] of Object.entries(defs)){
  if (name.length<3) continue;
  const re = new RegExp('\\b'+name+'\\b','g');
  const uses = (allSrc.match(re)||[]).length;
  if (uses <= defCount){ report.push(name); }
}
console.log('=== customer-web potentially-UNUSED components/hooks/contexts (def count >= use count) ===');
console.log('Total exported symbols scanned:', Object.keys(defs).length);
console.log('Suspected unused ('+report.length+'):', report.slice(0,60).join(', '));
