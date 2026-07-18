import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { ReviewDocument, ReviewSchema } from './schemas/review.schema';
import { UserEntity } from './entities/user.entity';
import { OrderEntity } from './entities/order.entity';
import { SessionEntity } from './entities/session.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { RestaurantEntity } from './entities/restaurant.entity';
import { RestaurantBranchEntity } from './entities/restaurant-branch.entity';
import { MenuCategoryEntity } from './entities/menu-category.entity';
import { MenuItemEntity } from './entities/menu-item.entity';
import { InventoryItemEntity } from './entities/inventory-item.entity';
import { DriverEntity } from './entities/driver.entity';
import { WalletEntity } from './entities/wallet.entity';
import { WalletTransactionEntity } from './entities/wallet-transaction.entity';
import { AddressEntity } from './entities/address.entity';
import { MenuVariantEntity } from './entities/menu-variant.entity';
import { MenuAddonEntity } from './entities/menu-addon.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { HSNSACEntity } from './entities/hsn-sac.entity';
import { OtpEntity } from './entities/otp.entity';
import { DeviceFingerprintEntity } from './entities/device-fingerprint.entity';
import { RecipeEntity } from './entities/recipe.entity';
import { BatchEntity } from './entities/batch.entity';
import { FoodPrepEntity } from './entities/food-prep.entity';
import { KitchenSLAEntity } from './entities/kitchen-sla.entity';
import { SupplierEntity } from './entities/supplier.entity';
import { InventoryAlertEntity } from './entities/inventory-alert.entity';
import { DriverAssignmentEntity } from './entities/driver-assignment.entity';
import { SLAAlertEntity } from './entities/sla-alert.entity';
import { MenuItemAvailabilityEntity } from './entities/menu-item-availability.entity';
import { DriverScoreEntity } from './entities/driver-score.entity';
import { DeliverySLAEntity } from './entities/delivery-sla.entity';
import { DriverFraudEntity } from './entities/driver-fraud.entity';
import { StripeWebhookEntity } from './entities/stripe-webhook.entity';
import { GSTDetailEntity } from './entities/gst-detail.entity';
import { RestaurantGSTEntity } from './entities/restaurant-gst.entity';
import { PaymentDisputeEntity } from './entities/payment-dispute.entity';
import { IdempotencyEntity } from '../services/payments/idempotency.entity';
import { PaymentValidationEventEntity } from '../services/payments/payment-validation.entity';
import { PaymentFraudFlagEntity } from '../services/payments/payment-fraud.entity';
import { PaymentEventEntity } from '../services/payments/payment-event.entity';
import {
  LegalDocumentEntity,
  LegalVersionEntity,
  LegalAcceptanceEntity,
  CookieConsentEntity,
  ConsentLogEntity,
  DataSubjectRequestEntity,
  DataExportEntity,
  RetentionPolicyEntity,
  DataRetentionJobEntity,
  SecurityIncidentEntity,
  GrievanceEntity,
  AgreementEntity,
  AgreementAcceptanceEntity,
  ComplianceAuditEntity,
  CookieRegistryEntity,
} from '../legal/entities';

const entities = [
  UserEntity, OrderEntity, SessionEntity, AuditLogEntity,
  RestaurantEntity, RestaurantBranchEntity, RestaurantGSTEntity,
  MenuCategoryEntity, MenuItemEntity, HSNSACEntity, InventoryItemEntity,
  DriverEntity, WalletEntity, WalletTransactionEntity, AddressEntity,
  MenuVariantEntity, MenuAddonEntity, OrderItemEntity, SubscriptionEntity,
  OtpEntity, DeviceFingerprintEntity, RecipeEntity, BatchEntity,
  FoodPrepEntity, KitchenSLAEntity, SupplierEntity, InventoryAlertEntity,
  DriverAssignmentEntity, SLAAlertEntity, MenuItemAvailabilityEntity,
  DriverScoreEntity, DeliverySLAEntity, DriverFraudEntity, StripeWebhookEntity,
  GSTDetailEntity,   PaymentDisputeEntity, IdempotencyEntity,
  PaymentValidationEventEntity, PaymentFraudFlagEntity, PaymentEventEntity,
  LegalDocumentEntity, LegalVersionEntity, LegalAcceptanceEntity,
  CookieConsentEntity, ConsentLogEntity, DataSubjectRequestEntity,
  DataExportEntity, RetentionPolicyEntity, DataRetentionJobEntity,
  SecurityIncidentEntity, GrievanceEntity, AgreementEntity,
  AgreementAcceptanceEntity, ComplianceAuditEntity, CookieRegistryEntity,
];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [
    {
      provide: getModelToken(ReviewDocument.name),
      useValue: {
        create: (data: any) => ({ ...data, save: async () => ({ ...data, id: data.id || crypto.randomUUID() }) }),
        new: (data: any) => ({ ...data, save: async () => ({ ...data, id: data.id || crypto.randomUUID() }) }),
        findOne: async () => null,
        find: async () => [],
        aggregate: async () => [],
      },
    },
  ],
  exports: [TypeOrmModule, getModelToken(ReviewDocument.name)],
})
export class LocalSqliteRepositoryModule {}
