import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum FeeType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  TIERED = 'tiered',
}

export enum FeeApplicableTo {
  RESTAURANT = 'restaurant',
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  ORDER = 'order',
}

export enum TaxableRule {
  TAXABLE = 'taxable',
  NON_TAXABLE = 'non_taxable',
  EXEMPT = 'exempt',
}

@Entity('platform_fees')
@Index('idx_platform_fees_applicable_to', ['applicableTo'])
@Index('idx_platform_fees_active', ['isActive'])
export class PlatformFeeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', enum: FeeType })
  feeType!: FeeType;

  @Column({ type: 'varchar', enum: FeeApplicableTo })
  applicableTo!: FeeApplicableTo;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  feeAmount!: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  feePercentage!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minAmount!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxAmount!: number;

  @Column('simple-json', { nullable: true })
  tieredRates?: Array<{ min: number; max: number; rate: number }>;

  @Column({ type: 'varchar', enum: TaxableRule, default: TaxableRule.TAXABLE })
  taxableRule!: TaxableRule;

  @Column({ type: 'varchar', nullable: true })
  cityCode!: string;

  @Column({ type: 'varchar', nullable: true })
  stateCode!: string;

  @Column('simple-json', { nullable: true })
  conditions?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
