import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const http_req_success = new Rate('http_req_success');
const http_req_duration = new Trend('http_req_duration');
const order_errors = new Counter('order_errors');
const coupon_errors = new Counter('coupon_errors');

export const options = {
  scenarios: {
    friday_dinner_rush: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '0s',
      stages: [
        { duration: '2m', target: 1000 },
        { duration: '10m', target: 3000 },
        { duration: '5m', target: 5000 },
        { duration: '5m', target: 5000 },
        { duration: '3m', target: 0 },
      ],
      exec: 'testFridayDinnerRush',
      tags: { scenario: 'friday-rush' },
    },
  },
  thresholds: {
    http_req_success: ['rate>0.90'],
    http_req_duration: ['p(95)<2000'],
    'http_req_duration{scenario:friday-rush}': ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_TOKEN = __ENV.API_TOKEN || 'test-token-123';

const popularItems = [
  { itemId: 'item-biryani', price: 350, name: 'Chicken Biryani' },
  { itemId: 'item-karahi', price: 420, name: 'Beef Karahi' },
  { itemId: 'item-burger', price: 250, name: 'Zinger Burger' },
  { itemId: 'item-pizza', price: 380, name: 'Margherita Pizza' },
  { itemId: 'item-naan', price: 40, name: 'Garlic Naan' },
  { itemId: 'item-dal', price: 280, name: 'Dal Makhani' },
  { itemId: 'item-pasta', price: 320, name: 'Pasta Alfredo' },
  { itemId: 'item-fries', price: 120, name: 'Large Fries' },
];

const restaurants = [
  { id: 'rest-1', name: 'Downtown', busy: true },
  { id: 'rest-2', name: 'Mall Road', busy: true },
  { id: 'rest-3', name: 'Gulshan', busy: true },
  { id: 'rest-4', name: 'Phase 8', busy: false },
  { id: 'rest-5', name: 'Sector 17', busy: false },
];

const couponCodes = ['FRIDAY20', 'WEEKEND30', 'RUSH15', 'FAMILY50', 'HAPPYHOUR', null, null, null];

export function testFridayDinnerRush() {
  const vu = `${__VU}-${__ITER}`;

  const restaurant = restaurants[__VU % restaurants.length];
  const item = popularItems[Math.floor(Math.random() * popularItems.length)];
  const quantity = Math.floor(Math.random() * 4) + 1;
  const itemTotal = item.price * quantity;
  const subtotal = itemTotal;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = Math.round(Math.max(subtotal * 0.10, 50) * 100) / 100;
  const discount = Math.round(subtotal * 0.15 * 100) / 100;
  const grandTotal = Math.round((subtotal + tax + deliveryFee - discount) * 100) / 100;
  const couponCode = couponCodes[Math.floor(Math.random() * couponCodes.length)];

  group('Friday Dinner Rush - Browse', () => {
    const res = http.get(`${BASE_URL}/restaurants?page=1&limit=20&sort=popular`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      tags: { scenario: 'friday-rush', action: 'browse' },
    });

    check(res, { 'restaurants loaded': (r) => r.status === 200 });
    http_req_success.add(res.status === 200);
  });

  sleep(0.3);

  group('Friday Dinner Rush - View Menu', () => {
    const res = http.get(`${BASE_URL}/menu/${restaurant.id}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      tags: { scenario: 'friday-rush', action: 'menu' },
    });

    check(res, { 'menu loaded': (r) => r.status === 200 });
    http_req_success.add(res.status === 200);
  });

  sleep(0.3);

  group('Friday Dinner Rush - Place Order', () => {
    const payload = JSON.stringify({
      userId: `rush-user-${__VU}`,
      restaurantId: restaurant.id,
      items: [{ itemId: item.itemId, name: item.name, price: item.price, quantity }],
      deliveryAddressId: `addr-${(Math.floor(Math.random() * 10) + 1)}`,
      subtotal,
      tax,
      deliveryFee,
      discount,
      grandTotal,
      couponId: couponCode,
    });

    const res = http.post(`${BASE_URL}/orders`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
        'Idempotency-Key': `friday-rush-${vu}`,
      },
      tags: { scenario: 'friday-rush', action: 'order' },
    });

    const success = check(res, {
      'order placed or queued': (r) => r.status === 201 || r.status === 429,
      'no server error': (r) => r.status < 500,
    });

    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);
    if (!success) order_errors.add(1);
  });

  sleep(0.5);
}
