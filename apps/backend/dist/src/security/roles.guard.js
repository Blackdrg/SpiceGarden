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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const user_interface_1 = require("../shared/domain/user.interface");
const rolePermissions = {
    [user_interface_1.UserRole.CUSTOMER]: ['orders:read_own', 'orders:create', 'wallet:read_own', 'wallet:transact_own'],
    [user_interface_1.UserRole.RESTAURANT]: ['restaurants:manage_own', 'orders:manage_assigned', 'kitchen:manage_own', 'menus:manage_own'],
    [user_interface_1.UserRole.KITCHEN_STAFF]: ['kitchen:manage_own', 'orders:read_assigned'],
    [user_interface_1.UserRole.DELIVERY_PARTNER]: ['deliveries:manage_assigned', 'orders:read_assigned'],
    [user_interface_1.UserRole.ADMIN]: ['users:manage', 'restaurants:manage', 'orders:manage', 'payments:manage', 'support:manage', 'analytics:read'],
    [user_interface_1.UserRole.SUPER_ADMIN]: ['*'],
    [user_interface_1.UserRole.SUPPORT_STAFF]: ['support:manage', 'orders:read'],
    [user_interface_1.UserRole.FINANCE_STAFF]: ['finance:read', 'payments:read', 'refunds:read'],
};
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.get('roles', context.getHandler());
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Authentication is required');
        }
        if (user.status && user.status !== user_interface_1.UserStatus.ACTIVE) {
            throw new common_1.ForbiddenException('User account is not active');
        }
        if (!user.role) {
            throw new common_1.ForbiddenException('User role is required');
        }
        const role = this.normalizeRole(user.role);
        if (!role) {
            throw new common_1.ForbiddenException('Invalid user role');
        }
        const hasRequiredRole = requiredRoles.map(this.normalizeRole).includes(role);
        if (!hasRequiredRole) {
            throw new common_1.ForbiddenException('Insufficient role permissions');
        }
        return true;
    }
    hasPermission(role, permission) {
        const normalizedRole = this.normalizeRole(role);
        if (!normalizedRole) {
            return false;
        }
        const permissions = rolePermissions[normalizedRole] || [];
        return permissions.includes('*') || permissions.includes(permission);
    }
    normalizeRole(role) {
        const normalized = String(role).toLowerCase();
        return Object.values(user_interface_1.UserRole).find((value) => value === normalized);
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);
