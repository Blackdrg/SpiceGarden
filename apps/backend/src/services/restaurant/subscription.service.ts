import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SubscriptionPlanEntity, SubscriptionPlanType, BillingCycle, PlanStatus } from '../../db/entities/subscription-plan.entity';
import { RestaurantSubscriptionEntity, RestaurantSubscriptionStatus } from '../../db/entities/restaurant-subscription.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { CommissionRuleEntity, CommissionStatus, CommissionType } from '../../db/entities/commission-rule.entity';
import { PaymentService } from '../payments/payments.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(SubscriptionPlanEntity)
    private planRepo: Repository<SubscriptionPlanEntity>,
    @InjectRepository(RestaurantSubscriptionEntity)
    private subscriptionRepo: Repository<RestaurantSubscriptionEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(CommissionRuleEntity)
    private commissionRepo: Repository<CommissionRuleEntity>,
    private dataSource: DataSource,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
  ) {}

  async getAvailablePlans(): Promise<SubscriptionPlanEntity[]> {
    return this.planRepo.find({
      where: { isActive: true, status: PlanStatus.ACTIVE },
      order: { sortOrder: 'ASC' },
    });
  }

  async getPlanByType(planType: SubscriptionPlanType): Promise<SubscriptionPlanEntity> {
    const plan = await this.planRepo.findOne({ where: { planType, isActive: true } });
    if (!plan) throw new NotFoundException(`Plan not found: ${planType}`);
    return plan;
  }

  async subscribeRestaurant(restaurantId: string, planId: string, billingCycle: BillingCycle): Promise<RestaurantSubscriptionEntity> {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const plan = await this.planRepo.findOne({ where: { id: planId, isActive: true } });
    if (!plan) throw new NotFoundException('Plan not found');

    const existing = await this.subscriptionRepo.findOne({ where: { restaurantId } });
    if (existing && [RestaurantSubscriptionStatus.ACTIVE, RestaurantSubscriptionStatus.TRIALING].includes(existing.status)) {
      throw new BadRequestException('Restaurant already has an active subscription');
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
      restaurantId,
      planId,
      planType: plan.planType,
      status: plan.trialDays > 0 ? RestaurantSubscriptionStatus.TRIALING : RestaurantSubscriptionStatus.ACTIVE,
      billingCycle,
      amount,
      currency: 'INR',
      isTrial: plan.trialDays > 0,
      currentPeriodStart: now,
      currentPeriodEnd,
      features: plan.features,
      usage: {
        ordersThisMonth: 0,
        apiCallsThisMonth: 0,
        storageUsedGB: 0,
        branchesUsed: 0,
        usersUsed: 0,
      },
    });

    if (plan.trialDays > 0) {
      subscription.trialStart = now;
      subscription.trialEnd = new Date(now);
      subscription.trialEnd.setDate(subscription.trialEnd.getDate() + plan.trialDays);
    }

    const saved = await this.subscriptionRepo.save(subscription);

    await this.applyPlanBenefits(restaurantId, plan);

    return saved;
  }

  async upgradeSubscription(restaurantId: string, newPlanId: string): Promise<RestaurantSubscriptionEntity> {
    const current = await this.subscriptionRepo.findOne({ where: { restaurantId } });
    if (!current) throw new NotFoundException('No active subscription found');

    const newPlan = await this.planRepo.findOne({ where: { id: newPlanId } });
    if (!newPlan) throw new NotFoundException('New plan not found');

    const currentPlan = await this.planRepo.findOne({ where: { id: current.planId } });
    if (!currentPlan) throw new NotFoundException('Current plan not found');

    if (newPlan.sortOrder <= currentPlan.sortOrder) {
      throw new BadRequestException('Can only upgrade to a higher plan');
    }

    const now = new Date();
    const daysRemaining = (current.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const totalPeriodDays = (current.currentPeriodEnd.getTime() - current.currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24);
    const unusedRatio = Math.max(0, daysRemaining / totalPeriodDays);
    const creditAmount = Number(current.amount) * unusedRatio;

    current.planId = newPlanId;
    current.planType = newPlan.planType;
    current.amount = newPlan.monthlyPrice;
    current.currentPeriodStart = now;
    current.currentPeriodEnd = new Date(now);
    current.currentPeriodEnd.setMonth(current.currentPeriodEnd.getMonth() + 1);
    current.features = newPlan.features;

    await this.subscriptionRepo.save(current);
    await this.applyPlanBenefits(restaurantId, newPlan);

    return current;
  }

  async cancelSubscription(restaurantId: string, reason?: string): Promise<RestaurantSubscriptionEntity> {
    const subscription = await this.subscriptionRepo.findOne({ where: { restaurantId } });
    if (!subscription) throw new NotFoundException('No active subscription found');

    subscription.cancelAtPeriodEnd = true;
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason || '';
    await this.subscriptionRepo.save(subscription);

    return subscription;
  }

  async renewSubscription(restaurantId: string): Promise<RestaurantSubscriptionEntity> {
    const subscription = await this.subscriptionRepo.findOne({ where: { restaurantId } });
    if (!subscription) throw new NotFoundException('No subscription found');

    const now = new Date();
    if (subscription.currentPeriodEnd > now) {
      throw new BadRequestException('Subscription is not yet due for renewal');
    }

    const plan = await this.planRepo.findOne({ where: { id: subscription.planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = new Date(now);
    subscription.currentPeriodEnd.setMonth(subscription.currentPeriodEnd.getMonth() + 1);
    subscription.status = RestaurantSubscriptionStatus.ACTIVE;
    subscription.failedPaymentCount = 0;

    return this.subscriptionRepo.save(subscription);
  }

  async checkFeatureAccess(restaurantId: string, featureKey: string): Promise<boolean> {
    const subscription = await this.subscriptionRepo.findOne({ where: { restaurantId } });
    if (!subscription) return false;

    if (![RestaurantSubscriptionStatus.ACTIVE, RestaurantSubscriptionStatus.TRIALING].includes(subscription.status)) {
      return false;
    }

    const features = subscription.features || {};
    return features[featureKey] === true;
  }

  async getSubscription(restaurantId: string): Promise<RestaurantSubscriptionEntity | null> {
    return this.subscriptionRepo.findOne({ where: { restaurantId } });
  }

  private async applyPlanBenefits(restaurantId: string, plan: SubscriptionPlanEntity): Promise<void> {
    const commissionRate = plan.commissionRate || 0.15;
    const existingRules = await this.commissionRepo.find({
      where: { restaurantId, status: CommissionStatus.ACTIVE },
    });

    if (existingRules.length > 0) {
      await this.commissionRepo.update(
        existingRules.map(r => r.id),
        { status: CommissionStatus.EXPIRED }
      );
    }

    const rule = this.commissionRepo.create({
      restaurantId,
      type: CommissionType.PERCENTAGE,
      value: commissionRate * 100,
      status: CommissionStatus.ACTIVE,
    });
    await this.commissionRepo.save(rule);
  }

  async initializePlans(): Promise<void> {
    const count = await this.planRepo.count();
    if (count > 0) return;

    const plans: Partial<SubscriptionPlanEntity>[] = [
      {
        planType: SubscriptionPlanType.STARTER,
        name: 'Starter',
        description: 'Perfect for new restaurants getting started',
        monthlyPrice: 999,
        quarterlyPrice: 2699,
        annualPrice: 9599,
        features: {
          maxOrders: 500,
          maxBranches: 1,
          maxUsers: 3,
          basicSupport: true,
          gstReports: true,
        },
        limits: { maxOrders: 500, maxBranches: 1, maxUsers: 3, apiCallsPerDay: 1000, supportLevel: 'email' },
        commissionRate: 0.18,
        trialDays: 14,
        gracePeriodDays: 7,
        sortOrder: 1,
      },
      {
        planType: SubscriptionPlanType.GROWTH,
        name: 'Growth',
        description: 'For growing restaurants with multiple branches',
        monthlyPrice: 2499,
        quarterlyPrice: 6749,
        annualPrice: 23999,
        features: {
          maxOrders: 2000,
          maxBranches: 3,
          maxUsers: 10,
          prioritySupport: true,
          gstReports: true,
          analytics: true,
          apiAccess: true,
        },
        limits: { maxOrders: 2000, maxBranches: 3, maxUsers: 10, apiCallsPerDay: 10000, supportLevel: 'priority_email' },
        commissionRate: 0.15,
        trialDays: 14,
        gracePeriodDays: 7,
        sortOrder: 2,
      },
      {
        planType: SubscriptionPlanType.PROFESSIONAL,
        name: 'Professional',
        description: 'Advanced features for established restaurants',
        monthlyPrice: 4999,
        quarterlyPrice: 13499,
        annualPrice: 47999,
        features: {
          maxOrders: 5000,
          maxBranches: 10,
          maxUsers: 25,
          prioritySupport: true,
          gstReports: true,
          analytics: true,
          apiAccess: true,
          customBranding: true,
          inventoryManagement: true,
        },
        limits: { maxOrders: 5000, maxBranches: 10, maxUsers: 25, apiCallsPerDay: 50000, supportLevel: 'phone' },
        commissionRate: 0.12,
        trialDays: 14,
        gracePeriodDays: 14,
        sortOrder: 3,
      },
      {
        planType: SubscriptionPlanType.BUSINESS,
        name: 'Business',
        description: 'Full-featured solution for restaurant chains',
        monthlyPrice: 9999,
        quarterlyPrice: 26999,
        annualPrice: 95999,
        features: {
          maxOrders: 20000,
          maxBranches: 25,
          maxUsers: 100,
          prioritySupport: true,
          gstReports: true,
          analytics: true,
          apiAccess: true,
          customBranding: true,
          inventoryManagement: true,
          multiLocation: true,
          dedicatedAccountManager: true,
        },
        limits: { maxOrders: 20000, maxBranches: 25, maxUsers: 100, apiCallsPerDay: 200000, supportLevel: 'dedicated' },
        commissionRate: 0.10,
        trialDays: 30,
        gracePeriodDays: 14,
        sortOrder: 4,
      },
      {
        planType: SubscriptionPlanType.ENTERPRISE,
        name: 'Enterprise',
        description: 'Custom solutions for large restaurant chains',
        monthlyPrice: 24999,
        quarterlyPrice: 67499,
        annualPrice: 239999,
        features: {
          maxOrders: 100000,
          maxBranches: 100,
          maxUsers: 500,
          prioritySupport: true,
          gstReports: true,
          analytics: true,
          apiAccess: true,
          customBranding: true,
          inventoryManagement: true,
          multiLocation: true,
          dedicatedAccountManager: true,
          sso: true,
          slaGuarantee: true,
          customIntegrations: true,
        },
        limits: { maxOrders: 100000, maxBranches: 100, maxUsers: 500, apiCallsPerDay: 1000000, supportLevel: 'enterprise' },
        commissionRate: 0.08,
        trialDays: 30,
        gracePeriodDays: 30,
        sortOrder: 5,
      },
    ];

    await Promise.all(plans.map((planData) => this.planRepo.save(this.planRepo.create(planData))));

    this.logger.log('Initialized subscription plans');
  }
}
