import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';

@Injectable()
export class PhonePeGateway implements PaymentGateway {
  private readonly logger = new Logger(PhonePeGateway.name);
  private readonly merchantId: string;
  private readonly saltKey: string;

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('PHONEPE_MERCHANT_ID', '');
    this.saltKey = this.configService.get<string>('PHONEPE_SALT_KEY', '');
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `phonepe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amountInPaisa = Math.round(amount * 100);

    return {
      id: transactionId,
      amount: amountInPaisa,
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: transactionId,
      payment_method: 'phonepe',
      metadata: {
        ...metadata,
        merchantId: this.merchantId,
        gateway: 'phonepe',
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'phonepe',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('phonepe_')) {
      throw new BadRequestException('Invalid PhonePe payment ID');
    }
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'succeeded',
      payment_method: 'phonepe',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    this.logger.warn(`PhonePe refund requested. Payment: ${paymentId}`);
    return {
      id: `phonepe_refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processing',
      note: 'PhonePe refund requires gateway settlement',
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    return { data: { object: {} } };
  }

  getGatewayName(): string {
    return 'phonepe';
  }
}
