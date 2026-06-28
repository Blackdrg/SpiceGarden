import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config } from './libs/config.js';

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const options = {
    stages: [
        { duration: '5m', target: 50000 },
        { duration: '90m', target: 50000 },
        { duration: '5m', target: 0 },
    ],
    thresholds: {
        'http_req_success_rate': ['rate>0.97'],
        'http_req_duration': ['p(95)<800'],
    },
};

const httpSuccessRate = new Rate('http_req_success_rate');
const httpDuration = new Trend('http_req_duration', true);

export default function () {
    const rand = Math.random();
    
    if (rand < 0.60) {
        runBrowse();
    } else {
        runCheckout();
    }
    
    sleep(randomInt(0, 2));
}

function runBrowse() {
    const res = http.get(config.BASE_URL + '/restaurants');
    check(res, { 'browse ok': (r) => r.status === 200 });
    httpSuccessRate.add(res.status === 200);
    httpDuration.add(res.timings.duration);
}

function runCheckout() {
    const order = {
        userId: 'stage5-' + __VU + '-' + __ITER,
        restaurantId: 'restaurant-' + randomInt(1, 200),
        items: [{ id: 'item-' + randomInt(1, 200), name: 'Food', quantity: 1 }],
        grandTotal: randomInt(200, 1500),
    };
    const res = http.post(config.BASE_URL + '/orders', JSON.stringify(order), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, { 'checkout ok': (r) => r.status === 201 || r.status === 200 || r.status === 400 });
    httpSuccessRate.add(res.status === 200 || res.status === 201);
    httpDuration.add(res.timings.duration);
}