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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RazorpaySettlementService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpaySettlementService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const payout_report_entity_1 = require("../../db/entities/payout-report.entity");
const missing_env_error_1 = require("../../common/errors/missing-env.error");
let RazorpaySettlementService = RazorpaySettlementService_1 = class RazorpaySettlementService {
    configService;
    restaurantRepo;
    payoutRepo;
    logger = new common_1.Logger(RazorpaySettlementService_1.name);
    baseUrl = 'https://api.razorpay.com/v1';
    keyId;
    keySecret;
    constructor(configService, restaurantRepo, payoutRepo) {
        this.configService = configService;
        this.restaurantRepo = restaurantRepo;
        this.payoutRepo = payoutRepo;
        this.keyId = (0, missing_env_error_1.getRequiredSecret)(this.configService, 'RAZORPAY_KEY_ID');
        this.keySecret = (0, missing_env_error_1.getRequiredSecret)(this.configService, 'RAZORPAY_KEY_SECRET');
    }
    async rzpRequest(method, endpoint, data) {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
            method,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: method !== 'GET' && method !== 'DELETE' ? JSON.stringify(data) : undefined,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message = errorData?.error?.description || `Razorpay API error: ${response.status}`;
            throw new Error(message);
        }
        if (method === 'DELETE') {
            return {};
        }
        return response.json();
    }
    async createFundAccount(restaurantId, accountData) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        try {
            const fundAccount = await this.rzpRequest('POST', 'fund_accounts', {
                account_type: 'bank_account',
                bank_account: {
                    name: accountData.bankAccount.accountHolderName,
                    ifsc: accountData.bankAccount.ifscCode,
                    account_number: accountData.bankAccount.accountNumber,
                },
                contact: {
                    name: accountData.legalBusinessName,
                    email: accountData.email,
                    phone: accountData.phone,
                    type: 'vendor',
                    reference_type: 'restaurant',
                    reference_id: restaurantId,
                    gstin: accountData.gstin || undefined,
                    pan: accountData.pan || undefined,
                },
                notes: {
                    restaurant_id: restaurantId,
                    gstin: accountData.gstin || '',
                    business_type: accountData.businessType,
                },
            });
            restaurant.razorpayFundAccountId = fundAccount.id;
            await this.restaurantRepo.save(restaurant);
            this.logger.log(`Created Razorpay fund account ${fundAccount.id} for restaurant ${restaurantId}`);
            return {
                fundAccountId: fundAccount.id,
                bankDetails: {
                    accountNumber: accountData.bankAccount.accountNumber.slice(-4).padStart(accountData.bankAccount.accountNumber.length, '*'),
                    ifscCode: accountData.bankAccount.ifscCode,
                    bankName: accountData.bankAccount.bankName,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Razorpay fund account for restaurant ${restaurantId}:`, error);
            throw new common_1.BadRequestException(`Fund account creation failed: ${error.message}`);
        }
    }
    async processPayout(restaurantId, payoutId, amount, currency = 'INR') {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        if (!restaurant.razorpayFundAccountId) {
            throw new common_1.BadRequestException('No fund account found. Complete settlement onboarding first.');
        }
        const payoutReport = await this.payoutRepo.findOne({ where: { id: payoutId } });
        if (!payoutReport) {
            throw new common_1.NotFoundException('Payout report not found');
        }
        if (payoutReport.restaurantId !== restaurantId) {
            throw new common_1.BadRequestException('Payout does not belong to this restaurant');
        }
        try {
            const platformFeePercent = this.configService.get('RAZORPAY_PLATFORM_FEE_PERCENT', 2);
            const amountInPaise = Math.round(amount * 100);
            const fee = Math.round((amount * platformFeePercent / 100) * 100);
            const tax = Math.round(fee * 0.18);
            const effectiveAmount = amountInPaise - fee - tax;
            const settlement = await this.rzpRequest('POST', 'settlements', {
                amount: effectiveAmount,
                currency,
                mode: 'IMPS',
                fund_account_id: restaurant.razorpayFundAccountId,
                notify_sms: true,
                notify_email: true,
                notes: {
                    restaurant_id: restaurantId,
                    payout_id: payoutId,
                    type: 'platform_payout',
                },
            });
            await this.payoutRepo.update(payoutId, {
                status: payout_report_entity_1.PayoutStatus.PROCESSING,
                payoutReference: `rzp_settlement_${settlement.id}`,
                payoutDate: new Date(),
            });
            this.logger.log(`Razorpay payout initiated: ${settlement.id} for restaurant ${restaurantId}`);
            return {
                settlementId: settlement.id,
                status: settlement.status || 'processing',
                amount: settlement.amount / 100,
                currency: settlement.currency,
                processedAt: new Date(settlement.created_at * 1000).toISOString(),
                fees: settlement.fees / 100,
                tax: settlement.tax / 100,
            };
        }
        catch (error) {
            this.logger.error(`Razorpay payout failed for restaurant ${restaurantId}:`, error);
            await this.payoutRepo.update(payoutId, {
                status: payout_report_entity_1.PayoutStatus.FAILED,
            });
            throw new common_1.BadRequestException(`Payout failed: ${error.message}`);
        }
    }
    async getSettlementHistory(restaurantId, limit = 10) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant?.razorpayFundAccountId) {
            return [];
        }
        try {
            const settlements = await this.rzpRequest('GET', `settlements?limit=${limit}`);
            return (settlements.items || settlements || []).map((s) => ({
                settlementId: s.id,
                status: s.status,
                amount: s.amount / 100,
                currency: s.currency,
                processedAt: new Date(s.created_at * 1000).toISOString(),
                fees: s.fees / 100,
                tax: s.tax / 100,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to retrieve settlement history for restaurant ${restaurantId}:`, error);
            return [];
        }
    }
    async getAccountStatus(restaurantId) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        if (!restaurant.razorpayFundAccountId) {
            return { status: 'not_created' };
        }
        try {
            const fundAccount = await this.rzpRequest('GET', `fund_accounts/${restaurant.razorpayFundAccountId}`);
            return {
                status: fundAccount.active ? 'active' : 'inactive',
                fundAccountId: restaurant.razorpayFundAccountId,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve fund account status for restaurant ${restaurantId}:`, error);
            return {
                status: 'error',
                fundAccountId: restaurant.razorpayFundAccountId,
            };
        }
    }
    async getAccountBalance(restaurantId) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        try {
            const balance = await this.rzpRequest('GET', 'balance');
            const availableInr = balance.available?.find((b) => b.currency === 'INR');
            const pendingInr = balance.pending?.find((b) => b.currency === 'INR');
            return {
                available: (availableInr?.amount || 0) / 100,
                pending: (pendingInr?.amount || 0) / 100,
                currency: 'INR',
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve balance for restaurant ${restaurantId}:`, error);
            return {
                available: 0,
                pending: 0,
                currency: 'INR',
            };
        }
    }
};
exports.RazorpaySettlementService = RazorpaySettlementService;
exports.RazorpaySettlementService = RazorpaySettlementService = RazorpaySettlementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(payout_report_entity_1.PayoutReportEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeorm_2.Repository,
        typeorm_2.Repository])
], RazorpaySettlementService);
