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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../db/entities/user.entity");
const otp_entity_1 = require("../../db/entities/otp.entity");
const auth_service_1 = require("./auth.service");
const notification_service_1 = require("../notifications/notification.service");
const crypto = __importStar(require("crypto"));
let PasswordResetService = class PasswordResetService {
    constructor(configService, userRepo, otpRepo, authService, notificationService) {
        this.configService = configService;
        this.userRepo = userRepo;
        this.otpRepo = otpRepo;
        this.authService = authService;
        this.notificationService = notificationService;
    }
    async generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }
    async sendOTPByEmail(email, otp) {
        if (!email || !otp)
            return;
        const sendgridKey = this.configService.get('SENDGRID_API_KEY');
        if (!sendgridKey || sendgridKey.includes('CHANGE_ME')) {
            await this.notificationService.sendEmail(email, 'Password Reset Code', 'd-reset-template', { code: otp, expiry: '5 minutes' });
            return;
        }
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sendgridKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email }], subject: 'Your SpiceGarden Password Reset Code' }],
                from: { email: 'noreply@spicegarden.com' },
                content: [{ type: 'text/plain', value: `Your password reset code is: ${otp}. Valid for 5 minutes.` }],
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to send email: ${error}`);
        }
    }
    async sendOTPBySMS(phone, otp) {
        await this.notificationService.sendSMS(phone, `Your SpiceGarden password reset code is: ${otp}. Valid for 5 minutes.`);
    }
    async forgotPassword(email) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            return;
        }
        const otp = await this.generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.otpRepo.save({
            userId: user.id,
            type: otp_entity_1.OtpType.PASSWORD_RESET,
            code: otp,
            status: otp_entity_1.OtpStatus.PENDING,
            expiresAt,
        });
        if (user.phone) {
            await this.sendOTPBySMS(user.phone, otp);
        }
        else {
            await this.sendOTPByEmail(email, otp);
        }
    }
    async verifyResetCode(email, code) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otp = await this.otpRepo.findOne({
            where: {
                userId: user.id,
                type: otp_entity_1.OtpType.PASSWORD_RESET,
                status: otp_entity_1.OtpStatus.PENDING,
            },
            order: { createdAt: 'DESC' },
        });
        if (!otp) {
            throw new common_1.UnauthorizedException('Invalid or expired reset code');
        }
        if (otp.code !== code) {
            throw new common_1.UnauthorizedException('Invalid reset code');
        }
        if (otp.expiresAt.getTime() <= Date.now()) {
            await this.otpRepo.update(otp.id, { status: otp_entity_1.OtpStatus.EXPIRED });
            throw new common_1.UnauthorizedException('Reset code has expired');
        }
        await this.otpRepo.update(otp.id, { status: otp_entity_1.OtpStatus.VERIFIED, verifiedAt: new Date() });
        return true;
    }
    async resetPassword(email, code, newPassword) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otp = await this.otpRepo.findOne({
            where: {
                userId: user.id,
                type: otp_entity_1.OtpType.PASSWORD_RESET,
                status: otp_entity_1.OtpStatus.VERIFIED,
            },
            order: { verifiedAt: 'DESC' },
        });
        if (!otp) {
            throw new common_1.UnauthorizedException('Invalid or expired reset code');
        }
        if (otp.code !== code) {
            throw new common_1.UnauthorizedException('Invalid reset code');
        }
        const passwordHash = await this.authService.hashPassword(newPassword);
        await this.userRepo.update(user.id, { passwordHash });
        await this.otpRepo.update(otp.id, { status: otp_entity_1.OtpStatus.VERIFIED });
    }
};
exports.PasswordResetService = PasswordResetService;
exports.PasswordResetService = PasswordResetService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(otp_entity_1.OtpEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeorm_2.Repository,
        typeorm_2.Repository,
        auth_service_1.AuthService,
        notification_service_1.NotificationService])
], PasswordResetService);
