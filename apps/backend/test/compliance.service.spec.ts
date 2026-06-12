import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceService } from '../src/compliance/compliance.service';
import { UserEntity } from '../src/db/entities/user.entity';
import { SessionEntity } from '../src/db/entities/session.entity';
import { AuditLogEntity } from '../src/db/entities/audit-log.entity';
import { OrderEntity } from '../src/db/entities/order.entity';
import { DeletionRequestEntity } from '../src/db/entities/deletion-request.entity';
import { DataExportRequestEntity } from '../src/db/entities/data-export-request.entity';
import { EncryptionService } from '../src/security/encryption.service';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let sessionRepo: jest.Mocked<Repository<SessionEntity>>;
  let auditRepo: jest.Mocked<Repository<AuditLogEntity>>;
  let orderRepo: jest.Mocked<Repository<OrderEntity>>;
  let deletionRepo: jest.Mocked<Repository<DeletionRequestEntity>>;
  let exportRepo: jest.Mocked<Repository<DataExportRequestEntity>>;
  let encryptionService: jest.Mocked<EncryptionService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '+919876543210',
    status: 'active',
    deletedAt: undefined,
  };

  const mockOrders = [
    { id: 'order-1', userId: 'user-1', status: 'delivered', grandTotal: 500, createdAt: new Date(), items: [] },
  ];

  beforeEach(async () => {
    const mockDataSource = {
      getRepository: jest.fn(),
      transaction: jest.fn(),
    } as any as any;

    userRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    } as any;
    sessionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as any;
    auditRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as any;
    orderRepo = {
      find: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    } as any;
    deletionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as any;
    exportRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    } as any;
    encryptionService = {
      encrypt: jest.fn((s: string) => `encrypted:${s}`),
      decrypt: jest.fn((s: string) => s.replace('encrypted:', '')),
      encryptPiiFields: jest.fn(),
      decryptPiiFields: jest.fn(),
    } as any;

    mockDataSource.getRepository = jest.fn((entity: any) => {
      switch (entity) {
        case UserEntity: return userRepo;
        case SessionEntity: return sessionRepo;
        case AuditLogEntity: return auditRepo;
        case OrderEntity: return orderRepo;
        case DeletionRequestEntity: return deletionRepo;
        case DataExportRequestEntity: return exportRepo;
        default: return {};
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'DataSource', useValue: mockDataSource },
        { provide: EncryptionService, useValue: encryptionService },
        ComplianceService,
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('GDPR data export', () => {
    it('should export user data with orders and sessions', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as any);
      orderRepo.find.mockResolvedValue(mockOrders as any);
      sessionRepo.find.mockResolvedValue([] as any);
      auditRepo.find.mockResolvedValue([] as any);
      exportRepo.findOne.mockResolvedValue(null as any);
      exportRepo.save.mockResolvedValue({} as any);

      const result = await service.exportUserData('user-1');

      expect(result.user).toMatchObject({
        id: 'user-1',
        email: 'test@example.com',
      });
      expect(result.orders).toHaveLength(1);
      expect(result.exportedAt).toBeInstanceOf(Date);
      expect(result.regulation).toBe('gdpr');
    });

    it('should throw error for non-existent user', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.exportUserData('invalid')).rejects.toThrow('User not found');
    });
  });

  describe('Data deletion requests', () => {
    it('should create a GDPR deletion request', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as any);
      deletionRepo.findOne.mockResolvedValue(null as any);
      deletionRepo.create.mockReturnValue({
        userId: 'user-1',
        regulation: 'gdpr',
        status: 'pending',
        scheduledDeletionDate: new Date(),
        createdAt: new Date(),
      } as any);
      deletionRepo.save.mockResolvedValue({
        userId: 'user-1',
        regulation: 'gdpr',
        reason: 'No longer needed',
        status: 'pending',
        scheduledDeletionDate: new Date(),
        createdAt: new Date(),
      } as any);

      const result = await service.requestUserDataDeletion('user-1', 'gdpr', 'No longer needed');

      expect(result.regulation).toBe('gdpr');
      expect(result.status).toBe('pending');
    });

    it('should not create deletion if pending exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser as any);
      deletionRepo.findOne.mockResolvedValue({ userId: 'user-1', status: 'pending' } as any);

      await expect(service.requestUserDataDeletion('user-1', 'gdpr')).rejects.toThrow(
        'User already has a pending deletion request',
      );
    });
  });

  describe('Data retention', () => {
    it('should apply retention policies and count expired sessions', async () => {
      sessionRepo.delete.mockResolvedValue({ affected: 5 } as any);
      auditRepo.count.mockResolvedValue(10);
      deletionRepo.delete.mockResolvedValue({ affected: 0 } as any);

      const result = await service.applyDataRetentionPolicies();

      expect(result.deletedSessions).toBe(5);
      expect(result.oldAuditLogs).toBe(10);
    });

    it('should get retention statistics', async () => {
      userRepo.count.mockResolvedValue(100);
      sessionRepo.count.mockResolvedValue(500);
      auditRepo.count.mockResolvedValue(30);
      deletionRepo.count.mockResolvedValue(2);

      const result = await service.getRetentionStatistics();

      expect(result.statistics.totalUsers).toBe(100);
      expect(result.statistics.pendingDeletionRequests).toBe(2);
      expect(result.retentionPolicies.sessionRetentionDays).toBe(90);
    });
  });

  describe('PII encryption verification', () => {
    it('should flag unencrypted PII fields', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        phone: '+919876543210',
      } as any);

      const result = await service.verifyPiiEncryption('user-1');

      expect(result.isEncrypted).toBe(false);
      expect(result.fieldsStatus.email).toBe('plaintext_warning');
      expect(result.fieldsStatus.phone).toBe('plaintext_warning');
    });

    it('should detect encrypted PII by ciphertext prefix', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'U2FsdGVkX1+encrypted',
        phone: 'U2FsdGVkX1+encrypted',
      } as any);

      const result = await service.verifyPiiEncryption('user-1');

      expect(result.isEncrypted).toBe(true);
      expect(result.fieldsStatus.email).toBe('encrypted');
    });
  });
});
