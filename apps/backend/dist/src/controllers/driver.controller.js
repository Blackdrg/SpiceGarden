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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderDriverController = exports.DriverController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../security/jwt-auth.guard");
const driver_entity_1 = require("../db/entities/driver.entity");
const order_entity_1 = require("../db/entities/order.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const driver_assignment_entity_1 = require("../db/entities/driver-assignment.entity");
const typeorm_3 = require("typeorm");
const tracking_gateway_1 = require("../infra/tracking/tracking.gateway");
const order_interface_1 = require("../shared/domain/order.interface");
const notification_service_1 = require("../services/notifications/notification.service");
let DriverController = class DriverController {
    constructor(driverRepo, assignmentRepo, dataSource, trackingGateway) {
        this.driverRepo = driverRepo;
        this.assignmentRepo = assignmentRepo;
        this.dataSource = dataSource;
        this.trackingGateway = trackingGateway;
    }
    async getProfile(req) {
        const driver = await this.driverRepo.findOne({
            where: { userId: req.user.id },
            relations: ['user'],
        });
        return driver;
    }
    async getDriver(id) {
        const driver = await this.driverRepo.findOne({
            where: { id },
            relations: ['user'],
        });
        return driver;
    }
    async getEarnings(id) {
        const assignments = await this.assignmentRepo.find({
            where: { driver: { id }, status: 'delivered' },
            relations: ['order'],
        });
        const totalEarnings = assignments.reduce((sum, a) => sum + (a.order?.grandTotal || 0), 0);
        const todayAssignments = assignments.filter(a => {
            const today = new Date();
            const assignmentDate = new Date(a.createdAt);
            return assignmentDate.toDateString() === today.toDateString();
        });
        const todayEarnings = todayAssignments.reduce((sum, a) => sum + (a.order?.grandTotal || 0), 0);
        return {
            availableBalance: totalEarnings * 0.8,
            pendingBalance: totalEarnings * 0.2,
            lifetimeEarnings: totalEarnings,
            weeklyEarnings: totalEarnings,
            todayEarnings,
        };
    }
    async updateLocation(id, body) {
        await this.driverRepo.update(id, {
            currentLocation: { lat: body.lat, lng: body.lng },
            lastLocationUpdate: new Date(),
        });
        await this.trackingGateway.publishToRoom(`driver:${id}`, {
            type: 'locationUpdate',
            driverId: id,
            lat: body.lat,
            lng: body.lng,
            heading: body.heading,
            speed: body.speed,
            timestamp: new Date().toISOString(),
        });
        return { status: 'updated' };
    }
    async toggleAvailability(id, body) {
        await this.driverRepo.update(id, { isAvailable: body.isAvailable });
        return { driverId: id, isAvailable: body.isAvailable };
    }
    async getAvailableDrivers(lat, lng, radius = 5) {
        const radiusInMeters = radius * 1000;
        return this.driverRepo
            .createQueryBuilder('driver')
            .where('driver.isOnline = :online', { online: true })
            .andWhere('driver.kycStatus = :status', { status: 'approved' })
            .andWhere('driver.isAvailable = :available', { available: true })
            .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius: radiusInMeters })
            .getMany();
    }
};
exports.DriverController = DriverController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "getDriver", null);
__decorate([
    (0, common_1.Get)(':id/earnings'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "getEarnings", null);
__decorate([
    (0, common_1.Post)(':id/location'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Post)(':id/availability'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "toggleAvailability", null);
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "getAvailableDrivers", null);
exports.DriverController = DriverController = __decorate([
    (0, common_1.Controller)('drivers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, typeorm_2.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(driver_assignment_entity_1.DriverAssignmentEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_3.DataSource,
        tracking_gateway_1.TrackingGateway])
], DriverController);
let OrderDriverController = class OrderDriverController {
    constructor(orderRepo, driverRepo, assignmentRepo, dataSource, trackingGateway, notificationService) {
        this.orderRepo = orderRepo;
        this.driverRepo = driverRepo;
        this.assignmentRepo = assignmentRepo;
        this.dataSource = dataSource;
        this.trackingGateway = trackingGateway;
        this.notificationService = notificationService;
    }
    async acceptOrder(id, body) {
        const order = await this.orderRepo.findOne({ where: { id } });
        if (!order) {
            throw new Error('Order not found');
        }
        await this.dataSource.manager.transaction(async (manager) => {
            await manager.update(order_entity_1.OrderEntity, id, {
                driverId: body.driverId,
                status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
            });
            const assignment = manager.create(driver_assignment_entity_1.DriverAssignmentEntity, {
                order: { id },
                driver: { id: body.driverId },
                status: 'accepted',
                distance: 5,
                estimatedTimeMinutes: 30,
            });
            await manager.save(driver_assignment_entity_1.DriverAssignmentEntity, assignment);
        });
        await this.trackingGateway.publishToRoom(`order:${id}`, {
            type: 'driverAssigned',
            driverId: body.driverId,
            orderId: id,
        });
        await this.notificationService.notifyDeliveryLifecycle(id, 'driver_assigned', order.userId, { eta: 30 });
        return { orderId: id, status: 'accepted' };
    }
    async rejectOrder(id, body) {
        const order = await this.orderRepo.findOne({ where: { id } });
        if (!order) {
            throw new Error('Order not found');
        }
        await this.orderRepo.update(id, { status: order_interface_1.OrderStatus.PLACED });
        const assignment = await this.assignmentRepo.findOne({
            where: { order: { id } },
        });
        if (assignment) {
            await this.assignmentRepo.update(assignment.id, { status: 'failed' });
        }
        return { orderId: id, status: 'rejected' };
    }
    async updateStatus(id, body) {
        const order = await this.orderRepo.findOne({ where: { id } });
        if (!order) {
            throw new Error('Order not found');
        }
        const statusMap = {
            pickedUp: order_interface_1.OrderStatus.ON_THE_WAY,
            onTheWay: order_interface_1.OrderStatus.ON_THE_WAY,
            delivered: order_interface_1.OrderStatus.DELIVERED,
            failed: order_interface_1.OrderStatus.CANCELLED,
        };
        await this.orderRepo.update(id, {
            status: statusMap[body.status] || order_interface_1.OrderStatus.DELIVERED,
        });
        const assignment = await this.assignmentRepo.findOne({
            where: { order: { id } },
        });
        if (assignment) {
            await this.assignmentRepo.update(assignment.id, {
                status: body.status,
                actualTimeMinutes: body.actualTimeMinutes,
            });
        }
        await this.trackingGateway.publishToRoom(`order:${id}`, {
            type: 'orderStatusUpdate',
            status: body.status,
            orderId: id,
        });
        const eventMap = {
            pickedUp: 'picked_up',
            onTheWay: 'nearby',
            delivered: 'delivered',
        };
        if (body.status in eventMap) {
            await this.notificationService.notifyDeliveryLifecycle(id, eventMap[body.status], order.userId, { eta: 15 });
        }
        else if (body.status === 'failed') {
            await this.notificationService.notifyOrderUpdate(order.userId, id, 'cancelled');
        }
        return { orderId: id, status: body.status };
    }
    async verifyOTP(id, body) {
        const assignment = await this.assignmentRepo.findOne({
            where: { order: { id } },
            relations: ['order'],
        });
        if (!assignment || !assignment.order.otpCode) {
            return { valid: false };
        }
        const isValid = assignment.order.otpCode === body.otp;
        return { valid: isValid };
    }
    async reportIssue(id, body) {
        console.log(`Issue reported for order ${id}:`, body.issue, body.details);
        return { status: 'reported' };
    }
};
exports.OrderDriverController = OrderDriverController;
__decorate([
    (0, common_1.Post)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderDriverController.prototype, "acceptOrder", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderDriverController.prototype, "rejectOrder", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderDriverController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/verify-otp'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderDriverController.prototype, "verifyOTP", null);
__decorate([
    (0, common_1.Post)(':id/issues'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderDriverController.prototype, "reportIssue", null);
exports.OrderDriverController = OrderDriverController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, typeorm_2.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(2, (0, typeorm_2.InjectRepository)(driver_assignment_entity_1.DriverAssignmentEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_3.DataSource,
        tracking_gateway_1.TrackingGateway,
        notification_service_1.NotificationService])
], OrderDriverController);
//# sourceMappingURL=driver.controller.js.map