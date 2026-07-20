const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));

  const base = 'http://localhost:3002';
  const routes = ['/', '/history', '/login', '/orders', '/privacy', '/terms', '/callback', '/mfa-disable', '/mfadisable'];

  console.log('=== ROUTE STATUS (curl-style) ===');
  for (const r of routes) {
    try {
      const resp = await page.goto(base + r, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const status = resp ? resp.status() : 'n/a';
      let nestedBtn = false;
      try {
        nestedBtn = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          return btns.some((b) => b.querySelector('button'));
        });
      } catch (e) {}
      console.log(`${r} -> ${status}${nestedBtn ? '  [NESTED-BUTTON]' : ''}`);
    } catch (e) {
      console.log(`${r} -> ERROR ${e.message.split('\n')[0]}`);
    }
  }

  console.log('\n=== CONSOLE ERRORS on / ===');
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  console.log(consoleErrors.length ? consoleErrors.join('\n') : '(none)');

  console.log('\n=== PAGE ERRORS on / ===');
  console.log(pageErrors.length ? pageErrors.join('\n') : '(none)');

  const homeNested = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.filter((b) => b.querySelector('button')).map((b) => b.outerHTML.slice(0, 200));
  });
  console.log('\n=== NESTED BUTTONS on / ===');
  console.log(homeNested.length ? homeNested.join('\n---\n') : '(none)');

  console.log('\n=== HISTORY PAGE ===');
  const hErrors = [];
  const hPageErrors = [];
  const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page2.on('console', (m) => { if (m.type() === 'error') hErrors.push(m.text()); });
  page2.on('pageerror', (e) => hPageErrors.push(e.message));
  await page2.goto(base + '/history', { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await page2.waitForTimeout(1500);
  console.log('console errors:', hErrors.length ? hErrors.join('\n') : '(none)');
  console.log('page errors:', hPageErrors.length ? hPageErrors.join('\n') : '(none)');

  await browser.close();
})();
