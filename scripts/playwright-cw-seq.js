const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:3002';
const pages = [
  '/', '/auth', '/reset-password', '/search', '/restaurant', '/cart', '/checkout',
  '/profile', '/wallet', '/orders', '/order-details', '/tracking', '/notifications',
  '/offers', '/subscriptions', '/addresses', '/menu', '/mfa-setup', '/mfa-disable',
  '/legal', '/history', '/payment-methods', '/login', '/privacy', '/terms', '/callback'
];
const shotDir = 'D:/SpiceGarden/audit-screenshots/customer-web';
fs.mkdirSync(shotDir, { recursive: true });
const out = [];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  for (const p of pages) {
    const pageErrors = [], consoleErrors = [], consoleWarnings = [], failedReqs = [];
    let status = 'unknown', whiteScreen = false;
    let page;
    try {
      page = await ctx.newPage();
      page.on('console', m => { 
        if (m.type() === 'error') consoleErrors.push(m.text()); 
        if (m.type() === 'warning') consoleWarnings.push(m.text()); 
      });
      page.on('pageerror', e => pageErrors.push(e.message));
      page.on('requestfailed', r => failedReqs.push(r.url()));
      const resp = await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
      status = resp ? resp.status() : 'no-response';
      await page.waitForTimeout(2000);
      const bodyLen = await page.evaluate(() => document.body ? document.body.innerText.length : 0).catch(() => 0);
      const html = await page.content().catch(() => '');
      whiteScreen = bodyLen < 5 || /Application error|Internal Server Error/.test(html);
      const name = (p.replace(/\//g, '_') || '_root') + (whiteScreen ? '_WHITESCREEN' : '');
      await page.screenshot({ path: `${shotDir}/${name}.png` }).catch(() => {});
    } catch (e) { status = 'EXC:' + e.message.slice(0, 50); }
    const verdict = pageErrors.length || consoleErrors.length ? 'FAIL' : (whiteScreen ? 'FAIL' : 'PASS');
    out.push({ route: p, status, verdict, pageErrors: pageErrors.slice(0, 2), consoleErrors: consoleErrors.slice(0, 3), consoleWarnings: consoleWarnings.slice(0, 3), failedReqs: failedReqs.slice(0, 5) });
    console.log(`${verdict} ${status} ${p} pe=${pageErrors.length} ce=${consoleErrors.length} fe=${failedReqs.length} ${pageErrors[0] || consoleErrors[0] || ''}`);
    if (page) await page.close().catch(() => {});
  }
  await browser.close();
  fs.writeFileSync('D:/SpiceGarden/scripts/customer-web-audit-new.json', JSON.stringify(out, null, 2));
  console.log('DONE. count=' + out.length);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
