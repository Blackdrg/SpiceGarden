// infra/load-tests/500k/scenarios/cart.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../helpers/config.js';
import { MENU_ITEMS_SEEDS, RESTAURANT_SEEDS, getRandomElement, getRandomInt } from '../helpers/data.js';
import { getCustomerAuthHeaders } from '../helpers/auth.js';
import { cartDuration, cartSuccessRate } from '../helpers/metrics.js';

export function runCart() {
  const start = Date.now();
  const auth = getCustomerAuthHeaders(__VU, __ITER);
  const restaurant = getRandomElement(RESTAURANT_SEEDS);
  // 1. Fetch Restaurant Details and Menu Items
  const resItems = http.get(`${CONFIG.baseUrl}/restaurants/${restaurant.slug}`, {
    headers: auth.headers,
    tags: { scenario: 'cart', endpoint: '/restaurants/:slug' },
    timeout: CONFIG.requestTimeout,
  });

  const itemsOk = check(resItems, {
    'cart menu items status 200': (r) => r.status === 200,
  });

  // 2. Fetch User Delivery Addresses
  const resAddr = http.get(`${CONFIG.baseUrl}/user/addresses`, {
    headers: auth.headers,
    tags: { scenario: 'cart', endpoint: '/user/addresses' },
    timeout: CONFIG.requestTimeout,
  });

  const addrOk = check(resAddr, {
    'addresses status ok': (r) => r.status === 200,
  });

  const overallSuccess = itemsOk && addrOk;
  cartSuccessRate.add(overallSuccess);
  cartDuration.add(Date.now() - start);

  const thinkTime = (getRandomInt(500, 1500) / 1000);
  sleep(thinkTime);
}
