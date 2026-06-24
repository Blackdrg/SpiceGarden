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
    }): Promise<import("../../db/entities/dispute.entity").DisputeEntity>;
    getDisputes(query: {
        status?: DisputeStatus;
        customerId?: string;
        restaurantId?: string;
        driverId?: string;
    }): Promise<import("../../db/entities/dispute.entity").DisputeEntity[]>;
    reviewDispute(id: string, body: {
        reviewerId: string;
        status: DisputeStatus;
        notes?: string;
    }): Promise<import("../../db/entities/dispute.entity").DisputeEntity>;
    requestRefund(body: {
        orderId: string;
        requestedBy: string;
        type: RefundType;
        amount: number;
        reason: string;
    }): Promise<import("../../db/entities/refund.entity").RefundEntity>;
    processRefund(id: string, body: {
        processedBy: string;
        paymentReference?: string;
    }): Promise<import("../../db/entities/refund.entity").RefundEntity>;
    getQueueStats(): Promise<any>;
    routeTicket(id: string): Promise<import("../../db/entities/support-ticket.entity").SupportTicketEntity>;
    escalateTicket(id: string, body: {
        level?: number;
    }): Promise<import("../../db/entities/support-ticket.entity").SupportTicketEntity>;
}
