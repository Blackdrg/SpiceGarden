import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import * as crypto from 'crypto';
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
import { BranchControlEntity } from './entities/branch-control.entity';
import { HolidayScheduleEntity } from './entities/holiday-schedule.entity';
import { NotificationAnalyticsEntity } from './entities/notification-analytics.entity';
import { ReviewDocument, ReviewSchema } from './schemas/review.schema';
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
import { DeletionRequestEntity } from './entities/deletion-request.entity';
import { DataExportRequestEntity } from './entities/data-export-request.entity';
import { NotificationEntity } from './entities/notification.entity';
import { LedgerEntryEntity } from './entities/ledger-entry.entity';
import { DriverDocumentEntity } from './entities/driver-document.entity';
import { DriverIncentiveEntity } from './entities/driver-incentive.entity';
import { SurgeZoneEntity } from './entities/surge-zone.entity';
import { DriverShiftEntity } from './entities/driver-shift.entity';
import { DriverPenaltyEntity } from './entities/driver-penalty.entity';
import { PayoutReportEntity } from './entities/payout-report.entity';
import { CouponEntity } from './entities/coupon.entity';
import { CouponUsageEntity } from './entities/coupon-usage.entity';
import { ReferralEntity } from './entities/referral.entity';
import { NotificationPreferenceEntity } from './entities/notification-preference.entity';
import { UserDeviceEntity } from './entities/user-device.entity';
import { WebhookRetryQueueEntity } from './entities/webhook-retry-queue.entity';
import { PaymentWebhookEntity } from './entities/payment-webhook.entity';
import { RefundEntity } from './entities/refund.entity';
import { RefundApprovalEntity } from './entities/refund-approval.entity';
import { CommissionRuleEntity } from './entities/commission-rule.entity';
import { MenuModerationEntity } from './entities/menu-moderation.entity';
import { RestaurantOnboardingEntity } from './entities/restaurant-onboarding.entity';
import { DisputeEntity } from './entities/dispute.entity';
import { SupportTicketEntity, TicketMessageEntity } from './entities/support-ticket.entity';
import { PaymentMethodEntity } from './entities/payment-method.entity';
import { MfaSecretEntity } from './entities/mfa.entity';
import { DriverIssueEntity } from './entities/driver-issue.entity';
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity';
import { CustomerSubscriptionEntity } from './entities/customer-subscription.entity';
import { RestaurantSubscriptionEntity } from './entities/restaurant-subscription.entity';
import { DeliveryPricingEntity } from './entities/delivery-pricing.entity';
import { PlatformFeeEntity } from './entities/platform-fee.entity';
import { JournalEntryEntity } from './entities/journal-entry.entity';
import { CampaignEntity } from './entities/campaign.entity';
import { AnalyticsEventEntity } from './entities/analytics-event.entity';
import { TenantEntity } from './entities/tenant.entity';
import { ApiKeyEntity } from './entities/api-key.entity';
import { BankAccountEntity } from './entities/bank-account.entity';
import { SettlementReportEntity } from './entities/settlement-report.entity';
import { RiskZoneEntity } from './entities/risk-zone.entity';
import { RiskEventEntity } from './entities/risk-event.entity';
import { RiskNotificationEntity } from './entities/risk-notification.entity';
import { DriverIncidentEntity } from './entities/driver-incident.entity';
import { FraudBlacklistEntity } from './entities/fraud-blacklist.entity';
import { PaymentQrCodeEntity } from './entities/payment-qr.entity';
import { GiftCardEntity } from './entities/gift-card.entity';
import { EmergencyIncidentEntity } from './entities/emergency-incident.entity';
import { EmergencyContactEntity } from './entities/emergency-contact.entity';
import { EmergencyIncidentTimelineEntity } from './entities/emergency-incident-timeline.entity';

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
  DeletionRequestEntity,
  DataExportRequestEntity,
  NotificationEntity,
  LedgerEntryEntity,
  DriverDocumentEntity,
  DriverIncentiveEntity,
  SurgeZoneEntity,
  DriverShiftEntity,
  DriverPenaltyEntity,
  PayoutReportEntity,
  CouponEntity,
  CouponUsageEntity,
  ReferralEntity,
  NotificationPreferenceEntity,
  UserDeviceEntity,
  WebhookRetryQueueEntity,
  PaymentWebhookEntity,
  RefundEntity,
  RefundApprovalEntity,
  CommissionRuleEntity,
  MenuModerationEntity,
  RestaurantOnboardingEntity,
  DisputeEntity,
  SupportTicketEntity,
  PaymentMethodEntity,
  MfaSecretEntity,
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
  AnalyticsEventEntity,
  BranchControlEntity,
  HolidayScheduleEntity,
  NotificationAnalyticsEntity,
  TicketMessageEntity,
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
  RiskZoneEntity,
  RiskEventEntity,
  RiskNotificationEntity,
  DriverIncidentEntity,
  FraudBlacklistEntity,
  PaymentQrCodeEntity,
  GiftCardEntity,
  EmergencyIncidentEntity,
  EmergencyContactEntity,
  EmergencyIncidentTimelineEntity,
];

const isLocalSqlite =
  process.env.LOCAL_DB === 'sqlite' || process.env.LOCAL_DB === 'sqlite-file';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    ...(isLocalSqlite
      ? []
      : [MongooseModule.forFeature([{ name: ReviewDocument.name, schema: ReviewSchema }])]),
  ],
  providers: [
    ...(isLocalSqlite
      ? [
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
        ]
      : []),
  ],
  exports: [
    TypeOrmModule,
    ...(isLocalSqlite ? [getModelToken(ReviewDocument.name)] : [MongooseModule]),
  ],
})
export class DbRepositoriesModule {}
