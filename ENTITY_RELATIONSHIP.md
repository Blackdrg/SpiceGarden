# Entity Relationship Reference

## Overview

SpiceGarden uses 67 TypeORM entities across 7 domains: User, Restaurant, Order, Driver, Payment, Notification, and Kitchen/Inventory.

**Source:** `apps/backend/src/db/entities/*.entity.ts`

---

## Relationship Map

### Core User Relationships

```
User (users)
├── 1:1 Profile → UserEntity (self-reference, optional)
├── 1:N Addresses → AddressEntity
├── 1:N Sessions → SessionEntity
├── 1:N Devices → UserDeviceEntity
├── 1:N DeviceFingerprints → DeviceFingerprintEntity
├── 1:N PaymentMethods → PaymentMethodEntity
├── 1:N NotificationPreferences → NotificationPreferenceEntity
├── 1:N Notifications → NotificationEntity
├── 1:N Wallets → WalletEntity
├── 1:N RefundRequests → RefundEntity (requestedBy)
├── 1:N RefundApprovals → RefundApprovalEntity (approvedBy)
├── 1:N CouponUsages → CouponUsageEntity
├── 1:N ReferralsSent → ReferralEntity (referrerId)
├── 1:N ReferralsReceived → ReferralEntity (refereeId)
├── 1:N DeletionRequests → DeletionRequestEntity
├── 1:N DataExportRequests → DataExportRequestEntity
├── 1:N OTPs → OtpEntity (optional, by identifier)
├── 1:N AuditLogs → AuditLogEntity (performedBy)
└── 1:1 Driver → DriverEntity (when role=delivery_partner)
```

### Restaurant Relationships

```
Restaurant (restaurants)
├── 1:N Branches → RestaurantBranchEntity
├── 1:1 GSTDetails → RestaurantGSTEntity
├── 1:N CommissionRules → CommissionRuleEntity
├── 1:N RestaurantOnboarding → RestaurantOnboardingEntity
├── 1:N PayoutReports → PayoutReportEntity
└── 1:N Orders → OrderEntity (indirect via branch/restaurantId)
```

```
RestaurantBranch (restaurant_branches)
├── N:1 Restaurant → RestaurantEntity
├── 1:N MenuCategories → MenuCategoryEntity
├── 1:N Orders → OrderEntity (branchId)
├── 1:N DriverAssignments → DriverAssignmentEntity
├── 1:N KitchenSLA → KitchenSlaEntity
├── 1:N DeliverySLA → DeliverySlaEntity
├── 1:N DriverFraud → DriverFraudEntity (branchId)
├── N:1 BranchControl → BranchControlEntity
├── 1:N HolidaySchedules → HolidayScheduleEntity
└── 1:N Batches → BatchEntity
```

### Menu Relationships

```
MenuCategory (menu_categories)
├── N:1 RestaurantBranch → RestaurantBranchEntity
├── 1:N MenuItems → MenuItemEntity
└── 1:N Coupons → CouponEntity (scope='category')
```

```
MenuItem (menu_items)
├── N:1 MenuCategory → MenuCategoryEntity
├── 1:N Addons → MenuAddonEntity
├── 1:N Variants → MenuVariantEntity
├── 1:N Availability → MenuItemAvailabilityEntity
├── 1:N Moderation → MenuItemModerationEntity
├── 1:N OrderItems → OrderItemEntity
├── 1:N Recipes → RecipeEntity
├── 1:N FoodPrep → FoodPrepEntity
└── N:1 HSN/SAC → HSNSACEntity
```

### Order Relationships

```
Order (orders)
├── N:1 User → UserEntity (userId)
├── N:1 Restaurant → RestaurantEntity (restaurantId)
├── N:1 RestaurantBranch → RestaurantBranchEntity (branchId)
├── 1:N OrderItems → OrderItemEntity
├── 1:1 GSTDetails → GSTDetailEntity
├── N:1 Driver → DriverEntity (driverId)
├── N:1 Address → AddressEntity (deliveryAddressId)
├── 1:1 DeliverySLA → DeliverySlaEntity (orderId)
├── 1:1 KitchenSLA → KitchenSlaEntity (orderId)
├── 1:N DriverAssignments → DriverAssignmentEntity
├── 1:N DriverFraud → DriverFraudEntity (orderId)
├── 1:N PaymentEvents → PaymentEventEntity (orderId)
├── 1:N Disputes → DisputeEntity (orderId)
├── 1:N SupportTickets → SupportTicketEntity (orderId)
├── 1:N CouponUsages → CouponUsageEntity (orderId)
└── 1:1 Refund → RefundEntity (orderId)
```

```
OrderItem (order_items)
├── N:1 Order → OrderEntity
└── N:1 MenuItem → MenuItemEntity
```

### Driver Relationships

```
Driver (drivers)
├── 1:1 User → UserEntity
├── 1:N DriverDocuments → DriverDocumentEntity
├── 1:N DriverShifts → DriverShiftEntity
├── 1:N DriverAssignments → DriverAssignmentEntity
├── 1:N DriverScores → DriverScoreEntity
├── 1:N DriverPenalties → DriverPenaltyEntity
├── 1:N DriverIncentives → DriverIncentiveEntity
└── 1:N DriverFraud → DriverFraudEntity
```

```
DriverAssignment (driver_assignments)
├── N:1 Driver → DriverEntity
├── N:1 Order → OrderEntity
└── N:1 RestaurantBranch → RestaurantBranchEntity
```

### Kitchen/Inventory Relationships

```
Batch (batches)
├── N:1 RestaurantBranch → RestaurantBranchEntity
└── 1:N FoodPrep → FoodPrepEntity
```

```
Recipe (recipes)
├── N:1 MenuItem → MenuItemEntity
└── N:1 RestaurantBranch → RestaurantBranchEntity
```

```
FoodPrep (food_prep)
├── N:1 Batch → BatchEntity
├── N:1 MenuItem → MenuItemEntity (optional)
└── N:1 RestaurantBranch → RestaurantBranchEntity
```

```
InventoryItem (inventory_items)
├── N:1 Restaurant → RestaurantEntity
└── 1:N InventoryAlerts → InventoryAlertEntity
```

```
InventoryAlert (inventory_alerts)
└── N:1 InventoryItem → InventoryItemEntity
```

### Payment Relationships

```
PaymentMethod (user_payment_methods)
├── N:1 User → UserEntity
└── has external token: externalPaymentMethodId (Stripe/Razorpay)
```

```
PaymentDispute (payment_disputes)
├── N:1 Order → OrderEntity
└── references gateway disputeId: gatewayDisputeId
```

```
PaymentWebhook (payment_webhooks)
├── unique on (gateway + webhookId)
└── triggers PaymentEvent creation
```

```
WebhookRetryQueue (webhook_retry_queue)
└── retries failed PaymentWebhook processing
```

```
LedgerEntry (ledger_entries)
└── grouped by transactionId for double-entry
```

```
PayoutReport (payout_reports)
├── N:1 Restaurant → RestaurantEntity
└── references gatewayPayoutId
```

### Wallet Relationships

```
Wallet (wallets)
├── N:1 User → UserEntity
└── 1:N WalletTransactions → WalletTransactionEntity
```

```
WalletTransaction (wallet_transactions)
├── N:1 Wallet → WalletEntity
└── records balanceAfter for audit trail
```

### Notification Relationships

```
Notification (notifications)
├── N:1 User → UserEntity
└── 1:N Analytics → NotificationAnalyticsEntity
```

```
NotificationPreference (notification_preferences)
└── N:1 User → UserEntity
```

```
NotificationAnalytics (notification_analytics)
├── N:1 Notification → NotificationEntity
└── N:1 User → UserEntity
```

### Loyalty Relationships

```
Coupon (coupons)
├── scoped to: N:1 Restaurant, N:1 Category, N:1 Item (scope-dependent)
└── 1:N Usages → CouponUsageEntity
```

```
CouponUsage (coupon_usages)
├── N:1 Coupon → CouponEntity
├── N:1 User → UserEntity
└── N:1 Order → OrderEntity
```

```
Referral (referrals)
├── N:1 User (referrer) → UserEntity
└── N:1 User (referee) → UserEntity
```

### Support & Compliance

```
SupportTicket (support_tickets)
├── N:1 User → UserEntity
└── N:1 Order → OrderEntity (optional)
```

```
Dispute (disputes)
├── N:1 User → UserEntity
└── N:1 Order → OrderEntity
```

```
DeletionRequest (deletion_requests)
└── N:1 User → UserEntity
```

```
DataExportRequest (data_export_requests)
└── N:1 User → UserEntity
```

### SLA & Alert Relationships

```
DeliverySLA (delivery_sla)
├── N:1 Order → OrderEntity
├── N:1 Driver → DriverEntity
└── N:1 RestaurantBranch → RestaurantBranchEntity
```

```
KitchenSLA (kitchen_sla)
├── N:1 Order → OrderEntity
└── N:1 RestaurantBranch → RestaurantBranchEntity
```

```
SLAAlert (sla_alerts)
└── N:1 DeliverySla → DeliverySlaEntity
```

### Surge & Geographic

```
SurgeZone (surge_zones)
└── defines polygon-based pricing multipliers
```

```
RestaurantBranch.location → PostGIS point (for geo queries)
Driver.currentLocation → PostGIS point (for geo queries)
UserAddress.location → PostGIS point (for geo queries)
```

---

## Entity Count by Domain

| Domain | Entities | Primary Tables |
|--------|----------|---------------|
| User | 7 | users, sessions, user_addresses, user_devices, device_fingerprints, otps, notification_preferences |
| Restaurant | 7 | restaurants, restaurant_branches, restaurant_gst_details, restaurant_onboarding, branch_controls, branch_holiday_schedules, commission_rules |
| Menu | 8 | menu_categories, menu_items, menu_addons, menu_variants, menu_item_availability, menu_item_moderation, hsn_sac_codes, gst_details |
| Order | 2 | orders, order_items |
| Driver | 7 | drivers, driver_documents, driver_shifts, driver_assignments, driver_scores, driver_penalties, driver_incentives, driver_fraud |
| Kitchen | 4 | recipes, food_prep, batches, kitchen_sla |
| Inventory | 4 | inventory_items, inventory_alerts, suppliers |
| Payment | 11 | user_payment_methods, payment_disputes, payment_webhooks, webhook_retry_queue, idempotency_keys, payment_fraud_flags, payment_events, payment_validation_events, payout_reports, refunds, refund_approvals, ledger_entries, wallets, wallet_transactions |
| Notification | 4 | notifications, notification_preferences, notification_analytics |
| Loyalty | 3 | coupons, coupon_usage, referrals |
| Support | 2 | support_tickets, disputes |
| Compliance | 2 | deletion_requests, data_export_requests |
| Delivery | 3 | delivery_sla, sla_alerts, surge_zones |

---

## Index Strategy

### Explicit Indexes

| Table | Column | Type |
|-------|--------|------|
| users | email | UNIQUE |
| users | phone | UNIQUE |
| restaurants | slug | UNIQUE |
| orders | orderNumber | UNIQUE |
| payment_methods | userId | INDEX |
| audit_logs | action | INDEX |
| audit_logs | performedBy | INDEX |
| restaurant_branches | location | SPATIAL |
| users | userId | (created_at DESC) - inferred |

### Recommended Indexes (from init.sql)

```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at_desc ON orders(created_at DESC);
```

---

## Junction Tables

| Table | Description |
|-------|-------------|
| coupon_usage | Links coupons to users and orders for usage tracking |
| refund_approvals | Multi-step approval workflow for refunds |
| payment_events | Event sourcing for payment lifecycle |
| notification_analytics | Delivery tracking for notifications |
