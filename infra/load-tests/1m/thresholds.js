// infra/load-tests/1m/thresholds.js
export const THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1500'], // Primary SLA: p95 < 500ms
  http_req_failed: ['rate<0.02'],                  // Primary SLA: error rate < 2%
  'http_req_duration{scenario:browse}': ['p(95)<250'],
  'http_req_duration{scenario:search}': ['p(95)<350'],
  'http_req_duration{scenario:cart}': ['p(95)<300'],
  'http_req_duration{scenario:checkout}': ['p(95)<600'],
  'http_req_duration{scenario:tracking}': ['p(95)<200'],
  'http_req_duration{scenario:admin}': ['p(95)<800']
};
