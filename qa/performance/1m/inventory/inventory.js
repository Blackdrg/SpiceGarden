import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    hot_inventory_storm: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 500 },
        { duration: '30s', target: 2000 },
        { duration: '15s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<75'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const payload = JSON.stringify({
    itemId: 'hot-item-biryani-limited',
    quantityChange: -1,
  });

  const res = http.post(`${BASE_URL}/api/inventory/stock-update`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'inventory reservation atomic response': (r) =>
      r.status === 200 || r.status === 400 || r.status === 404 || r.status === 409,
  });

  sleep(0.01);
}
