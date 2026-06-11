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
exports.PaymentServiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payments_service_1 = require("./payments.service");
const payments_controller_1 = require("./payments.controller");
const payment_hardening_service_1 = require("./payment-hardening.service");
const retry_service_1 = require("./retry.service");
const fraud_hardening_service_1 = require("./fraud-hardening.service");
const idempotency_service_1 = require("./idempotency.service");
const gateway_factory_service_1 = require("./gateway-factory.service");
const stripe_gateway_service_1 = require("./gateways/stripe-gateway.service");
const razorpay_gateway_service_1 = require("./gateways/razorpay-gateway.service");
const order_entity_1 = require("../../db/entities/order.entity");
const wallet_entity_1 = require("../../db/entities/wallet.entity");
const wallet_transaction_entity_1 = require("../../db/entities/wallet-transaction.entity");
const audit_log_entity_1 = require("../../db/entities/audit-log.entity");
const idempotency_entity_1 = require("./idempotency.entity");
const payment_validation_entity_1 = require("./payment-validation.entity");
const payment_fraud_entity_1 = require("./payment-fraud.entity");
const payment_event_entity_1 = require("./payment-event.entity");
const ledger_entry_entity_1 = require("../../db/entities/ledger-entry.entity");
const audit_module_1 = require("../../audit/audit.module");
const ledger_module_1 = require("../../modules/ledger/ledger.module");
const gst_module_1 = require("../../services/gst/gst.module");
const chargeback_module_1 = require("./chargeback/chargeback.module");
const payment_dispute_entity_1 = require("../../db/entities/payment-dispute.entity");
const chargeback_service_1 = require("./chargeback/chargeback.service");
let PaymentServiceModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([
                    order_entity_1.OrderEntity,
                    wallet_entity_1.WalletEntity,
                    wallet_transaction_entity_1.WalletTransactionEntity,
                    audit_log_entity_1.AuditLogEntity,
                    idempotency_entity_1.IdempotencyEntity,
                    payment_validation_entity_1.PaymentValidationEventEntity,
                    payment_fraud_entity_1.PaymentFraudFlagEntity,
                    payment_event_entity_1.PaymentEventEntity,
                    ledger_entry_entity_1.LedgerEntryEntity,
                    payment_dispute_entity_1.PaymentDisputeEntity,
                ]),
                audit_module_1.AuditModule,
                ledger_module_1.LedgerModule,
                gst_module_1.GSTModule,
                (0, common_1.forwardRef)(() => chargeback_module_1.ChargebackModule),
            ],
            providers: [
                payments_service_1.PaymentService,
                payment_hardening_service_1.PaymentHardeningService,
                retry_service_1.RetryService,
                fraud_hardening_service_1.FraudHardeningService,
                idempotency_service_1.IdempotencyService,
                gateway_factory_service_1.PaymentGatewayFactory,
                stripe_gateway_service_1.StripeGateway,
                razorpay_gateway_service_1.RazorpayGateway,
                chargeback_service_1.ChargebackService
            ],
            controllers: [payments_controller_1.PaymentsController],
            exports: [
                payments_service_1.PaymentService,
                payment_hardening_service_1.PaymentHardeningService,
                retry_service_1.RetryService,
                fraud_hardening_service_1.FraudHardeningService,
                idempotency_service_1.IdempotencyService,
                gateway_factory_service_1.PaymentGatewayFactory,
                chargeback_service_1.ChargebackService
            ],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentServiceModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentServiceModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return PaymentServiceModule = _classThis;
})();
exports.PaymentServiceModule = PaymentServiceModule;
