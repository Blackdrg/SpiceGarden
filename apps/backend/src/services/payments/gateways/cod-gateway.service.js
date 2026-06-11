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
exports.CashOnDeliveryGateway = void 0;
const common_1 = require("@nestjs/common");
function safeParse(json) {
    try {
        return JSON.parse(json);
    }
    catch {
        return undefined;
    }
}
let CashOnDeliveryGateway = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CashOnDeliveryGateway = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CashOnDeliveryGateway = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger = new common_1.Logger(CashOnDeliveryGateway.name);
        async createPaymentIntent(amount, currency = 'inr', userId = null, metadata = {}) {
            const codPaymentId = `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return {
                id: codPaymentId,
                amount,
                currency: currency.toUpperCase(),
                status: 'pending',
                client_secret: codPaymentId,
                payment_method: 'cod',
                metadata: {
                    ...metadata,
                    userId,
                    paymentMethod: 'cash_on_delivery',
                    instruction: 'Pay cash to driver on delivery',
                },
            };
        }
        async confirmPayment(paymentId, userId) {
            if (!paymentId?.startsWith('cod_')) {
                throw new Error('Invalid COD payment ID');
            }
            return {
                id: paymentId,
                amount: 0,
                currency: 'INR',
                status: 'pending',
                payment_method: 'cod',
            };
        }
        async refundPayment(paymentId, amount = null, userId, reason = 'requested_by_customer') {
            this.logger.warn(`COD refund requested - no action taken. Amount: ${amount}, Payment: ${paymentId}`);
            return {
                id: `refund_${Date.now()}`,
                amount: amount || 0,
                status: 'processed',
                note: 'COD refund - requires manual driver reconciliation',
            };
        }
        async constructEvent(payload, signature, secret) {
            return safeParse(payload.toString());
        }
        getGatewayName() {
            return 'cod';
        }
        supportsCOD() {
            return true;
        }
    };
    return CashOnDeliveryGateway = _classThis;
})();
exports.CashOnDeliveryGateway = CashOnDeliveryGateway;
