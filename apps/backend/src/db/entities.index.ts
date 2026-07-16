import { AddressEntity } from "./entities/address.entity";
import { AuditLogEntity } from "./entities/audit-log.entity";
import { BatchEntity } from "./entities/batch.entity";
import { BranchControlEntity } from "./entities/branch-control.entity";
import { CommissionRuleEntity } from "./entities/commission-rule.entity";
import { CouponEntity } from "./entities/coupon.entity";
import { CouponUsageEntity } from "./entities/coupon-usage.entity";
import { DataExportRequestEntity } from "./entities/data-export-request.entity";
import { DeletionRequestEntity } from "./entities/deletion-request.entity";
import { DeliverySLAEntity } from "./entities/delivery-sla.entity";
import { DeviceFingerprintEntity } from "./entities/device-fingerprint.entity";
import { DisputeEntity } from "./entities/dispute.entity";
import { DriverEntity } from "./entities/driver.entity";
import { DriverAssignmentEntity } from "./entities/driver-assignment.entity";
import { DriverDocumentEntity } from "./entities/driver-document.entity";
import { DriverFraudEntity } from "./entities/driver-fraud.entity";
import { DriverIncentiveEntity } from "./entities/driver-incentive.entity";
import { DriverIssueEntity } from "./entities/driver-issue.entity";
import { DriverPenaltyEntity } from "./entities/driver-penalty.entity";
import { DriverScoreEntity } from "./entities/driver-score.entity";
import { DriverShiftEntity } from "./entities/driver-shift.entity";
import { FoodPrepEntity } from "./entities/food-prep.entity";
import { GSTDetailEntity } from "./entities/gst-detail.entity";
import { HolidayScheduleEntity } from "./entities/holiday-schedule.entity";
import { HSNSACEntity } from "./entities/hsn-sac.entity";
import { InventoryAlertEntity } from "./entities/inventory-alert.entity";
import { InventoryItemEntity } from "./entities/inventory-item.entity";
import { KitchenSLAEntity } from "./entities/kitchen-sla.entity";
import { LedgerEntryEntity } from "./entities/ledger-entry.entity";
import { MfaSecretEntity } from "./entities/mfa.entity";
import { MenuAddonEntity } from "./entities/menu-addon.entity";
import { MenuCategoryEntity } from "./entities/menu-category.entity";
import { MenuItemEntity } from "./entities/menu-item.entity";
import { MenuItemAvailabilityEntity } from "./entities/menu-item-availability.entity";
import { MenuModerationEntity } from "./entities/menu-moderation.entity";
import { MenuVariantEntity } from "./entities/menu-variant.entity";
import { NotificationEntity } from "./entities/notification.entity";
import { NotificationAnalyticsEntity } from "./entities/notification-analytics.entity";
import { NotificationPreferenceEntity } from "./entities/notification-preference.entity";
import { OrderEntity } from "./entities/order.entity";
import { OrderItemEntity } from "./entities/order-item.entity";
import { OtpEntity } from "./entities/otp.entity";
import { PaymentDisputeEntity } from "./entities/payment-dispute.entity";
import { PaymentMethodEntity } from "./entities/payment-method.entity";
import { PaymentWebhookEntity } from "./entities/payment-webhook.entity";
import { PayoutReportEntity } from "./entities/payout-report.entity";
import { RecipeEntity } from "./entities/recipe.entity";
import { ReferralEntity } from "./entities/referral.entity";
import { RefundEntity } from "./entities/refund.entity";
import { RefundApprovalEntity } from "./entities/refund-approval.entity";
import { RestaurantEntity } from "./entities/restaurant.entity";
import { RestaurantBranchEntity } from "./entities/restaurant-branch.entity";
import { RestaurantGSTEntity } from "./entities/restaurant-gst.entity";
import { RestaurantOnboardingEntity } from "./entities/restaurant-onboarding.entity";
import { SessionEntity } from "./entities/session.entity";
import { SLAAlertEntity } from "./entities/sla-alert.entity";
import { StripeWebhookEntity } from "./entities/stripe-webhook.entity";
import { SubscriptionEntity } from "./entities/subscription.entity";
import { SupplierEntity } from "./entities/supplier.entity";
import { SupportTicketEntity, TicketMessageEntity } from "./entities/support-ticket.entity";
import { SurgeZoneEntity } from "./entities/surge-zone.entity";
import { UserDeviceEntity } from "./entities/user-device.entity";
import { UserEntity } from "./entities/user.entity";
import { WalletEntity } from "./entities/wallet.entity";
import { WalletTransactionEntity } from "./entities/wallet-transaction.entity";
import { WebhookRetryQueueEntity } from "./entities/webhook-retry-queue.entity";
import { IdempotencyEntity } from "../services/payments/idempotency.entity";
import { PaymentEventEntity } from "../services/payments/payment-event.entity";
import { PaymentFraudFlagEntity } from "../services/payments/payment-fraud.entity";
import { PaymentValidationEventEntity } from "../services/payments/payment-validation.entity";
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

export const entities = [
  AddressEntity,
  AuditLogEntity,
  BatchEntity,
  BranchControlEntity,
  CommissionRuleEntity,
  CouponEntity,
  CouponUsageEntity,
  DataExportRequestEntity,
  DeletionRequestEntity,
  DeliverySLAEntity,
  DeviceFingerprintEntity,
  DisputeEntity,
  DriverEntity,
  DriverAssignmentEntity,
  DriverDocumentEntity,
  DriverFraudEntity,
  DriverIncentiveEntity,
  DriverIssueEntity,
  DriverPenaltyEntity,
  DriverScoreEntity,
  DriverShiftEntity,
  FoodPrepEntity,
  GSTDetailEntity,
  HolidayScheduleEntity,
  HSNSACEntity,
  InventoryAlertEntity,
  InventoryItemEntity,
  KitchenSLAEntity,
  LedgerEntryEntity,
  MfaSecretEntity,
  MenuAddonEntity,
  MenuCategoryEntity,
  MenuItemEntity,
  MenuItemAvailabilityEntity,
  MenuModerationEntity,
  MenuVariantEntity,
  NotificationEntity,
  NotificationAnalyticsEntity,
  NotificationPreferenceEntity,
  OrderEntity,
  OrderItemEntity,
  OtpEntity,
  PaymentDisputeEntity,
  PaymentMethodEntity,
  PaymentWebhookEntity,
  PayoutReportEntity,
  RecipeEntity,
  ReferralEntity,
  RefundEntity,
  RefundApprovalEntity,
  RestaurantEntity,
  RestaurantBranchEntity,
  RestaurantGSTEntity,
  RestaurantOnboardingEntity,
  SessionEntity,
  SLAAlertEntity,
  StripeWebhookEntity,
  SubscriptionEntity,
  SupplierEntity,
  SupportTicketEntity,
  TicketMessageEntity,
  SurgeZoneEntity,
  UserDeviceEntity,
  UserEntity,
  WalletEntity,
  WalletTransactionEntity,
  WebhookRetryQueueEntity,
  IdempotencyEntity,
  PaymentEventEntity,
  PaymentFraudFlagEntity,
  PaymentValidationEventEntity,
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
