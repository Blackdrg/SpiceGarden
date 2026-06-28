import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';
import { config } from './libs/config.js';

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

const paymentSuccess = new Rate('payment_success_rate');
const paymentTime = new Trend('payment_duration', true);

export default function () {
    const paymentIntent = {
        amount: randomInt(200, 2000),
        currency: 'INR',
        orderId: 'order-' + __VU + '-' + __ITER,
        idempotencyKey: 'payment-' + __VU + '-' + __ITER,
    };
    
    const res = http.post(config.BASE_URL + '/payments/intent', JSON.stringify(paymentIntent), {
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': paymentIntent.idempotencyKey }
    });
    
    check(res, {
        'payment intent created': (r) => r.status === 200 || r.status === 201,
    });
    
    paymentSuccess.add(res.status < 500);
    paymentTime.add(res.timings.duration);
    
    sleep(1);
}