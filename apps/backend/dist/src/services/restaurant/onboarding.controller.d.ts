import { RestaurantOnboardingService } from './onboarding.service';
export declare class RestaurantOnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: RestaurantOnboardingService);
    initializeOnboarding(restaurantId: string): unknown;
    updateStep(onboardingId: string, body: any): unknown;
    getOnboardingStatus(restaurantId: string): unknown;
    completeOnboarding(onboardingId: string, body: any): unknown;
    rejectOnboarding(onboardingId: string, body: any): unknown;
    submitGSTConfig(restaurantId: string, gstData: any): unknown;
    setupPricing(restaurantId: string, pricing: any): unknown;
    setupPayout(restaurantId: string, payout: any): unknown;
    getOnboardingAnalytics(): unknown;
}
