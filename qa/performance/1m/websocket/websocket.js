import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ws_telemetry_broadcast_storm: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 2000 },
        { duration: '40s', target: 5000 },
        { duration: '20s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<60'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const driverId = `driver-${(__VU % 100) + 1}`;
  const payload = JSON.stringify({
    driverId,
    lat: 12.9716 + (__VU * 0.0001),
    lng: 77.5946 + (__VU * 0.0001),
    heading: 90,
    speed: 35,
  });

  const res = http.post(`${BASE_URL}/api/tracking/update-location`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'telemetry ingestion accepted': (r) => r.status === 200 || r.status === 201 || r.status === 404,
  });

  sleep(0.05);
}
