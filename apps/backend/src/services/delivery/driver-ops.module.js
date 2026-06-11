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
exports.DriverOpsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const driver_onboarding_service_1 = require("./driver-onboarding.service");
const driver_payout_service_1 = require("./driver-payout.service");
const driver_ops_controller_1 = require("./driver-ops.controller");
const driver_entity_1 = require("../../db/entities/driver.entity");
const driver_document_entity_1 = require("../../db/entities/driver-document.entity");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const wallet_module_1 = require("../wallet/wallet.module");
const payments_module_1 = require("../payments/payments.module");
let DriverOpsModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([
                    driver_entity_1.DriverEntity,
                    driver_document_entity_1.DriverDocumentEntity,
                    driver_incentive_entity_1.DriverIncentiveEntity,
                    order_entity_1.OrderEntity,
                    user_entity_1.UserEntity,
                    driver_assignment_entity_1.DriverAssignmentEntity,
                ]),
                wallet_module_1.WalletModule,
                payments_module_1.PaymentServiceModule,
            ],
            providers: [driver_onboarding_service_1.DriverOnboardingService, driver_payout_service_1.DriverPayoutService],
            controllers: [driver_ops_controller_1.DriverOpsController],
            exports: [driver_onboarding_service_1.DriverOnboardingService, driver_payout_service_1.DriverPayoutService],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DriverOpsModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DriverOpsModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return DriverOpsModule = _classThis;
})();
exports.DriverOpsModule = DriverOpsModule;
