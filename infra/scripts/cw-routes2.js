const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const base = 'http://localhost:3002';

  for (const r of ['/terms', '/callback', '/mfa-disable', '/mfadisable']) {
    try {
      const resp = await page.goto(base + r, { waitUntil: 'networkidle', timeout: 25000 });
      const status = resp ? resp.status() : 'n/a';
      const url = page.url();
      const title = await page.title().catch(() => '');
      console.log(`${r} -> status=${status} finalUrl=${url} title="${title}"`);
    } catch (e) {
      console.log(`${r} -> ERROR ${e.message.split('\n')[0]}`);
    }
  }

  // Terms: check raw response (follow redirect manually)
  const resp = await page.goto(base + '/terms', { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => null);
  console.log('terms raw status:', resp && resp.status());

  await browser.close();
})();
