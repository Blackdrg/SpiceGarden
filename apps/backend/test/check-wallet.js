const { Client } = require('pg');
const c = new Client({
  host: 'localhost',
  port: 5432,
  user: 'spicegarden',
  password: 'spicegarden_dev_password',
  database: 'spicegarden'
});
c.connect();
c.query('select id, "userId", balance, currency from wallets where "userId" = $1', ['1f6851fe-e6bf-4316-96fe-8443bed60a04'])
  .then(r => console.log(JSON.stringify(r.rows)))
  .catch(e => console.error(e))
  .finally(() => c.end());
