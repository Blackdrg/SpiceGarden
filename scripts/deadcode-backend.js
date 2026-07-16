const fs = require('fs');
const path = require('path');
const srcRoot = 'D:/SpiceGarden/apps/backend/src';

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) files = files.concat(walk(fp));
    else if (f.endsWith('.ts') && !f.endsWith('.spec.ts') && !f.endsWith('.d.ts')) files.push(fp);
  }
  return files;
}
const all = walk(srcRoot);
const read = f => fs.readFileSync(f, 'utf8');
// collect class names
const classMap = {};
for (const f of all) {
  const src = read(f);
  const re = /export\s+class\s+(\w+)/g; let m;
  while ((m = re.exec(src))) classMap[m[1]] = f;
}
// build import graph: which files import which class
const importSet = {};
for (const f of all) {
  const src = read(f);
  const re = /import\s+[^\n]*?\b(\w+)\b[^\n]*?from\s+['"]([^'"]+)['"]/g; let m;
  importSet[f] = importSet[f] || new Set();
  while ((m = re.exec(src))) {
    // resolve named import to a class if possible
    importSet[f].add(m[2]);
  }
}
// For each controller/service/entity class, check if it's referenced (instantiated/imported) anywhere
const cats = { Controller: [], Service: [], Entity: [], Module: [], Repository: [], Dto: [] };
for (const [name, f] of Object.entries(classMap)) {
  if (/Controller$/.test(name)) cats.Controller.push(name);
  else if (/Service$/.test(name)) cats.Service.push(name);
  else if (/Entity$/.test(name)) cats.Entity.push(name);
  else if (/Module$/.test(name)) cats.Module.push(name);
  else if (/Repository$/.test(name)) cats.Repository.push(name);
  else if (/Dto$/.test(name)) cats.Dto.push(name);
}
// reference scan: a class is "used" if its name appears in some other file (minus its own def)
const allSrc = all.map(read).join('\n');
function isUsed(name) {
  const re = new RegExp('\\b' + name + '\\b', 'g');
  let count = 0;
  for (const f of all) {
    const s = read(f);
    const mm = s.match(re);
    if (mm) count += mm.length;
  }
  return count > 1; // >1 because the definition itself counts once
}
const report = { orphanControllers: [], orphanServices: [], orphanEntities: [], orphanModules: [] };
for (const c of cats.Controller) if (!isUsed(c)) report.orphanControllers.push(c);
for (const c of cats.Service) if (!isUsed(c)) report.orphanServices.push(c);
for (const c of cats.Entity) if (!isUsed(c)) report.orphanEntities.push(c);
for (const c of cats.Module) if (!isUsed(c)) report.orphanModules.push(c);
console.log('=== BACKEND DEAD CODE (class defined but never referenced elsewhere) ===');
console.log('Controllers:', cats.Controller.length, 'Services:', cats.Service.length, 'Entities:', cats.Entity.length, 'Modules:', cats.Module.length, 'Repos:', cats.Repository.length, 'DTOs:', cats.Dto.length);
console.log('ORPHAN CONTROLLERS (' + report.orphanControllers.length + '):', report.orphanControllers.join(', ') || 'none');
console.log('ORPHAN SERVICES (' + report.orphanServices.length + '):', report.orphanServices.slice(0, 30).join(', ') || 'none');
console.log('ORPHAN ENTITIES (' + report.orphanEntities.length + '):', report.orphanEntities.join(', ') || 'none');
console.log('ORPHAN MODULES (' + report.orphanModules.length + '):', report.orphanModules.join(', ') || 'none');
