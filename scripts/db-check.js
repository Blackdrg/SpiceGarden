const { Client } = require('pg');
const c = new Client({ host: 'localhost', port: 5432, user: 'spicegarden', password: 'spicegarden_dev_password', database: 'spicegarden' });
(async () => {
  await c.connect();
  const missing = ['api_keys','bank_accounts','campaigns','customer_subscriptions','delivery_pricing','journal_entries','platform_fees','restaurant_subscriptions','settlement_reports','subscription_plans','tenants'];
  const r = await c.query("select tablename from pg_tables where schemaname='public' and tablename = ANY($1)", [missing]);
  const present = r.rows.map(x => x.tablename).sort();
  console.log('PRESENT (' + present.length + '/11):', present.join(', '));
  console.log('STILL MISSING:', missing.filter(m => !present.includes(m)).join(', ') || 'NONE');
  const total = await c.query("select count(*) from pg_tables where schemaname='public'");
  console.log('TOTAL TABLES:', total.rows[0].count);
  const moreTbls = ['coupon_usages','user_payment_methods','payout_reports','referrals','refund_approvals'];
  const r2 = await c.query("select tablename from pg_tables where schemaname='public' and tablename = ANY($1)", [moreTbls]);
  console.log('WIRED-ENTITY TABLES EXIST:', r2.rows.map(x => x.tablename).join(', ') || 'NONE');
  console.log('MISSING OF THOSE:', moreTbls.filter(t => !r2.rows.map(x=>x.tablename).includes(t)).join(', ') || 'NONE');
  console.log('MIGRATIONS APPLIED:', mig.rows.map(x => x.name).join(' | '));
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
