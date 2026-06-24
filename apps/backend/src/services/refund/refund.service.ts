
import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { RefundEntity, RefundStatus, RefundType } from '../../db/entities/refund.entity';
import { RefundApprovalEntity } from '../../db/entities/refund-approval.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { PaymentStatus } from '../../shared/domain/order.interface';
import { UserEntity } from '../../db/entities/user.entity';
import { PaymentService } from '../payments/payments.service';
import { NotificationService } from '../../services/notifications/notification.service';
import { LedgerService } from '../../modules/ledger/ledger.service';
import { ProductionNotificationService } from '../../services/notifications/production-notification.service';
import { ConfigService } from '@nestjs/config';

export enum RefundRequestType {
  CUSTOMER_REQUEST = 'customer_request',
  AGENT_INITIATED = 'agent_initiated',
  POLICY_EXCEPTION = 'policy_exception',
  DISPUTE_RESOLUTION = 'dispute_resolution',
}

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    @InjectRepository(RefundEntity)
    private readonly refundRepo: Repository<RefundEntity>,
    @InjectRepository(RefundApprovalEntity)
    private readonly refundApprovalRepo: Repository<RefundApprovalEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
    private readonly ledgerService: LedgerService,
    private readonly productionNotification: ProductionNotificationService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a refund request (requires approval)
   */
  async createRefundRequest(
    orderId: string,
    requestedBy: string,
    amount: number,
    reason: string,
    requestType: RefundRequestType = RefundRequestType.CUSTOMER_REQUEST
  ): Promise<RefundApprovalEntity> {
     // Validate order exists
     const order = await this.orderRepo.findOne({ where: { id: orderId } });
     if (!order) {
       throw new NotFoundException(`Order not found: ${orderId}`);
     }

     // Validate user exists (if requestedBy is a user ID)
     const user = await this.userRepo.findOne({ where: { id: requestedBy } });
     if (!user && requestedBy !== 'system') {
       throw new NotFoundException(`User not found: ${requestedBy}`);
     }

     // Check if order is eligible for refund
     if (!this.isRefundEligible(order)) {
       throw new BadRequestException('Order is not eligible for refund');
     }

     // Check if order already refunded
     if (order.paymentStatus === 'refunded') {
       throw new BadRequestException('Order has already been refunded');
     }

      // Check if there's already a pending approval for this order
      const existingApproval = await this.refundApprovalRepo.findOne({
        where: { order: { id: orderId }, approvalStatus: 'pending' }
      });
     if (existingApproval) {
       throw new BadRequestException('There is already a pending refund request for this order');
     }

    // Determine if manager approval is required based on amount
    const managerApprovalThreshold = this.configService.get<number>('REFUND_MANAGER_APPROVAL_THRESHOLD', 1000);
    const requiresManagerApproval = amount >= managerApprovalThreshold;

       // Create refund approval request
       const refundApproval = this.refundApprovalRepo.create({
         order,
         refundAmount: amount,
         currency: 'USD',
         reason,
         requestedBy,
         requestType,
         approvalStatus: 'pending',
         requiresManagerApproval
       });

    const savedApproval = await this.refundApprovalRepo.save(refundApproval);

     this.logger.log(`Created refund request for order ${orderId}`);

    // Notify relevant parties about the refund request
    await this.notifyRefundRequest(savedApproval);

    return savedApproval;
  }

   /**
    * Approve a refund request
    */
   async approveRefundRequest(
     approvalId: string,
     approverId: string,
     notes?: string
   ): Promise<RefundApprovalEntity> {
     // Find the approval request
     const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
     if (!approval) {
       throw new NotFoundException(`Refund approval not found: ${approvalId}`);
     }

     // Validate approver exists
     const approver = await this.userRepo.findOne({ where: { id: approverId } });
     if (!approver) {
       throw new NotFoundException(`Approver not found: ${approverId}`);
     }

     // Check if already processed
     if (approval.approvalStatus !== 'pending') {
       throw new BadRequestException(`Refund request is already ${approval.approvalStatus}`);
     }

     // Check if manager approval is required and if approver is a manager
    if (approval.requiresManagerApproval) {
      // In a real system, we would check if the approver has manager role
      // For now, we'll just note that manager approval was given
    }

    // Update approval
    approval.approvalStatus = 'approved';
    approval.approverId = approverId;
    approval.approvedAt = new Date();
    approval.approvalNotes = notes;

     const savedApproval = await this.refundApprovalRepo.save(approval);

     this.logger.log(`Approved refund request by ${approverId}`);

     // Notify about approval
    await this.notifyRefundApproval(savedApproval);

    return savedApproval;
  }

   /**
    * Reject a refund request
    */
   async rejectRefundRequest(
     approvalId: string,
     approverId: string,
     reason: string
   ): Promise<RefundApprovalEntity> {
     // Find the approval request
     const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
     if (!approval) {
       throw new NotFoundException(`Refund approval not found: ${approvalId}`);
     }

     // Validate approver exists
     const approver = await this.userRepo.findOne({ where: { id: approverId } });
     if (!approver) {
       throw new NotFoundException(`Approver not found: ${approverId}`);
     }

     // Check if already processed
     if (approval.approvalStatus !== 'pending') {
       throw new BadRequestException(`Refund request is already ${approval.approvalStatus}`);
     }

     // Update approval
     approval.approvalStatus = 'rejected';
     approval.approverId = approverId;
     approval.approvedAt = new Date();
     approval.rejectionReason = reason;

    const savedApproval = await this.refundApprovalRepo.save(approval);

     this.logger.log(`Rejected refund request by ${approverId}`);

     // Notify about rejection
    await this.notifyRefundRejection(savedApproval);

    return savedApproval;
  }

  /**
   * Process an approved refund (actually process the payment refund)
   */
  async processRefund(
    approvalId: string,
    processedBy: string,
    gatewayName?: string
  ): Promise<{ refund: RefundEntity; approval: RefundApprovalEntity }> {
    // Find the approval request
     const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
     if (!approval) {
       throw new NotFoundException(`Refund approval not found: ${approvalId}`);
     }

     // Validate processor exists
     const processor = await this.userRepo.findOne({ where: { id: processedBy } });
     if (!processor) {
       throw new NotFoundException(`Processor not found: ${processedBy}`);
     }

        // Check if already processed
        if (approval.approvalStatus === 'processed') {
          throw new BadRequestException('Refund request has already been processed');
        }

        // Check if approved
        if (approval.approvalStatus !== 'approved') {
          throw new BadRequestException(`Refund request is not approved (current status: ${approval.approvalStatus})`);
        }

      // Get the order
      const order = await this.orderRepo.findOne({ where: { id: approval.order.id } });
      if (!order) {
        throw new NotFoundException(`Order not found: ${approval.order.id}`);
      }

     // Check if order already refunded
     if (order.paymentStatus === 'refunded') {
       throw new BadRequestException('Order has already been refunded');
     }

     try {
       // Process the refund through the payment service
       const paymentRefund = await this.paymentService.refundPayment(
         order.paymentIntentId || '', // We would need to store this on the order
         approval.refundAmount,
         order.userId,
         approval.reason,
         undefined, // request object
         gatewayName
       );

         // Create refund record
         const requester = await this.userRepo.findOne({ where: { id: approval.requestedBy } });
         if (!requester && approval.requestedBy !== 'system') {
           throw new NotFoundException(`User not found: ${approval.requestedBy}`);
         }
         const refund = this.refundRepo.create({
           orderId: order.id,
           requestedBy: approval.requestedBy,
           requester: requester!,
            type: this.mapRequestTypeToRefundType(approval.requestType as RefundRequestType) as RefundType,
           amount: approval.refundAmount,
           status: RefundStatus.PROCESSED,
           reason: approval.reason,
           approvalNotes: approval.approvalNotes,
           approvedBy: approval.approverId,
           approvedAt: approval.approvedAt,
           processedBy: processedBy,
           processedAt: new Date(),
           paymentReference: paymentRefund.id,
           evidence: {}
         });
         const savedRefund = await this.refundRepo.save(refund);

       // Update approval as processed
       approval.approvalStatus = 'processed';
       approval.processedBy = processedBy;
       approval.processedAt = new Date();
       await this.refundApprovalRepo.save(approval);

        // Update order payment status
        order.paymentStatus = PaymentStatus.REFUNDED;
        order.updatedAt = new Date();
        await this.orderRepo.save(order);

       // Create ledger entry for the refund
       try {
         await this.ledgerService.createTransaction(
           paymentRefund.id, // transactionId
           'refund', // debitAccount (increase liability)
           'cash', // creditAccount (decrease asset)
           paymentRefund.amount / 100, // amount
            'USD', // currency
           'refund', // type
           paymentRefund.id, // referenceId
           `Refund processed for order ${order.id}, reason: ${approval.reason}`
         );
       } catch (ledgerError) {
         this.logger.error('Failed to create ledger entry for refund:', ledgerError);
       }

       // Notify about refund completion
       await this.notifyRefundProcessed(savedRefund, order);

       this.logger.log(`Processed refund for order ${order.id}`);

       return { refund: savedRefund, approval };
     } catch (error) {
       // Mark approval as failed
       approval.approvalStatus = 'failed';
       await this.refundApprovalRepo.save(approval);

       this.logger.error(`Failed to process refund for approval ${approval.id}:`, error);
       throw new InternalServerErrorException('Refund processing failed');
     }
  }

   /**
    * Get refund request by ID
    */
   async getRefundRequest(approvalId: string): Promise<RefundApprovalEntity> {
const approval = await this.refundApprovalRepo.findOne({ 
        where: { id: approvalId },
        relations: { order: true }
      });
     if (!approval) {
       throw new NotFoundException(`Refund approval not found: ${approvalId}`);
     }
     return approval;
   }

   /**
    * Get refund requests for an order
    */
   async getRefundRequestsForOrder(orderId: string): Promise<RefundApprovalEntity[]> {
return await this.refundApprovalRepo.find({
        where: { order: { id: orderId } },
        relations: {},
        order: { createdAt: 'DESC' }
      });
   }

   /**
    * Get refund requests by status
    */
   async getRefundRequestsByStatus(status: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed'): Promise<RefundApprovalEntity[]> {
return await this.refundApprovalRepo.find({
        where: { approvalStatus: status },
        relations: { order: true },
        order: { createdAt: 'DESC' }
      });
   }

  /**
   * Check if order is eligible for refund
   */
  private isRefundEligible(order: OrderEntity): boolean {
    const refundEligibleStatuses = [
      'delivered',
      'on_the_way',
      'ready',
      'preparing'
    ];
    return refundEligibleStatuses.includes(order.status);
  }

  /**
   * Map request type to refund type
   */
  private mapRequestTypeToRefundType(requestType: RefundRequestType): string {
    switch (requestType) {
      case RefundRequestType.CUSTOMER_REQUEST:
        return 'customer_refund';
      case RefundRequestType.AGENT_INITIATED:
        return 'restaurant_penalty'; // or could be customer_refund depending on context
      case RefundRequestType.POLICY_EXCEPTION:
        return 'customer_refund';
      case RefundRequestType.DISPUTE_RESOLUTION:
        return 'customer_refund';
      default:
        return 'customer_refund';
    }
  }

  /**
   * Notify about refund request
   */
  private async notifyRefundRequest(approval: RefundApprovalEntity): Promise<void> {
    // Notify admins/managers about new refund request
    try {
        await this.productionNotification.sendPaymentNotification(
          'system',
          approval.order.paymentIntentId || `refund-request-${approval.id}`,
          {
           type: 'refund_initiated',
           severity: 'medium',
           orderId: approval.order.id,
           amount: approval.refundAmount,
           message: `New refund request of ${approval.refundAmount} for order #${approval.order.id}. Reason: ${approval.reason}`,
           metadata: {
             approvalId: approval.id,
             requestedBy: approval.requestedBy,
             requestType: approval.requestType,
             requiresManagerApproval: approval.requiresManagerApproval
           }
         }
       );
    } catch (error) {
      this.logger.error('Failed to send refund request notification:', error);
    }
  }

    private async notifyRefundApproval(approval: RefundApprovalEntity): Promise<void> {
      // Notify relevant parties about refund approval
      try {
         await this.productionNotification.sendPaymentNotification(
           'system',
           approval.order.paymentIntentId || `refund-approval-${approval.id}`,
           {
            type: 'refund_initiated',
            severity: 'medium',
            orderId: approval.order.id,
            amount: approval.refundAmount,
            message: `Refund request approved for ${approval.refundAmount} for order #${approval.order.id}`,
            metadata: {
              approvalId: approval.id,
              approverId: approval.approverId
            }
          }
        );
      } catch (error) {
        this.logger.error('Failed to send refund approval notification:', error);
      }
    }

    private async notifyRefundRejection(approval: RefundApprovalEntity): Promise<void> {
      // Notify customer about refund rejection
      try {
        await this.productionNotification.sendPaymentNotification(
          approval.requestedBy,
          approval.order.paymentIntentId || `refund-rejection-${approval.id}`,
          {
            type: 'refund_initiated',
            severity: 'medium',
            orderId: approval.order.id,
            amount: 0,
            message: `Your refund request for order #${approval.order.id} has been rejected. Reason: ${approval.rejectionReason}`,
            metadata: {
              approvalId: approval.id,
              rejectionReason: approval.rejectionReason
            }
          }
        );
      } catch (error) {
        this.logger.error('Failed to send refund rejection notification:', error);
      }
    }

   /**
    * Notify about refund processed
    */
   private async notifyRefundProcessed(refund: RefundEntity, order: OrderEntity): Promise<void> {
      // Notify customer about refund completion
      try {
        await this.productionNotification.sendPaymentNotification(
          order.userId,
          refund.paymentReference,
          {
            type: 'refund_completed',
            severity: 'low',
            orderId: order.id,
            amount: refund.amount,
            message: `Your refund of ${refund.amount} for order #${order.id} has been processed.`,
            metadata: {
              refundId: refund.id,
              paymentReference: refund.paymentReference
            }
          }
        );
      } catch (error) {
        this.logger.error('Failed to send refund processed notification:', error);
      }
    }
}

