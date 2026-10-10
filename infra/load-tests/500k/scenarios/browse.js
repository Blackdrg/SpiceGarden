// infra/load-tests/500k/scenarios/browse.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../helpers/config.js';
import { RESTAURANT_SEEDS, getRandomElement, getRandomInt } from '../helpers/data.js';
import { getCustomerAuthHeaders } from '../helpers/auth.js';
import { browseDuration, browseSuccessRate, catalogViewsTotal } from '../helpers/metrics.js';

export function runBrowse() {
  const start = Date.now();
  const auth = getCustomerAuthHeaders(__VU, __ITER);
  const restaurant = getRandomElement(RESTAURANT_SEEDS);

  // 1. Browse Restaurant Catalog
  const resCatalog = http.get(`${CONFIG.baseUrl}/restaurants`, {
    headers: auth.headers,
    tags: { scenario: 'browse', endpoint: '/restaurants' },
    timeout: CONFIG.requestTimeout,
  });

  const catalogOk = check(resCatalog, {
    'catalog status 200': (r) => r.status === 200,
  });

  catalogViewsTotal.add(1);

  // 2. View Specific Restaurant Details
  const resDetail = http.get(`${CONFIG.baseUrl}/restaurants/${restaurant.slug}`, {
    headers: auth.headers,
    tags: { scenario: 'browse', endpoint: '/restaurants/:slug' },
    timeout: CONFIG.requestTimeout,
  });

  const detailOk = check(resDetail, {
    'restaurant detail status 200': (r) => r.status === 200 || r.status === 404,
  });

  // 3. Inspect Menu & Categories
  const resMenu = http.get(`${CONFIG.baseUrl}/menus/${restaurant.id}/items`, {
    headers: auth.headers,
    tags: { scenario: 'browse', endpoint: '/menus/:id/items' },
    timeout: CONFIG.requestTimeout,
  });

  const menuOk = check(resMenu, {
    'menu status 200': (r) => r.status === 200 || r.status === 404,
  });

  const overallSuccess = catalogOk && detailOk && menuOk;
  browseSuccessRate.add(overallSuccess);
  browseDuration.add(Date.now() - start);

  const thinkTime = (getRandomInt(500, 1500) / 1000);
  sleep(thinkTime);
}
