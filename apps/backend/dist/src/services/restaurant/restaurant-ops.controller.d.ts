import { RestaurantOpsService } from './restaurant-ops.service';
import { OnboardingStep } from '../../db/entities/restaurant-onboarding.entity';
import { MenuModerationService } from './menu-moderation.service';
import { ModerationStatus, ModerationAction } from '../../db/entities/menu-moderation.entity';
import { PayoutService } from './payout.service';
import { BranchManagementService } from './branch-management.service';
import { CommissionService } from './commission.service';
import { CommissionType } from '../../db/entities/commission-rule.entity';
interface AuthenticatedRequest {
    user: {
        id: string;
        userId?: string;
    };
}
export declare class RestaurantOpsController {
    private opsService;
    private moderationService;
    private payoutService;
    private branchService;
    private commissionService;
    constructor(opsService: RestaurantOpsService, moderationService: MenuModerationService, payoutService: PayoutService, branchService: BranchManagementService, commissionService: CommissionService);
    startOnboarding(body: {
        userId: string;
        restaurantData: {
            name: string;
            slug: string;
            description?: string;
            businessDetails?: any;
        };
    }): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    getOnboardingProgress(id: string): Promise<any>;
    updateOnboardingStep(id: string, body: {
        step: OnboardingStep;
        data?: any;
    }): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    completeOnboarding(id: string, req: AuthenticatedRequest): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    submitForModeration(body: {
        menuItemId: string;
        restaurantId: string;
        action: ModerationAction;
        data: Record<string, any>;
        originalData?: Record<string, any>;
    }): Promise<import("../../db/entities/menu-moderation.entity").MenuModerationEntity>;
    getPendingModerations(restaurantId?: string): Promise<import("../../db/entities/menu-moderation.entity").MenuModerationEntity[]>;
    reviewModeration(id: string, body: {
        status: ModerationStatus;
        notes?: string;
    }, req: AuthenticatedRequest): Promise<import("../../db/entities/menu-moderation.entity").MenuModerationEntity>;
    getPayoutHistory(restaurantId: string): Promise<import("../../db/entities/payout-report.entity").PayoutReportEntity[]>;
    generatePayout(body: {
        restaurantId: string;
        periodStart: string;
        periodEnd: string;
    }): Promise<import("../../db/entities/payout-report.entity").PayoutReportEntity>;
    processPayout(id: string, body: {
        reference: string;
    }): Promise<import("../../db/entities/payout-report.entity").PayoutReportEntity>;
    createBranch(body: {
        restaurantId: string;
        branchData: {
            branchName: string;
            address: string;
            lat: number;
            lng: number;
            openingTime?: string;
            closingTime?: string;
        };
    }): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity>;
    updateBranch(id: string, body: Partial<{
        branchName: string;
        address: string;
        openingTime: string;
        closingTime: string;
        lat: number;
        lng: number;
        isOnline: boolean;
    }>): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity>;
    toggleBranchStatus(id: string, body: {
        isOnline: boolean;
    }): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity>;
    getBranch(id: string): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity>;
    createCommissionRule(body: {
        restaurantId: string;
        ruleData: {
            type: CommissionType;
            value: number;
            minOrderValue?: number;
            maxOrderValue?: number;
            validFrom?: Date;
            validTo?: Date;
            applicableCategories?: string[];
        };
    }): Promise<import("../../db/entities/commission-rule.entity").CommissionRuleEntity>;
    getCommissionRules(restaurantId: string): Promise<import("../../db/entities/commission-rule.entity").CommissionRuleEntity[]>;
    calculateCommission(body: {
        restaurantId: string;
        orderAmount: number;
    }): Promise<{
        commissionAmount: number;
    }>;
}
export {};
