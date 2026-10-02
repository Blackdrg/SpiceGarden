// infra/load-tests/1m/workloads/cart.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runCart(tenant, user, items) {
  const item = items[Math.floor(Math.random() * items.length)];
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  const payload = JSON.stringify({
    tenantId: tenant.tenantId,
    userId: user.userId,
    items: [
      { itemId: item.itemId, quantity: 2, price: item.price }
    ]
  });

  const res = http.post(`${CONFIG.baseUrl}/cart/validate`, payload, {
    headers: headers,
    tags: { scenario: 'cart', endpoint: '/cart/validate' }
  });

  check(res, {
    'cart validate 200': (r) => r.status === 200 || r.status === 201
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
