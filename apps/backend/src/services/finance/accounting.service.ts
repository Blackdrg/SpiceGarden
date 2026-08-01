import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JournalEntryEntity, AccountType, JournalEntryStatus } from '../../db/entities/journal-entry.entity';
import { LedgerEntryEntity } from '../../db/entities/ledger-entry.entity';
import { randomString } from '../../../shared/random.utils';
import { LedgerService } from '../../modules/ledger/ledger.service';

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(
    @InjectRepository(JournalEntryEntity)
    private journalRepo: Repository<JournalEntryEntity>,
    @InjectRepository(LedgerEntryEntity)
    private ledgerRepo: Repository<LedgerEntryEntity>,
    private ledgerService: LedgerService,
    private dataSource: DataSource,
  ) {}

  async postJournalEntry(entries: Array<{
    accountCode: string;
    accountName: string;
    accountType: AccountType;
    debitAmount: number;
    creditAmount: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
  }>): Promise<JournalEntryEntity> {
    const transactionId = `TXN-${Date.now()}-${randomString(9)}`;
    const entryDate = new Date();

    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      totalDebit += entry.debitAmount;
      totalCredit += entry.creditAmount;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(`Journal entry not balanced: debit=${totalDebit}, credit=${totalCredit}`);
    }

    const journalEntry = this.journalRepo.create({
      transactionId,
      entryDate,
      accountCode: entries[0].accountCode,
      accountName: entries[0].accountName,
      accountType: entries[0].accountType,
      debitAmount: totalDebit,
      creditAmount: totalCredit,
      currency: 'INR',
      status: JournalEntryStatus.DRAFT,
      description: entries[0].description,
      referenceType: entries[0].referenceType,
      referenceId: entries[0].referenceId,
    });

    const savedEntry = await this.journalRepo.save(journalEntry);

    await this.dataSource.transaction(async manager => {
      await Promise.all(entries.map(async (entry) => {
        await manager.save(LedgerEntryEntity, {
          transactionId,
          account: entry.accountCode,
          accountName: entry.accountName,
          amount: entry.debitAmount - entry.creditAmount,
          currency: 'INR',
          type: entry.referenceType || 'journal',
          referenceId: entry.referenceId || undefined,
          description: entry.description,
        });
      }));
    });

    return savedEntry;
  }

  async reverseJournalEntry(transactionId: string, reversedBy: string): Promise<JournalEntryEntity[]> {
    const entries = await this.journalRepo.find({ where: { transactionId } });
    if (entries.length === 0) throw new NotFoundException('Journal entry not found');

    const originalEntry = entries[0];
    if (originalEntry.status === JournalEntryStatus.REVERSED) {
      throw new BadRequestException('Journal entry already reversed');
    }

    const reversedEntries: JournalEntryEntity[] = [];

    await this.dataSource.transaction(async manager => {
      const reversalPromises = entries.map(async (entry) => {
        const reversed = manager.create(JournalEntryEntity, {
          transactionId: `REV-${transactionId}`,
          entryDate: new Date(),
          accountCode: entry.accountCode,
          accountName: entry.accountName,
          accountType: entry.accountType,
          debitAmount: entry.creditAmount,
          creditAmount: entry.debitAmount,
          currency: entry.currency,
          status: JournalEntryStatus.POSTED,
          description: `Reversal of ${entry.description}`,
          referenceType: entry.referenceType,
          referenceId: entry.referenceId,
          reversedBy,
          reversedAt: new Date(),
        });
        const savedReversed = await manager.save(JournalEntryEntity, reversed);
        await manager.save(LedgerEntryEntity, {
          transactionId: `REV-${transactionId}`,
          account: entry.accountCode,
          accountName: entry.accountName,
          amount: entry.creditAmount - entry.debitAmount,
          currency: entry.currency,
          type: 'reversal',
          referenceId: entry.referenceId || undefined,
          description: `Reversal of ${entry.description}`,
        });
        return savedReversed;
      });

      reversedEntries.push(...await Promise.all(reversalPromises));

      await manager.update(JournalEntryEntity, { transactionId }, { status: JournalEntryStatus.REVERSED, reversedBy, reversedAt: new Date() });
    });

    return reversedEntries;
  }

  async getTrialBalance(startDate: Date, endDate: Date): Promise<any[]> {
    const entries = await this.ledgerRepo.find({
      where: {
        createdAt: (await this.dataSource.getRepository(LedgerEntryEntity).createQueryBuilder('entry')
          .where('entry.createdAt >= :startDate', { startDate })
          .andWhere('entry.createdAt <= :endDate', { endDate })
          .getQuery()) as any,
      },
    });

    const balanceMap = new Map<string, {
      accountCode: string;
      accountName: string;
      accountType: AccountType;
      totalDebit: number;
      totalCredit: number;
    }>();

    for (const entry of entries) {
      const existing = balanceMap.get(entry.account) || {
        accountCode: entry.account,
        accountName: entry.accountName,
        accountType: AccountType.ASSET,
        totalDebit: 0,
        totalCredit: 0,
      };

      if (entry.amount > 0) {
        existing.totalDebit += Number(entry.amount);
      } else {
        existing.totalCredit += Math.abs(Number(entry.amount));
      }

      balanceMap.set(entry.account, existing);
    }

    return Array.from(balanceMap.values());
  }

  async getProfitAndLoss(startDate: Date, endDate: Date): Promise<any> {
    const entries = await this.ledgerRepo.find({
      where: {
        createdAt: (await this.dataSource.getRepository(LedgerEntryEntity).createQueryBuilder('entry')
          .where('entry.createdAt >= :startDate', { startDate })
          .andWhere('entry.createdAt <= :endDate', { endDate })
          .getQuery()) as any,
      },
    });

    let revenue = 0;
    let expenses = 0;
    const categoryMap = new Map<string, number>();

    for (const entry of entries) {
      const amount = Number(entry.amount);
      if (amount > 0) {
        revenue += amount;
        categoryMap.set(entry.account, (categoryMap.get(entry.account) || 0) + amount);
      } else {
        expenses += Math.abs(amount);
      }
    }

    return {
      period: { startDate, endDate },
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit: revenue - expenses,
      categories: Array.from(categoryMap.entries()).map(([name, amount]) => ({ name, amount })),
    };
  }

  async getJournalEntries(filters?: {
    transactionId?: string;
    referenceId?: string;
    status?: JournalEntryStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<JournalEntryEntity[]> {
    const where: any = {};
    if (filters?.transactionId) where.transactionId = filters.transactionId;
    if (filters?.referenceId) where.referenceId = filters.referenceId;
    if (filters?.status) where.status = filters.status;

    const query = this.journalRepo.createQueryBuilder('entry');
    if (filters?.startDate) query.andWhere('entry.entryDate >= :startDate', { startDate: filters.startDate });
    if (filters?.endDate) query.andWhere('entry.entryDate <= :endDate', { endDate: filters.endDate });

    return query.orderBy('entry.entryDate', 'DESC').take(filters?.limit || 100).getMany();
  }
}
