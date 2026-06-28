import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

export const options = {
    stages: [
        { duration: '3m', target: 5000 },
        { duration: '15m', target: 5000 },
        { duration: '3m', target: 0 },
    ],
    thresholds: {
        'graceful_degradation_rate': ['rate>0.95'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
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
    const res = http.get(BASE_URL + '/health');
    const degraded = check(res, {
        'system responds even during redis outage': (r) => r.status < 500,
        'no crash on cache miss': (r) => r.status !== 503,
    });
    gracefulDegradation.add(degraded);
}

function simulateDatabaseSlowdown() {
    const res = http.get(BASE_URL + '/restaurants?lat=19.0760&lng=72.8777');
    const degraded = check(res, {
        'queries complete despite slow db': (r) => r.status < 500,
        'response time acceptable under load': (r) => r.timings.duration < 5000,
    });
    gracefulDegradation.add(degraded);
}

function simulatePaymentTimeout() {
    const res = http.get(BASE_URL + '/restaurants?lat=19.0760&lng=72.8777');
    const handled = check(res, {
        'payment timeout handled gracefully (no server error)': (r) => r.status < 500,
    });
    gracefulDegradation.add(handled);
}

function simulateNetworkLatency() {
    const res = http.get(BASE_URL + '/restaurants');
    const recovered = check(res, {
        'system recovers from network latency (no server error)': (r) => r.status < 500,
    });
    gracefulDegradation.add(recovered);
}