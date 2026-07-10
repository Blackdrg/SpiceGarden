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
exports.MfaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const otplib_1 = require("otplib");
const qrcode_1 = require("qrcode");
const user_entity_1 = require("../../db/entities/user.entity");
const mfa_entity_1 = require("../../db/entities/mfa.entity");
const encryption_service_1 = require("../../security/encryption.service");
let MfaService = class MfaService {
    userRepository;
    mfaSecretRepository;
    encryptionService;
    constructor(userRepository, mfaSecretRepository, encryptionService) {
        this.userRepository = userRepository;
        this.mfaSecretRepository = mfaSecretRepository;
        this.encryptionService = encryptionService;
    }
    async generateSecret(user) {
        const secret = otplib_1.authenticator.generateSecret();
        const otpAuthUrl = otplib_1.authenticator.keyuri(user.email, 'SpiceGarden', secret);
        let mfaSecret = await this.mfaSecretRepository.findOne({ where: { user: { id: user.id } } });
        if (!mfaSecret) {
            mfaSecret = this.mfaSecretRepository.create({ user });
        }
        mfaSecret.secret = await this.encryptionService.encrypt(secret);
        await this.mfaSecretRepository.save(mfaSecret);
        return {
            otpAuthUrl,
            qrCodeDataUrl: await (0, qrcode_1.toDataURL)(otpAuthUrl),
        };
    }
    async verifyCode(user, code) {
        const mfaSecret = await this.mfaSecretRepository.findOne({ where: { user: { id: user.id } } });
        if (!mfaSecret || !mfaSecret.secret) {
            return false;
        }
        const decryptedSecret = await this.encryptionService.decrypt(mfaSecret.secret);
        return otplib_1.authenticator.verify({
            token: code,
            secret: decryptedSecret,
        });
    }
    async enableMfa(userId, code) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user || !(await this.verifyCode(user, code)))
            return false;
        await this.userRepository.update(userId, { isMfaEnabled: true });
        return true;
    }
    async disableMfa(userId, code) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user || !(await this.verifyCode(user, code)))
            return false;
        await this.userRepository.update(userId, { isMfaEnabled: false });
        return true;
    }
};
exports.MfaService = MfaService;
exports.MfaService = MfaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(mfa_entity_1.MfaSecretEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        encryption_service_1.EncryptionService])
], MfaService);
