import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';
import { getRequiredSecret } from '../../../common/errors/missing-env.error';

@Injectable()
export class GooglePayGateway implements PaymentGateway {
  private readonly logger = new Logger(GooglePayGateway.name);
  private readonly merchantId: string;
  private readonly merchantName: string;
  private readonly razorpayKeyId: string;
  private readonly razorpayKeySecret: string;

  constructor(private configService: ConfigService) {
    this.merchantId = getRequiredSecret(this.configService, 'GOOGLE_PAY_MERCHANT_ID');
    this.merchantName = this.configService.get<string>('GOOGLE_PAY_MERCHANT_NAME', 'SpiceGarden');
    this.razorpayKeyId = getRequiredSecret(this.configService, 'RAZORPAY_KEY_ID');
    this.razorpayKeySecret = getRequiredSecret(this.configService, 'RAZORPAY_KEY_SECRET');
  }

  private async razorpayRequest<T>(method: string, endpoint: string, data?: Record<string, any>): Promise<T> {
    const auth = Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/${endpoint}`, {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' && data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Record<string, any>;
      const desc = (errorData.error as Record<string, any> | undefined)?.description;
      throw new BadRequestException((typeof desc === 'string' ? desc : null) || `Razorpay API error: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `gpay_${Date.now()}_${crypto.randomBytes(9).toString('hex')}`;
    const amountInPaisa = Math.round(amount * 100);

    const paymentData: Record<string, any> = {
      amount: amountInPaisa,
      currency: currency.toLowerCase(),
      receipt: `receipt_${Date.now()}_${userId || 'guest'}`,
      notes: {
        ...metadata,
        userId,
        paymentMethod: 'google_pay',
        timestamp: new Date().toISOString(),
      },
      payment_method: {
        type: 'upi',
        upi: {
          vpa: this.merchantId,
          flow: 'QR',
        },
      },
    };

    const payment = await this.razorpayRequest<{ id: string; amount: number; currency: string; status: string; client_secret?: string }>('POST', 'orders', paymentData);

    return {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      client_secret: payment.id,
      payment_method: 'google_pay',
      metadata: {
        ...metadata,
        merchantId: this.merchantId,
        merchantName: this.merchantName,
        gateway: 'google_pay',
        transactionId,
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    const payment = await this.razorpayRequest<{ id: string; amount: number; currency: string; status: string }>('GET', `orders/${paymentId}`);
    return {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      client_secret: payment.id,
      payment_method: 'google_pay',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('gpay_')) {
      throw new BadRequestException('Invalid Google Pay payment ID');
    }

    const details = await this.fetchPaymentDetails(paymentId);
    return {
      id: paymentId,
      amount: details.amount,
      currency: details.currency,
      status: details.status,
      payment_method: 'google_pay',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    const order = await this.razorpayRequest<{ id: string; amount: number; currency: string; payments?: { items?: Array<{ id: string }> } }>('GET', `orders/${paymentId}`);
    const payments = order.payments as Record<string, any> | undefined;
    const items = (payments?.items as Record<string, any>[] | undefined);
    const paymentIdToRefund = (items?.[0] as Record<string, any> | undefined)?.id || paymentId;
    const refundAmount = amount ?? (order.amount / 100);
    const maxRefund = order.amount / 100;

    if (refundAmount > maxRefund) {
      throw new BadRequestException(`Refund amount cannot exceed original amount: ${maxRefund}`);
    }

    if (refundAmount <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero');
    }

    const refund = await this.razorpayRequest<{ id: string; amount: number; currency: string; status: string }>('POST', `payments/${paymentIdToRefund}/refund`, {
      amount: Math.round(refundAmount * 100),
      notes: { reason, userId },
    });

    return {
      id: refund.id,
      amount: refund.amount,
      currency: order.currency || 'inr',
      status: refund.status,
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload.toString()).digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature ?? '', 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      throw new BadRequestException('Invalid Google Pay webhook signature');
    }

    const parsed = JSON.parse(payload.toString()) as Record<string, any>;
    return {
      data: {
        object: (parsed?.entity || parsed || {}) as Record<string, any>,
      },
    };
  }

  getGatewayName(): string {
    return 'google_pay';
  }
}

