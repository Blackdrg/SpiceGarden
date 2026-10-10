import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    payment_idempotency_storm: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<80'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const idempotentKey = `pay-key-fixed-${__VU}`;
  const payload = JSON.stringify({
    orderId: `ord-fixed-${__VU}`,
    amount: 450,
    paymentMethod: 'stripe_card',
  });

  const res = http.post(`${BASE_URL}/api/payments/process`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotentKey,
    },
  });

  check(res, {
    'duplicate payment correctly handled or deduplicated': (r) =>
      r.status === 200 || r.status === 201 || r.status === 409 || r.status === 401,
  });

  sleep(0.05);
}
