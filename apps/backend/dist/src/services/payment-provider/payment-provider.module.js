"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_connect_service_1 = require("./stripe-connect.service");
const razorpay_settlement_service_1 = require("./razorpay-settlement.service");
const driver_payout_provider_service_1 = require("./driver-payout-provider.service");
const payment_provider_controller_1 = require("./payment-provider.controller");
const local_repository_module_1 = require("../../db/local-repository.module");
let PaymentProviderModule = class PaymentProviderModule {
};
exports.PaymentProviderModule = PaymentProviderModule;
exports.PaymentProviderModule = PaymentProviderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            local_repository_module_1.LocalRepositoryModule,
        ],
        providers: [
            stripe_connect_service_1.StripeConnectService,
            razorpay_settlement_service_1.RazorpaySettlementService,
            driver_payout_provider_service_1.DriverPayoutProviderService,
        ],
        controllers: [
            payment_provider_controller_1.PaymentProviderController,
        ],
        exports: [
            stripe_connect_service_1.StripeConnectService,
            razorpay_settlement_service_1.RazorpaySettlementService,
            driver_payout_provider_service_1.DriverPayoutProviderService,
        ],
    })
], PaymentProviderModule);
//# sourceMappingURL=payment-provider.module.js.map