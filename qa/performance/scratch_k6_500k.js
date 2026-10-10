import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '10s', target: 1000 },
    { duration: '10s', target: 5000 },
    { duration: '15s', target: 10000 },
    { duration: '15s', target: 25000 },
    { duration: '15s', target: 50000 },
    { duration: '15s', target: 100000 },
    { duration: '20s', target: 500000 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
  noConnectionReuse: false,
};

const BASE_URL = 'http://127.0.0.1:3001';
const successRate = new Rate('successful_requests');
const reqDuration = new Trend('custom_duration', true);

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
      JSON.stringify({
        items: [{ id: 'item_1', qty: 2 }],
        paymentMethod: 'stripe'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } else {
    res = http.get(`${BASE_URL}/health`);
  }

  const ok = check(res, { 'status is 200/201': (r) => r.status === 200 || r.status === 201 });
  successRate.add(ok);
  reqDuration.add(res.timings.duration);

  sleep(0.1);
}
