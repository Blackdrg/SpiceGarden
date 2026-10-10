import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5000 },
    { duration: '1m', target: 20000 },
    { duration: '2m', target: 50000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<120'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const res = http.get(`${BASE_URL}/api/restaurants`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.02);
}
