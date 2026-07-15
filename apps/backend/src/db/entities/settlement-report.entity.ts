import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum SettlementType {
  PAYOUT = 'payout',
  REFUND = 'refund',
  COMMISSION = 'commission',
  FEE = 'fee',
  ADJUSTMENT = 'adjustment',
}

@Entity('settlement_reports')
@Index('idx_settlement_reports_status', ['status'])
@Index('idx_settlement_reports_type', ['settlementType'])
@Index('idx_settlement_reports_date', ['settlementDate'])
@Index('idx_settlement_reports_gateway', ['gateway'])
export class SettlementReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', enum: SettlementType })
  settlementType!: SettlementType;

  @Column({ type: 'varchar', enum: SettlementStatus, default: SettlementStatus.PENDING })
  status!: SettlementStatus;

  @Column()
  gateway!: string;

  @Column()
  gatewayBatchId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  gatewayFee!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  taxAmount!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  netAmount!: number;

  @Column({ nullable: true })
  currency!: string;

  @Column({ nullable: true })
  payoutId!: string;

  @Column({ nullable: true })
  restaurantId!: string;

  @Column({ nullable: true })
  driverId!: string;

  @Column({ type: 'date' })
  settlementDate!: Date;

  @Column({ type: 'date', nullable: true })
  processedAt!: Date;

  @Column('simple-json', { nullable: true })
  breakdown?: {
    orderCount?: number;
    refundCount?: number;
    commissionAmount?: number;
    feeAmount?: number;
    incentiveAmount?: number;
    penaltyAmount?: number;
  };

  @Column('simple-json', { nullable: true })
  transactions?: Array<{
    transactionId: string;
    amount: number;
    type: string;
    referenceId: string;
    status: string;
  }>;

  @Column({ nullable: true })
  utr!: string;

  @Column({ nullable: true })
  failureReason!: string;

  @Column({ type: 'int', default: 0 })
  retryCount!: number;

  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
