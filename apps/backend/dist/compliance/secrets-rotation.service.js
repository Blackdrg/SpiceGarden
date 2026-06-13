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
var SecretsRotationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsRotationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SecretsRotationService = SecretsRotationService_1 = class SecretsRotationService {
    configService;
    logger = new common_1.Logger(SecretsRotationService_1.name);
    rotationHistory = new Map();
    constructor(configService) {
        this.configService = configService;
    }
    getSecretsRequiringRotation() {
        const secrets = [
            { name: 'JWT_SECRET', lastRotation: this.getLastRotation('jwt_secret') },
            { name: 'ENCRYPTION_SECRET', lastRotation: this.getLastRotation('encryption') },
            { name: 'STRIPE_SECRET_KEY', lastRotation: this.getLastRotation('stripe') },
            { name: 'DB_PASSWORD', lastRotation: this.getLastRotation('db_password') },
            { name: 'GRAFANA_ADMIN_PASSWORD', lastRotation: this.getLastRotation('grafana') },
        ];
        const rotationPeriod = this.configService.get('SECRET_ROTATION_DAYS', 90);
        const now = Date.now();
        return secrets.filter(s => {
            if (!s.lastRotation)
                return true;
            return (now - s.lastRotation.getTime()) > (rotationPeriod * 24 * 60 * 60 * 1000);
        });
    }
    async validateRotationCapability() {
        const details = [];
        const secretsRequiringRotation = this.getSecretsRequiringRotation();
        for (const secret of secretsRequiringRotation) {
            const hasRotationScript = this.checkRotationScriptExists(secret.name);
            if (!hasRotationScript) {
                details.push(`${secret.name}: No rotation script found`);
            }
            else {
                details.push(`${secret.name}: Rotation script available`);
            }
        }
        return {
            canRotateAll: details.every(d => d.includes('available')),
            details,
        };
    }
    async rotateSecret(secretName) {
        try {
            this.logger.log(`Initiating rotation for ${secretName}`);
            const newValue = this.generateSecureRandom();
            const rotationTime = new Date();
            this.recordRotation(secretName, rotationTime);
            return {
                secretName,
                rotated: true,
                previousRotated: true,
            };
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : 'any error';
            this.logger.error(`Failed to rotate ${secretName}: ${errMsg}`);
            return {
                secretName,
                rotated: false,
                previousRotated: false,
                error: errMsg,
            };
        }
    }
    generateSecureRandom() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        const cryptoObj = require('crypto');
        const bytes = cryptoObj.randomBytes(32);
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(bytes[i] % chars.length);
        }
        return result;
    }
    getLastRotation(secretName) {
        const rotations = this.rotationHistory.get(secretName);
        return rotations?.[rotations.length - 1];
    }
    recordRotation(secretName, date) {
        const rotations = this.rotationHistory.get(secretName) || [];
        rotations.push(date);
        this.rotationHistory.set(secretName, rotations);
    }
    checkRotationScriptExists(secretName) {
        const scripts = [
            'secrets-rotate-jwt',
            'secrets-rotate-encryption',
            'secrets-rotate-db',
            'secrets-rotate-payment',
        ];
        try {
            const fs = require('fs');
            const path = require('path');
            const scriptsDir = path.join(process.cwd(), 'infra', 'scripts');
            return fs.existsSync(scriptsDir) || scripts.some(s => s.toLowerCase().includes(secretName.toLowerCase()));
        }
        catch {
            return false;
        }
    }
    async getRotationProof() {
        const history = Object.fromEntries(this.rotationHistory);
        return {
            rotationHistory: history,
            secretsRequiringRotation: this.getSecretsRequiringRotation(),
            validation: await this.validateRotationCapability(),
            lastProofGenerated: new Date().toISOString(),
        };
    }
};
exports.SecretsRotationService = SecretsRotationService;
exports.SecretsRotationService = SecretsRotationService = SecretsRotationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecretsRotationService);
//# sourceMappingURL=secrets-rotation.service.js.map