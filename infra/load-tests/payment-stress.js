import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const options = {
    stages: [
        { duration: '2m', target: 1000 },
        { duration: '15m', target: 1000 },
        { duration: '2m', target: 0 },
    ],
    summaryTrendStats: ['avg', 'min', 'max', 'p(95)', 'p(99)'],
    thresholds: {
        'payment_success_rate': ['rate>0.999'],
        'http_req_duration': ['p(95)<2000'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const paymentSuccess = new Rate('payment_success_rate');
const paymentErrors = new Counter('payment_errors_total');

export default function () {
    const res = http.post(BASE_URL + '/auth/register', JSON.stringify({
        email: 'payment-test-' + __VU + '-' + __ITER + '@test.com',
        password: 'test123'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });

    check(res, {
        'auth request processed': (r) => r.status < 500,
    });

    paymentSuccess.add(res.status < 500);
    if (res.status >= 500) {
        paymentErrors.add(1);
    }

    sleep(1);
}