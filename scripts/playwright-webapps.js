const { chromium } = require('playwright');
const fs = require('fs');
const apps = [
  { name: 'super-admin', port: 3003, routes: ['/', '/dashboard', '/login', '/users', '/restaurants', '/orders', '/drivers', '/payments', '/reports', '/settings'] },
  { name: 'restaurant-dashboard', port: 3004, routes: ['/', '/login', '/dashboard', '/menu', '/orders', '/analytics', '/settings'] },
];
const out = {};
(async () => {
  const b = await chromium.launch();
  for (const app of apps) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
    out[app.name] = [];
    for (const r of app.routes) {
      const page = await ctx.newPage();
      const pe = [], ce = [];
      page.on('pageerror', e => pe.push(e.message));
      page.on('console', m => { if (m.type() === 'error') ce.push(m.text()); });
      let status = '?';
      try { const resp = await page.goto(`http://localhost:${app.port}${r}`, { waitUntil: 'domcontentloaded', timeout: 10000 }); status = resp ? resp.status() : 'no'; await page.waitForTimeout(1000); } catch (e) { status = 'EXC'; }
      const verdict = pe.length || ce.length ? 'FAIL' : 'PASS';
      out[app.name].push({ route: r, status, verdict, pe: pe.slice(0,1), ce: ce.slice(0,2) });
      console.log(`${app.name} ${verdict} ${status} ${r} pe=${pe.length} ce=${ce.length} ${pe[0]||ce[0]||''}`);
      await page.close();
    }
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync('D:/SpiceGarden/scripts/webapps-audit.json', JSON.stringify(out, null, 2));
  console.log('DONE -> scripts/webapps-audit.json');
})().catch(e => { console.error('FATAL', e.message); fs.writeFileSync('D:/SpiceGarden/scripts/webapps-audit.json', JSON.stringify(out, null, 2)); process.exit(1); });
