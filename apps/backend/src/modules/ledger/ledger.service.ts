import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan, Raw, EntityManager } from 'typeorm';
import { LedgerEntryEntity } from '../../db/entities/ledger-entry.entity';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectRepository(LedgerEntryEntity)
    private readonly ledgerRepo: Repository<LedgerEntryEntity>,
  ) {}

  /**
   * Create a single ledger entry.
   * When an EntityManager is supplied the entry participates in that
   * caller-provided transaction, guaranteeing atomicity for double-entry writes.
   */
  async createEntry(
    transactionId: string,
    account: string,
    amount: number,
    currency: string = 'INR',
    type: string,
    referenceId: string | null = null,
    description: string = '',
    manager?: EntityManager,
  ): Promise<LedgerEntryEntity> {
    const repo = manager ? manager.getRepository(LedgerEntryEntity) : this.ledgerRepo;
    const entry = repo.create({
      transactionId,
      account,
      amount,
      currency,
      type,
      referenceId: referenceId ?? undefined,
      description,
    } as Parameters<typeof this.ledgerRepo.create>[0]);
    return await repo.save(entry);
  }

  /**
   * Create a balanced transaction (double-entry) with two entries
   * @param transactionId Unique ID for the transaction
   * @param debitAccount Account to debit
   * @param creditAccount Account to credit
   * @param amount Amount to transfer (positive)
   * @param currency Currency
   * @param type Transaction type
   * @param referenceId Reference ID (e.g., payment intent)
   * @param description Description
   */
  async createTransaction(
    transactionId: string,
    debitAccount: string,
    creditAccount: string,
    amount: number,
    currency: string = 'INR',
    type: string,
    referenceId: string | null = null,
    description: string = '',
  ): Promise<void> {
    // Ensure amount is positive
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Persist both entries atomically so the ledger can never be left
    // unbalanced if the second write fails.
    await this.ledgerRepo.manager.transaction(async (manager) => {
      // Create debit entry (positive amount)
      await this.createEntry(
        transactionId,
        debitAccount,
        amount,
        currency,
        type,
        referenceId,
        description,
        manager,
      );

      // Create credit entry (negative amount)
      await this.createEntry(
        transactionId,
        creditAccount,
        -amount,
        currency,
        type,
        referenceId,
        description,
        manager,
      );
    });

    this.logger.log(`Created ledger transaction ${transactionId}: ${debitAccount} +${amount}, ${creditAccount} -${amount}`);
  }

  /**
   * Get ledger entries by transaction ID
   */
  async getEntriesByTransactionId(transactionId: string): Promise<LedgerEntryEntity[]> {
    return await this.ledgerRepo.find({
      where: { transactionId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get ledger entries by account and date range
   */
  async getEntriesByAccount(
    account: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LedgerEntryEntity[]> {
    return await this.ledgerRepo.find({
        where: {
          account,
          createdAt: Raw(
            (alias) => `${alias} >= :startDate AND ${alias} < :endDate`,
            { startDate, endDate }
          ),
        },
      order: { createdAt: 'ASC' },
    });
  }
}