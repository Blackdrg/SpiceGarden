"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let PaymentsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('payments')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createPaymentIntent_decorators;
    let _refund_decorators;
    let _getAvailableGateways_decorators;
    let _getGatewayConfig_decorators;
    var PaymentsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createPaymentIntent_decorators = [(0, common_1.Post)('create-intent'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Create a payment intent' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment intent created successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' })];
            _refund_decorators = [(0, common_1.Post)('refund'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Refund a payment' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund processed successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' })];
            _getAvailableGateways_decorators = [(0, common_1.Get)('gateways'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get available payment gateways' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'List of available payment gateways' })];
            _getGatewayConfig_decorators = [(0, common_1.Get)('gateway/config'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get payment gateway configuration' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment gateway configuration' })];
            __esDecorate(this, null, _createPaymentIntent_decorators, { kind: "method", name: "createPaymentIntent", static: false, private: false, access: { has: obj => "createPaymentIntent" in obj, get: obj => obj.createPaymentIntent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _refund_decorators, { kind: "method", name: "refund", static: false, private: false, access: { has: obj => "refund" in obj, get: obj => obj.refund }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAvailableGateways_decorators, { kind: "method", name: "getAvailableGateways", static: false, private: false, access: { has: obj => "getAvailableGateways" in obj, get: obj => obj.getAvailableGateways }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getGatewayConfig_decorators, { kind: "method", name: "getGatewayConfig", static: false, private: false, access: { has: obj => "getGatewayConfig" in obj, get: obj => obj.getGatewayConfig }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        paymentService = __runInitializers(this, _instanceExtraInitializers);
        paymentHardening;
        retryService;
        fraudHardening;
        idempotency;
        configService;
        constructor(paymentService, paymentHardening, retryService, fraudHardening, idempotency, configService) {
            this.paymentService = paymentService;
            this.paymentHardening = paymentHardening;
            this.retryService = retryService;
            this.fraudHardening = fraudHardening;
            this.idempotency = idempotency;
            this.configService = configService;
        }
        async createPaymentIntent(body, req, idempotencyKey, gateway // Optional gateway parameter
        ) {
            const fraudCheck = await this.fraudHardening.checkPaymentFraud({
                userId: body.userId,
                amount: body.amount,
                ipAddress: req.ip || req.connection.remoteAddress || '0.0.0.0',
                userAgent: req.get('User-Agent') || 'Unknown',
            });
            if (!fraudCheck.allowed) {
                return {
                    error: 'Payment blocked due to fraud risk',
                    reasons: fraudCheck.reasons,
                    riskScore: fraudCheck.riskScore,
                };
            }
            const retryResult = await this.retryService.executeWithRetry(async () => {
                if (idempotencyKey) {
                    const existing = await this.idempotency.validateOrCreate(idempotencyKey, 'create_payment_intent', body.userId, { amount: body.amount, currency: body.currency });
                    if (existing.isDuplicate) {
                        return existing.response;
                    }
                }
                const intent = await this.paymentService.createPaymentIntent(body.amount, body.currency || 'usd', body.userId, { orderId: body.orderId, paymentMethodId: body.paymentMethodId }, req, gateway);
                if (idempotencyKey) {
                    await this.idempotency.complete(idempotencyKey, 'create_payment_intent', intent);
                }
                return intent;
            }, 'create_payment_intent', { userId: body.userId, orderId: body.orderId });
            if (!retryResult.success) {
                throw new common_1.BadRequestException(retryResult.error?.message);
            }
            // Return client secret for frontend
            return {
                clientSecret: retryResult.result?.client_secret || retryResult.result?.id,
                gateway: gateway || this.configService.get('PAYMENT_PRIMARY_GATEWAY', 'stripe')
            };
        }
        async refund(body, idempotencyKey, gateway // Optional gateway parameter
        ) {
            const retryResult = await this.retryService.executeWithRetry(async () => {
                if (idempotencyKey) {
                    const existing = await this.idempotency.validateOrCreate(idempotencyKey, 'refund_payment', body.userId, { paymentIntentId: body.paymentIntentId, amount: body.amount });
                    if (existing.isDuplicate) {
                        return existing.response;
                    }
                }
                const refund = await this.paymentService.refundPayment(body.paymentIntentId, body.amount, body.userId, body.reason, undefined, // request object not needed for refunds in this context
                gateway);
                if (idempotencyKey) {
                    await this.idempotency.complete(idempotencyKey, 'refund_payment', refund);
                }
                return refund;
            }, 'refund_payment', { userId: body.userId, paymentId: body.paymentIntentId });
            if (!retryResult.success) {
                throw new common_1.BadRequestException(retryResult.error?.message);
            }
            return retryResult.result;
        }
        getAvailableGateways() {
            // In a real implementation, this would come from the gateway factory
            // For now, we'll return the hardcoded list
            return ['stripe', 'razorpay'];
        }
        getGatewayConfig() {
            return {
                primaryGateway: this.configService.get('PAYMENT_PRIMARY_GATEWAY', 'stripe'),
                availableGateways: ['stripe', 'razorpay'],
                stripeEnabled: !!this.configService.get('STRIPE_SECRET_KEY'),
                razorpayEnabled: !!this.configService.get('RAZORPAY_KEY_ID')
            };
        }
    };
    return PaymentsController = _classThis;
})();
exports.PaymentsController = PaymentsController;
