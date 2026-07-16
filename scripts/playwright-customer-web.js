const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:3002';
const pages = [
  '/', '/auth', '/reset-password', '/search', '/restaurant', '/cart', '/checkout',
  '/profile', '/wallet', '/orders', '/order-details', '/tracking', '/notifications',
  '/offers', '/subscriptions', '/addresses', '/menu', '/mfa-setup', '/MfaDisable',
  '/legal', '/history', '/payment-methods'
];
const apiRoutes = [
  '/api/restaurants', '/api/categories', '/api/menu', '/api/offers', '/api/wallet',
  '/api/business/restaurants', '/api/customer/subscription'
];
const shotDir = 'D:/SpiceGarden/audit-screenshots/customer-web';
fs.mkdirSync(shotDir, { recursive: true });
const out = [];
const withTimeout = (p, ms, label) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT ' + label)), ms))]);

function finish() {
  fs.writeFileSync('D:/SpiceGarden/scripts/customer-web-audit.json', JSON.stringify(out, null, 2));
  console.log('DONE. count=' + out.length + ' -> scripts/customer-web-audit.json');
}
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  for (const p of pages) {
    const pageErrors = [], consoleErrors = [], consoleWarnings = [], failedReqs = [];
    let browser2;
    try {
      const page = await ctx.newPage();
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); if (m.type() === 'warning') consoleWarnings.push(m.text()); });
      page.on('pageerror', e => pageErrors.push(e.message));
      page.on('requestfailed', r => failedReqs.push(r.url()));
      let status = 'unknown', whiteScreen = false;
      try {
        const resp = await withTimeout(page.goto(BASE + p, { waitUntil: 'commit', timeout: 8000 }), 9000, 'goto');
        status = resp ? resp.status() : 'no-response';
        await withTimeout(page.waitForTimeout(1500), 2000, 'wait');
        const bodyLen = await withTimeout(page.evaluate(() => document.body ? document.body.innerText.length : 0), 3000, 'eval').catch(() => 0);
        const html = await withTimeout(page.content(), 3000, 'content').catch(() => '');
        whiteScreen = bodyLen < 5 || /Application error|Internal Server Error/.test(html);
        const name = (p.replace(/\//g, '_') || '_root') + (whiteScreen ? '_WHITESCREEN' : '');
        await withTimeout(page.screenshot({ path: `${shotDir}/${name}.png` }), 4000, 'shot').catch(() => {});
      } catch (e) { status = 'EXC:' + e.message.slice(0, 50); }
      const verdict = pageErrors.length || consoleErrors.length ? 'FAIL' : (whiteScreen ? 'FAIL' : 'PASS');
      out.push({ route: p, status, verdict, pageErrors: pageErrors.slice(0, 2), consoleErrors: consoleErrors.slice(0, 3), consoleWarnings: consoleWarnings.slice(0, 3), failedReqs: failedReqs.slice(0, 5) });
      console.log(`${verdict} ${status} ${p} pe=${pageErrors.length} ce=${consoleErrors.length} fe=${failedReqs.length} ${pageErrors[0] || consoleErrors[0] || ''}`);
      await page.close().catch(() => {});
    } catch (e) { out.push({ route: p, status: 'FATAL:' + e.message, verdict: 'FAIL' }); console.log('FATAL ' + p + ' ' + e.message); }
  }
  for (const a of apiRoutes) {
    try {
      const r = await fetch(BASE + a);
      const txt = await r.text();
      let parsed; try { parsed = JSON.parse(txt); } catch (e) { parsed = txt.slice(0, 100); }
      out.push({ route: a, status: r.status, type: 'api', body: typeof parsed === 'string' ? parsed : JSON.stringify(parsed).slice(0, 200) });
      console.log(`API ${r.status} ${a} -> ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed).slice(0,120)}`);
    } catch (e) { out.push({ route: a, status: 'EXC', type: 'api', body: e.message }); console.log(`API EXC ${a} :: ${e.message}`); }
  }
  await browser.close();
  finish();
})().catch(e => { console.error('FATAL', e.message); finish(); process.exit(1); });
