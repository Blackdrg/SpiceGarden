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
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const order_interface_1 = require("../../shared/domain/order.interface");
const common_2 = require("@nestjs/common");
let DeliveryService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DeliveryService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DeliveryService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        driverRepo;
        walletRepo;
        transactionRepo;
        orderRepo;
        batchRepo;
        driverAssignmentRepo;
        driverScoreRepo;
        driverFraudRepo;
        geoService;
        dataSource;
        constructor(driverRepo, walletRepo, transactionRepo, orderRepo, batchRepo, driverAssignmentRepo, driverScoreRepo, driverFraudRepo, geoService, dataSource) {
            this.driverRepo = driverRepo;
            this.walletRepo = walletRepo;
            this.transactionRepo = transactionRepo;
            this.orderRepo = orderRepo;
            this.batchRepo = batchRepo;
            this.driverAssignmentRepo = driverAssignmentRepo;
            this.driverScoreRepo = driverScoreRepo;
            this.driverFraudRepo = driverFraudRepo;
            this.geoService = geoService;
            this.dataSource = dataSource;
        }
        async registerDriver(userId, data) {
            const driver = this.driverRepo.create({
                userId,
                ...data,
                kycStatus: 'pending',
            });
            const savedDriver = await this.driverRepo.save(driver);
            const wallet = this.walletRepo.create({ userId, balance: 0 });
            await this.walletRepo.save(wallet);
            return savedDriver;
        }
        async updateLocation(driverId, lat, lng) {
            return this.driverRepo.update(driverId, {
                currentLocation: { lat, lng },
            });
        }
        async findAvailableDrivers(lat, lng, radiusInKm = 5) {
            const radius = radiusInKm * 1000;
            return this.driverRepo
                .createQueryBuilder('driver')
                .where('driver.isOnline = :online', { online: true })
                .andWhere('driver.kycStatus = :status', { status: 'approved' })
                .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius })
                .getMany();
        }
        async assignOrderToDriver(orderId, driverId) {
            return this.orderRepo.update(orderId, {
                driverId,
                status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
            });
        }
        calculateTrafficAwareRoute(restaurantLocation, customerLocation, historicalSpeed) {
            const distance = this.geoService.calculateDistance(restaurantLocation, customerLocation);
            const basePrediction = this.geoService.predictETA(distance, historicalSpeed || 30);
            const timeOfDayFactor = this.getTimeOfDayTrafficFactor();
            const historicalSpeedFactor = historicalSpeed ? (30 / historicalSpeed) : 1;
            const trafficFactor = Math.max(0.5, Math.min(3.0, (timeOfDayFactor * historicalSpeedFactor)));
            const adjustedDuration = basePrediction.duration * trafficFactor;
            const adjustedETA = Math.ceil(adjustedDuration + (adjustedDuration * 0.2));
            return {
                eta: adjustedETA,
                distance: basePrediction.distance,
                duration: Math.ceil(adjustedDuration),
                trafficFactor
            };
        }
        getTimeOfDayTrafficFactor() {
            const hour = new Date().getHours();
            if (hour >= 7 && hour <= 9)
                return 1.5; // Morning rush
            if (hour >= 12 && hour <= 14)
                return 1.3; // Lunch rush
            if (hour >= 17 && hour <= 20)
                return 1.7; // Evening rush
            return 1.0; // Normal hours
        }
        async updateActualDeliveryTime(assignmentId, actualTimeMinutes) {
            return this.driverAssignmentRepo.update(assignmentId, {
                actualTimeMinutes: actualTimeMinutes,
                updatedAt: new Date()
            });
        }
        async calculateScoreComponents(driverId, restaurantId) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver) {
                throw new common_2.NotFoundException('Driver not found');
            }
            const totalDeliveries = driver.totalDeliveries || 0;
            // For now, calculate based on basic metrics
            const onTimeRate = totalDeliveries > 0 ? 0.95 : 0;
            const acceptanceRate = totalDeliveries > 0 ? 0.90 : 0;
            const cancellationRate = totalDeliveries > 0 ? 0.05 : 0;
            return {
                overallScore: driver.rating || 4.5,
                onTimeRate,
                acceptanceRate,
                cancellationRate,
            };
        }
        toRadians(degrees) {
            return degrees * (Math.PI / 180);
        }
    };
    return DeliveryService = _classThis;
})();
exports.DeliveryService = DeliveryService;
