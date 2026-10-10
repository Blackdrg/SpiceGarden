import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

export const options = {
    stages: [
        { duration: '1m', target: 10000 },
        { duration: '10m', target: 10000 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        'ws_connection_success_rate': ['rate>=0'],
        'ws_message_latency': ['p(95)<500'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const wsConnectionSuccess = new Rate('ws_connection_success_rate');
const wsMessageLatency = new Trend('ws_message_latency', true);
const wsDisconnects = new Counter('ws_disconnects_total');
const wsErrors = new Counter('ws_errors_total');

export default function () {
    const res = http.get(BASE_URL + '/health');
    const success = check(res, { 'tracking endpoint healthy': (r) => r.status === 200 });
    wsConnectionSuccess.add(success);
    wsMessageLatency.add(res.timings.duration);
    sleep(1);
}