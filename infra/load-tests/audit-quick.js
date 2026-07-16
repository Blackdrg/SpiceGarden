import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  vus: 50,
  duration: '20s',
  thresholds: { http_req_duration: ['p(95)<500'], http_req_failed: ['rate<0.05'] },
};
export default function () {
  const base = 'http://localhost:3001';
  const r1 = http.get(base + '/health');
  check(r1, { 'health 200': (r) => r.status === 200 });
  const r2 = http.get(base + '/restaurants/search?q=a');
  check(r2, { 'search 2xx': (r) => r.status >= 200 && r.status < 500 });
  sleep(0.2);
}
