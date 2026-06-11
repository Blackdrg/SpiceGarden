import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const http_req_success = new Rate('http_req_success');
const http_req_duration = new Trend('http_req_duration');
const db_slow_queries = new Counter('db_slow_queries');
const db_errors = new Counter('db_errors');

export const options = {
  scenarios: {
    read_bottleneck: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '2m', target: 500 },
        { duration: '5m', target: 2000 },
        { duration: '5m', target: 5000 },
        { duration: '2m', target: 0 },
      ],
      exec: 'testReadBottleneck',
      tags: { scenario: 'db-bottleneck', type: 'read' },
    },
    write_bottleneck: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '2m', target: 200 },
        { duration: '5m', target: 1000 },
        { duration: '5m', target: 2000 },
        { duration: '2m', target: 0 },
      ],
      exec: 'testWriteBottleneck',
      tags: { scenario: 'db-bottleneck', type: 'write' },
    },
  },
  thresholds: {
    http_req_success: ['rate>0.85'],
    http_req_duration: ['p(95)<2000'],
    'http_req_duration{scenario:db-bottleneck,type:read}': ['p(95)<1000'],
    'http_req_duration{scenario:db-bottleneck,type:write}': ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || 'test-token-123';

const readEndpoints = [
  '/restaurants',
  '/restaurants?page=1&limit=20',
  '/menu/rest-1',
  '/api/search?q=pizza',
  '/api/analytics/restaurant/rest-1',
  '/api/drivers/available',
];

const complexQueryEndpoints = [
  '/api/analytics/orders?startDate=2024-01-01&endDate=2024-12-31',
  '/api/reports/sales?period=monthly',
  '/api/drivers/performance?period=weekly',
];

export function testReadBottleneck() {
  const endpoint = readEndpoints[__VU % readEndpoints.length];

  group('DB Bottleneck - Heavy Reads', () => {
    const res = http.get(`${BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      tags: { scenario: 'db-bottleneck', type: 'read' },
    });

    const success = check(res, {
      'read handled': (r) => r.status < 500,
    });
    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);

    if (res.timings.duration > 2000) {
      db_slow_queries.add(1);
    }
    if (!success) db_errors.add(1);
  });

  if (__VU % 10 === 0) {
    group('DB Bottleneck - Complex Queries', () => {
      const endpoint = complexQueryEndpoints[__ITER % complexQueryEndpoints.length];
      const res = http.get(`${BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
        tags: { scenario: 'db-bottleneck', type: 'read-complex' },
      });

      const success = check(res, {
        'complex query handled': (r) => r.status < 500,
      });
      http_req_success.add(success);
      if (res.timings.duration > 3000) {
        db_slow_queries.add(1);
      }
      if (!success) db_errors.add(1);
    });
  }

  sleep(0.2);
}

export function testWriteBottleneck() {
  const restaurantId = `rest-${(__VU % 5) + 1}`;
  const itemPrice = 100 + (__VU % 10) * 50;
  const quantity = 1 + (__VU % 3);
  const subtotal = itemPrice * quantity;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = Math.round(subtotal * 0.10 * 100) / 100;
  const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  group('DB Bottleneck - Heavy Writes', () => {
    const payload = JSON.stringify({
      userId: `db-write-user-${__VU}`,
      restaurantId,
      items: [{ itemId: `item-${(__VU % 10) + 1}`, quantity, price: itemPrice }],
      deliveryAddressId: `addr-${(__VU % 3) + 1}`,
      subtotal,
      tax,
      deliveryFee,
      grandTotal,
    });

    const res = http.post(`${BASE_URL}/orders`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      tags: { scenario: 'db-bottleneck', type: 'write' },
    });

    const success = check(res, {
      'write handled': (r) => r.status === 201 || r.status === 429,
      'no server error': (r) => r.status < 500,
    });
    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);

    if (res.timings.duration > 3000) {
      db_slow_queries.add(1);
    }
    if (!success) db_errors.add(1);
  });

  sleep(0.3);
}
