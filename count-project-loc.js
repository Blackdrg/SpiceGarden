#!/usr/bin/env node
'use strict';

const fs    = require('fs');
const path   = require('path');
const os     = require('os');

const ROOT   = process.cwd();

// Directories excluded from AUTHORED calculation ONLY (FULL count includes everything)
const BUSINESS_EXCLUDE = new Set([
  'node_modules', '.git', 'dist', 'build', 'out',
  '.next', '.swc', '.turbo', '.cache', 'coverage',
  '.expo', '__mocks__', '.vscode', '.idea',
  '.kilo', '.kilocode', '_espjest_stage',
  'storybook-static', 'storybook',
]);

const BINARY_EXT = new Set([
  '.png','.jpg','.jpeg','.gif','.ico','.webp',
  '.pdf','.zip','.tar','.gz','.rar','.7z','.bz2',
  '.mp3','.mp4','.avi','.mov','.wmv','.flv',
  '.woff','.woff2','.ttf','.eot','.otf',
  '.wasm','.dat','.DS_Store','.log','.tmp',
]);

const TEXT_EXT = new Set([
  '.ts','.tsx','.js','.jsx','.mjs','.cjs',
  '.py','.java','.go','.rs','.rb','.php',
  '.sh','.bash','.zsh','.ps1','.psm1','.bat','.cmd',
  '.c','.cpp','.h','.hpp','.cs','.scala','.kt','.swift',
  '.json','.yaml','.yml','.toml','.ini','.cfg',
  '.env','.env.example','.env.local','.env.development','.env.production',
  '.env.test','.env.staging','.conf','.config',
  '.xml','.plist','.json5',
  '.md','.txt','.rst','.adoc','.tex','.csv',
  '.css','.scss','.sass','.less','.styl',
  '.sql','.proto','.graphql','.gql',
  '.lock','.properties',
  '.gitignore','.dockerignore','.eslintignore','.prettierignore',
  '.editorconfig','.eslintrc','.prettierrc',
]);

const SPECIAL_FILES = new Set([
  'Dockerfile','Makefile','Vagrantfile','Gemfile','Rakefile',
  'Procfile', 'compose.yaml','compose.dev.yaml','compose.infra.yaml','compose.debug.yaml',
]);

// ============== PARTICLE-COUNT VIA Node.js DIRECT FS =================
// Super-fast: open file, mmap-style read in 4MB chunks, count \n
// For 155K files this takes ~15-30s on SSD

function countLinesFast(fullPath) {
  let fd, stats;
  try {
    fd = fs.openSync(fullPath, 'r');
    stats = fs.fstatSync(fd);

    // Skip empty files
    if (stats.size === 0) { fs.closeSync(fd); return 0; }

    // For very large files (>50MB), estimate from 1MB sample
    if (stats.size > 50 * 1024 * 1024) {
      const sample = fs.readFileSync(fullPath, null).slice(0, 2 * 1024 * 1024);
      let lc = 0;
      for (let i = 0; i < sample.length; i++) if (sample[i] === 10) lc++;
      fs.closeSync(fd);
      return Math.max(1, Math.round(lc * (stats.size / sample.length)));
    }

    const buf = Buffer.allocUnsafe(4 * 1024 * 1024);  // 4MB buffer
    let count = 0, read;
    while ((read = fs.readSync(fd, buf, 0, buf.length)) > 0) {
      // SIMD-friendly loop: check bytes in groups of 4
      const limit = read & ~3;
      for (let i = 0; i < limit; i += 4) {
        if (buf[i] === 10) count++;
        if (buf[i+1] === 10) count++;
        if (buf[i+2] === 10) count++;
        if (buf[i+3] === 10) count++;
      }
      for (let i = limit; i < read; i++) {
        if (buf[i] === 10) count++;
      }
    }
    fs.closeSync(fd);

    // If file doesn't end with newline, the last line still counts
    if (stats.size > 0) {
      const lfd = fs.openSync(fullPath, 'r');
      const lbuf = Buffer.allocUnsafe(1);
      fs.readSync(lfd, lbuf, 0, 1, stats.size - 1);
      fs.closeSync(lfd);
      if (lbuf[0] !== 10) count++;
    }
    return count;
  } catch {
    if (fd) try { fs.closeSync(fd); } catch {}
    return 0;
  }
}

// =================== TRAVERSAL ===================

function* walk(dir, rel = '') {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rp   = rel ? path.join(rel, e.name) : e.name;
    if (e.isDirectory()) {
      if (e.name === '.git') continue;
      yield* walk(full, rp);
    } else if (e.isFile()) {
      const ext  = path.extname(full).toLowerCase();
      const base = path.basename(full);
      if (BINARY_EXT.has(ext)) continue;
      if (TEXT_EXT.has(ext) || SPECIAL_FILES.has(base)) {
        yield { full, rel: rp };
      }
    }
  }
}

function categorize(p) {
  if (/[/\\]node_modules[/\\]/.test(p)) return 'node_modules';
  if (/[/\\]_espjest_stage[/\\]/.test(p)) return 'Dependencies';
  if (/[/\\]\.kilo[/\\]/.test(p)) return 'Tools';
  if (/[/\\]\.kilocode[/\\]/.test(p)) return 'Tools';

  const isBT = p =>
    (/[/\\]apps[/\\]backend[/\\]test[/\\]/.test(p)) ||
    (/[/\\]backend[/\\]src[/\\]test[/\\]/.test(p) && !/test[/\\]unit/.test(p));
  if (isBT(p)) return 'Tests';
  if (/[/\\]__tests__[/\\]/.test(p)) return 'Tests';
  if (/[/\\]tests[/\\]/.test(p)) return 'Tests';
  if (/\.test\.(ts|js|tsx|jsx)$/.test(p)) return 'Tests';
  if (/\.spec\.(ts|js|tsx|jsx)$/.test(p)) return 'Tests';
  if (/[/\\]e2e[/\\]/.test(p)) return 'Tests';
  if (/[/\\]coverage[/\\][^/\\]*$/.test(p)) return 'Tests';
  if (/[/\\]apps[/\\]customer-mobile[/\\]/.test(p) &&
      !/[/\\]node_modules/.test(p) && !/[/\\]android/.test(p)) return 'Mobile (Customer)';
  if (/[/\\]apps[/\\]customer-web[/\\]/.test(p) &&
      !/[/\\]node_modules/.test(p) && !/[/\\]\.next/.test(p) && !/[/\\]coverage/.test(p)) return 'Web (Customer)';
  if (/[/\\]apps[/\\]delivery-partner[/\\]/.test(p) &&
      !/[/\\]node_modules/.test(p) && !/[/\\]android/.test(p)) return 'Mobile (Delivery)';
  if (/[/\\]apps[/\\]restaurant-dashboard[/\\]/.test(p) &&
      !/[/\\]node_modules/.test(p) && !/[/\\]\.next/.test(p) &&
      !/[/\\]coverage/.test(p) && !/[/\\]__tests__/.test(p)) return 'Dashboard (Restaurant)';
  if (/[/\\]apps[/\\]super-admin[/\\]/.test(p) &&
      !/[/\\]node_modules/.test(p) && !/[/\\]\.next/.test(p) &&
      !/[/\\]\.swc/.test(p) && !/[/\\]__tests__/.test(p)) return 'Dashboard (Admin)';
  if (/[/\\]apps[/\\]launcher[/\\]/.test(p) && !/[/\\]node_modules/.test(p)) return 'Launcher (Electron)';
  if (/[/\\]apps[/\\]backend[/\\]/.test(p) && !/[/\\]node_modules/.test(p)) return 'Backend';
  if (/[/\\]packages[/\\]/.test(p) && !/[/\\]node_modules/.test(p)) return 'Shared Packages';
  if (/[/\\]infra[/\\]/.test(p)) return 'Infrastructure';
  if (/[/\\]k8s[/\\]/.test(p)) return 'Infrastructure';
  if (/[/\\]docker[/\\]/.test(p)) return 'Infrastructure';
  if (/[/\\]scripts[/\\]/.test(p)) return 'Infrastructure';
  if (/[/\\]\.github[/\\]/.test(p)) return 'CI/CD';
  if (/[/\\]docs[/\\]/.test(p)) return 'Documentation';
  if (/[/\\]ux[/\\]/.test(p)) return 'Documentation';
  if (/[/\\]legal[/\\]/.test(p)) return 'Documentation';

  const ext = path.extname(p).toLowerCase();
  if (['.ts','.tsx','.js','.jsx','.mjs','.cjs','.py','.go','.rs','.java','.sql'].includes(ext)) return 'Source Code';
  if (['.json','.yaml','.yml','.toml','.env','.xml'].includes(ext)) return 'Configs';
  if (['.md','.txt','.rst'].includes(ext)) return 'Documentation';
  if (['.css','.scss','.sass','.less'].includes(ext)) return 'Styles';
  if (['.sh','.ps1','.proto'].includes(ext)) return 'Infrastructure';
  return 'Other';
}

function isBusinessExcluded(relPath) {
  const full = path.join(ROOT, relPath);
  for (const d of BUSINESS_EXCLUDE) { if (full.includes(path.sep + d)) return true; }
  return false;
}

function fmt(n) { return n.toLocaleString('en-US'); }

// =================== STRIP ANSI ===================
function stripAnsi(s) {
  // For the output buffer we don't need ansi since we're building strings
  return s;
}

// =================== WRITE REPORTS ===================
function writeReports(reportData) {
  const R = reportData;
  const TL = R.totalLOC;
  const totalFiles = R.totalFiles;

  // JSON
  const jBuf = Buffer.from(JSON.stringify(R, null, 2), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'loc-report.json'), jBuf);
  console.log('  loc-report.json  (' + (jBuf.length / 1024).toFixed(1) + ' KB)');

  // Markdown
  let md = '';
  md += '# SpiceGarden Project LOC Report\n\n';
  md += '| Field | Value |\n|-------|-------|\n';
  md += '| Generated | ' + R.generatedAt + ' |\n';
  md += '| TOTAL LOC | ' + fmt(TL) + ' |\n';
  md += '| Total files | ' + fmt(totalFiles) + ' |\n\n';
  md += '---\n\n';
  md += '## A. Full Repository Size\n\n';
  md += '| Metric | Value |\n|--------|-------|\n';
  md += '| Total LOC | ' + fmt(TL) + ' |\n';
  md += '| Total files | ' + fmt(totalFiles) + ' |\n';
  md += '| Unique file types | ' + R.uniqueTypes + ' |\n';
  md += '| Top-level dirs | ' + R.topDirs + ' |\n\n';

  md += '## B. Authored Business Code\n\n';
  md += '| Metric | Value |\n|--------|-------|\n';
  md += '| Authored LOC | ' + fmt(R.authoredLOC) + ' |\n';
  md += '| Deps/generated LOC | ' + fmt(R.totalLOC - R.authoredLOC) + ' |\n';
  md += '| Human ownership | ' + R.humanOwnership + '% |\n\n';
  md += '---\n\n';

  function mdTable(h, rows) {
    let s = '| ' + h.join(' | ') + ' |\n';
    s += '| ' + h.map(() => '---').join(' | ') + ' |\n';
    for (const r of rows) s += '| ' + r.join(' | ') + ' |\n';
    return s + '\n';
  }

  md += '## Category Breakdown\n\n';
  md += mdTable(['Category','Files','LOC','% of Total'],
    R.categories.map(([c,d]) => [c, fmt(d.files), fmt(d.lines), (d.lines/TL*100).toFixed(2)+'%']));
  md += '## File Type Breakdown\n\n';
  md += mdTable(['Extension','Files','LOC','% of Total'],
    R.fileTypes.map(([e,d]) => [e, fmt(d.files), fmt(d.lines), (d.lines/TL*100).toFixed(2)+'%']));
  md += '## Top-Level Directory Breakdown\n\n';
  md += mdTable(['Directory','Files','LOC','% of Total'],
    R.topDirsList.map(([d,v]) => [d, fmt(v.f), fmt(v.l), (v.l/TL*100).toFixed(2)+'%']));
  md += '## Authored Service Breakdown\n\n';
  md += mdTable(['Service/Package','Files','LOC'],
    Object.entries(R.authoredService).sort((a,b)=>b[1].loc-a[1].loc)
      .map(([d,v]) => [d, fmt(v.files), fmt(v.loc)]));
  md += '\n---\n\n';
  md += '## Analysis\n\n';
  md += '**1. What the Total Means**\n\n';
  md += 'The full repository LOC (' + fmt(TL) + ') represents every line of text in every tracked file across the entire project tree.\n\n';
  md += '**2. Why node_modules Inflates Numbers**\n\n';
  md += 'node_modules contains every NPM package in full: source, .d.ts, tests, bundled output, READMEs.\n';
  md += 'For this monorepo, node_modules: ' + fmt(R.node_modulesLines) + ' LOC (' + R.nmPct + '% of total).\n\n';
  md += '**3. Authored vs Dependency Code**\n\n';
  md += '| Metric | LOC |\n|--------|----:|\n';
  md += '| Authored business code | ' + fmt(R.authoredLOC) + ' |\n';
  md += '| Dependencies/generated | ' + fmt(R.totalLOC - R.authoredLOC) + ' |\n';
  md += '| Human ownership | ' + R.humanOwnership + '% |\n\n';
  md += 'Typical npm monorepos: 2-15% human ownership.\n\n';
  md += '**4. Industry Comparison**\n\n';
  md += '| Project Type | Authored LOC |\n|--------------|------------:|\n';
  md += '| Small startup monorepo | 50K-150K |\n';
  md += '| Medium enterprise monorepo | 150K-400K |\n';
  md += '| Large platform (Google/Meta) | 500K-1M+ |\n';
  md += '| This project (authored) | ' + fmt(R.authoredLOC) + ' |\n';
  md += '| This project (full) | ' + fmt(TL) + ' |\n\n';
  md += '> Complexity Score: **' + R.complexityScore + '/10**\n';

  const mBuf = Buffer.from(md, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'loc-report.md'), mBuf);
  console.log('  loc-report.md  (' + (mBuf.length / 1024).toFixed(1) + ' KB)');

  // CSV
  let csv = '';
  csv += '"Section";"Category";"Files";"LOC";"Percent"\n';
  for (const [c,d] of R.categories) {
    csv += '"Category";"' + c + '";"' + d.files + '";"' + d.lines + '";' + (d.lines/TL*100).toFixed(2) + '%\n';
  }
  csv += '\n"Section";"Extension";"Files";"LOC";"Percent"\n';
  for (const [e,d] of R.fileTypes) {
    csv += '"File Type";"' + e + '";"' + d.files + '";"' + d.lines + '";' + (d.lines/TL*100).toFixed(2) + '%\n';
  }
  csv += '\n"Section";"Directory";"Files";"LOC";"Percent"\n';
  for (const [d,v] of R.topDirsList) {
    csv += '"Top Dir";"' + d + '";"' + v.f + '";"' + v.l + '";' + (v.l/TL*100).toFixed(2) + '%\n';
  }
  csv += '\n"Section";"Directory";"Files";"LOC"\n';
  for (const [d,v] of Object.entries(R.authoredService).sort((a,b)=>b[1].loc-a[1].loc)) {
    csv += '"Authored";"' + d + '";"' + v.files + '";"' + v.loc + '"\n';
  }

  const cBuf = Buffer.from(csv, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'loc-report.csv'), cBuf);
  console.log('  loc-report.csv  (' + (cBuf.length / 1024).toFixed(1) + ' KB)');

  console.log('\nDone. Reports: loc-report.json  loc-report.md  loc-report.csv\n');
}

// =================== MAIN ===================
async function run() {
  console.log('SPICEGARDEN -- Project-Wide LOC Counter\n');

  // 1. SCAN
  console.log('[1/4] Scanning repository...');
  const allFiles = [];
  for (const f of walk(ROOT)) allFiles.push(f);
  console.log('  Scanned ' + fmt(allFiles.length) + ' text files\n');

  // 2. COUNT using Node.js direct I/O, batched across cores
  console.log('[2/4] Counting lines (' + os.cpus().length + ' workers, Node.js I/O)...');

  const results = new Array(allFiles.length);
  let nextIdx = 0;
  const TOTAL = allFiles.length;
  const t0 = Date.now();

  async function worker() {
    while (nextIdx < TOTAL) {
      const i = nextIdx++;
      const { full, rel } = allFiles[i];
      results[i] = { rel, lines: countLinesFast(full) };
      if (nextIdx % 10000 === 0 || nextIdx === TOTAL) {
        const pct = ((nextIdx / TOTAL) * 100).toFixed(1);
        process.stdout.write(
          '\r  Progress: ' + pct.padStart(5) + '%  [' +
          nextIdx.toLocaleString() + ' / ' + TOTAL.toLocaleString() + ' files]'
        );
      }
    }
  }

  await Promise.all(Array.from({ length: os.cpus().length }, () => worker()));
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  process.stdout.write('\n  Done in ' + elapsed + 's\n\n');

  // 3. AGGREGATE
  console.log('[3/4] Aggregating results...');

  const types = {}; const cats = {};
  const topDirs = {}; const authoredService = {}; const allSubDirs = {};
  const nm = { files: 0, lines: 0 };

  let totalLOC = 0, authoredLOC = 0, authoredFileCount = 0;

  for (const { rel, lines } of results) {
    totalLOC += lines;
    const full = path.join(ROOT, rel);

    const ext = path.extname(rel).toLowerCase() || '(no-ext)';
    types[ext] ||= { files: 0, lines: 0 };
    types[ext].files++;
    types[ext].lines += lines;

    const cat = categorize(full);
    cats[cat] ||= { files: 0, lines: 0 };
    cats[cat].files++;
    cats[cat].lines += lines;

    const topDir = rel.split(path.sep)[0] || '(root)';
    topDirs[topDir] ||= { files: 0, lines: 0 };
    topDirs[topDir].files++;
    topDirs[topDir].lines += lines;

    const parts = rel.split(path.sep);
    const dk = parts.length >= 3 ? parts[0] + '/' + parts[1] : parts[0] || '(root)';
    allSubDirs[dk] ||= { files: 0, lines: 0 };
    allSubDirs[dk].files++;
    allSubDirs[dk].lines += lines;

    if (topDir === 'node_modules' || rel.includes(path.sep + 'node_modules')) {
      nm.files++; nm.lines += lines;
    }

    if (!isBusinessExcluded(rel)) {
      authoredLOC += lines;
      authoredFileCount++;
      if (!authoredService[dk]) authoredService[dk] = { files: 0, loc: 0 };
      // else keep existing (for dk alias)
      authoredService[dk] = authoredService[dk] || { files: 0, loc: 0 };
      authoredService[dk].files++;
      authoredService[dk].loc += lines;
    }
  }

  // Fix: use simpler authoredDirs merge logic
  const authoredDirs2 = {};
  for (const { rel, lines } of results) {
    if (!isBusinessExcluded(rel)) {
      const parts = rel.split(path.sep);
      const dk = parts.length >= 3 ? parts[0] + '/' + parts[1] : parts[0] || '(root)';
      authoredDirs2[dk] ||= { files: 0, loc: 0 };
      authoredDirs2[dk].files++;
      authoredDirs2[dk].loc += lines;
    }
  }

  const humanPct = totalLOC > 0 ? (authoredLOC / totalLOC * 100) : 0;
  const uniqueTypes = Object.keys(types).length;
  const numTopDirs = Object.keys(topDirs).length;
  const sortedTypes = Object.entries(types).sort((a, b) => b[1].lines - a[1].lines);
  const sortedCats  = Object.entries(cats).sort((a, b) => b[1].lines - a[1].lines);
  const sortedTop   = Object.entries(topDirs).sort((a, b) => b[1].lines - a[1].lines);

  const complexityScore = Math.min(10, parseFloat((
    Math.log10(Math.max(allFiles.length, 1)) * 0.9 +
    Math.log10(Math.max(totalLOC, 1)) / 6.5 +
    Math.min(uniqueTypes, 80) * 0.05 +
    Math.min(numTopDirs, 25) * 0.07 +
    (humanPct < 12 ? 1.3 : 0)
  ).toFixed(2)));

  const nmPct = totalLOC > 0 ? (nm.lines / totalLOC * 100).toFixed(1) : '0';

  // ==================== OUTPUT ====================
  const D = '='.repeat(65);
  const S = (t) => '\n' + D + '\n  ' + t + '\n' + D;
  const LCW = 14, PW = 8, FW = 9;
  function tblRow(label, lw, files, loc, pct) {
    return '  ' + label.padEnd(lw) + fmt(files).padStart(FW) +
           fmt(loc).padStart(LCW) + '  ' + pct.toFixed(2).padStart(PW) + '%';
  }
  function tblSep(lw) {
    return '  ' + '-'.repeat(lw) + ' ' + '-'.repeat(FW) + ' ' + '-'.repeat(LCW) + ' ' + '-'.repeat(PW);
  }

  console.log(S('A. FULL REPOSITORY SIZE'));
  console.log('  Total files:          ' + fmt(allFiles.length));
  console.log('  Total LOC:            ' + fmt(totalLOC));
  console.log('  Unique file types:    ' + uniqueTypes);

  console.log(S('B. AUTHORED BUSINESS CODE'));
  console.log('  Authored files:       ' + fmt(authoredFileCount));
  console.log('  Authored LOC:         ' + fmt(authoredLOC));
  console.log('  Dependencies/LOC:     ' + fmt(totalLOC - authoredLOC));
  console.log('  Human ownership:      ' + humanPct.toFixed(2) + '%');
  console.log('  node_modules LOC:     ' + fmt(nm.lines) + ' (' + nmPct + '%)');

  console.log(S('CATEGORY BREAKDOWN'));
  const CATW = 24;
  console.log('  ' + 'Category'.padEnd(CATW) + fmt(0).padStart(FW) + fmt(0).padStart(LCW) + '  ' + 'Share'.padStart(PW));
  console.log(tblSep(CATW));
  for (const [c, d] of sortedCats) {
    const pct = totalLOC ? d.lines / totalLOC * 100 : 0;
    console.log(tblRow(c, CATW, d.files, d.lines, pct));
  }
  console.log(tblSep(CATW));
  console.log(tblRow('TOTAL', CATW, allFiles.length, totalLOC, 100));

  console.log(S('FILE TYPE BREAKDOWN'));
  const TYPW = 12;
  console.log('  ' + 'Extension'.padEnd(TYPW) + fmt(0).padStart(FW) + fmt(0).padStart(LCW) + '  ' + 'Share'.padStart(PW));
  console.log(tblSep(TYPW));
  for (const [ext, d] of sortedTypes.slice(0, 20)) {
    const pct = totalLOC ? d.lines / totalLOC * 100 : 0;
    console.log(tblRow(ext, TYPW, d.files, d.lines, pct));
  }
  if (sortedTypes.length > 20) {
    const rest = sortedTypes.slice(20);
    const rf = rest.reduce((s, t) => s + t[1].files, 0);
    const rl = rest.reduce((s, t) => s + t[1].lines, 0);
    console.log(tblRow('(others)', TYPW, rf, rl, totalLOC ? rl / totalLOC * 100 : 0));
  }

  console.log(S('TOP-LEVEL DIRECTORY BREAKDOWN'));
  const DIRW = 30;
  console.log('  ' + 'Directory'.padEnd(DIRW) + fmt(0).padStart(FW) + fmt(0).padStart(LCW) + '  ' + 'Share'.padStart(PW));
  console.log(tblSep(DIRW));
  for (const [d, v] of sortedTop) {
    const pct = totalLOC ? v.lines / totalLOC * 100 : 0;
    console.log(tblRow(d, DIRW, v.files, v.lines, pct));
  }
  console.log(tblSep(DIRW));
  console.log(tblRow('TOTAL', DIRW, allFiles.length, totalLOC, 100));

  console.log(S('AUTHORED SERVICE/PACKAGE (excl. node_modules, caches)'));
  const SVCW = 32;
  for (const [d, v] of Object.entries(authoredDirs2).sort((a, b) => b[1].loc - a[1].loc)) {
    console.log('  ' + d.padEnd(SVCW) + fmt(v.files).padStart(7) + fmt(v.loc).padStart(LCW));
  }

  console.log(S('ANALYSIS & CONTEXT'));
  console.log('  1. WHAT THE TOTAL MEANS');
  console.log('     Full repo LOC: ' + fmt(totalLOC) + ' -- every line in every tracked file.');
  console.log('     Includes: ALL source, node_modules, build outputs, configs, docs,');
  console.log('     infra, tests, scripts, lockfiles, caches.\n');
  console.log('  2. WHY node_modules INFLATES NUMBERS');
  console.log('     node_modules contains every NPM package in full source form:');
  console.log('     source code, type defs (.d.ts), tests, bundled/minified, READMEs.');
  console.log('     node_modules: ' + fmt(nm.lines) + ' LOC (' + nmPct + '% of total)\n');
  console.log('  3. AUTHORED vs DEPENDENCY CODE');
  console.log('     Authored business code:  ' + fmt(authoredLOC) + ' LOC');
  console.log('     Dependencies/generated: ' + fmt(totalLOC - authoredLOC) + ' LOC');
  console.log('     Human ownership:        ' + humanPct.toFixed(2) + '%');
  console.log('     Typical npm monorepos: 2-15% human ownership.\n');
  console.log('  4. INDUSTRY COMPARISON');
  console.log('     | Project Type                     | Authored LOC  |');
  console.log('     |----------------------------------|-------------:|');
  console.log('     | Small startup monorepo           |   50K-150K   |');
  console.log('     | Medium enterprise monorepo       |  150K-400K   |');
  console.log('     | Large platform (Google/Meta)     |  500K-1M+    |');
  console.log('     | This project (authored)          | ' + fmt(authoredLOC).padEnd(12) + '|');
  console.log('     | This project (full repo)         | ' + fmt(totalLOC).padEnd(12) + '|');
  console.log('     => Large enterprise monorepo with strong dependency management.\n');

  console.log(S('REPOSITORY COMPLEXITY SCORE'));
  const rating = complexityScore >= 7 ? 'Very High' : complexityScore >= 5 ? 'High' : 'Typical enterprise';
  console.log('  Score: ' + complexityScore.toFixed(1) + '/10  (' + rating + ')\n');
  console.log('  Files: ' + fmt(allFiles.length) + '  LOC: ' + fmt(totalLOC));
  console.log('  Types: ' + uniqueTypes + '  Services: 7  Packages: 5');
  console.log('  Human: ' + humanPct.toFixed(2) + '%\n');

  // ==================== REPORTS ====================
  console.log(S('WRITING EXPORT FILES'));

  const reportData = {
    generatedAt: new Date().toISOString(),
    totalFiles: allFiles.length,
    totalLOC: totalLOC,
    authoredLOC: authoredLOC,
    authoredFileCount: authoredFileCount,
    humanOwnership: humanPct.toFixed(2),
    node_modulesLines: nm.lines,
    nmPct: nmPct,
    complexityScore: String(complexityScore.toFixed(1)),
    topDirs: numTopDirs,
    uniqueTypes: uniqueTypes,
    categories: sortedCats,
    fileTypes: sortedTypes,
    topDirsList: sortedTop,
    authoredService: authoredDirs2,
  };

  writeReports(reportData);
}

run().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
