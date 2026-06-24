import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../src/services/payments/payments.service';
import { PaymentGatewayFactory } from '../src/services/payments/gateway-factory.service';
import { AuditService } from '../src/audit/audit.service';
import { LedgerService } from '../src/modules/ledger/ledger.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { PaymentGateway } from '../src/services/payments/gateways/payment-gateway.interface';
import { PaymentIntent, PaymentResult, RefundResult, GatewayEvent } from '../src/services/payments/payment.types';

describe('PaymentService', () => {
  let service: PaymentService;
  let gatewayFactory: jest.Mocked<PaymentGatewayFactory>;
  let auditService: jest.Mocked<AuditService>;
  let ledgerService: jest.Mocked<LedgerService>;
  let configService: jest.Mocked<ConfigService>;
  let mockGateway: jest.Mocked<PaymentGateway>;

  const createMockGateway = (): jest.Mocked<PaymentGateway> => ({
    getGatewayName: jest.fn(() => 'stripe'),
    createPaymentIntent: jest.fn(),
    confirmPayment: jest.fn(),
    refundPayment: jest.fn(),
    constructEvent: jest.fn(),
    fetchPaymentDetails: jest.fn(),
  });

  beforeEach(async () => {
    mockGateway = createMockGateway();
    gatewayFactory = {
      getGateway: jest.fn(() => mockGateway),
      getAvailableGateways: jest.fn(() => ['stripe']),
    } as any;

    auditService = {
      logPaymentEvent: jest.fn(),
      log: jest.fn(),
    } as any;

    ledgerService = {
      createTransaction: jest.fn(),
    } as any;

    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const defaults: Record<string, number> = {
          PAYMENT_MAX_SINGLE_AMOUNT: 10000,
          PAYMENT_DAILY_LIMIT_PER_USER: 50000,
        };
        return defaults[key] ?? defaultValue;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PaymentGatewayFactory, useValue: gatewayFactory },
        { provide: AuditService, useValue: auditService },
        { provide: LedgerService, useValue: ledgerService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const mockIntent = { id: 'pi_1', amount: 1000, currency: 'usd', status: 'requires_payment_method' } as PaymentIntent;
      mockGateway.createPaymentIntent.mockResolvedValue(mockIntent);

      const result = await service.createPaymentIntent(1000, 'usd', 'user-1', { orderId: 'ord-1' });

      expect(result.id).toBe('pi_1');
      expect(gatewayFactory.getGateway).toHaveBeenCalled();
      expect(mockGateway.createPaymentIntent).toHaveBeenCalledWith(1000, 'usd', 'user-1', { orderId: 'ord-1' });
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_intent_created', 'user-1', 1000, 'usd', 'stripe', 'pi_1', true, undefined
      );
    });

    it('should create payment intent with default currency', async () => {
      const mockIntent = { id: 'pi_2', amount: 500, currency: 'usd' } as PaymentIntent;
      mockGateway.createPaymentIntent.mockResolvedValue(mockIntent);

      const result = await service.createPaymentIntent(500, undefined, 'user-1');

      expect(mockGateway.createPaymentIntent).toHaveBeenCalledWith(500, 'usd', 'user-1', {});
    });

    it('should use null userId when not provided', async () => {
      const mockIntent = { id: 'pi_3', amount: 1000 } as PaymentIntent;
      mockGateway.createPaymentIntent.mockResolvedValue(mockIntent);

      await service.createPaymentIntent(1000);

      expect(mockGateway.createPaymentIntent).toHaveBeenCalledWith(1000, 'usd', '', {});
    });

    it('should throw when amount exceeds max', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'PAYMENT_MAX_SINGLE_AMOUNT') return 5000;
        return defaultValue;
      });

      const logSpy = jest.spyOn(service as any, 'validatePaymentLimits');

      await expect(service.createPaymentIntent(10000, 'usd', 'user-1'))
        .rejects.toThrow(BadRequestException);
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_intent_failed', 'user-1', 10000, 'usd', 'any', '', false, undefined, 'Payment amount exceeds maximum allowed: 5000'
      );
    });

    it('should throw when amount is zero or negative', async () => {
      await expect(service.createPaymentIntent(0, 'usd', 'user-1'))
        .rejects.toThrow('Payment amount must be greater than zero');

      await expect(service.createPaymentIntent(-100, 'usd', 'user-1'))
        .rejects.toThrow('Payment amount must be greater than zero');
    });

    it('should log failed payment intent on error', async () => {
      mockGateway.createPaymentIntent.mockRejectedValue(new Error('Gateway error'));

      await expect(service.createPaymentIntent(1000, 'usd', 'user-1'))
        .rejects.toThrow('Gateway error');

      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_intent_failed', 'user-1', 1000, 'usd', 'any', '', false, undefined, 'Gateway error'
      );
    });

    it('should use provided gateway name', async () => {
      const mockRazorpay = createMockGateway();
      mockRazorpay.getGatewayName.mockReturnValue('razorpay');
      gatewayFactory.getGateway.mockReturnValue(mockRazorpay);

      const mockIntent = { id: 'pi_razor', amount: 1000 } as PaymentIntent;
      mockRazorpay.createPaymentIntent.mockResolvedValue(mockIntent);

      await service.createPaymentIntent(1000, 'inr', 'user-1', {}, undefined, 'razorpay');

      expect(gatewayFactory.getGateway).toHaveBeenCalledWith('razorpay');
      expect(mockRazorpay.createPaymentIntent).toHaveBeenCalled();
    });
  });

  describe('validatePaymentLimits (private)', () => {
    it('should throw when amount exceeds max', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'PAYMENT_MAX_SINGLE_AMOUNT') return 5000;
        return defaultValue;
      });

      await expect((service as any).validatePaymentLimits('user-1', 6000))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw when amount is zero', async () => {
      await expect((service as any).validatePaymentLimits('user-1', 0))
        .rejects.toThrow('must be greater than zero');
    });

    it('should throw when amount is negative', async () => {
      await expect((service as any).validatePaymentLimits('user-1', -100))
        .rejects.toThrow('must be greater than zero');
    });

    it('should pass for valid amount', async () => {
      await expect((service as any).validatePaymentLimits('user-1', 1000)).resolves.not.toThrow();
    });
  });

  describe('checkSuspiciousPatterns (private)', () => {
    it('should not throw for normal payment', async () => {
      await expect((service as any).checkSuspiciousPatterns('user-1', 100)).resolves.not.toThrow();
    });

    it('should not throw for empty userId with large amount', async () => {
      await expect((service as any).checkSuspiciousPatterns('', 5000)).resolves.not.toThrow();
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const mockResult = { id: 'pi_1', amount: 100000, currency: 'usd', status: 'succeeded' } as PaymentResult;
      mockGateway.confirmPayment.mockResolvedValue(mockResult);

      const result = await service.confirmPayment('pi_1', 'user-1');

      expect(result.id).toBe('pi_1');
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_confirmed', 'user-1', 1000, 'usd', 'stripe', 'pi_1', true, undefined
      );
      expect(ledgerService.createTransaction).toHaveBeenCalled();
    });

    it('should log failed confirmation on error', async () => {
      mockGateway.confirmPayment.mockRejectedValue(new Error('Payment not found'));

      await expect(service.confirmPayment('pi_missing', 'user-1'))
        .rejects.toThrow('Payment not found');

      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_failed', 'user-1', 0, 'usd', 'any', 'pi_missing', false, undefined, 'Payment not found'
      );
    });

    it('should handle ledger failure gracefully', async () => {
      const mockResult = { id: 'pi_1', amount: 100000, currency: 'usd', status: 'succeeded' } as PaymentResult;
      mockGateway.confirmPayment.mockResolvedValue(mockResult);
      ledgerService.createTransaction.mockRejectedValue(new Error('Ledger error'));

      const result = await service.confirmPayment('pi_1', 'user-1');

      expect(result.id).toBe('pi_1');
    });
  });

  describe('refundPayment', () => {
    it('should process refund successfully', async () => {
      const mockPayment = { id: 'pi_1', amount: 100000, currency: 'usd' } as any;
      const mockRefund = { id: 're_1', amount: 50000, currency: 'usd', status: 'succeeded' } as RefundResult;
      mockGateway.confirmPayment.mockResolvedValue(mockPayment);
      mockGateway.refundPayment.mockResolvedValue(mockRefund);

      const result = await service.refundPayment('pi_1', 50, 'user-1', 'requested_by_customer');

      expect(result.id).toBe('re_1');
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_refunded', 'user-1', 500, 'usd', 'stripe', 'pi_1', true, undefined, 'Reason: requested_by_customer'
      );
      expect(ledgerService.createTransaction).toHaveBeenCalledWith(
        're_1', 'refund', 'cash', 500, 'usd', 'refund', 're_1', 'Refund processed for payment pi_1, reason: requested_by_customer'
      );
    });

    it('should use full amount when amount is null', async () => {
      const mockPayment = { id: 'pi_1', amount: 100000, currency: 'usd' } as any;
      const mockRefund = { id: 're_1', amount: 100000, currency: 'usd', status: 'succeeded' } as RefundResult;
      mockGateway.confirmPayment.mockResolvedValue(mockPayment);
      mockGateway.refundPayment.mockResolvedValue(mockRefund);

      await service.refundPayment('pi_1', null, 'user-1');

      expect(mockGateway.refundPayment).toHaveBeenCalledWith('pi_1', null, 'user-1', 'requested_by_customer');
    });

    it('should throw when refund amount exceeds original', async () => {
      const mockPayment = { id: 'pi_1', amount: 5000, currency: 'usd' } as any;
      mockGateway.confirmPayment.mockResolvedValue(mockPayment);

      await expect(service.refundPayment('pi_1', 100, 'user-1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw when refund amount is zero', async () => {
      const mockPayment = { id: 'pi_1', amount: 5000, currency: 'usd' } as any;
      mockGateway.confirmPayment.mockResolvedValue(mockPayment);

      await expect(service.refundPayment('pi_1', 0, 'user-1'))
        .rejects.toThrow('Refund amount must be greater than zero');
    });

    it('should throw when refund amount is negative', async () => {
      const mockPayment = { id: 'pi_1', amount: 5000, currency: 'usd' } as any;
      mockGateway.confirmPayment.mockResolvedValue(mockPayment);

      await expect(service.refundPayment('pi_1', -50, 'user-1'))
        .rejects.toThrow('Refund amount must be greater than zero');
    });

    it('should log failed refund on error', async () => {
      const mockPayment = { id: 'pi_1', amount: 5000, currency: 'usd' } as any;
      mockGateway.confirmPayment.mockResolvedValue(mockPayment);
      mockGateway.refundPayment.mockRejectedValue(new Error('Refund declined'));

      await expect(service.refundPayment('pi_1', 50, 'user-1'))
        .rejects.toThrow('Refund declined');

      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_refund_failed', 'user-1', 50, 'usd', 'any', 'pi_1', false, undefined, 'Refund declined'
      );
    });
  });

  describe('constructEvent', () => {
    it('should construct and verify gateway event', async () => {
      const mockEvent = {
        data: { object: { id: 'pi_1', amount: 1000 } },
      } as GatewayEvent;
      mockGateway.constructEvent.mockResolvedValue(mockEvent);

      const result = await service.constructEvent(
        Buffer.from('{}'),
        'sig_123',
        'whsec_test',
        'stripe'
      );

      expect((result.data.object as any).id).toBe('pi_1');
      expect(mockGateway.constructEvent).toHaveBeenCalledWith(Buffer.from('{}'), 'sig_123', 'whsec_test');
    });

    it('should throw on verification failure', async () => {
      mockGateway.constructEvent.mockRejectedValue(new Error('Invalid signature'));

      await expect(service.constructEvent(Buffer.from('{}'), 'bad_sig', 'secret'))
        .rejects.toThrow('Invalid signature');
    });
  });
});
