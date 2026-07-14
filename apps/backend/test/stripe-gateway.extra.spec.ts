import { BadRequestException } from '@nestjs/common';

const mockStripeShape = {
  paymentIntents: { create: jest.fn(), retrieve: jest.fn() },
  refunds: { create: jest.fn() },
  webhooks: { constructEvent: jest.fn() },
};

jest.mock('stripe', () => ({
  Stripe: jest.fn(() => mockStripeShape),
}));

import { StripeGateway } from '../src/services/payments/gateways/stripe-gateway.service';

function makeGateway() {
  const configService = { get: (k: string) => ({ STRIPE_SECRET_KEY: 'sk_test_xxx' }[k]) } as any;
  return new StripeGateway(configService);
}

describe('StripeGateway error/edge branches', () => {
  let gateway: StripeGateway;

  beforeEach(() => {
    gateway = makeGateway();
    mockStripeShape.paymentIntents.create.mockReset();
    mockStripeShape.paymentIntents.retrieve.mockReset();
    mockStripeShape.refunds.create.mockReset();
    mockStripeShape.webhooks.constructEvent.mockReset();
  });

  it('creates a payment intent', async () => {
    mockStripeShape.paymentIntents.create.mockResolvedValue({ id: 'pi_1', amount: 13800, currency: 'usd', status: 'requires_payment_method', client_secret: 'cs_1' });
    const intent = await gateway.createPaymentIntent(138, 'usd', 'u1', { orderId: 'o1' });
    expect(intent.id).toBe('pi_1');
    expect(intent.amount).toBe(13800);
  });

  it('throws when createPaymentIntent fails', async () => {
    mockStripeShape.paymentIntents.create.mockRejectedValue(new Error('api down'));
    await expect(gateway.createPaymentIntent(100)).rejects.toThrow('api down');
  });

  it('fetches payment details', async () => {
    mockStripeShape.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', amount: 13800, currency: 'usd', status: 'succeeded', client_secret: 'cs_1' });
    const details = await gateway.fetchPaymentDetails('pi_1');
    expect(details.status).toBe('succeeded');
  });

  it('confirms a succeeded payment', async () => {
    mockStripeShape.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', amount: 13800, currency: 'usd', status: 'succeeded' });
    const result = await gateway.confirmPayment('pi_1', 'u1');
    expect(result.status).toBe('succeeded');
  });

  it('throws BadRequest when confirming a non-succeeded payment', async () => {
    mockStripeShape.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', amount: 13800, currency: 'usd', status: 'requires_payment_method' });
    await expect(gateway.confirmPayment('pi_1', 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when confirmPayment request fails', async () => {
    mockStripeShape.paymentIntents.retrieve.mockRejectedValue(new Error('boom'));
    await expect(gateway.confirmPayment('pi_1', 'u1')).rejects.toThrow('boom');
  });

  it('refunds the full amount', async () => {
    mockStripeShape.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', amount: 13800, currency: 'usd' });
    mockStripeShape.refunds.create.mockResolvedValue({ id: 're_1', amount: 13800, status: 'succeeded' });
    const result = await gateway.refundPayment('pi_1', null, 'u1');
    expect(result.id).toBe('re_1');
  });

  it('rejects refund exceeding original amount', async () => {
    mockStripeShape.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', amount: 13800, currency: 'usd' });
    await expect(gateway.refundPayment('pi_1', 999, 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects non-positive refund amount', async () => {
    mockStripeShape.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', amount: 13800, currency: 'usd' });
    await expect(gateway.refundPayment('pi_1', 0, 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when refund request fails', async () => {
    mockStripeShape.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', amount: 13800, currency: 'usd' });
    mockStripeShape.refunds.create.mockRejectedValue(new Error('refund failed'));
    await expect(gateway.refundPayment('pi_1', null, 'u1')).rejects.toThrow('refund failed');
  });

  it('constructEvent verifies a valid signature', async () => {
    const event = { data: { object: { id: 'pi_1' } } };
    mockStripeShape.webhooks.constructEvent.mockReturnValue(event);
    const result = await gateway.constructEvent(Buffer.from('{}'), 'sig', 'whsec');
    expect(result.data.object.id).toBe('pi_1');
  });

  it('throws when webhook signature is invalid', async () => {
    mockStripeShape.webhooks.constructEvent.mockImplementation(() => { throw new Error('Invalid signature'); });
    await expect(gateway.constructEvent(Buffer.from('{}'), 'bad', 'whsec')).rejects.toThrow('Invalid signature');
  });

  it('reports its gateway name', () => {
    expect(gateway.getGatewayName()).toBe('stripe');
  });
});
