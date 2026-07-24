import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';

@Injectable()
export class GooglePayGateway implements PaymentGateway {
  private readonly logger = new Logger(GooglePayGateway.name);
  private readonly merchantId: string;
  private readonly merchantName: string;

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('GOOGLE_PAY_MERCHANT_ID', '');
    this.merchantName = this.configService.get<string>('GOOGLE_PAY_MERCHANT_NAME', 'SpiceGarden');
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `gpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amountInPaisa = Math.round(amount * 100);

    return {
      id: transactionId,
      amount: amountInPaisa,
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: transactionId,
      payment_method: 'google_pay',
      metadata: {
        ...metadata,
        merchantId: this.merchantId,
        merchantName: this.merchantName,
        gateway: 'google_pay',
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'google_pay',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('gpay_')) {
      throw new BadRequestException('Invalid Google Pay payment ID');
    }
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'succeeded',
      payment_method: 'google_pay',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    this.logger.warn(`Google Pay refund requested - requires gateway settlement. Payment: ${paymentId}`);
    return {
      id: `gpay_refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processing',
      note: 'Google Pay refund requires gateway settlement process',
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    this.logger.debug('Google Pay webhook event constructed');
    return { data: { object: {} } };
  }

  getGatewayName(): string {
    return 'google_pay';
  }
}
