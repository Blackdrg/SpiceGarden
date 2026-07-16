const BASE = 'http://localhost:3001';
const endpoints = [
  ['GET', '/restaurant/subscription/1'],
  ['GET', '/restaurant/subscription/1/feature/1'],
  ['GET', '/delivery/pricing/calculate'],
  ['POST', '/delivery/pricing/rules'],
  ['PUT', '/delivery/pricing/rules/1'],
  ['POST', '/finance/platform-fee'],
  ['PUT', '/finance/platform-fee/1'],
  ['POST', '/finance/accounting/journal'],
  ['GET', '/finance/accounting/trial-balance'],
  ['GET', '/finance/accounting/profit-loss'],
  ['POST', '/finance/bank-accounts'],
  ['GET', '/finance/bank-accounts/1'],
  ['PUT', '/finance/bank-accounts/1'],
  ['POST', '/finance/bank-accounts/1/kyc'],
  ['GET', '/finance/bank-accounts/kyc/pending'],
  ['POST', '/finance/settlements'],
  ['GET', '/finance/settlements/1'],
  ['GET', '/customer/subscription/1'],
  ['GET', '/customer/subscription/1/benefits'],
  ['POST', '/marketing/campaigns'],
  ['GET', '/marketing/campaigns/1'],
  ['GET', '/marketing/campaigns/platform/stats'],
  ['GET', '/admin/tenants/1'],
  ['PUT', '/admin/tenants/1'],
  ['POST', '/enterprise/api-keys'],
  ['GET', '/enterprise/api-keys/1/rate-limit'],
  ['POST', '/restaurant/subscription/upgrade'],
  ['POST', '/restaurant/subscription/cancel'],
  ['POST', '/marketing/campaigns/1/activate'],
  ['GET', '/marketing/campaigns/1/analytics'],
  ['POST', '/finance/settlements/1/process'],
  ['GET', '/finance/settlements/summary/1'],
  ['POST', '/customer/subscription/cancel'],
  ['PUT', '/admin/tenants/1/branding'],
  ['PUT', '/admin/tenants/1/settings'],
  ['POST', '/admin/tenants/1/suspend'],
  ['POST', '/enterprise/api-keys/1/revoke'],
];
(async () => {
  const out = [];
  for (const [m, p] of endpoints) {
    const opts = { method: m, headers: { 'Content-Type': 'application/json' } };
    if (['POST', 'PUT', 'PATCH'].includes(m)) opts.body = '{}';
    try {
      const r = await fetch(BASE + p, opts);
      const txt = await r.text();
      let msg = txt;
      try { msg = JSON.parse(txt).message || txt; } catch (e) {}
      out.push({ m, p, status: r.status, msg: String(msg).slice(0, 200) });
    } catch (e) { out.push({ m, p, status: 'ERR', msg: e.message }); }
  }
  for (const o of out) console.log(`${o.status} ${o.m} ${o.p} :: ${o.msg}`);
})();
