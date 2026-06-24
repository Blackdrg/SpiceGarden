import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { PayoutReportEntity } from '../../db/entities/payout-report.entity';
export interface StripeConnectAccountData {
    legalBusinessName: string;
    businessType: string;
    email: string;
    phone: string;
    address: {
        line1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    gstin?: string;
    pan?: string;
    bankAccount?: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
        bankName: string;
    };
}
export interface StripeConnectAccountResult {
    accountId: string;
    status: string;
    detailsSubmitted: boolean;
    payoutsEnabled: boolean;
    requirementsDue: string[];
    onboardingUrl?: string;
}
export declare class StripeConnectService {
    private configService;
    private readonly restaurantRepo;
    private readonly payoutRepo;
    private readonly logger;
    private readonly stripe;
    constructor(configService: ConfigService, restaurantRepo: Repository<RestaurantEntity>, payoutRepo: Repository<PayoutReportEntity>);
    createConnectAccount(restaurantId: string, accountData: StripeConnectAccountData): Promise<StripeConnectAccountResult>;
    registerWebhook(accountId: string): Promise<{
        endpointId: string;
        status: string;
    }>;
    getAccountStatus(restaurantId: string): Promise<StripeConnectAccountResult>;
    sendPayout(restaurantId: string, payoutId: string, amount: number, currency?: string): Promise<{
        payoutId: string;
        status: string;
    }>;
    getPayoutHistory(restaurantId: string, limit?: number): Promise<any[]>;
    getAccountBalance(restaurantId: string): Promise<{
        available: number;
        pending: number;
    }>;
    private mapBusinessType;
    private mapBusinessStructure;
}
