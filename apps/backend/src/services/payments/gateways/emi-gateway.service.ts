import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';
import { randomString } from '../../../../shared/random.utils';

export interface EmiOptions {
  tenureMonths: number;
  bankCode: string;
  interestRate?: number;
}

@Injectable()
export class EmiGateway implements PaymentGateway {
  private readonly logger = new Logger(EmiGateway.name);

  constructor(private configService: ConfigService) {}

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `emi_${Date.now()}_${randomString(9)}`;
    const options = metadata.emiOptions as EmiOptions | undefined;
    const tenure = options?.tenureMonths || 3;
    const interestRate = options?.interestRate || 12;

    const emiAmount = this.calculateEmi(amount, tenure, interestRate);

    return {
      id: transactionId,
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: transactionId,
      payment_method: 'emi',
      metadata: {
        ...metadata,
        emiTenure: tenure,
        emiMonthlyAmount: emiAmount,
        totalEmiAmount: emiAmount * tenure,
        interestRate,
        gateway: 'emi',
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'emi',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('emi_')) {
      throw new BadRequestException('Invalid EMI payment ID');
    }
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'succeeded',
      payment_method: 'emi',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    this.logger.warn(`EMI refund requested for ${paymentId}. Requires special handling for active EMIs.`);
    return {
      id: `emi_refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processing',
      note: 'EMI refund requires checking active EMIs and bank notification',
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    return { data: { object: {} } };
  }

  private calculateEmi(principal: number, tenureMonths: number, annualRate: number): number {
    const monthlyRate = annualRate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100;
  }

  getGatewayName(): string {
    return 'emi';
  }
}
