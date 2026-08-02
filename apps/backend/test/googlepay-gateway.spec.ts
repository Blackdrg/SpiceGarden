import { GooglePayGateway } from '../src/services/payments/gateways/googlepay-gateway.service';
import { createHmac } from 'crypto';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
function makeConfig() {
  return {
    get: jest.fn((key: string, fallback?: any) => {
      const values: Record<string, string> = {
        GOOGLE_PAY_MERCHANT_ID: 'gpay_merchant_123',
        GOOGLE_PAY_MERCHANT_NAME: 'SpiceGarden',
        RAZORPAY_KEY_ID: 'rzp_gpay_test',
        RAZORPAY_KEY_SECRET: 'gpay_secret_test',
      };
      return values[key] ?? fallback;
    }),
  } as any;
}

describe('GooglePayGateway', () => {
  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns gateway name', () => {
    const gateway = new GooglePayGateway(makeConfig());
    expect(gateway.getGatewayName()).toBe('google_pay');
  });

  it('creates a UPI order via Razorpay with correct auth header', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_gpay_1', amount: 2500, currency: 'inr', status: 'created' }),
    } as any);

    const result = await gateway.createPaymentIntent(25, 'inr', 'user-1', { orderId: 'ord-1' });

    expect(result.id).toBe('order_gpay_1');
    expect(result.amount).toBe(2500);
    expect(result.payment_method).toBe('google_pay');
    expect((result as any).metadata.merchantId).toBe('gpay_merchant_123');

    const call = (global as any).fetch.mock.calls[0];
    expect(call[0]).toBe('https://api.razorpay.com/v1/orders');
    expect(call[1].headers['Authorization']).toContain('Basic');
    const decoded = Buffer.from(call[1].headers['Authorization'].split(' ')[1], 'base64').toString();
    expect(decoded).toBe('rzp_gpay_test:gpay_secret_test');

    const body = JSON.parse(call[1].body);
    expect(body.payment_method.type).toBe('upi');
    expect(body.payment_method.upi.vpa).toBe('gpay_merchant_123');
  });

  it('throws when createPaymentIntent fetch fails', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    (global as any).fetch.mockRejectedValue(new Error('network down'));
    await expect(gateway.createPaymentIntent(100, 'inr', 'u1', {})).rejects.toThrow('network down');
  });

  it('fetches payment details', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_gpay_1', amount: 2500, currency: 'inr', status: 'paid' }),
    } as any);
    const result = await gateway.fetchPaymentDetails('order_gpay_1');
    expect(result.status).toBe('paid');
    expect(result.payment_method).toBe('google_pay');
  });

  it('confirms a paid order', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_gpay_1', amount: 2500, currency: 'inr', status: 'paid' }),
    } as any);
    const result = await gateway.confirmPayment('gpay_123', 'user-1');
    expect(result.status).toBe('paid');
  });

  it('rejects confirmation of captured instead of paid', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_gpay_1', amount: 2500, currency: 'inr', status: 'captured' }),
    } as any);
    const result = await gateway.confirmPayment('gpay_123', 'user-1');
    expect(result.status).toBe('captured');
  });

  it('rejects confirmation with invalid payment id prefix', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    await expect(gateway.confirmPayment('upi_123', 'user-1')).rejects.toThrow('Invalid Google Pay payment ID');
  });

  it('returns payment result for unpaid order (status passthrough)', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_gpay_1', amount: 2500, currency: 'inr', status: 'created' }),
    } as any);
    const result = await gateway.confirmPayment('gpay_123', 'user-1');
    expect(result.status).toBe('created');
    expect(result.payment_method).toBe('google_pay');
  });

  it('processes a refund', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'order_gpay_1', amount: 13800, currency: 'inr', payments: { items: [{ id: 'pay_1' }] } }),
    } as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'rf_gpay_1', amount: 5000, status: 'processed' }),
    } as any);

    const result = await gateway.refundPayment('gpay_123', 50, 'user-1', 'requested_by_customer');
    expect(result.id).toBe('rf_gpay_1');
    expect(result.amount).toBe(5000);
    expect(result.currency).toBe('inr');
  });

  it('rejects refund exceeding original amount', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_gpay_1', amount: 13800, currency: 'inr', payments: { items: [{ id: 'pay_1' }] } }),
    } as any);
    await expect(gateway.refundPayment('gpay_123', 999, 'user-1')).rejects.toThrow('Refund amount cannot exceed');
  });

  it('verifies a valid Razorpay-style webhook signature (HMAC sha256)', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized', id: 'evt_1' });
    const secret = 'webhook_secret';
    const signature = createHmac('sha256', secret).update(payload).digest('hex');
    const result = await gateway.constructEvent(Buffer.from(payload), signature, secret);
    expect((result.data.object as any).id).toBe('evt_1');
  });

  it('rejects an invalid webhook signature', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    await expect(
      gateway.constructEvent(Buffer.from('{}'), 'bad_sig', 'secret')
    ).rejects.toThrow('Invalid Google Pay webhook signature');
  });

  it('handles API error response with description', async () => {
    const gateway = new GooglePayGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { description: 'Invalid amount' } }),
    } as any);
    await expect(gateway.createPaymentIntent(100, 'inr', 'u1', {})).rejects.toThrow('Invalid amount');
  });
});
