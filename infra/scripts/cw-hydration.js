const { chromium } = require('playwright');
const routes = ['/', '/history', '/restaurants', '/search'];
const viewports = [
  { name: 'mobile', width: 375, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];
(async () => {
  const browser = await chromium.launch();
  const failures = [];
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    for (const r of routes) {
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));
      try { await page.goto('http://localhost:3002' + r, { waitUntil: 'domcontentloaded', timeout: 20000 }); } catch (e) {}
      await page.waitForTimeout(800);
      const nested = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter((b) => b.querySelector('button')).length).catch(() => 0);
      const hydration = pageErrors.some((e) => /Hydration|did not match|didn't match/.test(e));
      if (nested > 0) failures.push(`${vp.name} ${r}: ${nested} nested button(s)`);
      if (hydration) failures.push(`${vp.name} ${r}: HYDRATION MISMATCH`);
      page.removeAllListeners();
    }
    await page.close();
  }
  console.log('FAILURES:', failures.length ? '\n' + failures.join('\n') : 'NONE');
  await browser.close();
})();
