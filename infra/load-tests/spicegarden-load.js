import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend, Gauge, Rate } from 'k6/metrics';

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const httpSuccessRate = new Rate('http_req_success_rate');
const httpDuration = new Trend('http_req_duration', true);

const RAMP_UP_SECONDS = parseInt(__ENV.RAMP_UP_SECONDS || '120');
const DURATION_SECONDS = parseInt(__ENV.DURATION_SECONDS || '1800');
const RAMP_DOWN_SECONDS = parseInt(__ENV.RAMP_DOWN_SECONDS || '120');
const TARGET_VUS = parseInt(__ENV.TARGET_VUS || '1000');

export const options = {
    stages: [
        { duration: `${RAMP_UP_SECONDS}s`, target: TARGET_VUS },
        { duration: `${DURATION_SECONDS}s`, target: TARGET_VUS },
        { duration: `${RAMP_DOWN_SECONDS}s`, target: 0 },
    ],
    thresholds: {
        'http_req_success_rate': ['rate>0.99'],
        'http_req_duration': ['p(95)<500'],
    },
};

export default function () {
    runScenario();
    sleep(randomInt(1, 5));
}

function runScenario() {
    const rand = Math.random();
    
    if (rand < 0.50) {
        runBrowse();
    } else if (rand < 0.80) {
        runSearch();
    } else {
        runHealth();
    }
}

function runBrowse() {
    const res = http.get(BASE_URL + '/restaurants');
    const success = check(res, { 'browse ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpDuration.add(res.timings.duration);
}

function runSearch() {
    const query = randomChoice(['biryani', 'burger', 'pizza', 'dosa', 'naan']);
    const res = http.get(BASE_URL + '/restaurants/search?q=' + query, { headers: { 'Content-Type': 'application/json' } });
    const success = check(res, { 'search ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpDuration.add(res.timings.duration);
}

function runAuth() {
    const email = `load-${__VU}-${__ITER}@test.com`;
    const res = http.post(BASE_URL + '/auth/register', JSON.stringify({
        email,
        password: 'Password123!',
        fullName: 'Load Test',
        phone: '+15551234567',
    }), { headers: { 'Content-Type': 'application/json' } });
    const success = check(res, { 'auth ok': (r) => r.status === 200 || r.status === 201 });
    httpSuccessRate.add(success);
    httpDuration.add(res.timings.duration);
}

function runHealth() {
    const res = http.get(BASE_URL + '/health');
    const success = check(res, { 'health ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpDuration.add(res.timings.duration);
}

export function setup() {
    const checkRes = http.get(BASE_URL + '/health');
    check(checkRes, { 'health check passed': (r) => r.status === 200 });
}