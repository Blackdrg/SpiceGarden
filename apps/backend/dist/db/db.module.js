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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.DbModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const local_repository_module_1 = require("./local-repository.module");
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
const localSqlite = process.env.LOCAL_DB === 'sqlite' || (!process.env.DB_HOST && process.env.NODE_ENV !== 'production');
function localReviewModelProvider() {
    const store = [];
    return {
        provide: (0, mongoose_1.getModelToken)(review_schema_1.ReviewDocument.name),
        useValue: {
            create: (data) => ({ ...data, save: async () => ({ ...data, id: data.id || crypto.randomUUID() }) }),
            new: (data) => ({ ...data, save: async () => ({ ...data, id: data.id || crypto.randomUUID() }) }),
            findOne: async () => store[0] || null,
            find: async () => store,
            aggregate: async () => [],
        },
    };
}
const imports = localSqlite
    ? [local_repository_module_1.LocalRepositoryModule]
    : [
        typeorm_1.TypeOrmModule.forRootAsync({
            imports: [config_1.ConfigModule],
            useFactory: (configService) => ({
                type: "postgres",
                host: configService.get("DB_HOST") || "localhost",
                port: configService.get("DB_PORT", 5432),
                username: configService.get("DB_USER") || "spicegarden",
                password: configService.get("DB_PASS") || "spicegarden_dev",
                database: configService.get("DB_NAME") || "spicegarden",
                entities,
                synchronize: true,
            }),
            inject: [config_1.ConfigService],
        }),
    ];
if (!localSqlite) {
    imports.push(mongoose_1.MongooseModule.forRootAsync({
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
    }), mongoose_1.MongooseModule.forFeature([{ name: review_schema_1.ReviewDocument.name, schema: review_schema_1.ReviewSchema }]));
}
else {
    imports.push(localReviewModelProvider());
}
let DbModule = class DbModule {
};
exports.DbModule = DbModule;
exports.DbModule = DbModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports,
        providers: [...(localSqlite ? [localReviewModelProvider()] : [])],
        exports: localSqlite ? [local_repository_module_1.LocalRepositoryModule] : [typeorm_1.TypeOrmModule, mongoose_1.MongooseModule],
    })
], DbModule);
//# sourceMappingURL=db.module.js.map