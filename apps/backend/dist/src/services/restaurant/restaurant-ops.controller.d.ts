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
    }): unknown;
    getOnboardingProgress(id: string): unknown;
    updateOnboardingStep(id: string, body: {
        step: OnboardingStep;
        data?: any;
    }): unknown;
    completeOnboarding(id: string, req: AuthenticatedRequest): unknown;
    submitForModeration(body: {
        menuItemId: string;
        restaurantId: string;
        action: ModerationAction;
        data: Record<string, any>;
        originalData?: Record<string, any>;
    }): unknown;
    getPendingModerations(restaurantId?: string): unknown;
    reviewModeration(id: string, body: {
        status: ModerationStatus;
        notes?: string;
    }, req: AuthenticatedRequest): unknown;
    getPayoutHistory(restaurantId: string): unknown;
    generatePayout(body: {
        restaurantId: string;
        periodStart: string;
        periodEnd: string;
    }): unknown;
    processPayout(id: string, body: {
        reference: string;
    }): unknown;
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
    }): unknown;
    updateBranch(id: string, body: Partial<{
        branchName: string;
        address: string;
        openingTime: string;
        closingTime: string;
        lat: number;
        lng: number;
        isOnline: boolean;
    }>): unknown;
    toggleBranchStatus(id: string, body: {
        isOnline: boolean;
    }): unknown;
    getBranch(id: string): unknown;
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
    }): unknown;
    getCommissionRules(restaurantId: string): unknown;
    calculateCommission(body: {
        restaurantId: string;
        orderAmount: number;
    }): unknown;
}
export {};
