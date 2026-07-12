"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const user_entity_1 = require("../../db/entities/user.entity");
const otp_entity_1 = require("../../db/entities/otp.entity");
const notification_service_1 = require("../notifications/notification.service");
const auth_service_1 = require("./auth.service");
const GENERIC_MESSAGE = 'If an account exists for this email, a one-time login code has been sent.';
let OtpService = class OtpService {
    configService;
    userRepo;
    otpRepo;
    notificationService;
    authService;
    constructor(configService, userRepo, otpRepo, notificationService, authService) {
        this.configService = configService;
        this.userRepo = userRepo;
        this.otpRepo = otpRepo;
        this.notificationService = notificationService;
        this.authService = authService;
    }
    generateCode() {
        return crypto.randomInt(100000, 1000000).toString();
    }
    getExpiryMs() {
        const minutes = Number(this.configService.get('OTP_EXPIRY_MINUTES', 10));
        return minutes * 60 * 1000;
    }
    async requestOtp(email) {
        if (!email) {
            throw new common_1.BadRequestException('Email is required');
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await this.userRepo.findOne({ where: { email: normalizedEmail } });
        if (!user) {
            return { message: GENERIC_MESSAGE };
        }
        await this.otpRepo.update({ userId: user.id, type: otp_entity_1.OtpType.LOGIN, status: otp_entity_1.OtpStatus.PENDING }, { status: otp_entity_1.OtpStatus.EXPIRED });
        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + this.getExpiryMs());
        await this.otpRepo.save({
            userId: user.id,
            type: otp_entity_1.OtpType.LOGIN,
            code,
            status: otp_entity_1.OtpStatus.PENDING,
            expiresAt,
        });
        const expiryMinutes = Math.round(this.getExpiryMs() / 60000);
        if (user.phone && !user.phone.startsWith('social-')) {
            await this.notificationService.sendSMS(user.phone, `Your SpiceGarden login code is: ${code}. Valid for ${expiryMinutes} minutes.`);
        }
        else {
            await this.notificationService.sendEmail(user.email, 'Your SpiceGarden Login Code', 'd-login-otp', { code, expiry: `${expiryMinutes} minutes` });
        }
        return { message: GENERIC_MESSAGE };
    }
    async verifyOtp(email, code, deviceInfo) {
        if (!email || !code) {
            throw new common_1.BadRequestException('Email and code are required');
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await this.userRepo.findOne({ where: { email: normalizedEmail } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid or expired code');
        }
        const otp = await this.otpRepo.findOne({
            where: {
                userId: user.id,
                type: otp_entity_1.OtpType.LOGIN,
                status: otp_entity_1.OtpStatus.PENDING,
            },
            order: { createdAt: 'DESC' },
        });
        if (!otp) {
            throw new common_1.UnauthorizedException('Invalid or expired code');
        }
        if (otp.expiresAt.getTime() <= Date.now()) {
            await this.otpRepo.update(otp.id, { status: otp_entity_1.OtpStatus.EXPIRED });
            throw new common_1.UnauthorizedException('Code has expired');
        }
        const provided = Buffer.from(code);
        const expected = Buffer.from(otp.code);
        const matches = provided.length === expected.length &&
            crypto.timingSafeEqual(provided, expected);
        if (!matches) {
            throw new common_1.UnauthorizedException('Invalid or expired code');
        }
        await this.otpRepo.update(otp.id, {
            status: otp_entity_1.OtpStatus.VERIFIED,
            verifiedAt: new Date(),
        });
        if (user.isMfaEnabled) {
            return { mfaRequired: true, email: user.email };
        }
        const { passwordHash, ...authenticatedUser } = user;
        const tokens = await this.authService.login(authenticatedUser, deviceInfo);
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
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(otp_entity_1.OtpEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService,
        auth_service_1.AuthService])
], OtpService);
