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
exports.DbModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("./entities/user.entity");
const order_entity_1 = require("./entities/order.entity");
const session_entity_1 = require("./entities/session.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const restaurant_entity_1 = require("./entities/restaurant.entity");
const restaurant_branch_entity_1 = require("./entities/restaurant-branch.entity");
const menu_category_entity_1 = require("./entities/menu-category.entity");
const menu_item_entity_1 = require("./entities/menu-item.entity");
const inventory_item_entity_1 = require("./entities/inventory-item.entity");
const driver_entity_1 = require("./entities/driver.entity");
const wallet_entity_1 = require("./entities/wallet.entity");
const wallet_transaction_entity_1 = require("./entities/wallet-transaction.entity");
const address_entity_1 = require("./entities/address.entity");
const menu_variant_entity_1 = require("./entities/menu-variant.entity");
const menu_addon_entity_1 = require("./entities/menu-addon.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const subscription_entity_1 = require("./entities/subscription.entity");
const hsn_sac_entity_1 = require("./entities/hsn-sac.entity");
const otp_entity_1 = require("./entities/otp.entity");
const device_fingerprint_entity_1 = require("./entities/device-fingerprint.entity");
const recipe_entity_1 = require("./entities/recipe.entity");
const batch_entity_1 = require("./entities/batch.entity");
const food_prep_entity_1 = require("./entities/food-prep.entity");
const kitchen_sla_entity_1 = require("./entities/kitchen-sla.entity");
const supplier_entity_1 = require("./entities/supplier.entity");
const inventory_alert_entity_1 = require("./entities/inventory-alert.entity");
const driver_assignment_entity_1 = require("./entities/driver-assignment.entity");
const sla_alert_entity_1 = require("./entities/sla-alert.entity");
const menu_item_availability_entity_1 = require("./entities/menu-item-availability.entity");
const driver_score_entity_1 = require("./entities/driver-score.entity");
const delivery_sla_entity_1 = require("./entities/delivery-sla.entity");
const driver_fraud_entity_1 = require("./entities/driver-fraud.entity");
const stripe_webhook_entity_1 = require("./entities/stripe-webhook.entity");
const gst_detail_entity_1 = require("./entities/gst-detail.entity");
const restaurant_gst_entity_1 = require("./entities/restaurant-gst.entity");
const payment_dispute_entity_1 = require("./entities/payment-dispute.entity");
const idempotency_entity_1 = require("../services/payments/idempotency.entity");
const payment_validation_entity_1 = require("../services/payments/payment-validation.entity");
const payment_fraud_entity_1 = require("../services/payments/payment-fraud.entity");
const payment_event_entity_1 = require("../services/payments/payment-event.entity");
const postgres_adapter_1 = require("./postgres.adapter");
const redis_adapter_1 = require("./redis.adapter");
const review_schema_1 = require("./schemas/review.schema");
const entities = [
    user_entity_1.UserEntity,
    order_entity_1.OrderEntity,
    session_entity_1.SessionEntity,
    audit_log_entity_1.AuditLogEntity,
    restaurant_entity_1.RestaurantEntity,
    restaurant_branch_entity_1.RestaurantBranchEntity,
    restaurant_gst_entity_1.RestaurantGSTEntity,
    menu_category_entity_1.MenuCategoryEntity,
    menu_item_entity_1.MenuItemEntity,
    hsn_sac_entity_1.HSNSACEntity,
    inventory_item_entity_1.InventoryItemEntity,
    driver_entity_1.DriverEntity,
    wallet_entity_1.WalletEntity,
    wallet_transaction_entity_1.WalletTransactionEntity,
    address_entity_1.AddressEntity,
    menu_variant_entity_1.MenuVariantEntity,
    menu_addon_entity_1.MenuAddonEntity,
    order_item_entity_1.OrderItemEntity,
    subscription_entity_1.SubscriptionEntity,
    otp_entity_1.OtpEntity,
    device_fingerprint_entity_1.DeviceFingerprintEntity,
    recipe_entity_1.RecipeEntity,
    batch_entity_1.BatchEntity,
    food_prep_entity_1.FoodPrepEntity,
    kitchen_sla_entity_1.KitchenSLAEntity,
    supplier_entity_1.SupplierEntity,
    inventory_alert_entity_1.InventoryAlertEntity,
    driver_assignment_entity_1.DriverAssignmentEntity,
    sla_alert_entity_1.SLAAlertEntity,
    menu_item_availability_entity_1.MenuItemAvailabilityEntity,
    driver_score_entity_1.DriverScoreEntity,
    delivery_sla_entity_1.DeliverySLAEntity,
    driver_fraud_entity_1.DriverFraudEntity,
    stripe_webhook_entity_1.StripeWebhookEntity,
    gst_detail_entity_1.GSTDetailEntity,
    payment_dispute_entity_1.PaymentDisputeEntity,
    idempotency_entity_1.IdempotencyEntity,
    payment_validation_entity_1.PaymentValidationEventEntity,
    payment_fraud_entity_1.PaymentFraudFlagEntity,
    payment_event_entity_1.PaymentEventEntity,
];
let DbModule = (() => {
    let _classDecorators = [(0, common_1.Global)(), (0, common_1.Module)({
            imports: [
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: (configService) => ({
                        type: "postgres",
                        host: "localhost",
                        port: 5432,
                        username: "spicegarden",
                        password: "nkYD5s1HBlr8VpyB42btP1On32kBMg4PWy/fRH5zgZ8=",
                        database: "spicegarden",
                        entities: entities,
                        synchronize: true,
                    }),
                    inject: [config_1.ConfigService],
                }),
                typeorm_1.TypeOrmModule.forFeature(entities),
                mongoose_1.MongooseModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: (configService) => ({
                        uri: configService.get("MONGO_URI") || "mongodb://localhost:27017/spicegarden",
                        connectionFactory: (connection) => {
                            connection.on('error', (err) => {
                                console.error('MongoDB connection error:', err);
                            });
                            connection.on('connected', () => {
                                console.log('MongoDB connected successfully');
                            });
                            return connection;
                        },
                    }),
                    inject: [config_1.ConfigService],
                }),
                mongoose_1.MongooseModule.forFeature([{ name: review_schema_1.ReviewDocument.name, schema: review_schema_1.ReviewSchema }]),
            ],
            providers: [postgres_adapter_1.PostgresAdapter, redis_adapter_1.RedisAdapter],
            exports: [postgres_adapter_1.PostgresAdapter, redis_adapter_1.RedisAdapter, typeorm_1.TypeOrmModule, mongoose_1.MongooseModule],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DbModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DbModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return DbModule = _classThis;
})();
exports.DbModule = DbModule;
