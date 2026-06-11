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
exports.DriverPayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
let DriverPayoutService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DriverPayoutService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DriverPayoutService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        incentiveRepo;
        driverRepo;
        orderRepo;
        dataSource;
        logger = new common_1.Logger(DriverPayoutService.name);
        constructor(incentiveRepo, driverRepo, orderRepo, dataSource) {
            this.incentiveRepo = incentiveRepo;
            this.driverRepo = driverRepo;
            this.orderRepo = orderRepo;
            this.dataSource = dataSource;
        }
        async calculateWeeklyIncentives(driverId, weekStart) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            const orders = await this.orderRepo.find({
                where: {
                    driverId: driverId,
                    status: order_interface_1.OrderStatus.DELIVERED,
                    createdAt: (0, typeorm_1.Between)(weekStart, weekEnd),
                },
            });
            const completedDeliveries = orders.length;
            const onTimeDeliveries = orders.filter(o => o.status === order_interface_1.OrderStatus.DELIVERED).length;
            const onTimeRate = completedDeliveries > 0 ? onTimeDeliveries / completedDeliveries : 0;
            const incentives = {
                baseIncentive: completedDeliveries * 15,
                onTimeBonus: onTimeRate >= 0.95 ? completedDeliveries * 10 : 0,
                peakHourBonus: Math.floor(completedDeliveries * 0.3) * 20,
                ratingBonus: 0,
                total: 0,
            };
            incentives.total = Object.values(incentives).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0) - incentives.baseIncentive; // Subtract base to avoid double counting
            incentives.total += incentives.baseIncentive;
            return {
                driverId,
                period: { weekStart, weekEnd },
                deliveries: completedDeliveries,
                onTimeRate,
                incentives,
            };
        }
        async generateIncentive(driverId, type, amount, description, referenceId) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver) {
                throw new Error('Driver not found');
            }
            const incentive = this.incentiveRepo.create({
                driverId,
                type: type,
                amount,
                description,
                referenceId,
            });
            return this.incentiveRepo.save(incentive);
        }
        async approveIncentive(incentiveId, approverId) {
            const incentive = await this.incentiveRepo.findOne({ where: { id: incentiveId } });
            if (!incentive) {
                throw new Error('Incentive not found');
            }
            await this.incentiveRepo.update(incentiveId, {
                status: driver_incentive_entity_1.IncentiveStatus.APPROVED,
                approvedBy: approverId,
                approvedAt: new Date(),
            });
            return this.incentiveRepo.findOne({ where: { id: incentiveId } });
        }
        async markPaid(incentiveId, payoutReference) {
            const incentive = await this.incentiveRepo.findOne({ where: { id: incentiveId } });
            if (!incentive) {
                throw new Error('Incentive not found');
            }
            await this.incentiveRepo.update(incentiveId, {
                status: driver_incentive_entity_1.IncentiveStatus.PAID,
                payoutReference,
                paidAt: new Date(),
            });
            return this.incentiveRepo.findOne({ where: { id: incentiveId } });
        }
        async getPendingIncentives(driverId) {
            const where = { status: driver_incentive_entity_1.IncentiveStatus.APPROVED };
            if (driverId) {
                where.driverId = driverId;
            }
            return this.incentiveRepo.find({
                where,
                relations: ['driver'],
                order: { createdAt: 'ASC' },
            });
        }
        async getIncentiveSummary(driverId, month, year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const incentives = await this.incentiveRepo.find({
                where: {
                    driverId: driverId,
                    createdAt: (0, typeorm_1.Between)(startDate, endDate),
                },
            });
            return {
                driverId,
                period: { month, year },
                totalEarned: incentives
                    .filter(i => i.status === driver_incentive_entity_1.IncentiveStatus.PAID)
                    .reduce((sum, i) => sum + Number(i.amount), 0),
                pendingAmount: incentives
                    .filter(i => i.status === driver_incentive_entity_1.IncentiveStatus.APPROVED)
                    .reduce((sum, i) => sum + Number(i.amount), 0),
                totalIncentives: incentives.length,
            };
        }
    };
    return DriverPayoutService = _classThis;
})();
exports.DriverPayoutService = DriverPayoutService;
