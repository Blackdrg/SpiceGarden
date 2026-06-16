import { GSTService } from './gst.service';
export declare class GSTController {
    private readonly gstService;
    constructor(gstService: GSTService);
    calculateGST(orderId: string): unknown;
    generateGSTInvoice(orderId: string): unknown;
    getGSTRateSummary(orderId: string): unknown;
    validateGSTIN(gstin: string): {
        valid: boolean;
    };
}
