"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionNotificationService = void 0;
const common_1 = require("@nestjs/common");
let ProductionNotificationService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProductionNotificationService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ProductionNotificationService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        logger = new common_1.Logger(ProductionNotificationService.name);
        defaultChannels = {
            email: true,
            sms: false,
            push: true,
            webhook: false,
        };
        constructor(configService) {
            this.configService = configService;
        }
        async sendPaymentNotification(userId, paymentId, alert) {
            const payload = { ...alert, userId, paymentId };
            await this.sendNotification(payload);
        }
        async sendOrderNotification(userId, orderId, alert) {
            const payload = { ...alert, userId, orderId };
            await this.sendNotification(payload);
        }
        async sendFraudAlert(userId, alert) {
            const payload = { ...alert, userId, type: 'fraud_detected', severity: alert.severity || 'high' };
            await this.sendNotification(payload);
        }
        async sendWebhookAlert(webhookId, error, payload) {
            const alert = {
                type: 'webhook_failure',
                severity: 'high',
                userId: 'system',
                message: `Webhook ${webhookId} failed: ${error}`,
                metadata: { webhookId, payload },
            };
            await this.sendNotification(alert);
        }
        async sendNotification(alert) {
            const channels = this.configService.get('NOTIFICATION_CHANNELS', this.defaultChannels);
            if (alert.severity === 'critical' || alert.severity === 'high') {
                if (channels.slack) {
                    await this.sendSlackAlert(alert);
                }
            }
            if (channels.email) {
                await this.sendEmailNotification(alert);
            }
            if (alert.severity === 'critical' && channels.sms) {
                await this.sendSMSForAlert(alert);
            }
            if (channels.push) {
                await this.sendPushNotification(alert);
            }
        }
        async sendWebhookAlertForNotification(alert) {
            const webhookUrl = this.configService.get('ALERT_WEBHOOK_URL');
            if (!webhookUrl) {
                this.logger.warn('No webhook URL configured for alerts');
                return;
            }
            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.configService.get('ALERT_WEBHOOK_SECRET') || ''}`,
                    },
                    body: JSON.stringify({
                        ...alert,
                        timestamp: new Date().toISOString(),
                    }),
                });
                if (!response.ok) {
                    this.logger.error(`Failed to send webhook alert: ${response.statusText}`);
                }
            }
            catch (error) {
                this.logger.error('Webhook alert failed:', error);
            }
        }
        async sendSlackAlert(alert) {
            const slackWebhook = this.configService.get('SLACK_WEBHOOK_URL');
            if (!slackWebhook) {
                this.logger.warn('No Slack webhook URL configured');
                return;
            }
            const color = {
                low: 'good',
                medium: 'warning',
                high: 'danger',
                critical: 'danger',
            }[alert.severity];
            try {
                await fetch(slackWebhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        attachments: [{
                                color,
                                title: `Payment Alert: ${alert.type}`,
                                text: alert.message,
                                fields: [
                                    { title: 'User ID', value: alert.userId, short: true },
                                    { title: 'Order ID', value: alert.orderId || 'N/A', short: true },
                                    { title: 'Payment ID', value: alert.paymentId || 'N/A', short: true },
                                    { title: 'Amount', value: alert.amount ? `$${alert.amount}` : 'N/A', short: true },
                                    { title: 'Severity', value: alert.severity, short: true },
                                ],
                                ts: Math.floor(Date.now() / 1000),
                            }],
                    }),
                });
            }
            catch (error) {
                this.logger.error('Slack alert failed:', error);
            }
        }
        async sendEmailNotification(alert) {
            const sendgridKey = this.configService.get('SENDGRID_API_KEY');
            const adminEmail = this.configService.get('ADMIN_ALERT_EMAIL');
            if (!sendgridKey || !adminEmail) {
                this.logger.warn('SendGrid not configured for email alerts');
                return;
            }
            try {
                const subject = `[${alert.severity.toUpperCase()}] Payment ${alert.type} - ${alert.userId}`;
                const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sendgridKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        personalizations: [{ to: [{ email: adminEmail }], subject }],
                        from: { email: 'alerts@spicegarden.com' },
                        content: [{ type: 'text/plain', value: alert.message }],
                    }),
                });
                if (!response.ok) {
                    this.logger.error(`Failed to send email alert: ${response.statusText}`);
                }
            }
            catch (error) {
                this.logger.error('Email alert failed:', error);
            }
        }
        async sendSMSForAlert(alert) {
            const accountSid = this.configService.get('TWILIO_SID');
            const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
            const adminPhone = this.configService.get('ADMIN_ALERT_PHONE');
            if (!accountSid || !authToken || !adminPhone) {
                this.logger.warn('Twilio not configured for SMS alerts');
                return;
            }
            try {
                await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        From: adminPhone,
                        To: adminPhone,
                        Body: `[${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}`,
                    }),
                });
            }
            catch (error) {
                this.logger.error('SMS alert failed:', error);
            }
        }
        async sendPushNotification(alert) {
            this.logger.log(`Push notification queued for ${alert.userId}: ${alert.type} - ${alert.severity}`);
        }
    };
    return ProductionNotificationService = _classThis;
})();
exports.ProductionNotificationService = ProductionNotificationService;
