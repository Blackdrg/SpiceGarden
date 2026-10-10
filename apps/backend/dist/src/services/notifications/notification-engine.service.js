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
var NotificationEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEngineService = void 0;
const common_1 = require("@nestjs/common");
const production_sms_provider_1 = require("./production-sms.provider");
const production_fcm_provider_1 = require("./production-fcm.provider");
const production_apns_provider_1 = require("./production-apns.provider");
const notification_preferences_service_1 = require("./notification-preferences.service");
let NotificationEngineService = NotificationEngineService_1 = class NotificationEngineService {
    smsProvider;
    fcmProvider;
    apnsProvider;
    preferencesService;
    logger = new common_1.Logger(NotificationEngineService_1.name);
    rateLimitWindow = new Map();
    deduplicationCache = new Map();
    dlq = [];
    metrics = {
        totalRequested: 0,
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalDeduplicated: 0,
        totalRateLimited: 0,
        byChannel: {
            sms: { sent: 0, failed: 0 },
            push: { sent: 0, failed: 0 },
            email: { sent: 0, failed: 0 }
        }
    };
    templates = {
        'order_placed': {
            requiredVars: ['orderId', 'totalAmount'],
            render: (d) => ({
                title: 'Order Confirmed!',
                body: `Your order #${d.orderId} for $${d.totalAmount} is placed and being prepared.`
            })
        },
        'order_dispatched': {
            requiredVars: ['orderId', 'driverName', 'etaMinutes'],
            render: (d) => ({
                title: 'Order On The Way!',
                body: `Driver ${d.driverName} is on the way with order #${d.orderId}. ETA: ${d.etaMinutes} mins.`
            })
        },
        'order_delivered': {
            requiredVars: ['orderId'],
            render: (d) => ({
                title: 'Order Delivered!',
                body: `Enjoy your meal! Order #${d.orderId} has been successfully delivered.`
            })
        }
    };
    constructor(smsProvider, fcmProvider, apnsProvider, preferencesService) {
        this.smsProvider = smsProvider;
        this.fcmProvider = fcmProvider;
        this.apnsProvider = apnsProvider;
        this.preferencesService = preferencesService;
    }
    validateTemplate(templateKey, data = {}) {
        const tmpl = this.templates[templateKey];
        if (!tmpl)
            return { isValid: true, missingVars: [] };
        const missing = tmpl.requiredVars.filter(v => data[v] === undefined || data[v] === null);
        return {
            isValid: missing.length === 0,
            missingVars: missing
        };
    }
    checkRateLimit(key, limit = 20, windowMs = 60000) {
        const now = Date.now();
        const timestamps = this.rateLimitWindow.get(key) || [];
        const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
        if (validTimestamps.length >= limit) {
            return false;
        }
        validTimestamps.push(now);
        this.rateLimitWindow.set(key, validTimestamps);
        return true;
    }
    checkDuplicate(dedupKey, windowMs = 300000) {
        const cached = this.deduplicationCache.get(dedupKey);
        if (cached && (Date.now() - cached.timestamp < windowMs)) {
            return cached.result;
        }
        return null;
    }
    async dispatch(req) {
        this.metrics.totalRequested++;
        const dedupKey = req.idempotencyKey || `${req.userId}_${req.type}_${req.title}_${JSON.stringify(req.templateData || {})}`;
        const duplicate = this.checkDuplicate(dedupKey);
        if (duplicate) {
            this.metrics.totalDeduplicated++;
            return { success: true, channelResults: duplicate, deduplicated: true };
        }
        const rateLimitKey = `rate_${req.userId}`;
        if (!this.checkRateLimit(rateLimitKey)) {
            this.metrics.totalRateLimited++;
            this.metrics.totalFailed++;
            throw new Error(`RateLimitExceeded: Maximum notification threshold exceeded for user ${req.userId}`);
        }
        let renderedTitle = req.title;
        let renderedBody = req.body;
        if (req.templateKey && this.templates[req.templateKey]) {
            const val = this.validateTemplate(req.templateKey, req.templateData);
            if (!val.isValid) {
                throw new Error(`TemplateValidationError: Missing required variables [${val.missingVars.join(', ')}] for template ${req.templateKey}`);
            }
            const rendered = this.templates[req.templateKey].render(req.templateData);
            renderedTitle = rendered.title;
            renderedBody = rendered.body;
        }
        const userPrefs = await this.preferencesService.getPreferences(req.userId).catch(() => ({
            smsDeliveryUpdates: true,
            pushOrders: true,
            pushDeliveryUpdates: true,
            emailOrders: true
        }));
        const allowSMS = userPrefs.smsDeliveryUpdates !== false && (userPrefs.sms !== false);
        const allowPush = (userPrefs.pushOrders !== false || userPrefs.pushDeliveryUpdates !== false) && (userPrefs.push !== false);
        const allowEmail = userPrefs.emailOrders !== false && (userPrefs.email !== false);
        const channelResults = {};
        await Promise.all(req.channels.map(async (channel) => {
            if (channel === 'sms' && allowSMS && req.phone) {
                channelResults.sms = await this.executeWithRetry(async () => {
                    return await this.smsProvider.sendSMS({
                        to: req.phone,
                        message: `${renderedTitle}: ${renderedBody}`,
                        tenantId: req.tenantId
                    });
                }, 'sms');
            }
            if (channel === 'push' && allowPush && req.deviceTokens) {
                channelResults.push = {};
                const pushPromises = [];
                if (req.deviceTokens.fcm && req.deviceTokens.fcm.length > 0) {
                    pushPromises.push(this.executeWithRetry(async () => {
                        return await this.fcmProvider.sendMulticast({
                            tokens: req.deviceTokens.fcm,
                            title: renderedTitle,
                            body: renderedBody,
                            data: req.templateData ? Object.fromEntries(Object.entries(req.templateData).map(([k, v]) => [k, String(v)])) : {}
                        });
                    }, 'push').then(res => { channelResults.push.fcm = res; }));
                }
                if (req.deviceTokens.apns && req.deviceTokens.apns.length > 0) {
                    pushPromises.push(this.executeWithRetry(async () => {
                        return await this.apnsProvider.sendPush({
                            deviceTokens: req.deviceTokens.apns,
                            title: renderedTitle,
                            body: renderedBody,
                            data: req.templateData
                        });
                    }, 'push').then(res => { channelResults.push.apns = res; }));
                }
                await Promise.all(pushPromises);
            }
        }));
        this.deduplicationCache.set(dedupKey, { timestamp: Date.now(), result: channelResults });
        this.metrics.totalSent++;
        this.metrics.totalDelivered++;
        return {
            success: true,
            channelResults
        };
    }
    async executeWithRetry(fn, channel, maxRetries = 3) {
        let attempt = 0;
        while (attempt < maxRetries) {
            attempt++;
            try {
                const res = await fn();
                this.metrics.byChannel[channel].sent++;
                return res;
            }
            catch (err) {
                if (attempt >= maxRetries) {
                    this.metrics.byChannel[channel].failed++;
                    this.metrics.totalFailed++;
                    this.dlq.push({
                        request: { userId: 'unknown', type: 'order_status', channels: [channel], title: 'Failed', body: err.message },
                        error: err.message,
                        timestamp: new Date().toISOString()
                    });
                    throw err;
                }
                const backoffMs = (20 * Math.pow(2, attempt)) + Math.random() * 10;
                await new Promise(r => setTimeout(r, backoffMs));
            }
        }
        throw new Error(`Failed after ${maxRetries} attempts`);
    }
    getMetrics() {
        return {
            ...this.metrics,
            dlqCount: this.dlq.length
        };
    }
};
exports.NotificationEngineService = NotificationEngineService;
exports.NotificationEngineService = NotificationEngineService = NotificationEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [production_sms_provider_1.ProductionSMSProvider,
        production_fcm_provider_1.ProductionFCMProvider,
        production_apns_provider_1.ProductionAPNsProvider,
        notification_preferences_service_1.NotificationPreferencesService])
], NotificationEngineService);
