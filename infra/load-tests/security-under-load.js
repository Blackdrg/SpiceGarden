import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';
import { config } from './libs/config.js';

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const options = {
    stages: [
        { duration: '2m', target: 10000 },
        { duration: '10m', target: 10000 },
        { duration: '2m', target: 0 },
    ],
    thresholds: {
        'no_auth_bypass': ['rate>0.999'],
    },
};

const noAuthBypass = new Rate('no_auth_bypass');
const securityViolations = new Counter('security_violations_total');

export default function () {
    if (Math.random() < 0.5) {
        testRateLimiting();
    } else if (Math.random() < 0.7) {
        testJwtValidation();
    } else {
        testAuthBypass();
    }
    
    sleep(0.5);
}

function testRateLimiting() {
    for (let i = 0; i < 20; i++) {
        http.post(config.BASE_URL + '/auth/login', JSON.stringify({
            email: 'test@test.com',
            password: 'wrongpassword',
        }), { headers: { 'Content-Type': 'application/json' } });
    }
}

function testJwtValidation() {
    const res = http.get(config.BASE_URL + '/users/profile', {
        headers: { 'Authorization': 'Bearer invalid-token-' + __VU }
    });
    
    const rejected = res.status === 401 || res.status === 403;
    noAuthBypass.add(rejected);
}

function testAuthBypass() {
    const maliciousHeaders = [
        { 'X-Forwarded-For': '127.0.0.1' },
        { 'X-Admin-Access': 'true' },
    ];
    
    const res = http.get(config.BASE_URL + '/admin/users', {
        headers: maliciousHeaders[Math.floor(Math.random() * maliciousHeaders.length)]
    });
    
    const blocked = res.status !== 200;
    noAuthBypass.add(blocked);
    
    if (!blocked) {
        securityViolations.add(1);
    }
}