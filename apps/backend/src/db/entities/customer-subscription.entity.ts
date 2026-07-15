import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';
import { SubscriptionPlanEntity, BillingCycle } from './subscription-plan.entity';

export enum CustomerSubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Entity('customer_subscriptions')
@Index('idx_customer_subscriptions_user_id', ['userId'])
@Index('idx_customer_subscriptions_status', ['status'])
@Index('idx_customer_subscriptions_plan_id', ['planId'])
export class CustomerSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column()
  planId!: string;

  @ManyToOne(() => SubscriptionPlanEntity)
  plan!: SubscriptionPlanEntity;

  @Column({ type: 'varchar', enum: CustomerSubscriptionStatus, default: CustomerSubscriptionStatus.PENDING })
  status!: CustomerSubscriptionStatus;

  @Column({ type: 'varchar', enum: BillingCycle })
  billingCycle!: BillingCycle;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', default: 'INR' })
  currency!: string;

  @Column({ nullable: true })
  gatewaySubscriptionId!: string;

  @Column({ nullable: true })
  paymentMethodId!: string;

  @Column({ type: 'boolean', default: true })
  autoRenew!: boolean;

  @Column({ type: 'boolean', default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ nullable: true })
  cancelledAt!: Date;

  @Column({ nullable: true })
  cancellationReason!: string;

  @Column()
  currentPeriodStart!: Date;

  @Column()
  currentPeriodEnd!: Date;

  @Column({ nullable: true })
  trialStart!: Date;

  @Column({ nullable: true })
  trialEnd!: Date;

  @Column('simple-json', { nullable: true })
  benefits!: Record<string, any>;

  @Column({ nullable: true })
  lastPaymentId!: string;

  @Column({ nullable: true })
  nextPaymentDate!: Date;

  @Column({ type: 'int', default: 0 })
  failedPaymentCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
