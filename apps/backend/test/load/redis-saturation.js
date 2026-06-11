import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const http_req_success = new Rate('http_req_success');
const http_req_duration = new Trend('http_req_duration');
const redis_cache_errors = new Counter('redis_cache_errors');
const session_errors = new Counter('session_errors');

export const options = {
  scenarios: {
    redis_saturation: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '2m', target: 1000 },
        { duration: '5m', target: 5000 },
        { duration: '5m', target: 10000 },
        { duration: '2m', target: 0 },
      ],
      exec: 'testRedisSaturation',
      tags: { scenario: 'redis-saturation' },
    },
  },
  thresholds: {
    http_req_success: ['rate>0.85'],
    http_req_duration: ['p(95)<1500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || 'test-token-123';

export function testRedisSaturation() {
  const vu = `${__VU}-${__ITER}`;

  group('Redis Saturation - Heavy Read/Write', () => {
    const key = `cache-key-${__VU}-${__ITER}`;
    const payload = JSON.stringify({
      key,
      value: `data-${Date.now()}-${__VU}-${__ITER}`,
      ttl: 300,
    });

    const writeRes = http.post(`${BASE_URL}/api/cache/write`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      tags: { scenario: 'redis-saturation', op: 'write' },
    });

    const writeOk = check(writeRes, {
      'write handled': (r) => r.status < 500,
    });
    http_req_success.add(writeOk);
    http_req_duration.add(writeRes.timings.duration);
    if (!writeOk) redis_cache_errors.add(1);

    sleep(0.05);

    const readRes = http.get(`${BASE_URL}/api/cache/read?key=${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      tags: { scenario: 'redis-saturation', op: 'read' },
    });

    const readOk = check(readRes, {
      'read handled': (r) => r.status < 500,
    });
    http_req_success.add(readOk);
    if (!readOk) redis_cache_errors.add(1);
  });

  group('Redis Saturation - Session Operations', () => {
    const sessionPayload = JSON.stringify({
      userId: `session-user-${__VU}`,
      sessionData: { lastActive: Date.now(), pageViews: __ITER },
    });

    const sessionRes = http.post(`${BASE_URL}/api/sessions`, sessionPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      tags: { scenario: 'redis-saturation', op: 'session' },
    });

    const sessionOk = check(sessionRes, {
      'session handled': (r) => r.status < 500,
    });
    http_req_success.add(sessionOk);
    if (!sessionOk) session_errors.add(1);
  });

  sleep(0.1);
}
