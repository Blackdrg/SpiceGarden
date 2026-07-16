const fs = require('fs');
const spec = require('./openapi.json');
const BASE = 'http://localhost:3001';
const methods = ['get', 'post', 'put', 'patch', 'delete'];
const targets = [];
for (const [p, ops] of Object.entries(spec.paths)) {
  for (const [m, op] of Object.entries(ops)) {
    if (methods.includes(m.toLowerCase())) {
      const path = p.replace(/{[^}]+}/g, '1');
      targets.push({ method: m.toUpperCase(), path, opId: op.operationId || '' });
    }
  }
}
(async () => {
  const results = [];
  for (const t of targets) {
    const url = BASE + t.path;
    const opts = { method: t.method, headers: { 'Content-Type': 'application/json' } };
    if (['POST', 'PUT', 'PATCH'].includes(t.method)) opts.body = '{}';
    try {
      const r = await fetch(url, opts);
      results.push({ method: t.method, path: t.path, status: r.status });
    } catch (e) {
      results.push({ method: t.method, path: t.path, status: 'ERR:' + e.message });
    }
  }
  const byStatus = {};
  for (const r of results) { byStatus[r.status] = (byStatus[r.status] || 0) + 1; }
  console.log('=== PROBE SUMMARY (unauthenticated) ===');
  console.log('Total:', results.length);
  console.log('By status:', JSON.stringify(byStatus, null, 0));
  // categorize
  const e500 = results.filter(r => r.status === 500);
  const e404 = results.filter(r => r.status === 404);
  const e400 = results.filter(r => r.status === 400);
  const e401 = results.filter(r => r.status === 401);
  const e200 = results.filter(r => r.status === 200);
  const e201 = results.filter(r => r.status === 201);
  const e302 = results.filter(r => r.status === 302);
  console.log('200:', e200.length, '201:', e201.length, '302:', e302.length, '400:', e400.length, '401:', e401.length, '404:', e404.length, '500:', e500.length);
  fs.writeFileSync(__dirname + '/probe-results.json', JSON.stringify({ summary: byStatus, results }, null, 2));
  console.log('--- 500s ---'); e500.forEach(r => console.log(r.method, r.path));
  console.log('--- 404s (excluding swagger/ui) ---');
  e404.filter(r => !/swagger|docs|favicon|index.html/.test(r.path)).forEach(r => console.log(r.method, r.path));
  console.log('--- 400s (sample 20) ---'); e400.slice(0, 20).forEach(r => console.log(r.method, r.path));
})();
