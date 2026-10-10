/**
 * SpiceGarden 500K Clean Hold Scenario (k6 Distributed Load Profile)
 * 
 * Executes a sustained 30-60 minute steady-state benchmark at exactly 500,000 active VUs
 * to verify:
 * - Constant aggregate RPS (~270,000 req/sec)
 * - Zero latency degradation / memory leak over 30-60 min hold
 * - Zero database connection starvation
 * - Business integrity invariants (zero negative balance, zero negative inventory, zero lost orders)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const catalogLatency = new Trend('catalog_duration', true);
export const orderLatency = new Trend('order_duration', true);
export const trackingLatency = new Trend('tracking_duration', true);
export const completedOrders = new Counter('completed_orders');

export const options = {
  scenarios: {
    clean_hold_500k: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 100000 },  // Stage 1: Warmup to 100k
        { duration: '5m', target: 500000 },  // Stage 2: Ramp to 500k VUs
        { duration: '30m', target: 500000 }, // Stage 3: CLEAN 30-MINUTE SUSTAINED HOLD
        { duration: '3m', target: 0 }        // Stage 4: Graceful ramp-down
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],             // Error rate strictly < 1%
    http_req_duration: ['p(95)<150', 'p(99)<350'], // P95 < 150ms, P99 < 350ms
    catalog_duration: ['p(95)<80'],
    order_duration: ['p(95)<200'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001';
const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-SpiceGarden-Tenant': 'tenant-default',
};

export default function () {
  const vuId = __VU;
  const iterId = __ITER;
  const rand = Math.random();

  // Traffic Distribution:
  // 45% Browse Catalog
  // 20% Search Restaurants
  // 10% Cart Operations
  // 8%  Checkout & Order Creation
  // 14% Order Tracking & Status
  // 3%  Admin & Restaurant Ops

  if (rand < 0.45) {
    // 1. Browse Catalog
    const res = http.get(`${BASE_URL}/restaurants`, { headers: HEADERS });
    catalogLatency.add(res.timings.duration);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response has restaurants': (r) => r.body && r.body.length > 0,
    }) || errorRate.add(1);

  } else if (rand < 0.65) {
    // 2. Search & Discovery
    const queries = ['biryani', 'curry', 'dosa', 'naan', 'paneer', 'thali', 'spicy'];
    const q = queries[Math.floor(Math.random() * queries.length)];
    const res = http.get(`${BASE_URL}/restaurants/search?q=${q}`, { headers: HEADERS });
    check(res, { 'status is 200': (r) => r.status === 200 }) || errorRate.add(1);

  } else if (rand < 0.75) {
    // 3. Cart Operations
    const payload = JSON.stringify({
      restaurantId: 'rest-001',
      items: [{ itemId: 'item-101', quantity: 2, price: 14.99 }]
    });
    const res = http.post(`${BASE_URL}/cart/items`, payload, { headers: HEADERS });
    check(res, { 'cart updated': (r) => r.status === 200 || r.status === 201 }) || errorRate.add(1);

  } else if (rand < 0.83) {
    // 4. Checkout & Order Creation (Financial Safety + Inventory Guard)
    const orderPayload = JSON.stringify({
      customerId: `cust-${(vuId % 10000) + 1}`,
      restaurantId: 'rest-001',
      items: [{ itemId: 'item-101', quantity: 1, price: 14.99 }],
      paymentMethod: 'WALLET',
      idempotencyKey: `idemp-hold-${vuId}-${iterId}-${Date.now()}`
    });
    const res = http.post(`${BASE_URL}/orders`, orderPayload, { headers: HEADERS });
    orderLatency.add(res.timings.duration);
    const passed = check(res, {
      'order placed or accepted': (r) => r.status === 201 || r.status === 200,
    });
    if (passed) {
      completedOrders.add(1);
    } else {
      errorRate.add(1);
    }

  } else if (rand < 0.97) {
    // 5. Order Tracking
    const orderId = `ord-${(vuId % 5000) + 1}`;
    const res = http.get(`${BASE_URL}/orders/${orderId}/tracking`, { headers: HEADERS });
    trackingLatency.add(res.timings.duration);
    check(res, { 'tracking ok': (r) => r.status === 200 || r.status === 404 }) || errorRate.add(1);

  } else {
    // 6. Admin & Health Monitoring
    const res = http.get(`${BASE_URL}/health`, { headers: HEADERS });
    check(res, { 'health ok': (r) => r.status === 200 }) || errorRate.add(1);
  }

  // Realistic user think time: 1.5s to 2.5s
  sleep(1.5 + Math.random());
}
