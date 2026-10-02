// infra/load-tests/1m/workloads/tracking.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runTracking(tenant, user) {
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  const res = http.get(`${CONFIG.baseUrl}/orders/active/track?userId=${user.userId}`, {
    headers: headers,
    tags: { scenario: 'tracking', endpoint: '/orders/active/track' }
  });

  check(res, {
    'tracking status 200': (r) => r.status === 200
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
