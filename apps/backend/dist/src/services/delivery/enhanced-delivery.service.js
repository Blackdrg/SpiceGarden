"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EnhancedDeliveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const batch_entity_1 = require("../../db/entities/batch.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const geo_service_1 = require("../../services/geo/geo.service");
const order_interface_1 = require("../../shared/domain/order.interface");
let EnhancedDeliveryService = EnhancedDeliveryService_1 = class EnhancedDeliveryService {
    driverRepo;
    orderRepo;
    batchRepo;
    driverAssignmentRepo;
    geoService;
    dataSource;
    logger = new common_1.Logger(EnhancedDeliveryService_1.name);
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
    detectFakeGPS(driverId, location, speed) {
        if (location.lat === null || location.lng === null || location.lat === undefined || location.lng === undefined) {
            return { isFake: true, reason: 'Invalid GPS coordinates', driverId };
        }
        const lat = Number(location.lat);
        const lng = Number(location.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return { isFake: true, reason: 'Invalid GPS coordinates', driverId };
        }
        if (speed !== undefined && speed >= 200) {
            return { isFake: true, reason: 'Unrealistic speed', driverId };
        }
        const timestamp = typeof location.timestamp === 'string' ? Number(location.timestamp) : location.timestamp;
        if (timestamp && Date.now() - timestamp >= 60 * 1000 && speed && speed > 30) {
            return { isFake: true, reason: 'GPS staleness', driverId };
        }
        return { isFake: false, reason: 'GPS coordinates accepted', driverId };
    }
    async verifyDriverLocation(driverId, reportedLocation) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver?.currentLocation) {
            return { verified: false, reason: 'Driver location unavailable' };
        }
        const distance = this.geoService.calculateDistance(driver.currentLocation, reportedLocation);
        return { verified: distance <= 1, reason: distance <= 1 ? 'Location verified' : 'Location outside expected range' };
    }
    async detectRouteManipulation(assignmentId) {
        const assignment = await this.driverAssignmentRepo.findOne({ where: { id: assignmentId } });
        if (!assignment?.routeData?.waypoints || assignment.routeData.waypoints.length < 2) {
            return { suspicious: false };
        }
        const waypoints = assignment.routeData.waypoints;
        let previous = waypoints[0];
        let totalSegmentDistance = 0;
        for (let i = 1; i < waypoints.length; i++) {
            const current = waypoints[i];
            totalSegmentDistance += this.geoService.calculateDistance(previous, current);
            previous = current;
        }
        const directDistance = this.geoService.calculateDistance(waypoints[0], waypoints[waypoints.length - 1]);
        const suspicious = totalSegmentDistance > directDistance * 2.5;
        return { suspicious, reason: suspicious ? 'Route deviation exceeds threshold' : undefined };
    }
    async handleDriverNoShowAutomatic(driverId, orderId, assignmentId) {
        await this.dataSource.manager.transaction(async (manager) => {
            const driver = await manager.findOne(driver_entity_1.DriverEntity, { where: { id: driverId } });
            if (driver) {
                await manager.update(driver_entity_1.DriverEntity, driverId, {
                    failureCount: (driver.failureCount || 0) + 1,
                    isFraudSuspicious: (driver.failureCount || 0) + 1 >= 3,
                    fraudFlags: { ...(driver.fraudFlags || {}), noShowRisk: 0.8 },
                });
            }
            await manager.update(order_entity_1.OrderEntity, orderId, { status: order_interface_1.OrderStatus.CANCELLED });
            await manager.update(driver_assignment_entity_1.DriverAssignmentEntity, assignmentId, { status: 'failed' });
        });
    }
    async autoReassignOnNoShow(orderId, previousDriverId) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order || order.status !== order_interface_1.OrderStatus.CANCELLED)
            return false;
        const assignment = await this.driverAssignmentRepo.findOne({ where: { order: { id: orderId } } });
        if (!assignment)
            return false;
        const availableDrivers = await this.findAvailableDrivers(order.restaurantId ? 0 : 0, 0, 5);
        const nextDriver = availableDrivers.find(d => d.id !== previousDriverId && !d.isFraudSuspicious);
        if (!nextDriver)
            return false;
        await this.assignOrderToDriver(orderId, nextDriver.id);
        await this.driverAssignmentRepo.update(assignment.id, {
            status: 'reassigned',
            reassignedFrom: previousDriverId,
        });
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
exports.EnhancedDeliveryService = EnhancedDeliveryService;
exports.EnhancedDeliveryService = EnhancedDeliveryService = EnhancedDeliveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(batch_entity_1.BatchEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(driver_assignment_entity_1.DriverAssignmentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        geo_service_1.GeoService,
        typeorm_2.DataSource])
], EnhancedDeliveryService);
