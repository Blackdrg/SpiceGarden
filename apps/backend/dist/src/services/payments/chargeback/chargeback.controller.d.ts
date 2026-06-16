import { ChargebackService } from './chargeback.service';
export declare class ChargebackController {
    private readonly chargebackService;
    constructor(chargebackService: ChargebackService);
    getDisputeById(disputeId: string): unknown;
    getDisputesForOrder(orderId: string): unknown;
    getDisputes(status?: string, startDate?: string, endDate?: string): unknown;
    getDisputeStatsOverview(startDate?: string, endDate?: string): unknown;
}
