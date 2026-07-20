const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto('http://localhost:3002/mfa-disable', { waitUntil: 'networkidle', timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1000);
  const body = await page.evaluate(() => document.body.innerText.slice(0, 800)).catch(() => 'n/a');
  console.log('PAGE ERRORS:', errors.join('\n') || '(none)');
  console.log('BODY:', body);
  await browser.close();
})();
