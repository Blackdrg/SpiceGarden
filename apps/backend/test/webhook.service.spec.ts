import { describe, expect, it, beforeEach } from '@jest/globals';
import * as crypto from 'crypto';
import { WebhookService } from '../src/services/payments/webhook/webhook.service';

function createService() {
  const configService = { get: jest.fn((key: string, fallback: any) => fallback) };
  const webhookRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const paymentEventRepo = { findOne: jest.fn(), save: jest.fn() };
  const orderRepo = { findOne: jest.fn(), save: jest.fn() };
  const fraudFlagRepo = { findOne: jest.fn() };
  const notificationService = { sendPush: jest.fn() };
  const productionNotification = { sendPaymentNotification: jest.fn() };
  const ledgerService = { createTransaction: jest.fn() };
  const paymentGatewayFactory = { getGateway: jest.fn() };
  const chargebackService = { handleDisputeCreated: jest.fn(), handleDisputeClosed: jest.fn() };
  const stripe = { webhooks: { constructEvent: jest.fn() } };
  const logger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };

  const service = Object.create(WebhookService.prototype) as WebhookService;
  Object.assign(service, {
    configService,
    webhookRepo,
    paymentEventRepo,
    orderRepo,
    fraudFlagRepo,
    notificationService,
    productionNotification,
    ledgerService,
    paymentGatewayFactory,
    chargebackService,
    stripe,
    logger,
  });

  return { service, configService, webhookRepo, paymentEventRepo, orderRepo, productionNotification, ledgerService, stripe };
}

describe('WebhookService payment event handling', () => {
  let mocks: ReturnType<typeof createService>;

  beforeEach(() => {
    mocks = createService();
  });

  it('processes a Stripe payment_intent.succeeded webhook once', async () => {
    const event = {
      id: 'evt_stripe_1',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_1', amount: 13800, currency: 'usd', metadata: { orderId: 'order-1', userId: 'user-1' } } },
    };
    mocks.configService.get.mockReturnValue('whsec_test_secret');
    mocks.stripe.webhooks.constructEvent.mockResolvedValue(event);
    mocks.webhookRepo.findOne.mockResolvedValue(null);
    mocks.paymentEventRepo.findOne.mockResolvedValue(null);
    mocks.paymentEventRepo.save.mockResolvedValue({ id: 'payment-event-1', isProcessed: true });
    mocks.webhookRepo.create.mockReturnValue({ id: 'webhook-1', gateway: 'stripe', webhookId: 'evt_stripe_1', eventType: 'payment_intent.succeeded', processedAt: new Date() });
    mocks.webhookRepo.save.mockResolvedValue({ id: 'webhook-1' });

    const result = await mocks.service.processWebhook(Buffer.from(JSON.stringify(event)), 'stripe-signature', { 'stripe-signature': 'stripe-signature' });

    expect(result).toEqual({ received: true, processed: true });
    expect(mocks.stripe.webhooks.constructEvent).toHaveBeenCalledWith(expect.any(Buffer), 'stripe-signature', 'whsec_test_secret');
    expect(mocks.productionNotification.sendPaymentNotification).toHaveBeenCalledWith('user-1', 'pi_1', expect.objectContaining({ type: 'payment_success' }));
    expect(mocks.webhookRepo.save).toHaveBeenCalledWith(expect.objectContaining({ gateway: 'stripe', webhookId: 'evt_stripe_1' }));
  });

  it('skips duplicate Stripe webhook event ids', async () => {
    const event = { id: 'evt_stripe_2', type: 'payment_intent.succeeded', data: { object: { metadata: {} } } };
    mocks.configService.get.mockReturnValue('whsec_test_secret');
    mocks.stripe.webhooks.constructEvent.mockResolvedValue(event);
    mocks.webhookRepo.findOne.mockResolvedValue({ id: 'existing-webhook' });

    const result = await mocks.service.processWebhook(Buffer.from(JSON.stringify(event)), 'stripe-signature', { 'stripe-signature': 'stripe-signature' });

    expect(result).toEqual({ received: true, duplicate: true });
    expect(mocks.paymentEventRepo.save).not.toHaveBeenCalled();
  });

  it('verifies and processes Razorpay payment.authorized webhook', async () => {
    const payload = JSON.stringify({
      entity: 'event',
      event: 'payment.authorized',
      id: 'evt_razorpay_1',
      payload: {
        payment: {
          entity: {
            id: 'pay_1',
            amount: 13800,
            currency: 'inr',
            notes: { orderId: 'order-1', userId: 'user-1' },
          },
        },
      },
    });
    const signature = crypto.createHmac('sha256', 'razorpay_webhook_secret').update(payload).digest('hex');
    const order = { id: 'order-1', paymentStatus: 'pending' };

    mocks.configService.get.mockReturnValue('razorpay_webhook_secret');
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.orderRepo.save.mockResolvedValue(order);
    mocks.paymentEventRepo.save.mockResolvedValue({ id: 'payment-event-1', isProcessed: true });
    mocks.webhookRepo.create.mockReturnValue({ id: 'webhook-1' });
    mocks.webhookRepo.save.mockResolvedValue({ id: 'webhook-1' });

    const result = await mocks.service.processWebhook(Buffer.from(payload), signature, { 'x-razorpay-signature': signature });

    expect(result).toEqual({ received: true, processed: true });
    expect(order.paymentStatus).toBe('completed');
    expect(mocks.productionNotification.sendPaymentNotification).toHaveBeenCalledWith('user-1', 'pay_1', expect.objectContaining({ type: 'payment_success' }));
  });

  it('rejects webhooks without a gateway signature header', async () => {
    await expect(mocks.service.processWebhook(Buffer.from('{}'), 'signature', {})).rejects.toThrow('Unable to determine payment gateway');
  });
});
