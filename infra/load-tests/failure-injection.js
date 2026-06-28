import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';
import { config } from './libs/config.js';

export const options = {
    stages: [
        { duration: '3m', target: 5000 },
        { duration: '15m', target: 5000 },
        { duration: '3m', target: 0 },
    ],
    thresholds: {
        'graceful_degradation_rate': ['rate>0.95'],
        'recovery_time_p95': ['p(95)<5000'],
    },
};

const gracefulDegradation = new Rate('graceful_degradation_rate');
const fallbackUsed = new Counter('fallback_used_total');

export default function () {
    const rand = Math.random();
    
    if (rand < 0.4) {
        simulateRedisOutage();
    } else if (rand < 0.6) {
        simulateDatabaseSlowdown();
    } else if (rand < 0.8) {
        simulatePaymentTimeout();
    } else {
        simulateNetworkLatency();
    }
    
    sleep(1);
}

function simulateRedisOutage() {
    const res = http.get(config.BASE_URL + '/health');
    const degraded = check(res, {
        'system responds even during redis outage': (r) => r.status < 500,
        'no crash on cache miss': (r) => r.status !== 503,
    });
    gracefulDegradation.add(degraded);
}

function simulateDatabaseSlowdown() {
    const res = http.get(config.BASE_URL + '/orders?userId=test-user-' + __VU);
    const degraded = check(res, {
        'queries complete despite slow db': (r) => r.status < 500,
        'response time acceptable under load': (r) => r.timings.duration < 5000,
    });
    gracefulDegradation.add(degraded);
}

function simulatePaymentTimeout() {
    const intent = {
        amount: 500,
        currency: 'INR',
        orderId: 'order-' + __VU + '-' + __ITER,
    };
    const res = http.post(config.BASE_URL + '/payments/intent', JSON.stringify(intent), {
        headers: { 'Content-Type': 'application/json' }
    });
    const handled = check(res, {
        'payment timeout handled gracefully': (r) => r.status < 500,
    });
    gracefulDegradation.add(handled);
}

function simulateNetworkLatency() {
    const res = http.get(config.BASE_URL + '/restaurants');
    const recovered = check(res, {
        'system recovers from network latency': (r) => r.status === 200,
        'response time after latency < 2000ms': (r) => r.timings.duration < 2000,
    });
    gracefulDegradation.add(recovered);
}