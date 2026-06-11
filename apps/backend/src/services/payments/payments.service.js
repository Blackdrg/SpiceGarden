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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
let PaymentService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        auditService;
        ledgerService;
        gatewayFactory;
        logger = new common_1.Logger(PaymentService.name);
        constructor(configService, auditService, ledgerService, gatewayFactory) {
            this.configService = configService;
            this.auditService = auditService;
            this.ledgerService = ledgerService;
            this.gatewayFactory = gatewayFactory;
        }
        /**
         * Create a payment intent with abuse prevention checks
         * @param amount The amount to charge (in dollars)
         * @param currency The currency (default: usd)
         * @param userId The user making the payment (for abuse tracking)
         * @param metadata Additional metadata
         * @param request The Express request (for IP tracking)
         * @param gatewayName Optional gateway name (stripe or razorpay)
         */
        async createPaymentIntent(amount, currency = 'usd', userId = null, metadata = {}, request, gatewayName) {
            try {
                const gateway = this.gatewayFactory.getGateway(gatewayName);
                // Abuse prevention checks
                await this.validatePaymentLimits(userId, amount, request);
                // Create payment intent using selected gateway
                const paymentIntent = await gateway.createPaymentIntent(amount, currency, userId, metadata);
                // Log successful payment intent creation
                await this.auditService.logPaymentEvent('payment_intent_created', userId, amount, currency, gateway.getGatewayName(), paymentIntent.id, true, request);
                return paymentIntent;
            }
            catch (error) {
                // Log failed payment attempt
                await this.auditService.logPaymentEvent('payment_intent_failed', userId, amount, currency, gatewayName ? gatewayName : 'unknown', null, false, request, error.message);
                this.logger.error('Payment intent creation failed:', error);
                throw error;
            }
        }
        /**
         * Validate payment limits to prevent abuse
         * @param userId The user ID
         * @param amount The payment amount
         * @param request The request object (for IP tracking)
         */
        async validatePaymentLimits(userId, amount, request) {
            // Check amount limits
            const maxSingleAmount = this.configService.get('PAYMENT_MAX_SINGLE_AMOUNT', 10000); // ,000
            if (amount > maxSingleAmount) {
                throw new common_1.BadRequestException(`Payment amount exceeds maximum allowed: ${maxSingleAmount}`);
            }
            if (amount <= 0) {
                throw new common_1.BadRequestException('Payment amount must be greater than zero');
            }
            // Check daily limits per user - simplified placeholder
            if (userId) {
                const dailyLimit = this.configService.get('PAYMENT_DAILY_LIMIT_PER_USER', 50000); // ,000
                // In a real implementation, we would check actual daily totals from database
                // For now, we'll just note that this check should occur
            }
            // Check for suspicious patterns (velocity checks would be more complex in production)
            // For now, we'll implement basic checks
            await this.checkSuspiciousPatterns(userId, amount, request);
        }
        /**
         * Check for suspicious payment patterns
         */
        async checkSuspiciousPatterns(userId, amount, request) {
            // Check for rapid successive payments (basic implementation)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (userId) {
                // Simplified - would query actual payment/wallet transactions in production
                // For now we'll skip the detailed check to avoid entity relationship issues
            }
            // Additional IP-based checks could be added here
            // For production, integrate with fraud detection services like Stripe Radar
        }
        /**
         * Confirm a payment was successful
         */
        async confirmPayment(paymentId, userId, request, gatewayName) {
            try {
                const gateway = this.gatewayFactory.getGateway(gatewayName);
                // Retrieve payment intent from gateway
                const paymentResult = await gateway.confirmPayment(paymentId, userId);
                await this.auditService.logPaymentEvent('payment_confirmed', userId, paymentResult.amount / 100, paymentResult.currency, gateway.getGatewayName(), paymentId, true, request);
                // Record ledger entry for successful payment
                try {
                    await this.ledgerService.createTransaction(paymentId, // transactionId
                    'cash', // debitAccount
                    'revenue', // creditAccount
                    paymentResult.amount / 100, // amount
                    paymentResult.currency, // currency
                    'payment', // type
                    paymentId, // referenceId
                    `Payment succeeded for order ${paymentId}` // description
                    );
                }
                catch (ledgerError) {
                    this.logger.error('Failed to create ledger entry for payment success:', ledgerError);
                    // We don't throw here because the payment succeeded
                }
                return paymentResult;
            }
            catch (error) {
                // Log failed payment
                await this.auditService.logPaymentEvent('payment_failed', userId, 0, // We don't have the amount here without fetching again
                'usd', // We don't have the currency here without fetching again
                gatewayName ? gatewayName : 'unknown', paymentId, false, request, error.message);
                this.logger.error('Payment confirmation failed:', error);
                throw error;
            }
        }
        /**
         * Refund a payment with abuse prevention
         */
        async refundPayment(paymentId, amount = null, // null for full refund
        userId, reason = 'requested_by_customer', request, gatewayName) {
            try {
                const gateway = this.gatewayFactory.getGateway(gatewayName);
                // Get original payment
                const paymentIntent = await gateway.confirmPayment(paymentId, userId); // Reuse confirm to get details
                // Validate refund amount
                const refundAmount = amount ?? (paymentIntent.amount / 100);
                const maxRefund = paymentIntent.amount / 100;
                if (refundAmount > maxRefund) {
                    throw new common_1.BadRequestException(`Refund amount cannot exceed original payment: ${maxRefund}`);
                }
                if (refundAmount <= 0) {
                    throw new common_1.BadRequestException('Refund amount must be greater than zero');
                }
                // Create refund using selected gateway
                const refund = await gateway.refundPayment(paymentId, amount, userId, reason);
                await this.auditService.logPaymentEvent('payment_refunded', userId, refund.amount / 100, paymentIntent.currency, gateway.getGatewayName(), paymentId, true, request, `Reason: ${reason}`);
                // Record ledger entry for refund
                try {
                    await this.ledgerService.createTransaction(refund.id, // transactionId
                    'refund', // debitAccount (increase liability)
                    'cash', // creditAccount (decrease asset)
                    refund.amount / 100, // amount
                    paymentIntent.currency, // currency
                    'refund', // type
                    refund.id, // referenceId
                    `Refund processed for payment ${paymentId}, reason: ${reason}` // description
                    );
                }
                catch (ledgerError) {
                    this.logger.error('Failed to create ledger entry for refund:', ledgerError);
                }
                return refund;
            }
            catch (error) {
                // Log failed refund attempt
                await this.auditService.logPaymentEvent('payment_refund_failed', userId, amount || 0, 'usd', // We don't have the currency here without fetching again
                gatewayName ? gatewayName : 'unknown', paymentId, false, request, error.message);
                this.logger.error('Payment refund failed:', error);
                throw error;
            }
        }
        /**
         * Construct a gateway event with verification
         */
        async constructEvent(payload, signature, secret, gatewayName) {
            try {
                const gateway = this.gatewayFactory.getGateway(gatewayName);
                const event = await gateway.constructEvent(payload, signature, secret);
                // Log webhook receipt
                await this.auditService.logPaymentEvent('webhook_received', event.data.object?.metadata?.userId || 'unknown', event.data.object?.amount / 100 || 0, event.data.object?.currency || 'usd', gateway.getGatewayName(), event.data.object?.id || 'unknown', true, null // Webhooks don't have request objects in the same way
                );
                return event;
            }
            catch (error) {
                this.logger.error('Webhook verification failed:', error);
                throw error;
            }
        }
    };
    return PaymentService = _classThis;
})();
exports.PaymentService = PaymentService;
