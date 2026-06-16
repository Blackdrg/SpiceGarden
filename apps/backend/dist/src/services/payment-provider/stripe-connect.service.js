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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeConnectService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeConnectService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const payout_report_entity_1 = require("../../db/entities/payout-report.entity");
let StripeConnectService = StripeConnectService_1 = class StripeConnectService {
    configService;
    restaurantRepo;
    payoutRepo;
    logger = new common_1.Logger(StripeConnectService_1.name);
    stripe;
    constructor(configService, restaurantRepo, payoutRepo) {
        this.configService = configService;
        this.restaurantRepo = restaurantRepo;
        this.payoutRepo = payoutRepo;
        const secretKey = this.configService.get('STRIPE_CONNECT_SECRET_KEY') || this.configService.get('STRIPE_SECRET_KEY');
        this.stripe = new stripe_1.default(secretKey || 'sk_test_placeholder', {
            apiVersion: '2024-04-10',
        });
    }
    async createConnectAccount(restaurantId, accountData) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        try {
            const account = await this.stripe.accounts.create({
                type: 'standard',
                country: 'IN',
                email: accountData.email,
                business_type: this.mapBusinessType(accountData.businessType),
                company: {
                    name: accountData.legalBusinessName,
                    structure: this.mapBusinessStructure(accountData.businessType),
                    address: {
                        line1: accountData.address.line1,
                        city: accountData.address.city,
                        state: accountData.address.state,
                        postal_code: accountData.address.postalCode,
                        country: accountData.address.country,
                    },
                    tax_id: accountData.gstin || accountData.pan,
                },
                individual: {
                    first_name: accountData.bankAccount?.accountHolderName?.split(' ')[0] || 'Business',
                    last_name: accountData.bankAccount?.accountHolderName?.split(' ').slice(1).join(' ') || 'Owner',
                    email: accountData.email,
                    phone: accountData.phone,
                    address: {
                        line1: accountData.address.line1,
                        city: accountData.address.city,
                        state: accountData.address.state,
                        postal_code: accountData.address.postalCode,
                        country: accountData.address.country,
                    },
                },
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    restaurantId,
                    gstin: accountData.gstin || '',
                },
            });
            const accountResult = {
                accountId: account.id,
                status: account.details_submitted ? 'active' : 'incomplete',
                detailsSubmitted: account.details_submitted,
                payoutsEnabled: account.payouts_enabled,
                requirementsDue: account.requirements?.currently_due || [],
            };
            if (!account.details_submitted) {
                const accountLink = await this.stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: `${this.configService.get('APP_URL')}/restaurant/onboarding/refresh`,
                    return_url: `${this.configService.get('APP_URL')}/restaurant/onboarding/complete`,
                    type: 'account_onboarding',
                });
                accountResult.onboardingUrl = accountLink.url;
            }
            restaurant.stripeAccountId = account.id;
            await this.restaurantRepo.save(restaurant);
            this.logger.log(`Created Stripe Connect account ${account.id} for restaurant ${restaurantId}`);
            return accountResult;
        }
        catch (error) {
            this.logger.error(`Failed to create Stripe Connect account for restaurant ${restaurantId}:`, error);
            throw new common_1.BadRequestException(`Stripe Connect account creation failed: ${error.message}`);
        }
    }
    async registerWebhook(accountId) {
        const webhookUrl = this.configService.get('STRIPE_WEBHOOK_URL');
        if (!webhookUrl) {
            this.logger.warn('STRIPE_WEBHOOK_URL not configured, skipping webhook registration');
            return { endpointId: '', status: 'skipped' };
        }
        try {
            const webhookSecret = this.configService.get('STRIPE_CONNECT_WEBHOOK_SECRET') || this.configService.get('STRIPE_WEBHOOK_SECRET');
            const endpoint = await this.stripe.webhookEndpoints.create({
                url: webhookUrl,
                enabled_events: [
                    'account.updated',
                    'account.application.deauthorized',
                    'payout.created',
                    'payout.paid',
                    'payout.failed',
                ],
                api_version: '2024-04-10',
                secret: webhookSecret,
                metadata: {
                    restaurantStripeAccount: accountId,
                    type: 'connect_webhook',
                },
            }, {
                stripeAccount: accountId,
            });
            this.logger.log(`Registered Stripe Connect webhook endpoint ${endpoint.id} for account ${accountId}`);
            return { endpointId: endpoint.id, status: 'active' };
        }
        catch (error) {
            this.logger.error(`Failed to register Stripe Connect webhook for account ${accountId}:`, error);
            return { endpointId: '', status: 'failed' };
        }
    }
    async getAccountStatus(restaurantId) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant?.stripeAccountId) {
            throw new common_1.NotFoundException('No Stripe Connect account found for this restaurant');
        }
        try {
            const account = await this.stripe.accounts.retrieve(restaurant.stripeAccountId);
            return {
                accountId: account.id,
                status: account.details_submitted ? (account.payouts_enabled ? 'active' : 'pending_verification') : 'incomplete',
                detailsSubmitted: account.details_submitted,
                payoutsEnabled: account.payouts_enabled,
                requirementsDue: account.requirements?.currently_due || [],
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve Stripe Connect account for restaurant ${restaurantId}:`, error);
            throw new common_1.BadRequestException(`Failed to retrieve account status: ${error.message}`);
        }
    }
    async sendPayout(restaurantId, payoutId, amount, currency = 'inr') {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant?.stripeAccountId) {
            throw new common_1.BadRequestException('No Stripe Connect account found. Complete onboarding first.');
        }
        const payoutReport = await this.payoutRepo.findOne({ where: { id: payoutId } });
        if (!payoutReport) {
            throw new common_1.NotFoundException('Payout report not found');
        }
        if (payoutReport.restaurantId !== restaurantId) {
            throw new common_1.BadRequestException('Payout does not belong to this restaurant');
        }
        try {
            const platformFeePercent = this.configService.get('STRIPE_PLATFORM_FEE_PERCENT', 5);
            const platformFee = Math.round((amount * platformFeePercent / 100) * 100);
            const amountInPaise = Math.round(amount * 100);
            const transfer = await this.stripe.transfers.create({
                amount: amountInPaise,
                currency,
                destination: restaurant.stripeAccountId,
                transfer_group: `payout_${payoutId}`,
                metadata: {
                    restaurantId,
                    payoutId,
                    type: 'platform_payout',
                },
            }, {
                stripeAccount: restaurant.stripeAccountId,
            });
            await this.payoutRepo.update(payoutId, {
                status: payout_report_entity_1.PayoutStatus.PROCESSING,
                payoutReference: `stripe_transfer_${transfer.id}`,
                payoutDate: new Date(),
            });
            this.logger.log(`Stripe payout initiated: ${transfer.id} for restaurant ${restaurantId}, payout ${payoutId}`);
            return {
                payoutId: transfer.id,
                status: 'processing',
            };
        }
        catch (error) {
            this.logger.error(`Stripe payout failed for restaurant ${restaurantId}:`, error);
            await this.payoutRepo.update(payoutId, {
                status: payout_report_entity_1.PayoutStatus.FAILED,
            });
            throw new common_1.BadRequestException(`Payout failed: ${error.message}`);
        }
    }
    async getPayoutHistory(restaurantId, limit = 10) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant?.stripeAccountId) {
            return [];
        }
        try {
            const payouts = await this.stripe.payouts.list({ limit }, { stripeAccount: restaurant.stripeAccountId });
            return payouts.data.map((payout) => ({
                id: payout.id,
                amount: payout.amount / 100,
                currency: payout.currency,
                status: payout.status,
                arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
                method: payout.method,
                failureCode: payout.failure_code,
                failureMessage: payout.failure_message,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to retrieve payout history for restaurant ${restaurantId}:`, error);
            return [];
        }
    }
    async getAccountBalance(restaurantId) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant?.stripeAccountId) {
            return { available: 0, pending: 0 };
        }
        try {
            const balance = await this.stripe.balance.retrieve({
                stripeAccount: restaurant.stripeAccountId,
            });
            const availableInr = balance.available.find((b) => b.currency === 'inr');
            const pendingInr = balance.pending.find((b) => b.currency === 'inr');
            return {
                available: (availableInr?.amount || 0) / 100,
                pending: (pendingInr?.amount || 0) / 100,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve balance for restaurant ${restaurantId}:`, error);
            return { available: 0, pending: 0 };
        }
    }
    mapBusinessType(internalType) {
        return internalType;
    }
    mapBusinessStructure(internalType) {
        return internalType;
    }
};
exports.StripeConnectService = StripeConnectService;
exports.StripeConnectService = StripeConnectService = StripeConnectService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(payout_report_entity_1.PayoutReportEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StripeConnectService);
