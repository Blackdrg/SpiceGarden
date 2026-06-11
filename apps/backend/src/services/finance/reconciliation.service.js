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
exports.ReconciliationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const payout_report_entity_1 = require("../../db/entities/payout-report.entity");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
let ReconciliationService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ReconciliationService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ReconciliationService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        orderRepo;
        transactionRepo;
        payoutRepo;
        incentiveRepo;
        gstRepo;
        dataSource;
        logger = new common_1.Logger(ReconciliationService.name);
        constructor(orderRepo, transactionRepo, payoutRepo, incentiveRepo, gstRepo, dataSource) {
            this.orderRepo = orderRepo;
            this.transactionRepo = transactionRepo;
            this.payoutRepo = payoutRepo;
            this.incentiveRepo = incentiveRepo;
            this.gstRepo = gstRepo;
            this.dataSource = dataSource;
        }
        async reconcilePayments(startDate, endDate) {
            const orders = await this.orderRepo.find({
                where: { createdAt: (0, typeorm_1.Between)(startDate, endDate) },
            });
            const transactions = await this.transactionRepo.find({
                where: { createdAt: (0, typeorm_1.Between)(startDate, endDate) },
            });
            const ordersTotal = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
            const transactionsTotal = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
            const discrepancies = [];
            for (const order of orders) {
                const relatedTxns = transactions.filter(t => t.referenceId === order.id || t.description.includes(order.id));
                const orderTotal = Number(order.grandTotal);
                const txnTotal = relatedTxns.reduce((sum, t) => sum + Number(t.amount), 0);
                if (Math.abs(orderTotal - txnTotal) > 1) {
                    discrepancies.push({
                        orderId: order.id,
                        orderNumber: order.orderNumber,
                        expected: orderTotal,
                        actual: txnTotal,
                        difference: orderTotal - txnTotal,
                    });
                }
            }
            return {
                period: { startDate, endDate },
                totalOrders: orders.length,
                totalTransactions: transactions.length,
                ordersTotal,
                transactionsTotal,
                discrepancies: discrepancies.length,
                discrepancyDetails: discrepancies.slice(0, 20),
                matchRate: discrepancies.length ? ((orders.length - discrepancies.length) / orders.length) * 100 : 100,
            };
        }
        async reconcilePayouts(restaurantId, startDate, endDate) {
            const payouts = await this.payoutRepo.find({
                where: {
                    restaurantId: restaurantId,
                    createdAt: (0, typeorm_1.Between)(startDate, endDate),
                },
            });
            const orders = await this.orderRepo.find({
                where: {
                    restaurantId: restaurantId,
                    createdAt: (0, typeorm_1.Between)(startDate, endDate),
                },
            });
            const orderTotal = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
            const payoutTotal = payouts.reduce((sum, p) => sum + Number(p.netPayout), 0);
            return {
                restaurantId,
                period: { startDate, endDate },
                orderTotal,
                payoutTotal,
                payoutsGenerated: payouts.length,
                paidPayouts: payouts.filter(p => p.status === payout_report_entity_1.PayoutStatus.PAID).length,
                pendingPayouts: payouts.filter(p => p.status === payout_report_entity_1.PayoutStatus.PENDING).length,
                variance: orderTotal - payoutTotal,
            };
        }
        async reconcileDriverPayments(driverId, startDate, endDate) {
            const incentives = await this.incentiveRepo.find({
                where: {
                    driverId: driverId,
                    createdAt: (0, typeorm_1.Between)(startDate, endDate),
                },
            });
            const pendingIncentives = incentives.filter(i => i.status === driver_incentive_entity_1.IncentiveStatus.PENDING);
            const paidIncentives = incentives.filter(i => i.status === driver_incentive_entity_1.IncentiveStatus.PAID);
            const pendingTotal = pendingIncentives.reduce((sum, i) => sum + Number(i.amount), 0);
            const paidTotal = paidIncentives.reduce((sum, i) => sum + Number(i.amount), 0);
            return {
                driverId,
                period: { startDate, endDate },
                pendingIncentivesTotal: pendingTotal,
                paidIncentivesTotal: paidTotal,
                pendingCount: pendingIncentives.length,
                paidCount: paidIncentives.length,
            };
        }
        async getGSTReconciliation(restaurantId, month, year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const orders = await this.orderRepo.find({
                where: {
                    restaurantId: restaurantId,
                    createdAt: (0, typeorm_1.Between)(startDate, endDate),
                },
                relations: ['gstDetail'],
            });
            const gstDetails = orders.filter(o => o.gstDetail).map(o => o.gstDetail);
            return {
                restaurantId,
                period: { month, year },
                totalTaxableValue: gstDetails.reduce((sum, g) => sum + Number(g.taxableValue), 0),
                totalCGST: gstDetails.reduce((sum, g) => sum + Number(g.cgstAmount), 0),
                totalSGST: gstDetails.reduce((sum, g) => sum + Number(g.sgstAmount), 0),
                totalIGST: gstDetails.reduce((sum, g) => sum + Number(g.igstAmount), 0),
                invoicesGenerated: orders.length,
            };
        }
        async runFullReconciliation(dateRange) {
            const [paymentRecon, payoutRecon] = await Promise.all([
                this.reconcilePayments(dateRange.start, dateRange.end),
                this.reconcileDriverPayments('', dateRange.start, dateRange.end),
            ]);
            return {
                paymentReconciliation: paymentRecon,
                payoutReconciliation: payoutRecon,
                overallStatus: this.calculateOverallStatus(paymentRecon, payoutRecon),
            };
        }
        calculateOverallStatus(payment, payout) {
            const paymentMatch = payment.matchRate >= 95;
            const payoutPending = payout.pendingCount === 0;
            if (paymentMatch && payoutPending)
                return 'healthy';
            if (paymentMatch)
                return 'warning';
            return 'critical';
        }
    };
    return ReconciliationService = _classThis;
})();
exports.ReconciliationService = ReconciliationService;
