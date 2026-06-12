"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const wallet_service_1 = require("../src/services/wallet/wallet.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("../src/db/entities/wallet.entity");
const wallet_transaction_entity_1 = require("../src/db/entities/wallet-transaction.entity");
const config_1 = require("@nestjs/config");
const payments_service_1 = require("../src/services/payments/payments.service");
const notification_service_1 = require("../src/services/notifications/notification.service");
const common_1 = require("@nestjs/common");
describe('WalletService Edge Cases', () => {
    let service;
    let walletRepo;
    let walletTransactionRepo;
    const mockWalletRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    };
    const mockWalletTransactionRepo = {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    };
    const mockDataSource = {
        manager: {
            transaction: jest.fn((cb) => cb({
                findOne: jest.fn(),
                update: jest.fn(),
                save: jest.fn(),
                create: jest.fn(),
            })),
        },
    };
    const mockPaymentService = {
        refundPayment: jest.fn(),
    };
    const mockNotificationService = {
        sendPush: jest.fn(),
    };
    const mockConfigService = {
        get: jest.fn((key, defaultValue) => defaultValue),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                wallet_service_1.WalletService,
                { provide: (0, typeorm_1.getRepositoryToken)(wallet_entity_1.WalletEntity), useValue: mockWalletRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(wallet_transaction_entity_1.WalletTransactionEntity), useValue: mockWalletTransactionRepo },
                { provide: config_1.ConfigService, useValue: mockConfigService },
                { provide: payments_service_1.PaymentService, useValue: mockPaymentService },
                { provide: notification_service_1.NotificationService, useValue: mockNotificationService },
                { provide: typeorm_2.DataSource, useValue: mockDataSource },
            ],
        }).compile();
        service = module.get(wallet_service_1.WalletService);
        walletRepo = module.get((0, typeorm_1.getRepositoryToken)(wallet_entity_1.WalletEntity));
        walletTransactionRepo = module.get((0, typeorm_1.getRepositoryToken)(wallet_transaction_entity_1.WalletTransactionEntity));
        jest.clearAllMocks();
    });
    describe('debitWalletWithLock', () => {
        it('should throw BadRequestException for negative or zero amount', async () => {
            await expect(service.debitWalletWithLock('user1', 0, 'Test')).rejects.toThrow(common_1.BadRequestException);
            await expect(service.debitWalletWithLock('user1', -50, 'Test')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw Insufficient balance error when balance too low', async () => {
            const wallet = { id: 'w1', userId: 'user1', balance: 10 };
            mockDataSource.manager.transaction.mockImplementation(async (cb) => {
                return cb({
                    findOne: jest.fn().mockResolvedValue(wallet),
                    update: jest.fn().mockResolvedValue(undefined),
                    save: jest.fn().mockResolvedValue(wallet),
                    create: jest.fn().mockReturnValue({}),
                });
            });
            await expect(service.debitWalletWithLock('user1', 100, 'Test')).rejects.toThrow('Insufficient');
        });
        it('should prevent negative balance after debit', async () => {
            const wallet = { id: 'w1', userId: 'user1', balance: 50 };
            mockDataSource.manager.transaction.mockImplementation(async (cb) => {
                return cb({
                    findOne: jest.fn().mockResolvedValue(wallet),
                    update: jest.fn().mockResolvedValue(undefined),
                    save: jest.fn().mockResolvedValue(wallet),
                    create: jest.fn().mockReturnValue({}),
                });
            });
            await expect(service.debitWalletWithLock('user1', 60, 'Test')).rejects.toThrow('Negative balance not allowed');
        });
        it('should debit successfully with valid balance', async () => {
            const wallet = { id: 'w1', userId: 'user1', balance: 200 };
            const transaction = { id: 't1', amount: 50 };
            mockDataSource.manager.transaction.mockImplementation(async (cb) => {
                return cb({
                    findOne: jest.fn().mockResolvedValue(wallet),
                    update: jest.fn().mockResolvedValue(undefined),
                    save: jest.fn().mockResolvedValueOnce(wallet).mockResolvedValueOnce(transaction),
                    create: jest.fn().mockReturnValue(transaction),
                });
            });
            mockWalletRepo.findOne.mockResolvedValue(wallet);
            const result = await service.debitWalletWithLock('user1', 50, 'Test debit');
            expect(result).toEqual(transaction);
        });
    });
    describe('checkNegativeBalanceRisk', () => {
        it('should return false when no risk', async () => {
            mockWalletRepo.findOne.mockResolvedValue({ id: 'w1', balance: 100 });
            const result = await service.checkNegativeBalanceRisk('user1', 50);
            expect(result).toBe(false);
        });
        it('should return true when withdrawal would cause negative balance', async () => {
            mockWalletRepo.findOne.mockResolvedValue({ id: 'w1', balance: 30 });
            const result = await service.checkNegativeBalanceRisk('user1', 50);
            expect(result).toBe(true);
        });
        it('should return false when wallet not found', async () => {
            mockWalletRepo.findOne.mockResolvedValue(null);
            const result = await service.checkNegativeBalanceRisk('user1', 50);
            expect(result).toBe(false);
        });
    });
    describe('debitWallet - race condition prevention', () => {
        it('should catch race condition on insufficient balance check', async () => {
            const wallet = { id: 'w1', userId: 'user1', balance: 50 };
            mockWalletRepo.findOne.mockResolvedValue(wallet);
            mockWalletRepo.save.mockImplementation(async () => {
                wallet.balance = 10;
            });
            await expect(service.debitWallet('user1', 100, 'Test')).rejects.toThrow('Insufficient wallet balance');
        });
    });
});
//# sourceMappingURL=wallet-edge-cases.spec.js.map