import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { CustomerSubscriptionEntity, CustomerSubscriptionStatus } from '../../db/entities/customer-subscription.entity';
import { SubscriptionPlanEntity, SubscriptionPlanType, BillingCycle } from '../../db/entities/subscription-plan.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { OrderEntity } from '../../db/entities/order.entity';

@Injectable()
export class CustomerSubscriptionService {
  private readonly logger = new Logger(CustomerSubscriptionService.name);

  constructor(
    @InjectRepository(CustomerSubscriptionEntity)
    private subscriptionRepo: Repository<CustomerSubscriptionEntity>,
    @InjectRepository(SubscriptionPlanEntity)
    private planRepo: Repository<SubscriptionPlanEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(WalletEntity)
    private walletRepo: Repository<WalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private walletTransactionRepo: Repository<WalletTransactionEntity>,
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    private dataSource: DataSource,
  ) {}

  async getPrimePlans(): Promise<SubscriptionPlanEntity[]> {
    return this.planRepo.find({
      where: { planType: SubscriptionPlanType.GROWTH, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async subscribeCustomer(userId: string, planId: string, billingCycle: BillingCycle): Promise<CustomerSubscriptionEntity> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.planRepo.findOne({ where: { id: planId, isActive: true } });
    if (!plan) throw new NotFoundException('Plan not found');

    const existing = await this.subscriptionRepo.findOne({ where: { userId } });
    if (existing && [CustomerSubscriptionStatus.ACTIVE, CustomerSubscriptionStatus.TRIALING, CustomerSubscriptionStatus.PAST_DUE].includes(existing.status)) {
      throw new BadRequestException('Customer already has an active Prime subscription');
    }

    let amount = plan.monthlyPrice;
    if (billingCycle === BillingCycle.QUARTERLY && plan.quarterlyPrice) {
      amount = plan.quarterlyPrice;
    } else if (billingCycle === BillingCycle.ANNUAL && plan.annualPrice) {
      amount = plan.annualPrice;
    }

    const now = new Date();
    const currentPeriodEnd = new Date(now);
    if (billingCycle === BillingCycle.QUARTERLY) currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
    else if (billingCycle === BillingCycle.ANNUAL) currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    else currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    const subscription = this.subscriptionRepo.create({
      userId,
      planId,
      status: CustomerSubscriptionStatus.ACTIVE,
      billingCycle,
      amount,
      currency: 'INR',
      autoRenew: true,
      currentPeriodStart: now,
      currentPeriodEnd,
      benefits: {
        freeDelivery: true,
        cashbackPercentage: 5,
        rewardPointsMultiplier: 2,
        prioritySupport: true,
        exclusiveCoupons: true,
      },
    });

    const saved = await this.subscriptionRepo.save(subscription);
    return saved;
  }

  async cancelSubscription(userId: string): Promise<CustomerSubscriptionEntity> {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!subscription) throw new NotFoundException('No active subscription found');

    subscription.cancelAtPeriodEnd = true;
    subscription.autoRenew = false;
    await this.subscriptionRepo.save(subscription);

    return subscription;
  }

  async getSubscription(userId: string): Promise<CustomerSubscriptionEntity | null> {
    return this.subscriptionRepo.findOne({ where: { userId } });
  }

  async getPrimeBenefits(userId: string): Promise<Record<string, any>> {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!subscription || subscription.status !== CustomerSubscriptionStatus.ACTIVE) {
      return { isPrime: false };
    }

    return {
      isPrime: true,
      benefits: subscription.benefits || {},
      expiresAt: subscription.currentPeriodEnd,
    };
  }

  async calculateDeliveryDiscount(userId: string, deliveryFee: number): Promise<number> {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!subscription || subscription.status !== CustomerSubscriptionStatus.ACTIVE) {
      return 0;
    }

    const benefits = subscription.benefits || {};
    if (benefits.freeDelivery) {
      return deliveryFee;
    }

    return 0;
  }

  async calculateCashback(userId: string, orderAmount: number): Promise<number> {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!subscription || subscription.status !== CustomerSubscriptionStatus.ACTIVE) {
      return 0;
    }

    const benefits = subscription.benefits || {};
    const cashbackPercentage = benefits.cashbackPercentage || 0;
    return (orderAmount * cashbackPercentage) / 100;
  }

  async applyPrimeRewardPoints(userId: string, orderAmount: number): Promise<number> {
    const subscription = await this.subscriptionRepo.findOne({ where: { userId } });
    if (!subscription || subscription.status !== CustomerSubscriptionStatus.ACTIVE) {
      return Math.floor(orderAmount / 10);
    }

    const benefits = subscription.benefits || {};
    const multiplier = benefits.rewardPointsMultiplier || 1;
    return Math.floor((orderAmount / 10) * multiplier);
  }

  async getPrimeHistory(userId: string): Promise<CustomerSubscriptionEntity[]> {
    return this.subscriptionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
