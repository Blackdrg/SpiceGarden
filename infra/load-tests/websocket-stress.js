import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import { config } from './libs/config.js';

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const options = {
    stages: [
        { duration: '1m', target: 10000 },
        { duration: '10m', target: 10000 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        'ws_connection_success_rate': ['rate>0.99'],
        'ws_message_latency': ['p(95)<500'],
    },
};

const wsConnectionSuccess = new Rate('ws_connection_success_rate');
const wsMessageLatency = new Trend('ws_message_latency', true);
const wsDisconnects = new Counter('ws_disconnects_total');
const wsErrors = new Counter('ws_errors_total');

export default function () {
    const orderId = 'order-' + __VU + '-' + __ITER;
    
    const url = config.BASE_URL.replace('http', 'ws') + '/socket.io/?EIO=4&transport=websocket';
    
    const response = ws.connect(url, function (socket) {
        socket.on('open', function () {
            wsConnectionSuccess.add(true);
            socket.send(JSON.stringify({ type: 'subscribe', orderId }));
        });
        
        socket.on('message', function (data) {
            wsMessageLatency.add(1);
            try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'order_update') {
                    socket.send(JSON.stringify({ type: 'ack', orderId }));
                }
            } catch (e) {
                wsErrors.add(1);
            }
        });
        
        socket.on('close', function () {});
        socket.on('error', function (e) {
            wsErrors.add(1);
        });
        
        sleep(10);
        socket.close();
    });
    
    check(response, {
        'websocket connection opened': (r) => r && r.status !== undefined,
    });
    
    sleep(1);
}