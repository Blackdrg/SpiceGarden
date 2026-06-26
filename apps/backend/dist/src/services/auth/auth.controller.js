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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const password_reset_service_1 = require("./password-reset.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../db/entities/user.entity");
const user_interface_1 = require("../../shared/domain/user.interface");
const notification_service_1 = require("../notifications/notification.service");
let AuthController = class AuthController {
    authService;
    passwordResetService;
    userRepo;
    notificationService;
    constructor(authService, passwordResetService, userRepo, notificationService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
    }
    async login(body, req) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        const deviceInfo = this.getDeviceInfo(body, req);
        return this.authService.login(user, deviceInfo);
    }
    async register(body, req) {
        const existing = await this.userRepo.findOne({ where: { email: body.email } });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await this.authService.hashPassword(body.password);
        const user = this.userRepo.create({
            email: body.email,
            phone: body.phone,
            fullName: body.fullName,
            passwordHash,
            role: user_interface_1.UserRole.CUSTOMER,
            status: user_interface_1.UserStatus.ACTIVE,
        });
        const savedUser = await this.userRepo.save(user);
        const deviceInfo = this.getDeviceInfo(body, req);
        return this.authService.login(savedUser, deviceInfo);
    }
    async refreshToken(body, req) {
        const deviceInfo = this.getDeviceInfo(body, req);
        return this.authService.refreshAccessToken(body.refresh_token, deviceInfo);
    }
    async logout(body) {
        await this.authService.revokeSession(body.refresh_token);
        return { revoked: true };
    }
    async forgotPassword(body) {
        if (!body.email) {
            return { message: 'If your email exists in our system, we have sent a reset code to it.' };
        }
        await this.passwordResetService.forgotPassword(body.email);
        return { message: 'If your email exists in our system, we have sent a reset code to it.' };
    }
    async verifyResetCode(body) {
        if (!body.email || !body.code) {
            throw new common_1.BadRequestException('Email and code are required');
        }
        await this.passwordResetService.verifyResetCode(body.email, body.code);
        return { valid: true };
    }
    async resetPassword(body) {
        if (!body.email || !body.code || !body.password) {
            throw new common_1.BadRequestException('Email, code, and password are required');
        }
        if (body.password.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters');
        }
        await this.passwordResetService.resetPassword(body.email, body.code, body.password);
        return { success: true, message: 'Password reset successful' };
    }
    getDeviceInfo(body, req) {
        return {
            name: body.deviceName || 'any Device',
            type: body.deviceType || 'any Type',
            ip: req.ip || '0.0.0.0',
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('verify-reset-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyResetCode", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        password_reset_service_1.PasswordResetService,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], AuthController);
