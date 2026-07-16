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
function rand() { return Math.floor(Math.random() * 1e9); }
async function main() {
  const email = 'wf' + rand() + '@nowhere.io';
  const phone = '+9198' + (rand() % 10000000);
  const reg = await call('POST', '/auth/register', { fullName: 'WF User', email, password: 'Passw0rd!123', phone });
  const b = JSON.parse(reg.body || '{}');
  const token = b.access_token || b.accessToken;
  const userId = b.user && b.user.id;
  console.log('REGISTER', reg.status, 'token?', !!token, 'uid?', !!userId);
  if (!token) { console.log(reg.body); return; }
  const me = await call('GET', '/auth/me', null, token); console.log('AUTH_ME', me.status);
  const sub = await call('GET', '/customer/subscription/' + userId, null, token); console.log('CUST_SUB_BY_ID', sub.status, sub.body.slice(0, 60));
  const subBen = await call('GET', '/customer/subscription/' + userId + '/benefits', null, token); console.log('CUST_SUB_BEN', subBen.status);
  const rest = await call('GET', '/restaurant/subscription/' + userId, null, token); console.log('REST_SUB_BY_ID', rest.status);
  const tb = await call('GET', '/finance/accounting/trial-balance', null, token); console.log('TRIAL_BALANCE', tb.status, tb.body.slice(0, 80));
  const pl = await call('GET', '/finance/accounting/profit-loss', null, token); console.log('PROFIT_LOSS', pl.status);
  const feeCalc = await call('POST', '/finance/platform-fee/calculate', { amount: 100, feeType: 'percentage', applicableTo: 'order' }, token); console.log('FEE_CALC', feeCalc.status, feeCalc.body.slice(0, 80));
  const createFee = await call('POST', '/finance/platform-fee', { name: 'Svc', feeType: 'percentage', applicableTo: 'order', feePercentage: 5 }, token); console.log('FEE_CREATE', createFee.status, createFee.body.slice(0, 80));
  const bankPending = await call('GET', '/finance/bank-accounts/kyc/pending', null, token); console.log('BANK_KYC_PENDING', bankPending.status);
  const journal = await call('POST', '/finance/accounting/journal', { transactionId: 'txn' + rand(), entryDate: new Date().toISOString(), accountCode: '1000', accountName: 'Cash', accountType: 'asset', debitAmount: 10, creditAmount: 10, description: 'test' }, token); console.log('JOURNAL_POST', journal.status, journal.body.slice(0, 100));
  const settle = await call('POST', '/finance/settlements', { settlementType: 'restaurant', gateway: 'stripe', gatewayBatchId: 'b' + rand(), totalAmount: 100, netAmount: 95, settlementDate: new Date().toISOString().slice(0, 10), restaurantId: 'r1' }, token); console.log('SETTLEMENT_POST', settle.status, settle.body.slice(0, 100));
  const campaign = await call('POST', '/marketing/campaigns', { name: 'C', campaignType: 'promo', billingModel: 'flat', budget: 100, spentBudget: 0, startDate: new Date().toISOString().slice(0, 10), endDate: '2030-01-01' }, token); console.log('CAMPAIGN_POST', campaign.status, campaign.body.slice(0, 100));
  const deliveryCalc = await call('GET', '/delivery/pricing/calculate?distanceKm=5', null, token); console.log('DELIVERY_CALC', deliveryCalc.status);
  const rulePost = await call('POST', '/delivery/pricing/rules', { ruleType: 'distance', name: 'R', pricingType: 'fixed', basePrice: 20 }, token); console.log('RULE_POST', rulePost.status, rulePost.body.slice(0, 80));
}
main();
