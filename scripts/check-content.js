const { chromium } = require('playwright');
const BASE = 'http://localhost:3002';
const targets = ['/', '/addresses', '/tracking', '/subscriptions', '/checkout', '/wallet'];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  for (const p of targets) {
    const page = await ctx.newPage();
    let len = -1, hasContent = false;
    try {
      await page.goto(BASE + p, { waitUntil: 'commit', timeout: 8000 });
      await page.waitForTimeout(2500);
      len = await page.evaluate(() => document.body ? document.body.innerText.trim().length : 0).catch(() => -1);
      hasContent = await page.evaluate(() => /Restaurant|Menu|Order|Wallet|Subscription|Address|Track/i.test(document.body ? document.body.innerText : '')).catch(() => false);
    } catch (e) { console.log(p, 'EXC', e.message.slice(0,40)); }
    console.log(`${p}  innerTextLen=${len}  hasDomainContent=${hasContent}`);
    await page.close();
  }
  await b.close();
})();
