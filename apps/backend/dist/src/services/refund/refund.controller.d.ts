import { RefundService } from './refund.service';
export declare class RefundController {
    private readonly refundService;
    constructor(refundService: RefundService);
    createRefundRequest(body: any): unknown;
    approveRefundRequest(approvalId: string, body: any): unknown;
    rejectRefundRequest(approvalId: string, body: any): unknown;
    processRefund(approvalId: string, body: any): unknown;
    getRefundRequest(approvalId: string): unknown;
    getRefundRequestsForOrder(orderId: string): unknown;
    getRefundRequestsByStatus(status?: string): unknown;
}
