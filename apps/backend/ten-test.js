const { Client } = require('pg');
const http = require('http');
(async () => {
  const c = new Client({ connectionString: 'postgresql://spicegarden:spicegarden_dev_password@localhost:5432/spicegarden' });
  await c.connect();
  const id = require('crypto').randomUUID();
  await c.query("INSERT INTO tenants (id, slug, name, status) VALUES ($1,$2,$3,$4)", [id, 'seed' + Date.now(), 'SeedTenant', 'active']);
  await c.end();
  function call(m, p) {
    return new Promise(r => { const x = http.request({ method: m, host: '127.0.0.1', port: 3001, path: p, headers: { 'Accept': 'application/json' } }, res => { let s = ''; res.on('data', d => s += d); res.on('end', () => r({ s: res.statusCode, b: s })); }); x.on('error', e => r({ s: 0, b: e.message })); x.end(); });
  }
  const r = await call('GET', '/admin/tenants/' + id);
  console.log('GET_TENANT_BY_ID', r.s, r.b.slice(0, 100));
  const r2 = await call('PUT', '/admin/tenants/' + id);
  console.log('PUT_TENANT', r2.s, r2.b.slice(0, 100));
})().catch(e => console.log('ERR', e.message));
