import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    queue_async_jobs: {
      executor: 'constant-vus',
      vus: 100,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<60'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const payload = JSON.stringify({
    orderId: `queue-ord-${__VU}-${__ITER}`,
    status: 'PLACED',
  });

  const res = http.post(`${BASE_URL}/api/orders/lifecycle-job`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'queue job handled': (r) => r.status === 200 || r.status === 201 || r.status === 404,
  });

  sleep(0.05);
}
