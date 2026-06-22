import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { StripeGateway } from '../src/services/payments/gateways/stripe-gateway.service';

function createGateway(stripeMock: any = {}) {
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'sk_test_mock_secret';
      return undefined;
    }),
  } as any;

  const gateway = Object.create(StripeGateway.prototype) as StripeGateway;
  (gateway as any).logger = { error: jest.fn() } as any;
  (gateway as any).stripe = {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    ...stripeMock,
  } as any;

  return { gateway, configService } as any;
}

describe('StripeGateway', () => {
  it('returns gateway name', () => {
    const { gateway } = createGateway();
    expect(gateway.getGatewayName()).toBe('stripe');
  });

  it('creates a payment intent with mocked SDK', async () => {
    const { gateway } = createGateway();
    (gateway as any).stripe.paymentIntents.create.mockResolvedValue({
      id: 'pi_123',
      amount: 2500,
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: 'pi_123_secret',
    });

    const result = await gateway.createPaymentIntent(25, 'usd', 'user-1', { orderId: 'order-1' });

    expect(result.id).toBe('pi_123');
    expect(result.amount).toBe(2500);
    expect(result.currency).toBe('usd');
    expect(result.status).toBe('requires_payment_method');
    expect(result.client_secret).toBe('pi_123_secret');
    expect((gateway as any).stripe.paymentIntents.create).toHaveBeenCalledWith({
      amount: 2500,
      currency: 'usd',
      metadata: { orderId: 'order-1', userId: 'user-1', timestamp: expect.any(String) },
    });
  });

  it('returns amount in base units from the SDK', async () => {
    const { gateway } = createGateway();
    (gateway as any).stripe.paymentIntents.create.mockResolvedValue({
      id: 'pi_456',
      amount: 5000,
      currency: 'usd',
      status: 'succeeded',
    });

    const result = await gateway.createPaymentIntent(50, 'usd', null, {});

    expect(result.amount).toBe(5000);
  });

  it('fetches payment details', async () => {
    const { gateway } = createGateway();
    (gateway as any).stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_789',
      amount: 1000,
      currency: 'usd',
      status: 'succeeded',
      client_secret: 'secret_xyz',
    });

    const result = await gateway.fetchPaymentDetails('pi_789');

    expect(result.id).toBe('pi_789');
    expect(result.amount).toBe(1000);
    expect(result.client_secret).toBe('secret_xyz');
  });

  it('confirms a successful payment', async () => {
    const { gateway } = createGateway();
    (gateway as any).stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_success',
      amount: 2000,
      currency: 'usd',
      status: 'succeeded',
    });

    const result = await gateway.confirmPayment('pi_success', 'user-1');

    expect(result.status).toBe('succeeded');
    expect(result.id).toBe('pi_success');
  });

  it('rejects confirmation of a failed payment', async () => {
    const { gateway } = createGateway();
    (gateway as any).stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_failed',
      amount: 2000,
      currency: 'usd',
      status: 'requires_payment_method',
    });

    await expect(gateway.confirmPayment('pi_failed', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('refunds a payment within the original amount', async () => {
    const { gateway } = createGateway();
    (gateway as any).stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_ref',
      amount: 10000,
      currency: 'usd',
    });
    (gateway as any).stripe.refunds.create.mockResolvedValue({
      id: 're_123',
      amount: 10000,
      status: 'succeeded',
    });

    const result = await gateway.refundPayment('pi_ref', 100, 'user-1', 'requested_by_customer');

    expect(result.id).toBe('re_123');
    expect(result.amount).toBe(10000);
    expect((gateway as any).stripe.refunds.create).toHaveBeenCalledWith({
      payment_intent: 'pi_ref',
      amount: 10000,
      reason: 'requested_by_customer',
    });
  });

  it('rejects refund exceeding original amount', async () => {
    const { gateway } = createGateway();
    (gateway as any).stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_ref',
      amount: 1000,
      currency: 'usd',
    });

    await expect(gateway.refundPayment('pi_ref', 200, 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('rejects non-positive refund amounts', async () => {
    const { gateway } = createGateway();
    (gateway as any).stripe.paymentIntents.retrieve.mockResolvedValue({
      id: 'pi_ref',
      amount: 1000,
      currency: 'usd',
    });

    await expect(gateway.refundPayment('pi_ref', 0, 'user-1')).rejects.toThrow(BadRequestException);
    await expect(gateway.refundPayment('pi_ref', -50, 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('verifies a webhook event', async () => {
    const { gateway } = createGateway();
    const payload = Buffer.from(JSON.stringify({ type: 'payment_intent.succeeded' }));
    const signature = 'sig_123';
    const secret = 'whsec_test';

    (gateway as any).stripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_evt' } },
    });

    const result = await gateway.constructEvent(payload, signature, secret);

    expect(result.data.object).toEqual({ id: 'pi_evt' });
    expect((gateway as any).stripe.webhooks.constructEvent).toHaveBeenCalledWith(payload, signature, secret);
  });
});
