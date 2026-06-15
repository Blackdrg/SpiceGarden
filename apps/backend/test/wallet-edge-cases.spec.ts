import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../src/services/wallet/wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WalletEntity } from '../src/db/entities/wallet.entity';
import { WalletTransactionEntity } from '../src/db/entities/wallet-transaction.entity';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../src/services/payments/payments.service';
import { NotificationService } from '../src/services/notifications/notification.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Like } from 'typeorm';

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
    get: jest.fn((key: string, defaultValue: any) => {
      if (key === 'WALLET_NOTIFICATION_THRESHOLD') return 100;
      if (key === 'WALLET_LOW_BALANCE_THRESHOLD') return 50;
      return defaultValue;
    }),
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

  describe('getWallet', () => {
    it('should return existing wallet', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 100, currency: 'INR' } as WalletEntity;
      mockWalletRepo.findOne.mockResolvedValue(wallet);

      const result = await service.getWallet('user1');

      expect(result).toEqual(wallet);
    });

    it('should create wallet if not exists', async () => {
      mockWalletRepo.findOne.mockResolvedValue(null);
      mockWalletRepo.create.mockReturnValue({ userId: 'user1', balance: 0, currency: 'INR' });
      mockWalletRepo.save.mockResolvedValue({ id: 'new-w1', userId: 'user1', balance: 0, currency: 'INR' });

      const result = await service.getWallet('user1');

      expect(mockWalletRepo.create).toHaveBeenCalled();
      expect(mockWalletRepo.save).toHaveBeenCalled();
    });
  });

  describe('creditWallet', () => {
    it('should throw BadRequestException for zero or negative amount', async () => {
      await expect(service.creditWallet('user1', 0, 'Test')).rejects.toThrow(BadRequestException);
      await expect(service.creditWallet('user1', -10, 'Test')).rejects.toThrow(BadRequestException);
    });

    it('should credit wallet successfully', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 50 } as WalletEntity;
      const transaction = { id: 't1', amount: 100, type: 'credit' } as WalletTransactionEntity;

      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletRepo.save.mockResolvedValue({ ...wallet, balance: 150 });
      mockWalletTransactionRepo.create.mockReturnValue(transaction);
      mockWalletTransactionRepo.save.mockResolvedValue(transaction);

      const result = await service.creditWallet('user1', 100, 'Test credit');
      expect(result).toEqual(transaction);
    });
  });

  describe('debitWallet', () => {
    it('should throw BadRequestException for zero or negative amount', async () => {
      await expect(service.debitWallet('user1', 0, 'Test')).rejects.toThrow(BadRequestException);
      await expect(service.debitWallet('user1', -10, 'Test')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for insufficient balance', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 30 } as WalletEntity;
      mockWalletRepo.findOne.mockResolvedValue(wallet);

      await expect(service.debitWallet('user1', 100, 'Test')).rejects.toThrow(BadRequestException);
    });

    it('should debit wallet successfully', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 200 } as WalletEntity;
      const transaction = { id: 't2', amount: 50, type: 'debit' } as WalletTransactionEntity;

      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletRepo.save.mockResolvedValue({ ...wallet, balance: 150 });
      mockWalletTransactionRepo.create.mockReturnValue(transaction);
      mockWalletTransactionRepo.save.mockResolvedValue(transaction);

      const result = await service.debitWallet('user1', 50, 'Test debit');
      expect(result).toEqual(transaction);
    });

    it('should send low balance notification after debit', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 60 } as WalletEntity;
      const transaction = { id: 't3', amount: 20, type: 'debit' } as WalletTransactionEntity;

      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletRepo.save.mockResolvedValue({ ...wallet, balance: 40 });
      mockWalletTransactionRepo.create.mockReturnValue(transaction);
      mockWalletTransactionRepo.save.mockResolvedValue(transaction);

      await service.debitWallet('user1', 20, 'Test debit');
      
      // Low balance threshold is 50, after debit balance is 40 which is below threshold
      expect(mockNotificationService.sendPush).toHaveBeenCalled();
    });
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
    it('should throw Insufficient balance error when balance changes during transaction', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 50 } as WalletEntity;
      mockWalletRepo.findOne.mockResolvedValue(wallet);

      mockWalletRepo.save.mockImplementation(async () => {
        wallet.balance = 10;
      });

      await expect(service.debitWallet('user1', 100, 'Test')).rejects.toThrow('Insufficient wallet balance');
    });
  });

  describe('compensateUser', () => {
    it('should create compensation transaction', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 100 } as WalletEntity;
      const transaction = { id: 't3', amount: 50, type: 'credit' } as WalletTransactionEntity;

      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletRepo.save.mockResolvedValue({ ...wallet, balance: 150 });
      mockWalletTransactionRepo.create.mockReturnValue(transaction);
      mockWalletTransactionRepo.save.mockResolvedValue(transaction);

      const result = await service.compensateUser('user1', 50, 'Order cancellation');
      expect(result.type).toBe('credit');
    });
  });

  describe('processCODPayment', () => {
    it('should throw BadRequestException for invalid COD amount (string)', async () => {
      await expect(service.processCODPayment('order1', 'invalid', 'user1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for zero or negative COD amount', async () => {
      await expect(service.processCODPayment('order1', 0, 'user1')).rejects.toThrow(BadRequestException);
      await expect(service.processCODPayment('order1', -10, 'user1')).rejects.toThrow(BadRequestException);
    });

    it('should process COD payment successfully', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 0 } as WalletEntity;
      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletTransactionRepo.create.mockReturnValue({} as any);
      mockWalletTransactionRepo.save.mockResolvedValue({} as any);

      const result = await service.processCODPayment('order1', 100, 'user1');
      expect(result).toBe(true);
    });

    it('should return false on error during COD processing', async () => {
      mockWalletRepo.findOne.mockRejectedValue(new Error('DB error'));

      const result = await service.processCODPayment('order1', 100, 'user1');
      expect(result).toBe(false);
    });
  });

  describe('debitWalletWithLock - error cases', () => {
    it('should throw BadRequestException when wallet not found in transaction', async () => {
      mockDataSource.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue(null),
          save: jest.fn(),
          create: jest.fn(),
        });
      });

      await expect(service.debitWalletWithLock('user1', 100, 'Test')).rejects.toThrow('Wallet not found');
    });
  });
});