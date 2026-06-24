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

  describe('confirmCODCollection', () => {
    it('should credit wallet when a pending COD transaction is confirmed', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 0 } as WalletEntity;
      const pendingTransaction = {
        id: 't-cod-pending',
        walletId: 'w1',
        amount: 80,
        type: 'credit',
        description: 'COD Payment Pending for Order #order1',
        referenceId: 'order1',
      } as WalletTransactionEntity;

      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletTransactionRepo.findOne.mockResolvedValue(pendingTransaction);
      mockWalletTransactionRepo.save.mockResolvedValue({ ...pendingTransaction, description: 'COD Payment Collected for Order #order1' });
      mockWalletRepo.save.mockResolvedValue({ ...wallet, balance: 80 });

      const result = await service.confirmCODCollection('order1', 80, 'user1');

      expect(result.description).toBe('COD Payment Collected for Order #order1');
      expect(mockWalletRepo.save).toHaveBeenCalledWith(expect.objectContaining({ balance: 80 }));
      expect(mockNotificationService.sendPush).toHaveBeenCalled();
    });

    it('should reject COD confirmation when no pending transaction exists', async () => {
      mockWalletRepo.findOne.mockResolvedValue({ id: 'w1', userId: 'user1', balance: 0 } as WalletEntity);
      mockWalletTransactionRepo.findOne.mockResolvedValue(null);

      await expect(service.confirmCODCollection('order1', 80, 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('refundCOD', () => {
    it('should debit wallet for a confirmed COD refund', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 100 } as WalletEntity;
      const confirmedTransaction = {
        id: 't-cod-collected',
        walletId: 'w1',
        amount: 80,
        type: 'credit',
        description: 'COD Payment Collected for Order #order1',
        referenceId: 'order1',
      } as WalletTransactionEntity;

      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletTransactionRepo.findOne.mockResolvedValue(confirmedTransaction);
      mockWalletRepo.save.mockResolvedValue({ ...wallet, balance: 20 });
      mockWalletTransactionRepo.create.mockReturnValue({ id: 't-refund', amount: 80, type: 'debit' });
      mockWalletTransactionRepo.save.mockResolvedValue({ id: 't-refund', amount: 80, type: 'debit' });

      const result = await service.refundCOD('order1', 80, 'user1', 'Cancelled after COD');

      expect(result.type).toBe('debit');
      expect(mockWalletTransactionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        referenceId: expect.stringMatching(/^COD-REF-order1-/),
        description: 'COD Refund: Cancelled after COD',
      }));
    });

    it('should reject COD refund when no confirmed transaction exists', async () => {
      mockWalletRepo.findOne.mockResolvedValue({ id: 'w1', userId: 'user1', balance: 100 } as WalletEntity);
      mockWalletTransactionRepo.findOne.mockResolvedValue(null);

      await expect(service.refundCOD('order1', 80, 'user1', 'Cancelled after COD')).rejects.toThrow(NotFoundException);
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

  describe('confirmCODCollection - error cases', () => {
    it('should throw BadRequestException for invalid COD amount', async () => {
      await expect(service.confirmCODCollection('order1', 'invalid', 'user1')).rejects.toThrow(BadRequestException);
      await expect(service.confirmCODCollection('order1', 0, 'user1')).rejects.toThrow(BadRequestException);
      await expect(service.confirmCODCollection('order1', -10, 'user1')).rejects.toThrow(BadRequestException);
   });
  });

  describe('refundCOD - error cases', () => {
    it('should throw BadRequestException for invalid COD amount', async () => {
      await expect(service.refundCOD('order1', 'invalid', 'user1', 'test')).rejects.toThrow(BadRequestException);
      await expect(service.refundCOD('order1', 0, 'user1', 'test')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getWalletTransactions', () => {
    it('should return paginated transactions', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 100 } as WalletEntity;
      const transactions = [
        { id: 't1', amount: 50, createdAt: new Date('2026-06-01') },
        { id: 't2', amount: 30, createdAt: new Date('2026-06-02') },
      ] as WalletTransactionEntity[];

      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletTransactionRepo.find.mockResolvedValue(transactions);

      const result = await service.getWalletTransactions('user1', 10, 0);

      expect(result).toBe(transactions);
      expect(mockWalletTransactionRepo.find).toHaveBeenCalledWith({
        where: { walletId: 'w1' },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('getWalletBalance', () => {
    it('should return balance and currency', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 250, currency: 'INR' } as WalletEntity;
      mockWalletRepo.findOne.mockResolvedValue(wallet);

      const result = await service.getWalletBalance('user1');

      expect(result).toEqual({ balance: 250, currency: 'INR' });
    });
  });

  describe('preventDoublePayment', () => {
    it('should return true when no recent transaction exists', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 100 } as WalletEntity;
      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletTransactionRepo.find.mockResolvedValue([]);

      const result = await service.preventDoublePayment('user1', 'order1', 100);

      expect(result).toBe(true);
    });

    it('should return false when duplicate payment detected', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 100 } as WalletEntity;
      const recentTx = [
        { id: 't1', description: 'Payment confirmed for order order1', createdAt: new Date() },
      ] as WalletTransactionEntity[];
      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletTransactionRepo.find.mockResolvedValue(recentTx);

      const result = await service.preventDoublePayment('user1', 'order1', 100);

      expect(result).toBe(false);
    });

    it('should return true when recent transactions are not successful', async () => {
      const wallet = { id: 'w1', userId: 'user1', balance: 100 } as WalletEntity;
      const recentTx = [
        { id: 't1', description: 'Payment pending', createdAt: new Date() },
      ] as WalletTransactionEntity[];
      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletTransactionRepo.find.mockResolvedValue(recentTx);

      const result = await service.preventDoublePayment('user1', 'order1', 100);

      expect(result).toBe(true);
    });
  });

  describe('reconcilePayments', () => {
    it('should return reconciliation summary', async () => {
      const result = await service.reconcilePayments();

      expect(result).toEqual({
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        discrepancies: [],
      });
    });
  });
});