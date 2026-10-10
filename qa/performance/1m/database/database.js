import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 500 },
    { duration: '30s', target: 2000 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<80'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const res = http.get(`${BASE_URL}/api/restaurants/menu-search?q=Paneer`);
  check(res, {
    'database read status': (r) => r.status === 200 || r.status === 404,
  });
  sleep(0.02);
}
