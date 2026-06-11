"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundService = exports.RefundRequestType = void 0;
const common_1 = require("@nestjs/common");
const refund_entity_1 = require("../../db/entities/refund.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
var RefundRequestType;
(function (RefundRequestType) {
    RefundRequestType["CUSTOMER_REQUEST"] = "customer_request";
    RefundRequestType["AGENT_INITIATED"] = "agent_initiated";
    RefundRequestType["POLICY_EXCEPTION"] = "policy_exception";
    RefundRequestType["DISPUTE_RESOLUTION"] = "dispute_resolution";
})(RefundRequestType || (exports.RefundRequestType = RefundRequestType = {}));
let RefundService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RefundService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RefundService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        refundRepo;
        refundApprovalRepo;
        orderRepo;
        userRepo;
        paymentService;
        notificationService;
        ledgerService;
        productionNotification;
        configService;
        logger = new common_1.Logger(RefundService.name);
        constructor(refundRepo, refundApprovalRepo, orderRepo, userRepo, paymentService, notificationService, ledgerService, productionNotification, configService) {
            this.refundRepo = refundRepo;
            this.refundApprovalRepo = refundApprovalRepo;
            this.orderRepo = orderRepo;
            this.userRepo = userRepo;
            this.paymentService = paymentService;
            this.notificationService = notificationService;
            this.ledgerService = ledgerService;
            this.productionNotification = productionNotification;
            this.configService = configService;
        }
        /**
         * Create a refund request (requires approval)
         */
        async createRefundRequest(orderId, requestedBy, amount, reason, requestType = RefundRequestType.CUSTOMER_REQUEST) {
            // Validate order exists
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException(`Order not found: ${orderId}`);
            }
            // Validate user exists (if requestedBy is a user ID)
            const user = await this.userRepo.findOne({ where: { id: requestedBy } });
            if (!user && requestedBy !== 'system') {
                throw new common_1.NotFoundException(`User not found: ${requestedBy}`);
            }
            // Check if order is eligible for refund
            if (!this.isRefundEligible(order)) {
                throw new common_1.BadRequestException('Order is not eligible for refund');
            }
            // Check if order already refunded
            if (order.paymentStatus === 'refunded') {
                throw new common_1.BadRequestException('Order has already been refunded');
            }
            // Check if there's already a pending approval for this order
            const existingApproval = await this.refundApprovalRepo.findOne({
                where: { order: { id: orderId }, approvalStatus: 'pending' }
            });
            if (existingApproval) {
                throw new common_1.BadRequestException('There is already a pending refund request for this order');
            }
            // Determine if manager approval is required based on amount
            const managerApprovalThreshold = this.configService.get('REFUND_MANAGER_APPROVAL_THRESHOLD', 1000);
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
        async approveRefundRequest(approvalId, approverId, notes) {
            // Find the approval request
            const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
            if (!approval) {
                throw new common_1.NotFoundException(`Refund approval not found: ${approvalId}`);
            }
            // Validate approver exists
            const approver = await this.userRepo.findOne({ where: { id: approverId } });
            if (!approver) {
                throw new common_1.NotFoundException(`Approver not found: ${approverId}`);
            }
            // Check if already processed
            if (approval.approvalStatus !== 'pending') {
                throw new common_1.BadRequestException(`Refund request is already ${approval.approvalStatus}`);
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
        async rejectRefundRequest(approvalId, approverId, reason) {
            // Find the approval request
            const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
            if (!approval) {
                throw new common_1.NotFoundException(`Refund approval not found: ${approvalId}`);
            }
            // Validate approver exists
            const approver = await this.userRepo.findOne({ where: { id: approverId } });
            if (!approver) {
                throw new common_1.NotFoundException(`Approver not found: ${approverId}`);
            }
            // Check if already processed
            if (approval.approvalStatus !== 'pending') {
                throw new common_1.BadRequestException(`Refund request is already ${approval.approvalStatus}`);
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
        async processRefund(approvalId, processedBy, gatewayName) {
            // Find the approval request
            const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
            if (!approval) {
                throw new common_1.NotFoundException(`Refund approval not found: ${approvalId}`);
            }
            // Validate processor exists
            const processor = await this.userRepo.findOne({ where: { id: processedBy } });
            if (!processor) {
                throw new common_1.NotFoundException(`Processor not found: ${processedBy}`);
            }
            // Check if already processed
            if (approval.approvalStatus === 'processed') {
                throw new common_1.BadRequestException('Refund request has already been processed');
            }
            // Check if approved
            if (approval.approvalStatus !== 'approved') {
                throw new common_1.BadRequestException(`Refund request is not approved (current status: ${approval.approvalStatus})`);
            }
            // Get the order
            const order = await this.orderRepo.findOne({ where: { id: approval.order.id } });
            if (!order) {
                throw new common_1.NotFoundException(`Order not found: ${approval.order.id}`);
            }
            // Check if order already refunded
            if (order.paymentStatus === 'refunded') {
                throw new common_1.BadRequestException('Order has already been refunded');
            }
            try {
                // Process the refund through the payment service
                const paymentRefund = await this.paymentService.refundPayment(order.paymentIntentId || '', // We would need to store this on the order
                approval.refundAmount, order.userId, approval.reason, undefined, // request object
                gatewayName);
                // Create refund record
                const requester = await this.userRepo.findOne({ where: { id: approval.requestedBy } });
                if (!requester && approval.requestedBy !== 'system') {
                    throw new common_1.NotFoundException(`User not found: ${approval.requestedBy}`);
                }
                const refund = this.refundRepo.create({
                    orderId: order.id,
                    requestedBy: approval.requestedBy,
                    requester: requester,
                    type: this.mapRequestTypeToRefundType(approval.requestType),
                    amount: approval.refundAmount,
                    status: refund_entity_1.RefundStatus.PROCESSED,
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
                order.paymentStatus = order_interface_1.PaymentStatus.REFUNDED;
                order.updatedAt = new Date();
                await this.orderRepo.save(order);
                // Create ledger entry for the refund
                try {
                    await this.ledgerService.createTransaction(paymentRefund.id, // transactionId
                    'refund', // debitAccount (increase liability)
                    'cash', // creditAccount (decrease asset)
                    paymentRefund.amount / 100, // amount
                    'USD', // currency
                    'refund', // type
                    paymentRefund.id, // referenceId
                    `Refund processed for order ${order.id}, reason: ${approval.reason}`);
                }
                catch (ledgerError) {
                    this.logger.error('Failed to create ledger entry for refund:', ledgerError);
                }
                // Notify about refund completion
                await this.notifyRefundProcessed(savedRefund, order);
                this.logger.log(`Processed refund for order ${order.id}`);
                return { refund: savedRefund, approval };
            }
            catch (error) {
                // Mark approval as failed
                approval.approvalStatus = 'failed';
                await this.refundApprovalRepo.save(approval);
                this.logger.error(`Failed to process refund for approval ${approval.id}:`, error);
                throw new common_1.InternalServerErrorException('Refund processing failed');
            }
        }
        /**
         * Get refund request by ID
         */
        async getRefundRequest(approvalId) {
            const approval = await this.refundApprovalRepo.findOne({
                where: { id: approvalId },
                relations: ['order', 'requester', 'approver']
            });
            if (!approval) {
                throw new common_1.NotFoundException(`Refund approval not found: ${approvalId}`);
            }
            return approval;
        }
        /**
         * Get refund requests for an order
         */
        async getRefundRequestsForOrder(orderId) {
            return await this.refundApprovalRepo.find({
                where: { order: { id: orderId } },
                relations: ['requester', 'approver'],
                order: { createdAt: 'DESC' }
            });
        }
        /**
         * Get refund requests by status
         */
        async getRefundRequestsByStatus(status) {
            return await this.refundApprovalRepo.find({
                where: { approvalStatus: status },
                relations: ['order', 'requester', 'approver'],
                order: { createdAt: 'DESC' }
            });
        }
        /**
         * Check if order is eligible for refund
         */
        isRefundEligible(order) {
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
        mapRequestTypeToRefundType(requestType) {
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
        async notifyRefundRequest(approval) {
            // Notify admins/managers about new refund request
            try {
                await this.productionNotification.sendPaymentNotification('system', approval.order.paymentIntentId || `refund-request-${approval.id}`, {
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
                });
            }
            catch (error) {
                this.logger.error('Failed to send refund request notification:', error);
            }
        }
        async notifyRefundApproval(approval) {
            // Notify relevant parties about refund approval
            try {
                await this.productionNotification.sendPaymentNotification('system', approval.order.paymentIntentId || `refund-approval-${approval.id}`, {
                    type: 'refund_initiated',
                    severity: 'medium',
                    orderId: approval.order.id,
                    amount: approval.refundAmount,
                    message: `Refund request approved for ${approval.refundAmount} for order #${approval.order.id}`,
                    metadata: {
                        approvalId: approval.id,
                        approverId: approval.approverId
                    }
                });
            }
            catch (error) {
                this.logger.error('Failed to send refund approval notification:', error);
            }
        }
        async notifyRefundRejection(approval) {
            // Notify customer about refund rejection
            try {
                await this.productionNotification.sendPaymentNotification(approval.requestedBy, approval.order.paymentIntentId || `refund-rejection-${approval.id}`, {
                    type: 'refund_initiated',
                    severity: 'medium',
                    orderId: approval.order.id,
                    amount: 0,
                    message: `Your refund request for order #${approval.order.id} has been rejected. Reason: ${approval.rejectionReason}`,
                    metadata: {
                        approvalId: approval.id,
                        rejectionReason: approval.rejectionReason
                    }
                });
            }
            catch (error) {
                this.logger.error('Failed to send refund rejection notification:', error);
            }
        }
        /**
         * Notify about refund processed
         */
        async notifyRefundProcessed(refund, order) {
            // Notify customer about refund completion
            try {
                await this.productionNotification.sendPaymentNotification(order.userId, refund.paymentReference, {
                    type: 'refund_completed',
                    severity: 'low',
                    orderId: order.id,
                    amount: refund.amount,
                    message: `Your refund of ${refund.amount} for order #${order.id} has been processed.`,
                    metadata: {
                        refundId: refund.id,
                        paymentReference: refund.paymentReference
                    }
                });
            }
            catch (error) {
                this.logger.error('Failed to send refund processed notification:', error);
            }
        }
    };
    return RefundService = _classThis;
})();
exports.RefundService = RefundService;
