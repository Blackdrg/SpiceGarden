// infra/load-tests/stage-7b-750k.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    spicegarden_750k_stage: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 50000 },
        { duration: '10m', target: 750000 },
        { duration: '20m', target: 750000 },
        { duration: '5m', target: 0 }
      ],
      gracefulRampDown: '30s'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    http_req_failed: ['rate<0.02']
  }
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-SpiceGarden-Client': 'k6-750k-stage-runner'
  };

  const res = http.get(`${BASE_URL}/health`, { headers });
  check(res, {
    'status is 200': (r) => r.status === 200
  });

  sleep(Math.random() * 2 + 1);
}
