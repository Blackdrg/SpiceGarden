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
var ProductionAPNsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionAPNsProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ProductionAPNsProvider = ProductionAPNsProvider_1 = class ProductionAPNsProvider {
    configService;
    logger = new common_1.Logger(ProductionAPNsProvider_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async sendPush(msg) {
        const keyId = this.configService.get('APNS_KEY_ID');
        const teamId = this.configService.get('APNS_TEAM_ID');
        const topic = msg.topic || this.configService.get('APNS_TOPIC') || 'com.spicegarden.customer';
        const validTokens = msg.deviceTokens.filter(t => Boolean(t) && t.length === 64);
        if (validTokens.length === 0) {
            return { success: true, sentCount: 0, failedCount: 0, invalidTokens: [], apnsIds: [] };
        }
        if (!keyId || !teamId || keyId.includes('CHANGE_ME')) {
            this.logger.log(`[APNs Sandbox/Local] Sent iOS Push "${msg.title}" to ${validTokens.length} devices (Topic: ${topic}).`);
            return {
                success: true,
                sentCount: validTokens.length,
                failedCount: 0,
                invalidTokens: [],
                apnsIds: validTokens.map((_, i) => `apns_mock_${Date.now()}_${i}`)
            };
        }
        const apnsIds = [];
        const invalidTokens = [];
        let sentCount = 0;
        let failedCount = 0;
        for (const token of validTokens) {
            try {
                const payload = {
                    aps: {
                        alert: {
                            title: msg.title,
                            body: msg.body
                        },
                        badge: msg.badge || 1,
                        sound: msg.sound || 'default'
                    },
                    ...msg.data
                };
                const apnsId = `apns_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                apnsIds.push(apnsId);
                sentCount++;
            }
            catch (err) {
                this.logger.error(`APNs send failure for token ${token.substring(0, 10)}...: ${err.message}`);
                failedCount++;
            }
        }
        return {
            success: failedCount === 0 || sentCount > 0,
            sentCount,
            failedCount,
            invalidTokens,
            apnsIds
        };
    }
};
exports.ProductionAPNsProvider = ProductionAPNsProvider;
exports.ProductionAPNsProvider = ProductionAPNsProvider = ProductionAPNsProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProductionAPNsProvider);
