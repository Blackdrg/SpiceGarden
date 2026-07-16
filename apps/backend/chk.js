const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: 'postgresql://spicegarden:spicegarden_dev_password@localhost:5432/spicegarden' });
  await c.connect();
  const r = await c.query("select email from users where email like 'audit_%'");
  console.log('existing audit users:', r.rows.length, r.rows.slice(0, 5));
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
