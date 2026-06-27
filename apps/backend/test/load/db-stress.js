import http from 'k6/http';
import { check, group, sleep, Counter, Rate, Trend } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const metrics = {
  dbSuccess: new Rate('db_stress_success'),
  failedRequests: new Counter('db_failed_requests_total'),
  queryLatency: new Trend('db_query_latency_ms'),
  writeLatency: new Trend('db_write_latency_ms'),
};

export const options = {
  scenarios: {
    db_read_heavy: {
      executor: 'constant-vus',
      vus: __ENV.READ_VUS || 50,
      duration: __ENV.DURATION || '5m',
      exec: 'heavyReads',
    },
    db_write_heavy: {
      executor: 'constant-vus',
      vus: __ENV.WRITE_VUS || 20,
      duration: __ENV.DURATION || '5m',
      exec: 'heavyWrites',
    },
    db_mixed: {
      executor: 'constant-vus',
      vus: __ENV.MIXED_VUS || 30,
      duration: __ENV.DURATION || '5m',
      exec: 'mixedLoad',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    db_stress_success: ['rate>0.95'],
    db_query_latency: ['p(95)<1000'],
    db_write_latency: ['p(95)<1500'],
  },
};

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function dbRequest(method, url, body, token) {
  const start = Date.now();
  const res = http.request(method, `${BASE_URL}${url}`, body, { headers: authHeaders(token) });
  const ok = check(res, { [`${method} ${url} status 2xx/4xx/5xx`]: (r) => r.status < 600 });
  if (!ok) {
    metrics.failedRequests.add(1);
  }
  const latency = Date.now() - start;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    metrics.writeLatency.add(latency);
  } else {
    metrics.queryLatency.add(latency);
  }
  metrics.dbSuccess.add(ok);
  return res;
}

export function setup() {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { health: (r) => r.status === 200 });
  return {};
}

export function heavyReads() {
  group('DB Read Heavy', () => {
    const email = `db-read-${__VU}-${__ITER}@load.test`;
    const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify({ email, password: 'Pass123!', fullName: 'DB Read', phone: '+15550000000' }), { headers: { 'Content-Type': 'application/json' } });
    const body = res.json();
    const token = body?.access_token || null;

    for (let i = 0; i < 10; i++) {
      dbRequest('GET', '/restaurants', null, token);
      dbRequest('GET', '/user/profile', null, token);
      dbRequest('GET', '/notifications', null, token);
      dbRequest('GET', '/wallet', null, token);
      dbRequest('GET', '/orders', null, token);
    }
  });
  sleep(0.5);
}

export function heavyWrites() {
  group('DB Write Heavy', () => {
    const email = `db-write-${__VU}-${__ITER}@load.test`;
    const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify({ email, password: 'Pass123!', fullName: 'DB Write', phone: '+15550000000' }), { headers: { 'Content-Type': 'application/json' } });
    const body = res.json();
    const token = body?.access_token || null;
    const userId = body?.user?.id || body?.id || 'user-' + __VU;

    for (let i = 0; i < 5; i++) {
      dbRequest('POST', '/user/addresses', JSON.stringify({
        label: `DB Write ${__VU}-${i}`,
        addressLine: `${100 + __VU} Test St`,
        city: 'Test City', state: 'TS', postalCode: '500001',
        location: { lat: 17.385, lng: 78.486 }, isDefault: i === 0,
      }), token);

      dbRequest('POST', '/orders', JSON.stringify({
        userId, restaurantId: 'rest-1', items: [{ id: `item-${Date.now()}`, name: 'Test', price: 100, quantity: 1 }],
        deliveryAddressId: 'addr-1', subtotal: 100, tax: 5, deliveryFee: 10, discount: 0, tip: 0, grandTotal: 115,
      }), token);
    }
  });
  sleep(1);
}

export function mixedLoad() {
  group('DB Mixed Load', () => {
    const email = `db-mixed-${__VU}-${__ITER}@load.test`;
    const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify({ email, password: 'Pass123!', fullName: 'DB Mixed', phone: '+15550000000' }), { headers: { 'Content-Type': 'application/json' } });
    const body = res.json();
    const token = body?.access_token || null;
    const userId = body?.user?.id || body?.id || 'user-' + __VU;

    dbRequest('GET', '/restaurants', null, token);
    dbRequest('GET', '/restaurants/search?q=biryani', null, token);
    dbRequest('GET', '/user/profile', null, token);

    if (Math.random() < 0.3) {
      dbRequest('POST', '/user/addresses', JSON.stringify({
        label: 'Mixed Addr',
        addressLine: '42 Mixed Ave',
        city: 'Hyderabad', state: 'TS', postalCode: '500001',
        location: { lat: 17.385, lng: 78.486 }, isDefault: true,
      }), token);
    }

    if (Math.random() < 0.2) {
      dbRequest('POST', '/orders', JSON.stringify({
        userId, restaurantId: 'rest-1', items: [{ id: `item-${Date.now()}`, name: 'Mixed', price: 100, quantity: 1 }],
        deliveryAddressId: 'addr-1', subtotal: 100, tax: 5, deliveryFee: 10, discount: 0, tip: 0, grandTotal: 115,
      }), token);
    }

    dbRequest('GET', '/notifications', null, token);
    dbRequest('GET', '/wallet', null, token);
  });
  sleep(0.5 + Math.random());
}
