import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from './payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';

function safeParse<T = any>(json: string): T | undefined {
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

@Injectable()
export class CashOnDeliveryGateway implements PaymentGateway {
  private readonly logger = new Logger(CashOnDeliveryGateway.name);

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const codPaymentId = `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const meta = metadata as Record<string, any> | undefined;
    return {
      id: codPaymentId,
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: codPaymentId,
      payment_method: 'cod',
      metadata: {
        ...meta,
        userId,
        paymentMethod: 'cash_on_delivery',
        instruction: 'Pay cash to driver on delivery',
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      client_secret: paymentId,
      payment_method: 'cod',
      metadata: { paymentMethod: 'cash_on_delivery' },
    };
  }

  async confirmPayment(
    paymentId: string,
    userId: string
  ): Promise<PaymentResult> {
    if (!paymentId?.startsWith('cod_')) {
      throw new BadRequestException('Invalid COD payment ID');
    }

    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'cod',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    this.logger.warn(`COD refund requested - no action taken. Amount: ${amount}, Payment: ${paymentId}`);
    return {
      id: `refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processed',
      note: 'COD refund - requires manual driver reconciliation',
    };
  }

  async constructEvent(
    payload: Buffer,
    signature: string,
    secret: string
  ): Promise<GatewayEvent> {
    return { data: { object: {} } };
  }

  getGatewayName(): string {
    return 'cod';
  }
}
