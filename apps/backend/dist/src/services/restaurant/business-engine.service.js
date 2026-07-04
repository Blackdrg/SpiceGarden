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
var BusinessEngineService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessEngineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
const driver_entity_1 = require("../../db/entities/driver.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const driver_assignment_service_1 = require("../../modules/driver-assignment/driver-assignment.service");
const tracking_gateway_1 = require("../../infra/tracking/tracking.gateway");
const notification_service_1 = require("../notifications/notification.service");
const audit_service_1 = require("../../audit/audit.service");
let BusinessEngineService = BusinessEngineService_1 = class BusinessEngineService {
    orderRepo;
    driverRepo;
    restaurantRepo;
    branchRepo;
    driverAssignmentService;
    trackingGateway;
    notificationService;
    auditService;
    logger = new common_1.Logger(BusinessEngineService_1.name);
    driverLocations = new Map();
    orderProcessingQueue = new Map();
    constructor(orderRepo, driverRepo, restaurantRepo, branchRepo, driverAssignmentService, trackingGateway, notificationService, auditService) {
        this.orderRepo = orderRepo;
        this.driverRepo = driverRepo;
        this.restaurantRepo = restaurantRepo;
        this.branchRepo = branchRepo;
        this.driverAssignmentService = driverAssignmentService;
        this.trackingGateway = trackingGateway;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }
    async getActiveRestaurants() {
        return this.restaurantRepo.find({
            where: { status: 'active' },
            relations: {
                branches: {
                    categories: {
                        items: true
                    }
                }
            },
        });
    }
    async getRestaurantMenu(restaurantId) {
        const restaurant = await this.restaurantRepo.findOne({
            where: { id: restaurantId },
            relations: {
                branches: {
                    categories: {
                        items: true
                    }
                }
            },
        });
        if (!restaurant)
            return [];
        const menuItems = [];
        for (const branch of restaurant.branches) {
            for (const category of branch.categories || []) {
                for (const item of category.items || []) {
                    menuItems.push({
                        id: item.id,
                        name: item.name,
                        price: Number(item.basePrice),
                        categoryId: category.id,
                        categoryName: category.name,
                    });
                }
            }
        }
        return menuItems;
    }
    async registerDriverLocation(driverId, location) {
        this.driverLocations.set(driverId, {
            driverId,
            lat: location.lat,
            lng: location.lng,
            heading: location.heading,
            speed: location.speed,
            timestamp: Date.now(),
        });
        await this.driverRepo.update(driverId, {
            currentLocation: { lat: location.lat, lng: location.lng },
            lastLocationUpdate: new Date(),
        });
        await this.trackingGateway.publishToRoom(`driver:${driverId}`, {
            event: 'locationUpdate',
            driverId,
            lat: location.lat,
            lng: location.lng,
            heading: location.heading,
            speed: location.speed,
            timestamp: new Date().toISOString(),
        });
        return { status: 'updated', driverId };
    }
    async getLiveDrivers() {
        const drivers = await this.driverRepo.find({
            where: { isOnline: true, kycStatus: 'approved' },
        });
        return drivers.map(d => ({
            driverId: d.id,
            lat: d.currentLocation?.lat || 0,
            lng: d.currentLocation?.lng || 0,
            speed: d.averageSpeed ? Number(d.averageSpeed) : 0,
            timestamp: d.lastLocationUpdate?.getTime() || Date.now(),
        }));
    }
    async toggleDriverAvailability(driverId, isAvailable) {
        await this.driverRepo.update(driverId, { isAvailable });
        return { driverId, isAvailable };
    }
    async processOrderFlow(orderId) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: { branch: { restaurant: true } },
        });
        if (!order)
            return;
        await this.trackingGateway.publishToRoom(`kds:${order.restaurantId}`, {
            event: 'newOrder',
            orderId: order.id,
            restaurantId: order.restaurantId,
            items: [],
            grandTotal: order.grandTotal,
            createdAt: order.createdAt,
        });
        this.orderProcessingQueue.set(orderId, setTimeout(async () => {
            await this.orderRepo.update(orderId, { status: order_interface_1.OrderStatus.RESTAURANT_ACCEPTED });
            try {
                const branch = await this.branchRepo.findOne({
                    where: { id: order.branchId || order.restaurantId },
                    relations: { restaurant: true }
                });
                if (branch && branch.location) {
                    const availableDrivers = await this.driverAssignmentService.getAvailableDrivers(branch.location.lat, branch.location.lng, 5);
                    if (availableDrivers.length > 0) {
                        const driver = availableDrivers[0];
                        const assignment = await this.driverAssignmentService.assignDriverToOrder(orderId);
                        await this.orderRepo.update(orderId, {
                            driverId: driver.id,
                            status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
                        });
                        await this.trackingGateway.publishToRoom(`driver:${driver.id}`, {
                            event: 'orderAssigned',
                            orderId: order.id,
                            branchId: order.branchId,
                            customerLocation: { lat: 0, lng: 0 },
                        });
                    }
                }
            }
            catch (error) {
                this.logger.error(`Failed to assign driver to order ${orderId}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }, 1000));
    }
    async getBusinessMetrics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalOrders, completedOrders, activeRestaurants, onlineDrivers, avgPrepTime, avgDeliveryTime, gmvResult,] = await Promise.all([
            this.orderRepo.count({ where: { createdAt: (0, typeorm_2.Between)(today, new Date()) } }),
            this.orderRepo.count({ where: { status: order_interface_1.OrderStatus.DELIVERED, createdAt: (0, typeorm_2.Between)(today, new Date()) } }),
            this.restaurantRepo.count({ where: { status: 'active' } }),
            this.driverRepo.count({ where: { isOnline: true, kycStatus: 'approved' } }),
            this.getAvgPrepTime(),
            this.getAvgDeliveryTime(),
            this.orderRepo.createQueryBuilder('order')
                .select('SUM(order.grandTotal)', 'gmv')
                .where('order.status = :status', { status: order_interface_1.OrderStatus.DELIVERED })
                .andWhere('order.createdAt >= :today', { today })
                .getRawOne(),
        ]);
        return {
            gmv: Number(gmvResult?.gmv) || 0,
            totalOrders,
            completedOrders,
            activeRestaurants,
            onlineDrivers,
            avgPrepTime: avgPrepTime || 0,
            avgDeliveryTime: avgDeliveryTime || 0,
        };
    }
    async getAvgPrepTime() {
        const result = await this.orderRepo
            .createQueryBuilder('order')
            .select('AVG(EXTRACT(EPOCH FROM (order.readyAt - order.createdAt)) / 60)', 'avgPrep')
            .where('order.status = :status', { status: order_interface_1.OrderStatus.DELIVERED })
            .getRawOne();
        return Math.round(Number(result?.avgPrep)) || 15;
    }
    async getAvgDeliveryTime() {
        const result = await this.orderRepo
            .createQueryBuilder('order')
            .select('AVG(EXTRACT(EPOCH FROM (order.deliveredAt - order.readyAt)) / 60)', 'avgDelivery')
            .where('order.status = :status', { status: order_interface_1.OrderStatus.DELIVERED })
            .getRawOne();
        return Math.round(Number(result?.avgDelivery)) || 25;
    }
    async recordOrderCompleted(orderId, userId) {
        const now = new Date();
        await this.orderRepo.update(orderId, {
            status: order_interface_1.OrderStatus.DELIVERED,
            deliveredAt: now,
        });
        await this.trackingGateway.publishToRoom(`order:${orderId}`, {
            event: 'orderCompleted',
            orderId,
            timestamp: now.toISOString(),
        });
        this.auditService.log('order_completed', userId, 'order', orderId, { completedAt: now });
    }
    async getSystemUptime() {
        return {
            uptime: process.uptime(),
            lastCheck: new Date().toISOString(),
        };
    }
    async getRealtimeDashboard() {
        const [metrics, liveDrivers, recentOrders] = await Promise.all([
            this.getBusinessMetrics(),
            this.getLiveDrivers(),
            this.orderRepo.find({
                where: { status: order_interface_1.OrderStatus.PLACED },
                order: { createdAt: 'DESC' },
                take: 10,
                relations: { branch: { restaurant: true } },
            }),
        ]);
        return {
            metrics,
            liveDrivers,
            recentOrders: recentOrders.map(o => ({
                id: o.id,
                restaurant: o.branch?.restaurant?.name || 'any',
                amount: o.grandTotal,
                status: o.status,
                createdAt: o.createdAt,
            })),
            timestamp: new Date().toISOString(),
        };
    }
};
exports.BusinessEngineService = BusinessEngineService;
exports.BusinessEngineService = BusinessEngineService = BusinessEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, driver_assignment_service_1.DriverAssignmentService,
        tracking_gateway_1.TrackingGateway,
        notification_service_1.NotificationService,
        audit_service_1.AuditService])
], BusinessEngineService);
