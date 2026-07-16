const http = require('http');
function call(method, path, body, token) {
  return new Promise((res) => {
    const data = body ? JSON.stringify(body) : null;
    const o = { method, host: '127.0.0.1', port: 3001, path, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } };
    if (token) o.headers['Authorization'] = 'Bearer ' + token;
    if (data) o.headers['Content-Length'] = Buffer.byteLength(data);
    const r = http.request(o, x => { let d = ''; x.on('data', c => d += c); x.on('end', () => res({ status: x.statusCode, body: d })); });
    r.on('error', e => res({ status: 0, body: e.message }));
    if (data) r.write(data);
    r.end();
  });
}
async function main() {
  const email = 'audit_11db5859' + '@test.com';
  const reg = await call('POST', '/auth/register', { fullName: 'Audit User', email, password: 'Passw0rd!123', phone: '+919999999999' });
  const b = JSON.parse(reg.body || '{}');
  const token = b.accessToken || (b.data && b.data.accessToken);
  const userId = b.user && b.user.id || (b.data && b.data.user && b.data.user.id);
  console.log('REGISTER', reg.status, 'token?', !!token);
  if (!token) { console.log(reg.body); return; }
  const me = await call('GET', '/auth/me', null, token);
  console.log('AUTH/ME', me.status);
  const sub = await call('GET', '/customer/subscription/' + userId, null, token);
  console.log('CUSTOMER_SUB_BY_ID', sub.status, sub.body.slice(0, 100));
  const subBen = await call('GET', '/customer/subscription/' + userId + '/benefits', null, token);
  console.log('CUSTOMER_SUB_BENEFITS', subBen.status, subBen.body.slice(0, 100));
  const rest = await call('GET', '/restaurant/subscription/' + userId, null, token);
  console.log('REST_SUB_BY_ID', rest.status, rest.body.slice(0, 100));
  const feat = await call('GET', '/restaurant/subscription/' + userId + '/feature/delivery', null, token);
  console.log('REST_SUB_FEATURE', feat.status, feat.body.slice(0, 100));
  // journal / accounting
  const tb = await call('GET', '/finance/accounting/trial-balance', null, token);
  console.log('TRIAL_BALANCE', tb.status, tb.body.slice(0, 120));
  const pl = await call('GET', '/finance/accounting/profit-loss', null, token);
  console.log('PROFIT_LOSS', pl.status, pl.body.slice(0, 120));
  const feeCalc = await call('POST', '/finance/platform-fee/calculate', { amount: 100, feeType: 'percentage', applicableTo: 'order' }, token);
  console.log('FEE_CALC', feeCalc.status, feeCalc.body.slice(0, 120));
  const bank = await call('GET', '/finance/bank-accounts/kyc/pending', null, token);
  console.log('BANK_KYC_PENDING', bank.status, bank.body.slice(0, 80));
}
main();
