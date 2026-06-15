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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stripe_connect_service_1 = require("./stripe-connect.service");
const razorpay_settlement_service_1 = require("./razorpay-settlement.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let PaymentProviderController = class PaymentProviderController {
    stripeConnectService;
    razorpaySettlementService;
    constructor(stripeConnectService, razorpaySettlementService) {
        this.stripeConnectService = stripeConnectService;
        this.razorpaySettlementService = razorpaySettlementService;
    }
    async createStripeConnectAccount(req, dto) {
        const restaurantId = req.user?.restaurantId || req.user?.id;
        if (!restaurantId) {
            throw new common_1.BadRequestException('Restaurant ID not found in user context');
        }
        return this.stripeConnectService.createConnectAccount(restaurantId, dto);
    }
    async getStripeConnectStatus(req) {
        const restaurantId = req.user?.restaurantId || req.user?.id;
        if (!restaurantId) {
            throw new common_1.BadRequestException('Restaurant ID not found in user context');
        }
        return this.stripeConnectService.getAccountStatus(restaurantId);
    }
    async createRazorpayFundAccount(req, dto) {
        const restaurantId = req.user?.restaurantId || req.user?.id;
        if (!restaurantId) {
            throw new common_1.BadRequestException('Restaurant ID not found in user context');
        }
        return this.razorpaySettlementService.createFundAccount(restaurantId, dto);
    }
    async getRazorpaySettlementStatus(req) {
        const restaurantId = req.user?.restaurantId || req.user?.id;
        if (!restaurantId) {
            throw new common_1.BadRequestException('Restaurant ID not found in user context');
        }
        return this.razorpaySettlementService.getAccountStatus(restaurantId);
    }
    async getPayoutHistory(req, limit) {
        const restaurantId = req.user?.restaurantId || req.user?.id;
        if (!restaurantId) {
            throw new common_1.BadRequestException('Restaurant ID not found in user context');
        }
        const primaryGateway = process.env.PAYMENT_PRIMARY_GATEWAY || 'stripe';
        const parsedLimit = limit ? parseInt(limit, 10) : 10;
        if (primaryGateway === 'stripe') {
            return this.stripeConnectService.getPayoutHistory(restaurantId, parsedLimit);
        }
        else if (primaryGateway === 'razorpay') {
            return this.razorpaySettlementService.getSettlementHistory(restaurantId, parsedLimit);
        }
        throw new common_1.BadRequestException(`Unsupported payment gateway: ${primaryGateway}`);
    }
    async getAccountBalance(req) {
        const restaurantId = req.user?.restaurantId || req.user?.id;
        if (!restaurantId) {
            throw new common_1.BadRequestException('Restaurant ID not found in user context');
        }
        const primaryGateway = process.env.PAYMENT_PRIMARY_GATEWAY || 'stripe';
        if (primaryGateway === 'stripe') {
            return this.stripeConnectService.getAccountBalance(restaurantId);
        }
        else if (primaryGateway === 'razorpay') {
            return this.razorpaySettlementService.getAccountBalance(restaurantId);
        }
        return { available: 0, pending: 0, currency: 'INR' };
    }
};
exports.PaymentProviderController = PaymentProviderController;
__decorate([
    (0, common_1.Post)('stripe-connect/onboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Stripe Connect account for restaurant payouts' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object' } }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentProviderController.prototype, "createStripeConnectAccount", null);
__decorate([
    (0, common_1.Get)('stripe-connect/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Stripe Connect account status for restaurant' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentProviderController.prototype, "getStripeConnectStatus", null);
__decorate([
    (0, common_1.Post)('razorpay/settlement/onboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Razorpay fund account for restaurant settlements' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object' } }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentProviderController.prototype, "createRazorpayFundAccount", null);
__decorate([
    (0, common_1.Get)('razorpay/settlement/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Razorpay settlement account status for restaurant' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentProviderController.prototype, "getRazorpaySettlementStatus", null);
__decorate([
    (0, common_1.Get)('restaurant/payout-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payout history from payment provider' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentProviderController.prototype, "getPayoutHistory", null);
__decorate([
    (0, common_1.Get)('restaurant/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current balance from payment provider' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentProviderController.prototype, "getAccountBalance", null);
exports.PaymentProviderController = PaymentProviderController = __decorate([
    (0, swagger_1.ApiTags)('payment-provider'),
    (0, common_1.Controller)('payment-provider'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.RESTAURANT, user_interface_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [stripe_connect_service_1.StripeConnectService,
        razorpay_settlement_service_1.RazorpaySettlementService])
], PaymentProviderController);
