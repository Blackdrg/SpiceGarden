#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const includeNodeModules = args.includes('--include-node_modules') || args.includes('--all');
const skipHeavy = !args.includes('--all');

const rootDir = path.resolve(__dirname, '..');

const skipDirs = new Set([
  '.git',
  '.kilo',
  '.vscode',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  'tmp',
  'temp',
]);

function shouldSkipDir(dirName) {
  if (dirName === 'node_modules' && includeNodeModules) return false;
  if (skipHeavy && skipDirs.has(dirName)) return true;
  return false;
}

function getAllFiles(dir, fileList = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!shouldSkipDir(entry.name)) {
          getAllFiles(fullPath, fileList);
        }
      } else if (entry.isFile()) {
        fileList.push(fullPath);
      }
    }
  } catch (err) {
    // skip unreadable
  }
  return fileList;
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split(/\r?\n/).length;
  } catch (err) {
    return 0;
  }
}

function getGitStats() {
  try {
    const numstat = execSync('git diff --cached --numstat', { cwd: rootDir, encoding: 'utf8' }).trim();
    const untrackedFiles = execSync('git ls-files --others --exclude-standard', { cwd: rootDir, encoding: 'utf8' }).trim();

    let linesAdded = 0;
    let linesRemoved = 0;

    if (numstat) {
      for (const line of numstat.split('\n')) {
        const parts = line.split('\t');
        if (parts.length >= 3) {
          linesAdded += parseInt(parts[0], 10) || 0;
          linesRemoved += parseInt(parts[1], 10) || 0;
        }
      }
    }

    let untrackedLines = 0;
    if (untrackedFiles) {
      for (const file of untrackedFiles.split('\n')) {
        const fullPath = path.join(rootDir, file);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          untrackedLines += countLines(fullPath);
        }
      }
    }

    return { linesAdded, linesRemoved, netChange: linesAdded - linesRemoved, untrackedLines };
  } catch (err) {
    return { linesAdded: 0, linesRemoved: 0, netChange: 0, untrackedLines: 0 };
  }
}

function main() {
  const startTime = Date.now();

  console.log('\n=== Total Lines of Code Counter ===\n');
  console.log(`Project Root: ${rootDir}`);
  console.log(`Include node_modules: ${includeNodeModules ? 'YES' : 'NO'}`);
  console.log('');

  const allFiles = getAllFiles(rootDir);
  let totalLines = 0;
  const dirStats = {};

  for (const file of allFiles) {
    const lines = countLines(file);
    totalLines += lines;

    const relPath = path.relative(rootDir, file);
    const topDir = relPath.split(path.sep)[0] || '(root)';

    if (!dirStats[topDir]) {
      dirStats[topDir] = { files: 0, lines: 0 };
    }
    dirStats[topDir].files += 1;
    dirStats[topDir].lines += lines;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('--- Top-Level Directory Breakdown ---');
  console.log(`${'Directory'.padEnd(25)} ${'Files'.padStart(8)} ${'Lines'.padStart(12)}`);
  console.log('-'.repeat(50));

  const sorted = Object.entries(dirStats).sort((a, b) => b[1].lines - a[1].lines);
  for (const [dir, stats] of sorted) {
    console.log(`${dir.padEnd(25)} ${String(stats.files).padStart(8)} ${String(stats.lines).padStart(12)}`);
  }

  console.log('-'.repeat(50));
  console.log(`${'TOTAL'.padEnd(25)} ${String(allFiles.length).padStart(8)} ${String(totalLines).padStart(12)}`);

  const gitStats = getGitStats();
  console.log('\n--- Git Change Stats ---');
  console.log(`  Lines Added (staged):    ${gitStats.linesAdded}`);
  console.log(`  Lines Removed (staged):  ${gitStats.linesRemoved}`);
  console.log(`  Net Change:              ${gitStats.netChange}`);
  console.log(`  Untracked File Lines:    ${gitStats.untrackedLines}`);
  console.log(`  Files Scanned:           ${allFiles.length}`);
  console.log(`  Time Taken:              ${elapsed}s`);
  console.log('');
}

main();
