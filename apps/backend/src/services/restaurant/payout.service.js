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
exports.PayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const payout_report_entity_1 = require("../../db/entities/payout-report.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
let PayoutService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PayoutService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PayoutService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        payoutRepo;
        orderRepo;
        restaurantRepo;
        commissionRepo;
        gstRepo;
        dataSource;
        logger = new common_1.Logger(PayoutService.name);
        constructor(payoutRepo, orderRepo, restaurantRepo, commissionRepo, gstRepo, dataSource) {
            this.payoutRepo = payoutRepo;
            this.orderRepo = orderRepo;
            this.restaurantRepo = restaurantRepo;
            this.commissionRepo = commissionRepo;
            this.gstRepo = gstRepo;
            this.dataSource = dataSource;
        }
        async generatePayoutReport(restaurantId, periodStart, periodEnd) {
            const orders = await this.orderRepo.find({
                where: {
                    restaurantId: restaurantId,
                    status: order_interface_1.OrderStatus.DELIVERED,
                    createdAt: (0, typeorm_1.Between)(periodStart, periodEnd),
                },
                relations: ['gstDetail'],
            });
            const grossSales = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
            const commissionRules = await this.commissionRepo.find({
                where: {
                    restaurantId: restaurantId,
                    status: 'active',
                },
            });
            let platformCommission = grossSales * 0.15;
            if (commissionRules.length > 0) {
                const applicableRule = commissionRules[0];
                if (applicableRule.type === 'percentage') {
                    platformCommission = grossSales * (Number(applicableRule.value) / 100);
                }
                else {
                    platformCommission = Number(applicableRule.value) * orders.length;
                }
            }
            const gstAmount = orders.reduce((sum, o) => sum + Number(o.gstDetail?.totalGstAmount || 0), 0);
            const netPayout = grossSales - platformCommission - gstAmount;
            const payout = this.payoutRepo.create({
                restaurantId,
                periodStart,
                periodEnd,
                grossSales,
                platformCommission,
                gstAmount,
                cancellationFees: 0,
                incentives: 0,
                penalties: 0,
                netPayout,
                status: payout_report_entity_1.PayoutStatus.PENDING,
                orderBreakdown: {
                    totalOrders: orders.length,
                    completedOrders: orders.filter(o => o.status === order_interface_1.OrderStatus.DELIVERED).length,
                    cancelledOrders: orders.filter(o => o.status === order_interface_1.OrderStatus.CANCELLED).length,
                    refundedOrders: orders.filter(o => o.paymentStatus === order_interface_1.PaymentStatus.REFUNDED).length,
                },
                paymentBreakdown: {
                    onlinePayments: orders.filter(o => o.paymentStatus === order_interface_1.PaymentStatus.COMPLETED).length,
                    codPayments: 0,
                    walletPayments: 0,
                },
            });
            return this.payoutRepo.save(payout);
        }
        async getPayoutHistory(restaurantId, limit = 10) {
            return this.payoutRepo.find({
                where: { restaurantId: restaurantId },
                order: { createdAt: 'DESC' },
                take: limit,
            });
        }
        async processPayout(payoutId, reference) {
            const payout = await this.payoutRepo.findOne({ where: { id: payoutId } });
            if (!payout) {
                throw new Error('Payout not found');
            }
            await this.payoutRepo.update(payoutId, {
                status: payout_report_entity_1.PayoutStatus.PROCESSING,
                payoutReference: reference,
                payoutDate: new Date(),
            });
            return this.payoutRepo.findOne({ where: { id: payoutId } });
        }
        async getPendingPayouts(restaurantId) {
            const where = { status: payout_report_entity_1.PayoutStatus.PENDING };
            if (restaurantId) {
                where.restaurantId = restaurantId;
            }
            return this.payoutRepo.find({
                where,
                relations: ['restaurant'],
                order: { createdAt: 'ASC' },
            });
        }
        async getPayoutSummary(restaurantId, month, year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const payouts = await this.payoutRepo.find({
                where: {
                    restaurantId: restaurantId,
                    periodStart: (0, typeorm_1.Between)(startDate, endDate),
                },
            });
            return {
                totalGrossSales: payouts.reduce((sum, p) => sum + Number(p.grossSales), 0),
                totalCommission: payouts.reduce((sum, p) => sum + Number(p.platformCommission), 0),
                totalGST: payouts.reduce((sum, p) => sum + Number(p.gstAmount), 0),
                totalNetPayout: payouts.reduce((sum, p) => sum + Number(p.netPayout), 0),
                pendingPayouts: payouts.filter(p => p.status === payout_report_entity_1.PayoutStatus.PENDING).length,
                paidPayouts: payouts.filter(p => p.status === payout_report_entity_1.PayoutStatus.PAID).length,
            };
        }
    };
    return PayoutService = _classThis;
})();
exports.PayoutService = PayoutService;
