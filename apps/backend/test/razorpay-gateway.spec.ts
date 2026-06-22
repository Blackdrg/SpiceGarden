import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { RazorpayGateway } from '../src/services/payments/gateways/razorpay-gateway.service';

function createGateway() {
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'RAZORPAY_KEY_ID') return 'rzp_test_mock';
      if (key === 'RAZORPAY_KEY_SECRET') return 'secret_mock';
      return undefined;
    }),
  } as any;

  return {
    gateway: new RazorpayGateway(configService),
    configService,
  };
}

describe('RazorpayGateway', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns gateway name', () => {
    const { gateway } = createGateway();
    expect(gateway.getGatewayName()).toBe('razorpay');
  });

  it('creates a payment order with mocked fetch', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_123',
        amount: 2500,
        currency: 'INR',
        status: 'created',
      }),
    } as any);

    const result = await gateway.createPaymentIntent(25, 'inr', 'user-1', { orderId: 'order-1' });

    expect(result.id).toBe('order_123');
    expect(result.amount).toBe(25);
    expect(result.currency).toBe('INR');
    expect(result.status).toBe('created');
    expect(result.client_secret).toBe('order_123');
    expect((global as any).fetch).toHaveBeenCalledWith(
      'https://api.razorpay.com/v1/orders',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('amount'),
      }),
    );
  });

  it('passes amount in paise for INR', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_paise',
        amount: 5000,
        currency: 'INR',
        status: 'created',
      }),
    } as any);

    await gateway.createPaymentIntent(50, 'inr', 'user-1');

    const body = JSON.parse((global as any).fetch.mock.calls[0][1].body);
    expect(body.amount).toBe(5000);
    expect(body.currency).toBe('inr');
  });

  it('includes user metadata in notes', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_md',
        amount: 1000,
        currency: 'INR',
        status: 'created',
      }),
    } as any);

    await gateway.createPaymentIntent(10, 'inr', 'user-42', { orderId: 'ord-1' });

    const body = JSON.parse((global as any).fetch.mock.calls[0][1].body);
    expect(body.notes.userId).toBe('user-42');
    expect(body.notes.orderId).toBe('ord-1');
  });

  it('fetches payment details', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_fetch',
        amount: 1500,
        currency: 'INR',
        status: 'paid',
      }),
    } as any);

    const result = await gateway.fetchPaymentDetails('order_fetch');

    expect(result.id).toBe('order_fetch');
    expect(result.amount).toBe(15);
    expect(result.currency).toBe('INR');
    expect(result.status).toBe('paid');
  });

  it('confirms a paid order', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_paid',
        amount: 2000,
        currency: 'INR',
        status: 'paid',
      }),
    } as any);

    const result = await gateway.confirmPayment('order_paid', 'user-1');

    expect(result.status).toBe('paid');
    expect(result.id).toBe('order_paid');
  });

  it('confirms a captured order', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_captured',
        amount: 3000,
        currency: 'INR',
        status: 'captured',
      }),
    } as any);

    const result = await gateway.confirmPayment('order_captured', 'user-1');

    expect(result.status).toBe('captured');
  });

  it('rejects confirmation of an unpaid order', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_unpaid',
        amount: 3000,
        currency: 'INR',
        status: 'created',
      }),
    } as any);

    await expect(gateway.confirmPayment('order_unpaid', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('refunds a payment', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'order_ref',
        amount: 10000,
        currency: 'INR',
        status: 'paid',
        payments: {
          items: [{ id: 'pay_123' }],
        },
      }),
    } as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'rfnd_123',
        amount: 5000,
        status: 'processed',
      }),
    } as any);

    const result = await gateway.refundPayment('order_ref', 50, 'user-1', 'requested_by_customer');

    expect(result.id).toBe('rfnd_123');
    expect(result.amount).toBe(50);
    expect(result.currency).toBe('INR');
  });

  it('rejects refund exceeding original amount', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_ref_over',
        amount: 5000,
        currency: 'INR',
        status: 'paid',
        payments: { items: [{ id: 'pay_1' }] },
      }),
    } as any);

    await expect(gateway.refundPayment('order_ref_over', 100, 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('rejects non-positive refund amounts', async () => {
    const { gateway } = createGateway();
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_ref_zero',
        amount: 5000,
        currency: 'INR',
        status: 'paid',
        payments: { items: [{ id: 'pay_2' }] },
      }),
    } as any);

    await expect(gateway.refundPayment('order_ref_zero', 0, 'user-1')).rejects.toThrow(BadRequestException);
    await expect(gateway.refundPayment('order_ref_zero', -10, 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('verifies a valid Razorpay webhook signature', async () => {
    const { gateway } = createGateway();
    const payload = Buffer.from(JSON.stringify({ event: 'payment.captured', entity: {} }));
    const secret = 'razorpay_webhook_secret';

    const hmac = require('crypto').createHmac('sha256', secret).update(payload.toString()).digest('hex');
    const signature = hmac;

    const result = await gateway.constructEvent(payload, signature, secret);

    expect(result.data.object).toEqual({});
  });

  it('rejects an invalid Razorpay webhook signature', async () => {
    const { gateway } = createGateway();
    const payload = Buffer.from(JSON.stringify({ event: 'payment.captured' }));

    await expect(gateway.constructEvent(payload, 'invalid_signature', 'secret')).rejects.toThrow('Invalid webhook signature');
  });
});
