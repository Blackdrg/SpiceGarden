import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SubscriptionPlanType {
  STARTER = 'starter',
  GROWTH = 'growth',
  PROFESSIONAL = 'professional',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}

export enum PlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('subscription_plans')
@Index('idx_subscription_plans_type', ['planType'])
@Index('idx_subscription_plans_status', ['status'])
export class SubscriptionPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', enum: SubscriptionPlanType, unique: true })
  planType!: SubscriptionPlanType;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monthlyPrice!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  quarterlyPrice!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  annualPrice!: number;

  @Column({ type: 'varchar', enum: BillingCycle, default: BillingCycle.MONTHLY })
  defaultBillingCycle!: BillingCycle;

  @Column('simple-json', { nullable: true })
  features!: Record<string, any>;

  @Column('simple-json', { nullable: true })
  limits!: {
    maxOrders?: number;
    maxBranches?: number;
    maxUsers?: number;
    maxStorageGB?: number;
    apiCallsPerDay?: number;
    supportLevel?: string;
  };

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  commissionRate!: number;

  @Column({ type: 'int', default: 0 })
  trialDays!: number;

  @Column({ type: 'int', default: 0 })
  gracePeriodDays!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', enum: PlanStatus, default: PlanStatus.ACTIVE })
  status!: PlanStatus;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
