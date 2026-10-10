const fs = require('fs');
const path = require('path');

function analyzePages(appPath) {
  const pagesDir = path.join(appPath, 'src', 'pages');
  if (!fs.existsSync(pagesDir)) return [];
  
  function getFiles(dir) {
    let res = [];
    fs.readdirSync(dir).forEach(f => {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) res = res.concat(getFiles(full));
      else if (/\.(tsx|jsx|js|ts)$/.test(f) && !f.startsWith('_')) res.push(full);
    });
    return res;
  }

  const files = getFiles(pagesDir);
  return files.map(f => {
    const content = fs.readFileSync(f, 'utf8');
    const rel = path.relative(appPath, f);
    const hasFetch = /fetch\(|axios|useQuery|useSWR|getStaticProps|getServerSideProps|apiClient|io\(|socket|api\./i.test(content);
    const hasMockData = /mock|dummy|MOCK_|sampleData|defaultData/i.test(content);
    const hasFormSubmit = /handleSubmit|onSubmit|onClick.*POST|save|update/i.test(content);
    const hasHardcodedArrays = /const\s+\w+\s*=\s*\[\s*\{/i.test(content);
    const hasUseState = /useState/i.test(content);
    const hasUseEffect = /useEffect/i.test(content);
    
    // Classify
    let classification = 'UNKNOWN';
    if (hasFetch) {
      classification = hasHardcodedArrays ? 'PARTIAL' : 'REAL';
    } else if (hasHardcodedArrays && !hasFetch) {
      classification = 'MOCK / STATIC';
    } else if (hasUseState || hasFormSubmit) {
      classification = 'PARTIAL (Local State Only)';
    }

    return {
      file: rel,
      hasFetch,
      hasMockData,
      hasFormSubmit,
      hasHardcodedArrays,
      hasUseState,
      hasUseEffect,
      classification
    };
  });
}

['apps/customer-web', 'apps/restaurant-dashboard', 'apps/super-admin'].forEach(app => {
  console.log('=== ' + app + ' ===');
  const pages = analyzePages(app);
  pages.forEach(p => {
    console.log(`  ${p.file} -> ${p.classification} (fetch:${p.hasFetch}, mock:${p.hasMockData}, hardcodedArray:${p.hasHardcodedArrays}, submit:${p.hasFormSubmit})`);
  });
});
