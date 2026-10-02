// infra/load-tests/1m/workloads/admin.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runAdmin(tenant, user) {
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  const res = http.get(`${CONFIG.baseUrl}/admin/analytics/overview?tenantId=${tenant.tenantId}&timeRange=24h`, {
    headers: headers,
    tags: { scenario: 'admin', endpoint: '/admin/analytics/overview' }
  });

  check(res, {
    'admin analytics status 200': (r) => r.status === 200
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
