import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import * as crypto from 'crypto';
import { BhimUpiGateway } from '../src/services/payments/gateways/bhim-upi-gateway.service';

function makeConfig(overrides: Record<string, any> = {}) {
  return {
    get: jest.fn((key: string, fallback?: any) => {
      const values: Record<string, string> = {
        PHONEPE_MERCHANT_ID: 'bhim_merchant_123',
        PHONEPE_SALT_KEY: 'bhim_salt_key_456',
        PHONEPE_SALT_KEY_INDEX: '2',
        BHIM_UPI_ID: 'spicegarden@upi',
        BHIM_UPI_NAME: 'SpiceGarden',
        BHIM_UPI_ENVIRONMENT: 'sandbox',
        ...overrides,
      };
      return values[key] ?? fallback;
    }),
  } as any;
}

describe('BhimUpiGateway', () => {
  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('returns gateway name', () => {
    const gateway = new BhimUpiGateway(makeConfig());
    expect(gateway.getGatewayName()).toBe('bhim_upi');
  });

  it('builds X-VERIFY header identical to PhonePe scheme', () => {
    const gateway = new BhimUpiGateway(makeConfig());
    const payload = JSON.stringify({ test: 'data' });
    const expected = crypto.createHash('sha256').update(payload + 'bhim_salt_key_456').digest('hex') + '###2';
    expect((gateway as any).buildVerifyHeader(payload)).toBe(expected);
  });

  it('creates a UPI payment intent via PhonePe-compatible endpoint', async () => {
    const gateway = new BhimUpiGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          paymentId: 'bhimupi_txn_999',
          instrumentResponse: { redirectInfo: { url: 'upi://pay?pa=spicegarden@upi' } },
        },
      }),
    } as any);

    const result = await gateway.createPaymentIntent(100, 'inr', 'user-1', { orderId: 'ord-1' });

    expect(result.id).toBe('bhimupi_txn_999');
    expect(result.amount).toBe(10000);
    expect(result.payment_method).toBe('bhim_upi');
    expect((result as any).metadata.upiId).toBe('spicegarden@upi');
    expect((result as any).metadata.gateway).toBe('bhim_upi');

    const header = (global as any).fetch.mock.calls[0][1].headers;
    expect(header['X-MERCHANT-ID']).toBe('bhim_merchant_123');
    expect(header['X-VERIFY']).toBeDefined();
  });

  it('fetches payment details using merchantId and transactionId', async () => {
    const gateway = new BhimUpiGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { status: 'completed' } }),
    } as any);

    const result = await gateway.fetchPaymentDetails('bhimupi_txn_999');
    expect(result.status).toBe('succeeded');
    expect((global as any).fetch.mock.calls[0][0]).toContain('bhim_merchant_123/txn_999');
  });

  it('confirms a valid bhimupi payment id', async () => {
    const gateway = new BhimUpiGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { status: 'completed' } }),
    } as any);
    const result = await gateway.confirmPayment('bhimupi_123', 'user-1');
    expect(result.status).toBe('succeeded');
    expect(result.payment_method).toBe('bhim_upi');
  });

  it('rejects confirmation of a non-bhimupi payment id', async () => {
    const gateway = new BhimUpiGateway(makeConfig());
    await expect(gateway.confirmPayment('cod_123', 'user-1')).rejects.toThrow('Invalid BHIM UPI payment ID');
  });

  it('processes a refund', async () => {
    const gateway = new BhimUpiGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { code: 'SUCCESS' } }),
    } as any);
    const result = await gateway.refundPayment('bhimupi_123', 30, 'user-1');
    expect(result.status).toBe('processing');
    expect(result.note).toBe('BHIM UPI refund initiated');
  });

   it('verifies a valid webhook signature (PhonePe format with ###index suffix)', async () => {
     const gateway = new BhimUpiGateway(makeConfig());
     const payload = JSON.stringify({ event: 'payment.authorized' });
     const secret = 'bhim_webhook_secret';
     const hash = crypto.createHash('sha256').update(payload + secret).digest('hex');
     const signature = `${hash}###2`;
     const result = await gateway.constructEvent(Buffer.from(payload), signature, secret);
     expect(result.data.object).toBeDefined();
   });

   it('verifies a valid webhook signature without ### suffix (backward compat)', async () => {
     const gateway = new BhimUpiGateway(makeConfig());
     const payload = JSON.stringify({ event: 'payment.authorized' });
     const secret = 'bhim_webhook_secret';
     const signature = crypto.createHash('sha256').update(payload + secret).digest('hex');
     const result = await gateway.constructEvent(Buffer.from(payload), signature, secret);
     expect(result.data.object).toBeDefined();
   });

   it('rejects an invalid webhook signature', async () => {
     const gateway = new BhimUpiGateway(makeConfig());
     await expect(
       gateway.constructEvent(Buffer.from('{}'), 'bad_sig', 'secret')
     ).rejects.toThrow('Invalid BHIM UPI webhook signature');
   });

   it('rejects a valid hash with wrong ### index suffix', async () => {
     const gateway = new BhimUpiGateway(makeConfig());
     const payload = JSON.stringify({ event: 'payment.authorized' });
     const secret = 'bhim_webhook_secret';
     const wrongHash = crypto.createHash('sha256').update(payload + 'wrong_secret').digest('hex');
     const signature = `${wrongHash}###2`;
     await expect(
       gateway.constructEvent(Buffer.from(payload), signature, secret)
     ).rejects.toThrow('Invalid BHIM UPI webhook signature');
   });

   it('uses constant-time comparison: tampered signature is rejected', async () => {
     const gateway = new BhimUpiGateway(makeConfig());
     const payload = JSON.stringify({ event: 'payment.authorized' });
     const secret = 'bhim_webhook_secret';
     const hash = crypto.createHash('sha256').update(payload + secret).digest('hex');
     const tamperedHash = hash.slice(0, -1) + '0';
     const signature = `${tamperedHash}###2`;
     await expect(
       gateway.constructEvent(Buffer.from(payload), signature, secret)
     ).rejects.toThrow('Invalid BHIM UPI webhook signature');
   });
});
