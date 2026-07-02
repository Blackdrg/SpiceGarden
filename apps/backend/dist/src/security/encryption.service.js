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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const missing_env_error_1 = require("../common/errors/missing-env.error");
let EncryptionService = class EncryptionService {
    configService;
    key;
    constructor(configService) {
        this.configService = configService;
        const secret = (0, missing_env_error_1.getRequiredSecret)(this.configService, 'ENCRYPTION_SECRET');
        const salt = crypto.randomBytes(16);
        this.key = crypto.scryptSync(secret, salt, 32);
    }
    encrypt(text) {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
        const plaintext = Buffer.from(text, 'utf-8');
        const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return `${iv.toString('base64')}.${ciphertext.toString('base64')}.${Buffer.from(authTag).toString('base64')}`;
    }
    decrypt(payload) {
        try {
            const [ivB64, ciphertextB64, tagB64] = payload.split('.');
            if (!ivB64 || !ciphertextB64 || !tagB64)
                throw new Error('Invalid payload format');
            const iv = Buffer.from(ivB64, 'base64');
            const ciphertext = Buffer.from(ciphertextB64, 'base64');
            const authTag = Buffer.from(tagB64, 'base64');
            const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
            decipher.setAuthTag(authTag);
            const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
            return plaintext.toString('utf-8');
        }
        catch {
            throw new Error('Decryption failed');
        }
    }
    encryptPiiFields(obj, fields) {
        if (typeof obj !== 'object' || obj === null)
            return obj;
        const encrypted = { ...obj };
        for (const field of fields) {
            const value = encrypted[field];
            if (typeof value === 'string') {
                encrypted[field] = this.encrypt(value);
            }
        }
        return encrypted;
    }
    decryptPiiFields(obj, fields) {
        if (typeof obj !== 'object' || obj === null)
            return obj;
        const decrypted = { ...obj };
        for (const field of fields) {
            const value = decrypted[field];
            if (typeof value === 'string') {
                try {
                    decrypted[field] = this.decrypt(value);
                }
                catch (error) {
                    const errMsg = error instanceof Error ? error.message : 'unknown';
                    throw new Error(`Failed to decrypt field ${field}: ${errMsg}`);
                }
            }
        }
        return decrypted;
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], EncryptionService);
