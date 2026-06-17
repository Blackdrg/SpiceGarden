import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const http_req_success = new Rate('http_req_success');
const order_errors = new Counter('order_errors');
const payment_errors = new Counter('payment_errors');

export const options = {
  scenarios: {
    baseline: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      exec: 'testBaseline',
      tags: { load: 'baseline' },
    },
    concurrent_100: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      exec: 'test100Users',
      tags: { load: '100' },
    },
    concurrent_500: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '2m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 0 },
      ],
      exec: 'test500Users',
      tags: { load: '500' },
    },
    concurrent_1000: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '3m', target: 1000 },
        { duration: '5m', target: 1000 },
        { duration: '3m', target: 0 },
      ],
      exec: 'test1000Users',
      tags: { load: '1000' },
    },
  },
  thresholds: {
    http_req_success: ['rate>0.95'],
    http_req_duration: ['p(95)<500'],
    'http_req_duration{load:baseline}': ['p(95)<300'],
    'http_req_duration{load:100}': ['p(95)<400'],
    'http_req_duration{load:500}': ['p(95)<500'],
    'http_req_duration{load:1000}': ['p(95)<800'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || 'test-token-123';

function generateUser(vu: number, iter: number) {
  const idx = `${vu}-${iter}`;
  return {
    email: `load${idx}@test.com`,
    password: 'Password123!',
    fullName: `Load User ${idx}`,
  };
}

function generateOrder(vu: number, iter: number) {
  const idx = `${vu}-${iter}`;
  const restaurantId = `rest-${(parseInt(idx) % 5) + 1}`;
  const itemPrice = 100 + (parseInt(idx) % 10) * 50;
  const quantity = 1 + (parseInt(idx) % 3);
  const subtotal = itemPrice * quantity;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = Math.round(subtotal * 0.10 * 100) / 100;
  const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  return {
    restaurantId,
    items: [{ itemId: `item-${(parseInt(idx) % 10) + 1}`, quantity, price: itemPrice }],
    deliveryAddressId: `addr-${(parseInt(idx) % 3) + 1}`,
    subtotal,
    tax,
    deliveryFee,
    grandTotal,
  };
}

export function testBaseline() {
  const user = generateUser(__VU, __ITER);

  group('Baseline - Health Check', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, { 'health is 200': (r) => r.status === 200 });
  });

  sleep(0.5);

  group('Baseline - List Restaurants', () => {
    const res = http.get(`${BASE_URL}/restaurants`);
    check(res, { 'restaurants listed': (r) => r.status === 200 });
  });

  sleep(1);
}

export function test100Users() {
  runUserFlow('100 Users', generateUser(__VU, __ITER), generateOrder(__VU, __ITER));
}

export function test500Users() {
  runUserFlow('500 Users', generateUser(__VU, __ITER), generateOrder(__VU, __ITER));
}

export function test1000Users() {
  runUserFlow('1000 Users', generateUser(__VU, __ITER), generateOrder(__VU, __ITER));
}

function runUserFlow(label: string, user: Record<string, string>, order: Record<string, unknown>) {
  group(`${label} - Signup`, () => {
    const payload = JSON.stringify(user);
    const res = http.post(`${BASE_URL}/auth/signup`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { type: 'auth' },
    });

    const success = check(res, {
      'signup ok': (r) => r.status === 201 || r.status === 200 || r.status === 409,
    });
    http_req_success.add(success);
    if (!success) order_errors.add(1);
  });

  sleep(0.5);

  group(`${label} - Login`, () => {
    const payload = JSON.stringify({ email: user.email, password: user.password });
    const res = http.post(`${BASE_URL}/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { type: 'auth' },
    });

    check(res, { 'login ok': (r) => r.status === 200 });
  });

  sleep(0.5);

  group(`${label} - Place Order`, () => {
    const payload = JSON.stringify(order);
    const res = http.post(`${BASE_URL}/orders`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      tags: { type: 'api' },
    });

    const success = check(res, { 'order placed': (r) => r.status === 201 });
    http_req_success.add(success);
    if (!success) order_errors.add(1);
  });

  sleep(1);
}
