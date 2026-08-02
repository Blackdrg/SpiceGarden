/* eslint-disable jest/no-jest-import */
import * as crypto from 'crypto';
import { NetBankingGateway } from '../src/services/payments/gateways/netbanking-gateway.service';

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
function makeConfig() {
  return {
    get: jest.fn((key: string, fallback?: any) => {
      const values: Record<string, string> = {
        RAZORPAY_KEY_ID: 'rzp_nb_test',
        RAZORPAY_KEY_SECRET: 'nb_secret_test',
      };
      return values[key] ?? fallback;
    }),
  } as any;
}

describe('NetBankingGateway', () => {
  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns gateway name', () => {
    const gateway = new NetBankingGateway(makeConfig());
    expect(gateway.getGatewayName()).toBe('net_banking');
  });

  it('returns supported banks list', () => {
    const gateway = new NetBankingGateway(makeConfig());
    const banks = gateway.getSupportedBanks();
    expect(banks.HDFC).toBe('HDFC Bank');
    expect(banks.SBI).toBe('State Bank of India');
    expect(banks.ICICI).toBe('ICICI Bank');
  });

  it('creates a netbanking order with specified bank code', async () => {
    const gateway = new NetBankingGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_nb_1', amount: 5000, currency: 'inr', status: 'created' }),
    } as any);

    const result = await gateway.createPaymentIntent(50, 'inr', 'user-1', {
      orderId: 'ord-1',
      options: { bankCode: 'SBI', bankName: 'State Bank of India' },
    });

    expect(result.id).toBe('order_nb_1');
    expect(result.payment_method).toBe('net_banking');
    expect((result as any).metadata.bankCode).toBe('SBI');
    expect((result as any).metadata.bankName).toBe('State Bank of India');

    const body = JSON.parse((global as any).fetch.mock.calls[0][1].body);
    expect(body.payment_method.type).toBe('netbanking');
    expect(body.payment_method.netbanking.bank).toBe('SBI');
  });

  it('defaults bank to HDFC when no options provided', async () => {
    const gateway = new NetBankingGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_nb_2', amount: 5000, currency: 'inr', status: 'created' }),
    } as any);

    await gateway.createPaymentIntent(50, 'inr', 'user-1', {});
    const body = JSON.parse((global as any).fetch.mock.calls[0][1].body);
    expect(body.payment_method.netbanking.bank).toBe('HDFC');
  });

  it('confirms a paid netbanking order', async () => {
    const gateway = new NetBankingGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_nb_1', amount: 5000, currency: 'inr', status: 'paid' }),
    } as any);
    const result = await gateway.confirmPayment('nb_123', 'user-1');
    expect(result.status).toBe('paid');
    expect(result.payment_method).toBe('net_banking');
  });

  it('rejects confirmation of non-netbanking payment id', async () => {
    const gateway = new NetBankingGateway(makeConfig());
    await expect(gateway.confirmPayment('gpay_123', 'user-1')).rejects.toThrow('Invalid net banking payment ID');
  });

  it('returns payment result for unpaid order (status passthrough)', async () => {
    const gateway = new NetBankingGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_nb_1', amount: 5000, currency: 'inr', status: 'created' }),
    } as any);
    const result = await gateway.confirmPayment('nb_123', 'user-1');
    expect(result.status).toBe('created');
    expect(result.payment_method).toBe('net_banking');
  });

  it('fetches payment details', async () => {
    const gateway = new NetBankingGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'order_nb_1', amount: 5000, currency: 'inr', status: 'paid' }),
    } as any);
    const result = await gateway.fetchPaymentDetails('order_nb_1');
    expect(result.amount).toBe(5000);
    expect(result.payment_method).toBe('net_banking');
  });

  it('refunds a netbanking payment', async () => {
    const gateway = new NetBankingGateway(makeConfig());
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'order_nb_1', amount: 13800, currency: 'inr', payments: { items: [{ id: 'pay_1' }] } }),
    } as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'rf_nb_1', amount: 13800, status: 'processed' }),
    } as any);
    const result = await gateway.refundPayment('nb_123', 50, 'user-1');
    expect(result.id).toBe('rf_nb_1');
  });

  it('verifies webhook signature (HMAC sha256)', async () => {
    const gateway = new NetBankingGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized', id: 'evt_nb' });
    const secret = 'whsec_nb';
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const result = await gateway.constructEvent(Buffer.from(payload), signature, secret);
    expect((result.data.object as any).id).toBe('evt_nb');
  });

  it('rejects invalid webhook signature', async () => {
    const gateway = new NetBankingGateway(makeConfig());
    await expect(
      gateway.constructEvent(Buffer.from('{}'), 'bad', 'secret')
    ).rejects.toThrow('Invalid Net Banking webhook signature');
  });
});
