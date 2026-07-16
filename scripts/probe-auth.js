const fs = require('fs');
const BASE = 'http://localhost:3001';
const spec = require('./openapi.json');
const methods = ['get', 'post', 'put', 'patch', 'delete'];
const targets = [];
for (const [p, ops] of Object.entries(spec.paths)) {
  for (const [m, op] of Object.entries(ops)) {
    if (methods.includes(m.toLowerCase())) targets.push({ method: m.toUpperCase(), path: p.replace(/{[^}]+}/g, '1') });
  }
}
function makeBody(method, path) {
  // craft a plausible body so validation passes where possible
  const b = {};
  if (path.includes('register')) Object.assign(b, { fullName: 'U', email: 'u@t.com', password: 'Password123!', phone: '+919999999999' });
  if (path.includes('login')) Object.assign(b, { email: 'u@t.com', password: 'x' });
  return JSON.stringify(b);
}
(async () => {
  // register + login to get token
  const email = 'probe_' + Date.now() + '@t.com';
  const phone = '+9199' + String(Date.now()).slice(-8);
  const reg = await fetch(BASE + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: 'Probe', email, password: 'Password123!', phone }) });
  const j = await reg.json();
  const token = j.access_token;
  if (!token) { console.log('NO TOKEN', reg.status, JSON.stringify(j).slice(0, 100)); process.exit(1); }
  const results = [];
  for (const t of targets) {
    const opts = { method: t.method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } };
    if (['POST', 'PUT', 'PATCH'].includes(t.method)) opts.body = makeBody(t.method, t.path);
    try {
      const r = await fetch(BASE + t.path, opts);
      results.push({ method: t.method, path: t.path, status: r.status });
    } catch (e) { results.push({ method: t.method, path: t.path, status: 'ERR' }); }
  }
  const by = {}; results.forEach(x => by[x.status] = (by[x.status] || 0) + 1);
  console.log('=== AUTHENTICATED FULL PROBE (valid JWT) ===');
  console.log('Total:', results.length, 'By status:', JSON.stringify(by));
  const e500 = results.filter(r => r.status === 500);
  const e404 = results.filter(r => r.status === 404);
  const e200 = results.filter(r => r.status === 200);
  const e201 = results.filter(r => r.status === 201);
  console.log('200:', e200.length, '201:', e201.length, '400:', results.filter(r=>r.status===400).length, '401:', results.filter(r=>r.status===401).length, '403:', results.filter(r=>r.status===403).length, '404:', e404.length, '500:', e500.length);
  console.log('--- 500s (authenticated) ---'); e500.forEach(r => console.log(' ', r.method, r.path));
  console.log('--- 404s (authenticated, excl swagger/ui) ---'); e404.filter(r=>!/swagger|docs|favicon/.test(r.path)).forEach(r => console.log(' ', r.method, r.path));
  fs.writeFileSync('./probe-auth-results.json', JSON.stringify({ by, results }, null, 2));
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
