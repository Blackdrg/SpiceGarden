// infra/load-tests/500k/scenarios/admin.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../helpers/config.js';
import { RESTAURANT_SEEDS, getRandomElement, getRandomInt } from '../helpers/data.js';
import { getAdminAuthHeaders, getKitchenAuthHeaders } from '../helpers/auth.js';
import { adminDuration, adminSuccessRate } from '../helpers/metrics.js';

export function runAdmin() {
  const start = Date.now();
  const isAdmin = Math.random() < 0.5;
  const restaurant = getRandomElement(RESTAURANT_SEEDS);

  let overallSuccess = false;

  if (isAdmin) {
    // Admin Operations
    const auth = getAdminAuthHeaders(__VU);

    // 1. Fetch Admin Dashboard Analytics
    const resStats = http.get(`${CONFIG.baseUrl}/admin/stats`, {
      headers: auth.headers,
      tags: { scenario: 'admin', endpoint: '/admin/stats' },
      timeout: CONFIG.requestTimeout,
    });

    const statsOk = check(resStats, {
      'admin stats status ok': (r) => r.status === 200 || r.status === 403,
    });

    // 2. Fetch Active Admin Orders
    const resOrders = http.get(`${CONFIG.baseUrl}/admin/orders?page=1&limit=20`, {
      headers: auth.headers,
      tags: { scenario: 'admin', endpoint: '/admin/orders' },
      timeout: CONFIG.requestTimeout,
    });

    const ordersOk = check(resOrders, {
      'admin orders status ok': (r) => r.status === 200 || r.status === 403,
    });

    overallSuccess = statsOk && ordersOk;
  } else {
    // Kitchen Operations
    const auth = getKitchenAuthHeaders(__VU);

    // 1. Kitchen SLA Summary
    const resSla = http.get(`${CONFIG.baseUrl}/kitchen/sla/summary/${restaurant.branchId}?period=daily`, {
      headers: auth.headers,
      tags: { scenario: 'admin', endpoint: '/kitchen/sla/summary/:branchId' },
      timeout: CONFIG.requestTimeout,
    });

    const slaOk = check(resSla, {
      'kitchen sla status ok': (r) => r.status === 200 || r.status === 403,
    });

    // 2. Kitchen Low Stock Verification
    const resStock = http.get(`${CONFIG.baseUrl}/kitchen/inventory/low-stock/${restaurant.branchId}`, {
      headers: auth.headers,
      tags: { scenario: 'admin', endpoint: '/kitchen/inventory/low-stock/:branchId' },
      timeout: CONFIG.requestTimeout,
    });

    const stockOk = check(resStock, {
      'kitchen stock status ok': (r) => r.status === 200 || r.status === 403,
    });

    overallSuccess = slaOk && stockOk;
  }

  adminSuccessRate.add(overallSuccess);
  adminDuration.add(Date.now() - start);

  const thinkTime = (getRandomInt(1000, 2500) / 1000);
  sleep(thinkTime);
}
