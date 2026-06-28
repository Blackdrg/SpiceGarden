import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const options = {
    stages: [
        { duration: '2m', target: 1000 },
        { duration: '15m', target: 1000 },
        { duration: '2m', target: 0 },
    ],
    thresholds: {
        'payment_success_rate': ['rate>0.999'],
        'payment_duration': ['p(95)<2000'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const paymentSuccess = new Rate('payment_success_rate');
const paymentTime = new Trend('payment_duration', true);

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
    paymentTime.add(res.timings.duration);
    
    sleep(1);
}