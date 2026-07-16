import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as path from "path";
import { LocalRepositoryModule } from "./local-repository.module";
import { UserEntity } from "./entities/user.entity";
import { OrderEntity } from "./entities/order.entity";
import { SessionEntity } from "./entities/session.entity";
import { AuditLogEntity } from "./entities/audit-log.entity";
import { RestaurantEntity } from "./entities/restaurant.entity";
import { RestaurantBranchEntity } from "./entities/restaurant-branch.entity";
import { MenuCategoryEntity } from "./entities/menu-category.entity";
import { MenuItemEntity } from "./entities/menu-item.entity";
import { InventoryItemEntity } from "./entities/inventory-item.entity";
import { DriverEntity } from "./entities/driver.entity";
import { WalletEntity } from "./entities/wallet.entity";
import { WalletTransactionEntity } from "./entities/wallet-transaction.entity";
import { AddressEntity } from "./entities/address.entity";
import { MenuVariantEntity } from "./entities/menu-variant.entity";
import { MenuAddonEntity } from "./entities/menu-addon.entity";
import { OrderItemEntity } from "./entities/order-item.entity";
import { SubscriptionEntity } from "./entities/subscription.entity";
import { HSNSACEntity } from "./entities/hsn-sac.entity";
import { OtpEntity } from "./entities/otp.entity";
import { DeviceFingerprintEntity } from "./entities/device-fingerprint.entity";
import { RecipeEntity } from "./entities/recipe.entity";
import { BatchEntity } from "./entities/batch.entity";
import { FoodPrepEntity } from "./entities/food-prep.entity";
import { KitchenSLAEntity } from "./entities/kitchen-sla.entity";
import { SupplierEntity } from "./entities/supplier.entity";
import { InventoryAlertEntity } from "./entities/inventory-alert.entity";
import { DriverAssignmentEntity } from "./entities/driver-assignment.entity";
import { SLAAlertEntity } from "./entities/sla-alert.entity";
import { MenuItemAvailabilityEntity } from "./entities/menu-item-availability.entity";
import { DriverScoreEntity } from "./entities/driver-score.entity";
import { DeliverySLAEntity } from "./entities/delivery-sla.entity";
import { DriverFraudEntity } from "./entities/driver-fraud.entity";
import { StripeWebhookEntity } from "./entities/stripe-webhook.entity";
import { GSTDetailEntity } from "./entities/gst-detail.entity";
import { RestaurantGSTEntity } from "./entities/restaurant-gst.entity";
import { PaymentDisputeEntity } from "./entities/payment-dispute.entity";
import { IdempotencyEntity } from "../services/payments/idempotency.entity";
import { PaymentValidationEventEntity } from "../services/payments/payment-validation.entity";
import { PaymentFraudFlagEntity } from "../services/payments/payment-fraud.entity";
import { PaymentEventEntity } from "../services/payments/payment-event.entity";
import { DriverIssueEntity } from "./entities/driver-issue.entity";
import { SubscriptionPlanEntity } from "./entities/subscription-plan.entity";
import { CustomerSubscriptionEntity } from "./entities/customer-subscription.entity";
import { RestaurantSubscriptionEntity } from "./entities/restaurant-subscription.entity";
import { DeliveryPricingEntity } from "./entities/delivery-pricing.entity";
import { PlatformFeeEntity } from "./entities/platform-fee.entity";
import { JournalEntryEntity } from "./entities/journal-entry.entity";
import { CampaignEntity } from "./entities/campaign.entity";
import { TenantEntity } from "./entities/tenant.entity";
import { ApiKeyEntity } from "./entities/api-key.entity";
import { BankAccountEntity } from "./entities/bank-account.entity";
import { SettlementReportEntity } from "./entities/settlement-report.entity";
import { ReviewDocument, ReviewSchema } from "./schemas/review.schema";
import { AppLocalDataSource } from "./data-source.local";
import { LocalSqliteRepositoryModule } from "./local-sqlite-repository.module";

const entities = [
  UserEntity,
  OrderEntity,
  SessionEntity,
  AuditLogEntity,
  RestaurantEntity,
  RestaurantBranchEntity,
  RestaurantGSTEntity,
  MenuCategoryEntity,
  MenuItemEntity,
  HSNSACEntity,
  InventoryItemEntity,
  DriverEntity,
  WalletEntity,
  WalletTransactionEntity,
  AddressEntity,
  MenuVariantEntity,
  MenuAddonEntity,
  OrderItemEntity,
  SubscriptionEntity,
  OtpEntity,
  DeviceFingerprintEntity,
  RecipeEntity,
  BatchEntity,
  FoodPrepEntity,
  KitchenSLAEntity,
  SupplierEntity,
  InventoryAlertEntity,
  DriverAssignmentEntity,
  SLAAlertEntity,
  MenuItemAvailabilityEntity,
  DriverScoreEntity,
  DeliverySLAEntity,
  DriverFraudEntity,
  StripeWebhookEntity,
  GSTDetailEntity,
  PaymentDisputeEntity,
  IdempotencyEntity,
  PaymentValidationEventEntity,
  PaymentFraudFlagEntity,
  PaymentEventEntity,
  DriverIssueEntity,
  SubscriptionPlanEntity,
  CustomerSubscriptionEntity,
  RestaurantSubscriptionEntity,
  DeliveryPricingEntity,
  PlatformFeeEntity,
  JournalEntryEntity,
  CampaignEntity,
  TenantEntity,
  ApiKeyEntity,
  BankAccountEntity,
  SettlementReportEntity,
];

const localSqlite = process.env.LOCAL_DB === "sqlite";
const localSqliteFile = process.env.LOCAL_DB === "sqlite-file";

function localReviewModelProvider() {
  const store: any[] = [];
  return {
    provide: getModelToken(ReviewDocument.name),
    useValue: {
      create: (data: any) => ({ ...data, save: async () => ({ ...data, id: data.id || crypto.randomUUID() }) }),
      new: (data: any) => ({ ...data, save: async () => ({ ...data, id: data.id || crypto.randomUUID() }) }),
      findOne: async () => store[0] || null,
      find: async () => store,
      aggregate: async () => [],
    },
  };
}

function createSqliteImports() {
  return [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "sqlite",
        database: configService.get<string>("LOCAL_DB_PATH") || "./local-dev.sqlite",
        entities,
        synchronize: true,
        logging: configService.get<string>("DB_LOGGING", "false") === "true",
      }),
      inject: [ConfigService],
    }),
    LocalSqliteRepositoryModule,
  ];
}

const useLocalSqlite = localSqliteFile || localSqlite;

const imports: any[] = useLocalSqlite
  ? createSqliteImports()
  : [
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          type: "postgres",
          host: configService.get<string>("DB_HOST") || "localhost",
          port: configService.get<number>("DB_PORT", 5432),
          username: configService.get<string>("DB_USER") || "spicegarden",
          password: configService.get<string>("DB_PASS") || "spicegarden_dev",
          database: configService.get<string>("DB_NAME") || "spicegarden",
          entities,
          synchronize: false,
          migrations: ["dist/db/migrations/*.js"],
          migrationsRun: true,
          poolSize: configService.get<number>("DB_POOL_SIZE", 20),
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
          maxQueryExecutionTime: 1000,
          keepAlive: true,
          statementTimeout: 30000,
          logging: configService.get<string>("DB_LOGGING", "false") === "true",
        }),
        inject: [ConfigService],
      }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          uri: configService.get<string>("MONGO_URI") || "mongodb://localhost:27017/spicegarden",
          connectionFactory: (connection: any) => {
            connection.on("error", (err: unknown) => {
              console.error("MongoDB connection error:", err);
            });
            connection.on("connected", () => {
              console.log("MongoDB connected successfully");
            });
            return connection;
          },
        }),
        inject: [ConfigService],
      } as any),
      MongooseModule.forFeature([{ name: ReviewDocument.name, schema: ReviewSchema }]) as any,
    ];

@Global()
@Module({
  imports,
  providers: [
    ...(useLocalSqlite ? [localReviewModelProvider()] : []),
  ],
  exports: useLocalSqlite
    ? [TypeOrmModule, LocalSqliteRepositoryModule, getModelToken(ReviewDocument.name)]
    : [TypeOrmModule, MongooseModule],
})
export class DbModule {}

