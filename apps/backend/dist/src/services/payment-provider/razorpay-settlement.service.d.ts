import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { PayoutReportEntity } from '../../db/entities/payout-report.entity';
export interface RazorpaySettlementAccountData {
    legalBusinessName: string;
    email: string;
    phone: string;
    businessType: string;
    gstin?: string;
    pan?: string;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    bankAccount: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
        bankName: string;
    };
}
export interface RazorpaySettlementResult {
    settlementId: string;
    status: string;
    amount: number;
    currency: string;
    processedAt: string;
    fees: number;
    tax: number;
}
export interface RazorpayFundAccountResult {
    fundAccountId: string;
    bankDetails: {
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    };
}
export declare class RazorpaySettlementService {
    private configService;
    private readonly restaurantRepo;
    private readonly payoutRepo;
    private readonly logger;
    private readonly baseUrl;
    private keyId;
    private keySecret;
    constructor(configService: ConfigService, restaurantRepo: Repository<RestaurantEntity>, payoutRepo: Repository<PayoutReportEntity>);
    private rzpRequest;
    createFundAccount(restaurantId: string, accountData: RazorpaySettlementAccountData): Promise<RazorpayFundAccountResult>;
    processPayout(restaurantId: string, payoutId: string, amount: number, currency?: string): Promise<RazorpaySettlementResult>;
    getSettlementHistory(restaurantId: string, limit?: number): Promise<RazorpaySettlementResult[]>;
    getAccountStatus(restaurantId: string): Promise<{
        status: string;
        fundAccountId?: string;
    }>;
    getAccountBalance(restaurantId: string): Promise<{
        available: number;
        pending: number;
        currency: string;
    }>;
}
