import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 1000 },
    { duration: '1m', target: 5000 },
    { duration: '2m', target: 10000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<100', 'p(99)<150'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const rand = Math.random() * 100;
  const headers = { 'Content-Type': 'application/json' };

  if (rand < 45) {
    // Browse (45%)
    const res = http.get(`${BASE_URL}/api/restaurants`);
    check(res, { 'browse status 200': (r) => r.status === 200 });
  } else if (rand < 65) {
    // Search (20%)
    const res = http.get(`${BASE_URL}/api/search?q=curry&lat=12.9716&lng=77.5946`);
    check(res, { 'search status 200': (r) => r.status === 200 });
  } else if (rand < 75) {
    // Cart (10%)
    const res = http.get(`${BASE_URL}/api/cart`);
    check(res, { 'cart status 200': (r) => r.status === 200 || r.status === 401 });
  } else if (rand < 83) {
    // Checkout (8%)
    const payload = JSON.stringify({
      restaurantId: 'rest-001',
      items: [{ id: 'item-001', quantity: 2, price: 150 }],
      grandTotal: 300,
    });
    const res = http.post(`${BASE_URL}/orders`, payload, {
      headers: Object.assign({}, headers, { 'Idempotency-Key': `k6-order-${__VU}-${__ITER}` }),
    });
    check(res, { 'order status valid': (r) => r.status === 201 || r.status === 400 || r.status === 401 || r.status === 409 });
  } else if (rand < 97) {
    // Tracking / Real-time telemetry (14%)
    const res = http.get(`${BASE_URL}/api/tracking/driver-001`);
    check(res, { 'tracking status valid': (r) => r.status === 200 || r.status === 404 });
  } else {
    // Admin (3%)
    const res = http.get(`${BASE_URL}/api/admin/metrics`);
    check(res, { 'admin status valid': (r) => r.status === 200 || r.status === 401 || r.status === 403 });
  }

  sleep(0.05);
}
