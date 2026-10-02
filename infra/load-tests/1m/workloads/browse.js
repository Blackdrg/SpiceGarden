// infra/load-tests/1m/workloads/browse.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runBrowse(tenant, user, restaurants) {
  const rest = restaurants[Math.floor(Math.random() * restaurants.length)];
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  // 1. Fetch Restaurant Catalog
  const resCatalog = http.get(`${CONFIG.baseUrl}/restaurants?tenantId=${tenant.tenantId}&limit=20`, {
    headers: headers,
    tags: { scenario: 'browse', endpoint: '/restaurants' }
  });
  check(resCatalog, {
    'catalog status 200': (r) => r.status === 200,
    'catalog has data': (r) => r.body && r.body.length > 0
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);

  // 2. Fetch Restaurant Menu
  const resMenu = http.get(`${CONFIG.baseUrl}/restaurants/${rest.restaurantId}/menu`, {
    headers: headers,
    tags: { scenario: 'browse', endpoint: '/restaurants/:id/menu' }
  });
  check(resMenu, {
    'menu status 200': (r) => r.status === 200
  });
}
