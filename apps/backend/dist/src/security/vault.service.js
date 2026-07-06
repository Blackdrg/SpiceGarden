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
var VaultService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let VaultService = VaultService_1 = class VaultService {
    configService;
    logger = new common_1.Logger(VaultService_1.name);
    vaultEnabled;
    vaultAddress;
    vaultToken;
    secretPath;
    cache;
    cacheTtlMs = 5 * 60 * 1000;
    constructor(configService) {
        this.configService = configService;
        this.vaultEnabled = this.configService.get('VAULT_ENABLED', false);
        this.vaultAddress = this.configService.get('VAULT_ADDR', 'http://vault:8200');
        this.vaultToken = this.configService.get('VAULT_TOKEN', '');
        this.secretPath = this.configService.get('VAULT_SECRET_PATH', 'secret/spicegarden');
        this.cache = new Map();
    }
    async onModuleInit() {
        if (this.vaultEnabled) {
            await this.initializeVault();
        }
        else {
            this.logger.log('Vault integration disabled - using local secrets');
        }
    }
    async initializeVault() {
        try {
            const response = await this.fetchFromVault(`${this.vaultAddress}/v1/sys/health`);
            if (response.initialized && response.healthy) {
                this.logger.log('Vault connection verified');
            }
            else {
                this.logger.warn('Vault not healthy - falling back to local secrets');
            }
        }
        catch (error) {
            this.logger.warn(`Vault initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getSecret(key, fallback) {
        if (this.vaultEnabled) {
            const cached = this.cache.get(key);
            if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
                return cached.value;
            }
            try {
                const secretValue = await this.fetchSecretFromVault(key);
                this.cache.set(key, { value: secretValue, timestamp: Date.now() });
                return secretValue;
            }
            catch (error) {
                this.logger.warn(`Failed to fetch secret ${key} from Vault: ${error instanceof Error ? error.message : String(error)}`);
                if (fallback !== undefined) {
                    return fallback;
                }
            }
        }
        return fallback;
    }
    async fetchSecretFromVault(key) {
        const response = await this.fetchFromVault(`${this.vaultAddress}/v1/${this.secretPath}/${key}`);
        return response.data.value;
    }
    async fetchFromVault(url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Vault-Token': this.vaultToken,
            },
        });
        if (!response.ok) {
            throw new Error(`Vault request failed: ${response.status}`);
        }
        return response.json();
    }
    async rotateSecret(key, newValue) {
        if (!this.vaultEnabled) {
            this.logger.warn('Vault not enabled - cannot rotate secret');
            return false;
        }
        try {
            const response = await fetch(`${this.vaultAddress}/v1/${this.secretPath}/${key}`, {
                method: 'POST',
                headers: {
                    'X-Vault-Token': this.vaultToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: { value: newValue } }),
            });
            if (response.ok) {
                this.cache.set(key, { value: newValue, timestamp: Date.now() });
                this.logger.log(`Secret ${key} rotated successfully`);
                return true;
            }
        }
        catch (error) {
            this.logger.error(`Failed to rotate secret ${key}: ${error instanceof Error ? error.message : String(error)}`);
        }
        return false;
    }
    async auditSecrets() {
        const requiredSecrets = [
            'JWT_SECRET',
            'ENCRYPTION_SECRET',
            'STRIPE_SECRET_KEY',
            'RAZORPAY_KEY_SECRET',
            'STRIPE_WEBHOOK_SECRET',
            'RAZORPAY_WEBHOOK_SECRET',
        ];
        const missing = [];
        const valid = [];
        for (const secret of requiredSecrets) {
            try {
                const value = await this.getSecret(secret, process.env[secret]);
                if (value && !value.includes('CHANGE_ME') && !value.includes('placeholder')) {
                    valid.push(secret);
                }
                else {
                    missing.push(secret);
                }
            }
            catch {
                missing.push(secret);
            }
        }
        return { missing, valid };
    }
    isVaultConfigured() {
        return this.vaultEnabled && !!this.vaultToken;
    }
};
exports.VaultService = VaultService;
exports.VaultService = VaultService = VaultService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VaultService);
