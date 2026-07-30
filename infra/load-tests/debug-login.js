import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '5s', target: 1 },
        { duration: '10s', target: 1 },
        { duration: '5s', target: 0 },
    ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
    const email = 'loadtest-debug@spicegarden.test';
    const password = 'LoadTest#2026';

    const registerRes = http.post(BASE_URL + '/auth/register', JSON.stringify({
        fullName: 'Debug User',
        email: email,
        password: password,
        phone: '+919999999999',
    }), { headers: { 'Content-Type': 'application/json' } });

    console.log('Register status:', registerRes.status);
    console.log('Register body:', registerRes.body.substring(0, 200));

    const loginRes = http.post(BASE_URL + '/auth/login', JSON.stringify({
        email: email,
        password: password,
    }), { headers: { 'Content-Type': 'application/json' } });

    console.log('Login status:', loginRes.status);
    console.log('Login body:', loginRes.body.substring(0, 200));

    check(loginRes, {
        'login 200/201': (r) => r.status === 200 || r.status === 201,
    });

    sleep(1);
}
