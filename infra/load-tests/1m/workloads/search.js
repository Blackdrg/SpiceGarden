// infra/load-tests/1m/workloads/search.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

const SEARCH_TERMS = ['biryani', 'curry', 'paneer', 'tikka', 'dosa', 'naan', 'pizza', 'burger', 'kebab', 'thali'];

export function runSearch(tenant, user) {
  const query = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  const res = http.get(`${CONFIG.baseUrl}/search/dishes?query=${query}&tenantId=${tenant.tenantId}&limit=15`, {
    headers: headers,
    tags: { scenario: 'search', endpoint: '/search/dishes' }
  });

  check(res, {
    'search status 200': (r) => r.status === 200
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
