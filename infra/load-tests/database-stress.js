import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

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

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const dbQuerySuccess = new Rate('db_query_success_rate');
const dbQueryTime = new Trend('db_query_time', true);

export default function () {
    const queries = [
        BASE_URL + '/restaurants?lat=19.0760&lng=72.8777',
        BASE_URL + '/restaurants/search?q=biryani',
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
    const health = http.get(BASE_URL + '/health');
    check(health, { 'db health check': (r) => r.status === 200 });
}