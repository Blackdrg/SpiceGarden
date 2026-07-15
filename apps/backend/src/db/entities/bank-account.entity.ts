import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { DriverEntity } from './driver.entity';
import { TenantEntity } from './tenant.entity';

export enum BankAccountType {
  SAVINGS = 'savings',
  CURRENT = 'current',
}

export enum KycStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  MICRO_DEPOSITS = 'micro_deposits',
  INSTANT = 'instant',
  MANUAL = 'manual',
}

@Entity('bank_accounts')
@Index('idx_bank_accounts_entity_type', ['entityType', 'entityId'])
@Index('idx_bank_accounts_kyc_status', ['kycStatus'])
export class BankAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  entityType!: 'restaurant' | 'driver';

  @Column()
  entityId!: string;

  @ManyToOne(() => RestaurantEntity, { nullable: true })
  restaurant?: RestaurantEntity;

  @ManyToOne(() => DriverEntity, { nullable: true })
  driver?: DriverEntity;

  @Column()
  accountHolderName!: string;

  @Column()
  bankName!: string;

  @Column()
  branchName!: string;

  @Column()
  accountNumber!: string;

  @Column()
  ifscCode!: string;

  @Column({ type: 'varchar', enum: BankAccountType, nullable: true })
  accountType!: BankAccountType;

  @Column({ nullable: true })
  upiId!: string;

  @Column({ type: 'varchar', enum: KycStatus, default: KycStatus.PENDING })
  kycStatus!: KycStatus;

  @Column({ type: 'varchar', enum: VerificationStatus, default: VerificationStatus.UNVERIFIED })
  verificationStatus!: VerificationStatus;

  @Column({ nullable: true })
  verifiedAt!: Date;

  @Column({ nullable: true })
  verificationId!: string;

  @Column('simple-json', { nullable: true })
  kycDocuments?: {
    panCard?: string;
    addressProof?: string;
    cancelledCheque?: string;
    businessProof?: string;
  };

  @Column({ type: 'simple-json', nullable: true })
  payoutSettings?: {
    payoutFrequency?: 'daily' | 'weekly' | 'monthly' | 'on_demand';
    minPayoutAmount?: number;
    holdPercentage?: number;
  };

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isPrimary!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { nullable: true })
  tenant?: TenantEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
