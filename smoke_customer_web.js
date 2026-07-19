const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('requestfailed', (req) => failedRequests.push(req.url() + ' :: ' + (req.failure()?.errorText || '')));

  const routes = ['/', '/auth', '/restaurants', '/checkout', '/tracking', '/profile', '/wallet', '/subscriptions', '/legal/privacy'];
  for (const route of routes) {
    try {
      const resp = await page.goto('http://localhost:3002' + route, { waitUntil: 'networkidle', timeout: 30000 });
      const status = resp ? resp.status() : 'NO_RESP';
      const text = await page.evaluate(() => document.body ? document.body.innerText.trim().slice(0, 80) : '(no body)');
      const hasContent = text.length > 0;
      console.log(`ROUTE ${route} STATUS=${status} BLANK=${!hasContent} TEXT=[${text.replace(/\n/g,' ')}]`);
    } catch (e) {
      console.log(`ROUTE ${route} ERROR=${e.message.slice(0,120)}`);
    }
  }
  console.log('CONSOLE_ERRORS=' + consoleErrors.length);
  consoleErrors.slice(0, 10).forEach((e) => console.log('  CE: ' + e.slice(0, 160)));
  console.log('PAGE_ERRORS=' + pageErrors.length);
  pageErrors.slice(0, 10).forEach((e) => console.log('  PE: ' + e.slice(0, 160)));
  console.log('FAILED_REQUESTS=' + failedRequests.length);
  failedRequests.slice(0, 10).forEach((e) => console.log('  FR: ' + e.slice(0, 160)));
  await browser.close();
})();
