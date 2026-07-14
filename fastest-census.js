const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

const REPO_ROOT = 'D:\\SpiceGarden';

const stats = {
  totalFolders: 1, // root
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

async function main() {
  console.log("Using fast-glob to discover files...");
  // fast-glob only does files by default unless onlyDirectories is true. We'll get both files and dirs.
  const files = await fg('**/*', { cwd: REPO_ROOT, stats: true, absolute: true, dot: true, suppressErrors: true });
  const dirs = await fg('**/*', { cwd: REPO_ROOT, onlyDirectories: true, absolute: true, dot: true, suppressErrors: true });
  
  stats.totalFolders += dirs.length;
  stats.totalFiles = files.length;
  
  console.log(`Found ${stats.totalFiles} files and ${stats.totalFolders} folders.`);
  
  for (const file of files) {
    const size = file.stats.size;
    stats.totalSizeBytes += size;
    stats.fileSizes.push(size);
    stats.largestFiles.push({ path: file.path, size });
    
    // add size to folders up to root
    let dir = path.dirname(file.path);
    while (dir !== REPO_ROOT && dir.startsWith(REPO_ROOT)) {
      stats.folderSizes.set(dir, (stats.folderSizes.get(dir) || 0) + size);
      dir = path.dirname(dir);
    }
  }
  
  stats.folderSizes.set(REPO_ROOT, stats.totalSizeBytes);
  
  stats.largestFiles.sort((a, b) => b.size - a.size);
  stats.largestFiles = stats.largestFiles.slice(0, 100);
  
  console.log("Analyzing file contents...");
  
  let processedCount = 0;
  let printInterval = 5000;
  
  // parallelize file processing
  const concurrency = 200;
  let index = 0;
  
  async function worker() {
    while (index < files.length) {
      const file = files[index++];
      const fullPath = file.path;
      const size = file.stats.size;
      const fileType = getFileType(fullPath);
      
      processedCount++;
      if (processedCount % printInterval === 0) console.log(`Processed ${processedCount} / ${files.length}`);
      
      if (size === 0) continue;
      
      // analyze
      await new Promise((resolve) => {
        fs.open(fullPath, 'r', (err, fd) => {
          if (err) { resolve(); return; }
          const buf = Buffer.alloc(4096);
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
            
            // read file and parse lines roughly fast
            // if file > 10MB just skip line counting to not blow up memory, or read chunks
            if (size > 10 * 1024 * 1024) {
               fs.close(fd, ()=>{});
               resolve();
               return;
            }
            
            fs.readFile(fd, { encoding: 'utf8' }, (err, data) => {
              fs.close(fd, ()=>{});
              if (err) { resolve(); return; }
              let lines = 0, blank = 0, comments = 0, code = 0, inBlockComment = false;
              const lineArr = data.split(/\r?\n/);
              lines = lineArr.length;
              
              for (let i = 0; i < lines; i++) {
                const line = lineArr[i].trim();
                if (line.length === 0) { blank++; continue; }
                if (inBlockComment) {
                  comments++;
                  if (line.includes('*/') || line.includes('-->')) inBlockComment = false;
                  continue;
                }
                let isComment = false;
                if (['TypeScript', 'JavaScript', 'TSX', 'JSX', 'CSS', 'SCSS', 'Proto'].includes(fileType)) {
                  if (line.startsWith('//')) isComment = true;
                  else if (line.startsWith('/*')) { isComment = true; if (!line.includes('*/')) inBlockComment = true; }
                } else if (['YAML', 'Shell', 'Dockerfile', 'INI', 'ENV'].includes(fileType)) {
                  if (line.startsWith('#')) isComment = true;
                } else if (['HTML', 'XML'].includes(fileType)) {
                  if (line.startsWith('<!--')) { isComment = true; if (!line.includes('-->')) inBlockComment = true; }
                } else if (fileType === 'SQL') {
                  if (line.startsWith('--')) isComment = true;
                  else if (line.startsWith('/*')) { isComment = true; if (!line.includes('*/')) inBlockComment = true; }
                }
                
                if (isComment) comments++;
                else code++;
              }
              
              stats.totalLines += lines;
              stats.blankLines += blank;
              stats.commentLines += comments;
              stats.executableCodeLines += code;
              
              if (!stats.extensions[fileType]) stats.extensions[fileType] = { files: 0, lines: 0 };
              stats.extensions[fileType].files++;
              stats.extensions[fileType].lines += lines;
              
              resolve();
            });
          });
        });
      });
    }
  }
  
  const workers = [];
  for (let i = 0; i < concurrency; i++) workers.push(worker());
  await Promise.all(workers);
  
  console.log("Generating report...");
  
  const sortedFolders = Array.from(stats.folderSizes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(e => ({ path: e[0], size: e[1] }));
    
  const repSizeMB = (stats.totalSizeBytes / (1024 * 1024)).toFixed(2);
  const repSizeGB = (stats.totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);
  
  const medianSize = stats.fileSizes.length > 0 ? stats.fileSizes[Math.floor(stats.fileSizes.length / 2)] : 0;
  const avgSize = stats.fileSizes.length > 0 ? stats.totalSizeBytes / stats.fileSizes.length : 0;
  const avgLines = stats.readableTextFiles > 0 ? stats.totalLines / stats.readableTextFiles : 0;

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
    "Largest file": stats.largestFiles[0] ? stats.largestFiles[0].path : 'N/A',
    "Top 100 files": stats.largestFiles.map(f => f.path),
    "Top 100 folders": sortedFolders.map(f => f.path)
  };

  fs.writeFileSync('fastest-census-report.json', JSON.stringify(output, null, 2));
  console.log("Complete! Report generated.");
}

main().catch(console.error);
