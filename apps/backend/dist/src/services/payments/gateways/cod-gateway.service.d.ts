import { PaymentGateway } from './payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';
export declare class CashOnDeliveryGateway implements PaymentGateway {
    private readonly logger;
    createPaymentIntent(amount: number, currency?: string, userId?: string | null, metadata?: any): Promise<PaymentIntent>;
    fetchPaymentDetails(paymentId: string): Promise<PaymentIntent>;
    confirmPayment(paymentId: string, userId: string): Promise<PaymentResult>;
    refundPayment(paymentId: string, amount: number | null | undefined, userId: string, reason?: string): Promise<RefundResult>;
    constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent>;
    getGatewayName(): string;
}
