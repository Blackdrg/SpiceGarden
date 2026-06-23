import { describe, expect, it, beforeEach } from '@jest/globals';
import * as crypto from 'crypto';
import { WebhookService } from '../src/services/payments/webhook/webhook.service';

function createService() {
  const configService = { get: jest.fn((key: string, fallback: any) => key === 'RAZORPAY_WEBHOOK_SECRET' ? 'razorpay_webhook_secret' : fallback) };
  const webhookRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), count: jest.fn() };
  const paymentEventRepo = { findOne: jest.fn(), save: jest.fn(), count: jest.fn() };
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
    await expect(mocks.service.processWebhook(Buffer.from('{}'), 'signature', {})).rejects.toThrow('Unable to determine payment gateway from webhook headers');
  });

  it('returns duplicate=true when existingWebhook is found', async () => {
    const event = { id: 'evt_dup', type: 'payment_intent.succeeded', data: { object: { metadata: {} } } };
    mocks.configService.get.mockReturnValue('whsec_test_secret');
    mocks.stripe.webhooks.constructEvent.mockResolvedValue(event);
    mocks.webhookRepo.findOne.mockResolvedValue({ id: 'existing-webhook' });

    const result = await mocks.service.processWebhook(Buffer.from(JSON.stringify(event)), 'stripe-signature', { 'stripe-signature': 'stripe-signature' });

    expect(result).toEqual({ received: true, duplicate: true });
  });

  it('handles webhook processing errors gracefully', async () => {
    const event = {
      id: 'evt_err',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_err', metadata: { orderId: 'order-err', userId: 'user-err' } } },
    };
    mocks.configService.get.mockReturnValue('whsec_test_secret');
    mocks.stripe.webhooks.constructEvent.mockResolvedValue(event);
    mocks.webhookRepo.findOne.mockResolvedValue(null);
    mocks.paymentEventRepo.findOne.mockResolvedValue(null);
    mocks.productionNotification.sendPaymentNotification.mockRejectedValue(new Error('notification down'));

    await expect(mocks.service.processWebhook(Buffer.from(JSON.stringify(event)), 'stripe-signature', { 'stripe-signature': 'stripe-signature' })).rejects.toThrow('Webhook processing failed');

    expect(mocks.paymentEventRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isProcessed: false,
        payload: expect.objectContaining({ error: 'notification down' }),
      })
    );
  });

  it('returns alreadyProcessed=true for a previously processed event', async () => {
    const event = {
      id: 'evt_ap',
      type: 'payment_intent.succeeded',
      data: { object: { metadata: { orderId: 'order-ap' } } },
    };
    mocks.configService.get.mockReturnValue('whsec_test_secret');
    mocks.stripe.webhooks.constructEvent.mockResolvedValue(event);
    mocks.webhookRepo.findOne.mockResolvedValue(null);
    mocks.paymentEventRepo.findOne.mockResolvedValue({ isProcessed: true });

    const result = await mocks.service.processWebhook(Buffer.from(JSON.stringify(event)), 'stripe-signature', { 'stripe-signature': 'stripe-signature' });

    expect(result).toEqual({ received: true, alreadyProcessed: true });
  });

  it('skips duplicate webhook event ids via webhookRepo', async () => {
    const event = { id: 'evt_dup2', type: 'payment_intent.succeeded', data: { object: { metadata: {} } } };
    mocks.configService.get.mockReturnValue('whsec_test_secret');
    mocks.stripe.webhooks.constructEvent.mockResolvedValue(event);
    mocks.webhookRepo.findOne.mockResolvedValue({ id: 'existing-webhook' });

    const result = await mocks.service.processWebhook(Buffer.from(JSON.stringify(event)), 'stripe-signature', { 'stripe-signature': 'stripe-signature' });

    expect(result).toEqual({ received: true, duplicate: true });
    expect(mocks.paymentEventRepo.save).not.toHaveBeenCalled();
    expect(mocks.webhookRepo.save).not.toHaveBeenCalled();
  });

  it('detects stripe gateway from stripe-signature header', () => {
    const gateway = (mocks.service as any).detectGatewayFromHeaders({ 'stripe-signature': 'sig_123' });
    expect(gateway).toBe('stripe');
  });

  it('detects razorpay gateway from x-razorpay-signature header', () => {
    const gateway = (mocks.service as any).detectGatewayFromHeaders({ 'x-razorpay-signature': 'sig_123' });
    expect(gateway).toBe('razorpay');
  });

  it('returns null for unknown gateway headers', () => {
    const gateway = (mocks.service as any).detectGatewayFromHeaders({});
    expect(gateway).toBeNull();
  });

  it('verifies Razorpay webhook with valid signature', async () => {
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
    const secret = 'razorpay_webhook_secret';
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const order = { id: 'order-1', paymentStatus: 'pending' };

    mocks.configService.get.mockReturnValueOnce(secret);
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

  it('rejects Razorpay webhook with invalid signature via processWebhook', async () => {
    const payload = JSON.stringify({ event: 'payment.authorized', payload: { payment: { entity: { id: 'pay_1' } } } });
    const secret = 'razorpay_webhook_secret';

    const originalGet = mocks.configService.get;
    mocks.configService.get = jest.fn((key: string, fallback: any) => key === 'RAZORPAY_WEBHOOK_SECRET' ? secret : originalGet(key, fallback));

    await expect(mocks.service.processWebhook(Buffer.from(payload), 'wrong_signature', { 'x-razorpay-signature': 'wrong_signature' })).rejects.toThrow('Invalid Razorpay signature');

    mocks.configService.get = originalGet;
  });

  it('rejects Razorpay webhook with invalid signature via direct verify', async () => {
    const payload = JSON.stringify({ event: 'payment.authorized' });

    await expect((mocks.service as any).verifyRazorpayWebhook(Buffer.from(payload), 'wrong_signature')).rejects.toThrow('Invalid Razorpay signature');
  });

  it('maps Stripe payment_intent.succeeded to payment_succeeded', () => {
    const mapped = (mocks.service as any).mapEventToPaymentEvent('stripe', 'payment_intent.succeeded');
    expect(mapped).toBe('payment_succeeded');
  });

  it('maps Stripe charge.dispute.created to chargeback_received', () => {
    const mapped = (mocks.service as any).mapEventToPaymentEvent('stripe', 'charge.dispute.created');
    expect(mapped).toBe('chargeback_received');
  });

  it('maps Stripe unknown event to payment_succeeded default', () => {
    const mapped = (mocks.service as any).mapEventToPaymentEvent('stripe', 'unknown.event');
    expect(mapped).toBe('payment_succeeded');
  });

  it('maps Razorpay payment.authorized to payment_succeeded', () => {
    const mapped = (mocks.service as any).mapEventToPaymentEvent('razorpay', 'payment.authorized');
    expect(mapped).toBe('payment_succeeded');
  });

  it('maps Razorpay refund.failed to refund_failed', () => {
    const mapped = (mocks.service as any).mapEventToPaymentEvent('razorpay', 'refund.failed');
    expect(mapped).toBe('refund_failed');
  });

  it('throws for unsupported gateway in handleEvent', async () => {
    await expect((mocks.service as any).handleEvent('unknown', { type: 'test' })).rejects.toThrow('Unsupported gateway');
  });

  it('returns unhandled for unknown Stripe event type', async () => {
    const event = { type: 'unknown.stripe.event', data: {} };
    const result = await (mocks.service as any).handleStripeEvent(event);
    expect(result).toEqual({ received: true, unhandled: true });
  });

  it('returns unhandled for unknown Razorpay event type', async () => {
    const event = { event: 'unknown.razorpay.event', payload: {} };
    const result = await (mocks.service as any).handleRazorpayEvent(event);
    expect(result).toEqual({ received: true, unhandled: true });
  });

  it('should return webhook stats', async () => {
    mocks.webhookRepo.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(5);
    mocks.paymentEventRepo.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1);

    const result = await mocks.service.getWebhookStats();

    expect(result.totalWebhooksReceived).toBe(100);
    expect(result.webhooksLast24h).toBe(10);
    expect(result.failedLast24h).toBe(3);
    expect(result.stripeWebhooksLast24h).toBe(2);
    expect(result.razorpayWebhooksLast24h).toBe(5);
  });
});
