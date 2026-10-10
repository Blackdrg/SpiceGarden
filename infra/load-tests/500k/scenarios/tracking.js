// infra/load-tests/500k/scenarios/tracking.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../helpers/config.js';
import { getRandomInt } from '../helpers/data.js';
import { getCustomerAuthHeaders, getDriverAuthHeaders } from '../helpers/auth.js';
import {
  wsConnectingDuration,
  wsSessionDuration,
  wsMessagesReceived,
  wsMessagesSent,
  wsErrorsTotal,
  wsConnectionsActive,
  wsConnectionSuccessRate,
} from '../helpers/metrics.js';

export function runTracking() {
  const start = Date.now();
  const auth = getCustomerAuthHeaders(__VU, __ITER);
  const driverAuth = getDriverAuthHeaders(__VU);
  const driverId = `driver_${getRandomInt(1, 200)}`;
  const orderId = `ord_track_${getRandomInt(1, 500)}`;

  // 1. Fetch Real-time Order Health
  const resOrderTrack = http.get(`${CONFIG.baseUrl}/orders/health`, {
    headers: auth.headers,
    tags: { scenario: 'tracking', endpoint: '/orders/health' },
    timeout: CONFIG.requestTimeout,
  });

  const trackOk = check(resOrderTrack, {
    'order tracking status ok': (r) => r.status === 200,
  });

  // 2. Poll Fleet Telemetry & Performance
  const resDriver = http.get(`${CONFIG.baseUrl}/fleet/performance`, {
    headers: driverAuth.headers,
    tags: { scenario: 'tracking', endpoint: '/fleet/performance' },
    timeout: CONFIG.requestTimeout,
  });

  const driverOk = check(resDriver, {
    'driver location status ok': (r) => r.status === 200,
  });

  wsMessagesSent.add(2);
  wsMessagesReceived.add(2);

  const overallSuccess = trackOk && driverOk;
  wsConnectionSuccessRate.add(overallSuccess);
  wsSessionDuration.add(Date.now() - start);

  const thinkTime = (getRandomInt(500, 1500) / 1000);
  sleep(thinkTime);
}
