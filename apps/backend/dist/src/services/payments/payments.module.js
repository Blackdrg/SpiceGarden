"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentServiceModule = void 0;
const common_1 = require("@nestjs/common");
const db_repositories_module_1 = require("../../db/db-repositories.module");
const payments_service_1 = require("./payments.service");
const payments_controller_1 = require("./payments.controller");
const payment_hardening_service_1 = require("./payment-hardening.service");
const retry_service_1 = require("./retry.service");
const fraud_hardening_service_1 = require("./fraud-hardening.service");
const idempotency_service_1 = require("./idempotency.service");
const gateway_factory_service_1 = require("./gateway-factory.service");
const stripe_gateway_service_1 = require("./gateways/stripe-gateway.service");
const razorpay_gateway_service_1 = require("./gateways/razorpay-gateway.service");
const audit_module_1 = require("../../audit/audit.module");
const ledger_module_1 = require("../../modules/ledger/ledger.module");
const gst_module_1 = require("../../services/gst/gst.module");
const chargeback_module_1 = require("./chargeback/chargeback.module");
const chargeback_service_1 = require("./chargeback/chargeback.service");
let PaymentServiceModule = class PaymentServiceModule {
};
exports.PaymentServiceModule = PaymentServiceModule;
exports.PaymentServiceModule = PaymentServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_repositories_module_1.DbRepositoriesModule,
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
    })
], PaymentServiceModule);
