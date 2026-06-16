import { DriverOnboardingService } from './driver-onboarding.service';
import { DriverPayoutService } from './driver-payout.service';
export declare class DriverOpsController {
    private onboardingService;
    private payoutService;
    constructor(onboardingService: DriverOnboardingService, payoutService: DriverPayoutService);
    startOnboarding(body: any): unknown;
    uploadDocument(body: {
        driverId: string;
        type: string;
        url: string;
        expiryDate?: string;
    }): unknown;
    getDocuments(driverId: string): unknown;
    verifyDocument(id: string, body: {
        status: string;
        notes?: string;
        verifierId?: string;
    }): unknown;
    getOnboardingStatus(id: string): unknown;
    calculateIncentives(body: {
        driverId: string;
        weekStart: string;
    }): unknown;
    generateIncentive(body: {
        driverId: string;
        type: string;
        amount: number;
        description: string;
    }): unknown;
    approveIncentive(id: string, body: {
        approverId: string;
    }): unknown;
    getPendingIncentives(driverId?: string): unknown;
}
