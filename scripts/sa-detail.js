const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext()).newPage();
  const ce = [], pe = [], failed = [];
  page.on('console', m => { if (m.type()==='error') ce.push(m.text()); });
  page.on('pageerror', e => pe.push(e.message));
  page.on('requestfailed', r => failed.push(r.url()+' :: '+(r.failure()&&r.failure().errorText)));
  page.on('response', r => { if (r.status()>=400) failed.push(r.status()+' '+r.url()); });
  await page.goto('http://localhost:3003/', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(e=>console.log('goto',e.message));
  await page.waitForTimeout(2000);
  console.log('super-admin / pageErrors:', pe);
  console.log('consoleErrors:', ce.slice(0,6));
  console.log('failedRequests:', failed.slice(0,10));
  await b.close();
})();
