const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const c = new Client({ host: 'localhost', port: 5432, user: 'spicegarden', password: 'spicegarden_dev_password', database: 'spicegarden' });

// Map entity files -> table names (from entity @Entity decorator)
const entityDir = 'D:/SpiceGarden/apps/backend/src/db/entities';
const files = fs.readdirSync(entityDir).filter(f => f.endsWith('.entity.ts') || f.endsWith('.ts'));
const tableToCols = {};
for (const f of files) {
  const src = fs.readFileSync(path.join(entityDir, f), 'utf8');
  const m = src.match(/@Entity\(\s*['"`]([^'"`]+)['"`]/) || src.match(/@Entity\(\)\s*export class (\w+)/);
  // find table name
  let table = null;
  const e = src.match(/@Entity\(\s*(?:{[^}]*name:\s*['"`]([^'"`]+)['"`]|['"`]([^'"`]+)['"`])/);
  if (e) table = e[1] || e[2];
  else {
    const e2 = src.match(/export class (\w+)Entity/);
    if (e2) table = e2[1].replace(/Entity$/, '').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase() + 's';
  }
  if (!table) continue;
  // collect @Column decorated property names, and columns with name override
  const cols = new Set();
  const colRe = /@Column\s*\(([^)]*)\)\s*(?:public\s+)?(\w+)\s*[!?:]/g;
  let mm;
  while ((mm = colRe.exec(src))) {
    const opt = mm[1] || '';
    const nameMatch = opt.match(/name:\s*['"`]([^'"`]+)['"`]/);
    cols.add(nameMatch ? nameMatch[1] : mm[2]);
  }
  const colRe2 = /@Column\s*\n\s*(?:public\s+)?(\w+)\s*[!?:]/g;
  while ((mm = colRe2.exec(src))) cols.add(mm[1]);
  // PrimaryGeneratedColumn
  const pkRe = /@PrimaryGeneratedColumn[^\n]*\n\s*(?:public\s+)?(\w+)/g;
  while ((mm = pkRe.exec(src))) cols.add(mm[1]);
  tableToCols[table] = { file: f, cols: [...cols], src };
}

(async () => {
  await c.connect();
  const tables = Object.keys(tableToCols);
  const drift = [];
  for (const t of tables) {
    const r = await c.query("select column_name from information_schema.columns where table_schema='public' and table_name=$1", [t]);
    const dbCols = new Set(r.rows.map(x => x.column_name));
    const entityCols = tableToCols[t].cols;
    const missing = entityCols.filter(cc => !dbCols.has(cc));
    if (missing.length) drift.push({ table: t, file: tableToCols[t].file, missing });
  }
  console.log('=== SCHEMA DRIFT (entity columns missing in DB table) ===');
  if (!drift.length) console.log('NONE - all entity columns present in DB');
  else for (const d of drift) console.log(`${d.table} (${d.file}): missing [${d.missing.join(', ')}]`);
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
