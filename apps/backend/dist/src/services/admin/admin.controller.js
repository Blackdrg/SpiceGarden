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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const permission_guard_1 = require("../../security/permission.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const permissions_decorator_1 = require("../../security/permissions.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getStats(query) {
        return this.adminService.getDashboardStats(query.branchId);
    }
    async getFullStats(query) {
        return this.adminService.getDashboardStats(query.branchId);
    }
    async getOrders(page, limit) {
        return this.adminService.getAllOrders(Number(page) || 1, Number(limit) || 10);
    }
    async banUser(body, req) {
        return this.adminService.banUser(body.userId, body.reason);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('analytics:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('analytics:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFullStats", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('orders:manage'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Post)('users/ban'),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('users:manage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "banUser", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permission_guard_1.PermissionGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
