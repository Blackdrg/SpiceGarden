import { CustomerSupportService } from './customer-support.service';
import { TicketRoutingService } from './ticket-routing.service';
import { DisputeType, DisputeStatus } from '../../db/entities/dispute.entity';
import { RefundType } from '../../db/entities/refund.entity';
export declare class SupportController {
    private supportService;
    private routingService;
    constructor(supportService: CustomerSupportService, routingService: TicketRoutingService);
    raiseDispute(body: {
        orderId: string;
        customerId: string;
        type: DisputeType;
        description: string;
    }): unknown;
    getDisputes(query: {
        status?: DisputeStatus;
        customerId?: string;
        restaurantId?: string;
        driverId?: string;
    }): unknown;
    reviewDispute(id: string, body: {
        reviewerId: string;
        status: DisputeStatus;
        notes?: string;
    }): unknown;
    requestRefund(body: {
        orderId: string;
        requestedBy: string;
        type: RefundType;
        amount: number;
        reason: string;
    }): unknown;
    processRefund(id: string, body: {
        processedBy: string;
        paymentReference?: string;
    }): unknown;
    getQueueStats(): unknown;
    routeTicket(id: string): unknown;
    escalateTicket(id: string, body: {
        level?: number;
    }): unknown;
}
