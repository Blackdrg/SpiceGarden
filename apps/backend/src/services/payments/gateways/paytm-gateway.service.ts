import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';

@Injectable()
export class PaytmGateway implements PaymentGateway {
  private readonly logger = new Logger(PaytmGateway.name);
  private readonly merchantId: string;
  private readonly merchantKey: string;
  private readonly website: string;
  private readonly industryType: string;
  private readonly channelId: string;

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('PAYTM_MERCHANT_ID', '');
    this.merchantKey = this.configService.get<string>('PAYTM_MERCHANT_KEY', '');
    this.website = this.configService.get<string>('PAYTM_WEBSITE', 'WEBSTAGING');
    this.industryType = this.configService.get<string>('PAYTM_INDUSTRY_TYPE', 'Retail');
    this.channelId = this.configService.get<string>('PAYTM_CHANNEL_ID', 'WEB');
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'INR',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `paytm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: transactionId,
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: transactionId,
      payment_method: 'paytm',
      metadata: {
        ...metadata,
        merchantId: this.merchantId,
        gateway: 'paytm',
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'paytm',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('paytm_')) {
      throw new BadRequestException('Invalid Paytm payment ID');
    }
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'succeeded',
      payment_method: 'paytm',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    this.logger.warn(`Paytm refund requested. Payment: ${paymentId}`);
    return {
      id: `paytm_refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processing',
      note: 'Paytm refund requires gateway settlement',
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    return { data: { object: {} } };
  }

  getGatewayName(): string {
    return 'paytm';
  }
}
