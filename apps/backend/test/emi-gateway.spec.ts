/* eslint-env jest */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import * as crypto from 'crypto';
import { EmiGateway } from '../src/services/payments/gateways/emi-gateway.service';



function makeConfig() {
  return {
    get: jest.fn((key: string, fallback?: any) => {
      const values: Record<string, string> = {
        RAZORPAY_KEY_ID: 'rzp_emi_test',
        RAZORPAY_KEY_SECRET: 'emi_secret_test',
      };
      return values[key] ?? fallback;
    }),
  } as any;
}

describe('EmiGateway', () => {
  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns gateway name', () => {
    const gateway = new EmiGateway(makeConfig());
    expect(gateway.getGatewayName()).toBe('emi');
  });

  it('calculates EMI correctly using the standard formula', () => {
    const gateway = new EmiGateway(makeConfig());
    const emi = (gateway as any).calculateEmi(100000, 12, 12);
    // EMI = P * r * (1+r)^n / ((1+r)^n - 1) where r = 12/12/100 = 0.01, n = 12
    const expected = Math.round(((100000 * 0.01 * Math.pow(1.01, 12)) / (Math.pow(1.01, 12) - 1)) * 100) / 100;
    expect(emi).toBeCloseTo(expected, 2);
  });

  it('creates an EMI order with tenure and interest metadata', async () => {
    const gateway = new EmiGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_emi_1', amount: 2500, currency: 'inr', status: 'created' }),
    } as any);

    const result = await gateway.createPaymentIntent(25, 'inr', 'user-1', {
      orderId: 'ord-1',
      emiOptions: { tenureMonths: 6, bankCode: 'HDFC', interestRate: 14 },
    });

    expect(result.id).toBe('order_emi_1');
    expect(result.payment_method).toBe('emi');
    expect((result as any).metadata.emiTenure).toBe(6);
    expect((result as any).metadata.interestRate).toBe(14);
    expect(typeof (result as any).metadata.emiMonthlyAmount).toBe('number');

    const body = JSON.parse((global as any).fetch.mock.calls[0][1].body);
    expect(body.payment_method.type).toBe('emi');
    expect(body.payment_method.emi.tenure).toBe(6);
    expect(body.payment_method.emi.bank).toBe('HDFC');
  });

  it('defaults tenure to 3 months and interest rate to 12', async () => {
    const gateway = new EmiGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_emi_2', amount: 2500, currency: 'inr', status: 'created' }),
    } as any);

    await gateway.createPaymentIntent(25, 'inr', 'user-1', { orderId: 'ord-2' });
    const body = JSON.parse((global as any).fetch.mock.calls[0][1].body);
    expect(body.payment_method.emi.tenure).toBe(3);
    expect(body.notes.interestRate).toBe(12);
  });

  it('confirms a paid EMI order', async () => {
    const gateway = new EmiGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_emi_1', amount: 2500, currency: 'inr', status: 'captured' }),
    } as any);
    const result = await gateway.confirmPayment('emi_123', 'user-1');
    expect(result.status).toBe('captured');
    expect(result.payment_method).toBe('emi');
  });

  it('rejects confirmation of non-EMI payment id', async () => {
    const gateway = new EmiGateway(makeConfig());
    await expect(gateway.confirmPayment('gpay_123', 'user-1')).rejects.toThrow('Invalid EMI payment ID');
  });

  it('returns payment result for unpaid EMI order (status passthrough)', async () => {
    const gateway = new EmiGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_emi_1', amount: 2500, currency: 'inr', status: 'created' }),
    } as any);
    const result = await gateway.confirmPayment('emi_123', 'user-1');
    expect(result.status).toBe('created');
    expect(result.payment_method).toBe('emi');
  });

  it('fetches payment details', async () => {
    const gateway = new EmiGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_emi_1', amount: 2500, currency: 'inr', status: 'paid' }),
    } as any);
    const result = await gateway.fetchPaymentDetails('order_emi_1');
    expect(result.status).toBe('paid');
    expect(result.payment_method).toBe('emi');
  });

  it('refunds an EMI payment', async () => {
    const gateway = new EmiGateway(makeConfig());
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'order_emi_1', amount: 13800, currency: 'inr', payments: { items: [{ id: 'pay_1' }] } }),
    } as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'rf_emi_1', amount: 13800, status: 'processed' }),
    } as any);
    const result = await gateway.refundPayment('emi_123', null, 'user-1');
    expect(result.id).toBe('rf_emi_1');
    expect(result.status).toBe('processed');
  });

  it('verifies webhook signature', async () => {
    const gateway = new EmiGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized', id: 'evt_emi' });
    const secret = 'whsec_emi';
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const result = await gateway.constructEvent(Buffer.from(payload), signature, secret);
    expect((result.data.object as any).id).toBe('evt_emi');
  });

  it('rejects invalid webhook signature', async () => {
    const gateway = new EmiGateway(makeConfig());
    await expect(
      gateway.constructEvent(Buffer.from('{}'), 'bad', 'secret')
    ).rejects.toThrow('Invalid EMI webhook signature');
  });
});
