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
import { LegalDocumentEntity } from '../legal/entities/legal-document.entity';
import { LegalVersionEntity } from '../legal/entities/legal-version.entity';
import { LegalAcceptanceEntity } from '../legal/entities/legal-acceptance.entity';
import { CookieConsentEntity } from '../legal/entities/cookie-consent.entity';
import { ConsentLogEntity } from '../legal/entities/consent-log.entity';
import { DataSubjectRequestEntity } from '../legal/entities/data-subject-request.entity';
import { DataExportEntity } from '../legal/entities/data-export.entity';
import { RetentionPolicyEntity } from '../legal/entities/retention-policy.entity';
import { DataRetentionJobEntity } from '../legal/entities/data-retention-job.entity';
import { SecurityIncidentEntity } from '../legal/entities/security-incident.entity';
import { GrievanceEntity } from '../legal/entities/grievance.entity';
import { AgreementEntity } from '../legal/entities/agreement.entity';
import { AgreementAcceptanceEntity } from '../legal/entities/agreement-acceptance.entity';
import { ComplianceAuditEntity } from '../legal/entities/compliance-audit.entity';
import { CookieRegistryEntity } from '../legal/entities/cookie-registry.entity';
import { RiskZoneEntity } from './entities/risk-zone.entity';
import { RiskEventEntity } from './entities/risk-event.entity';
import { RiskNotificationEntity } from './entities/risk-notification.entity';
import { DriverIncidentEntity } from './entities/driver-incident.entity';
import { FraudBlacklistEntity } from './entities/fraud-blacklist.entity';
import { PaymentQrCodeEntity } from './entities/payment-qr.entity';
import { GiftCardEntity } from './entities/gift-card.entity';

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
  RiskZoneEntity,
  RiskEventEntity,
  RiskNotificationEntity,
  DriverIncidentEntity,
  FraudBlacklistEntity,
  PaymentQrCodeEntity,
  GiftCardEntity,
];

const reviewStore = new Map<string, any>();

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [
    {
      provide: getModelToken(ReviewDocument.name),
      useValue: {
        create: (data: any) => {
          const id = data.id || crypto.randomUUID();
          const record = { ...data, id, save: async () => record };
          reviewStore.set(id, record);
          return record;
        },
        new: (data: any) => {
          const id = data.id || crypto.randomUUID();
          const record = { ...data, id, save: async () => record };
          reviewStore.set(id, record);
          return record;
        },
        findOne: async (filter: any = {}) =>
          Array.from(reviewStore.values()).find((r) => Object.entries(filter).every(([k, v]) => r[k] === v)) || null,
        find: async (filter: any = {}) =>
          Array.from(reviewStore.values()).filter((r) => Object.entries(filter).every(([k, v]) => r[k] === v)),
        aggregate: async () => [],
      },
    },
  ],
  exports: [TypeOrmModule, getModelToken(ReviewDocument.name)],
})
export class LocalSqliteRepositoryModule {}
