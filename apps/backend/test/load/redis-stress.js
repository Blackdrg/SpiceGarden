import http from 'k6/http';
import { check, group, sleep, Counter, Rate, Trend } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const metrics = {
  redisSuccess: new Rate('redis_stress_success'),
  failedRequests: new Counter('redis_failed_requests_total'),
  rateLimitLatency: new Trend('rate_limit_latency_ms'),
};

export const options = {
  scenarios: {
    auth_burst: {
      executor: 'constant-vus',
      vus: 200,
      duration: '10m',
      exec: 'authBurst',
    },
    api_burst: {
      executor: 'constant-vus',
      vus: 500,
      duration: '10m',
      exec: 'apiBurst',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    redis_stress_success: ['rate>0.90'],
    rate_limit_latency: ['p(95)<500'],
  },
};

export function setup() {
  http.get(`${BASE_URL}/health`);
  return {};
}

function doRequest(method, url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const start = Date.now();
  const res = http.request(method, `${BASE_URL}${url}`, body, { headers });
  metrics.rateLimitLatency.add(Date.now() - start);
  metrics.redisSuccess.add(res.status < 500);
  return res;
}

export function authBurst() {
  group('Auth Burst (Redis rate-limit stress)', () => {
    for (let i = 0; i < 5; i++) {
      const email = `ratelimit-${__VU}-${__ITER}-${i}-${Date.now()}@test.com`;
      const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify({ email, password: 'Pass123!', fullName: 'Rate Test', phone: '+15551111111' }), { headers: { 'Content-Type': 'application/json' } });
      sleep(0.1);
    }
  });
  sleep(1);
}

export function apiBurst() {
  group('API Burst (Redis rate-limit stress)', () => {
    const email = `apiload-${__VU}-${__ITER}@test.com`;
    const res = http.post(`${BASE_URL}/auth/register`, JSON.stringify({ email, password: 'Pass123!', fullName: 'API Test', phone: '+15552222222' }), { headers: { 'Content-Type': 'application/json' } });
    const body = res.json();
    const token = body?.access_token || null;

    for (let i = 0; i < 30; i++) {
      doRequest('GET', '/restaurants', null, token);
      doRequest('GET', '/restaurants/search?q=pizza', null, token);
      doRequest('GET', '/health', null, null);
      if (i % 5 === 0) sleep(0.2);
    }

    if (Math.random() < 0.3) {
      doRequest('GET', '/admin/dashboard', null, token);
    }
  });
  sleep(0.5 + Math.random() * 2);
}
