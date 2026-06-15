import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../src/services/wallet/wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WalletEntity } from '../src/db/entities/wallet.entity';
import { WalletTransactionEntity } from '../src/db/entities/wallet-transaction.entity';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../src/services/payments/payments.service';
import { NotificationService } from '../src/services/notifications/notification.service';
import { BadRequestException } from '@nestjs/common';

describe('WalletService Edge Cases', () => {
  let service: WalletService;
  let walletRepo: Repository<WalletEntity>;
  let walletTransactionRepo: Repository<WalletTransactionEntity>;

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
    get: jest.fn((key: string, defaultValue: any) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(WalletEntity), useValue: mockWalletRepo },
        { provide: getRepositoryToken(WalletTransactionEntity), useValue: mockWalletTransactionRepo },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepo = module.get<Repository<WalletEntity>>(getRepositoryToken(WalletEntity));
    walletTransactionRepo = module.get<Repository<WalletTransactionEntity>>(getRepositoryToken(WalletTransactionEntity));

    jest.clearAllMocks();
  });

  describe('debitWalletWithLock', () => {
    it('should throw BadRequestException for negative or zero amount', async () => {
      await expect(service.debitWalletWithLock('user1', 0, 'Test')).rejects.toThrow(BadRequestException);
      await expect(service.debitWalletWithLock('user1', -50, 'Test')).rejects.toThrow(BadRequestException);
    });

    it('should throw Insufficient balance error when balance too low', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 10 } as WalletEntity;
      
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
      const wallet = { id: 'w1', userId: 'user1', balance: 50 } as WalletEntity;
      
      mockDataSource.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue(wallet),
          update: jest.fn().mockResolvedValue(undefined),
          save: jest.fn().mockResolvedValue(wallet),
          create: jest.fn().mockReturnValue({}),
        });
      });

      await expect(service.debitWalletWithLock('user1', 60, 'Test')).rejects.toThrow('Insufficient wallet balance');
    });

    it('should debit successfully with valid balance', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 200 } as WalletEntity;
      const transaction = { id: 't1', amount: 50 } as WalletTransactionEntity;
      
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
      mockWalletRepo.findOne.mockResolvedValue({ id: 'w1', balance: 100 } as WalletEntity);
      
      const result = await service.checkNegativeBalanceRisk('user1', 50);
      expect(result).toBe(false);
    });

    it('should return true when withdrawal would cause negative balance', async () => {
      mockWalletRepo.findOne.mockResolvedValue({ id: 'w1', balance: 30 } as WalletEntity);
      
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
      const wallet = { id: 'w1', userId: 'user1', balance: 50 } as WalletEntity;
      mockWalletRepo.findOne.mockResolvedValue(wallet);

      mockWalletRepo.save.mockImplementation(async () => {
        wallet.balance = 10;
      });

      await expect(service.debitWallet('user1', 100, 'Test')).rejects.toThrow('Insufficient wallet balance');
    });
  });
});