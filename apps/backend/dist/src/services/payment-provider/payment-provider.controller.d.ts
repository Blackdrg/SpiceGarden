import { StripeConnectService } from './stripe-connect.service';
import { RazorpaySettlementService } from './razorpay-settlement.service';
export declare class PaymentProviderController {
    private readonly stripeConnectService;
    private readonly razorpaySettlementService;
    constructor(stripeConnectService: StripeConnectService, razorpaySettlementService: RazorpaySettlementService);
    createStripeConnectAccount(req: any, dto: any): Promise<import("./stripe-connect.service").StripeConnectAccountResult>;
    getStripeConnectStatus(req: any): Promise<import("./stripe-connect.service").StripeConnectAccountResult>;
    createRazorpayFundAccount(req: any, dto: any): Promise<import("./razorpay-settlement.service").RazorpayFundAccountResult>;
    getRazorpaySettlementStatus(req: any): Promise<{
        status: string;
        fundAccountId?: string;
    }>;
    getPayoutHistory(req: any, limit?: string): Promise<any[]>;
    getAccountBalance(req: any): Promise<{
        available: number;
        pending: number;
    }>;
}
