import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const options = {
    stages: [
        { duration: '10m', target: 100000 },
        { duration: '120m', target: 100000 },
        { duration: '10m', target: 0 },
    ],
    summaryTrendStats: ['avg', 'min', 'max', 'p(95)', 'p(99)'],
    thresholds: {
        'http_req_success_rate': ['rate>0.95'],
        'http_req_duration': ['p(95)<1000'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const httpSuccessRate = new Rate('http_req_success_rate');

export default function () {
    if (Math.random() < 0.50) {
        runBrowse();
    } else if (Math.random() < 0.80) {
        runSearch();
    } else {
        runHealthCheck();
    }

    sleep(randomInt(0, 1));
}

function runBrowse() {
    const res = http.get(BASE_URL + '/restaurants');
    const success = check(res, { 'browse ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    sleep(0);
}

function runSearch() {
    const query = randomChoice(['biryani', 'burger', 'pizza', 'dosa', 'naan']);
    const res = http.get(BASE_URL + '/restaurants/search?q=' + query);
    const success = check(res, { 'search ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    sleep(0);
}

function runHealthCheck() {
    const res = http.get(BASE_URL + '/health');
    const success = check(res, { 'health ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    sleep(0);
}