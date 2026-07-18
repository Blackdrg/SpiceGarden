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

describe('ComplianceService coverage', () => {
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
    } as any;

    userRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      softDelete: jest.fn(),
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
      create: jest.fn(),
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
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(SessionEntity), useValue: sessionRepo },
        { provide: getRepositoryToken(AuditLogEntity), useValue: auditRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: orderRepo },
        { provide: getRepositoryToken(DeletionRequestEntity), useValue: deletionRepo },
        { provide: getRepositoryToken(DataExportRequestEntity), useValue: exportRepo },
        { provide: 'DataSource', useValue: mockDataSource },
        { provide: EncryptionService, useValue: encryptionService },
        ComplianceService,
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
  });

  describe('shouldRetainUserData', () => {
    it('should return true for active user (no deletedAt)', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'user-1', deletedAt: undefined } as any);
      const result = await service.shouldRetainUserData('user-1');
      expect(result).toBe(true);
    });

    it('should return true for non-existent user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.shouldRetainUserData('missing');
      expect(result).toBe(true);
    });

    it('should return true when within 7-year retention period', async () => {
      const recentlyDeleted = new Date();
      recentlyDeleted.setFullYear(recentlyDeleted.getFullYear() - 1);
      userRepo.findOne.mockResolvedValue({ id: 'user-1', deletedAt: recentlyDeleted } as any);
      const result = await service.shouldRetainUserData('user-1');
      expect(result).toBe(true);
    });

    it('should return false when past 7-year retention period', async () => {
      const longAgo = new Date();
      longAgo.setFullYear(longAgo.getFullYear() - 8);
      userRepo.findOne.mockResolvedValue({ id: 'user-1', deletedAt: longAgo } as any);
      const result = await service.shouldRetainUserData('user-1');
      expect(result).toBe(false);
    });
  });

  describe('deleteUserData', () => {
    it('should soft delete user and deactivate sessions', async () => {
      userRepo.softDelete = jest.fn().mockResolvedValue({} as any);
      sessionRepo.update = jest.fn().mockResolvedValue({ affected: 3 } as any);

      await service.deleteUserData('user-1');

      expect(userRepo.softDelete).toHaveBeenCalledWith('user-1');
      expect(sessionRepo.update).toHaveBeenCalledWith({ userId: 'user-1' }, { isActive: false });
    });
  });

  describe('getUserDataDeletionStatus', () => {
    it('should return null when no deletion request exists', async () => {
      deletionRepo.findOne.mockResolvedValue(null);
      const result = await service.getUserDataDeletionStatus('user-1');
      expect(result).toBeNull();
    });

    it('should return deletion status when request exists', async () => {
      const request = {
        id: 'req-1',
        userId: 'user-1',
        status: 'pending',
        scheduledDeletionDate: new Date('2026-07-01'),
        regulation: 'gdpr',
        createdAt: new Date(),
      };
      deletionRepo.findOne.mockResolvedValue(request as any);
      const result = await service.getUserDataDeletionStatus('user-1');
      expect(result?.status).toBe('pending');
      expect(result?.regulation).toBe('gdpr');
      expect(result?.scheduledDeletionDate).toBeInstanceOf(Date);
    });
  });

  describe('cancelUserDataDeletion', () => {
    it('should return not found when no pending request exists', async () => {
      deletionRepo.findOne.mockResolvedValue(null);
      const result = await service.cancelUserDataDeletion('user-1');
      expect(result.success).toBe(false);
      expect(result.message).toBe('No pending deletion request found');
    });

    it('should cancel pending deletion request', async () => {
      const request = {
        id: 'req-1',
        userId: 'user-1',
        status: 'pending',
        scheduledDeletionDate: new Date(),
        regulation: 'gdpr',
        createdAt: new Date(),
      };
      deletionRepo.findOne.mockResolvedValue(request as any);
      deletionRepo.update = jest.fn().mockResolvedValue({ affected: 1 } as any);

      const result = await service.cancelUserDataDeletion('user-1');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Deletion request cancelled');
      expect(deletionRepo.update).toHaveBeenCalledWith(request.id, {
        status: 'cancelled',
        cancellationReason: 'User requested cancellation',
      });
    });
  });

  describe('getUserExports', () => {
    it('should return empty array when no exports exist', async () => {
      exportRepo.find.mockResolvedValue([]);
      const result = await service.getUserExports('user-1');
      expect(result).toEqual([]);
    });

    it('should return mapped export history', async () => {
      const exports = [
        {
          id: 'exp-1',
          userId: 'user-1',
          status: 'completed',
          exportFormat: 'json',
          regulation: 'gdpr',
          createdAt: new Date('2026-06-20'),
          completedAt: new Date('2026-06-20'),
        },
      ];
      exportRepo.find.mockResolvedValue(exports as any);
      const result = await service.getUserExports('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('exp-1');
      expect(result[0].status).toBe('completed');
      expect(result[0].exportFormat).toBe('json');
      expect(result[0].regulation).toBe('gdpr');
    });
  });

  describe('applyDataRetentionPolicies error handling', () => {
    it('should rethrow when an error occurs', async () => {
      sessionRepo.delete = jest.fn().mockRejectedValue(new Error('DB error'));

      await expect(service.applyDataRetentionPolicies()).rejects.toThrow('DB error');
    });
  });

  describe('PII encryption edge cases', () => {
    it('should mark missing fields as missing', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        email: undefined,
        phone: undefined,
        fullName: undefined,
      } as any);

      const result = await service.verifyPiiEncryption('user-1');
      expect(result.fieldsStatus.email).toBe('missing');
      expect(result.fieldsStatus.phone).toBe('missing');
      expect(result.fieldsStatus.fullName).toBe('missing');
      expect(result.isEncrypted).toBe(false);
    });

    it('should throw for non-existent user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.verifyPiiEncryption('missing')).rejects.toThrow('User not found');
    });

    it('should handle mixed encrypted and plaintext fields', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'dGVzdGl2ZWJpdHR5LnRlc3RjdHR5LnRlc3R0YWdudA==.dGVzdGl2ZWJpdHR5LnRlc3RjdHR5LnRlc3R0YWdudA==.dGVzdGl2ZWJpdHR5LnRlc3RjdHR5LnRlc3R0YWdudA==',
        phone: '+919876543210',
        fullName: 'dGVzdGl2ZWJpdHR5LnRlc3RjdHR5LnRlc3R0YWdudA==.dGVzdGl2ZWJpdHR5LnRlc3RjdHR5LnRlc3R0YWdudA==.dGVzdGl2ZWJpdHR5LnRlc3RjdHR5LnRlc3R0YWdudA==',
      } as any);

      const result = await service.verifyPiiEncryption('user-1');
      expect(result.fieldsStatus.email).toBe('encrypted');
      expect(result.fieldsStatus.phone).toBe('plaintext_warning');
      expect(result.fieldsStatus.fullName).toBe('encrypted');
      expect(result.isEncrypted).toBe(false);
    });
  });
});
