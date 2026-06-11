import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { PaymentGateway } from './payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';

@Injectable()
export class StripeGateway implements PaymentGateway {
  private readonly logger = new Logger(StripeGateway.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder',
      {
        apiVersion: '2024-04-10',
      }
    );
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    userId: string = null,
    metadata: Record<string, unknown> = {}
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata: {
          ...metadata,
          userId,
          timestamp: new Date().toISOString(),
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret || undefined,
      };
    } catch (error) {
      this.logger.error('Stripe payment intent creation failed:', error);
      throw error;
    }
  }

  async confirmPayment(
    paymentId: string,
    userId: string
  ): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

      if (paymentIntent.status === 'succeeded') {
        return {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
        };
      } else {
        throw new BadRequestException(`Payment not successful: ${paymentIntent.status}`);
      }
    } catch (error) {
      this.logger.error('Stripe payment confirmation failed:', error);
      throw error;
    }
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

      const refundAmount = amount ?? (paymentIntent.amount / 100);
      const maxRefund = paymentIntent.amount / 100;

      if (refundAmount > maxRefund) {
        throw new BadRequestException(`Refund amount cannot exceed original payment: ${maxRefund}`);
      }

      if (refundAmount <= 0) {
        throw new BadRequestException('Refund amount must be greater than zero');
      }

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        amount: Math.round(refundAmount * 100),
        reason: reason as 'duplicate' | 'fraudulent' | 'requested_by_customer',
      });

      return {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
      };
    } catch (error) {
      this.logger.error('Stripe payment refund failed:', error);
      throw error;
    }
  }

  async constructEvent(
    payload: Buffer,
    signature: string,
    secret: string
  ): Promise<GatewayEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
      return {
        data: {
          object: (event.data?.object as unknown) as Record<string, unknown> || {},
        },
      };
    } catch (error) {
      this.logger.error('Stripe webhook verification failed:', error);
      throw error;
    }
  }

  getGatewayName(): string {
    return 'stripe';
  }
}
