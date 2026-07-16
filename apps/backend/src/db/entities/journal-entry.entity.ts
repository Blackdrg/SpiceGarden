import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

export enum JournalEntryStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  REVERSED = 'reversed',
}

@Entity('journal_entries')
@Index('idx_journal_entries_transaction_id', ['transactionId'])
@Index('idx_journal_entries_status', ['status'])
@Index('idx_journal_entries_date', ['entryDate'])
@Index('idx_journal_entries_account', ['accountCode'])
export class JournalEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  transactionId!: string;

  @Column()
  entryDate!: Date;

  @Column()
  accountCode!: string;

  @Column()
  accountName!: string;

  @Column({ type: 'varchar', enum: AccountType })
  accountType!: AccountType;

  @Column('decimal', { precision: 12, scale: 2 })
  debitAmount!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  creditAmount!: number;

  @Column({ default: 'INR' })
  currency!: string;

  @Column({ type: 'varchar', enum: JournalEntryStatus, default: JournalEntryStatus.DRAFT })
  status!: JournalEntryStatus;

  @Column()
  description!: string;

  @Column({ nullable: true })
  referenceType!: string;

  @Column({ nullable: true })
  referenceId!: string;

  @Column({ nullable: true })
  postedBy!: string;

  @Column({ nullable: true })
  reversedBy!: string;

  @Column({ nullable: true })
  reversedAt!: Date;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
