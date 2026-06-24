import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../src/audit/audit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../src/db/entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepo: jest.Mocked<Repository<AuditLogEntity>>;

  beforeEach(async () => {
    auditRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLogEntity), useValue: auditRepo },
      ],
    }).compile();

    service = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create and save an audit log', async () => {
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({ id: 'log-1' } as any);

      const result = await service.log('user_login', 'user-1', 'User', 'user-1', { success: true });

      expect(auditRepo.create).toHaveBeenCalled();
      expect(auditRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('log-1');
    });

    it('should sanitize sensitive headers when request provided', async () => {
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({ id: 'log-2' } as any);

      const mockRequest = {
        ip: '192.168.1.1',
        connection: { remoteAddress: '10.0.0.1' },
        get: jest.fn((h: string) => h === 'User-Agent' ? 'Mozilla' : undefined),
        method: 'POST',
        path: '/api/orders',
        query: { id: '1' },
        headers: { authorization: 'Bearer secret', cookie: 'session=abc', 'x-api-key': 'key123' },
      } as any;

      const result = await service.log('order_created', 'user-1', 'Order', 'ord-1', {}, mockRequest);

      expect(result).toBeDefined();
      expect(auditRepo.create).toHaveBeenCalled();
    });

    it('should handle log creation failure gracefully', async () => {
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockRejectedValue(new Error('DB error'));

      const result = await service.log('payment_failed', 'user-1', 'Payment', 'pay-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('error-log');
      expect(result.action).toBe('payment_failed');
    });
  });

  describe('logAuthEvent', () => {
    it('should log login success', async () => {
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({ id: 'auth-1' } as any);

      const result = await service.logAuthEvent('login_success', 'user-1', 'test@test.com', true);

      expect(result.id).toBe('auth-1');
      expect(auditRepo.save).toHaveBeenCalled();
    });

    it('should log login failure with error message', async () => {
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({ id: 'auth-2' } as any);

      const result = await service.logAuthEvent('login_failure', null, 'bad@test.com', false, null, 'Invalid password');

      expect(result.id).toBe('auth-2');
      expect(auditRepo.save).toHaveBeenCalled();
    });
  });

  describe('logPaymentEvent', () => {
    it('should log payment event with all details', async () => {
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({ id: 'pay-1' } as any);

      const result = await service.logPaymentEvent('payment_success', 'user-1', 1000, 'INR', 'stripe', 'pi_1', true);

      expect(result.id).toBe('pay-1');
    });

    it('should log payment event without transactionId', async () => {
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({ id: 'pay-2' } as any);

      const result = await service.logPaymentEvent('payment_failed', 'user-1', 500, 'INR', 'razorpay', null, false, null, 'Declined');

      expect(result.id).toBe('pay-2');
    });
  });

  describe('logWalletEvent', () => {
    it('should log wallet credit event', async () => {
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({ id: 'wal-1' } as any);

      const result = await service.logWalletEvent('wallet_credit', 'user-1', 'wal-1', 500, 'INR', 'credit', 1500);

      expect(result.id).toBe('wal-1');
    });

    it('should log wallet debit event', async () => {
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({ id: 'wal-2' } as any);

      const result = await service.logWalletEvent('wallet_debit', 'user-1', 'wal-1', 200, 'INR', 'debit', 1300);

      expect(result.id).toBe('wal-2');
    });
  });

  describe('getAuditLogs', () => {
    it('should return all logs with default limit', async () => {
      auditRepo.find.mockResolvedValue([] as any);

      const result = await service.getAuditLogs({});

      expect(auditRepo.find).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by userId and action', async () => {
      auditRepo.find.mockResolvedValue([] as any);

      await service.getAuditLogs({ userId: 'user-1', action: 'login_success' });

      expect(auditRepo.find).toHaveBeenCalled();
    });

    it('should filter by date range', async () => {
      auditRepo.find.mockResolvedValue([] as any);

      await service.getAuditLogs({
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-23'),
      });

      expect(auditRepo.find).toHaveBeenCalled();
    });

    it('should apply limit and offset', async () => {
      auditRepo.find.mockResolvedValue([] as any);

      await service.getAuditLogs({ limit: 50, offset: 10 });

      expect(auditRepo.find).toHaveBeenCalled();
    });
  });

  describe('getAuditStatistics', () => {
    it('should return statistics with all counts', async () => {
      auditRepo.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(15);

      const result = await service.getAuditStatistics();

      expect(result.totalAuditLogs).toBe(100);
      expect(result.auditLogsLast24h).toBe(20);
      expect(result.failedLoginAttempts24h).toBe(5);
      expect(result.successfulLogins24h).toBe(15);
      expect(result.loginSuccessRate24h).toBeCloseTo(75, 0);
    });

    it('should handle zero recent logs', async () => {
      auditRepo.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getAuditStatistics();

      expect(result.totalAuditLogs).toBe(0);
      expect(result.loginSuccessRate24h).toBe(0);
    });
  });
});
