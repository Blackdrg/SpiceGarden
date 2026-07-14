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
  
  extensions: {},
  fileSizes: [],
  largestFiles: [],
  folderSizes: new Map(),
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

async function getDirFiles(dir, allFiles) {
  let entries;
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true });
  } catch (e) {
    return 0; // skip unreadable
  }
  
  let dirSize = 0;
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      stats.totalFolders++;
      const childSize = await getDirFiles(fullPath, allFiles);
      dirSize += childSize;
    } else if (entry.isFile()) {
      stats.totalFiles++;
      let size = 0;
      try {
        const fileStats = await fs.promises.stat(fullPath);
        size = fileStats.size;
      } catch (e) {}
      
      dirSize += size;
      stats.totalSizeBytes += size;
      stats.fileSizes.push(size);
      
      stats.largestFiles.push({ path: fullPath, size });
      
      allFiles.push({ path: fullPath, size, fileType: getFileType(fullPath) });
    }
  }
  stats.folderSizes.set(dir, dirSize);
  return dirSize;
}

function processFileAsync(fileObj) {
  return new Promise((resolve) => {
    const { path: fullPath, size, fileType } = fileObj;
    if (size === 0) { resolve(); return; }
    
    // Quick check if binary by reading first 4KB
    const buf = Buffer.alloc(4096);
    fs.open(fullPath, 'r', (err, fd) => {
      if (err) { resolve(); return; }
      fs.read(fd, buf, 0, 4096, 0, (err, bytesRead) => {
        if (err) { fs.close(fd, ()=>{}); resolve(); return; }
        
        let isBinary = false;
        for (let i = 0; i < bytesRead; i++) {
          if (buf[i] === 0) { isBinary = true; break; }
        }
        
        if (isBinary) {
          stats.binaryFiles++;
          fs.close(fd, ()=>{});
          resolve();
          return;
        }
        
        stats.readableTextFiles++;
        
        // Fast line by line reading
        const rl = readline.createInterface({
          input: fs.createReadStream(fullPath, { fd, autoClose: true, start: 0 }),
          crlfDelay: Infinity
        });
        
        let lines = 0;
        let blank = 0;
        let comments = 0;
        let code = 0;
        let inBlockComment = false;
        
        rl.on('line', (line) => {
          lines++;
          line = line.trim();
          if (line.length === 0) {
            blank++;
            return;
          }
          
          if (inBlockComment) {
            comments++;
            if (line.includes('*/') || line.includes('-->')) inBlockComment = false;
            return;
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
          
          if (isComment) comments++;
          else code++;
        });
        
        rl.on('close', () => {
          stats.totalLines += lines;
          stats.blankLines += blank;
          stats.commentLines += comments;
          stats.executableCodeLines += code;
          
          if (!stats.extensions[fileType]) stats.extensions[fileType] = { files: 0, lines: 0 };
          stats.extensions[fileType].files++;
          stats.extensions[fileType].lines += lines;
          
          resolve();
        });
        
        rl.on('error', () => {
          resolve();
        });
      });
    });
  });
}

async function main() {
  console.log("Starting FAST filesystem census...");
  stats.totalFolders = 1;
  const allFiles = [];
  
  await getDirFiles(REPO_ROOT, allFiles);
  console.log(`Discovered ${stats.totalFiles} files. Processing contents...`);
  
  // Sort and truncate largest files array immediately to save memory
  stats.largestFiles.sort((a, b) => b.size - a.size);
  stats.largestFiles = stats.largestFiles.slice(0, 100);
  
  // Process with concurrency limit of 50
  const concurrency = 50;
  let index = 0;
  
  async function worker() {
    while (index < allFiles.length) {
      const fileObj = allFiles[index++];
      if (index % 10000 === 0) console.log(`Processed ${index} / ${allFiles.length} files`);
      await processFileAsync(fileObj);
    }
  }
  
  const workers = [];
  for (let i = 0; i < concurrency; i++) workers.push(worker());
  await Promise.all(workers);
  
  console.log("Processing complete. Generating report...");
  
  const sortedFolders = Array.from(stats.folderSizes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(e => ({ path: e[0], size: e[1] }));
    
  const deps = Array.from(stats.folderSizes.entries())
    .filter(e => e[0].includes('node_modules') && e[0].split(path.sep).length === REPO_ROOT.split(path.sep).length + 2)
    .sort((a, b) => b[1] - a[1]);
  const largestDep = deps.length > 0 ? deps[0].path : 'N/A';

  const packages = Array.from(stats.folderSizes.entries())
    .filter(e => e[0].includes('packages' + path.sep) && e[0].split(path.sep).length === REPO_ROOT.split(path.sep).length + 2)
    .sort((a, b) => b[1] - a[1]);
  const largestPackage = packages.length > 0 ? packages[0].path : 'N/A';

  const workspaces = Array.from(stats.folderSizes.entries())
    .filter(e => e[0].includes('apps' + path.sep) && e[0].split(path.sep).length === REPO_ROOT.split(path.sep).length + 2)
    .sort((a, b) => b[1] - a[1]);
  const largestWorkspace = workspaces.length > 0 ? workspaces[0].path : 'N/A';

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
    "Largest dependency": largestDep,
    "Largest package": largestPackage,
    "Largest workspace": largestWorkspace,
    "Largest file": stats.largestFiles[0] ? stats.largestFiles[0].path : 'N/A',
    "Top 100 files": stats.largestFiles.map(f => f.path),
    "Top 100 folders": sortedFolders.map(f => f.path)
  };

  fs.writeFileSync('fast-census-report.json', JSON.stringify(output, null, 2));
  console.log("Census complete! Wrote to fast-census-report.json");
}

main().catch(console.error);
