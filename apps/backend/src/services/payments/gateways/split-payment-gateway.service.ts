import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';
import { randomString } from '../../../../shared/random.utils';

export interface SplitPayment {
  gateway: string;
  amount: number;
  splitType: 'percentage' | 'fixed';
}

@Injectable()
export class SplitPaymentGateway implements PaymentGateway {
  private readonly logger = new Logger(SplitPaymentGateway.name);

  constructor(private configService: ConfigService) {}

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `split_${Date.now()}_${randomString(9)}`;
    const splits = metadata.splits as SplitPayment[] | undefined;

    let totalSplitAmount = 0;
    const splitDetails: Record<string, any> = {};

    if (splits) {
      for (const split of splits) {
        totalSplitAmount += split.splitType === 'fixed' ? split.amount : (amount * split.amount) / 100;
        splitDetails[split.gateway] = {
          splitType: split.splitType,
          calculatedAmount: split.splitType === 'fixed' ? split.amount : (amount * split.amount) / 100,
        };
      }
    }

    return {
      id: transactionId,
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: transactionId,
      payment_method: 'split_payment',
      metadata: {
        ...metadata,
        totalAmount: amount,
        totalSplitAmount,
        splits: splitDetails,
        gateway: 'split_payment',
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'split_payment',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('split_')) {
      throw new BadRequestException('Invalid split payment ID');
    }
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'succeeded',
      payment_method: 'split_payment',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    this.logger.warn(`Split payment refund requested for ${paymentId}. Requires proportional split calculation.`);
    return {
      id: `split_refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processing',
      note: 'Split payment refund requires proportional allocation across gateways',
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    return { data: { object: {} } };
  }

  getGatewayName(): string {
    return 'split_payment';
  }
}
