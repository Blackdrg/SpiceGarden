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
exports.EnhancedDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
let EnhancedDeliveryService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EnhancedDeliveryService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EnhancedDeliveryService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        driverRepo;
        orderRepo;
        batchRepo;
        driverAssignmentRepo;
        geoService;
        dataSource;
        logger = new common_1.Logger(EnhancedDeliveryService.name);
        surgeZones = new Map();
        incentiveRules = new Map();
        constructor(driverRepo, orderRepo, batchRepo, driverAssignmentRepo, geoService, dataSource) {
            this.driverRepo = driverRepo;
            this.orderRepo = orderRepo;
            this.batchRepo = batchRepo;
            this.driverAssignmentRepo = driverAssignmentRepo;
            this.geoService = geoService;
            this.dataSource = dataSource;
            this.initializeSurgeZones();
            this.initializeIncentiveRules();
        }
        initializeSurgeZones() {
            this.surgeZones.set('central', {
                id: 'central',
                center: { lat: 30.7333, lng: 76.7794 },
                radiusKm: 5,
                surgeMultiplier: 1.0,
                active: false,
            });
        }
        initializeIncentiveRules() {
            this.incentiveRules.set('default', [
                {
                    id: 'on_time_bonus',
                    type: 'bonus_per_order',
                    value: 15,
                    conditions: { minDeliveries: 0 },
                    active: true,
                },
                {
                    id: 'peak_hour_rate',
                    type: 'peak_hour_rate',
                    value: 1.2,
                    conditions: { timeWindow: { start: '12:00', end: '14:00' } },
                    active: true,
                },
            ]);
        }
        async registerDriver(userId, data) {
            const driver = this.driverRepo.create({
                userId,
                ...data,
                kycStatus: 'pending',
            });
            return await this.driverRepo.save(driver);
        }
        async updateLocation(driverId, lat, lng) {
            return this.driverRepo.update(driverId, {
                currentLocation: { lat, lng },
                lastLocationUpdate: new Date(),
            });
        }
        async findAvailableDrivers(lat, lng, radiusInKm = 5) {
            const radius = radiusInKm * 1000;
            return this.driverRepo
                .createQueryBuilder('driver')
                .where('driver.isOnline = :online', { online: true })
                .andWhere('driver.kycStatus = :status', { status: 'approved' })
                .andWhere('driver.isFraudSuspicious = :suspicious', { suspicious: false })
                .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius })
                .orderBy('driver.rating', 'DESC')
                .addOrderBy('driver.totalDeliveries', 'ASC')
                .getMany();
        }
        async assignOrderToDriver(orderId, driverId) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new Error('Order not found');
            }
            await this.dataSource.manager.transaction(async (manager) => {
                await manager.update(order_entity_1.OrderEntity, orderId, {
                    driverId,
                    status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
                });
                await manager.increment(driver_entity_1.DriverEntity, driverId, 'totalDeliveries', 0);
                const assignment = manager.create(driver_assignment_entity_1.DriverAssignmentEntity, {
                    driverId: driverId,
                    orderId: orderId,
                    status: 'assigned',
                    distance: 5,
                    estimatedTimeMinutes: 30,
                });
                await manager.save(driver_assignment_entity_1.DriverAssignmentEntity, assignment);
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
            return { eta: adjustedETA, distance: basePrediction.distance, duration: Math.ceil(adjustedDuration), trafficFactor };
        }
        getTimeOfDayTrafficFactor() {
            const hour = new Date().getHours();
            if (hour >= 7 && hour <= 9)
                return 1.5;
            if (hour >= 12 && hour <= 14)
                return 1.3;
            if (hour >= 17 && hour <= 20)
                return 1.7;
            return 1.0;
        }
        getSurgeMultiplier(location) {
            for (const zone of this.surgeZones.values()) {
                if (zone.active && this.geoService.calculateDistance(location, zone.center) <= zone.radiusKm) {
                    return zone.surgeMultiplier;
                }
            }
            return 1.0;
        }
        async calculateSurgeForOrder(orderId, restaurantLocation) {
            const surge = this.getSurgeMultiplier(restaurantLocation);
            const timeSurge = this.getTimeOfDayTrafficFactor();
            return Math.max(surge, timeSurge);
        }
        async handleFailedDelivery(orderId, driverId, failureReason, reasonDetails) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order) {
                throw new Error('Order not found');
            }
            await this.dataSource.manager.transaction(async (manager) => {
                await manager.update(order_entity_1.OrderEntity, orderId, {
                    status: order_interface_1.OrderStatus.CANCELLED,
                    paymentStatus: order_interface_1.PaymentStatus.FAILED,
                });
                const driver = await manager.findOne(driver_entity_1.DriverEntity, { where: { id: driverId } });
                if (driver && reasonDetails !== 'customer_unavailable') {
                    const newFailureCount = driver.failureCount + 1;
                    await manager.update(driver_entity_1.DriverEntity, driverId, {
                        failureCount: newFailureCount,
                        isFraudSuspicious: newFailureCount >= 3,
                    });
                }
            });
            this.handleDriverNoShow(driverId);
        }
        async handleDriverNoShow(driverId) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver)
                return;
            const assignments = await this.driverAssignmentRepo.find({
                where: { driver: { id: driverId } },
                order: { createdAt: 'DESC' },
                take: 5,
            });
            const recentNoShows = assignments.filter(a => a.status === 'failed' && a.failureReason === 'no_show').length;
            if (recentNoShows >= 2) {
                await this.driverRepo.update(driverId, {
                    isFraudSuspicious: true,
                    fraudFlags: { ...driver.fraudFlags, noShowRisk: 0.8 },
                });
                this.logger.warn(`Driver ${driverId} flagged for no-shows`);
            }
        }
        async reassignOrder(restaurantLat, restaurantLng, orderId, excludeDriverId) {
            const order = await this.orderRepo.findOne({ where: { id: orderId } });
            if (!order)
                return false;
            const availableDrivers = await this.findAvailableDrivers(restaurantLat, restaurantLng, 5);
            const driversToConsider = availableDrivers.filter(d => d.id !== excludeDriverId && !d.isFraudSuspicious);
            if (driversToConsider.length === 0)
                return false;
            const bestDriver = driversToConsider.reduce((best, current) => (current.rating || 0) > (best.rating || 0) ? current : best);
            await this.assignOrderToDriver(orderId, bestDriver.id);
            return true;
        }
        async calculateDeliveryIncentives(driverId, date = new Date()) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver)
                return { totalIncentive: 0, breakdown: {} };
            const rules = this.incentiveRules.get('default') || [];
            const breakdown = {};
            let totalIncentive = 0;
            for (const rule of rules) {
                if (!rule.active)
                    continue;
                switch (rule.type) {
                    case 'bonus_per_order':
                        {
                            const completedToday = await this.driverAssignmentRepo.count({
                                where: { status: 'delivered' },
                            });
                            if ((!rule.conditions.minDeliveries || completedToday >= rule.conditions.minDeliveries)) {
                                breakdown[rule.id] = rule.value * completedToday;
                                totalIncentive += breakdown[rule.id];
                            }
                            break;
                        }
                }
            }
            return { totalIncentive, breakdown };
        }
        async validateGeoFence(driverId, centerLat, centerLng, radiusKm = 1) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver?.currentLocation)
                return false;
            const distance = this.geoService.calculateDistance(driver.currentLocation, { lat: centerLat, lng: centerLng });
            return distance <= radiusKm;
        }
        async rerouteDriver(driverId, orderId, newDestination, reason) {
            const assignment = await this.driverAssignmentRepo.findOne({
                where: { order: { id: orderId } },
            });
            if (!assignment)
                return;
            const newRoute = this.geoService.calculateDistance({ lat: 0, lng: 0 }, newDestination);
            await this.driverAssignmentRepo.update(assignment.id, {
                status: 'assigned',
            });
        }
    };
    return EnhancedDeliveryService = _classThis;
})();
exports.EnhancedDeliveryService = EnhancedDeliveryService;
