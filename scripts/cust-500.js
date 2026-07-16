const BASE = 'http://localhost:3001';
(async () => {
  const email = 'cust_' + Date.now() + '@t.com';
  const phone = '+9199' + String(Date.now()).slice(-8);
  const reg = await fetch(BASE + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: 'C', email, password: 'Password123!', phone }) });
  const j = await reg.json();
  const token = j.access_token;
  const eps = ['/orders/1','/mfa/setup','/customer/subscription/1','/refunds/1','/user/addresses/1','/payment-methods','/mfa/enable'];
  for (const p of eps) {
    const r = await fetch(BASE + p, { method: p.includes('mfa/setup')||p.includes('payment-methods')||p.includes('addresses') ? 'GET':'GET', headers: { Authorization: 'Bearer ' + token } });
    const t = await r.text();
    console.log(r.status, p, '::', t.slice(0, 160));
  }
})().catch(e=>console.error(e.message));
