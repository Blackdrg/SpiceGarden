import { Injectable, Logger, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, MoreThanOrEqual } from 'typeorm';
import { PaymentWebhookEntity } from '../../../db/entities/payment-webhook.entity';
import { PaymentEventEntity } from '../payment-event.entity';
import { OrderEntity } from '../../../db/entities/order.entity';
import { PaymentFraudFlagEntity } from '../payment-fraud.entity';
import Stripe from 'stripe';
import * as crypto from 'crypto';
import { NotificationService } from '../../../services/notifications/notification.service';
import { ProductionNotificationService } from '../../../services/notifications/production-notification.service';
import { LedgerService } from '../../../modules/ledger/ledger.service';
import { PaymentGatewayFactory } from '../../../services/payments/gateway-factory.service';
import { ChargebackService } from '../chargeback/chargeback.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(PaymentWebhookEntity)
    private readonly webhookRepo: Repository<PaymentWebhookEntity>,
    @InjectRepository(PaymentEventEntity)
    private readonly paymentEventRepo: Repository<PaymentEventEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(PaymentFraudFlagEntity)
    private readonly fraudFlagRepo: Repository<PaymentFraudFlagEntity>,
    private notificationService: NotificationService,
    private productionNotification: ProductionNotificationService,
    private ledgerService: LedgerService,
    private paymentGatewayFactory: PaymentGatewayFactory,
    private chargebackService: ChargebackService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder',
      {
        apiVersion: '2024-04-10' as any,
      }
    );
  }

  async processWebhook(payload: Buffer, signature: string, headers: any): Promise<any> {
    const gateway = this.detectGatewayFromHeaders(headers);
    
    if (!gateway) {
      throw new BadRequestException('Unable to determine payment gateway from webhook headers');
    }

    let event: any;

    try {
      if (gateway === 'stripe') {
        event = await this.verifyStripeWebhook(payload, signature);
      } else if (gateway === 'razorpay') {
        event = await this.verifyRazorpayWebhook(payload, signature);
      } else {
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
      }
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed for ${gateway}: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    const existingWebhook = await this.webhookRepo.findOne({ 
      where: { 
        gateway,
        webhookId: event.id 
      } 
    });

    if (existingWebhook) {
      this.logger.warn(`Duplicate webhook received: ${event.id}. Skipping processing.`);
      return { received: true, duplicate: true };
    }

    const existingEvent = await this.paymentEventRepo.findOne({
      where: { 
        orderId: (event.data?.object as any)?.metadata?.orderId || event.id 
      }
    });

    if (existingEvent?.isProcessed) {
      this.logger.warn(`Already processed event for ${(event.data?.object as any)?.metadata?.orderId || event.id}`);
      return { received: true, alreadyProcessed: true };
    }

    try {
      const result = await this.handleEvent(gateway, event);

      await this.paymentEventRepo.save({
        userId: (event.data?.object as any)?.metadata?.userId || 'any',
        orderId: (event.data?.object as any)?.metadata?.orderId || event.id,
        event: this.mapEventToPaymentEvent(gateway, event.type),
        payload: { ...(event.data?.object as any), ...result },
        isProcessed: true,
      });

      const webhookRecord = this.webhookRepo.create({
        gateway,
        webhookId: event.id,
        eventType: event.type,
        processedAt: new Date(),
      });
      await this.webhookRepo.save(webhookRecord);

      return { received: true, processed: true };
    } catch (error: any) {
      this.logger.error(`Webhook processing failed for event ${event.id}:`, error);
      
      await this.paymentEventRepo.save({
        userId: (event.data?.object as any)?.metadata?.userId || 'any',
        orderId: (event.data?.object as any)?.metadata?.orderId || event.id,
        event: this.mapEventToPaymentEvent(gateway, event.type),
        payload: { error: error.message, ...(event.data?.object as any) },
        isProcessed: false,
      });

      throw new InternalServerErrorException(`Webhook processing failed: ${error.message}`);
    }
  }

  private detectGatewayFromHeaders(headers: any): string | null {
    if (headers['stripe-signature']) {
      return 'stripe';
    }
    
    if (headers['x-razorpay-signature']) {
      return 'razorpay';
    }
    
    return null;
  }

  private async verifyStripeWebhook(payload: Buffer, signature: string): Promise<any> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new InternalServerErrorException('Stripe webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  private async verifyRazorpayWebhook(payload: Buffer, signature: string): Promise<any> {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new InternalServerErrorException('Razorpay webhook secret not configured');
    }

    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload.toString())
      .digest('hex');
    
    if (generatedSignature !== signature) {
      throw new Error('Invalid Razorpay signature');
    }
    
    return JSON.parse(payload.toString());
  }

  private mapEventToPaymentEvent(gateway: string, eventType: string): PaymentEventEntity['event'] {
    if (gateway === 'stripe') {
      switch (eventType) {
        case 'payment_intent.succeeded': return 'payment_succeeded';
        case 'payment_intent.payment_failed': return 'payment_failed';
        case 'charge.refunded': return 'refund_completed';
        case 'charge.refund.updated': return 'refund_completed';
        case 'charge.dispute.created': return 'chargeback_received';
        case 'charge.dispute.closed': return 'chargeback_closed';
        default: return 'payment_succeeded';
      }
    } else if (gateway === 'razorpay') {
      switch (eventType) {
        case 'payment.authorized': return 'payment_succeeded';
        case 'payment.failed': return 'payment_failed';
        case 'refund.processed': return 'refund_completed';
        case 'refund.failed': return 'refund_failed';
        default: return 'payment_succeeded';
      }
    }
    
    return 'payment_succeeded';
  }

  private async handleEvent(gateway: string, event: any): Promise<any> {
    if (gateway === 'stripe') {
      return await this.handleStripeEvent(event);
    } else if (gateway === 'razorpay') {
      return await this.handleRazorpayEvent(event);
    }
    
    throw new Error(`Unsupported gateway: ${gateway}`);
  }

  private async handleStripeEvent(event: Stripe.Event): Promise<any> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return await this.handlePaymentIntentSucceeded(event);
      case 'payment_intent.payment_failed':
        return await this.handlePaymentIntentFailed(event);
      case 'charge.refunded':
        return await this.handleChargeRefunded(event);
      case 'charge.refund.updated':
        return await this.handleChargeRefundUpdated(event);
      case 'charge.dispute.created':
        return await this.handleDisputeCreated(event);
      case 'charge.dispute.closed':
        return await this.handleDisputeClosed(event);
      case 'payment_intent.amount_capturable_updated':
        return await this.handleAmountCapturableUpdated(event);
      case 'charge.expired':
        return await this.handleChargeExpired(event);
      case 'charge.succeeded':
        return await this.handleChargeSucceeded(event);
      default:
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
        return { received: true, unhandled: true };
    }
  }

  private async handleRazorpayEvent(event: any): Promise<any> {
    switch (event.event) {
      case 'payment.authorized':
        return await this.handlePaymentAuthorized(event);
      case 'payment.failed':
        return await this.handlePaymentFailed(event);
      case 'refund.processed':
        return await this.handleRefundProcessed(event);
      case 'refund.failed':
        return await this.handleRefundFailed(event);
      default:
        this.logger.warn(`Unhandled Razorpay event type: ${event.event}`);
        return { received: true, unhandled: true };
    }
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    if (paymentIntent.metadata?.orderId) {
      const order = await this.orderRepo.findOne({
        where: { id: paymentIntent.metadata.orderId }
      });
      
      if (order) {
        order.paymentStatus = 'completed' as any;
        await this.orderRepo.save(order);
      }
    }

    await this.productionNotification.sendPaymentNotification(
      paymentIntent.metadata?.userId || 'system',
      paymentIntent.id,
      {
        type: 'payment_success',
        severity: 'low',
        amount: paymentIntent.amount / 100,
        message: `Payment succeeded for ${paymentIntent.id}`,
      }
    );

    try {
      await this.ledgerService.createTransaction(
        paymentIntent.id,
        'cash',
        'revenue',
        paymentIntent.amount / 100,
        paymentIntent.currency,
        'payment',
        paymentIntent.id,
        `Payment succeeded for order ${paymentIntent.id}`
      );
    } catch (ledgerError) {
      this.logger.error('Failed to create ledger entry for payment success:', ledgerError);
    }

    this.logger.log(`Stripe PaymentIntent ${paymentIntent.id} succeeded`);
    return { received: true, paymentConfirmed: true };
  }

  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    if (paymentIntent.metadata?.orderId) {
      const order = await this.orderRepo.findOne({
        where: { id: paymentIntent.metadata.orderId }
      });
      
      if (order) {
        order.paymentStatus = 'failed' as any;
        await this.orderRepo.save(order);
      }
    }

    await this.productionNotification.sendPaymentNotification(
      paymentIntent.metadata?.userId || 'system',
      paymentIntent.id,
      {
        type: 'payment_failure',
        severity: 'high',
        amount: paymentIntent.amount / 100,
        message: `Payment failed: ${paymentIntent.last_payment_error?.message || 'any error'}`,
      }
    );

    this.logger.warn(`Stripe PaymentIntent ${paymentIntent.id} failed`);
    return { received: true, paymentFailed: true };
  }

  private async handleChargeRefunded(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    
    await this.productionNotification.sendPaymentNotification(
      charge.metadata?.userId || 'system',
      charge.payment_intent as string,
      {
        type: 'refund_completed',
        severity: 'medium',
        amount: (charge.amount_refunded || 0) / 100,
        message: `Refund completed for ${charge.id}`,
      }
    );

    try {
      await this.ledgerService.createTransaction(
        charge.id,
        'refund',
        'cash',
        (charge.amount_refunded || 0) / 100,
        charge.currency,
        'refund',
        charge.id,
        `Refund processed for charge ${charge.id}`
      );
    } catch (ledgerError) {
      this.logger.error('Failed to create ledger entry for refund:', ledgerError);
    }

    this.logger.log(`Stripe Charge ${charge.id} refunded for ${charge.amount_refunded}`);
    return { received: true, refundProcessed: true };
  }

  private async handleChargeRefundUpdated(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    this.logger.log(`Stripe Refund updated for charge ${charge.id}: ${charge.amount_refunded} refunded`);
    return { received: true, refundUpdated: true };
  }

  private async handleDisputeCreated(event: Stripe.Event): Promise<any> {
    return await this.chargebackService.handleDisputeCreated(event);
  }

  private async handleDisputeClosed(event: Stripe.Event): Promise<any> {
    return await this.chargebackService.handleDisputeClosed(event);
  }

  private async handleAmountCapturableUpdated(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    this.logger.log(`Stripe Amount capturable updated for ${paymentIntent.id}`);
    return { received: true, amountCapturableUpdated: true };
  }

  private async handleChargeExpired(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    this.logger.warn(`Stripe Charge expired: ${charge.id}`);
    return { received: true, chargeExpired: true };
  }

  private async handleChargeSucceeded(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    
    try {
      await this.ledgerService.createTransaction(
        charge.id,
        'cash',
        'revenue',
        charge.amount / 100,
        charge.currency,
        'payment',
        charge.id,
        `Payment succeeded for charge ${charge.id}`
      );
    } catch (ledgerError) {
      this.logger.error('Failed to create ledger entry for charge success:', ledgerError);
    }

    this.logger.log(`Stripe Charge succeeded: ${charge.id}`);
    return { received: true, chargeSucceeded: true };
  }

  private async handlePaymentAuthorized(event: any): Promise<any> {
    const payment = event.payload.payment.entity;
    
    if (payment?.notes?.orderId) {
      const order = await this.orderRepo.findOne({
        where: { id: payment.notes.orderId }
      });
      
      if (order) {
        order.paymentStatus = 'completed' as any;
        await this.orderRepo.save(order);
      }
    }

    await this.productionNotification.sendPaymentNotification(
      payment.notes?.userId || 'system',
      payment.id,
      {
        type: 'payment_success',
        severity: 'low',
        amount: payment.amount / 100,
        message: `Payment succeeded for ${payment.id}`,
      }
    );

    try {
      await this.ledgerService.createTransaction(
        payment.id,
        'cash',
        'revenue',
        payment.amount / 100,
        payment.currency,
        'payment',
        payment.id,
        `Payment succeeded for order ${payment.id}`
      );
    } catch (ledgerError) {
      this.logger.error('Failed to create ledger entry for payment success:', ledgerError);
    }

    this.logger.log(`Razorpay payment authorized: ${payment.id}`);
    return { received: true, paymentConfirmed: true };
  }

  private async handlePaymentFailed(event: any): Promise<any> {
    const payment = event.payload.payment.entity;
    
    if (payment?.notes?.orderId) {
      const order = await this.orderRepo.findOne({
        where: { id: payment.notes.orderId }
      });
      
      if (order) {
        order.paymentStatus = 'failed' as any;
        await this.orderRepo.save(order);
      }
    }

    await this.productionNotification.sendPaymentNotification(
      payment.notes?.userId || 'system',
      payment.id,
      {
        type: 'payment_failure',
        severity: 'high',
        amount: payment.amount / 100,
        message: `Payment failed: ${payment.error_description || 'any error'}`,
      }
    );

    this.logger.warn(`Razorpay payment failed: ${payment.id}`);
    return { received: true, paymentFailed: true };
  }

  private async handleRefundProcessed(event: any): Promise<any> {
    const refund = event.payload.refund.entity;
    
    await this.productionNotification.sendPaymentNotification(
      refund.notes?.userId || 'system',
      refund.id,
      {
        type: 'refund_completed',
        severity: 'medium',
        amount: refund.amount / 100,
        message: `Refund completed for ${refund.id}`,
      }
    );

    try {
      await this.ledgerService.createTransaction(
        refund.id,
        'refund',
        'cash',
        refund.amount / 100,
        refund.currency,
        'refund',
        refund.id,
        `Refund processed for ${refund.id}`
      );
    } catch (ledgerError) {
      this.logger.error('Failed to create ledger entry for refund:', ledgerError);
    }

    this.logger.log(`Razorpay refund processed: ${refund.id}`);
    return { received: true, refundProcessed: true };
  }

  private async handleRefundFailed(event: any): Promise<any> {
    const refund = event.payload.refund.entity;
    this.logger.warn(`Razorpay refund failed: ${refund.id}`);
    return { received: true, refundFailed: true };
  }

  async getWebhookStats(): Promise<any> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [total, processed, failed, stripeCount, razorpayCount, chargebackCreated, chargebackClosed] = await Promise.all([
      this.webhookRepo.count(),
      this.webhookRepo.count({ where: { processedAt: MoreThan(twentyFourHoursAgo) } }),
      this.paymentEventRepo.count({
        where: {
          isProcessed: false,
          createdAt: MoreThanOrEqual(twentyFourHoursAgo) as any
        }
      }),
      this.webhookRepo.count({ where: { gateway: 'stripe' } }),
      this.webhookRepo.count({ where: { gateway: 'razorpay' } }),
      this.paymentEventRepo.count({ where: { event: 'chargeback_received', createdAt: MoreThanOrEqual(twentyFourHoursAgo) as any } }),
      this.paymentEventRepo.count({ where: { event: 'chargeback_closed', createdAt: MoreThanOrEqual(twentyFourHoursAgo) as any } }),
    ]);

    return {
      totalWebhooksReceived: total,
      webhooksLast24h: processed,
      failedLast24h: failed,
      stripeWebhooksLast24h: stripeCount,
      razorpayWebhooksLast24h: razorpayCount,
      chargebackCreatedLast24h: chargebackCreated,
      chargebackClosedLast24h: chargebackClosed,
    };
  }
}