
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';

export interface PaymentGateway {
  createPaymentIntent(amount: number, currency: string, userId: string, metadata: unknown): Promise<PaymentIntent>;
  confirmPayment(paymentId: string, userId: string): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount: number | null, userId: string, reason: string): Promise<RefundResult>;
  constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent>;
  getGatewayName(): string;
}
