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
exports.WebhookModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_webhook_entity_1 = require("../../../db/entities/payment-webhook.entity");
const payment_event_entity_1 = require("../payment-event.entity");
const payment_fraud_entity_1 = require("../payment-fraud.entity");
const payment_dispute_entity_1 = require("../../../db/entities/payment-dispute.entity");
const webhook_service_1 = require("./webhook.service");
const webhook_controller_1 = require("./webhook.controller");
const notification_module_1 = require("../../../services/notifications/notification.module");
const chargeback_module_1 = require("../chargeback/chargeback.module");
const ledger_module_1 = require("../../../modules/ledger/ledger.module");
const gateway_factory_service_1 = require("../gateway-factory.service");
const stripe_gateway_service_1 = require("../gateways/stripe-gateway.service");
const razorpay_gateway_service_1 = require("../gateways/razorpay-gateway.service");
let WebhookModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([payment_webhook_entity_1.PaymentWebhookEntity, payment_event_entity_1.PaymentEventEntity, payment_fraud_entity_1.PaymentFraudFlagEntity, payment_dispute_entity_1.PaymentDisputeEntity]),
                notification_module_1.NotificationModule,
                (0, common_1.forwardRef)(() => chargeback_module_1.ChargebackModule),
                ledger_module_1.LedgerModule,
            ],
            providers: [webhook_service_1.WebhookService, gateway_factory_service_1.PaymentGatewayFactory, stripe_gateway_service_1.StripeGateway, razorpay_gateway_service_1.RazorpayGateway],
            controllers: [webhook_controller_1.PaymentWebhookController],
            exports: [webhook_service_1.WebhookService],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WebhookModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            WebhookModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return WebhookModule = _classThis;
})();
exports.WebhookModule = WebhookModule;
