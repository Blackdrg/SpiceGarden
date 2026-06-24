"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModule = void 0;
const common_1 = require("@nestjs/common");
const local_repository_module_1 = require("../../../db/local-repository.module");
const webhook_service_1 = require("./webhook.service");
const webhook_controller_1 = require("./webhook.controller");
const notification_module_1 = require("../../../services/notifications/notification.module");
const chargeback_module_1 = require("../chargeback/chargeback.module");
const ledger_module_1 = require("../../../modules/ledger/ledger.module");
const gateway_factory_service_1 = require("../gateway-factory.service");
const stripe_gateway_service_1 = require("../gateways/stripe-gateway.service");
const razorpay_gateway_service_1 = require("../gateways/razorpay-gateway.service");
let WebhookModule = class WebhookModule {
};
exports.WebhookModule = WebhookModule;
exports.WebhookModule = WebhookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            local_repository_module_1.LocalRepositoryModule,
            notification_module_1.NotificationModule,
            (0, common_1.forwardRef)(() => chargeback_module_1.ChargebackModule),
            ledger_module_1.LedgerModule,
        ],
        providers: [webhook_service_1.WebhookService, gateway_factory_service_1.PaymentGatewayFactory, stripe_gateway_service_1.StripeGateway, razorpay_gateway_service_1.RazorpayGateway],
        controllers: [webhook_controller_1.PaymentWebhookController],
        exports: [webhook_service_1.WebhookService],
    })
], WebhookModule);
