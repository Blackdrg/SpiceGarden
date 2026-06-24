import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService } from '../src/modules/ledger/ledger.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerEntryEntity } from '../src/db/entities/ledger-entry.entity';

describe('LedgerService', () => {
  let service: LedgerService;
  let ledgerRepo: jest.Mocked<Repository<LedgerEntryEntity>>;

  beforeEach(async () => {
    ledgerRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: getRepositoryToken(LedgerEntryEntity), useValue: ledgerRepo },
      ],
    }).compile();

    service = module.get(LedgerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEntry', () => {
    it('should create and save a ledger entry with all fields', async () => {
      const mockEntry = { id: 'entry-1', transactionId: 'tx-1', account: 'wallet', amount: 1000, currency: 'INR', type: 'credit', description: 'Test' } as any;
      ledgerRepo.create.mockReturnValue(mockEntry);
      ledgerRepo.save.mockResolvedValue(mockEntry);

      const result = await service.createEntry('tx-1', 'wallet', 1000, 'INR', 'credit', 'ref-1', 'Test');

      expect(ledgerRepo.create).toHaveBeenCalled();
      expect(ledgerRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntry);
    });

    it('should use default currency when not provided', async () => {
      const mockEntry = { id: 'entry-2', transactionId: 'tx-2', account: 'bank', amount: 500, currency: 'INR', type: 'debit', description: '' } as any;
      ledgerRepo.create.mockReturnValue(mockEntry);
      ledgerRepo.save.mockResolvedValue(mockEntry);

      await service.createEntry('tx-2', 'bank', 500, undefined, 'debit');

      expect(ledgerRepo.create).toHaveBeenCalled();
    });
  });

  describe('createTransaction', () => {
    it('should create debit and credit entries for positive amount', async () => {
      ledgerRepo.create.mockReturnValue({} as any);
      ledgerRepo.save.mockResolvedValue({} as any);

      await service.createTransaction('tx-3', 'wallet', 'bank', 1000, 'INR', 'transfer', 'ref-3', 'Payment');

      expect(ledgerRepo.save).toHaveBeenCalledTimes(2);
    });

    it('should throw error for zero amount', async () => {
      await expect(service.createTransaction('tx-err', 'wallet', 'bank', 0, 'INR', 'transfer')).rejects.toThrow('Amount must be positive');
      expect(ledgerRepo.save).not.toHaveBeenCalled();
    });

    it('should throw error for negative amount', async () => {
      await expect(service.createTransaction('tx-err2', 'wallet', 'bank', -100, 'INR', 'transfer')).rejects.toThrow('Amount must be positive');
      expect(ledgerRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('getEntriesByTransactionId', () => {
    it('should return entries ordered by createdAt ASC', async () => {
      const mockEntries = [
        { id: 'e1', transactionId: 'tx-lookup', createdAt: new Date('2026-01-01') },
        { id: 'e2', transactionId: 'tx-lookup', createdAt: new Date('2026-01-02') },
      ] as any;
      ledgerRepo.find.mockResolvedValue(mockEntries);

      const result = await service.getEntriesByTransactionId('tx-lookup');

      expect(ledgerRepo.find).toHaveBeenCalledWith({
        where: { transactionId: 'tx-lookup' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(mockEntries);
    });
  });

  describe('getEntriesByAccount', () => {
    it('should return entries filtered by account and date range', async () => {
      const mockEntries = [
        { id: 'e1', account: 'wallet', createdAt: new Date('2026-06-01') },
      ] as any;
      ledgerRepo.find.mockResolvedValue(mockEntries);

      const startDate = new Date('2026-06-01');
      const endDate = new Date('2026-06-30');

      const result = await service.getEntriesByAccount('wallet', startDate, endDate);

      expect(ledgerRepo.find).toHaveBeenCalled();
      expect(result).toEqual(mockEntries);
    });
  });
});
