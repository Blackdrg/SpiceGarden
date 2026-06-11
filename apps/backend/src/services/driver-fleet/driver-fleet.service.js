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
exports.DriverFleetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const driver_shift_entity_1 = require("../../db/entities/driver-shift.entity");
const driver_penalty_entity_1 = require("../../db/entities/driver-penalty.entity");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
let DriverFleetService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DriverFleetService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DriverFleetService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        driverRepo;
        shiftRepo;
        scoreRepo;
        penaltyRepo;
        incentiveRepo;
        orderRepo;
        assignmentRepo;
        dataSource;
        logger = new common_1.Logger(DriverFleetService.name);
        constructor(driverRepo, shiftRepo, scoreRepo, penaltyRepo, incentiveRepo, orderRepo, assignmentRepo, dataSource) {
            this.driverRepo = driverRepo;
            this.shiftRepo = shiftRepo;
            this.scoreRepo = scoreRepo;
            this.penaltyRepo = penaltyRepo;
            this.incentiveRepo = incentiveRepo;
            this.orderRepo = orderRepo;
            this.assignmentRepo = assignmentRepo;
            this.dataSource = dataSource;
        }
        async startShift(driverId) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver)
                throw new common_1.NotFoundException('Driver not found');
            if (driver.kycStatus !== 'approved')
                throw new common_1.BadRequestException('KYC not approved');
            const activeShift = await this.shiftRepo.findOne({
                where: { driverId, status: driver_shift_entity_1.DriverShiftStatus.ACTIVE },
            });
            if (activeShift)
                throw new common_1.BadRequestException('Already has an active shift');
            const shift = this.shiftRepo.create({
                driverId,
                startTime: new Date(),
                status: driver_shift_entity_1.DriverShiftStatus.ACTIVE,
            });
            return this.shiftRepo.save(shift);
        }
        async endShift(driverId, shiftId) {
            const shift = await this.shiftRepo.findOne({ where: { id: shiftId, driverId } });
            if (!shift)
                throw new common_1.NotFoundException('Shift not found');
            if (shift.status !== driver_shift_entity_1.DriverShiftStatus.ACTIVE)
                throw new common_1.BadRequestException('Shift is not active');
            const endTime = new Date();
            const hours = (endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
            shift.endTime = endTime;
            shift.status = driver_shift_entity_1.DriverShiftStatus.COMPLETED;
            shift.totalHours = Math.round(hours * 100) / 100;
            return this.shiftRepo.save(shift);
        }
        async getShifts(driverId, limit = 20) {
            return this.shiftRepo.find({
                where: { driverId },
                order: { createdAt: 'DESC' },
                take: limit,
            });
        }
        async getEarnings(driverId, period) {
            const earnings = await this.shiftRepo.find({
                where: {
                    driverId,
                    status: driver_shift_entity_1.DriverShiftStatus.COMPLETED,
                    startTime: (0, typeorm_1.Between)(period.start, period.end),
                },
                order: { startTime: 'DESC' },
            });
            const totalEarnings = earnings.reduce((s, e) => s + Number(e.totalEarnings || 0), 0);
            const totalDeliveries = earnings.reduce((s, e) => s + (e.totalDeliveries || 0), 0);
            const totalHours = earnings.reduce((s, e) => s + Number(e.totalHours || 0), 0);
            const totalDistance = earnings.reduce((s, e) => s + Number(e.totalDistance || 0), 0);
            const incentives = await this.incentiveRepo.find({
                where: { driverId, status: driver_incentive_entity_1.IncentiveStatus.PAID },
            });
            const totalIncentives = incentives.reduce((s, i) => s + Number(i.amount || 0), 0);
            return {
                driverId,
                period,
                shiftEarnings: totalEarnings,
                incentives: totalIncentives,
                penalties: 0,
                netEarnings: totalEarnings + totalIncentives,
                totalDeliveries,
                totalHours,
                totalDistance,
                avgEarningsPerHour: totalHours > 0 ? Math.round((totalEarnings / totalHours) * 100) / 100 : 0,
                shifts: earnings,
            };
        }
        async calculateIncentives(driverId) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver)
                throw new common_1.NotFoundException('Driver not found');
            const score = await this.scoreRepo.findOne({
                where: { driver: { id: driverId } },
                order: { createdAt: 'DESC' },
            });
            let bonusAmount = 0;
            const bonuses = [];
            if (score && score.customerRating >= 4.5) {
                const amount = Math.round(score.totalDeliveries * 5);
                bonusAmount += amount;
                bonuses.push({ type: 'Excellent Rating', amount, reason: `Rating ${score.customerRating}` });
            }
            if (score && score.onTimeDeliveryRate >= 0.95) {
                const amount = Math.round(score.totalDeliveries * 3);
                bonusAmount += amount;
                bonuses.push({ type: 'On Time Bonus', amount, reason: `${Math.round(score.onTimeDeliveryRate * 100)}% on-time` });
            }
            if (score && score.acceptanceRate >= 0.9) {
                const amount = Math.round(score.totalDeliveries * 2);
                bonusAmount += amount;
                bonuses.push({ type: 'High Acceptance Bonus', amount, reason: `${Math.round(score.acceptanceRate * 100)}% acceptance` });
            }
            if (score && score.cancellationRate <= 0.05) {
                bonusAmount += 100;
                bonuses.push({ type: 'Low Cancellation Bonus', amount: 100, reason: 'Excellent reliability' });
            }
            return { driverId, score, bonuses, totalBonus: bonusAmount };
        }
        async issuePenalty(driverId, data) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver)
                throw new common_1.NotFoundException('Driver not found');
            const penalty = this.penaltyRepo.create({
                driverId,
                type: data.type || driver_penalty_entity_1.DriverPenaltyType.LATE_PICKUP,
                amount: data.amount || 0,
                orderId: data.orderId,
                description: data.description || '',
                status: driver_penalty_entity_1.DriverPenaltyStatus.ISSUED,
                issuedBy: data.issuedBy,
            });
            return this.penaltyRepo.save(penalty);
        }
        async getPerformanceRanking(driverId) {
            let query = this.scoreRepo.createQueryBuilder('score');
            if (driverId) {
                query = query.where('score.driverId = :driverId', { driverId });
            }
            const scores = await query
                .orderBy('score.overallScore', 'DESC')
                .limit(50)
                .getMany();
            const rankings = scores.map((s, idx) => ({
                rank: idx + 1,
                driverId: s.driver.id,
                overallScore: s.overallScore,
                onTimeRate: s.onTimeDeliveryRate,
                acceptanceRate: s.acceptanceRate,
                cancellationRate: s.cancellationRate,
                customerRating: s.customerRating,
                totalDeliveries: s.totalDeliveries,
            }));
            const driverRank = driverId ? rankings.findIndex(r => r.driverId === driverId) + 1 : null;
            return {
                rankings,
                totalDrivers: rankings.length,
                driverRank,
                percentile: driverRank ? Math.round((1 - driverRank / rankings.length) * 100) : null,
            };
        }
        async getDriverSchedule(driverId, days = 14) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);
            const shifts = await this.shiftRepo.find({
                where: {
                    driverId,
                    startTime: (0, typeorm_1.Between)(startDate, endDate),
                },
                order: { startTime: 'DESC' },
            });
            const upcoming = shifts.filter(s => s.status === driver_shift_entity_1.DriverShiftStatus.SCHEDULED || s.status === driver_shift_entity_1.DriverShiftStatus.ACTIVE);
            const past = shifts.filter(s => s.status === driver_shift_entity_1.DriverShiftStatus.COMPLETED || s.status === driver_shift_entity_1.DriverShiftStatus.CANCELLED);
            return { upcoming, past, totalShifts: past.length + upcoming.length };
        }
        async approvePenalty(penaltyId, approvedBy) {
            const penalty = await this.penaltyRepo.findOne({ where: { id: penaltyId } });
            if (!penalty)
                throw new common_1.NotFoundException('Penalty not found');
            penalty.status = driver_penalty_entity_1.DriverPenaltyStatus.PENDING;
            return this.penaltyRepo.save(penalty);
        }
        async waivePenalty(penaltyId, waivedBy, reason) {
            const penalty = await this.penaltyRepo.findOne({ where: { id: penaltyId } });
            if (!penalty)
                throw new common_1.NotFoundException('Penalty not found');
            penalty.status = driver_penalty_entity_1.DriverPenaltyStatus.WAIVED;
            penalty.waivedBy = waivedBy;
            penalty.waivedAt = new Date();
            penalty.waiverReason = reason;
            return this.penaltyRepo.save(penalty);
        }
        async getPenalties(driverId) {
            return this.penaltyRepo.find({
                where: { driverId },
                order: { createdAt: 'DESC' },
            });
        }
    };
    return DriverFleetService = _classThis;
})();
exports.DriverFleetService = DriverFleetService;
