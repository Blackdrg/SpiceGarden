const { chromium } = require('playwright');

const routes = ['/', '/history', '/login', '/orders', '/privacy', '/terms', '/callback', '/mfa-disable', '/profile', '/restaurants', '/search', '/cart'];
const viewports = [
  { name: 'mobile', width: 375, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

(async () => {
  const browser = await chromium.launch();
  let totalConsole = 0, totalPage = 0, totalNested = 0;
  const failures = [];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => pageErrors.push(e.message));

    for (const r of routes) {
      consoleErrors.length = 0; pageErrors.length = 0;
      try {
        await page.goto('http://localhost:3002' + r, { waitUntil: 'networkidle', timeout: 25000 });
      } catch (e) { /* navigation errors ignored */ }

      const nested = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.filter((b) => b.querySelector('button')).length;
      }).catch(() => 0);

      const hydrationErr = consoleErrors.some((e) => /Hydration failed|did not match|Invalid HTML/.test(e))
        || pageErrors.some((e) => /Hydration|did not match/.test(e));

      const realConsole = consoleErrors.filter((e) => !/Failed to load resource.*404/.test(e));
      if (nested > 0) { failures.push(`${vp.name} ${r}: ${nested} nested button(s)`); totalNested += nested; }
      if (hydrationErr) failures.push(`${vp.name} ${r}: hydration mismatch`);
      if (realConsole.length) { failures.push(`${vp.name} ${r}: console ${realConsole.slice(0,2).join(' | ')}`); totalConsole += realConsole.length; }
      if (pageErrors.length) { failures.push(`${vp.name} ${r}: pageerror ${pageErrors.slice(0,2).join(' | ')}`); totalPage += pageErrors.length; }
    }
    await page.close();
  }

  console.log('TOTAL nested buttons:', totalNested);
  console.log('TOTAL console errors (non-404):', totalConsole);
  console.log('TOTAL page errors:', totalPage);
  console.log('FAILURES:', failures.length ? '\n' + failures.join('\n') : 'NONE');
  await browser.close();
})();
