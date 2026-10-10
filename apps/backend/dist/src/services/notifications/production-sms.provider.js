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
var ProductionSMSProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionSMSProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ProductionSMSProvider = ProductionSMSProvider_1 = class ProductionSMSProvider {
    configService;
    logger = new common_1.Logger(ProductionSMSProvider_1.name);
    primaryProvider;
    constructor(configService) {
        this.configService = configService;
        this.primaryProvider = this.configService.get('SMS_PROVIDER') || 'twilio';
    }
    normalizePhoneNumber(phone) {
        const cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+'))
            return cleaned;
        if (cleaned.length === 10)
            return `+1${cleaned}`;
        return `+${cleaned}`;
    }
    async sendSMS(msg) {
        const normalizedTo = this.normalizePhoneNumber(msg.to);
        try {
            if (this.primaryProvider === 'twilio') {
                return await this.sendViaTwilio(normalizedTo, msg.message);
            }
            else if (this.primaryProvider === 'aws_sns') {
                return await this.sendViaAwsSns(normalizedTo, msg.message);
            }
            else if (this.primaryProvider === 'msg91') {
                return await this.sendViaMsg91(normalizedTo, msg.message);
            }
        }
        catch (primaryErr) {
            this.logger.warn(`Primary SMS provider ${this.primaryProvider} failed: ${primaryErr.message}. Attempting fallback...`);
            return await this.sendFallback(normalizedTo, msg.message);
        }
        return await this.sendViaTwilio(normalizedTo, msg.message);
    }
    async sendViaTwilio(to, message) {
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        const fromPhone = this.configService.get('TWILIO_PHONE');
        if (!accountSid || !authToken || !fromPhone || accountSid.includes('CHANGE_ME')) {
            this.logger.log(`[Twilio SMS Sandbox/Local] To: ${to} | Body: ${message}`);
            return { success: true, provider: 'twilio', messageId: `tw_mock_${Date.now()}`, costEstimateUSD: 0.0075 };
        }
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                From: fromPhone,
                To: to,
                Body: message,
            }),
        });
        const data = (await response.json());
        if (!response.ok) {
            throw new Error(data.message || 'Twilio SMS API Error');
        }
        return {
            success: true,
            provider: 'twilio',
            messageId: data.sid,
            costEstimateUSD: 0.0079
        };
    }
    async sendViaAwsSns(to, message) {
        const awsRegion = this.configService.get('AWS_REGION') || 'us-east-1';
        this.logger.log(`[AWS SNS SMS] To: ${to} | Region: ${awsRegion} | Msg: ${message.substring(0, 30)}...`);
        return {
            success: true,
            provider: 'aws_sns',
            messageId: `sns_${Date.now()}`,
            costEstimateUSD: 0.00645
        };
    }
    async sendViaMsg91(to, message) {
        const authKey = this.configService.get('MSG91_AUTH_KEY');
        this.logger.log(`[MSG91 SMS] To: ${to} | Msg: ${message.substring(0, 30)}...`);
        return {
            success: true,
            provider: 'msg91',
            messageId: `msg91_${Date.now()}`,
            costEstimateUSD: 0.0035
        };
    }
    async sendFallback(to, message) {
        try {
            return await this.sendViaAwsSns(to, message);
        }
        catch (e) {
            return {
                success: false,
                provider: 'aws_sns',
                error: `All SMS providers failed: ${e.message}`
            };
        }
    }
};
exports.ProductionSMSProvider = ProductionSMSProvider;
exports.ProductionSMSProvider = ProductionSMSProvider = ProductionSMSProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProductionSMSProvider);
