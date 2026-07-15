import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';
import { SubscriptionPlanEntity, SubscriptionPlanType, BillingCycle } from './subscription-plan.entity';

export enum RestaurantSubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

@Entity('restaurant_subscriptions')
@Index('idx_restaurant_subscriptions_restaurant_id', ['restaurantId'])
@Index('idx_restaurant_subscriptions_status', ['status'])
@Index('idx_restaurant_subscriptions_plan_id', ['planId'])
export class RestaurantSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  restaurantId!: string;

  @ManyToOne(() => RestaurantEntity)
  restaurant!: RestaurantEntity;

  @Column()
  planId!: string;

  @ManyToOne(() => SubscriptionPlanEntity)
  plan!: SubscriptionPlanEntity;

  @Column({ type: 'varchar', enum: RestaurantSubscriptionStatus, default: RestaurantSubscriptionStatus.PENDING })
  status!: RestaurantSubscriptionStatus;

  @Column({ type: 'varchar', enum: SubscriptionPlanType })
  planType!: SubscriptionPlanType;

  @Column({ type: 'varchar', enum: BillingCycle })
  billingCycle!: BillingCycle;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', default: 'INR' })
  currency!: string;

  @Column({ type: 'boolean', default: false })
  isTrial!: boolean;

  @Column({ nullable: true })
  trialStart!: Date;

  @Column({ nullable: true })
  trialEnd!: Date;

  @Column()
  currentPeriodStart!: Date;

  @Column()
  currentPeriodEnd!: Date;

  @Column({ type: 'boolean', default: true })
  autoRenew!: boolean;

  @Column({ type: 'boolean', default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ nullable: true })
  cancelledAt!: Date;

  @Column({ nullable: true })
  cancellationReason!: string;

  @Column('simple-json', { nullable: true })
  features!: Record<string, any>;

  @Column('simple-json', { nullable: true })
  usage!: {
    ordersThisMonth?: number;
    apiCallsThisMonth?: number;
    storageUsedGB?: number;
    branchesUsed?: number;
    usersUsed?: number;
  };

  @Column({ nullable: true })
  lastPaymentId!: string;

  @Column({ type: 'int', default: 0 })
  failedPaymentCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
