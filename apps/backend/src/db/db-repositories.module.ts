import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { ReviewDocument, ReviewSchema } from './schemas/review.schema';
import { MongooseModule } from '@nestjs/mongoose';
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
import { SupportTicketEntity } from './entities/support-ticket.entity';
import { PaymentMethodEntity } from './entities/payment-method.entity';

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
];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities), MongooseModule.forFeature([{ name: ReviewDocument.name, schema: ReviewSchema }])],
  exports: [TypeOrmModule, MongooseModule],
})
export class DbRepositoriesModule {}
