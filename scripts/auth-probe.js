const BASE = 'http://localhost:3001';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const email = 'audit_' + Date.now() + '_' + Math.floor(Math.random()*1e6) + '@test.com';
  const phone = '+9199' + String(Date.now()).slice(-8);
  const reg = await fetch(BASE + '/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Audit User', email, password: 'Password123!', phone })
  });
  const regBody = await reg.text();
  console.log('REGISTER', reg.status, regBody.slice(0, 300));
  let access;
  try {
    const j = JSON.parse(regBody);
    access = j.access_token || j.accessToken || (j.data && (j.data.access_token || j.data.accessToken));
  } catch (e) {}
  if (!access) { console.log('NO ACCESS TOKEN - stopping'); return; }
  console.log('ACCESS TOKEN ACQUIRED (len ' + (access||'').length + ')');

  // test a set of previously-500 endpoints WITH auth
  const authEndpoints = [
    ['GET', '/restaurant/subscription/1'],
    ['GET', '/customer/subscription/1'],
    ['GET', '/finance/platform-fee'],
    ['GET', '/finance/accounting/journal-entries'],
    ['GET', '/marketing/campaigns/1'],
    ['GET', '/admin/tenants/1'],
    ['GET', '/wallet/balance'],
    ['GET', '/wallet/transactions'],
  ];
  for (const [m, p] of authEndpoints) {
    const opts = { method: m, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + access } };
    const r = await fetch(BASE + p, opts);
    const txt = await r.text();
    let msg = txt; try { msg = JSON.parse(txt).message || JSON.stringify(JSON.parse(txt)).slice(0,120); } catch(e){}
    console.log(`[AUTH] ${r.status} ${m} ${p} :: ${String(msg).slice(0,140)}`);
  }
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
