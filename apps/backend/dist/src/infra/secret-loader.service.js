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
var SecretLoaderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretLoaderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let SecretLoaderService = SecretLoaderService_1 = class SecretLoaderService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SecretLoaderService_1.name);
        this.secretsDir = process.env.SECRETS_DIR || path.join(process.cwd(), 'secrets');
    }
    onModuleInit() {
        this.loadSecretsFromFile();
    }
    loadSecretsFromFile() {
        const secretFiles = [
            'jwt_secret',
            'encryption_secret',
            'stripe_secret',
            'razorpay_key_id',
            'razorpay_key_secret',
            'fcm_server_key',
            'apns_private_key',
            'apns_key_id',
            'apns_team_id',
            'sendgrid_api_key',
            'google_maps_api_key',
            'twilio_account_sid',
            'twilio_auth_token',
            'db_password',
            'redis_password',
            'vault_token',
            'stripe_webhook_secret',
            'razorpay_webhook_secret',
            'stripe_connect_secret',
            'stripe_connect_webhook_secret',
        ];
        for (const secretName of secretFiles) {
            const filePath = path.join(this.secretsDir, `${secretName}.txt`);
            if (fs.existsSync(filePath)) {
                const value = fs.readFileSync(filePath, 'utf8').trim();
                if (value && !value.includes('CHANGE_ME')) {
                    process.env[secretName.toUpperCase()] = value;
                    this.logger.debug(`Loaded secret: ${secretName}`);
                }
            }
        }
        this.loadSecretsWithFileSuffix();
    }
    loadSecretsWithFileSuffix() {
        for (const [key, value] of Object.entries(process.env)) {
            if (key.endsWith('_FILE') && value) {
                const filePath = value;
                if (fs.existsSync(filePath)) {
                    const secretValue = fs.readFileSync(filePath, 'utf8').trim();
                    const envVarName = key.replace('_FILE', '');
                    process.env[envVarName] = secretValue;
                    this.logger.debug(`Loaded ${envVarName} from ${filePath}`);
                }
                else {
                    this.logger.warn(`Secret file not found: ${filePath}`);
                }
            }
        }
    }
    static loadSecretFile(secretName) {
        const secretsDir = process.env.SECRETS_DIR || path.join(process.cwd(), 'secrets');
        const filePath = path.join(secretsDir, `${secretName}.txt`);
        if (fs.existsSync(filePath)) {
            const value = fs.readFileSync(filePath, 'utf8').trim();
            if (value && !value.includes('CHANGE_ME')) {
                return value;
            }
        }
        return null;
    }
};
exports.SecretLoaderService = SecretLoaderService;
exports.SecretLoaderService = SecretLoaderService = SecretLoaderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecretLoaderService);
//# sourceMappingURL=secret-loader.service.js.map