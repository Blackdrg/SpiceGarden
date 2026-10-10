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
var ProductionFCMProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionFCMProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ProductionFCMProvider = ProductionFCMProvider_1 = class ProductionFCMProvider {
    configService;
    logger = new common_1.Logger(ProductionFCMProvider_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async sendMulticast(msg) {
        const fcmServerKey = this.configService.get('FCM_SERVER_KEY');
        const validTokens = msg.tokens.filter(t => Boolean(t) && t.length > 10);
        if (validTokens.length === 0) {
            return { success: true, successCount: 0, failureCount: 0, invalidTokens: [], messageIds: [] };
        }
        if (!fcmServerKey || fcmServerKey.includes('CHANGE_ME')) {
            this.logger.log(`[FCM Push Sandbox/Local] Sent "${msg.title}" to ${validTokens.length} devices.`);
            return {
                success: true,
                successCount: validTokens.length,
                failureCount: 0,
                invalidTokens: [],
                messageIds: validTokens.map((_, i) => `fcm_mock_${Date.now()}_${i}`)
            };
        }
        const batchSize = 500;
        let totalSuccess = 0;
        let totalFailure = 0;
        const invalidTokens = [];
        const messageIds = [];
        for (let i = 0; i < validTokens.length; i += batchSize) {
            const batchTokens = validTokens.slice(i, i + batchSize);
            try {
                const response = await fetch('https://fcm.googleapis.com/fcm/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `key=${fcmServerKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        registration_ids: batchTokens,
                        priority: msg.priority || 'high',
                        collapse_key: msg.collapseKey,
                        time_to_live: msg.ttlSeconds || 3600,
                        notification: {
                            title: msg.title,
                            body: msg.body,
                            sound: 'default'
                        },
                        data: msg.data || {},
                    }),
                });
                if (!response.ok) {
                    throw new Error(`FCM request failed with HTTP ${response.status}`);
                }
                const resData = (await response.json());
                if (resData && resData.results) {
                    totalSuccess += resData.success || 0;
                    totalFailure += resData.failure || 0;
                    resData.results.forEach((res, idx) => {
                        if (res.message_id) {
                            messageIds.push(res.message_id);
                        }
                        if (res.error === 'NotRegistered' || res.error === 'InvalidRegistration') {
                            invalidTokens.push(batchTokens[idx]);
                        }
                    });
                }
                else {
                    totalSuccess += batchTokens.length;
                }
            }
            catch (err) {
                this.logger.error(`FCM batch send error: ${err.message}`);
                totalFailure += batchTokens.length;
            }
        }
        return {
            success: totalFailure === 0 || totalSuccess > 0,
            successCount: totalSuccess,
            failureCount: totalFailure,
            invalidTokens,
            messageIds
        };
    }
};
exports.ProductionFCMProvider = ProductionFCMProvider;
exports.ProductionFCMProvider = ProductionFCMProvider = ProductionFCMProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProductionFCMProvider);
