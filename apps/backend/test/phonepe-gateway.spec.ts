import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { PhonePeGateway } from '../src/services/payments/gateways/phonepe-gateway.service';

function makeConfig(overrides: Record<string, any> = {}) {
  return {
    get: jest.fn((key: string, fallback?: any) => {
      const values: Record<string, string> = {
        PHONEPE_MERCHANT_ID: 'phonepe_merchant_123',
        PHONEPE_SALT_KEY: 'phonepe_salt_key_123',
        PHONEPE_SALT_KEY_INDEX: '1',
        PHONEPE_ENVIRONMENT: 'sandbox',
        ...overrides,
      };
        return values[key] ?? fallback;
    }),
  } as any;
}

describe('PhonePeGateway', () => {
  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns gateway name', () => {
    const gateway = new PhonePeGateway(makeConfig());
    expect(gateway.getGatewayName()).toBe('phonepe');
  });

  it('builds the correct X-VERIFY header (sha256 hex + index)', () => {
    const gateway = new PhonePeGateway(makeConfig());
    const payload = JSON.stringify({ amount: 100 });
    const expected = crypto.createHash('sha256').update(payload + 'phonepe_salt_key_123').digest('hex') + '###1';
    const header = (gateway as any).buildVerifyHeader(payload);
    expect(header).toBe(expected);
  });

  it('constructs a real PhonePe pay request with correct headers', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          paymentId: 'phonepe_txn_123',
          instrumentResponse: { redirectInfo: { url: 'https://pay.phonepe.com/u/abc' } },
        },
      }),
    } as any);

    const result = await gateway.createPaymentIntent(150, 'inr', 'user-1', { orderId: 'ord-1', callbackUrl: 'https://hook.example.com' });

    expect(result.id).toBe('phonepe_txn_123');
    expect(result.amount).toBe(15000);
    expect(result.status).toBe('pending');
    expect(result.client_secret).toBe('https://pay.phonepe.com/u/abc');
    expect(result.payment_method).toBe('phonepe');
    expect((result as any).metadata.gateway).toBe('phonepe');

    const call = (global as any).fetch.mock.calls[0];
    expect(call[0]).toBe('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay');
    const headers = call[1].headers;
    expect(headers['X-MERCHANT-ID']).toBe('phonepe_merchant_123');
    expect(headers['X-VERIFY']).toBeDefined();
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('throws BadRequestException when PhonePe pay fails', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Bad request',
    } as any);

    await expect(gateway.createPaymentIntent(100, 'inr', 'user-1', {})).rejects.toThrow('PhonePe API error: 400');
  });

  it('throws BadRequestException on non-success pay response', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, data: null }),
    } as any);

    await expect(gateway.createPaymentIntent(100, 'inr', 'user-1', {})).rejects.toThrow('PhonePe payment intent creation failed');
  });

  it('fetches payment details via status endpoint', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { status: 'completed' } }),
    } as any);

    const result = await gateway.fetchPaymentDetails('phonepe_12345');
    expect(result.id).toBe('phonepe_12345');
    expect(result.status).toBe('succeeded');

    const call = (global as any).fetch.mock.calls[0];
    expect(call[0]).toContain('/pg/v1/status/phonepe_merchant_123/12345');
  });

  it('maps PhonePe status to pending when not completed/failed', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { status: 'pending' } }),
    } as any);

    const result = await gateway.fetchPaymentDetails('phonepe_12345');
    expect(result.status).toBe('pending');
  });

  it('confirms a valid phonepe payment id', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { status: 'completed' } }),
    } as any);

    const result = await gateway.confirmPayment('phonepe_abc', 'user-1');
    expect(result.status).toBe('succeeded');
    expect(result.id).toBe('phonepe_abc');
    expect(result.payment_method).toBe('phonepe');
  });

  it('rejects confirmation of a non-phonepe payment id', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    await expect(gateway.confirmPayment('upi_123', 'user-1')).rejects.toThrow('Invalid PhonePe payment ID');
  });

  it('processes a refund', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { code: 'SUCCESS' } }),
    } as any);

    const result = await gateway.refundPayment('phonepe_12345', 50, 'user-1', 'customer_requested');
    expect(result.status).toBe('processing');
    expect(result.note).toBe('PhonePe refund initiated');
    expect(result.currency).toBe('INR');

    const call = (global as any).fetch.mock.calls[0];
    expect(call[0]).toBe('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund');
  });

  it('throws when refund fails', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    } as any);

    await expect(gateway.refundPayment('phonepe_12345', 50, 'user-1')).rejects.toThrow('PhonePe refund failed');
  });

  it('verifies a valid webhook signature (sha256 hex)', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized', id: 'evt_1' });
    const secret = 'webhook_secret_123';
    const signature = crypto.createHash('sha256').update(payload + secret).digest('hex');

    const result = await gateway.constructEvent(Buffer.from(payload), signature, secret);
    expect((result.data.object as any).id).toBe('evt_1');
  });

  it('verifies webhook signature with ###index suffix (PhonePe format)', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized', id: 'evt_idx' });
    const secret = 'webhook_secret_123';
    const hash = crypto.createHash('sha256').update(payload + secret).digest('hex');
    const signature = `${hash}###2`;

    const result = await gateway.constructEvent(Buffer.from(payload), signature, secret);
    expect((result.data.object as any).id).toBe('evt_idx');
  });

  it('rejects an invalid webhook signature', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized' });
    await expect(
      gateway.constructEvent(Buffer.from(payload), 'invalid_sig', 'webhook_secret_123')
    ).rejects.toThrow('Invalid PhonePe webhook signature');
  });

  it('rejects a signature with wrong index suffix hash', async () => {
    const gateway = new PhonePeGateway(makeConfig());
    const payload = JSON.stringify({ event: 'payment.authorized' });
    await expect(
      gateway.constructEvent(Buffer.from(payload), 'wrong_hash###1', 'webhook_secret_123')
    ).rejects.toThrow('Invalid PhonePe webhook signature');
  });

  it('throws MissingEnvError when merchant id is a placeholder', () => {
    const configService = {
      get: jest.fn((key: string, fallback?: any) => {
        const values: Record<string, string> = {
          PHONEPE_MERCHANT_ID: 'CHANGE_ME',
          PHONEPE_SALT_KEY: 'key',
        };
      return values[key] ?? fallback;
      }),
    } as any;
    expect(() => new PhonePeGateway(configService)).toThrow('Required environment variable');
  });

  it('uses production URL when PHONEPE_ENVIRONMENT=production', () => {
    const gateway = new PhonePeGateway(makeConfig({ PHONEPE_ENVIRONMENT: 'production' }));
    expect((gateway as any).baseUrl).toBe('https://api.phonepe.com/apis/hermes');
  });

  it('uses sandbox URL by default', () => {
    const gateway = new PhonePeGateway(makeConfig());
    expect((gateway as any).baseUrl).toBe('https://api-preprod.phonepe.com/apis/pg-sandbox');
  });
});
