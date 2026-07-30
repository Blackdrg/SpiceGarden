import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend, Gauge } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const TARGET_VUS = parseInt(__ENV.TARGET_VUS || '100');
const RAMP_UP = parseInt(__ENV.RAMP_UP_SECONDS || '60');
const RAMP_DOWN = parseInt(__ENV.RAMP_DOWN_SECONDS || '60');
const SUSTAIN = parseInt(__ENV.SUSTAIN_SECONDS || '300');
const THINK_TIME_MIN = parseInt(__ENV.THINK_TIME_MIN || '1');
const THINK_TIME_MAX = parseInt(__ENV.THINK_TIME_MAX || '5');

export const options = {
    stages: [
        { duration: RAMP_UP + 's', target: TARGET_VUS },
        { duration: SUSTAIN + 's', target: TARGET_VUS },
        { duration: RAMP_DOWN + 's', target: 0 },
    ],
    summaryTrendStats: ['avg', 'min', 'max', 'p(90)', 'p(95)', 'p(99)'],
    thresholds: {
        http_req_success_rate: ['rate>0.99'],
        http_req_duration: ['p(95)<500'],
        auth_success_rate: ['rate>0.95'],
        order_success_rate: ['rate>0.95'],
        payment_success_rate: ['rate>0.99'],
    },
};

const httpSuccessRate = new Rate('http_req_success_rate');
const authSuccessRate = new Rate('auth_success_rate');
const orderSuccessRate = new Rate('order_success_rate');
const paymentSuccessRate = new Rate('payment_success_rate');
const httpReqDuration = new Trend('http_req_duration', true);
const errorsTotal = new Counter('errors_total');
const ordersPlaced = new Counter('orders_placed_total');
const paymentsProcessed = new Counter('payments_processed_total');
const activeVUs = new Gauge('active_vus');

const data = { users: [], queries: [], slugs: [] };
for (let i = 0; i < 5000; i++) {
    data.users.push({
        email: 'loadtest-' + i + '@spicegarden.test',
        password: 'LoadTest#2026',
        name: 'Load User ' + i,
    });
    data.queries.push(['biryani', 'burger', 'pizza', 'dosa', 'naan', 'thali', 'chinese', 'momos'][i % 8]);
    data.slugs.push(['mumbai-tandoor', 'delhi-dhaba', 'bangalore-bites', 'chennai-kitchen', 'pune-palette'][i % 5]);
}

let authToken = '';
let tokenExpiry = 0;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function thinkTime() {
    return randomInt(THINK_TIME_MIN, THINK_TIME_MAX);
}

function updateAuthToken(res) {
    try {
        const body = JSON.parse(res.body || '{}');
        if (body.access_token || body.token) {
            authToken = body.access_token || body.token;
            tokenExpiry = Date.now() + (body.expires_in ? body.expires_in * 1000 : 3600000);
        }
    } catch (e) {
        // ignore parse errors
    }
}

function authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken && Date.now() < tokenExpiry) {
        headers['Authorization'] = 'Bearer ' + authToken;
    }
    return headers;
}

function runHealthCheck() {
    const res = http.get(BASE_URL + '/health');
    const success = check(res, { 'health ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runRegister() {
    const user = data.users[randomInt(0, data.users.length - 1)];
    const res = http.post(BASE_URL + '/auth/register', JSON.stringify({
        fullName: user.name,
        email: user.email,
        password: user.password,
        phone: '+91' + randomInt(6000000000, 9999999999),
    }), { headers: { 'Content-Type': 'application/json' } });

    const success = check(res, {
        'register ok': (r) => r.status === 201 || r.status === 409,
        'register not 5xx': (r) => r.status < 500,
    });
    authSuccessRate.add(success);
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runLogin() {
    const user = data.users[randomInt(0, data.users.length - 1)];
    const res = http.post(BASE_URL + '/auth/login', JSON.stringify({
        email: user.email,
        password: user.password,
    }), { headers: { 'Content-Type': 'application/json' } });

    const success = check(res, {
        'login ok': (r) => [200, 201, 401].includes(r.status),
        'login not 5xx': (r) => r.status < 500,
    });
    authSuccessRate.add(success);
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (success) updateAuthToken(res);
    if (!success) errorsTotal.add(1);
}

function runBrowseRestaurants() {
    const res = http.get(BASE_URL + '/restaurants');
    const success = check(res, { 'browse ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runSearch() {
    const query = data.queries[randomInt(0, data.queries.length - 1)];
    const res = http.get(BASE_URL + '/restaurants/search?q=' + encodeURIComponent(query));
    const success = check(res, { 'search ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runNearby() {
    const lat = 19.0760 + (Math.random() - 0.5) * 0.1;
    const lng = 72.8777 + (Math.random() - 0.5) * 0.1;
    const res = http.get(BASE_URL + '/restaurants/nearby?lat=' + lat + '&lng=' + lng + '&radius=5');
    const success = check(res, { 'nearby ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runRestaurantDetail() {
    const slug = data.slugs[randomInt(0, data.slugs.length - 1)];
    const res = http.get(BASE_URL + '/restaurants/' + slug);
    const success = check(res, { 'detail ok': (r) => r.status === 200 });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runAuthMe() {
    const res = http.get(BASE_URL + '/auth/me', { headers: authHeaders() });
    const success = check(res, { 'me ok': (r) => [200, 401].includes(r.status) });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runPlaceOrder() {
    const res = http.post(BASE_URL + '/orders', JSON.stringify({
        restaurantId: 'restaurant-' + randomInt(1, 50),
        items: [{ itemId: 'item-' + randomInt(1, 200), quantity: randomInt(1, 3) }],
        addressId: 'addr-' + randomInt(1, 10),
        lat: 19.0760 + (Math.random() - 0.5) * 0.1,
        lng: 72.8777 + (Math.random() - 0.5) * 0.1,
    }), { headers: authHeaders() });

    const success = check(res, {
        'order placed': (r) => r.status === 201 || r.status === 401,
        'order not 5xx': (r) => r.status < 500,
    });
    orderSuccessRate.add(success);
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (res.status === 201) ordersPlaced.add(1);
    if (!success) errorsTotal.add(1);
}

function runPaymentIntent() {
    const res = http.post(BASE_URL + '/payments/create-intent', JSON.stringify({
        amount: randomInt(100, 2000),
        currency: 'usd',
        userId: 'user-' + randomInt(1, 5000),
        orderId: 'order-' + randomInt(1, 1000),
    }), { headers: authHeaders() });

    const success = check(res, {
        'payment intent created': (r) => r.status === 200 || r.status === 401,
        'payment not 5xx': (r) => r.status < 500,
    });
    paymentSuccessRate.add(success);
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (res.status === 200) paymentsProcessed.add(1);
    if (!success) errorsTotal.add(1);
}

function runGetOrder() {
    const res = http.get(BASE_URL + '/orders/order-' + randomInt(1, 1000), { headers: authHeaders() });
    const success = check(res, { 'get order ok': (r) => r.status === 200 || r.status === 401 || r.status === 404 });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runPaymentGateways() {
    const res = http.get(BASE_URL + '/payments/gateways', { headers: authHeaders() });
    const success = check(res, { 'gateways ok': (r) => r.status === 200 || r.status === 401 });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runAnalytics() {
    const res = http.get(BASE_URL + '/analytics/overview', { headers: authHeaders() });
    const success = check(res, { 'analytics ok': (r) => r.status === 200 || r.status === 401 || r.status === 403 });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

function runNotificationStats() {
    const res = http.get(BASE_URL + '/notification-queue/stats/overview', { headers: authHeaders() });
    const success = check(res, { 'notification stats ok': (r) => r.status === 200 || r.status === 401 || r.status === 403 });
    httpSuccessRate.add(success);
    httpReqDuration.add(res.timings.duration);
    if (!success) errorsTotal.add(1);
}

export default function () {
    activeVUs.add(1);

    const rand = Math.random();

    if (rand < 0.15) {
        runHealthCheck();
    } else if (rand < 0.30) {
        runRegister();
    } else if (rand < 0.45) {
        runLogin();
    } else if (rand < 0.55) {
        runBrowseRestaurants();
    } else if (rand < 0.65) {
        runSearch();
    } else if (rand < 0.72) {
        runRestaurantDetail();
    } else if (rand < 0.85) {
        runAuthMe();
    } else if (rand < 0.90) {
        runPlaceOrder();
    } else if (rand < 0.95) {
        runPaymentIntent();
    } else if (rand < 0.97) {
        runGetOrder();
    } else if (rand < 0.98) {
        runPaymentGateways();
    } else if (rand < 0.99) {
        runAnalytics();
    } else {
        runNotificationStats();
    }

    sleep(thinkTime());
    activeVUs.add(-1);
}

export function setup() {
    const health = http.get(BASE_URL + '/health');
    check(health, { 'setup health check': (r) => r.status === 200 });
    return {};
}

export function teardown(data) {
    const res = http.get(BASE_URL + '/metrics');
    check(res, { 'teardown metrics check': (r) => r.status === 200 || r.status === 401 || r.status === 403 });
}
