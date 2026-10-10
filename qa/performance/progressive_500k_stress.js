import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

export const options = {
  scenarios: {
    progressive_stress: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      timeUnit: '1s',
      preAllocatedVUs: 500,
      maxVUs: 4000,
      stages: [
        { duration: '10s', target: 500 },    // Ramp to 500 RPS
        { duration: '15s', target: 1500 },   // Ramp to 1,500 RPS
        { duration: '20s', target: 3000 },   // Ramp to 3,000 RPS
        { duration: '20s', target: 5000 },   // Ramp to 5,000 RPS (Peak Stress)
        { duration: '10s', target: 0 },      // Ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'http://127.0.0.1:3001';
const successRate = new Rate('http_success_rate');
const reqDuration = new Trend('req_duration_ms', true);
const totalOrders = new Counter('total_orders_created');

export default function () {
  const rand = Math.random();
  let res;

  if (rand < 0.45) {
    res = http.get(`${BASE_URL}/restaurants`);
  } else if (rand < 0.75) {
    res = http.get(`${BASE_URL}/restaurants/search?q=biryani`);
  } else if (rand < 0.90) {
    res = http.post(
      `${BASE_URL}/orders`,
      JSON.stringify({ items: [{ id: 'item_1', qty: 2 }] }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (res.status === 201 || res.status === 200) {
      totalOrders.add(1);
    }
  } else {
    res = http.get(`${BASE_URL}/health`);
  }

  const ok = check(res, { 'status is 200 or 201': (r) => r.status === 200 || r.status === 201 });
  successRate.add(ok);
  reqDuration.add(res.timings.duration);
}
