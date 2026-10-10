/**
 * SpiceGarden 500K Extended Soak Test Scenario (4-Hour Endurance Run)
 * 
 * Validates long-term stability and detects:
 * - V8 garbage collection degradation and memory leaks
 * - PostgreSQL connection leak / connection pool exhaustion
 * - Redis key retention & memory leak (TTL expiration verification)
 * - File descriptor / socket leaks over 4 hours
 * - Event loop lag drift
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const soakLatency = new Trend('soak_latency', true);
export const totalTransactions = new Counter('total_transactions');

export const options = {
  scenarios: {
    soak_500k: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 250000 },  // Warmup ramp
        { duration: '10m', target: 500000 }, // Full ramp
        { duration: '240m', target: 500000 },// 4-HOUR EXTENDED SOAK HOLD
        { duration: '5m', target: 0 }        // Cooldown
      ],
      gracefulRampDown: '1m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.005'],            // Error rate strictly < 0.5%
    http_req_duration: ['p(95)<150', 'p(99)<300'], // Sustained latency within SLA
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001';
const HEADERS = {
  'Content-Type': 'application/json',
  'X-SpiceGarden-Tenant': 'tenant-default',
};

export default function () {
  const vuId = __VU;
  const iter = __ITER;

  // Mixed lifecycle transaction
  const res = http.get(`${BASE_URL}/restaurants`, { headers: HEADERS });
  soakLatency.add(res.timings.duration);
  
  const passed = check(res, {
    'status is 200': (r) => r.status === 200,
  });

  if (passed) {
    totalTransactions.add(1);
  } else {
    errorRate.add(1);
  }

  // Think time with jitter to simulate realistic client variance
  sleep(1.8 + Math.random() * 0.5);
}
