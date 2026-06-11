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
exports.CustomerSupportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const dispute_entity_1 = require("../../db/entities/dispute.entity");
const refund_entity_1 = require("../../db/entities/refund.entity");
let CustomerSupportService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CustomerSupportService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CustomerSupportService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        disputeRepo;
        refundRepo;
        orderRepo;
        walletService;
        paymentService;
        dataSource;
        logger = new common_1.Logger(CustomerSupportService.name);
        constructor(disputeRepo, refundRepo, orderRepo, walletService, paymentService, dataSource) {
            this.disputeRepo = disputeRepo;
            this.refundRepo = refundRepo;
            this.orderRepo = orderRepo;
            this.walletService = walletService;
            this.paymentService = paymentService;
            this.dataSource = dataSource;
        }
        async raiseDispute(orderId, customerId, type, description, evidence) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            const existingDispute = await this.disputeRepo.findOne({
                where: { orderId: orderId, status: dispute_entity_1.DisputeStatus.RAISED },
            });
            if (existingDispute) {
                throw new common_1.BadRequestException('Dispute already exists for this order');
            }
            const dispute = this.disputeRepo.create({
                orderId,
                customerId,
                restaurantId: order.restaurantId,
                driverId: order.driverId,
                type,
                description,
                evidence: evidence || {},
            });
            return this.disputeRepo.save(dispute);
        }
        async getDisputes(filter) {
            const where = {};
            if (filter?.status)
                where.status = filter.status;
            if (filter?.customerId)
                where.customerId = filter.customerId;
            if (filter?.restaurantId)
                where.restaurantId = filter.restaurantId;
            if (filter?.driverId)
                where.driverId = filter.driverId;
            return this.disputeRepo.find({
                where,
                order: { createdAt: 'DESC' },
            });
        }
        async reviewDispute(disputeId, reviewerId, status, notes, creditAmount) {
            const dispute = await this.disputeRepo.findOne({ where: { id: disputeId } });
            if (!dispute) {
                throw new common_1.NotFoundException('Dispute not found');
            }
            await this.disputeRepo.update(disputeId, {
                status,
                resolutionNotes: notes,
                resolvedBy: reviewerId,
                resolvedAt: new Date(),
                creditAmount: creditAmount || dispute.creditAmount,
            });
            if (status === dispute_entity_1.DisputeStatus.RESOLVED_CREDIT || status === dispute_entity_1.DisputeStatus.RESOLVED_REFUND) {
                await this.initiateRefund(disputeId, reviewerId, creditAmount || 0, status);
            }
            return this.disputeRepo.findOne({ where: { id: disputeId } });
        }
        async initiateRefund(disputeId, initiatedBy, amount, disputeStatus) {
            const dispute = await this.disputeRepo.findOne({ where: { id: disputeId } });
            const refund = this.refundRepo.create({
                orderId: dispute.orderId,
                requestedBy: initiatedBy,
                type: disputeStatus === dispute_entity_1.DisputeStatus.RESOLVED_CREDIT
                    ? refund_entity_1.RefundType.CUSTOMER_REFUND
                    : refund_entity_1.RefundType.RESTAURANT_PENALTY,
                amount,
                status: refund_entity_1.RefundStatus.PROCESSED,
                approvalNotes: `Auto-approved via dispute resolution`,
                approvedBy: initiatedBy,
                approvedAt: new Date(),
            });
            await this.refundRepo.save(refund);
        }
        async requestRefund(orderId, requestedBy, type, amount, reason, evidence) {
            const refund = this.refundRepo.create({
                orderId,
                requestedBy,
                type,
                amount,
                reason,
                evidence: evidence || {},
            });
            return this.refundRepo.save(refund);
        }
        async processRefund(refundId, processedBy, paymentReference) {
            const refund = await this.refundRepo.findOne({ where: { id: refundId } });
            if (!refund) {
                throw new common_1.NotFoundException('Refund not found');
            }
            const order = await this.orderRepo.findOne({ where: { id: refund.orderId } });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            await this.refundRepo.update(refundId, {
                status: refund_entity_1.RefundStatus.PROCESSED,
                processedBy,
                processedAt: new Date(),
                paymentReference,
            });
            await this.walletService.creditWallet(order.userId, refund.amount, `Refund for order #${order.orderNumber}: ${refund.reason}`);
            return this.refundRepo.findOne({ where: { id: refundId } });
        }
        async getRefunds(filter) {
            const where = {};
            if (filter?.status)
                where.status = filter.status;
            if (filter?.orderId)
                where.orderId = filter.orderId;
            return this.refundRepo.find({
                where,
                order: { createdAt: 'DESC' },
            });
        }
        async getDisputeStats(startDate, endDate) {
            const where = {};
            if (startDate && endDate) {
                where.createdAt = (0, typeorm_1.Between)(startDate, endDate);
            }
            const [totalDisputes, resolvedCredit, resolvedRefund, avgResolutionTime,] = await Promise.all([
                this.disputeRepo.count({ where }),
                this.disputeRepo.count({ where: { ...where, status: dispute_entity_1.DisputeStatus.RESOLVED_CREDIT } }),
                this.disputeRepo.count({ where: { ...where, status: dispute_entity_1.DisputeStatus.RESOLVED_REFUND } }),
                this.getAverageResolutionTime(where),
            ]);
            return {
                totalDisputes,
                creditDisputes: resolvedCredit,
                refundDisputes: resolvedRefund,
                avgResolutionHours: avgResolutionTime,
            };
        }
        async getAverageResolutionTime(where) {
            const result = await this.disputeRepo
                .createQueryBuilder('dispute')
                .select('AVG(TIMESTAMPDIFF(HOUR, dispute.createdAt, dispute.resolvedAt))', 'avgHours')
                .where('dispute.resolvedAt IS NOT NULL')
                .getRawOne();
            return result?.avgHours || 0;
        }
    };
    return CustomerSupportService = _classThis;
})();
exports.CustomerSupportService = CustomerSupportService;
