const BASE = 'http://localhost:3001';
const j = (r) => r.text().then(t => { try { return JSON.parse(t); } catch (e) { return t; } });
(async () => {
  const log = [];
  const email = 'wf_' + Date.now() + '@t.com';
  const phone = '+9199' + String(Date.now()).slice(-8);
  // 1 Register
  let r = await fetch(BASE + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: 'WF', email, password: 'Password123!', phone }) });
  let reg = await j(r); const tok = reg.access_token;
  log.push(['register', r.status, tok ? 'OK' : 'NO TOKEN']);
  const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok };
  // 2 login
  r = await fetch(BASE + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Password123!' }) });
  log.push(['login', r.status, (await j(r)).access_token ? 'OK' : 'FAIL']);
  // 3 me
  r = await fetch(BASE + '/auth/me', { headers: H });
  log.push(['auth/me', r.status, (await j(r)).email === email ? 'OK' : 'FAIL']);
  // 4 search
  r = await fetch(BASE + '/restaurants/search?q=a', { headers: H });
  log.push(['search', r.status, (await j(r)).constructor === Array ? 'OK[]' : 'FAIL']);
  // 5 restaurants list
  r = await fetch(BASE + '/restaurants', { headers: H });
  log.push(['restaurants', r.status, '']);
  // 6 wallet balance
  r = await fetch(BASE + '/wallet/balance', { headers: H });
  log.push(['wallet/balance', r.status, (await j(r)).balance !== undefined ? 'OK' : 'FAIL']);
  // 7 wallet transactions
  r = await fetch(BASE + '/wallet/transactions', { headers: H });
  log.push(['wallet/tx', r.status, (await j(r)).constructor === Array ? 'OK[]' : 'FAIL']);
  // 8 create order (expect fail - no cart/items, but check it doesn't 500 unexpectedly)
  r = await fetch(BASE + '/orders', { method: 'POST', headers: H, body: JSON.stringify({ items: [], restaurantId: '1' }) });
  log.push(['orders POST', r.status, '']);
  // 9 get order
  r = await fetch(BASE + '/orders/1', { headers: H });
  log.push(['orders GET/1', r.status, 'broken-if-500']);
  // 10 payment-methods
  r = await fetch(BASE + '/payment-methods', { headers: H });
  log.push(['payment-methods', r.status, 'broken-if-500']);
  // 11 subscriptions
  r = await fetch(BASE + '/customer/subscription/1', { headers: H });
  log.push(['cust-sub/1', r.status, 'broken-if-500']);
  // 12 mfa status
  r = await fetch(BASE + '/mfa/status', { headers: H });
  log.push(['mfa/status', r.status, '']);
  log.forEach(l => console.log(l.join('  ')));
})().catch(e => console.error('FATAL', e.message));
