"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayGateway = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
function safeParse(json) {
    try {
        return JSON.parse(json);
    }
    catch {
        return undefined;
    }
}
let RazorpayGateway = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RazorpayGateway = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RazorpayGateway = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        logger = new common_1.Logger(RazorpayGateway.name);
        keyId;
        keySecret;
        constructor(configService) {
            this.configService = configService;
            this.keyId = this.configService.get('RAZORPAY_KEY_ID') || 'rzp_test_placeholder';
            this.keySecret = this.configService.get('RAZORPAY_KEY_SECRET') || 'test_placeholder';
        }
        async razorpayRequest(method, endpoint, data = {}) {
            try {
                const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
                const response = await fetch(`https://api.razorpay.com/v1/${endpoint}`, {
                    method,
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/json',
                    },
                    body: method !== 'GET' ? JSON.stringify(data) : undefined,
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.description || `Razorpay API error: ${response.status}`);
                }
                return await response.json();
            }
            catch (error) {
                this.logger.error(`Razorpay API request failed: ${endpoint}`, error);
                throw error;
            }
        }
        async createPaymentIntent(amount, currency = 'inr', userId = null, metadata = {}) {
            try {
                const amountInPaise = Math.round(amount * 100);
                const paymentData = {
                    amount: amountInPaise,
                    currency: currency.toLowerCase(),
                    receipt: `receipt_${Date.now()}_${userId || 'guest'}`,
                    notes: {
                        ...metadata,
                        userId,
                        timestamp: new Date().toISOString()
                    }
                };
                const payment = await this.razorpayRequest('POST', 'orders', paymentData);
                return {
                    id: payment.id,
                    amount: payment.amount / 100,
                    currency: payment.currency,
                    status: payment.status,
                    client_secret: payment.id
                };
            }
            catch (error) {
                this.logger.error('Razorpay payment intent creation failed:', error);
                throw error;
            }
        }
        async confirmPayment(paymentId, userId) {
            try {
                const order = await this.razorpayRequest('GET', `orders/${paymentId}`);
                if (order.status === 'paid' || order.status === 'captured') {
                    return {
                        id: order.id,
                        amount: order.amount / 100,
                        currency: order.currency,
                        status: order.status
                    };
                }
                else {
                    throw new common_1.BadRequestException(`Payment not successful: ${order.status}`);
                }
            }
            catch (error) {
                this.logger.error('Razorpay payment confirmation failed:', error);
                throw error;
            }
        }
        async refundPayment(paymentId, amount = null, userId, reason = 'requested_by_customer') {
            try {
                const order = await this.razorpayRequest('GET', `orders/${paymentId}`);
                const paymentIdToRefund = order.payments?.items?.[0]?.id || paymentId;
                const refundAmount = amount ?? (order.amount / 100);
                const maxRefund = order.amount / 100;
                if (refundAmount > maxRefund) {
                    throw new common_1.BadRequestException(`Refund amount cannot exceed original amount: ${maxRefund}`);
                }
                if (refundAmount <= 0) {
                    throw new common_1.BadRequestException('Refund amount must be greater than zero');
                }
                const refundData = {
                    amount: Math.round(refundAmount * 100),
                    notes: {
                        reason,
                        userId
                    }
                };
                const refund = await this.razorpayRequest('POST', `payments/${paymentIdToRefund}/refund`, refundData);
                return {
                    id: refund.id,
                    amount: refund.amount / 100,
                    status: refund.status
                };
            }
            catch (error) {
                this.logger.error('Razorpay payment refund failed:', error);
                throw error;
            }
        }
        async constructEvent(payload, signature, secret) {
            try {
                const expectedSignature = crypto
                    .createHmac('sha256', secret)
                    .update(payload.toString())
                    .digest('hex');
                if (expectedSignature !== signature) {
                    throw new Error('Invalid webhook signature');
                }
                return safeParse(payload.toString());
            }
            catch (error) {
                this.logger.error('Razorpay webhook verification failed:', error);
                throw error;
            }
        }
        getGatewayName() {
            return 'razorpay';
        }
    };
    return RazorpayGateway = _classThis;
})();
exports.RazorpayGateway = RazorpayGateway;
