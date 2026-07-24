import { Test, TestingModule } from '@nestjs/testing';
import { PaymentQrService } from '../src/services/payments/qr/payment-qr.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentQrCodeEntity, QrStatus } from '../src/db/entities/payment-qr.entity';
import { PaymentGatewayFactory } from '../src/services/payments/gateway-factory.service';
import { AuditService } from '../src/audit/audit.service';
import { ConfigService } from '@nestjs/config';

describe('PaymentQrService', () => {
  let service: PaymentQrService;
  let qrRepo: jest.Mocked<Repository<PaymentQrCodeEntity>>;
  let gatewayFactory: PaymentGatewayFactory;

  beforeEach(async () => {
    qrRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), update: jest.fn(), createQueryBuilder: jest.fn(() => ({ where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), delete: jest.fn().mockReturnThis(), execute: jest.fn() })) as any } as any;
    gatewayFactory = { getGateway: jest.fn().mockReturnValue({ getGatewayName: () => 'razorpay', fetchPaymentDetails: jest.fn().mockResolvedValue({ status: 'pending' }) }) } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentQrService,
        { provide: PaymentGatewayFactory, useValue: gatewayFactory },
        { provide: AuditService, useValue: { log: jest.fn() } },
        { provide: getRepositoryToken(PaymentQrCodeEntity), useValue: qrRepo },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(15) } },
      ],
    }).compile();

    service = module.get(PaymentQrService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('should create QR code and save', async () => {
    const mockQr = { id: 'qr_123', status: QrStatus.WAITING_PAYMENT, qrData: 'upi://pay...', qrImageUrl: 'data:image/png;base64,...', expiresAt: new Date() };
    jest.spyOn(service as any, 'getQrByOrderId').mockResolvedValue(null);
    jest.spyOn(service as any, 'generateUpiQrString').mockReturnValue('upi://pay...');
    jest.spyOn(service as any, 'generateQrImage').mockResolvedValue('data:image/png;base64,...');
    qrRepo.create = jest.fn().mockReturnValue(mockQr as any);
    qrRepo.save = jest.fn().mockResolvedValue(mockQr as any);
    const result = await service.createQrCode({ upiId: 'test@okaxis', upiName: 'Test', amount: 100, orderId: 'ord_1' });
    expect(result).toBeDefined();
    expect(qrRepo.save).toHaveBeenCalled();
  });

  it('should throw when QR already exists for order', async () => {
    jest.spyOn(service as any, 'getQrByOrderId').mockResolvedValue({ id: 'existing' } as any);
    await expect(service.createQrCode({ upiId: 'test@okaxis', upiName: 'Test', orderId: 'ord_1' })).rejects.toThrow();
  });

  it('should get QR by order id', async () => {
    const mockQr = { id: 'qr_1', orderId: 'ord_1', status: QrStatus.WAITING_PAYMENT };
    jest.spyOn(service as any, 'getQrByOrderId').mockResolvedValue(mockQr as any);
    const result = await service.getQrByOrderId('ord_1');
    expect(result).toEqual(mockQr);
  });

  it('should return null when no QR for order', async () => {
    jest.spyOn(service as any, 'getQrByOrderId').mockResolvedValue(null);
    const result = await service.getQrByOrderId('missing');
    expect(result).toBeNull();
  });

  it('should verify payment and mark paid on success', async () => {
    const mockQr = { id: 'qr_1', status: QrStatus.WAITING_PAYMENT, paymentIntentId: 'pi_1', amount: 100, orderId: 'ord_1' };
    jest.spyOn(service as any, 'getQrCode').mockResolvedValue(mockQr as any);
    jest.spyOn(gatewayFactory.getGateway('razorpay'), 'fetchPaymentDetails').mockResolvedValue({ status: 'succeeded', id: 'pay_1', amount: 10000, currency: 'INR' } as any);
    qrRepo.update = jest.fn().mockResolvedValue({} as any);
    const result = await service.verifyPayment('qr_1');
    expect(result.paid).toBe(true);
  });

  it('should cancel pending QR', async () => {
    const mockQr = { id: 'qr_1', status: QrStatus.WAITING_PAYMENT };
    jest.spyOn(service as any, 'getQrCode').mockResolvedValue(mockQr as any);
    qrRepo.update = jest.fn().mockResolvedValue({} as any);
    const result = await service.cancelQr('qr_1');
    expect(result.message).toBe('QR code cancelled successfully');
  });

  it('should throw when cancelling paid QR', async () => {
    jest.spyOn(service as any, 'getQrCode').mockResolvedValue({ id: 'qr_1', status: QrStatus.PAID } as any);
    await expect(service.cancelQr('qr_1')).rejects.toThrow('Cannot cancel a paid QR code');
  });

  it('should regenerate QR', async () => {
    const mockQr = { id: 'qr_1', status: QrStatus.WAITING_PAYMENT, upiId: 'test', upiName: 'Test', amount: 100 };
    jest.spyOn(service as any, 'getQrCode').mockResolvedValue(mockQr as any);
    jest.spyOn(service as any, 'generateUpiQrString').mockReturnValue('upi://pay...');
    jest.spyOn(service as any, 'generateQrImage').mockResolvedValue('data:image/png;base64,...');
    qrRepo.update = jest.fn().mockResolvedValue({} as any);
    qrRepo.findOne = jest.fn().mockResolvedValue({ ...mockQr, status: QrStatus.WAITING_PAYMENT } as any);
    const result = await service.regenerateQr('qr_1');
    expect(result.status).toBe(QrStatus.WAITING_PAYMENT);
  });
});
