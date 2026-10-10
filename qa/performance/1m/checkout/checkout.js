import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 500 },
    { duration: '45s', target: 2500 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const payload = JSON.stringify({
    restaurantId: 'rest-checkout-001',
    items: [
      { id: 'item-chk-1', name: 'Butter Chicken', price: 280, quantity: 1 },
      { id: 'item-chk-2', name: 'Garlic Naan', price: 40, quantity: 2 },
    ],
    subtotal: 360,
    tax: 18,
    deliveryFee: 40,
    grandTotal: 418,
  });

  const res = http.post(`${BASE_URL}/orders`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': `chk-ord-${__VU}-${__ITER}`,
    },
  });

  check(res, {
    'checkout responds validly': (r) =>
      r.status === 201 || r.status === 200 || r.status === 400 || r.status === 401 || r.status === 409,
  });

  sleep(0.05);
}
