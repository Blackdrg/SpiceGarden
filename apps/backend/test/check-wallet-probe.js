const { Client } = require('pg');
const c = new Client({
  host: 'localhost',
  port: 5432,
  user: 'spicegarden',
  password: 'spicegarden_dev_password',
  database: 'spicegarden'
});
c.connect();
c.query('select id, "userId", balance, currency from wallets where "userId" = $1', ['791b7a94-0f0d-4c28-9539-eab20561efef'])
  .then(r => console.log(JSON.stringify(r.rows)))
  .catch(e => console.error(e))
  .finally(() => c.end());
