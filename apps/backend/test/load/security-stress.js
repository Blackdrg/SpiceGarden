import http from 'k6/http';
import { check, group, sleep, Counter, Rate } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const metrics = {
  authSuccess: new Rate('security_auth_success'),
  blockedSuccess: new Rate('security_blocked_success'),
  sqlInjectionBlocked: new Rate('sql_injection_blocked'),
  xssBlocked: new Rate('xss_blocked'),
  rateLimitActive: new Rate('rate_limit_active'),
  csrfBlocked: new Rate('csrf_blocked'),
  failedRequests: new Counter('security_failed_requests_total'),
};

export const options = {
  scenarios: {
    brute_force: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      exec: 'bruteForceTest',
    },
    injection_attempts: {
      executor: 'constant-vus',
      vus: 30,
      duration: '5m',
      exec: 'injectionAttempts',
    },
    rate_limit_test: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
      exec: 'rateLimitTest',
    },
    csrf_test: {
      executor: 'constant-vus',
      vus: 20,
      duration: '5m',
      exec: 'csrfTest',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    security_auth_success: ['rate>0.99'],
    security_blocked_success: ['rate>0.95'],
    sql_injection_blocked: ['rate>0.95'],
    xss_blocked: ['rate>0.95'],
    rate_limit_active: ['rate>0.90'],
  },
};

export function setup() {
  http.get(`${BASE_URL}/health`);
  return {};
}

const sqlInjectionPayloads = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "1 UNION SELECT * FROM users",
  "admin'--",
  "' OR 1=1 --",
];

const xssPayloads = [
  '<script>alert(1)</script>',
  '<img onerror=alert(1) src=x>',
  'javascript:alert(1)',
];

export function bruteForceTest() {
  group('Brute Force / Rate Limit Test', () => {
    for (let i = 0; i < 20; i++) {
      const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ email: 'admin@test.com', password: `wrong${i}` }), { headers: { 'Content-Type': 'application/json' } });
      const blocked = res.status === 429 || res.status === 401;
      check(res, { 'login blocked correctly': () => blocked });
      metrics.blockedSuccess.add(blocked);
      sleep(0.05);
    }
  });
  sleep(1);
}

export function injectionAttempts() {
  group('SQL/NoSQL Injection Resistance', () => {
    const email = `sec-${__VU}-${__ITER}@test.com`;
    const sqlPayload = sqlInjectionPayloads[__VU % sqlInjectionPayloads.length];
    const xssPayload = xssPayloads[__VU % xssPayloads.length];

    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ email: sqlPayload, password: xssPayload }), { headers: { 'Content-Type': 'application/json' } });
    const sqlBlocked = loginRes.status === 400 || loginRes.status === 401 || loginRes.status === 422;
    check(loginRes, { 'SQL injection on login blocked': () => sqlBlocked });
    metrics.sqlInjectionBlocked.add(sqlBlocked);
    metrics.xssBlocked.add(sqlBlocked);

    const searchRes = http.get(`${BASE_URL}/restaurants/search?q=${encodeURIComponent(sqlPayload)}${encodeURIComponent(xssPayload)}`);
    const searchSafe = searchRes.status < 500 && !searchRes.body?.includes('script');
    check(searchRes, { 'search injection blocked': () => searchSafe });
    metrics.sqlInjectionBlocked.add(searchSafe);

    const registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify({ email: `sec-${__VU}@test.com`, password: sqlPayload, fullName: xssPayload, phone: '+15550000000' }), { headers: { 'Content-Type': 'application/json' } });
    const regBlocked = registerRes.status === 400 || registerRes.status === 422;
    check(registerRes, { 'Registration injection blocked': () => regBlocked });
    metrics.sqlInjectionBlocked.add(regBlocked);
    metrics.xssBlocked.add(regBlocked);

    sleep(0.2);
  });
}

export function rateLimitTest() {
  group('Rate Limit Stress Test', () => {
    for (let i = 0; i < 120; i++) {
      const res = http.get(`${BASE_URL}/restaurants`, { headers: { 'X-No-Rate-Limit': 'true' } });
      const notRateLimited = res.status !== 429;
      check(res, { 'request not rate limited': () => notRateLimited });
      metrics.rateLimitActive.add(!notRateLimited);
      sleep(0.01);
    }
  });
  sleep(2);
}

export function csrfTest() {
  group('CSRF Protection Test', () => {
    const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ email: 'csftest@test.com', password: 'Pass123!' }), {
      headers: { 'Content-Type': 'application/json' },
    });
    const authRes = res.json();
    const token = authRes?.access_token || null;

    const postRes = http.post(`${BASE_URL}/user/addresses`, JSON.stringify({
      label: 'NoCSRF', addressLine: '1 CSRF St', city: 'Test', state: 'TS', postalCode: '500001',
      location: { lat: 17.385, lng: 78.486 }, isDefault: true,
    }), {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });

    const hasCsrf = postRes.status === 403 || postRes.status === 419 || postRes.status === 400;
    check(postRes, { 'CSRF check active': () => hasCsrf });
    metrics.csrfBlocked.add(hasCsrf);
    sleep(1);
  });
}

export function teardown() {
  return {};
}
