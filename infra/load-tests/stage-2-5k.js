import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config, endpoints } from './libs/config.js';

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const options = {
    stages: [
        { duration: '3m', target: 5000 },
        { duration: '30m', target: 5000 },
        { duration: '3m', target: 0 },
    ],
    thresholds: {
        'http_req_success_rate': ['rate>0.99'],
        'http_req_duration': ['p(95)<500'],
    },
};

const httpSuccessRate = new Rate('http_req_success_rate');
const httpDuration = new Trend('http_req_duration', true);

export default function () {
    const rand = Math.random();
    const headers = { 'Content-Type': 'application/json' };
    
    if (rand < 0.60) {
        runBrowse(headers);
    } else if (rand < 0.75) {
        runSearch(headers);
    } else {
        runCheckout(headers);
    }
    
    sleep(randomInt(1, 5));
}

function runBrowse(headers) {
    const res = http.get(config.BASE_URL + endpoints.restaurants.list, { headers });
    check(res, { 'browse ok': (r) => r.status === 200 });
    httpSuccessRate.add(res.status === 200);
    httpDuration.add(res.timings.duration);
}

function runSearch(headers) {
    const query = randomChoice(['biryani', 'burger', 'pizza', 'dosa', 'naan']);
    const res = http.get(config.BASE_URL + endpoints.restaurants.search + '?q=' + query, { headers });
    check(res, { 'search ok': (r) => r.status === 200 });
    httpSuccessRate.add(res.status === 200);
    httpDuration.add(res.timings.duration);
}

function runCheckout(headers) {
    const order = {
        userId: 'stage2-' + __VU + '-' + __ITER,
        restaurantId: 'restaurant-' + randomInt(1, 100),
        items: Array(randomInt(1, 3)).fill(null).map(() => ({
            id: 'item-' + randomInt(1, 100),
            name: randomChoice(['Biryani', 'Karahi', 'Naan', 'Burger', 'Pizza']),
            quantity: randomInt(1, 3),
        })),
        grandTotal: randomInt(200, 1500),
    };
    const res = http.post(config.BASE_URL + endpoints.orders.create, JSON.stringify(order), { headers });
    check(res, { 'checkout ok': (r) => r.status === 201 || r.status === 200 || r.status === 400 });
    httpSuccessRate.add(res.status === 200 || res.status === 201);
    httpDuration.add(res.timings.duration);
}