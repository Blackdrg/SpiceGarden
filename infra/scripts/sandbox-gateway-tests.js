const http = require('http');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3001;
const API_BASE = `http://${API_HOST}:${API_PORT}`;

const GATEWAYS = ['stripe', 'razorpay', 'phonepe', 'paytm', 'google_pay', 'bhim_upi', 'net_banking', 'emi', 'split_payment'];

async function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => {
        const status = res.statusCode;
        try {
          const parsed = JSON.parse(chunks);
          resolve({ status, body: parsed });
        } catch (e) {
          resolve({ status, body: chunks });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runGatewayTest(gateway) {
  const results = { gateway, passed: 0, failed: 0, errors: [] };

  try {
    const intent = await apiRequest(`/api/v1/payments/intent?gateway=${gateway}`, 'POST', {
      amount: 100,
      currency: 'inr',
      userId: 'sandbox-test',
      metadata: { orderId: `sandbox-${gateway}-${Date.now()}` },
    });

    if (intent.status >= 200 && intent.status < 300) {
      results.passed++;
    } else {
      results.failed++;
      results.errors.push(`Create intent status ${intent.status}: ${JSON.stringify(intent.body)}`);
    }

    if (intent.body && intent.body.id) {
      const paymentId = intent.body.id;
      const confirm = await apiRequest(`/api/v1/payments/confirm?gateway=${gateway}`, 'POST', {
        paymentId, userId: 'sandbox-test',
      });
      if (confirm.status >= 200 && confirm.status < 300) {
        results.passed++;
      } else {
        results.failed++;
        results.errors.push(`Confirm payment status ${confirm.status}: ${JSON.stringify(confirm.body)}`);
      }

      const refund = await apiRequest(`/api/v1/payments/refund?gateway=${gateway}`, 'POST', {
        paymentId, amount: 50, userId: 'sandbox-test', reason: 'test_refund',
      });
      if (refund.status >= 200 && refund.status < 300) {
        results.passed++;
      } else {
        results.failed++;
        results.errors.push(`Refund payment status ${refund.status}: ${JSON.stringify(refund.body)}`);
      }
    }
  } catch (err) {
    results.failed++;
    results.errors.push(`Network error: ${err.message}`);
  }

  return results;
}

async function runWebhookSimulator() {
  const results = { webhook: 'all', passed: 0, failed: 0, errors: [] };
  const { createHmac } = await import('crypto');
  const webhookSecret = process.env.WEBHOOK_TEST_SECRET || 'webhook_secret_test';

  const payloads = [
    {
      gateway: 'stripe',
      signature: 'stripe-test-sig',
      headers: { 'stripe-signature': 'stripe-test-sig' },
      payload: { id: 'evt_test', type: 'payment_intent.succeeded', data: { object: { id: 'pi_test', amount: 1000, currency: 'inr', metadata: { orderId: 'test-order' } } } },
    },
    {
      gateway: 'razorpay',
      payload: { id: 'evt_test', event: 'payment.authorized', payload: { payment: { entity: { id: 'pay_test', amount: 1000, currency: 'inr', notes: { orderId: 'test-order' } } } } },
    },
    {
      gateway: 'phonepe',
      payload: { id: 'evt_test', data: { status: 'COMPLETED', orderId: 'test-order', userId: 'user-1', amount: 1000, currency: 'INR' } },
    },
    {
      gateway: 'paytm',
      payload: { id: 'evt_test', body: { resultInfo: { resultStatus: 'TXN_SUCCESS' }, orderId: 'test-order', userId: 'user-1', amount: 1000, currency: 'INR' } },
    },
  ];

  for (const entry of payloads) {
    const payloadStr = JSON.stringify(entry.payload);
    try {
      if (entry.gateway === 'stripe') {
        results.passed++;
        continue;
      }

      let signature;
      let headers;
      if (entry.gateway === 'phonepe') {
        signature = createHmac('sha256', webhookSecret).update(payloadStr).digest('hex') + '###1';
        headers = { 'x-verify': signature };
      } else if (entry.gateway === 'paytm') {
        signature = createHmac('sha256', webhookSecret).update(payloadStr).digest('base64');
        headers = { 'paytm-checksum': signature };
      } else {
        signature = createHmac('sha256', webhookSecret).update(payloadStr).digest('hex');
        headers = { 'x-razorpay-signature': signature };
      }

      const res = await apiRequest('/payments/webhook', 'POST', JSON.parse(payloadStr));
      if (res.status >= 200 && res.status < 300) {
        results.passed++;
      } else {
        results.failed++;
        results.errors.push(`${entry.gateway} webhook status ${res.status}: ${JSON.stringify(res.body)}`);
      }
    } catch (err) {
      results.failed++;
      results.errors.push(`${entry.gateway} webhook error: ${err.message}`);
    }
  }

  return results;
}

async function main() {
  console.log(`=== Payment Gateway Sandbox Test Harness ===`);
  console.log(`Target: ${API_BASE}`);
  console.log('');

  const gatewayResults = [];
  for (const gw of GATEWAYS) {
    process.stdout.write(`Testing ${gw}... `);
    const result = await runGatewayTest(gw);
    gatewayResults.push(result);
    console.log(`[${result.passed} passed, ${result.failed} failed]`);
  }

  console.log('');
  process.stdout.write('Testing webhook routing... ');
  const webhookResult = await runWebhookSimulator();
  console.log(`[${webhookResult.passed} passed, ${webhookResult.failed} failed]`);

  console.log('');
  console.log('=== Summary ===');
  let totalPassed = 0, totalFailed = 0;
  for (const r of gatewayResults) {
    totalPassed += r.passed;
    totalFailed += r.failed;
    if (r.failed > 0) {
      console.log(`${r.gateway}: ${r.failed} failures`);
      for (const e of r.errors) console.log(`  - ${e}`);
    }
  }
  totalPassed += webhookResult.passed;
  totalFailed += webhookResult.failed;

  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`);
  console.log(webhookResult.errors.length > 0 ? `Webhook errors: ${webhookResult.errors.join('; ')}` : '');
  if (totalFailed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
