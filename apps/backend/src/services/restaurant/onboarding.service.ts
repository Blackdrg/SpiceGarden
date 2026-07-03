import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { RestaurantOnboardingEntity, OnboardingStep, OnboardingStatus } from '../../db/entities/restaurant-onboarding.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Injectable()
export class RestaurantOnboardingService {
  private readonly logger = new Logger(RestaurantOnboardingService.name);

  constructor(
    @InjectRepository(RestaurantOnboardingEntity)
    private readonly onboardingRepo: Repository<RestaurantOnboardingEntity>,
@InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  private async getOnboardingByRestaurantId(restaurantId: string): Promise<RestaurantOnboardingEntity> {
    let onboarding = await this.onboardingRepo.findOne({ where: { restaurantId } });
    if (!onboarding) {
      onboarding = this.onboardingRepo.create({
        restaurantId,
        currentStep: OnboardingStep.BUSINESS_REGISTRATION,
        status: OnboardingStatus.IN_PROGRESS,
      });
      onboarding = await this.onboardingRepo.save(onboarding);
    }
    return onboarding;
  }

  /**
   * Initialize onboarding for a new restaurant
   */
  async initializeOnboarding(restaurantId: string): Promise<RestaurantOnboardingEntity> {
    // Check if restaurant exists
    const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Check if onboarding already exists
    const existingOnboarding = await this.onboardingRepo.findOne({
      where: { restaurantId }
    });

    if (existingOnboarding) {
      // If already completed, return existing
      if (existingOnboarding.status === OnboardingStatus.COMPLETED) {
        return existingOnboarding;
      }
      // If in progress, return existing
      return existingOnboarding;
    }

    // Create new onboarding record
    const onboarding = this.onboardingRepo.create({
      restaurantId,
      currentStep: OnboardingStep.BUSINESS_REGISTRATION,
      status: OnboardingStatus.IN_PROGRESS,
    });

    const savedOnboarding = await this.onboardingRepo.save(onboarding);
    this.logger.log(`Initialized onboarding for restaurant ${restaurantId}`);

    return savedOnboarding;
  }

  /**
   * Update onboarding step
   */
  async updateStep(
    onboardingId: string,
    step: OnboardingStep,
    data?: any
  ): Promise<RestaurantOnboardingEntity> {
    const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
    if (!onboarding) {
      throw new NotFoundException('Onboarding record not found');
    }

    // Update the current step
    onboarding.currentStep = step;

    // Update specific data based on step
    if (data) {
      switch (step) {
        case OnboardingStep.BUSINESS_REGISTRATION:
          onboarding.businessDetails = { ...onboarding.businessDetails, ...data };
          break;
        case OnboardingStep.DOCUMENT_UPLOAD:
          onboarding.documentStatus = { ...onboarding.documentStatus, ...data };
          break;
        case OnboardingStep.BANK_VERIFICATION:
          onboarding.bankDetails = { ...onboarding.bankDetails, ...data };
          break;
        case OnboardingStep.MENU_SETUP:
          onboarding.menuSetup = { ...onboarding.menuSetup, ...data };
          break;
        default:
          break;
      }
    }

    // If this is the final step, mark as completed
    if (step === OnboardingStep.STAFF_INVITE) {
      onboarding.status = OnboardingStatus.COMPLETED;
    }

    const updatedOnboarding = await this.onboardingRepo.save(onboarding);
    this.logger.log(`Updated onboarding step to ${step} for onboarding ${onboardingId}`);

    return updatedOnboarding;
  }

  /**
   * Get onboarding status for a restaurant
   */
  async getOnboardingStatus(restaurantId: string): Promise<RestaurantOnboardingEntity> {
    const onboarding = await this.onboardingRepo.findOne({
      where: { restaurantId }
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding record not found for restaurant');
    }

    return onboarding;
  }

  /**
   * Complete onboarding manually
   */
  async completeOnboarding(onboardingId: string, reviewedBy: string): Promise<RestaurantOnboardingEntity> {
    const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
    if (!onboarding) {
      throw new NotFoundException('Onboarding record not found');
    }

    onboarding.status = OnboardingStatus.COMPLETED;
    onboarding.reviewedBy = reviewedBy;
    onboarding.reviewedAt = new Date();
    onboarding.currentStep = OnboardingStep.COMPLETION;

    const updatedOnboarding = await this.onboardingRepo.save(onboarding);
    this.logger.log(`Completed onboarding ${onboardingId}`);

    return updatedOnboarding;
  }

  /**
   * Reject onboarding
   */
  async rejectOnboarding(
    onboardingId: string,
    reviewedBy: string,
    reason: string
  ): Promise<RestaurantOnboardingEntity> {
    const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
    if (!onboarding) {
      throw new NotFoundException('Onboarding record not found');
    }

    onboarding.status = OnboardingStatus.REJECTED;
    onboarding.reviewedBy = reviewedBy;
    onboarding.reviewedAt = new Date();
    onboarding.rejectionReason = reason;

     const updatedOnboarding = await this.onboardingRepo.save(onboarding);
     this.logger.log(`Rejected onboarding ${onboardingId}`);

     return updatedOnboarding;
  }

  async submitGSTConfig(restaurantId: string, gstData: any): Promise<RestaurantOnboardingEntity> {
    const onboarding = await this.getOnboardingByRestaurantId(restaurantId);
    onboarding.currentStep = OnboardingStep.GST_CONFIG;
    onboarding.businessDetails = { ...onboarding.businessDetails, ...gstData };
    return this.onboardingRepo.save(onboarding);
  }

  async setupPricing(restaurantId: string, pricing: any): Promise<RestaurantOnboardingEntity> {
    const onboarding = await this.getOnboardingByRestaurantId(restaurantId);
    onboarding.currentStep = OnboardingStep.PRICING_SETUP;
    if (!onboarding.businessDetails) onboarding.businessDetails = {};
    onboarding.businessDetails.pricing = pricing;
    return this.onboardingRepo.save(onboarding);
  }

  async setupPayout(restaurantId: string, payout: any): Promise<RestaurantOnboardingEntity> {
    const onboarding = await this.getOnboardingByRestaurantId(restaurantId);
    onboarding.currentStep = OnboardingStep.PAYOUT_SETUP;
    onboarding.bankDetails = { ...onboarding.bankDetails, ...payout };
    onboarding.status = OnboardingStatus.AWAITING_REVIEW;
    return this.onboardingRepo.save(onboarding);
  }

  /**
    * Get onboarding analytics
    */
  async getOnboardingAnalytics(): Promise<any> {
    const [
      totalOnboardings,
      pendingOnboardings,
      inProgressOnboardings,
      completedOnboardings,
      rejectedOnboardings,
      avgCompletionTime
    ] = await Promise.all([
      this.onboardingRepo.count(),
      this.onboardingRepo.count({ where: { status: OnboardingStatus.PENDING } }),
      this.onboardingRepo.count({ where: { status: OnboardingStatus.IN_PROGRESS } }),
      this.onboardingRepo.count({ where: { status: OnboardingStatus.COMPLETED } }),
      this.onboardingRepo.count({ where: { status: OnboardingStatus.REJECTED } }),
      this.getAverageCompletionTime(),
    ]);

    return {
      totalOnboardings,
      pendingOnboardings,
      inProgressOnboardings,
      completedOnboardings,
      rejectedOnboardings,
      completionRate: totalOnboardings > 0 
        ? (completedOnboardings / totalOnboardings) * 100 
        : 0,
      avgCompletionTimeHours: avgCompletionTime
    };
  }

  /**
   * Helper to calculate average completion time
   */
  private async getAverageCompletionTime(): Promise<number> {
    const result = await this.onboardingRepo
      .createQueryBuilder('onboarding')
      .select('AVG(TIMESTAMPDIFF(HOUR, onboarding.createdAt, onboarding.updatedAt))', 'avgHours')
      .where('onboarding.status = :status', { status: OnboardingStatus.COMPLETED })
      .getRawOne();

    return result?.avgHours || 0;
  }
}

