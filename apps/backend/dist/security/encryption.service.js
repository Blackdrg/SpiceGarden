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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const CryptoJS = __importStar(require("crypto-js"));
let EncryptionService = class EncryptionService {
    configService;
    secretKey;
    constructor(configService) {
        this.configService = configService;
        this.secretKey = this.configService.get('ENCRYPTION_SECRET');
        if (!this.secretKey || this.secretKey.includes('CHANGE_ME')) {
            throw new Error('ENCRYPTION_SECRET not configured. Set secure random secret before starting.');
        }
    }
    encrypt(text) {
        return CryptoJS.AES.encrypt(text, this.secretKey).toString();
    }
    decrypt(ciphertext) {
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
            return bytes.toString(CryptoJS.enc.Utf8);
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
                    const errMsg = error instanceof Error ? error.message : 'any';
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
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map