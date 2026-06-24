import { browseRestaurants, createOrder, ensureToken, metrics, request, setup, userIdFromToken } from './common.js';
import { group, sleep } from 'k6';

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
    http_req_failed: ['rate<0.01'],
    load_success: ['rate>0.99'],
    browse_restaurants_success: ['rate>0.99'],
    order_success: ['rate>0.99'],
    http_req_duration: [`p(95)<${Number(__ENV.P95_LIMIT_MS || 2000)}`],
  },
};

export { setup };

export function testReadBottleneck() {
  const auth = ensureToken('db-read');
  if (!auth.token) {
    return;
  }
  group('DB bottleneck - read restaurants', () => {
    browseRestaurants(auth.token);
  });
  sleep(0.2);
}

export function testWriteBottleneck() {
  const auth = ensureToken('db-write');
  if (!auth.token) {
    return;
  }
  const userId = auth.userId || userIdFromToken(auth.token);
  group('DB bottleneck - write order', () => {
    const restaurants = browseRestaurants(auth.token);
    if (!restaurants || restaurants.length === 0) {
      metrics.orderSuccess.add(false);
      metrics.loadSuccess.add(false);
      return;
    }
    const restaurant = restaurants[__VU % restaurants.length];
    const restaurantId = restaurant.id || restaurant.slug;
    createOrder(auth.token, userId, restaurantId, `addr-${userId}`);
  });
  sleep(0.3);
}

export function testCacheEndpoint() {
  request(
    'GET',
    `${__ENV.BASE_URL || 'http://localhost:3001'}/metrics`,
    null,
    { tags: { step: 'metrics' } },
    'metrics endpoint',
    [200],
    metrics.browseSuccess,
  );
  sleep(0.2);
}
