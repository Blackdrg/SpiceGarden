import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import * as crypto from 'crypto';
import { SplitPaymentGateway } from '../src/services/payments/gateways/split-payment-gateway.service';

function makeConfig() {
  return {
    get: jest.fn((key: string, fallback?: any) => {
      const values: Record<string, string> = {
        RAZORPAY_KEY_ID: 'rzp_split_test',
        RAZORPAY_KEY_SECRET: 'split_secret_test',
      };
      return values[key] ?? fallback;
    }),
  } as any;
}

describe('SplitPaymentGateway', () => {
  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('returns gateway name', () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    expect(gateway.getGatewayName()).toBe('split_payment');
  });

  it('creates a split payment order and computes split details', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_split_1', amount: 10000, currency: 'inr', status: 'created' }),
    } as any);

    const result = await gateway.createPaymentIntent(100, 'inr', 'user-1', {
      splits: [
        { gateway: 'restaurant', amount: 70, splitType: 'percentage' },
        { gateway: 'delivery', amount: 10, splitType: 'fixed' },
      ],
    });

    expect(result.id).toBe('order_split_1');
    expect(result.payment_method).toBe('split_payment');
    expect((result as any).metadata.totalAmount).toBe(100);
    expect((result as any).metadata.splits.restaurant).toBeDefined();
    expect((result as any).metadata.splits.delivery).toBeDefined();
    expect((result as any).metadata.splits.delivery.calculatedAmount).toBe(10);
    expect((result as any).metadata.splits.restaurant.calculatedAmount).toBe(70);

    const body = JSON.parse((global as any).fetch.mock.calls[0][1].body);
    expect(body.notes.totalSplitAmount).toBe(80);
  });

  it('handles empty splits (no breakdown)', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_split_2', amount: 10000, currency: 'inr', status: 'created' }),
    } as any);

    const result = await gateway.createPaymentIntent(100, 'inr', 'user-1', {});
    expect((result as any).metadata.totalSplitAmount).toBe(0);
    const body = JSON.parse((global as any).fetch.mock.calls[0][1].body);
    expect(body.notes.totalSplitAmount).toBe(0);
  });

  it('confirms a paid split payment', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_split_1', amount: 10000, currency: 'inr', status: 'paid' }),
    } as any);
    const result = await gateway.confirmPayment('split_123', 'user-1');
    expect(result.status).toBe('paid');
    expect(result.payment_method).toBe('split_payment');
  });

  it('rejects confirmation of non-split payment id', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    await expect(gateway.confirmPayment('gpay_123', 'user-1')).rejects.toThrow('Invalid split payment ID');
  });

  it('returns payment result for unpaid order (status passthrough)', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_split_1', amount: 10000, currency: 'inr', status: 'created' }),
    } as any);
    const result = await gateway.confirmPayment('split_123', 'user-1');
    expect(result.status).toBe('created');
    expect(result.payment_method).toBe('split_payment');
  });

  it('fetches payment details', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_split_1', amount: 10000, currency: 'inr', status: 'paid' }),
    } as any);
    const result = await gateway.fetchPaymentDetails('order_split_1');
    expect(result.payment_method).toBe('split_payment');
  });

  it('refunds a split payment', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'order_split_1', amount: 13800, currency: 'inr', payments: { items: [{ id: 'pay_1' }] } }),
    } as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'rf_split_1', amount: 13800, status: 'processed' }),
    } as any);
    const result = await gateway.refundPayment('split_123', 50, 'user-1');
    expect(result.id).toBe('rf_split_1');
  });

  it('verifies webhook signature', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized', id: 'evt_split' });
    const secret = 'whsec_split';
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const result = await gateway.constructEvent(Buffer.from(payload), signature, secret);
    expect((result.data.object as any).id).toBe('evt_split');
  });

  it('rejects invalid webhook signature', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    await expect(
      gateway.constructEvent(Buffer.from('{}'), 'bad', 'secret')
    ).rejects.toThrow('Invalid Split Payment webhook signature');
  });

  it('throws when refund exceeds original amount', async () => {
    const gateway = new SplitPaymentGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_split_1', amount: 100, currency: 'inr', payments: { items: [{ id: 'pay_1' }] } }),
    } as any);
    await expect(gateway.refundPayment('split_123', 999, 'user-1')).rejects.toThrow('Refund amount cannot exceed');
  });
});
