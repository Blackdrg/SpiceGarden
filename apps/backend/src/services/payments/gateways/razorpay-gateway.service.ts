import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from './payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';

function safeParse<T = unknown>(json: string): T | undefined {
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

@Injectable()
export class RazorpayGateway implements PaymentGateway {
  private readonly logger = new Logger(RazorpayGateway.name);
  private keyId: string;
  private keySecret: string;

  constructor(private configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_placeholder';
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'test_placeholder';
  }

  private async razorpayRequest(
    method: string,
    endpoint: string,
    data: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>> {
    try {
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

      const response = await fetch(`https://api.razorpay.com/v1/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        const desc = (errorData.error as Record<string, unknown> | undefined)?.description;
        throw new Error((typeof desc === 'string' ? desc : null) || `Razorpay API error: ${response.status}`);
      }

      return (await response.json()) as Record<string, unknown>;
    } catch (error) {
      this.logger.error(`Razorpay API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string = null,
    metadata: unknown = {}
  ): Promise<PaymentIntent> {
    try {
      const amountInPaise = Math.round(amount * 100);

      const meta = metadata as Record<string, unknown> | undefined;

      const paymentData: Record<string, unknown> = {
        amount: amountInPaise,
        currency: currency.toLowerCase(),
        receipt: `receipt_${Date.now()}_${userId || 'guest'}`,
        notes: {
          ...meta,
          userId,
          timestamp: new Date().toISOString(),
        },
      };

      const payment = await this.razorpayRequest('POST', 'orders', paymentData);

      return {
        id: payment.id as string,
        amount: (payment.amount as number) / 100,
        currency: payment.currency as string,
        status: payment.status as string,
        client_secret: payment.id as string | undefined,
      };
    } catch (error) {
      this.logger.error('Razorpay payment intent creation failed:', error);
      throw error;
    }
  }

  async confirmPayment(
    paymentId: string,
    userId: string
  ): Promise<PaymentResult> {
    try {
      const order = await this.razorpayRequest('GET', `orders/${paymentId}`);

      if (order.status === 'paid' || order.status === 'captured') {
        return {
          id: order.id as string,
          amount: (order.amount as number) / 100,
          currency: order.currency as string,
          status: order.status as string,
        };
      } else {
        throw new BadRequestException(`Payment not successful: ${order.status}`);
      }
    } catch (error) {
      this.logger.error('Razorpay payment confirmation failed:', error);
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
      const order = await this.razorpayRequest('GET', `orders/${paymentId}`);

      const payments = (order.payments as Record<string, unknown> | undefined);
      const items = (payments?.items as Record<string, unknown>[] | undefined);
      const firstPayment = items?.[0] as Record<string, unknown> | undefined;
      const paymentIdToRefund = (firstPayment?.id as string | undefined) || paymentId;
      const orderAmount = order.amount as number;
      const refundAmount = amount ?? (orderAmount / 100);
      const maxRefund = orderAmount / 100;

      if (refundAmount > maxRefund) {
        throw new BadRequestException(`Refund amount cannot exceed original amount: ${maxRefund}`);
      }

      if (refundAmount <= 0) {
        throw new BadRequestException('Refund amount must be greater than zero');
      }

      const refundData: Record<string, unknown> = {
        amount: Math.round(refundAmount * 100),
        notes: {
          reason,
          userId,
        },
      };

      const refund = await this.razorpayRequest('POST', `payments/${paymentIdToRefund}/refund`, refundData);

      return {
        id: refund.id as string,
        amount: (refund.amount as number) / 100,
        status: refund.status as string,
      };
    } catch (error) {
      this.logger.error('Razorpay payment refund failed:', error);
      throw error;
    }
  }

  async constructEvent(
    payload: Buffer,
    signature: string,
    secret: string
  ): Promise<GatewayEvent> {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload.toString())
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Invalid webhook signature');
      }

      const parsed = safeParse<Record<string, unknown>>(payload.toString());
      return {
        data: {
          object: (parsed?.entity || parsed || {}) as Record<string, unknown>,
        },
      };
    } catch (error) {
      this.logger.error('Razorpay webhook verification failed:', error);
      throw error;
    }
  }

  getGatewayName(): string {
    return 'razorpay';
  }
}
