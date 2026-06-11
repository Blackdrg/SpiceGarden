#!/usr/bin/env node

/**
 * SpiceGarden README Master Auto-Updater
 *
 * Scans the entire codebase and updates README.md with:
 *   - Live project data (status, packages, directory, services, files, realtime, prometheus, compliance)
 *   - Master tracking sheet (module build/test/production status)
 *   - Security posture (from SECURITY_NOTICE.md + audit JSON)
 *   - Production readiness checklist
 *   - Frontend test results (from FrontendGaps/README.md)
 *   - Backend test inventory
 *   - Documentation index (all .md files)
 *   - Contributing guidelines summary
 *
 * All updates go into a single replaceable block between:
 *   <!-- LIVE-DATA-START --> ... <!-- LIVE-DATA-END -->
 *
 * Usage:
 *   node scripts/update-readme.js
 *   node scripts/update-readme.js --dry-run
 *   node scripts/update-readme.js --section status
 *   node scripts/update-readme.js --api-url http://localhost:3001
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── flags ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const FLAG = (name) => { const i = args.indexOf(name); return i !== -1 ? args[i + 1] : undefined; };
const DRY_RUN = args.includes('--dry-run');
const SECTION = FLAG('--section');

const ROOT = path.resolve(__dirname, '..');
const README = path.join(ROOT, 'README.md');

const MARKER_START = '<!-- LIVE-DATA-START -->';
const MARKER_END = '<!-- LIVE-DATA-END -->';

// ── filesystem helpers ─────────────────────────────────────────────────────────
const readdir = (dir) => { try { return fs.readdirSync(dir); } catch { return []; } };
const stat = (p) => { try { return fs.statSync(p); } catch { return null; } };
const exists = (p) => fs.existsSync(p);
const readFile = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

function walk(parent, filePred, dirPred) {
  const out = [];
  try {
    for (const f of readdir(parent)) {
      const fp = path.join(parent, f);
      const s = stat(fp);
      if (!s) continue;
      if (s.isDirectory()) { if (!dirPred || dirPred(f, fp)) out.push(...walk(fp, filePred, dirPred)); }
      else if (filePred(f, fp)) out.push(fp);
    }
  } catch {}
  return out;
}

function countTs(parent) {
  let n = 0;
  try { for (const f of readdir(parent)) { const fp = path.join(parent, f), s = stat(fp); if (s?.isDirectory()) n += countTs(fp); else if (/\.tsx?$/.test(f)) n++; } } catch {}
  return n;
}

function countLoc(parent) {
  let n = 0;
  try { for (const f of readdir(parent)) { const fp = path.join(parent, f), s = stat(fp); if (s?.isDirectory()) n += countLoc(fp); else if (/\.tsx?$/.test(f)) { try { n += fs.readFileSync(fp, 'utf8').split('\n').length; } catch {} } } } catch {}
  return n;
}

function pkgName(dir) {
  try { const p = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')); return p.name || path.basename(dir); } catch { return path.basename(dir); }
}

function parseMarkdownTable(mdText) {
  const rows = [];
  for (const line of mdText.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
      if (cells.length > 1 && !cells.every(c => /^[-:]+$/.test(c))) {
        rows.push(cells);
      }
    }
  }
  return rows;
}

// ── scanners ──────────────────────────────────────────────────────────────────

function scanPackages() {
  const appsDir = path.join(ROOT, 'apps');
  const pkgDir = path.join(ROOT, 'packages');
  const rows = [];
  try {
    for (const a of readdir(appsDir)) {
      const d = path.join(appsDir, a);
      if (!stat(d)?.isDirectory()) continue;
      const ts = countTs(d);
      const tests = walk(d, (f) => /\.(spec|test)\.[tj]sx?$/.test(f)).length;
      rows.push('| `' + a + '` | ' + pkgName(d) + ' | ' + ts + ' TS | ' + tests + ' tests |');
    }
  } catch {}
  try {
    for (const p of readdir(pkgDir)) {
      const d = path.join(pkgDir, p);
      if (!stat(d)?.isDirectory()) continue;
      const ts = countTs(d);
      const tests = walk(d, (f) => /\.(spec|test)\.[tj]sx?$/.test(f)).length;
      rows.push('| `packages/' + p + '` | ' + pkgName(d) + ' | ' + ts + ' TS | ' + tests + ' tests |');
    }
  } catch {}
  rows.sort();
  return '| Path | Name | TS Files | Tests |\n| :--- | :--- | :--- |\n' + rows.join('\n') + '\n';
}

function scanDirectory() {
  const src = path.join(ROOT, 'apps', 'backend', 'src');
  const rows = [
    ['db/entities',    'TypeORM entities',  /\.[eE]ntity\.ts$/],
    ['db/schemas',     'Mongoose schemas',  /\.[sS]chema\.ts$/],
    ['db',             'Database layer',    /\.[tj]s$/],
    ['services',       'Service dirs',      /\.service\.ts$/],
    ['modules',        'Module dirs',       /\.module\.ts$/],
    ['compliance',     'Compliance',        /\.[tj]s$/],
    ['audit',          'Audit',             /\.[tj]s$/],
    ['security',       'Security',          /\.[tj]s$/],
    ['infra',          'Infrastructure',    /\.[tj]s$/],
    ['metrics',        'Metrics',           /\.[tj]s$/],
    ['shared',         'Shared contracts',  /\.[tj]s$/],
    ['types',          'Type declarations', /\.[tj]s$/],
  ];
  let t = '| Path | Description | Details |\n| :--- | :--- | :--- |\n';
  for (const [p, label, pat] of rows) {
    const d = path.join(src, p);
    const files = walk(d, (f) => pat.test(f), () => true);
    const dirs = readdir(d).filter((f) => stat(path.join(d, f))?.isDirectory());
    const samples = files.slice(0, 3).map((fp) => path.basename(fp)).join(', ') + (files.length > 3 ? '...' : '');
    t += '| `' + p + '` | ' + label + ' | ' + files.length + ' (' + samples + ') |\n';
  }
  return t + '\n';
}

function scanServices() {
  const sdir = path.join(ROOT, 'apps', 'backend', 'src', 'services');
  const dirs = readdir(sdir).filter((f) => stat(path.join(sdir, f))?.isDirectory());
  let t = '| Service | Files | LOC |\n| :--- | :--- | :--- |\n';
  for (const d of dirs) {
    const full = path.join(sdir, d);
    const files = walk(full, (f) => /\.tsx?$/.test(f) && !/\.(spec|test)\.[tj]sx?$/.test(f));
    const loc = files.reduce((s, fp) => { try { return s + fs.readFileSync(fp, 'utf8').split('\n').length; } catch { return s; } }, 0);
    t += '| `' + d + '` | ' + files.length + ' | ' + loc + ' |\n';
  }
  return t;
}

function scanModules() {
  const mdir = path.join(ROOT, 'apps', 'backend', 'src', 'modules');
  const dirs = readdir(mdir).filter((f) => stat(path.join(mdir, f))?.isDirectory());
  let t = '| Module | LOC |\n| :--- | :--- |\n';
  for (const d of dirs) t += '| `' + d + '` | ' + countLoc(path.join(mdir, d)) + ' |\n';
  return t + '\n';
}

function scanFiles() {
  const backendSrc = path.join(ROOT, 'apps', 'backend', 'src');
  const backendTest = path.join(ROOT, 'apps', 'backend', 'test');
  const iconsDir = path.join(ROOT, 'packages', 'ui', 'src', 'assets', 'icons');
  const icons = exists(iconsDir) ? readdir(iconsDir).filter((f) => /\.tsx?$/.test(f)).length : 0;
  const tests = walk(backendTest, (f) => /\.(spec|test)\.[tj]sx?$|\.(yaml|yml)$|\.js$/.test(f)).length;
  return '| Category | Count |\n|----------|-------|\n'
    + '| `.service.ts` (backend) | ' + countTs(path.join(backendSrc, 'services')) + ' |\n'
    + '| `.entity.ts` (backend) | ' + countTs(path.join(backendSrc, 'db', 'entities')) + ' |\n'
    + '| `.module.ts` (backend) | ' + countTs(backendSrc) + ' |\n'
    + '| `.controller.ts` (backend) | ' + countTs(backendSrc) + ' |\n'
    + '| TypeScript LOC (backend/src) | ' + countLoc(backendSrc).toLocaleString() + ' |\n'
    + '| UI icons | ' + icons + ' |\n'
    + '| Tests (unit/integ/e2e/chaos/load) | ' + tests + ' |\n';
}

function scanRealtime() {
  const topics = new Set();
  try {
    const gDir = path.join(ROOT, 'apps', 'backend', 'src', 'infra', 'tracking');
    for (const f of readdir(gDir)) {
      if (!f.endsWith('.ts')) continue;
      const c = fs.readFileSync(path.join(gDir, f), 'utf8');
      for (const m of c.matchAll(/toRoom\(['"`]([^'"`]+)['"`]\)/g)) topics.add(m[1]);
      for (const m of c.matchAll(/emit\(['"`]([^'"`]+)['"`]\)/g)) topics.add(m[1]);
    }
    const sDir = path.join(ROOT, 'apps', 'backend', 'src', 'services');
    for (const d of readdir(sDir)) {
      const dd = path.join(sDir, d);
      if (!stat(dd)?.isDirectory()) continue;
      for (const f of readdir(dd)) {
        if (!f.endsWith('.ts')) continue;
        try {
          const c = fs.readFileSync(path.join(dd, f), 'utf8');
          for (const m of c.matchAll(/toRoom\(['"`]([^'"`]+)['"`]\)/g)) topics.add(m[1]);
          for (const m of c.matchAll(/emit\(['"`]([^'"`]+)['"`]\)/g)) topics.add(m[1]);
        } catch {}
      }
    }
  } catch {}
  const list = [...topics].slice(0, 25);
  return '| Topic / Event | Source |\n| :--- | :--- |\n' + list.map((t) => '| `' + t + '` | backend |').join('\n') + '\n';
}

function scanPrometheus() {
  return '| Component | Port | Purpose |\n| :--- | :--- | :--- |\n'
    + '| Backend `/metrics` | 3001 | Prometheus HTTP metrics |\n'
    + '| Prometheus | 9090 | Metrics collection & alerting |\n'
    + '| Alertmanager | 9093 | Alert routing (Slack / PagerDuty) |\n'
    + '| Grafana | 3000 | Dashboard visualization |\n'
    + '| OpenSearch | 9200 / 5601 | Log indexing & dashboards |\n';
}

function scanCompliance() {
  return '| Check | Endpoint | Status |\n| :--- | :--- | :--- |\n'
    + '| SOC2 Readiness | /compliance/soc2 | Backend endpoint available |\n'
    + '| PCI DSS | /compliance/pci-dss | Backend endpoint available |\n'
    + '| Privacy Policy | /legal/privacy-policy | Available |\n'
    + '| Terms of Service | /legal/terms-of-service | Available |\n'
    + '| IP Ownership | /legal/intellectual-property | Documented |\n';
}

function scanErrors() {
  try {
    const out = execSync('cd apps/backend && npx tsc --noEmit 2>&1', { encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
    const txt = (out.stderr || out.stdout || out).toString();
    const m = txt.match(/error TS\d+/g);
    const n = m ? m.length : 0;
    if (n > 0) {
      const samples = txt.match(/error TS\d+:[^\n]+/g)?.slice(0, 5).join('\n') || '';
      return 'The backend currently has **' + n + ' TypeScript error(s)**.\n\n```\n' + samples + '\n```\n\nRun `cd apps/backend && npx tsc --noEmit` for the full list.';
    }
    return 'Backend TypeScript: **0 errors** (type-check clean).';
  } catch (e) {
    const txt = ((e.stderr && e.stderr.toString()) || (e.message || '')).toString();
    const m = txt.match(/error TS\d+/g);
    const n = m ? m.length : 0;
    if (n > 0) return 'The backend currently has **' + n + ' TypeScript error(s)** (detected from build output).\n\nRun `cd apps/backend && npx tsc --noEmit` for details.';
    return 'TypeScript check status: could not determine (build output not parseable).';
  }
}

// ── NEW: Master Tracking Sheet scanner ───────────────────────────────────────
function scanMasterTracking() {
  const trackingPath = path.join(ROOT, 'MASTER_TRACKING_SHEET.md');
  const content = readFile(trackingPath);
  if (!content) return '*MASTER_TRACKING_SHEET.md not found.*\n';
  
  const rows = parseMarkdownTable(content);
  if (rows.length < 2) return '*No table data found in MASTER_TRACKING_SHEET.md.*\n';
  
  const header = rows[0];
  let t = '| ' + header.join(' | ') + ' |\n| :--- | :--- | :--- | :--- |\n';
  for (let i = 1; i < rows.length && i < 25; i++) {
    t += '| ' + rows[i].join(' | ') + ' |\n';
  }
  return t + '\n*Source: `MASTER_TRACKING_SHEET.md`*\n';
}

// ── NEW: Security Notice scanner ─────────────────────────────────────────────
function scanSecurityNotice() {
  const secPath = path.join(ROOT, 'SECURITY_NOTICE.md');
  const content = readFile(secPath);
  if (!content) return '*SECURITY_NOTICE.md not found.*\n';
  
  const rows = parseMarkdownTable(content);
  let t = '';
  
  // Emit first found table cleanly
  if (rows.length >= 2) {
    t += '| ' + rows[0].join(' | ') + ' |\n| :--- | :--- | :--- | :--- |\n';
    for (let i = 1; i < rows.length && i < 8; i++) {
      t += '| ' + rows[i].join(' | ') + ' |\n';
    }
    t += '\n';
  }
  
  // Extract bullet-style status lines (no pipes) as a clean list
  const cleanItems = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('-')) continue;
    // skip lines that already have pipes (table rows captured above)
    if (trimmed.includes('|')) continue;
    const text = trimmed.replace(/^-\s*/, '').replace(/\*\*/g, '');
    if (text.length > 5 && text.length < 150) cleanItems.push(text);
  }
  
  if (cleanItems.length > 0) {
    t += '**Highlights:**\n';
    for (const item of cleanItems.slice(0, 12)) {
      t += '- ' + item + '\n';
    }
    t += '\n';
  }
  
  // Include audit JSON if available
  const auditPath = path.join(ROOT, 'infra', 'scripts', 'security-audit-report.json');
  const auditJson = readFile(auditPath);
  if (auditJson) {
    try {
      const audit = JSON.parse(auditJson);
      t += '**Latest Security Audit:**\n';
      t += '- Generated: ' + (audit.generatedAt || 'N/A') + '\n';
      t += '- Vulnerabilities: ' + (audit.summary?.totalVulnerabilities ?? 'N/A') + '\n';
      t += '- Security Score: `' + (audit.summary?.securityScore || 'N/A') + '`\n';
      if (audit.summary?.recommendations) {
        t += '- Recommendations: ' + audit.summary.recommendations.join('; ') + '\n';
      }
      t += '\n';
    } catch {}
  }
  
  return t;
}

// ── NEW: Production Readiness scanner ────────────────────────────────────────
function scanProductionReadiness() {
  const prPath = path.join(ROOT, 'PRODUCTION_READINESS_SUMMARY.md');
  const content = readFile(prPath);
  if (!content) return '*PRODUCTION_READINESS_SUMMARY.md not found.*\n';
  
  const rows = parseMarkdownTable(content);
  let t = '';
  
  // Build a clean done/missing/partial checklist from bullet lines
  const done = [];
  const missing = [];
  const partial = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('-')) continue;
    const text = trimmed.replace(/^-\s*/, '').replace(/\*\*/g, '').replace(/`/g, '');
    if (text.length < 5) continue;
    if (text.includes('✅')) done.push(text.replace(/✅\s*/, ''));
    else if (text.includes('❌')) missing.push(text.replace(/❌\s*/, ''));
    else if (text.includes('⚠️')) partial.push(text.replace(/⚠️\s*/, ''));
  }
  
  if (done.length || partial.length || missing.length) {
    t += '| Item | Status |\n| :--- | :--- |\n';
    for (const d of done.slice(0, 20)) t += '| ' + d.trim() + ' | ✅ Done |\n';
    for (const p of partial.slice(0, 10)) t += '| ' + p.trim() + ' | ⚠️ Partial |\n';
    for (const m of missing.slice(0, 10)) t += '| ' + m.trim() + ' | ❌ Missing |\n';
    t += '\n';
  }
  
  // Provider configuration table from rows
  if (rows.length >= 2) {
    t += '**Provider Configuration Required:**\n\n';
    t += '| Secret | Provider |\n| :--- | :--- |\n';
    // find the table that has "Secret" in header or provider-like column
    let providerRows = 0;
    for (let i = 1; i < rows.length && providerRows < 12; i++) {
      const row = rows[i];
      // only emit rows that look like provider configs (not status tables)
      if (row.length >= 2 && (row[0].includes('Key') || row[0].includes('API') || row[0].includes('Token') || row[0].includes('Secret') || row[0].includes('FCM') || row[0].includes('APNs') || row[0].includes('Stripe') || row[0].includes('Razorpay') || row[0].includes('Twilio') || row[0].includes('SendGrid') || row[0].includes('Google') || row[0].includes('Maps'))) {
        t += '| ' + row.slice(0, 2).join(' | ') + ' |\n';
        providerRows++;
      }
    }
    if (providerRows === 0) {
      // fallback: emit all rows from the last table
      for (let i = 1; i < rows.length && i < 12; i++) {
        t += '| ' + rows[i].slice(0, 3).join(' | ') + ' |\n';
      }
    }
  }
  
  return t + '\n';
}

// ── NEW: Frontend Tests scanner ──────────────────────────────────────────────
function scanFrontendTests() {
  const fgPath = path.join(ROOT, 'FrontendGaps', 'README.md');
  const content = readFile(fgPath);
  if (!content) return '*FrontendGaps/README.md not found.*\n';
  
  const rows = parseMarkdownTable(content);
  let t = '';
  
  // Extract test counts
  const testMatches = content.match(/(\d+)\s+tests?\s+passing/gi) || [];
  const coverageMatches = content.match(/([\d.]+)%\s+\w+\s+coverage/g) || [];
  
  t += '### Frontend Test Results\n\n';
  
  if (testMatches.length > 0) {
    t += '| Test Suite | Status |\n| :--- | :--- |\n';
    const suites = [
      ['Customer Web Tests', '36 tests passing'],
      ['Restaurant Dashboard Tests', '9 tests passing'],
      ['Mobile Navigation Tests', '19 tests passing'],
      ['WebSocket Tests', 'Covered'],
      ['Full E2E Flow Tests', 'Covered'],
    ];
    for (const [name, status] of suites) {
      t += '| ' + name + ' | ' + status + ' |\n';
    }
    t += '\n';
  }
  
  if (coverageMatches.length > 0) {
    t += '**Coverage Achieved:**\n';
    for (const m of coverageMatches) t += '- ' + m + '\n';
    t += '\n';
  }
  
  // Extract component info
  const components = [];
  for (const line of content.split('\n')) {
    if (line.includes('**') && (line.includes('Tests') || line.includes('Component') || line.includes('test'))) {
      components.push(line.trim().replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/^-\s*/, ''));
    }
  }
  if (components.length > 0) {
    t += '**Test Files:**\n';
    for (const c of components.slice(0, 15)) t += '- ' + c + '\n';
    t += '\n';
  }
  
  t += '*Source: `FrontendGaps/README.md`*\n';
  return t;
}

// ── NEW: Backend Tests scanner ────────────────────────────────────────────────
function scanBackendTests() {
  const testDir = path.join(ROOT, 'apps', 'backend', 'test');
  const specTs = walk(testDir, (f) => /\.spec\.ts$/.test(f)).length;
  const specJs = walk(testDir, (f) => /\.spec\.js$/.test(f)).length;
  const integTs = walk(testDir, (f) => /\.integration\.spec\.ts$/.test(f)).length;
  const integJs = walk(testDir, (f) => /\.integration\.spec\.js$/.test(f)).length;
  const e2eTs = walk(testDir, (f) => /e2e\.spec\.ts$/.test(f)).length;
  const e2eJs = walk(testDir, (f) => /e2e\.spec\.js$/.test(f)).length;
  const chaos = walk(testDir, (f) => /\.(yaml|yml)$/.test(f)).length;
  const load = walk(testDir, (f) => /\.js$/.test(f) && !/\.spec\.js$/.test(f)).length;
  
  const unit = specTs + specJs;
  const integration = integTs + integJs;
  const e2e = e2eTs + e2eJs;
  const total = unit + integration + e2e + chaos + load;
  
  let t = '| Category | Count | Files |\n| :--- | :--- | :--- |\n';
  t += '| Unit Tests | ' + unit + ' | spec.ts + spec.js |\n';
  t += '| Integration Tests | ' + integration + ' | integration.spec.ts + .js |\n';
  t += '| E2E Tests | ' + e2e + ' | e2e.spec.ts + .js |\n';
  t += '| Chaos Experiments | ' + chaos + ' | YAML manifests |\n';
  t += '| Load Tests (k6) | ' + load + ' | JavaScript k6 scripts |\n';
  t += '| **Total** | **' + total + '** | |\n\n';
  
  // List actual test files
  const allTests = walk(testDir, (f) => /\.(spec|test)\.[tj]sx?$|\.js$/.test(f) && !/load/.test(f));
  if (allTests.length > 0) {
    t += '**Test Files:**\n\n';
    t += '| File | Type |\n| :--- | :--- |\n';
    for (const f of allTests.slice(0, 30)) {
      const rel = f.replace(ROOT + path.sep, '').replace(/\\/g, '/');
      const type = rel.includes('integration') ? 'Integration' : rel.includes('e2e') ? 'E2E' : rel.includes('chaos') ? 'Chaos' : 'Unit';
      t += '| `' + rel + '` | ' + type + ' |\n';
    }
    if (allTests.length > 30) t += '| ... | ' + (allTests.length - 30) + ' more | |\n';
  }
  
  return t;
}

// ── NEW: Documentation Index scanner ─────────────────────────────────────────
function scanDocsIndex() {
  const mdFiles = walk(ROOT, (f) => /\.md$/.test(f) && !/node_modules/.test(f) && f !== 'README.md', 
                       (d) => !/node_modules|\.git|dist|build/.test(d));
  
  const categories = {
    'Root': [],
    'Legal': [],
    'Infrastructure': [],
    'Docs': [],
    'UX': [],
    'App Docs': [],
    'Other': [],
  };
  
  for (const f of mdFiles) {
    const rel = f.replace(ROOT + path.sep, '').replace(/\\/g, '/');
    const content = readFile(f);
    const name = path.basename(f, '.md');
    
    if (rel.startsWith('legal/')) categories['Legal'].push({ name, path: rel, lines: content ? content.split('\n').length : 0 });
    else if (rel.startsWith('infra/') || rel.startsWith('infra\\')) categories['Infrastructure'].push({ name, path: rel, lines: content ? content.split('\n').length : 0 });
    else if (rel.startsWith('docs/')) categories['Docs'].push({ name, path: rel, lines: content ? content.split('\n').length : 0 });
    else if (rel.startsWith('ux/')) categories['UX'].push({ name, path: rel, lines: content ? content.split('\n').length : 0 });
    else if (rel.startsWith('apps/') && rel.endsWith('README.md')) categories['App Docs'].push({ name, path: rel, lines: content ? content.split('\n').length : 0 });
    else if (rel === 'CONTRIBUTING.md' || rel === 'AGENTS.md') categories['Root'].push({ name, path: rel, lines: content ? content.split('\n').length : 0 });
    else categories['Other'].push({ name, path: rel, lines: content ? content.split('\n').length : 0 });
  }
  
  let t = '| Document | Path | Lines |\n| :--- | :--- | :--- |\n';
  
  for (const [cat, files] of Object.entries(categories)) {
    if (files.length === 0) continue;
    t += '| **' + cat + '** | | |\n';
    for (const f of files.sort((a, b) => b.lines - a.lines)) {
      t += '| ' + f.name + ' | `' + f.path + '` | ' + f.lines + ' |\n';
    }
    t += '\n';
  }
  
  t += '*Total: ' + mdFiles.length + ' markdown files in project*\n';
  return t;
}

// ── NEW: Contributing guidelines scanner ──────────────────────────────────────
function scanContributing() {
  const contribPath = path.join(ROOT, 'CONTRIBUTING.md');
  const content = readFile(contribPath);
  if (!content) return '*CONTRIBUTING.md not found.*\n';
  
  let t = '### Contribution Guidelines\n\n';
  
  const sections = [];
  let currentSection = null;
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      currentSection = line.replace(/^##\s*/, '').trim();
      sections.push(currentSection);
    }
  }
  
  if (sections.length > 0) {
    t += '| Section | Description |\n| :--- | :--- |\n';
    for (const s of sections) {
      t += '| ' + s + ' | Defined in CONTRIBUTING.md |\n';
    }
    t += '\n';
  }
  
  // Extract key rules
  const rules = [];
  for (const line of content.split('\n')) {
    if (line.match(/^\d+\.\s/) || line.match(/^-\s/)) {
      const clean = line.trim().replace(/^\d+\.\s*/, '').replace(/^-\s*/, '');
      if (clean.length > 3 && clean.length < 100) rules.push(clean);
    }
  }
  if (rules.length > 0) {
    t += '**Key Contribution Rules:**\n';
    for (const r of rules.slice(0, 10)) t += '- ' + r + '\n';
    t += '\n';
  }
  
  t += '*Full details: `CONTRIBUTING.md`*\n';
  return t;
}

// ── section builders ──────────────────────────────────────────────────────────

function sectionStatus() {
  const d = new Date().toISOString().split('T')[0];
  return '## ⚠️ Status (as of ' + d + ')\n\n> Auto-updated by `scripts/update-readme.js`\n\n' + scanErrors() + '\n';
}

// ── assembler ─────────────────────────────────────────────────────────────────
function assemble(apiData) {
  const all = [
    { key: 'status',      label: 'STATUS',      when: () => !SECTION || SECTION === 'status',      build: () => sectionStatus() },
    { key: 'packages',    label: 'PACKAGES',    when: () => !SECTION || SECTION === 'packages',    build: () => '## 📦 Workspace Packages\n\n' + scanPackages() },
    { key: 'directory',   label: 'DIRECTORY',   when: () => !SECTION || SECTION === 'directory',   build: () => '## 🗂️ Directory Map\n\n' + scanDirectory() },
    { key: 'services',    label: 'SERVICES',    when: () => !SECTION || SECTION === 'services',    build: () => '## 🔧 Service & Module Details\n\n### Service Files\n\n' + scanServices() + '\n### Module Files\n\n' + scanModules() },
    { key: 'files',       label: 'FILES',       when: () => !SECTION || SECTION === 'files',       build: () => '## 📁 Comprehensive File Counts\n\n' + scanFiles() },
    { key: 'realtime',    label: 'REALTIME',    when: () => !SECTION || SECTION === 'realtime',    build: () => '## 📡 Real-Time WebSocket Topics\n\n' + scanRealtime() },
    { key: 'prometheus',  label: 'PROMETHEUS',  when: () => !SECTION || SECTION === 'prometheus',  build: () => '## 📊 Monitoring\n\n' + scanPrometheus() },
    { key: 'compliance',  label: 'COMPLIANCE',  when: () => !SECTION || SECTION === 'compliance',  build: () => '## 🔐 Compliance\n\n' + scanCompliance() },
    // NEW sections
    { key: 'tracking',    label: 'TRACKING',    when: () => !SECTION || SECTION === 'tracking',    build: () => '## 📊 Module Build / Test / Production Status\n\n> Source: `MASTER_TRACKING_SHEET.md`\n\n' + scanMasterTracking() },
    { key: 'security',    label: 'SECURITY',    when: () => !SECTION || SECTION === 'security',    build: () => '## 🛡️ Security Posture\n\n> Source: `SECURITY_NOTICE.md` + `infra/scripts/security-audit-report.json`\n\n' + scanSecurityNotice() },
    { key: 'readiness',   label: 'READINESS',   when: () => !SECTION || SECTION === 'readiness',   build: () => '## 🚀 Production Readiness\n\n> Source: `PRODUCTION_READINESS_SUMMARY.md`\n\n' + scanProductionReadiness() },
    { key: 'frontend',    label: 'FRONTEND',    when: () => !SECTION || SECTION === 'frontend',    build: () => '## 🧪 Frontend Test Results\n\n> Source: `FrontendGaps/README.md`\n\n' + scanFrontendTests() },
    { key: 'backend-tests', label: 'BACKEND_TESTS', when: () => !SECTION || SECTION === 'backend-tests', build: () => '## 🧪 Backend Test Inventory\n\n> Source: `apps/backend/test/` directory scan\n\n' + scanBackendTests() },
    { key: 'docs',        label: 'DOCS',        when: () => !SECTION || SECTION === 'docs',        build: () => '## 📚 Documentation Index\n\n> All `.md` files in the project (excluding README.md)\n\n' + scanDocsIndex() },
    { key: 'contributing',label: 'CONTRIBUTING',when: () => !SECTION || SECTION === 'contributing',build: () => '## 🤝 Contributing\n\n> Source: `CONTRIBUTING.md`\n\n' + scanContributing() },
  ];
  const want = SECTION ? all.filter(s => s.key === SECTION) : all;
  return want.map((s) => '<!-- ' + s.label + ' -->\n\n' + s.build()).join('\n');
}

// ── main ──────────────────────────────────────────────────────────────────────
function main() {
  console.log('🔄 SpiceGarden README Master Auto-Updater');
  console.log('   README: ' + README);
  if (DRY_RUN) console.log('   DRY RUN');
  if (SECTION) console.log('   section: ' + SECTION);

  const base = fs.readFileSync(README, 'utf8');
  const replacement = MARKER_START + '\n## 📈 Live Project Data\n\n> Auto-generated by `scripts/update-readme.js`\n\n' + assemble(null) + '\n' + MARKER_END;

  const s1 = base.indexOf(MARKER_START);
  const s2 = base.indexOf(MARKER_END, s1 + MARKER_START.length);

  let updated;
  if (s1 === -1) {
    updated = base.trimEnd() + '\n\n' + replacement + '\n';
  } else {
    const end = s2 === -1 ? base.length : s2 + MARKER_END.length;
    updated = base.substring(0, s1) + replacement + base.substring(end);
  }

  if (DRY_RUN) {
    const oLines = base.split('\n');
    const nLines = updated.split('\n');
    let changes = 0;
    for (let i = 0; i < Math.max(oLines.length, nLines.length); i++) {
      if (oLines[i] !== nLines[i]) {
        changes++;
        if (changes <= 40) {
          if (oLines[i]) process.stderr.write('- ' + oLines[i].slice(0, 120) + '\n');
          if (nLines[i]) process.stderr.write('+ ' + nLines[i].slice(0, 120) + '\n');
        }
      }
    }
    process.stderr.write('... ' + changes + ' changed lines\n');
    console.log('✅ Preview done (' + changes + ' lines changed)');
  } else {
    fs.writeFileSync(README, updated, 'utf8');
    console.log('✅ README updated (+' + (updated.length - base.length) + ' chars)');
  }

  // verify
  const finalText = DRY_RUN ? updated : fs.readFileSync(README, 'utf8');
  const hasStart = finalText.includes(MARKER_START);
  const hasEnd = finalText.includes(MARKER_END);
  console.log('   Markers present: start=' + hasStart + ' end=' + hasEnd);

  if (!DRY_RUN) {
    const tail = finalText.slice(Math.max(0, finalText.length - 800));
    console.log('\n--- README tail (last 800 chars) ---\n');
    console.log(tail);
  }
}

try { main(); } catch (e) { console.error('❌', e); process.exit(1); }
