import { Repository, Connection } from 'typeorm';
import { RestaurantOnboardingEntity, OnboardingStep } from '../../db/entities/restaurant-onboarding.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { UserEntity } from '../../db/entities/user.entity';
export declare class RestaurantOpsService {
    private onboardingRepo;
    private restaurantRepo;
    private branchRepo;
    private itemRepo;
    private categoryRepo;
    private userRepo;
    private readonly connection;
    private readonly logger;
    constructor(onboardingRepo: Repository<RestaurantOnboardingEntity>, restaurantRepo: Repository<RestaurantEntity>, branchRepo: Repository<RestaurantBranchEntity>, itemRepo: Repository<MenuItemEntity>, categoryRepo: Repository<MenuCategoryEntity>, userRepo: Repository<UserEntity>, connection: Connection);
    startOnboarding(userId: string, restaurantData: {
        name: string;
        slug: string;
        description?: string;
        businessDetails?: any;
    }): Promise<RestaurantOnboardingEntity>;
    updateStep(onboardingId: string, step: OnboardingStep, data?: {
        documents?: Record<string, any>;
        bankDetails?: Record<string, any>;
        menuSetup?: Record<string, any>;
    }): Promise<RestaurantOnboardingEntity>;
    completeOnboarding(onboardingId: string, userId: string): Promise<RestaurantOnboardingEntity>;
    getOnboardingProgress(onboardingId: string): Promise<any>;
}
