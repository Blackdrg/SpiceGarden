import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentGateway } from '../gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../payment.types';
import { getRequiredSecret } from '../../../common/errors/missing-env.error';

@Injectable()
export class PaytmGateway implements PaymentGateway {
  private readonly logger = new Logger(PaytmGateway.name);
  private readonly merchantId: string;
  private readonly merchantKey: string;
  private readonly website: string;
  private readonly industryType: string;
  private readonly channelId: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.merchantId = getRequiredSecret(this.configService, 'PAYTM_MERCHANT_ID');
    this.merchantKey = getRequiredSecret(this.configService, 'PAYTM_MERCHANT_KEY');
    this.website = this.configService.get<string>('PAYTM_WEBSITE', 'WEBSTAGING');
    this.industryType = this.configService.get<string>('PAYTM_INDUSTRY_TYPE', 'Retail');
    this.channelId = this.configService.get<string>('PAYTM_CHANNEL_ID', 'WEB');
    const env = this.configService.get<string>('PAYTM_ENVIRONMENT', 'sandbox');
    this.baseUrl = env === 'production'
      ? 'https://securegw.paytm.in'
      : 'https://securegw-stage.paytm.in';
  }

  private generateChecksum(body: string): string {
    // Provider-mandated SHA256(body + merchantKey) for Paytm CHECKSUMHASH
    return crypto.createHash('sha256').update(body + this.merchantKey).digest('base64');
  }

  private async paytmRequest<T>(method: string, endpoint: string, body?: Record<string, any>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const payload = body ? JSON.stringify(body) : undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (payload) {
      headers['CHECKSUMHASH'] = this.generateChecksum(payload);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: payload,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      this.logger.error(`Paytm API error: ${response.status} ${errorBody}`);
      throw new BadRequestException(`Paytm API error: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'INR',
    userId: string | null = null,
    metadata: any = {}
  ): Promise<PaymentIntent> {
    const transactionId = `paytm_${Date.now()}_${crypto.randomBytes(9).toString('hex')}`;

    const body = {
      requestType: 'Payment',
      mid: this.merchantId,
      websiteName: this.website,
      channelId: this.channelId,
      orderId: transactionId,
      callbackUrl: metadata.callbackUrl || '',
      txnAmount: {
        value: amount.toFixed(2),
        currency: currency.toUpperCase(),
      },
      userInfo: {
        custId: userId || 'guest',
      },
      paymentMode: 'DEFAULT',
    };

    const response = await this.paytmRequest<{ success: boolean; body?: { resultInfo?: { resultStatus?: string; resultCode?: string; resultMsg?: string }; txnToken?: string } }>(
      'POST',
      '/theia/api/v1/initiateTransaction',
      body
    );

    if (!response.success || !response.body) {
      throw new BadRequestException('Paytm payment intent creation failed');
    }

    const txnToken = response.body.txnToken || '';
    const resultStatus = response.body.resultInfo?.resultStatus || 'PENDING';

    return {
      id: transactionId,
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      status: resultStatus === 'TXN_SUCCESS' ? 'succeeded' : 'pending',
      client_secret: txnToken,
      payment_method: 'paytm',
      metadata: {
        ...metadata,
        merchantId: this.merchantId,
        gateway: 'paytm',
        transactionId,
      },
    };
  }

  async fetchPaymentDetails(paymentId: string): Promise<PaymentIntent> {
    const transactionId = paymentId.replace('paytm_', '');
    const body = {
      mid: this.merchantId,
      orderId: transactionId,
    };

    const response = await this.paytmRequest<{ success: boolean; body?: { resultInfo?: { resultStatus?: string; resultCode?: string; resultMsg?: string }; txnStatus?: string } }>(
      'POST',
      '/theia/api/v1/orderStatus',
      body
    );

    const status = response.body?.resultInfo?.resultStatus?.toLowerCase() || 'pending';
    const mappedStatus = status === 'txn_success' ? 'succeeded' : status === 'txn_failed' ? 'failed' : 'pending';

    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: mappedStatus,
      payment_method: 'paytm',
    };
  }

  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResult> {
    if (!paymentId.startsWith('paytm_')) {
      throw new BadRequestException('Invalid Paytm payment ID');
    }

    const details = await this.fetchPaymentDetails(paymentId);
    return {
      id: paymentId,
      amount: details.amount,
      currency: details.currency,
      status: details.status || 'pending',
      payment_method: 'paytm',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<RefundResult> {
    const transactionId = paymentId.replace('paytm_', '');
    const body = {
      mid: this.merchantId,
      orderId: transactionId,
      refundAmount: amount ? (amount * 100).toFixed(2) : '0',
      refundReason: reason,
    };

    const response = await this.paytmRequest<{ success: boolean; body?: { resultInfo?: { resultStatus?: string; resultCode?: string; resultMsg?: string }; refundId?: string } }>(
      'POST',
      '/refund/api/v1/refund',
      body
    );

    if (!response.success) {
      throw new BadRequestException('Paytm refund failed');
    }

    return {
      id: `paytm_refund_${Date.now()}`,
      amount: amount || 0,
      currency: 'INR',
      status: 'processing',
      note: 'Paytm refund initiated',
    };
  }

  async constructEvent(payload: Buffer, signature: string, secret: string): Promise<GatewayEvent> {
    // Provider-mandated SHA256(payload + secret) for Paytm webhook verification
    const expectedSignature = crypto.createHash('sha256').update(payload.toString() + secret).digest('base64');
    const signatureBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (signatureBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
      throw new BadRequestException('Invalid Paytm webhook signature');
    }

    const parsed = JSON.parse(payload.toString()) as Record<string, any>;
    return {
      data: {
        object: parsed,
      },
    };
  }

  getGatewayName(): string {
    return 'paytm';
  }
}