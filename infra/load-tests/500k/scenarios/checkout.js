// infra/load-tests/500k/scenarios/checkout.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../helpers/config.js';
import { MENU_ITEMS_SEEDS, RESTAURANT_SEEDS, getRandomElement, getRandomInt } from '../helpers/data.js';
import { getCustomerAuthHeaders } from '../helpers/auth.js';
import { checkoutDuration, checkoutSuccessRate, ordersPlacedTotal, paymentIntentsTotal } from '../helpers/metrics.js';

export function runCheckout() {
  const start = Date.now();
  const auth = getCustomerAuthHeaders(__VU, __ITER);
  const restaurant = getRandomElement(RESTAURANT_SEEDS);
  const item = getRandomElement(MENU_ITEMS_SEEDS);
  const quantity = getRandomInt(1, 3);
  const subtotal = item.price * quantity;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = 40;
  const grandTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;
  const idempotencyKey = `idem_${auth.userId}_${Date.now()}_${getRandomInt(1000, 9999)}`;

  const orderPayload = JSON.stringify({
    userId: auth.userId,
    restaurantId: restaurant.id,
    items: [
      {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: quantity,
      },
    ],
    subtotal: subtotal,
    tax: tax,
    deliveryFee: deliveryFee,
    grandTotal: grandTotal,
    deliveryAddressId: `addr_${auth.userId}_primary`,
  });

  const headers = Object.assign({}, auth.headers, {
    'x-idempotency-key': idempotencyKey,
  });

  // 1. Place Real Order
  const resOrder = http.post(`${CONFIG.baseUrl}/orders`, orderPayload, {
    headers: headers,
    tags: { scenario: 'checkout', endpoint: '/orders' },
    timeout: CONFIG.requestTimeout,
  });

  if (resOrder.status !== 200 && resOrder.status !== 201) {
    console.log(`[CHECKOUT_FAIL] Status: ${resOrder.status}, Body: ${resOrder.body}`);
  }

  const orderOk = check(resOrder, {
    'order placed 200/201': (r) => r.status === 200 || r.status === 201,
  });

  let paymentOk = false;
  if (orderOk && resOrder.json('id')) {
    ordersPlacedTotal.add(1);
    const orderId = resOrder.json('id');

    // 2. Create Legitimate Payment Intent (using Sandbox / COD test mode)
    const paymentPayload = JSON.stringify({
      userId: auth.userId,
      amount: grandTotal,
      currency: 'INR',
      orderId: orderId,
    });

    const resPayment = http.post(`${CONFIG.baseUrl}/payments/create-intent?gateway=cod`, paymentPayload, {
      headers: headers,
      tags: { scenario: 'checkout', endpoint: '/payments/create-intent' },
      timeout: CONFIG.requestTimeout,
    });

    paymentOk = check(resPayment, {
      'payment intent created 200': (r) => r.status === 200,
    });

    if (paymentOk) {
      paymentIntentsTotal.add(1);
    }
  }

  const overallSuccess = orderOk && (paymentOk || !resOrder.json('id'));
  checkoutSuccessRate.add(overallSuccess);
  checkoutDuration.add(Date.now() - start);

  const thinkTime = (getRandomInt(1000, 2000) / 1000);
  sleep(thinkTime);
}
