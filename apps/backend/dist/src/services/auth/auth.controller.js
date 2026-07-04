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
var _a, _b;
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
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
function setAuthCookies(res, accessToken, refreshToken, configService) {
    const sessionDurationDays = Number(configService.get('SESSION_DURATION_DAYS', 30));
    const isProduction = configService.get('NODE_ENV') === 'production';
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
        path: '/',
    });
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: sessionDurationDays * 24 * 60 * 60 * 1000,
        path: '/',
    });
}
function clearAuthCookies(res) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
}
let AuthController = class AuthController {
    authService;
    passwordResetService;
    userRepo;
    notificationService;
    configService;
    constructor(authService, passwordResetService, userRepo, notificationService, configService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
        this.configService = configService;
    }
    async login(body, req, res) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        const deviceInfo = this.getDeviceInfo(body, req);
        const tokens = await this.authService.login(user, deviceInfo);
        setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                status: user.status,
            },
        };
    }
    async register(body, req, res) {
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
        const tokens = await this.authService.login(savedUser, deviceInfo);
        setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: savedUser.id,
                email: savedUser.email,
                fullName: savedUser.fullName,
                role: savedUser.role,
                status: savedUser.status,
            },
        };
    }
    async refreshToken(req, res) {
        const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Missing refresh token');
        }
        const deviceInfo = this.getDeviceInfo({}, req);
        const tokens = await this.authService.refreshAccessToken(refreshToken, deviceInfo);
        setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);
        return { refresh_token: tokens.refresh_token };
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
        if (refreshToken) {
            await this.authService.revokeSession(refreshToken);
        }
        clearAuthCookies(res);
        return { revoked: true };
    }
    async me(req) {
        const user = req.user;
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                status: user.status,
            },
        };
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
    async googleAuth() {
        return;
    }
    async googleAuthCallback(req, res) {
        const socialUser = req.user;
        const tokens = await this.authService.loginWithSocial({
            email: socialUser.email,
            fullName: socialUser.fullName || socialUser.displayName || '',
            socialId: socialUser.id,
            socialProvider: 'google',
        });
        setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/`);
    }
    async facebookAuth() {
        return;
    }
    async facebookAuthCallback(req, res) {
        const socialUser = req.user;
        const fullName = socialUser.fullName || socialUser.displayName ||
            [socialUser.name?.givenName, socialUser.name?.familyName].filter(Boolean).join(' ') ||
            '';
        const tokens = await this.authService.loginWithSocial({
            email: socialUser.email,
            fullName,
            socialId: socialUser.id,
            socialProvider: 'facebook',
        });
        setAuthCookies(res, tokens.access_token, tokens.refresh_token, this.configService);
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/`);
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
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
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
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthCallback", null);
__decorate([
    (0, common_1.Get)('facebook'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('facebook')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "facebookAuth", null);
__decorate([
    (0, common_1.Get)('facebook/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('facebook')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "facebookAuthCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        password_reset_service_1.PasswordResetService, typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, notification_service_1.NotificationService, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], AuthController);
