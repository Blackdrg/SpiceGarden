import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { PaytmGateway } from '../src/services/payments/gateways/paytm-gateway.service';

function makeConfig(overrides: Record<string, any> = {}) {
  return {
    get: jest.fn((key: string, fallback?: any) => {
      const values: Record<string, string> = {
        PAYTM_MERCHANT_ID: 'paytm_merchant_123',
        PAYTM_MERCHANT_KEY: 'paytm_merchant_key_abc',
        PAYTM_WEBSITE: 'WEBSTAGING',
        PAYTM_INDUSTRY_TYPE: 'Retail',
        PAYTM_CHANNEL_ID: 'WEB',
        PAYTM_ENVIRONMENT: 'sandbox',
        ...overrides,
      };
      return values[key] ?? fallback;
    }),
  } as any;
}

describe('PaytmGateway', () => {
  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('returns gateway name', () => {
    const gateway = new PaytmGateway(makeConfig());
    expect(gateway.getGatewayName()).toBe('paytm');
  });

  it('generates the correct Paytm checksum (sha256 base64)', () => {
    const gateway = new PaytmGateway(makeConfig());
    const body = JSON.stringify({ orderId: 'order1', amount: 100 });
    const expected = crypto.createHash('sha256').update(body + 'paytm_merchant_key_abc').digest('base64');
    const checksum = (gateway as any).generateChecksum(body);
    expect(checksum).toBe(expected);
  });

  it('constructs a real Paytm initiateTransaction request', async () => {
    const gateway = new PaytmGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        body: {
          resultInfo: { resultStatus: 'TXN_SUCCESS' },
          txnToken: 'txn_token_abc',
        },
      }),
    } as any);

    const result = await gateway.createPaymentIntent(200, 'inr', 'user-1', { orderId: 'ord-1' });

    expect(result.id).toMatch(/^paytm_\d+/);
    expect(result.amount).toBe(20000);
    expect(result.currency).toBe('INR');
    expect(result.client_secret).toBe('txn_token_abc');
    expect(result.payment_method).toBe('paytm');

    const call = (global as any).fetch.mock.calls[0];
    expect(call[0]).toBe('https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction');
    const headers = call[1].headers;
    expect(headers['CHECKSUMHASH']).toBeDefined();
    expect(headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(call[1].body);
    expect(body.mid).toBe('paytm_merchant_123');
    expect(body.websiteName).toBe('WEBSTAGING');
    expect(body.txnAmount.currency).toBe('INR');
    expect(body.txnAmount.value).toBe('200.00');
  });

  it('throws BadRequestException when Paytm API returns non-ok', async () => {
    const gateway = new PaytmGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Invalid request',
    } as any);
    await expect(gateway.createPaymentIntent(100, 'inr', 'user-1', {})).rejects.toThrow('Paytm API error: 400');
  });

  it('throws when Paytm response body is missing', async () => {
    const gateway = new PaytmGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, body: null }),
    } as any);
    await expect(gateway.createPaymentIntent(100, 'inr', 'user-1', {})).rejects.toThrow('Paytm payment intent creation failed');
  });

  it('fetches payment details via orderStatus', async () => {
    const gateway = new PaytmGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        body: { resultInfo: { resultStatus: 'TXN_SUCCESS' } },
      }),
    } as any);

    const result = await gateway.fetchPaymentDetails('paytm_12345');
    expect(result.id).toBe('paytm_12345');
    expect(result.status).toBe('succeeded');

    const call = (global as any).fetch.mock.calls[0];
    expect(call[0]).toBe('https://securegw-stage.paytm.in/theia/api/v1/orderStatus');
  });

  it('maps TXN_FAILED status to failed', async () => {
    const gateway = new PaytmGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        body: { resultInfo: { resultStatus: 'TXN_FAILED' } },
      }),
    } as any);
    const result = await gateway.fetchPaymentDetails('paytm_12345');
    expect(result.status).toBe('failed');
  });

  it('confirms a valid paytm payment id', async () => {
    const gateway = new PaytmGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        body: { resultInfo: { resultStatus: 'TXN_SUCCESS' } },
      }),
    } as any);
    const result = await gateway.confirmPayment('paytm_abc', 'user-1');
    expect(result.status).toBe('succeeded');
    expect(result.id).toBe('paytm_abc');
  });

  it('rejects confirmation of a non-paytm payment id', async () => {
    const gateway = new PaytmGateway(makeConfig());
    await expect(gateway.confirmPayment('upi_123', 'user-1')).rejects.toThrow('Invalid Paytm payment ID');
  });

  it('processes a refund via Paytm refund API', async () => {
    const gateway = new PaytmGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, body: { resultInfo: { resultStatus: 'TXN_SUCCESS' } } }),
    } as any);
    const result = await gateway.refundPayment('paytm_12345', 50, 'user-1', 'customer_requested');
    expect(result.id).toMatch(/^paytm_refund_\d+$/);
    expect(result.amount).toBe(50);
    expect(result.status).toBe('processing');
    const call = (global as any).fetch.mock.calls[0];
    expect(call[0]).toBe('https://securegw-stage.paytm.in/refund/api/v1/refund');
  });

  it('throws when refund fails', async () => {
    const gateway = new PaytmGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    } as any);
    await expect(gateway.refundPayment('paytm_12345', 50, 'user-1')).rejects.toThrow('Paytm refund failed');
  });

  it('verifies a valid Paytm webhook signature (sha256 base64)', async () => {
    const gateway = new PaytmGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized', id: 'evt_1' });
    const secret = 'webhook_secret_abc';
    const signature = crypto.createHash('sha256').update(payload + secret).digest('base64');
    const result = await gateway.constructEvent(Buffer.from(payload), signature, secret);
    expect((result.data.object as any).id).toBe('evt_1');
  });

  it('rejects an invalid Paytm webhook signature', async () => {
    const gateway = new PaytmGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized' });
    await expect(
      gateway.constructEvent(Buffer.from(payload), 'invalid_base64_sig', 'secret')
    ).rejects.toThrow('Invalid Paytm webhook signature');
  });

  it('uses production URL when PAYTM_ENVIRONMENT=production', () => {
    const gateway = new PaytmGateway(makeConfig({ PAYTM_ENVIRONMENT: 'production' }));
    expect((gateway as any).baseUrl).toBe('https://securegw.paytm.in');
  });
});
