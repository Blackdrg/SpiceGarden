const fs = require('fs');
const path = require('path');
const readline = require('readline');

const REPO_ROOT = 'D:\\SpiceGarden';

const stats = {
  totalFolders: 0,
  totalFiles: 0,
  readableTextFiles: 0,
  binaryFiles: 0,
  totalLines: 0,
  blankLines: 0,
  commentLines: 0,
  executableCodeLines: 0,
  totalSizeBytes: 0,
  
  extensions: {
    TypeScript: { files: 0, lines: 0 },
    JavaScript: { files: 0, lines: 0 },
    TSX: { files: 0, lines: 0 },
    JSX: { files: 0, lines: 0 },
    JSON: { files: 0, lines: 0 },
    YAML: { files: 0, lines: 0 },
    Markdown: { files: 0, lines: 0 },
    CSS: { files: 0, lines: 0 },
    SCSS: { files: 0, lines: 0 },
    HTML: { files: 0, lines: 0 },
    SQL: { files: 0, lines: 0 },
    Shell: { files: 0, lines: 0 },
    Dockerfile: { files: 0, lines: 0 },
    Proto: { files: 0, lines: 0 },
    XML: { files: 0, lines: 0 },
    INI: { files: 0, lines: 0 },
    ENV: { files: 0, lines: 0 },
    'Lock files': { files: 0, lines: 0 },
    Other: { files: 0, lines: 0 },
  },
  
  fileSizes: [],
  largestFiles: [],
  folderSizes: new Map(), // folder path -> size in bytes
};

function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const basename = path.basename(filename).toLowerCase();
  
  if (basename === 'package-lock.json' || basename === 'yarn.lock' || basename === 'pnpm-lock.yaml') return 'Lock files';
  if (basename === 'dockerfile' || ext === '.dockerfile') return 'Dockerfile';
  if (basename.startsWith('.env')) return 'ENV';
  
  switch (ext) {
    case '.ts': return 'TypeScript';
    case '.js': case '.cjs': case '.mjs': return 'JavaScript';
    case '.tsx': return 'TSX';
    case '.jsx': return 'JSX';
    case '.json': return 'JSON';
    case '.yml': case '.yaml': return 'YAML';
    case '.md': case '.markdown': return 'Markdown';
    case '.css': return 'CSS';
    case '.scss': case '.sass': return 'SCSS';
    case '.html': case '.htm': return 'HTML';
    case '.sql': return 'SQL';
    case '.sh': case '.bash': case '.zsh': case '.ps1': case '.cmd': case '.bat': return 'Shell';
    case '.proto': return 'Proto';
    case '.xml': return 'XML';
    case '.ini': return 'INI';
    default: return 'Other';
  }
}

function isBinary(buffer) {
  const len = Math.min(buffer.length, 4096);
  for (let i = 0; i < len; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

function processLines(buffer, fileType) {
  let lines = 0;
  let blank = 0;
  let comments = 0;
  let code = 0;
  
  let inBlockComment = false;
  
  let str = buffer.toString('utf8');
  let splitLines = str.split(/\r?\n/);
  lines = splitLines.length;
  
  for (let i = 0; i < lines; i++) {
    const line = splitLines[i].trim();
    if (line.length === 0) {
      blank++;
      continue;
    }
    
    // Basic comment heuristic
    if (inBlockComment) {
      comments++;
      if (line.includes('*/') || line.includes('-->')) {
        inBlockComment = false;
      }
      continue;
    }
    
    let isComment = false;
    
    if (['TypeScript', 'JavaScript', 'TSX', 'JSX', 'CSS', 'SCSS', 'Proto'].includes(fileType)) {
      if (line.startsWith('//')) isComment = true;
      else if (line.startsWith('/*')) {
        isComment = true;
        if (!line.includes('*/')) inBlockComment = true;
      }
    } else if (['YAML', 'Shell', 'Dockerfile', 'INI', 'ENV'].includes(fileType)) {
      if (line.startsWith('#')) isComment = true;
    } else if (['HTML', 'XML'].includes(fileType)) {
      if (line.startsWith('<!--')) {
        isComment = true;
        if (!line.includes('-->')) inBlockComment = true;
      }
    } else if (fileType === 'SQL') {
      if (line.startsWith('--')) isComment = true;
      else if (line.startsWith('/*')) {
        isComment = true;
        if (!line.includes('*/')) inBlockComment = true;
      }
    }
    
    if (isComment) {
      comments++;
    } else {
      code++;
    }
  }
  
  return { lines, blank, comments, code };
}

function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return 0; // Skip unreadable
  }
  
  let dirSize = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      stats.totalFolders++;
      const childSize = walk(fullPath);
      dirSize += childSize;
    } else if (entry.isFile()) {
      stats.totalFiles++;
      
      let fileStats;
      try {
        fileStats = fs.statSync(fullPath);
      } catch (e) { continue; }
      
      const size = fileStats.size;
      dirSize += size;
      stats.totalSizeBytes += size;
      stats.fileSizes.push(size);
      
      stats.largestFiles.push({ path: fullPath, size });
      
      let buffer;
      try {
        buffer = fs.readFileSync(fullPath);
      } catch (e) { continue; }
      
      if (isBinary(buffer)) {
        stats.binaryFiles++;
      } else {
        stats.readableTextFiles++;
        
        const fileType = getFileType(fullPath);
        const { lines, blank, comments, code } = processLines(buffer, fileType);
        
        stats.totalLines += lines;
        stats.blankLines += blank;
        stats.commentLines += comments;
        stats.executableCodeLines += code;
        
        if (stats.extensions[fileType]) {
          stats.extensions[fileType].files++;
          stats.extensions[fileType].lines += lines;
        } else {
          stats.extensions.Other.files++;
          stats.extensions.Other.lines += lines;
        }
      }
    }
  }
  
  stats.folderSizes.set(dir, dirSize);
  return dirSize;
}

console.log("Starting full filesystem census. This may take a while...");
stats.totalFolders = 1; // root
walk(REPO_ROOT);

stats.largestFiles.sort((a, b) => b.size - a.size);
stats.largestFiles = stats.largestFiles.slice(0, 100);

const sortedFolders = Array.from(stats.folderSizes.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 100)
  .map(e => ({ path: e[0], size: e[1] }));

// Calculate dependencies/packages size approx
const deps = Array.from(stats.folderSizes.entries())
  .filter(e => e[0].includes('node_modules') && e[0].split(path.sep).length === REPO_ROOT.split(path.sep).length + 2)
  .sort((a, b) => b[1] - a[1]);
const largestDep = deps.length > 0 ? deps[0] : { path: 'N/A', size: 0 };

const packages = Array.from(stats.folderSizes.entries())
  .filter(e => e[0].includes('packages' + path.sep) && e[0].split(path.sep).length === REPO_ROOT.split(path.sep).length + 2)
  .sort((a, b) => b[1] - a[1]);
const largestPackage = packages.length > 0 ? packages[0] : { path: 'N/A', size: 0 };

const workspaces = Array.from(stats.folderSizes.entries())
  .filter(e => e[0].includes('apps' + path.sep) && e[0].split(path.sep).length === REPO_ROOT.split(path.sep).length + 2)
  .sort((a, b) => b[1] - a[1]);
const largestWorkspace = workspaces.length > 0 ? workspaces[0] : { path: 'N/A', size: 0 };

stats.fileSizes.sort((a, b) => a - b);
const medianSize = stats.fileSizes.length > 0 ? stats.fileSizes[Math.floor(stats.fileSizes.length / 2)] : 0;
const avgSize = stats.fileSizes.length > 0 ? stats.totalSizeBytes / stats.fileSizes.length : 0;
const avgLines = stats.readableTextFiles > 0 ? stats.totalLines / stats.readableTextFiles : 0;

const repSizeMB = (stats.totalSizeBytes / (1024 * 1024)).toFixed(2);
const repSizeGB = (stats.totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);

const output = {
  "TOTAL FILES": stats.totalFiles,
  "TOTAL DIRECTORIES": stats.totalFolders,
  "Readable text files": stats.readableTextFiles,
  "Binary files": stats.binaryFiles,
  "TOTAL LINES": stats.totalLines,
  "TOTAL BLANK LINES": stats.blankLines,
  "TOTAL COMMENT LINES": stats.commentLines,
  "TOTAL CODE LINES": stats.executableCodeLines,
  "Repository Size": repSizeMB + " MB (" + repSizeGB + " GB)",
  "Average file size": Math.round(avgSize) + " bytes",
  "Median file size": medianSize + " bytes",
  "Average lines per file": Math.round(avgLines),
  "Breakdown": stats.extensions,
  "Largest directory": sortedFolders[0] ? sortedFolders[0].path : 'N/A',
  "Largest dependency": largestDep.path,
  "Largest package": largestPackage.path,
  "Largest workspace": largestWorkspace.path,
  "Largest file": stats.largestFiles[0] ? stats.largestFiles[0].path : 'N/A',
  "Top 100 files": stats.largestFiles.map(f => f.path),
  "Top 100 folders": sortedFolders.map(f => f.path)
};

fs.writeFileSync('census-report.json', JSON.stringify(output, null, 2));
console.log("Census complete! Wrote to census-report.json");
