import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentQrCodeEntity, QrType, QrStatus } from '../../../db/entities/payment-qr.entity';
import { PaymentGatewayFactory } from '../gateway-factory.service';
import { AuditService } from '../../../audit/audit.service';

export interface CreateQrDto {
  upiId: string;
  upiName: string;
  amount?: number;
  orderId?: string;
  paymentIntentId?: string;
  gateway?: string;
}

@Injectable()
export class PaymentQrService {
  private readonly logger = new Logger(PaymentQrService.name);
  private readonly QR_EXPIRY_MINUTES = 15;

  constructor(
    private configService: ConfigService,
    private gatewayFactory: PaymentGatewayFactory,
    @InjectRepository(PaymentQrCodeEntity)
    private readonly qrRepo: Repository<PaymentQrCodeEntity>,
    private readonly auditService: AuditService,
  ) {}

  async createQrCode(dto: CreateQrDto): Promise<PaymentQrCodeEntity> {
    const gateway = this.gatewayFactory.getGateway(dto.gateway);

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.QR_EXPIRY_MINUTES);

    const gatewayName = gateway.getGatewayName();
    let qrData = '';
    let qrImageUrl: string | undefined;

    if (gatewayName === 'razorpay') {
      const razorpayQr = await this.createRazorpayQr(dto, expiry);
      qrData = razorpayQr.qrData;
      qrImageUrl = razorpayQr.qrImageUrl;
    } else {
      qrData = this.generateUpiQrString(dto.upiId, dto.upiName, dto.amount);
      qrImageUrl = await this.generateQrImage(qrData);
    }

    const existingQr = await this.qrRepo.findOne({
      where: { orderId: dto.orderId || '', status: QrStatus.WAITING_PAYMENT },
    });

    if (existingQr) {
      throw new BadRequestException(`QR code already exists for order ${dto.orderId}. Use the existing one or cancel it first.`);
    }

    const qrCode = this.qrRepo.create({
      qrType: QrType.DYNAMIC,
      upiId: dto.upiId,
      upiName: dto.upiName,
      amount: dto.amount || 0,
      currency: 'INR',
      orderId: dto.orderId,
      paymentIntentId: dto.paymentIntentId,
      qrData,
      qrImageUrl,
      status: QrStatus.WAITING_PAYMENT,
      expiresAt: expiry,
      attempts: 0,
    });

    const saved = await this.qrRepo.save(qrCode);

    this.logger.log(`QR code created: ${saved.id} for order ${dto.orderId || 'N/A'}, expires at ${expiry.toISOString()}`);

    return saved;
  }

  async getQrCode(id: string): Promise<PaymentQrCodeEntity> {
    const qr = await this.qrRepo.findOne({ where: { id } });
    if (!qr) {
      throw new NotFoundException(`QR code not found: ${id}`);
    }
    return qr;
  }

  async getQrByOrderId(orderId: string): Promise<PaymentQrCodeEntity | null> {
    return this.qrRepo.findOne({
      where: { orderId, status: QrStatus.WAITING_PAYMENT },
      order: { createdAt: 'DESC' },
    });
  }

  async verifyPayment(id: string): Promise<{ status: QrStatus; paid: boolean; paymentRef?: string }> {
    const qr = await this.getQrCode(id);

    if (qr.status === QrStatus.PAID) {
      return { status: qr.status, paid: true, paymentRef: qr.paymentRef || undefined };
    }

    if (qr.expiresAt && qr.expiresAt < new Date()) {
      await this.qrRepo.update(id, { status: QrStatus.EXPIRED });
      return { status: QrStatus.EXPIRED, paid: false };
    }

    const gateway = this.gatewayFactory.getGateway(qr.gateway);
    try {
      const paymentDetails = await gateway.fetchPaymentDetails(qr.paymentIntentId || id);

      if (['succeeded', 'paid', 'captured'].includes(paymentDetails.status || '')) {
        await this.qrRepo.update(id, {
          status: QrStatus.PAID,
          paidAt: new Date(),
          paymentRef: paymentDetails.id,
        });

        await this.auditService.log('qr_payment_confirmed', 'system', 'Payment', id, {
          orderId: qr.orderId,
          amount: qr.amount,
          paymentRef: paymentDetails.id,
        });

        return { status: QrStatus.PAID, paid: true, paymentRef: paymentDetails.id };
      }
    } catch (error) {
      this.logger.debug(`QR payment verification attempt ${id} not yet confirmed: ${(error as Error).message}`);
    }

    await this.qrRepo.update(id, { attempts: qr.attempts + 1 });
    return { status: qr.status, paid: false };
  }

  async cancelQr(id: string): Promise<{ message: string }> {
    const qr = await this.getQrCode(id);

    if (qr.status === QrStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid QR code');
    }

    await this.qrRepo.update(id, { status: QrStatus.CANCELLED });
    return { message: 'QR code cancelled successfully' };
  }

  async regenerateQr(id: string): Promise<PaymentQrCodeEntity> {
    const existing = await this.getQrCode(id);

    if (existing.status === QrStatus.PAID) {
      throw new BadRequestException('Cannot regenerate a paid QR code');
    }

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.QR_EXPIRY_MINUTES);

    const qrData = this.generateUpiQrString(existing.upiId, existing.upiName, existing.amount || 0);
    const qrImageUrl = await this.generateQrImage(qrData);

    await this.qrRepo.update(id, {
      qrData,
      qrImageUrl,
      status: QrStatus.WAITING_PAYMENT,
      expiresAt: expiry,
      attempts: 0,
    });

    this.logger.log(`QR code regenerated: ${id}`);
    return await this.getQrCode(id);
  }

  async pollForPayment(orderId: string, maxAttempts: number = 20): Promise<PaymentQrCodeEntity | null> {
    let qr = await this.getQrByOrderId(orderId);

    if (!qr) {
      return null;
    }

    for (let i = 0; i < maxAttempts; i++) {
      const verification = await this.verifyPayment(qr.id);

      if (verification.paid) {
        return qr;
      }

      if (verification.status === QrStatus.EXPIRED || verification.status === QrStatus.CANCELLED) {
        return qr;
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return qr;
  }

  async cleanupExpiredQr(): Promise<number> {
    const result = await this.qrRepo
      .createQueryBuilder()
      .delete()
      .where('status = :status', { status: QrStatus.EXPIRED })
      .andWhere('expiresAt < :threshold', { threshold: new Date(Date.now() - 24 * 60 * 60 * 1000) })
      .execute();

    return result.affected || 0;
  }

  private async createRazorpayQr(dto: CreateQrDto, expiry: Date): Promise<{ qrData: string; qrImageUrl: string }> {
    this.logger.warn('Razorpay QR creation requires Razorpay X customer/orders endpoint. Returning UPI QR fallback.');
    const upiQrData = this.generateUpiQrString(dto.upiId, dto.upiName, dto.amount);
    const qrImageUrl = await this.generateQrImage(upiQrData);
    return { qrData: upiQrData, qrImageUrl };
  }

  private generateUpiQrString(upiId: string, upiName: string, amount?: number): string {
    const merchantName = encodeURIComponent(upiName || 'SpiceGarden');
    const cleanUpiId = upiId.replace(/\s/g, '');
    const pa = encodeURIComponent(cleanUpiId);
    const pn = merchantName;
    const curr = 'INR';

    let qrString = `upi://pay?pa=${pa}&pn=${pn}&cu=${curr}`;
    if (amount && amount > 0) qrString += `&am=${amount.toFixed(2)}`;
    qrString += `&tn=${encodeURIComponent('SpiceGarden Order Payment')}`;

    return qrString;
  }

  private async generateQrImage(data: string): Promise<string> {
    const qrcode = await import('qrcode');
    const dataUrl = await qrcode.toDataURL(data, { width: 400, margin: 2, color: { dark: '#1a1a2e', light: '#ffffff' } });
    return dataUrl;
  }
}
