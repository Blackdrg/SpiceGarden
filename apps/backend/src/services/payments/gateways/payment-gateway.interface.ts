
export interface PaymentGateway {
  createPaymentIntent(amount: number, currency: string, userId: string, metadata: unknown): Promise<unknown>;
  confirmPayment(paymentId: string, userId: string): Promise<unknown>;
  refundPayment(paymentId: string, amount: number | null, userId: string, reason: string): Promise<unknown>;
  constructEvent(payload: Buffer, signature: string, secret: string): Promise<unknown>;
  getGatewayName(): string;
}
