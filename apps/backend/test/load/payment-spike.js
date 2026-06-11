import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const http_req_success = new Rate('http_req_success');
const http_req_duration = new Trend('http_req_duration');
const payment_errors = new Counter('payment_errors');
const double_payment_flags = new Counter('double_payment_flags');

export const options = {
  scenarios: {
    normal_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 200 },
        { duration: '2m', target: 2000 },
        { duration: '30s', target: 0 },
      ],
      exec: 'testPaymentSpike',
      tags: { scenario: 'payment-spike' },
    },
    sustained_spike: {
      executor: 'constant-vus',
      startVUs: 500,
      startTime: '30s',
      duration: '3m',
      exec: 'testPaymentSpike',
      tags: { scenario: 'payment-spike-sustained' },
    },
  },
  thresholds: {
    http_req_success: ['rate>0.90'],
    http_req_duration: ['p(95)<1000'],
    'http_req_duration{scenario:payment-spike}': ['p(95)<500'],
    'http_req_duration{scenario:payment-spike-sustained}': ['p(95)<800'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || 'test-token-123';

export function testPaymentSpike() {
  const vu = `${__VU}-${__ITER}`;
  const userId = `spike-user-${__VU}`;
  const orderId = `order-spike-${vu}`;

  group('Payment Spike - Create Intent', () => {
    const payload = JSON.stringify({
      amount: 500 + (__VU % 10) * 100,
      currency: 'INR',
      userId,
      metadata: { orderId, source: 'load-test' },
    });

    const res = http.post(`${BASE_URL}/payments/intent`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `payment-intent-${vu}`,
        Authorization: `Bearer ${API_TOKEN}`,
      },
      tags: { scenario: 'payment-spike' },
    });

    const success = check(res, {
      'intent created or rate limited': (r) => r.status === 201 || r.status === 429,
      'no server error': (r) => r.status < 500,
    });
    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);
    if (!success) payment_errors.add(1);
  });

  sleep(0.3);

  group('Payment Spike - Confirm Payment', () => {
    const payload = JSON.stringify({
      paymentMethodId: `pm_${vu}`,
      orderId,
    });

    const res = http.post(`${BASE_URL}/payments/confirm`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `payment-confirm-${vu}`,
        Authorization: `Bearer ${API_TOKEN}`,
      },
      tags: { scenario: 'payment-spike' },
    });

    const success = check(res, {
      'confirm handled gracefully': (r) => r.status < 500,
    });
    http_req_success.add(success);
    if (!success) payment_errors.add(1);
  });

  sleep(0.5);
}
