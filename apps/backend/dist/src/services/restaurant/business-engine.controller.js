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
exports.BusinessEngineController = void 0;
const common_1 = require("@nestjs/common");
const business_engine_service_1 = require("./business-engine.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const permission_guard_1 = require("../../security/permission.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const permissions_decorator_1 = require("../../security/permissions.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let BusinessEngineController = class BusinessEngineController {
    businessEngine;
    constructor(businessEngine) {
        this.businessEngine = businessEngine;
    }
    async getMetrics() {
        return this.businessEngine.getBusinessMetrics();
    }
    async getRestaurants() {
        return this.businessEngine.getActiveRestaurants();
    }
    async getMenu(restaurantId) {
        return this.businessEngine.getRestaurantMenu(restaurantId);
    }
    async getLiveDrivers() {
        return this.businessEngine.getLiveDrivers();
    }
    async updateDriverLocation(driverId, location) {
        return this.businessEngine.registerDriverLocation(driverId, location);
    }
    async setDriverAvailability(driverId, body) {
        return this.businessEngine.toggleDriverAvailability(driverId, body.isAvailable);
    }
    async getDashboard() {
        return this.businessEngine.getRealtimeDashboard();
    }
    async getUptime() {
        return this.businessEngine.getSystemUptime();
    }
};
exports.BusinessEngineController = BusinessEngineController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('analytics:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessEngineController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('restaurants'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN, user_interface_1.UserRole.RESTAURANT),
    (0, permissions_decorator_1.Permissions)('restaurants:manage_own'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessEngineController.prototype, "getRestaurants", null);
__decorate([
    (0, common_1.Get)('restaurants/:id/menu'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN, user_interface_1.UserRole.RESTAURANT, user_interface_1.UserRole.CUSTOMER),
    (0, permissions_decorator_1.Permissions)('orders:read_own'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessEngineController.prototype, "getMenu", null);
__decorate([
    (0, common_1.Get)('drivers/live'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('deliveries:manage_assigned'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessEngineController.prototype, "getLiveDrivers", null);
__decorate([
    (0, common_1.Post)('drivers/:id/location'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('deliveries:manage_assigned'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessEngineController.prototype, "updateDriverLocation", null);
__decorate([
    (0, common_1.Post)('drivers/:id/availability'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('deliveries:manage_assigned'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessEngineController.prototype, "setDriverAvailability", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('analytics:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessEngineController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('uptime'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('analytics:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessEngineController.prototype, "getUptime", null);
exports.BusinessEngineController = BusinessEngineController = __decorate([
    (0, common_1.Controller)('business'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [business_engine_service_1.BusinessEngineService])
], BusinessEngineController);
