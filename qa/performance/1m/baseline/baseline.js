import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    baseline_check: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<50', 'p(99)<75'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'liveness ok': (r) => r.body && r.body.includes('ok'),
  });

  const liveness = http.get(`${BASE_URL}/liveness`);
  check(liveness, {
    'liveness probe 200': (r) => r.status === 200,
  });

  sleep(0.1);
}
