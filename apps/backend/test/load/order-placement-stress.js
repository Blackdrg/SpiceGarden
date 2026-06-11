import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate, Gauge } from 'k6/metrics';

const http_req_success = new Rate('http_req_success');
const http_req_duration = new Trend('http_req_duration');
const order_placement_latency = new Trend('order_placement_latency');
const order_errors = new Counter('order_errors');
const concurrent_orders = new Counter('concurrent_orders');
const failed_orders = new Counter('failed_orders');

export const options = {
  scenarios: {
    steady_order_placement: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '1m', target: 100 },
        { duration: '5m', target: 500 },
        { duration: '5m', target: 1000 },
        { duration: '5m', target: 2000 },
        { duration: '2m', target: 0 },
      ],
      exec: 'testOrderPlacement',
      tags: { scenario: 'order-placement' },
    },
    burst_order_placement: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      preAllocatedVUs: 200,
      maxVUs: 5000,
      startTime: '0s',
      timeUnit: '1s',
      stages: [
        { duration: '1m', rate: 500 },
        { duration: '3m', rate: 2000 },
        { duration: '2m', rate: 0 },
      ],
      exec: 'testOrderPlacement',
      tags: { scenario: 'order-placement-burst' },
    },
  },
  thresholds: {
    http_req_success: ['rate>0.90'],
    http_req_duration: ['p(95)<1000'],
    order_placement_latency: ['p(95)<2000'],
    'order_placement_latency{scenario:order-placement}': ['p(95)<1500'],
    'order_placement_latency{scenario:order-placement-burst}': ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || 'test-token-123';

const restaurantIds = Array.from({ length: 10 }, (_, i) => `rest-${i + 1}`);
const itemIds = Array.from({ length: 20 }, (_, i) => `item-${i + 1}`);

export function testOrderPlacement() {
  const vu = `${__VU}-${__ITER}`;
  const restaurantId = restaurantIds[__VU % restaurantIds.length];
  const itemId = itemIds[__VU % itemIds.length];
  const quantity = 1 + (__VU % 5);
  const itemPrice = 100 + (__VU % 10) * 50;
  const subtotal = itemPrice * quantity;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = Math.round(subtotal * 0.10 * 100) / 100;
  const discount = __VU % 3 === 0 ? Math.round(subtotal * 0.10 * 100) / 100 : 0;
  const tip = __VU % 4 === 0 ? 50 : 0;
  const grandTotal = Math.round((subtotal + tax + deliveryFee - discount + tip) * 100) / 100;

  group('Order Placement Stress', () => {
    const payload = JSON.stringify({
      userId: `stress-user-${__VU}`,
      restaurantId,
      items: [{ itemId, quantity, price: itemPrice }],
      deliveryAddressId: `addr-${(__VU % 5) + 1}`,
      subtotal,
      tax,
      deliveryFee,
      discount,
      tip,
      grandTotal,
      couponId: __VU % 10 === 0 ? 'SUMMER20' : undefined,
    });

    const startTime = new Date();
    const res = http.post(`${BASE_URL}/orders`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
        'Idempotency-Key': `order-stress-${vu}`,
      },
      tags: { scenario: 'order-placement' },
    });

    const latency = new Date().getTime() - startTime.getTime();
    order_placement_latency.add(latency);

    const success = check(res, {
      'order placed or rate limited': (r) => r.status === 201 || r.status === 429,
      'no server error': (r) => r.status < 500,
    });
    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);
    concurrent_orders.add(1);
    if (!success) {
      order_errors.add(1);
      failed_orders.add(1);
    }
  });

  sleep(0.1);
}
