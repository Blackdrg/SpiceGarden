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
exports.DeviceController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const permission_guard_1 = require("../../security/permission.guard");
const permissions_decorator_1 = require("../../security/permissions.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let DeviceController = class DeviceController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async registerDevice(req, body) {
        const { fcmToken, apnsToken, deviceInfo } = body;
        const authenticatedUserId = req.user?.userId || req.user?.sub;
        const targetUserId = (authenticatedUserId || body.userId || 'anonymous');
        if (fcmToken) {
            await this.notificationService.registerDevice(targetUserId, fcmToken, deviceInfo ?? {});
        }
        if (apnsToken) {
            await this.notificationService.registerDevice(targetUserId, apnsToken, { ...(deviceInfo || {}), type: 'ios' });
        }
        return { success: true, message: 'Device registered successfully' };
    }
    async unregisterDevice(req, body) {
        const authenticatedUserId = req.user?.userId || req.user?.sub;
        const targetUserId = authenticatedUserId;
        if (!targetUserId) {
            return { success: false, message: 'Authenticated user ID is required' };
        }
        const { fcmToken, apnsToken } = body;
        if (fcmToken) {
            await this.notificationService.unregisterDevice(targetUserId, fcmToken);
        }
        if (apnsToken) {
            await this.notificationService.unregisterDevice(targetUserId, apnsToken);
        }
        return { success: true, message: 'Device unregistered successfully' };
    }
};
exports.DeviceController = DeviceController;
__decorate([
    (0, common_1.Post)('register'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.CUSTOMER, user_interface_1.UserRole.DELIVERY_PARTNER, user_interface_1.UserRole.RESTAURANT, user_interface_1.UserRole.KITCHEN_STAFF),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "registerDevice", null);
__decorate([
    (0, common_1.Delete)('unregister'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.CUSTOMER, user_interface_1.UserRole.DELIVERY_PARTNER, user_interface_1.UserRole.RESTAURANT, user_interface_1.UserRole.KITCHEN_STAFF),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "unregisterDevice", null);
exports.DeviceController = DeviceController = __decorate([
    (0, common_1.Controller)('devices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permission_guard_1.PermissionGuard),
    (0, permissions_decorator_1.Permissions)('orders:read_own'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], DeviceController);
