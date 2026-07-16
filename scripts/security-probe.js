const BASE = 'http://localhost:3001';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const out = [];
  // 1. SQL injection attempt in search
  const sqli = await fetch(BASE + "/restaurants/search?q=' OR '1'='1");
  out.push({ test: 'SQLi-search', status: sqli.status, note: 'typeorm parameterized -> expect 200 safe' });
  // 2. XSS in a free-text field (login email / register) - check for reflection/stored
  const xssReg = await fetch(BASE + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: '<script>alert(1)</script>', email: 'xss_' + Date.now() + '@t.com', password: 'Password123!', phone: '+9199' + String(Date.now()).slice(-8) }) });
  out.push({ test: 'XSS-register-fullName', status: xssReg.status, note: 'input validation should reject or sanitize' });
  // 3. Rate limiting: hit login 30x rapidly
  let rlStatuses = {};
  for (let i = 0; i < 30; i++) {
    const r = await fetch(BASE + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'rate@test.com', password: 'wrong' }) });
    rlStatuses[r.status] = (rlStatuses[r.status] || 0) + 1;
  }
  out.push({ test: 'rate-limit-login-x30', statuses: rlStatuses, note: 'expect 429 after threshold' });
  // 4. JWT with tampered signature
  const tampered = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0.tampered';
  const jwtTest = await fetch(BASE + '/admin/dashboard', { headers: { Authorization: 'Bearer ' + tampered } });
  out.push({ test: 'JWT-tampered-signature', status: jwtTest.status, note: 'expect 401' });
  // 5. No token on protected
  const noTok = await fetch(BASE + '/admin/dashboard');
  out.push({ test: 'no-token-admin', status: noTok.status, note: 'expect 401' });
  // 6. IDOR attempt: access another user's wallet with token for different user
  out.forEach(o => console.log(JSON.stringify(o)));
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
