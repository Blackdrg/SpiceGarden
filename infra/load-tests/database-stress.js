import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config } from './libs/config.js';

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const options = {
    stages: [
        { duration: '2m', target: 5000 },
        { duration: '20m', target: 5000 },
        { duration: '2m', target: 0 },
    ],
    thresholds: {
        'db_query_success_rate': ['rate>0.99'],
        'db_query_time': ['p(95)<1000'],
    },
};

const dbQuerySuccess = new Rate('db_query_success_rate');
const dbQueryTime = new Trend('db_query_time', true);

export default function () {
    const queries = [
        config.BASE_URL + '/orders?userId=test-user-' + __VU,
        config.BASE_URL + '/restaurants?lat=19.0760&lng=72.8777',
        config.BASE_URL + '/users/profile',
    ];
    
    const queryPath = queries[randomInt(0, queries.length - 1)];
    const res = http.get(queryPath);
    
    const success = check(res, {
        'db query success': (r) => r.status < 500,
    });
    
    dbQuerySuccess.add(success);
    dbQueryTime.add(res.timings.duration);
    
    sleep(0.5);
}

export function setup() {
    const health = http.get(config.BASE_URL + '/health');
    check(health, { 'db health check': (r) => r.status === 200 });
}