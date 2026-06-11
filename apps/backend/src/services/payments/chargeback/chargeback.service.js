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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargebackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
let ChargebackService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ChargebackService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ChargebackService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        disputeRepo;
        orderRepo;
        userRepo;
        notificationService;
        productionNotification;
        logger = new common_1.Logger(ChargebackService.name);
        stripe;
        constructor(configService, disputeRepo, orderRepo, userRepo, notificationService, productionNotification) {
            this.configService = configService;
            this.disputeRepo = disputeRepo;
            this.orderRepo = orderRepo;
            this.userRepo = userRepo;
            this.notificationService = notificationService;
            this.productionNotification = productionNotification;
            this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
                apiVersion: '2024-04-10',
            });
        }
        async handleDisputeCreated(event) {
            try {
                const dispute = event.data.object;
                const charge = await this.stripe.charges.retrieve(typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id);
                const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
                const order = paymentIntentId ? await this.orderRepo.findOne({
                    where: { paymentIntentId: paymentIntentId }
                }) : null;
                if (!order) {
                    this.logger.warn(`Order not found for payment intent ${paymentIntentId || 'unknown'}`);
                }
                const existingDispute = await this.disputeRepo.findOne({
                    where: { disputeId: dispute.id }
                });
                if (existingDispute) {
                    this.logger.warn(`Dispute ${dispute.id} already exists in our system`);
                    return existingDispute;
                }
                const paymentDispute = this.disputeRepo.create({
                    disputeId: dispute.id,
                    orderId: order ? order.id : null,
                    order: order,
                    disputeType: dispute.reason,
                    disputedAmount: dispute.amount / 100,
                    currency: dispute.currency,
                    reason: dispute.reason,
                    evidence: dispute.evidence || {},
                    status: this.mapStripeDisputeStatus(dispute.status),
                });
                const savedDispute = await this.disputeRepo.save(paymentDispute);
                if (order) {
                    await this.productionNotification.sendPaymentNotification(order.userId, dispute.id, {
                        type: 'fraud_detected',
                        severity: 'high',
                        orderId: order.id,
                        amount: dispute.amount / 100,
                        message: `Chargeback received for amount ${(dispute.amount / 100).toFixed(2)}. Reason: ${dispute.reason}`,
                        metadata: {
                            disputeId: dispute.id,
                            stripeDisputeReason: dispute.reason,
                        }
                    });
                }
                this.logger.log(`Created dispute record for Stripe dispute ${dispute.id}`);
                return savedDispute;
            }
            catch (error) {
                this.logger.error(`Failed to handle dispute created:`, error);
                throw new common_1.InternalServerErrorException('Failed to process dispute');
            }
        }
        async handleDisputeClosed(event) {
            try {
                const dispute = event.data.object;
                const paymentDispute = await this.disputeRepo.findOne({
                    where: { disputeId: dispute.id }
                });
                if (!paymentDispute) {
                    this.logger.warn(`Dispute ${dispute.id} not found in our system`);
                    throw new common_1.NotFoundException(`Dispute ${dispute.id} not found`);
                }
                paymentDispute.status = this.mapStripeDisputeStatus(dispute.status);
                paymentDispute.chargedBackAmount = dispute.chargeback_amount ? dispute.chargeback_amount / 100 : null;
                paymentDispute.chargedBackAt = dispute.chargeback_at ? new Date(dispute.chargeback_at * 1000) : null;
                if (dispute.status === 'won' && paymentDispute.isRefundedToCustomer === false) {
                    this.logger.log(`Dispute ${dispute.id} was won, considering customer refund`);
                }
                const updatedDispute = await this.disputeRepo.save(paymentDispute);
                const order = paymentDispute.orderId ?
                    await this.orderRepo.findOne({ where: { id: paymentDispute.orderId } }) :
                    null;
                if (order) {
                    await this.productionNotification.sendPaymentNotification(order.userId, `chargeback-resolution-${dispute.id}`, {
                        type: dispute.status === 'won' ? 'payment_success' : 'payment_failure',
                        severity: dispute.status === 'won' ? 'medium' : 'high',
                        orderId: order.id,
                        amount: paymentDispute.disputedAmount,
                        message: `Chargeback ${dispute.id}: ${dispute.status}`,
                        metadata: {
                            disputeId: dispute.id,
                            stripeDisputeStatus: dispute.status,
                            chargedBackAmount: paymentDispute.chargedBackAmount
                        }
                    });
                }
                this.logger.log(`Updated dispute record for Stripe dispute ${dispute.id} with status ${dispute.status}`);
                return updatedDispute;
            }
            catch (error) {
                this.logger.error(`Failed to handle dispute closed:`, error);
                throw new common_1.InternalServerErrorException('Failed to process dispute closure');
            }
        }
        async getDisputeById(disputeId) {
            const dispute = await this.disputeRepo.findOne({
                where: { disputeId: disputeId },
                relations: ['order']
            });
            if (!dispute) {
                throw new common_1.NotFoundException(`Dispute ${disputeId} not found`);
            }
            return dispute;
        }
        async getDisputesForOrder(orderId) {
            return await this.disputeRepo.find({
                where: { orderId: orderId },
                order: { createdAt: 'DESC' }
            });
        }
        async getDisputesByStatus(status) {
            return await this.disputeRepo.find({
                where: { status: status },
                order: { createdAt: 'DESC' }
            });
        }
        mapStripeDisputeStatus(stripeStatus) {
            switch (stripeStatus) {
                case 'warning':
                    return 'warning';
                case 'needs_response':
                    return 'needs_response';
                case 'under_review':
                    return 'under_review';
                case 'won':
                    return 'won';
                case 'lost':
                    return 'lost';
                default:
                    return 'under_review';
            }
        }
        async getDisputeStats(startDate, endDate) {
            const where = {};
            if (startDate && endDate) {
                where.createdAt = (0, typeorm_1.MoreThanOrEqual)(startDate);
                if (endDate) {
                    where.createdAt = (0, typeorm_1.LessThanOrEqual)(endDate);
                }
            }
            const [totalDisputes, wonDisputes, lostDisputes, underReviewDisputes, needsResponseDisputes, warningDisputes, totalDisputedAmount, totalChargedBackAmount] = await Promise.all([
                this.disputeRepo.count({ where }),
                this.disputeRepo.count({ where: { ...where, status: 'won' } }),
                this.disputeRepo.count({ where: { ...where, status: 'lost' } }),
                this.disputeRepo.count({ where: { ...where, status: 'under_review' } }),
                this.disputeRepo.count({ where: { ...where, status: 'needs_response' } }),
                this.disputeRepo.count({ where: { ...where, status: 'warning' } }),
                this.disputeRepo
                    .createQueryBuilder('dispute')
                    .select('SUM(dispute.disputedAmount)', 'total')
                    .where(where)
                    .getRawOne(),
                this.disputeRepo
                    .createQueryBuilder('dispute')
                    .select('SUM(dispute.chargedBackAmount)', 'total')
                    .where({ ...where, chargedBackAmount: (0, typeorm_1.MoreThanOrEqual)(0) })
                    .getRawOne(),
            ]);
            return {
                totalDisputes,
                wonDisputes,
                lostDisputes,
                underReviewDisputes,
                needsResponseDisputes,
                warningDisputes,
                winRate: totalDisputes > 0 ? (wonDisputes / totalDisputes) * 100 : 0,
                totalDisputedAmount: totalDisputedAmount?.total || 0,
                totalChargedBackAmount: totalChargedBackAmount?.total || 0,
                netLoss: (totalChargedBackAmount?.total || 0) - (totalDisputedAmount?.total || 0)
            };
        }
    };
    return ChargebackService = _classThis;
})();
exports.ChargebackService = ChargebackService;
