"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const compliance_service_1 = require("../src/compliance/compliance.service");
const user_entity_1 = require("../src/db/entities/user.entity");
const session_entity_1 = require("../src/db/entities/session.entity");
const audit_log_entity_1 = require("../src/db/entities/audit-log.entity");
const order_entity_1 = require("../src/db/entities/order.entity");
const deletion_request_entity_1 = require("../src/db/entities/deletion-request.entity");
const data_export_request_entity_1 = require("../src/db/entities/data-export-request.entity");
const encryption_service_1 = require("../src/security/encryption.service");
describe('ComplianceService', () => {
    let service;
    let userRepo;
    let sessionRepo;
    let auditRepo;
    let orderRepo;
    let deletionRepo;
    let exportRepo;
    let encryptionService;
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
        };
        userRepo = {
            findOne: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        };
        sessionRepo = {
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };
        auditRepo = {
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };
        orderRepo = {
            find: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        };
        deletionRepo = {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        };
        exportRepo = {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
        };
        encryptionService = {
            encrypt: jest.fn((s) => `encrypted:${s}`),
            decrypt: jest.fn((s) => s.replace('encrypted:', '')),
            encryptPiiFields: jest.fn(),
            decryptPiiFields: jest.fn(),
        };
        mockDataSource.getRepository = jest.fn((entity) => {
            switch (entity) {
                case user_entity_1.UserEntity: return userRepo;
                case session_entity_1.SessionEntity: return sessionRepo;
                case audit_log_entity_1.AuditLogEntity: return auditRepo;
                case order_entity_1.OrderEntity: return orderRepo;
                case deletion_request_entity_1.DeletionRequestEntity: return deletionRepo;
                case data_export_request_entity_1.DataExportRequestEntity: return exportRepo;
                default: return {};
            }
        });
        const module = await testing_1.Test.createTestingModule({
            providers: [
                { provide: 'DataSource', useValue: mockDataSource },
                { provide: encryption_service_1.EncryptionService, useValue: encryptionService },
                compliance_service_1.ComplianceService,
            ],
        }).compile();
        service = module.get(compliance_service_1.ComplianceService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('GDPR data export', () => {
        it('should export user data with orders and sessions', async () => {
            userRepo.findOne.mockResolvedValue(mockUser);
            orderRepo.find.mockResolvedValue(mockOrders);
            sessionRepo.find.mockResolvedValue([]);
            auditRepo.find.mockResolvedValue([]);
            exportRepo.findOne.mockResolvedValue(null);
            exportRepo.save.mockResolvedValue({});
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
            userRepo.findOne.mockResolvedValue(mockUser);
            deletionRepo.findOne.mockResolvedValue(null);
            deletionRepo.create.mockReturnValue({
                userId: 'user-1',
                regulation: 'gdpr',
                status: 'pending',
                scheduledDeletionDate: new Date(),
                createdAt: new Date(),
            });
            deletionRepo.save.mockResolvedValue({
                userId: 'user-1',
                regulation: 'gdpr',
                reason: 'No longer needed',
                status: 'pending',
                scheduledDeletionDate: new Date(),
                createdAt: new Date(),
            });
            const result = await service.requestUserDataDeletion('user-1', 'gdpr', 'No longer needed');
            expect(result.regulation).toBe('gdpr');
            expect(result.status).toBe('pending');
        });
        it('should not create deletion if pending exists', async () => {
            userRepo.findOne.mockResolvedValue(mockUser);
            deletionRepo.findOne.mockResolvedValue({ userId: 'user-1', status: 'pending' });
            await expect(service.requestUserDataDeletion('user-1', 'gdpr')).rejects.toThrow('User already has a pending deletion request');
        });
    });
    describe('Data retention', () => {
        it('should apply retention policies and count expired sessions', async () => {
            sessionRepo.delete.mockResolvedValue({ affected: 5 });
            auditRepo.count.mockResolvedValue(10);
            deletionRepo.delete.mockResolvedValue({ affected: 0 });
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
            });
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
            });
            const result = await service.verifyPiiEncryption('user-1');
            expect(result.isEncrypted).toBe(true);
            expect(result.fieldsStatus.email).toBe('encrypted');
        });
    });
});
//# sourceMappingURL=compliance.service.spec.js.map