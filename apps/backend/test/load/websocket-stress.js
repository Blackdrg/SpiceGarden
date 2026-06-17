import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { WebSocket } from 'k6/ws';
import { randomInt } from 'k6/data';

const http_req_success = new Rate('http_req_success');
const ws_connection_success = new Rate('ws_connection_success');
const ws_message_success = new Rate('ws_message_success');
const ws_reconnect_success = new Rate('ws_reconnect_success');
const order_errors = new Counter('order_errors');

export const options = {
  scenarios: {
    ws_baseline: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      exec: 'testWSBaseline',
      tags: { ws: 'baseline' },
    },
    ws_stress_500: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '2m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 0 },
      ],
      exec: 'testWSStress',
      tags: { ws: '500' },
    },
    ws_stress_1000: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '3m', target: 1000 },
        { duration: '5m', target: 1000 },
        { duration: '3m', target: 0 },
      ],
      exec: 'testWSStress',
      tags: { ws: '1000' },
    },
    order_flood: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '30s', target: 200 },
        { duration: '2m', target: 2000 },
        { duration: '30s', target: 0 },
      ],
      exec: 'testOrderFlood',
      tags: { scenario: 'order-flood' },
    },
  },
  thresholds: {
    http_req_success: ['rate>0.90'],
    http_req_duration: ['p(95)<800'],
    ws_connection_success: ['rate>0.85'],
    ws_message_success: ['rate>0.80'],
    ws_reconnect_success: ['rate>0.70'],
  },
};

const WS_URL = __ENV.WS_URL || 'ws://localhost:3001';
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || 'test-token-123';

export function testWSBaseline() {
  testWebSocket('baseline');
  sleep(2);
}

export function testWSStress() {
  testWebSocket('stress');
  sleep(2);
}

export function testOrderFlood() {
  const vu = `${__VU}-${__ITER}`;
  const restaurantId = `rest-${(__VU % 5) + 1}`;
  const itemPrice = 100 + (__VU % 10) * 50;
  const quantity = 1 + (__VU % 3);
  const subtotal = itemPrice * quantity;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = Math.round(subtotal * 0.10 * 100) / 100;
  const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  group('Order Flood - Rapid Order Placement', () => {
    const payload = JSON.stringify({
      restaurantId,
      items: [{ itemId: `item-${(__VU % 10) + 1}`, quantity, price: itemPrice }],
      deliveryAddressId: `addr-${(__VU % 3) + 1}`,
      subtotal,
      tax,
      deliveryFee,
      grandTotal,
      userId: `flood-user-${__VU}`,
    });

    const res = http.post(`${BASE_URL}/orders`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      tags: { scenario: 'order-flood' },
    });

    const success = check(res, {
      'order handled': (r) => r.status === 201 || r.status === 429,
      'no server error': (r) => r.status < 500,
    });
    http_req_success.add(success);
    if (!success) order_errors.add(1);
  });

  sleep(0.2);
}

function testWebSocket(tag: string) {
  const url = `${WS_URL}/tracking?token=${API_TOKEN}`;
  const params = { tags: { ws: tag } };

  const res = new WebSocket(url, params, (socket) => {
    const connected = socket.isOpen();

    if (connected) {
      ws_connection_success.add(true);
    } else {
      ws_connection_success.add(false);
      socket.close();
      return;
    }

    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'ping' }));
    });

    socket.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.type === 'pong' || msg.status === 'ok') {
        ws_message_success.add(true);
      }
    });

    socket.on('error', () => {
      ws_message_success.add(false);
    });

    socket.setTimeout(() => {
      ws_message_success.add(false);
      socket.close();
    }, 3000);

    socket.setInterval(() => {
      if (socket.isOpen()) {
        socket.send(JSON.stringify({
          type: 'updateLocation',
          driverId: `driver-${__VU}`,
          lat: 30.7 + randomInt(0, 100) / 1000,
          lng: 76.7 + randomInt(0, 100) / 1000,
        }));
      }
    }, 1000);

    socket.setTimeout(() => {
      ws_reconnect_success.add(socket.isOpen());
      socket.close();
    }, 5000);
  });

  res.close();
}
