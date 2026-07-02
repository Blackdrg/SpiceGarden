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
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const user_interface_1 = require("../shared/domain/user.interface");
const permissions_1 = require("./permissions");
let PermissionGuard = class PermissionGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndMerge('permissions', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Authentication is required');
        }
        if (user.status !== user_interface_1.UserStatus.ACTIVE) {
            throw new common_1.ForbiddenException('User account is not active');
        }
        if (!user.role) {
            throw new common_1.ForbiddenException('User role is required');
        }
        const role = (0, permissions_1.normalizeUserRole)(user.role);
        if (!role) {
            throw new common_1.ForbiddenException('Invalid user role');
        }
        if (role === user_interface_1.UserRole.SUPER_ADMIN) {
            return true;
        }
        const hasEveryPermission = requiredPermissions.every((permission) => (0, permissions_1.hasRolePermission)(role, permission, user.permissions));
        if (!hasEveryPermission) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], PermissionGuard);
