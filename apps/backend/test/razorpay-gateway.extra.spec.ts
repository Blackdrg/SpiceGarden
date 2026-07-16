import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { RazorpayGateway } from '../src/services/payments/gateways/razorpay-gateway.service';

function makeGateway() {
  const configService = { get: (k: string) => ({ RAZORPAY_KEY_ID: 'kid', RAZORPAY_KEY_SECRET: 'ksecret' }[k]) } as any;
  return new RazorpayGateway(configService);
}

describe('RazorpayGateway error/edge branches', () => {
  const originalFetch = (global as any).fetch;
  let gateway: RazorpayGateway;

  beforeEach(() => {
    gateway = makeGateway();
  });
  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

    it('creates a payment intent and returns the amount in paise', async () => {
      (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'order_1', amount: 13800, currency: 'inr', status: 'created' }) } as any);
      const intent = await gateway.createPaymentIntent(138, 'inr', 'user-1', { orderId: 'o1' });
      expect(intent.id).toBe('order_1');
      expect(intent.amount).toBe(13800);
    expect(intent.currency).toBe('inr');
  });

  it('throws when createPaymentIntent request fails', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('network'));
    await expect(gateway.createPaymentIntent(100)).rejects.toThrow('network');
  });

  it('confirms a paid order', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'order_1', amount: 13800, currency: 'inr', status: 'captured' }) } as any);
    const result = await gateway.confirmPayment('order_1', 'user-1');
    expect(result.status).toBe('captured');
  });

  it('throws BadRequest when confirming a non-successful order', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'order_1', amount: 13800, currency: 'inr', status: 'created' }) } as any);
    await expect(gateway.confirmPayment('order_1', 'user-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when confirm request fails', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('down'));
    await expect(gateway.confirmPayment('order_1', 'user-1')).rejects.toThrow('down');
  });

  it('refunds a full payment', async () => {
    (global as any).fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'order_1', amount: 13800, currency: 'inr', status: 'captured', payments: { items: [{ id: 'pay_1' }] } }) } as any)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'rf_1', amount: 13800, status: 'processed' }) } as any);
    const result = await gateway.refundPayment('order_1', null, 'user-1');
    expect(result.id).toBe('rf_1');
  });

  it('refunds using the order id when no payment items exist', async () => {
    (global as any).fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'order_1', amount: 13800, currency: 'inr', status: 'captured' }) } as any)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'rf_2', amount: 13800, status: 'processed' }) } as any);
    const result = await gateway.refundPayment('order_1', null, 'user-1');
    expect(result.id).toBe('rf_2');
  });

  it('rejects refund exceeding original amount', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'order_1', amount: 13800, currency: 'inr', status: 'captured', payments: { items: [{ id: 'pay_1' }] } }) } as any);
    await expect(gateway.refundPayment('order_1', 999, 'user-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects non-positive refund amount', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 'order_1', amount: 13800, currency: 'inr', status: 'captured', payments: { items: [{ id: 'pay_1' }] } }) } as any);
    await expect(gateway.refundPayment('order_1', 0, 'user-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws a descriptive error when the API returns non-ok with a description', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, json: () => Promise.resolve({ error: { description: 'Bad amount' } }) } as any);
    await expect(gateway.createPaymentIntent(100)).rejects.toThrow('Bad amount');
  });

  it('throws a status-coded error when the API returns non-ok without description', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) } as any);
    await expect(gateway.createPaymentIntent(100)).rejects.toThrow('Razorpay API error: 500');
  });

  it('constructEvent verifies a valid signature', async () => {
    const payload = JSON.stringify({ entity: 'payment', id: 'pay_1' });
    const secret = 'whsec';
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const event = await gateway.constructEvent(payload, signature, secret);
    expect(event.data.object).toBe('payment');
  });

  it('constructEvent rejects an invalid signature', async () => {
    const payload = JSON.stringify({ entity: 'payment', id: 'pay_1' });
    await expect(gateway.constructEvent(payload, 'deadbeef', 'whsec')).rejects.toThrow('Invalid webhook signature');
  });

  it('reports its gateway name', () => {
    expect(gateway.getGatewayName()).toBe('razorpay');
  });
});
