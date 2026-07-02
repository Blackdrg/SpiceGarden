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
var PaymentService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_service_1 = require("../../audit/audit.service");
const ledger_service_1 = require("../../modules/ledger/ledger.service");
const gateway_factory_service_1 = require("./gateway-factory.service");
const wallet_entity_1 = require("../../db/entities/wallet.entity");
const wallet_transaction_entity_1 = require("../../db/entities/wallet-transaction.entity");
let PaymentService = PaymentService_1 = class PaymentService {
    configService;
    auditService;
    ledgerService;
    gatewayFactory;
    walletRepo;
    transactionRepo;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(configService, auditService, ledgerService, gatewayFactory, walletRepo, transactionRepo) {
        this.configService = configService;
        this.auditService = auditService;
        this.ledgerService = ledgerService;
        this.gatewayFactory = gatewayFactory;
        this.walletRepo = walletRepo;
        this.transactionRepo = transactionRepo;
    }
    async createPaymentIntent(amount, currency = 'usd', userId = null, metadata = {}, request, gatewayName) {
        try {
            const gateway = this.gatewayFactory.getGateway(gatewayName);
            await this.validatePaymentLimits(userId ?? '', amount, request);
            const paymentIntent = await gateway.createPaymentIntent(amount, currency, userId ?? '', metadata);
            await this.auditService.logPaymentEvent('payment_intent_created', userId ?? '', amount, currency, gateway.getGatewayName(), paymentIntent.id, true, request);
            return paymentIntent;
        }
        catch (error) {
            await this.auditService.logPaymentEvent('payment_intent_failed', userId ?? '', amount, currency, gatewayName ? gatewayName : 'any', '', false, request, error.message);
            this.logger.error('Payment intent creation failed:', error);
            throw error;
        }
    }
    async validatePaymentLimits(userId, amount, request) {
        const maxSingleAmount = this.configService.get('PAYMENT_MAX_SINGLE_AMOUNT', 10000);
        if (amount > maxSingleAmount) {
            throw new common_1.BadRequestException(`Payment amount exceeds maximum allowed: ${maxSingleAmount}`);
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Payment amount must be greater than zero');
        }
        if (userId) {
            const dailyLimit = this.configService.get('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const wallet = await this.walletRepo.findOne({ where: { userId } });
            if (wallet) {
                const dailyTotal = await this.transactionRepo
                    .createQueryBuilder('t')
                    .where('t.walletId = :walletId', { walletId: wallet.id })
                    .andWhere('t.createdAt >= :start', { start: oneDayAgo })
                    .andWhere('t.type = :type', { type: 'debit' })
                    .select('SUM(t.amount)', 'total')
                    .getRawOne();
                const spent = parseFloat(dailyTotal?.total || '0');
                if (spent + amount > dailyLimit) {
                    throw new common_1.BadRequestException(`Daily payment limit exceeded. Spent: ${spent}, Limit: ${dailyLimit}`);
                }
            }
        }
        await this.checkSuspiciousPatterns(userId, amount, request);
    }
    async checkSuspiciousPatterns(userId, amount, request) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (userId) {
        }
    }
    async confirmPayment(paymentId, userId, request, gatewayName) {
        try {
            const gateway = this.gatewayFactory.getGateway(gatewayName);
            const paymentResult = await gateway.confirmPayment(paymentId, userId);
            await this.auditService.logPaymentEvent('payment_confirmed', userId, paymentResult.amount / 100, paymentResult.currency, gateway.getGatewayName(), paymentId, true, request);
            try {
                await this.ledgerService.createTransaction(paymentId, 'cash', 'revenue', paymentResult.amount / 100, paymentResult.currency, 'payment', paymentId, `Payment succeeded for order ${paymentId}`);
            }
            catch (ledgerError) {
                this.logger.error('Failed to create ledger entry for payment success:', ledgerError);
            }
            return paymentResult;
        }
        catch (error) {
            await this.auditService.logPaymentEvent('payment_failed', userId, 0, 'usd', gatewayName ? gatewayName : 'any', paymentId, false, request, error.message);
            this.logger.error('Payment confirmation failed:', error);
            throw error;
        }
    }
    async refundPayment(paymentId, amount = null, userId, reason = 'requested_by_customer', request, gatewayName) {
        try {
            const gateway = this.gatewayFactory.getGateway(gatewayName);
            const paymentIntent = await gateway.confirmPayment(paymentId, userId);
            const refundAmount = amount ?? (paymentIntent.amount / 100);
            const maxRefund = paymentIntent.amount / 100;
            if (refundAmount > maxRefund) {
                throw new common_1.BadRequestException(`Refund amount cannot exceed original payment: ${maxRefund}`);
            }
            if (refundAmount <= 0) {
                throw new common_1.BadRequestException('Refund amount must be greater than zero');
            }
            const refund = await gateway.refundPayment(paymentId, amount, userId, reason);
            await this.auditService.logPaymentEvent('payment_refunded', userId, refund.amount / 100, paymentIntent.currency, gateway.getGatewayName(), paymentId, true, request, `Reason: ${reason}`);
            try {
                await this.ledgerService.createTransaction(refund.id, 'refund', 'cash', refund.amount / 100, paymentIntent.currency, 'refund', refund.id, `Refund processed for payment ${paymentId}, reason: ${reason}`);
            }
            catch (ledgerError) {
                this.logger.error('Failed to create ledger entry for refund:', ledgerError);
            }
            return refund;
        }
        catch (error) {
            await this.auditService.logPaymentEvent('payment_refund_failed', userId, amount || 0, 'usd', gatewayName ? gatewayName : 'any', paymentId, false, request, error.message);
            this.logger.error('Payment refund failed:', error);
            throw error;
        }
    }
    async constructEvent(payload, signature, secret, gatewayName) {
        try {
            const gateway = this.gatewayFactory.getGateway(gatewayName);
            const event = await gateway.constructEvent(payload, signature, secret);
            const obj = event.data.object;
            await this.auditService.logPaymentEvent('webhook_received', obj.metadata?.userId || 'any', typeof obj.amount === 'number' ? obj.amount / 100 : 0, obj.currency || 'usd', gateway.getGatewayName(), obj.id || 'any', true, null);
            return event;
        }
        catch (error) {
            this.logger.error('Webhook verification failed:', error);
            throw error;
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, typeorm_1.InjectRepository)(wallet_entity_1.WalletEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(wallet_transaction_entity_1.WalletTransactionEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, audit_service_1.AuditService,
        ledger_service_1.LedgerService,
        gateway_factory_service_1.PaymentGatewayFactory,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentService);
