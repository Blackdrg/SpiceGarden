import { StripeConnectService } from './stripe-connect.service';
import { RazorpaySettlementService } from './razorpay-settlement.service';
export declare class PaymentProviderController {
    private readonly stripeConnectService;
    private readonly razorpaySettlementService;
    constructor(stripeConnectService: StripeConnectService, razorpaySettlementService: RazorpaySettlementService);
    createStripeConnectAccount(req: any, dto: any): unknown;
    getStripeConnectStatus(req: any): unknown;
    createRazorpayFundAccount(req: any, dto: any): unknown;
    getRazorpaySettlementStatus(req: any): unknown;
    getPayoutHistory(req: any, limit?: string): unknown;
    getAccountBalance(req: any): unknown;
}
