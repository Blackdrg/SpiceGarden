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
exports.StripeGateway = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
let StripeGateway = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var StripeGateway = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            StripeGateway = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        logger = new common_1.Logger(StripeGateway.name);
        stripe;
        constructor(configService) {
            this.configService = configService;
            this.stripe = new stripe_1.Stripe(this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
                apiVersion: '2024-04-10',
            });
        }
        async createPaymentIntent(amount, currency = 'usd', userId = null, metadata = {}) {
            try {
                // Create payment intent
                const paymentIntent = await this.stripe.paymentIntents.create({
                    amount: Math.round(amount * 100), // Stripe expects cents
                    currency,
                    metadata: {
                        ...metadata,
                        userId,
                        timestamp: new Date().toISOString()
                    }
                });
                return paymentIntent;
            }
            catch (error) {
                this.logger.error('Stripe payment intent creation failed:', error);
                throw error;
            }
        }
        async confirmPayment(paymentId, userId) {
            try {
                // Retrieve payment intent from Stripe
                const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
                if (paymentIntent.status === 'succeeded') {
                    return paymentIntent;
                }
                else {
                    throw new common_1.BadRequestException(`Payment not successful: ${paymentIntent.status}`);
                }
            }
            catch (error) {
                this.logger.error('Stripe payment confirmation failed:', error);
                throw error;
            }
        }
        async refundPayment(paymentId, amount = null, // null for full refund
        userId, reason = 'requested_by_customer') {
            try {
                // Get original payment
                const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
                // Validate refund amount
                const refundAmount = amount ?? (paymentIntent.amount / 100);
                const maxRefund = paymentIntent.amount / 100;
                if (refundAmount > maxRefund) {
                    throw new common_1.BadRequestException(`Refund amount cannot exceed original payment: ${maxRefund}`);
                }
                if (refundAmount <= 0) {
                    throw new common_1.BadRequestException('Refund amount must be greater than zero');
                }
                // Create refund
                const refund = await this.stripe.refunds.create({
                    payment_intent: paymentId,
                    amount: Math.round(refundAmount * 100),
                    reason: reason
                });
                return refund;
            }
            catch (error) {
                this.logger.error('Stripe payment refund failed:', error);
                throw error;
            }
        }
        async constructEvent(payload, signature, secret) {
            try {
                const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
                return event;
            }
            catch (error) {
                this.logger.error('Stripe webhook verification failed:', error);
                throw error;
            }
        }
        getGatewayName() {
            return 'stripe';
        }
    };
    return StripeGateway = _classThis;
})();
exports.StripeGateway = StripeGateway;
