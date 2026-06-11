const fs = require('fs');
const path = require('path');

const DEFAULT_EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '__tests__',
  'test',
  'tests',
  '.jest',
]);

const DEFAULT_EXCLUDE_FILES = new Set([
  '.d.ts',
]);

function parseArgs() {
  const includeNodeModules = process.argv.includes('--include-node-modules');
  return { includeNodeModules };
}

function shouldExcludeDir(dirName, includeNodeModules) {
  if (DEFAULT_EXCLUDE_DIRS.has(dirName)) return !includeNodeModules || dirName !== 'node_modules';
  if (dirName.startsWith('.') && dirName !== '.') return true;
  return false;
}

function getExtension(filePath) {
  const ext = path.extname(filePath);
  if (!ext) return '(no extension)';
  return ext.toLowerCase();
}

function getFileType(ext) {
  const codeExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.c', '.cpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala'];
  const configExts = ['.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.xml', '.env'];
  const styleExts = ['.css', '.scss', '.sass', '.less', '.module.css'];
  const mdExts = ['.md', '.txt', '.rst'];

  if (codeExts.includes(ext)) return 'code';
  if (configExts.includes(ext)) return 'config';
  if (styleExts.includes(ext)) return 'style';
  if (mdExts.includes(ext)) return 'documentation';
  return 'other';
}

function countLines(filePath) {
  let totalLines = 0;
  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    totalLines = lines.length;

    const ext = path.extname(filePath).toLowerCase();
    const isScriptLike = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.c', '.cpp', '.go', '.rs', '.rb', '.php'].includes(ext);

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        blankLines++;
      } else if (isScriptLike) {
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('* ') || trimmed.startsWith('*/')) {
          commentLines++;
        } else if (trimmed === '/*' || trimmed.startsWith('//')) {
          commentLines++;
        } else {
          codeLines++;
        }
      } else {
        codeLines++;
      }
    }
  } catch (err) {
    totalLines = 0;
  }

  return { totalLines, codeLines, blankLines, commentLines };
}

function statSyncSafe(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (err) {
    return null;
  }
}

function walkDirectory(dir, results, includeNodeModules) {
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch (err) {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSyncSafe(fullPath);
    if (!stat) continue;

    if (stat.isDirectory()) {
      if (shouldExcludeDir(entry, includeNodeModules)) continue;
      walkDirectory(fullPath, results, includeNodeModules);
    } else if (stat.isFile()) {
      const ext = path.extname(entry).toLowerCase();
      if (!includeNodeModules && DEFAULT_EXCLUDE_FILES.has(ext)) continue;

      const counts = countLines(fullPath);
      if (counts.totalLines > 0 || true) {
        results.files.push({
          path: fullPath,
          ext,
          ...counts,
        });
      }
    }
  }
}

function main() {
  const { includeNodeModules } = parseArgs();
  const projectRoot = process.cwd();

  const results = {
    files: [],
  };

  walkDirectory(projectRoot, results, includeNodeModules);

  const totals = {
    files: 0,
    lines: 0,
    codeLines: 0,
    blankLines: 0,
    commentLines: 0,
    byType: {
      code: { files: 0, lines: 0, codeLines: 0, blankLines: 0, commentLines: 0 },
      config: { files: 0, lines: 0, codeLines: 0, blankLines: 0, commentLines: 0 },
      style: { files: 0, lines: 0, codeLines: 0, blankLines: 0, commentLines: 0 },
      documentation: { files: 0, lines: 0, codeLines: 0, blankLines: 0, commentLines: 0 },
      other: { files: 0, lines: 0, codeLines: 0, blankLines: 0, commentLines: 0 },
    },
  };

  for (const file of results.files) {
    const type = getFileType(file.ext);
    totals.files++;
    totals.lines += file.totalLines;
    totals.codeLines += file.codeLines;
    totals.blankLines += file.blankLines;
    totals.commentLines += file.commentLines;

    totals.byType[type].files++;
    totals.byType[type].lines += file.totalLines;
    totals.byType[type].codeLines += file.codeLines;
    totals.byType[type].blankLines += file.blankLines;
    totals.byType[type].commentLines += file.commentLines;
  }

  console.log('\n=======================================');
  console.log('       LINES OF CODE ANALYSIS');
  console.log('=======================================');
  console.log(`Project root : ${projectRoot}`);
  console.log(`Mode         : ${includeNodeModules ? 'ALL files (including node_modules)' : 'Source only (excluding node_modules)'}`);
  console.log(`Files counted: ${totals.files}`);
  console.log(`Total lines  : ${totals.lines}`);
  console.log(`Code lines   : ${totals.codeLines}`);
  console.log(`Blank lines  : ${totals.blankLines}`);
  console.log(`Comment lines: ${totals.commentLines}`);
  console.log('---------------------------------------\n');

  console.log('By FILE TYPE:');
  console.log('---------------------------------------');
  const typeLabels = {
    code: 'Code (TS, JS, TSX, JSX, PY, etc.)',
    config: 'Config (JSON, YAML, TOML, XML)',
    style: 'Styles (CSS, SCSS, LESS)',
    documentation: 'Documentation (MD, TXT)',
    other: 'Other',
  };

  for (const [type, data] of Object.entries(totals.byType)) {
    if (data.files === 0) continue;
    console.log(`${typeLabels[type] || type}`);
    console.log(`  Files : ${data.files}`);
    console.log(`  Lines : ${data.lines}`);
    console.log(`  Code  : ${data.codeLines}`);
    console.log(`  Blank : ${data.blankLines}`);
    console.log(`  Comment: ${data.commentLines}`);
    console.log('');
  }

  console.log('=======================================\n');
}

main();
