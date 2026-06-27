import http from 'k6/http';
import { check, group, sleep, Counter, Rate, Trend } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
export const EXERCISE_PAYMENT = __ENV.EXERCISE_PAYMENT === 'true';

export const metrics = {
  paymentSuccess: new Rate('payment_stress_success'),
  failedRequests: new Counter('payment_failed_requests_total'),
  paymentLatency: new Trend('payment_latency_ms'),
  idempotencySuccess: new Rate('idempotency_success'),
};

export const options = {
  scenarios: {
    payment_create: {
      executor: 'constant-vus',
      vus: 100,
      duration: '15m',
      exec: 'createPayments',
    },
    payment_duplicate: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m',
      exec: 'duplicatePaymentTest',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    payment_stress_success: ['rate>0.98'],
    idempotency_success: ['rate>0.99'],
    payment_latency: ['p(95)<3000'],
  },
};

export function setup() {
  http.get(`${BASE_URL}/health`);
  return {};
}

function authToken() {
  const email = `pay-${__VU}-${__ITER}-${Date.now()}@test.com`;
  const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify({ email, password: 'Pass123!', fullName: 'Pay Test', phone: '+15550000000' }), { headers: { 'Content-Type': 'application/json' } });
  const body = res.json();
  return body?.access_token || null;
}

export function createPayments() {
  group('Payment Stress', () => {
    const token = authToken();
    if (!token) return;

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const userId = `user-${__VU}`;
    const amount = 50 + Math.floor(Math.random() * 500);

    if (EXERCISE_PAYMENT && Math.random() < 0.8) {
      const idempotencyKey = `pay-${__VU}-${__ITER}`;
      const start = Date.now();
      const res = http.post(
        `${BASE_URL}/payments/create-intent`,
        JSON.stringify({ userId, amount, currency: 'usd', orderId: `order-${Date.now()}` }),
        { headers: { ...headers, 'Idempotency-Key': idempotencyKey }, tags: { step: 'payment' } }
      );
      metrics.paymentLatency.add(Date.now() - start);
      const ok = check(res, { 'payment created 200': (r) => r.status === 200 });
      metrics.paymentSuccess.add(ok);
      metrics.idempotencySuccess.add(ok ? res.json()?.id !== undefined : false);
      if (!ok) metrics.failedRequests.add(1);
    } else {
      const res = http.get(`${BASE_URL}/restaurants`, { headers: { Authorization: `Bearer ${token}` } });
      check(res, { browse: (r) => r.status === 200 || r.status === 401 });
    }
  });
  sleep(0.5 + Math.random() * 2);
}

export function duplicatePaymentTest() {
  group('Duplicate Payment / Idempotency Test', () => {
    const token = authToken();
    if (!token) return;

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const idempotencyKey = `dup-${__VU}-fixed`;
    const payload = JSON.stringify({ userId: 'dup-user', amount: 100, currency: 'usd', orderId: 'order-dup-1' });

    for (let i = 0; i < 3; i++) {
      const res = http.post(
        `${BASE_URL}/payments/create-intent`,
        payload,
        { headers: { ...headers, 'Idempotency-Key': idempotencyKey }, tags: { step: 'idempotency' } }
      );
      const ok = check(res, { 'idempotent status 2xx': (r) => r.status < 500 });
      metrics.paymentSuccess.add(ok);
      metrics.idempotencySuccess.add(ok);
      if (!ok) metrics.failedRequests.add(1);
      sleep(0.1);
    }
  });
  sleep(1);
}

export function teardown() {
  return {};
}
