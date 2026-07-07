import { PaymentIntent, PaymentResult, RefundResult } from './payment.types';
export declare class CodService {
    createPaymentIntent(amount: number, currency?: string, userId?: string | null, metadata?: Record<string, any>): Promise<PaymentIntent>;
    confirmPayment(paymentId: string, userId: string): Promise<PaymentResult>;
    refundPayment(paymentId: string, amount: number | null | undefined, userId: string, reason?: string): Promise<RefundResult>;
}
