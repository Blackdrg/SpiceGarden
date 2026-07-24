import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';

export interface NetBankingOptions {
  bankCode: string;
  bankName: string;
}

@Injectable()
export class NetBankingGateway implements PaymentGateway {
  private readonly logger = new Logger(NetBankingGateway.name);

  private readonly supportedBanks: Record<string, string> = {
    'HDFC': 'HDFC Bank',
    'ICICI': 'ICICI Bank',
    'SBI': 'State Bank of India',
    'AXIS': 'Axis Bank',
    'KOTAK': 'Kotak Mahindra Bank',
    'PNB': 'Punjab National Bank',
    'BOB': 'Bank of Baroda',
    'CANARA': 'Canara Bank',
    'UNION': 'Union Bank of India',
    'IDFC': 'IDFC First Bank',
  };

  constructor(private configService: ConfigService) {}

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `nb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const options = metadata.options as NetBankingOptions | undefined;
    const bankCode = options?.bankCode || 'HDFC';
    const bankName = options?.bankName || this.supportedBanks[bankCode] || 'Unknown Bank';

    return {
      id: transactionId,
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: transactionId,
      payment_method: 'net_banking',
      metadata: {
        ...metadata,
        bankCode,
        bankName,
        gateway: 'net_banking',
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'net_banking',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('nb_')) {
      throw new BadRequestException('Invalid net banking payment ID');
    }
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'succeeded',
      payment_method: 'net_banking',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    this.logger.warn(`Net Banking refund requested. Payment: ${paymentId}`);
    return {
      id: `nb_refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processing',
      note: 'Net Banking refund requires gateway settlement',
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    return { data: { object: {} } };
  }

  getSupportedBanks(): Record<string, string> {
    return { ...this.supportedBanks };
  }

  getGatewayName(): string {
    return 'net_banking';
  }
}
