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
exports.DeliveryServiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const delivery_service_1 = require("./delivery.service");
const driver_entity_1 = require("../../db/entities/driver.entity");
const wallet_entity_1 = require("../../db/entities/wallet.entity");
const wallet_transaction_entity_1 = require("../../db/entities/wallet-transaction.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const batch_entity_1 = require("../../db/entities/batch.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const driver_score_entity_1 = require("../../db/entities/driver-score.entity");
const driver_fraud_entity_1 = require("../../db/entities/driver-fraud.entity");
const geo_service_1 = require("../../services/geo/geo.service");
let DeliveryServiceModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forFeature([
                    driver_entity_1.DriverEntity,
                    wallet_entity_1.WalletEntity,
                    wallet_transaction_entity_1.WalletTransactionEntity,
                    order_entity_1.OrderEntity,
                    batch_entity_1.BatchEntity,
                    driver_assignment_entity_1.DriverAssignmentEntity,
                    driver_score_entity_1.DriverScoreEntity,
                    driver_fraud_entity_1.DriverFraudEntity,
                ]),
            ],
            providers: [delivery_service_1.DeliveryService, geo_service_1.GeoService],
            exports: [delivery_service_1.DeliveryService],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DeliveryServiceModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DeliveryServiceModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return DeliveryServiceModule = _classThis;
})();
exports.DeliveryServiceModule = DeliveryServiceModule;
