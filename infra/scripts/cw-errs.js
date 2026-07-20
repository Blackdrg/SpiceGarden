const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const r of ['/terms', '/callback', '/mfa-disable']) {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('http://localhost:3002' + r, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(500);
    const body = await page.evaluate(() => document.body.innerText.slice(0, 600)).catch(() => 'n/a');
    console.log(`\n=== ${r} ===`);
    console.log('pageerrors:', errors.join(' | ') || '(none)');
    console.log('body:', body.replace(/\n/g, ' ').slice(0, 300));
  }
  await browser.close();
})();
