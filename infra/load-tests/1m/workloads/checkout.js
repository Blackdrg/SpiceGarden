// infra/load-tests/1m/workloads/checkout.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runCheckout(tenant, user, items) {
  const item = items[Math.floor(Math.random() * items.length)];
  const idempotencyKey = 'idem_' + user.userId + '_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token,
    'Idempotency-Key': idempotencyKey
  });

  const orderPayload = JSON.stringify({
    tenantId: tenant.tenantId,
    userId: user.userId,
    restaurantId: item.restaurantId,
    items: [{ itemId: item.itemId, quantity: 1, unitPrice: item.price }],
    totalAmount: item.price,
    paymentMethod: 'mock_sandbox',
    deliveryAddress: { street: '42 Main St', city: 'Delhi', pincode: '110001' }
  });

  // 1. Create Order
  const resOrder = http.post(`${CONFIG.baseUrl}/orders/create`, orderPayload, {
    headers: headers,
    tags: { scenario: 'checkout', endpoint: '/orders/create' }
  });

  const ok = check(resOrder, {
    'order created 201/200': (r) => r.status === 200 || r.status === 201
  });

  if (ok && resOrder.json('orderId')) {
    const orderId = resOrder.json('orderId');
    // 2. Create Payment Intent
    const paymentPayload = JSON.stringify({
      orderId: orderId,
      tenantId: tenant.tenantId,
      amount: item.price,
      currency: 'INR',
      idempotencyKey: idempotencyKey
    });

    const resPay = http.post(`${CONFIG.baseUrl}/payments/create-intent`, paymentPayload, {
      headers: headers,
      tags: { scenario: 'checkout', endpoint: '/payments/create-intent' }
    });

    check(resPay, {
      'payment intent status 200/201': (r) => r.status === 200 || r.status === 201
    });
  }

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
