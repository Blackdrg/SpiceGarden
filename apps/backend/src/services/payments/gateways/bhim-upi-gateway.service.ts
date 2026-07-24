import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';

@Injectable()
export class BhimUpiGateway implements PaymentGateway {
  private readonly logger = new Logger(BhimUpiGateway.name);
  private readonly upiId: string;
  private readonly merchantName: string;

  constructor(private configService: ConfigService) {
    this.upiId = this.configService.get<string>('BHIM_UPI_ID', '');
    this.merchantName = this.configService.get<string>('BHIM_UPI_NAME', 'SpiceGarden');
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `bhimupi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amountInPaisa = Math.round(amount * 100);

    return {
      id: transactionId,
      amount: amountInPaisa,
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: transactionId,
      payment_method: 'bhim_upi',
      metadata: {
        ...metadata,
        upiId: this.upiId,
        merchantName: this.merchantName,
        gateway: 'bhim_upi',
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'bhim_upi',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('bhimupi_')) {
      throw new BadRequestException('Invalid BHIM UPI payment ID');
    }
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'succeeded',
      payment_method: 'bhim_upi',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    this.logger.warn(`BHIM UPI refund requested. Payment: ${paymentId}`);
    return {
      id: `bhimupi_refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processing',
      note: 'BHIM UPI refund requires gateway settlement',
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    return { data: { object: {} } };
  }

  getGatewayName(): string {
    return 'bhim_upi';
  }
}
