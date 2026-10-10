"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entities = void 0;
const address_entity_1 = require("./entities/address.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const batch_entity_1 = require("./entities/batch.entity");
const branch_control_entity_1 = require("./entities/branch-control.entity");
const commission_rule_entity_1 = require("./entities/commission-rule.entity");
const coupon_entity_1 = require("./entities/coupon.entity");
const coupon_usage_entity_1 = require("./entities/coupon-usage.entity");
const data_export_request_entity_1 = require("./entities/data-export-request.entity");
const deletion_request_entity_1 = require("./entities/deletion-request.entity");
const delivery_sla_entity_1 = require("./entities/delivery-sla.entity");
const device_fingerprint_entity_1 = require("./entities/device-fingerprint.entity");
const dispute_entity_1 = require("./entities/dispute.entity");
const driver_entity_1 = require("./entities/driver.entity");
const driver_assignment_entity_1 = require("./entities/driver-assignment.entity");
const driver_document_entity_1 = require("./entities/driver-document.entity");
const driver_fraud_entity_1 = require("./entities/driver-fraud.entity");
const driver_incentive_entity_1 = require("./entities/driver-incentive.entity");
const driver_penalty_entity_1 = require("./entities/driver-penalty.entity");
const driver_score_entity_1 = require("./entities/driver-score.entity");
const driver_shift_entity_1 = require("./entities/driver-shift.entity");
const food_prep_entity_1 = require("./entities/food-prep.entity");
const gst_detail_entity_1 = require("./entities/gst-detail.entity");
const holiday_schedule_entity_1 = require("./entities/holiday-schedule.entity");
const hsn_sac_entity_1 = require("./entities/hsn-sac.entity");
const inventory_alert_entity_1 = require("./entities/inventory-alert.entity");
const inventory_item_entity_1 = require("./entities/inventory-item.entity");
const kitchen_sla_entity_1 = require("./entities/kitchen-sla.entity");
const ledger_entry_entity_1 = require("./entities/ledger-entry.entity");
const menu_addon_entity_1 = require("./entities/menu-addon.entity");
const menu_category_entity_1 = require("./entities/menu-category.entity");
const menu_item_entity_1 = require("./entities/menu-item.entity");
const menu_item_availability_entity_1 = require("./entities/menu-item-availability.entity");
const menu_moderation_entity_1 = require("./entities/menu-moderation.entity");
const menu_variant_entity_1 = require("./entities/menu-variant.entity");
const notification_entity_1 = require("./entities/notification.entity");
const notification_analytics_entity_1 = require("./entities/notification-analytics.entity");
const notification_preference_entity_1 = require("./entities/notification-preference.entity");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const otp_entity_1 = require("./entities/otp.entity");
const payment_dispute_entity_1 = require("./entities/payment-dispute.entity");
const payment_method_entity_1 = require("./entities/payment-method.entity");
const payment_webhook_entity_1 = require("./entities/payment-webhook.entity");
const payout_report_entity_1 = require("./entities/payout-report.entity");
const recipe_entity_1 = require("./entities/recipe.entity");
const referral_entity_1 = require("./entities/referral.entity");
const refund_entity_1 = require("./entities/refund.entity");
const refund_approval_entity_1 = require("./entities/refund-approval.entity");
const restaurant_entity_1 = require("./entities/restaurant.entity");
const restaurant_branch_entity_1 = require("./entities/restaurant-branch.entity");
const restaurant_gst_entity_1 = require("./entities/restaurant-gst.entity");
const restaurant_onboarding_entity_1 = require("./entities/restaurant-onboarding.entity");
const session_entity_1 = require("./entities/session.entity");
const sla_alert_entity_1 = require("./entities/sla-alert.entity");
const stripe_webhook_entity_1 = require("./entities/stripe-webhook.entity");
const subscription_entity_1 = require("./entities/subscription.entity");
const supplier_entity_1 = require("./entities/supplier.entity");
const support_ticket_entity_1 = require("./entities/support-ticket.entity");
const surge_zone_entity_1 = require("./entities/surge-zone.entity");
const user_device_entity_1 = require("./entities/user-device.entity");
const user_entity_1 = require("./entities/user.entity");
const wallet_entity_1 = require("./entities/wallet.entity");
const wallet_transaction_entity_1 = require("./entities/wallet-transaction.entity");
const webhook_retry_queue_entity_1 = require("./entities/webhook-retry-queue.entity");
exports.entities = [
    address_entity_1.AddressEntity,
    audit_log_entity_1.AuditLogEntity,
    batch_entity_1.BatchEntity,
    branch_control_entity_1.BranchControlEntity,
    commission_rule_entity_1.CommissionRuleEntity,
    coupon_entity_1.CouponEntity,
    coupon_usage_entity_1.CouponUsageEntity,
    data_export_request_entity_1.DataExportRequestEntity,
    deletion_request_entity_1.DeletionRequestEntity,
    delivery_sla_entity_1.DeliverySLAEntity,
    device_fingerprint_entity_1.DeviceFingerprintEntity,
    dispute_entity_1.DisputeEntity,
    driver_entity_1.DriverEntity,
    driver_assignment_entity_1.DriverAssignmentEntity,
    driver_document_entity_1.DriverDocumentEntity,
    driver_fraud_entity_1.DriverFraudEntity,
    driver_incentive_entity_1.DriverIncentiveEntity,
    driver_penalty_entity_1.DriverPenaltyEntity,
    driver_score_entity_1.DriverScoreEntity,
    driver_shift_entity_1.DriverShiftEntity,
    food_prep_entity_1.FoodPrepEntity,
    gst_detail_entity_1.GSTDetailEntity,
    holiday_schedule_entity_1.HolidayScheduleEntity,
    hsn_sac_entity_1.HSNSACEntity,
    inventory_alert_entity_1.InventoryAlertEntity,
    inventory_item_entity_1.InventoryItemEntity,
    kitchen_sla_entity_1.KitchenSLAEntity,
    ledger_entry_entity_1.LedgerEntryEntity,
    menu_addon_entity_1.MenuAddonEntity,
    menu_category_entity_1.MenuCategoryEntity,
    menu_item_entity_1.MenuItemEntity,
    menu_item_availability_entity_1.MenuItemAvailabilityEntity,
    menu_moderation_entity_1.MenuModerationEntity,
    menu_variant_entity_1.MenuVariantEntity,
    notification_entity_1.NotificationEntity,
    notification_analytics_entity_1.NotificationAnalyticsEntity,
    notification_preference_entity_1.NotificationPreferenceEntity,
    order_entity_1.OrderEntity,
    order_item_entity_1.OrderItemEntity,
    otp_entity_1.OtpEntity,
    payment_dispute_entity_1.PaymentDisputeEntity,
    payment_method_entity_1.PaymentMethodEntity,
    payment_webhook_entity_1.PaymentWebhookEntity,
    payout_report_entity_1.PayoutReportEntity,
    recipe_entity_1.RecipeEntity,
    referral_entity_1.ReferralEntity,
    refund_entity_1.RefundEntity,
    refund_approval_entity_1.RefundApprovalEntity,
    restaurant_entity_1.RestaurantEntity,
    restaurant_branch_entity_1.RestaurantBranchEntity,
    restaurant_gst_entity_1.RestaurantGSTEntity,
    restaurant_onboarding_entity_1.RestaurantOnboardingEntity,
    session_entity_1.SessionEntity,
    sla_alert_entity_1.SLAAlertEntity,
    stripe_webhook_entity_1.StripeWebhookEntity,
    subscription_entity_1.SubscriptionEntity,
    supplier_entity_1.SupplierEntity,
    support_ticket_entity_1.SupportTicketEntity,
    surge_zone_entity_1.SurgeZoneEntity,
    user_device_entity_1.UserDeviceEntity,
    user_entity_1.UserEntity,
    wallet_entity_1.WalletEntity,
    wallet_transaction_entity_1.WalletTransactionEntity,
    webhook_retry_queue_entity_1.WebhookRetryQueueEntity,
];
