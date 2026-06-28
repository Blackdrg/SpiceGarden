import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend, Gauge, Rate } from 'k6/metrics';
import { config, endpoints } from './libs/config.js';

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const httpSuccessRate = new Rate('http_req_success_rate');
const paymentSuccessRate = new Rate('payment_success_rate');
const httpDuration = new Trend('http_req_duration', true);

const activeVUs = new Gauge('active_vus');
const ordersCompleted = new Counter('orders_completed_total');
const ordersFailed = new Counter('orders_failed_total');

export const options = {
    stages: [
        { duration: `${config.RAMP_UP_SECONDS}s`, target: config.TARGET_VUS },
        { duration: `${config.DURATION_SECONDS}s`, target: config.TARGET_VUS },
        { duration: `${config.RAMP_DOWN_SECONDS}s`, target: 0 },
    ],
    thresholds: {
        'http_req_success_rate': ['rate>0.99'],
        'http_req_duration': [`p(95)<${config.LATENCY_P95_THRESHOLD_MS}`],
        'payment_success_rate': ['rate>0.999'],
    },
};

export default function () {
    activeVUs.add(1);
    runScenario();
    sleep(randomInt(config.THINK_TIME_MIN || 1, config.THINK_TIME_MAX || 5));
    activeVUs.add(-1);
}

function runScenario() {
    const rand = Math.random();
    const headers = { 'Content-Type': 'application/json' };
    
    if (rand < 0.60) {
        runBrowse(headers);
    } else if (rand < 0.75) {
        runSearch(headers);
    } else if (rand < 0.85) {
        runCheckout(headers);
    } else if (rand < 0.90) {
        runPayment(headers);
    } else {
        runTracking(headers);
    }
}

function runBrowse(headers) {
    const res = http.get(config.BASE_URL + endpoints.restaurants.list, { headers });
    const success = check(res, { 'browse ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpDuration.add(res.timings.duration, { type: 'api', endpoint: 'browse' });
}

function runSearch(headers) {
    const query = randomChoice(['biryani', 'burger', 'pizza', 'dosa', 'naan']);
    const res = http.get(config.BASE_URL + endpoints.restaurants.search + '?q=' + query, { headers });
    const success = check(res, { 'search ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpDuration.add(res.timings.duration, { type: 'api', endpoint: 'search' });
}

function runCheckout(headers) {
    const order = {
        userId: 'user-' + __VU + '-' + __ITER,
        restaurantId: 'restaurant-' + randomInt(1, 50),
        items: [{ id: 'item-' + randomInt(1, 100), name: 'Food', quantity: 1 }],
        grandTotal: randomInt(200, 1000),
    };
    const res = http.post(config.BASE_URL + endpoints.orders.create, JSON.stringify(order), { headers });
    const success = check(res, { 'checkout ok': (r) => r.status === 201 || r.status === 200 });
    httpSuccessRate.add(success);
    httpDuration.add(res.timings.duration, { type: 'api', endpoint: 'checkout' });
    if (success) ordersCompleted.add(1);
    else ordersFailed.add(1);
}

function runPayment(headers) {
    const intent = {
        amount: randomInt(200, 1000),
        currency: 'INR',
        orderId: 'order-' + __VU + '-' + __ITER,
    };
    const res = http.post(config.BASE_URL + endpoints.payments.intent, JSON.stringify(intent), { headers });
    const success = check(res, { 'payment ok': (r) => r.status < 500 });
    paymentSuccessRate.add(success);
    httpDuration.add(res.timings.duration, { type: 'payment', endpoint: 'intent' });
}

function runTracking(headers) {
    const orderId = 'order-' + randomInt(1, 1000);
    const res = http.get(config.BASE_URL + '/orders/' + orderId, { headers });
    const success = check(res, { 'tracking ok': (r) => r.status < 500 });
    httpSuccessRate.add(success);
    httpDuration.add(res.timings.duration, { type: 'api', endpoint: 'tracking' });
}

export function setup() {
    const checkRes = http.get(config.BASE_URL + endpoints.health);
    check(checkRes, { 'health check passed': (r) => r.status === 200 });
}