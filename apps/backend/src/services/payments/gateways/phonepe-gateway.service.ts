import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';
import { getRequiredSecret } from '../../../common/errors/missing-env.error';

@Injectable()
export class PhonePeGateway implements PaymentGateway {
  private readonly logger = new Logger(PhonePeGateway.name);
  private readonly merchantId: string;
  private readonly saltKey: string;
  private readonly saltKeyIndex: number;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.merchantId = getRequiredSecret(this.configService, 'PHONEPE_MERCHANT_ID');
    this.saltKey = getRequiredSecret(this.configService, 'PHONEPE_SALT_KEY');
    this.saltKeyIndex = parseInt(this.configService.get<string>('PHONEPE_SALT_KEY_INDEX', '1'), 10);
    const env = this.configService.get<string>('PHONEPE_ENVIRONMENT', 'sandbox');
    this.baseUrl = env === 'production'
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  }

  private buildVerifyHeader(payload: string): string {
    // Provider-mandated SHA256(payload + saltKey) for PhonePe X-VERIFY header
    const hash = crypto.createHash('sha256').update(payload + this.saltKey).digest('hex');
    return `${hash}###${this.saltKeyIndex}`;
  }

  private async phonePeRequest<T>(method: string, endpoint: string, body?: Record<string, any>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const payload = body ? JSON.stringify(body) : undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-MERCHANT-ID': this.merchantId,
    };
    if (payload) {
      headers['X-VERIFY'] = this.buildVerifyHeader(payload);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: payload,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.error(`PhonePe API error: ${response.status} ${errorBody}`);
      throw new BadRequestException(`PhonePe API error: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `phonepe_${Date.now()}_${crypto.randomBytes(9).toString('hex')}`;
    const amountInPaisa = Math.round(amount * 100);

    const body = {
      merchantId: this.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId || 'guest',
      amount: amountInPaisa,
      currency: currency.toUpperCase(),
      redirectUrl: metadata.redirectUrl || '',
      redirectMode: 'REDIRECT',
      callbackUrl: metadata.callbackUrl || '',
      mobileNumber: metadata.mobileNumber || '',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const response = await this.phonePeRequest<{ success: boolean; data?: { paymentId?: string; instrumentResponse?: { redirectInfo?: { url?: string } } } }>('POST', '/pg/v1/pay', body);

    if (!response.success || !response.data) {
      throw new BadRequestException('PhonePe payment intent creation failed');
    }

    const paymentId = response.data.paymentId || transactionId;
    const redirectUrl = response.data.instrumentResponse?.redirectInfo?.url || '';

    return {
      id: paymentId,
      amount: amountInPaisa,
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: redirectUrl,
      payment_method: 'phonepe',
      metadata: {
        ...metadata,
        merchantId: this.merchantId,
        gateway: 'phonepe',
        transactionId,
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    const transactionId = paymentId.replace('phonepe_', '');
    const response = await this.phonePeRequest<{ success: boolean; data?: { code?: string; message?: string; status?: string } }>(
      'GET',
      `/pg/v1/status/${this.merchantId}/${transactionId}`
    );

    const status = response.data?.status?.toLowerCase() || 'pending';
    const mappedStatus = status === 'completed' ? 'succeeded' : status === 'failed' ? 'failed' : 'pending';

    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: mappedStatus,
      payment_method: 'phonepe',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('phonepe_')) {
      throw new BadRequestException('Invalid PhonePe payment ID');
    }

    const details = await this.fetchPaymentDetails(paymentId);
    return {
      id: paymentId,
      amount: details.amount,
      currency: details.currency,
      status: details.status || 'pending',
      payment_method: 'phonepe',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    const transactionId = paymentId.replace('phonepe_', '');
    const body = {
      merchantId: this.merchantId,
      merchantTransactionId: transactionId,
      amount: amount ? Math.round(amount * 100) : 0,
      reason,
    };

    const response = await this.phonePeRequest<{ success: boolean; data?: { code?: string; message?: string } }>(
      'POST',
      '/pg/v1/refund',
      body
    );

    if (!response.success) {
      throw new BadRequestException('PhonePe refund failed');
    }

    return {
      id: `phonepe_refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processing',
      note: 'PhonePe refund initiated',
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    // Provider-mandated SHA256(payload + secret) for PhonePe webhook verification
    const [hashPart] = signature.split('###');
    const expectedSignature = crypto.createHash('sha256').update(payload.toString() + secret).digest('hex');
    const hashBuf = Buffer.from(hashPart);
    const expectedBuf = Buffer.from(expectedSignature);
    if (hashBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(hashBuf, expectedBuf)) {
      throw new BadRequestException('Invalid PhonePe webhook signature');
    }

    const parsed = JSON.parse(payload.toString()) as Record<string, any>;
    return {
      data: {
        object: parsed,
      },
    };
  }

  getGatewayName(): string {
    return 'phonepe';
  }
}