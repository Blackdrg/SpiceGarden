import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config } from './libs/config.js';

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const options = {
    stages: [
        { duration: '10m', target: 100000 },
        { duration: '120m', target: 100000 },
        { duration: '10m', target: 0 },
    ],
    thresholds: {
        'http_req_success_rate': ['rate>0.95'],
        'http_req_duration': ['p(95)<1000'],
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
    
    sleep(randomInt(0, 1));
}

function runBrowse() {
    const res = http.get(config.BASE_URL + '/restaurants');
    check(res, { 'browse ok': (r) => r.status === 200 });
    httpSuccessRate.add(res.status === 200);
    httpDuration.add(res.timings.duration);
}

function runCheckout() {
    const order = {
        userId: 'stage6-' + __VU + '-' + __ITER,
        restaurantId: 'restaurant-' + randomInt(1, 500),
        items: [{ id: 'item-' + randomInt(1, 200), name: 'Food', quantity: 1 }],
        grandTotal: randomInt(200, 2000),
    };
    const res = http.post(config.BASE_URL + '/orders', JSON.stringify(order), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, { 'checkout ok': (r) => r.status === 201 || r.status === 200 || r.status === 400 });
    httpSuccessRate.add(res.status === 200 || res.status === 201);
    httpDuration.add(res.timings.duration);
}