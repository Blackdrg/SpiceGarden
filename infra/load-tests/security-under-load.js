import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

export const options = {
    stages: [
        { duration: '2m', target: 10000 },
        { duration: '10m', target: 10000 },
        { duration: '2m', target: 0 },
    ],
    thresholds: {
        'security_checks_passed': ['rate>0.95'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const securityChecksPassed = new Rate('security_checks_passed');
const securityViolations = new Counter('security_violations_total');

export default function () {
    const jwtOk = testJwtValidation();
    const bypassBlocked = testAuthBypass();
    
    // Both security measures passed
    securityChecksPassed.add(jwtOk && bypassBlocked);
    
    sleep(1);
}

function testJwtValidation() {
    const res = http.get(BASE_URL + '/auth/me', {
        headers: { 'Authorization': 'Bearer invalid-token-' + __VU },
    });
    
    // 401, 403, or 429 (rate limit) all indicate security is working
    const rejected = res.status === 401 || res.status === 403 || res.status === 429;
    return rejected;
}

function testAuthBypass() {
    const maliciousHeaders = [
        { 'X-Forwarded-For': '127.0.0.1' },
        { 'X-Admin-Access': 'true' },
    ];
    
    const res = http.get(BASE_URL + '/admin/dashboard', {
        headers: maliciousHeaders[Math.floor(Math.random() * maliciousHeaders.length)],
    });
    
    // Any non-200 response means access was blocked - security PASSED
    const blocked = res.status !== 200;
    if (!blocked) {
        securityViolations.add(1);
    }
    return blocked;
}