# SpiceGarden Database Documentation

**Version:** 0.0.0  
**Last Updated:** 2026-06-27  
**Primary DB:** PostgreSQL 16 (TypeORM)  
**Document DB:** MongoDB 7 (Mongoose — reviews only)  
**Cache:** Redis 7 (BullMQ, rate limiting)

---

## Table of Contents

1. [Overview](#overview)
2. [Connection Configuration](#connection-configuration)
3. [Entity Inventory](#entity-inventory)
4. [Entity Relationship Map](#entity-relationship-map)
5. [Custom Types](#custom-types)
6. [Indexes and Constraints](#indexes-and-constraints)
7. [Migration System](#migration-system)
8. [Seeding](#seeding)
9. [Transaction Handling](#transaction-handling)
10. [Redis Usage](#redis-usage)
11. [Backup and Restore](#backup-and-restore)
12. [Data Privacy Compliance](#data-privacy-compliance)

---

## Overview

SpiceGarden uses **polyglot persistence**:
- **PostgreSQL** (TypeORM): All transactional data — 66 TypeORM entities across 50+ tables
- **MongoDB** (Mongoose): Reviews collection only
- **Redis**: Rate limiting store, BullMQ queue backend, session cache

The database layer is implemented in `apps/backend/src/db/` with adapters for each database.

---

## Connection Configuration

**File:** `apps/backend/src/db/db.module.ts`

### PostgreSQL (TypeORM)
```
host: configService.get("DB_HOST") || "localhost"
port: configService.get("DB_PORT", 5432)
username: configService.get("DB_USER") || "spicegarden"
password: configService.get("DB_PASS") || "spicegarden_dev"
database: configService.get("DB_NAME") || "spicegarden"
synchronize: true  ← DEVELOPMENT ONLY RISK
```

**File:** `apps/backend/.env`
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=spicegarden
DB_PASS=spicegarden_dev_password
DB_NAME=spicegarden
MONGO_URI=mongodb://localhost:27017/spicegarden
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### MongoDB (Mongoose)
```
URI: configService.get("MONGO_URI") || "mongodb://localhost:27017/spicegarden"
```

### Redis
Three separate ioredis consumers:
1. `RedisAdapter` — General purpose cache (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`)
2. `RedisRateLimitStore` — Rate limiting (`REDIS_RATE_LIMIT_URL` or `REDIS_URL`)
3. `QueueService` — BullMQ connections (`REDIS_URL` or `redis://localhost:6379`)

### Docker Compose
`compose.dev.yaml` maps:
- postgres:5432 → 127.0.0.1:5432
- mongo:27017 → 127.0.0.1:27017
- redis:6379 → 127.0.0.1:6379

Healthchecks: `pg_isready`, `mongosh --eval db.adminCommand('ping')`, `redis-cli ping`

---

## Entity Inventory

### User Domain (6 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 1 | `UserEntity` | `users` | id (PK), email (unique), phone (unique), passwordHash, role, status, emailVerified, phoneVerified, softDelete, location (jsonb) |
| 2 | `SessionEntity` | `user_sessions` | id (PK), userId (FK, indexed), deviceName, deviceType, ipAddress, refreshToken, expiresAt, isActive |
| 3 | `AddressEntity` | `user_addresses` | id (PK), userId (FK), label, addressLine, city, state, postalCode, location (point, spatial index), isDefault |
| 4 | `DeviceFingerprintEntity` | `device_fingerprints` | id (PK), userId (FK, indexed), fingerprint, [userId, fingerprint] unique, isTrusted |
| 5 | `UserDeviceEntity` | `user_devices` | id (PK), userId (FK, indexed), fcmToken, apnsToken, deviceName, deviceType, isActive |
| 6 | `OtpEntity` | `otp_verifications` | id (PK), userId (FK), type, code, status, expiresAt |
| 7 | `DeletionRequestEntity` | `deletion_requests` | id (PK), status, regulation, scheduledDeletionDate, userId (unique) |
| 8 | `DataExportRequestEntity` | `data_exports` | id (PK), regulation, status, exportUrl, filePath, format (jsonb), userId (unique) |

### Order Domain (4 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 9 | `OrderEntity` | `orders` | id (PK), userId (FK), restaurantId, branchId, driverId, orderNumber (unique), status (enum), paymentStatus (enum), items (jsonb), subtotal, tax, deliveryFee, discount, tip, grandTotal, otpCode, orderSource, delayMinutes, metadata (jsonb) |
| 10 | `OrderItemEntity` | `order_items` | id (PK), orderId (FK), menuItemId, quantity, unitPrice, totalPrice, variants (jsonb), addons (jsonb), cgstRate/Amount, sgstRate/Amount, igstRate/Amount, hsnsacCode, hsnSacDescription |
| 11 | `DriverAssignmentEntity` | `driver_assignments` | id (PK), orderId (FK), driverId (FK), branchId, assignmentType, status, distance, estimatedTimeMinutes, routeData (jsonb), isPriority, retryCount |
| 12 | `GSTDetailEntity` | `gst_details` | id (PK), orderId (FK, unique), taxableValue, cgstRate/Amount, sgstRate/Amount, igstRate/Amount, placeOfSupply |

### Restaurant Domain (6 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 13 | `RestaurantEntity` | `restaurants` | id (PK), name, slug (unique), description, status, location (jsonb), stripeAccountId, metadata (jsonb) |
| 14 | `RestaurantBranchEntity` | `restaurant_branches` | id (PK), restaurantId (FK), branchName, address, location (point, spatial index), openingTime, closingTime, isOnline, contactPhone |
| 15 | `RestaurantGSTEntity` | `restaurant_gst` | id (PK), restaurantId (FK, unique), gstin (unique), legalName, stateCode, isActive |
| 16 | `MenuCategoryEntity` | `menu_categories` | id (PK), branchId (FK), name, sortOrder, isActive |
| 17 | `MenuItemEntity` | `menu_items` | id (PK), categoryId (FK), branchId (FK), name, description, basePrice, isVeg, spiceLevel, status, imageUrl, preparationTimeMinutes, isAvailable, metadata (jsonb) |
| 18 | `MenuVariantEntity` | `menu_variants` | id (PK), menuItemId (FK), name, payload (json), price, metadata (jsonb), isDefault, sortOrder |
| 19 | `MenuAddonEntity` | `menu_addons` | id (PK), menuItemId (FK), addonName, price, isRequired, maxQuantity |
| 20 | `MenuItemAvailabilityEntity` | `menu_item_availability` | id (PK), menuItemId (FK), branchId (FK), isAvailable, autoDisableOutOfStock, autoDisableLowStock, predictedAvailability, manualOverride, lastChecked, metadata (jsonb) |
| 21 | `MenuModerationEntity` | `menu_moderation` | id (PK), menuItemId (FK), restaurantId (FK), action (enum), moderationStatus (enum), originalData (json), updatedData (json), aiFlags (jsonb), moderatorId, reviewedAt |
| 22 | `HSNSACEntity` | `hsn_sac_codes` | id (PK), menuItemId (FK), hsnCode, description, gstRate, effectiveFrom, effectiveTo |
| 23 | `RestaurantOnboardingEntity` | `restaurant_onboarding` | id (PK), restaurantId (FK, unique), currentStep (enum), status (enum), businessDetails (jsonb), bankDetails (jsonb), documentStatus (jsonb), menuSetup (jsonb), rejectionReason |

### Payment Domain (8 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 24 | `WalletEntity` | `wallets` | id (PK), userId (FK, unique), balance, currency, isActive |
| 25 | `WalletTransactionEntity` | `wallet_transactions` | id (PK), walletId (FK), amount, type (enum), description, referenceId, balanceAfter |
| 26 | `PaymentDisputeEntity` | `payment_disputes` | id (PK), orderId (FK), disputeId, disputeType, disputedAmount, status, evidence (jsonb), isRefundedToCustomer |
| 27 | `RefundEntity` | `refunds` | id (PK), orderId (FK), type (enum), amount, status (enum), reason, evidence (jsonb), paymentReference |
| 28 | `RefundApprovalEntity` | `refund_approvals` | id (PK), orderId (FK), refundAmount, approvalStatus, requiresManagerApproval, managerApproverId, approvalNotes, approvedAt |
| 29 | `LedgerEntryEntity` | `ledger_entries` | id (PK), transactionId, account, amount, currency, type, referenceId, description, metadata (jsonb) |
| 30 | `IdempotencyEntity` | `idempotency_keys` | id (PK), key (FK, operation unique), userId, requestPayload (jsonb), responsePayload (jsonb), isCompleted |
| 31 | `PaymentValidationEventEntity` | `payment_validation_events` | id (PK), userId (FK, indexed), validationType, amount, validationData (jsonb), passed, failureReason |
| 32 | `PaymentFraudFlagEntity` | `payment_fraud_flags` | id (PK), userId (FK, indexed), paymentIntentId, orderId, flagType, riskScore, evidence (jsonb), isBlocked |
| 33 | `PaymentEventEntity` | `payment_events` | id (PK), userId (FK, indexed), orderId (FK, indexed), event (union), payload (jsonb), isProcessed |
| 34 | `StripeWebhookEntity` | `stripe_webhooks` | id (PK), webhookId (unique), eventType, payload, processedAt |
| 35 | `PaymentWebhookEntity` | `payment_webhooks` | id (PK), gateway, webhookId (unique), eventType, processedAt |
| 36 | `WebhookRetryQueueEntity` | `webhook_retry_queue` | id (PK), webhookId (indexed), gateway, eventType, payload (jsonb), attempt, maxAttempts, status, errorMessage, nextRetryAt |

### Loyalty Domain (4 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 37 | `CouponEntity` | `coupons` | id (PK), code (unique), type (enum), status (enum), scope (enum), discountValue, minOrderValue, maxDiscountAmount?, usageLimit, usageCount, validFrom, validUntil, appliesTo (jsonb), excludedItems (jsonb), createdBy |
| 38 | `CouponUsageEntity` | `coupon_usages` | id (PK), couponId (FK), userId (FK), orderId (FK), discountApplied, status (enum), appliedAt |
| 39 | `ReferralEntity` | `referrals` | id (PK), code (unique), referrerId (FK, user), refereeId (FK, user), status (enum), rewardType, referrerReward, refereeReward, usedAt, expiresAt |
| 40 | `SubscriptionEntity` | `subscriptions` | id (PK), userId (FK, unique), planName, status, expiryDate, benefits (jsonb), autoRenew |

### Logistics Domain (10 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 41 | `DriverEntity` | `drivers` | id (PK), userId (FK), licenseNumber (unique), vehicleNumber, kycStatus (enum), isOnline, isAvailable, currentLocation (point), rating, totalDeliveries, fraudScore, fraudFlags (jsonb), metadata (jsonb) |
| 42 | `DriverScoreEntity` | `driver_scores` | id (PK), driverId (FK), branchId (FK), overallScore, onTimeDeliveryRate, acceptanceRate, cancellationRate, customerRating, periodStart, periodEnd |
| 43 | `DriverShiftEntity` | `driver_shifts` | id (PK), driverId (FK), startTime, endTime, status (enum), totalEarnings, totalDeliveries, totalDistance |
| 44 | `DriverIncentiveEntity` | `driver_incentives` | id (PK), driverId (FK), incentiveType (enum), amount, status (enum), approvedBy, paidAt, period |
| 45 | `DriverPenaltyEntity` | `driver_penalties` | id (PK), driverId (FK), penaltyType (enum), amount, orderId (FK), status (enum), waiverReason, disputeReason, resolvedAt |
| 46 | `DriverFraudEntity` | `driver_fraud` | id (PK), driverId (FK), orderId (FK), branchId (FK), fraudType, evidence (jsonb), severity, isResolved, resolvedBy |
| 47 | `DriverDocumentEntity` | `driver_documents` | id (PK), driverId (FK), documentType (enum), documentUrl, status (enum — pending/approved/rejected), verificationNotes, expiryDate |
| 48 | `DeliverySLAEntity` | `delivery_sla` | id (PK), driverId (FK), branchId (FK), metricName, value, unit, targetValue, targetUnit, measurementPeriod, recordedAt |
| 49 | `SLAAlertEntity` | `sla_alerts` | id (PK), branchId (FK), slaType, targetValue, actualValue, isBreached, relatedOrderId (FK), isNotified, alertLevel |
| 50 | `BranchControlEntity` | `branch_controls` | id (PK), branchId (FK, unique), isAcceptingOrders, autoPauseThreshold, currentQueueCount, maxConcurrentOrders, autoPauseActive |

### Kitchen Domain (8 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 51 | `RecipeEntity` | `recipes` | id (PK), branchId (FK), name, description, prepTimeMinutes, cookTimeMinutes, servingSize, ingredients (jsonb), instructions (jsonb), isActive, metadata (jsonb) |
| 52 | `BatchEntity` | `batches` | id (PK), recipeId (FK), branchId (FK), batchNumber (unique), quantityPrepared, status, expiresAt, preparedBy, delayMinutes, qualityCheckStatus |
| 53 | `FoodPrepEntity` | `food_prep` | id (PK), batchId (FK), branchId (FK), orderId (FK), itemId, staffId (FK), status, qualityCheck (jsonb), issues (jsonb), startedAt, completedAt |
| 54 | `KitchenSLAEntity` | `kitchen_sla` | id (PK), branchId (FK), metricName, value, unit, targetValue, measurementPeriod, recordedAt |
| 55 | `InventoryItemEntity` | `inventory_items` | id (PK), branchId (FK), supplierId (FK), name, currentStock, unit, lowStockThreshold, expiryDate, unitCost, wastage, wastageCost, lastRestockedAt |
| 56 | `SupplierEntity` | `suppliers` | id (PK), name, contactPerson, email, phone, address (jsonb), isActive, gstNumber |
| 57 | `InventoryAlertEntity` | `inventory_alerts` | id (PK), inventoryItemId (FK), branchId (FK), alertType, currentLevel, thresholdLevel, isResolved, resolvedAt, resolutionNotes |

### Support Domain (2 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 58 | `SupportTicketEntity` | `support_tickets` | id (PK), ticketNumber (unique), userId (FK), category (enum), priority (enum), status (enum), messages (jsonb), metadata (jsonb), assignedTo, satisfactionRating, resolvedAt, closedAt |
| 59 | `DisputeEntity` | `disputes` | id (PK), orderId (FK), customerId (FK), restaurantId (FK), driverId (FK), type (enum), status (enum), creditAmount, evidence (jsonb), escalated, escalatedAt, resolution |

### Notification Domain (3 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 60 | `NotificationEntity` | `notifications` | id (PK), recipientId, recipientType, notificationType, payload (jsonb), provider, status (enum), attemptCount, errorInfo (jsonb), scheduledAt, sentAt, deliveredAt, readAt |
| 61 | `NotificationPreferenceEntity` | `notification_preferences` | id (PK), userId (FK, unique), pushOrders, pushPromotions, pushDeliveryUpdates, emailOrders, emailPromotions, smsDeliveryUpdates, smsPromotions |
| 62 | `NotificationAnalyticsEntity` | `notification_analytics` | id (PK), notificationId (FK, indexed), deviceToken, event (enum), fcmMessageId, apnsMessageId, metadata (jsonb), recordedAt |

### Audit Domain (1 entity)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 63 | `AuditLogEntity` | `audit_logs` | id (PK), action, performedBy (FK, indexed), entityType, entityId, metadata (jsonb), ipAddress, userAgent, timestamp |

### Business Domain (3 entities)
| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 64 | `CouponEntity` | `coupons` | id (PK), code (unique), type (enum), status (enum), scope (enum), discountValue, minOrderValue, maxDiscountAmount, usageLimit, usageCount, validFrom, validUntil, appliesTo (jsonb), excludedItems (jsonb), createdBy |
| 65 | `ReferralEntity` | `referrals` | id (PK), code (unique), referrerId (FK), refereeId (FK), status (enum), rewardType, referrerReward, refereeReward, usedAt, expiresAt |
| 66 | `SubscriptionEntity` | `subscriptions` | id (PK), userId (FK, unique), planName, status, expiryDate, benefits (jsonb), autoRenew |
| 67 | `PayoutReportEntity` | `payout_reports` | id (PK), restaurantId (FK), periodStart, periodEnd, grossSales, platformCommission, gstAmount, netPayout, status (enum), orderBreakdown (jsonb), paymentBreakdown (jsonb) |
| 68 | `CommissionRuleEntity` | `commission_rules` | id (PK), restaurantId (FK), type (enum), value, minOrderValue, maxOrderValue, validFrom, validTo, status (enum), applicableCategories (jsonb), excludedItems (jsonb) |
| 69 | `SurgeZoneEntity` | `surge_zones` | id (PK), name, polygon (jsonb), multiplier, isActive, startTime, endTime, daysOfWeek, reason |
| 70 | `HolidayScheduleEntity` | `holiday_schedules` | id (PK), branchId (FK), holidayName, startDate, endDate, scheduleType, isRecurring |

### MongoDB Schema
| Schema | Collection | Description |
|--------|-----------|-------------|
| `ReviewDocument` | `reviews` | userId, restaurantId, orderId, rating (1-5), comment, images [] |

---

## Entity Relationship Map

```
User (1) ─→ (N) Address
User (1) ─→ (N) Session
User (1) ─→ (0..1) Wallet ─→ (N) WalletTransaction
User (1) ─→ (N) OtpVerification
User (1) ─→ (N) DeviceFingerprint
User (1) ─→ (N) UserDevice
User (1) ─→ (N) Subscription
User (1) ─→ (N) Referral (as referrer/referee)
User (1) ─→ (N) NotificationPreference
User (1) ─→ (N) Order

Restaurant (1) ─→ (N) RestaurantBranch
Restaurant (1) ─→ (0..1) RestaurantGST
RestaurantBranch (1) ─→ (N) MenuCategory
MenuCategory (1) ─→ (N) MenuItem
MenuItem (1) ─→ (N) MenuVariant
MenuItem (1) ─→ (N) MenuAddon
MenuItem (1) ─→ (N) HSNSACCode
MenuItem (1) ─→ (0..1) MenuItemAvailability
MenuItem (1) ─→ (N) MenuModeration
RestaurantBranch (1) ─→ (N) BranchControl
RestaurantBranch (1) ─→ (N) HolidaySchedule
RestaurantBranch (1) ─→ (N) KitchenSLA
RestaurantBranch (1) ─→ (N) DeliverySLA
RestaurantBranch (1) ─→ (N) InventoryItem
RestaurantBranch (1) ─→ (N) Recipe
RestaurantBranch (1) ─→ (N) SLAAlert

Order (1) ─→ (N) OrderItem
Order (1) ─→ (0..1) DriverAssignment
Order (1) ─→ (0..1) GSTDetail
Order (1) ─→ (0..1) PaymentDispute
Order (1) ─→ (0..1) Refund
Order (1) ─→ (0..1) RefundApproval
Review → Restaurant, User, Order

Driver (1) ─→ (N) DriverScore
Driver (1) ─→ (N) DriverShift
Driver (1) ─→ (N) DriverIncentive
Driver (1) ─→ (N) DriverPenalty
Driver (1) ─→ (N) DriverFraud
Driver (1) ─→ (N) DriverDocument
Driver (1) ─→ (N) DriverAssignment
Driver (1) ─→ (N) DeliverySLA
Supplier (1) ─→ (N) InventoryItem
Supplier (1) ─→ (N) Batch

IdempotencyKey — used by Payments (unique on key + operation)
PaymentFraudFlag → User
PaymentEvent → User, Order
WebhookRetryQueue → standalone
Notification → standalone
AuditLog → standalone
```

---

## Custom Types

**8 PostgreSQL custom enum types:**

```sql
user_role: 'customer', 'restaurant', 'kitchen_staff', 'delivery_partner', 'admin', 'super_admin', 'support_staff', 'finance_staff'
user_status: 'active', 'inactive', 'suspended'
order_status: 'pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled'
payment_status: 'pending', 'completed', 'failed', 'refunded'
driver_kyc_status: 'pending', 'approved', 'rejected'
driver_document_type: 'license', 'aadhar', 'pan', 'vehicle_rc', 'insurance'
notification_status: 'pending', 'sent', 'failed', 'retrying', 'cancelled', 'delivered', 'read'
```

---

## Indexes and Constraints

### Migrations Indexes (`infra/postgres/migrations/InitialSchema20240101000001__up.sql`)
```sql
idx_orders_user_id ON orders(user_id)
idx_orders_status ON orders(status)
idx_orders_created_at ON orders(created_at DESC)
idx_orders_restaurant_id ON orders(restaurant_id)
idx_order_items_order_id ON order_items(order_id)
idx_menu_items_category_id ON menu_items(category_id)
idx_menu_items_status ON menu_items(status)
idx_restaurant_branches_restaurant_id ON restaurant_branches(restaurant_id)
idx_driver_assignments_order_id ON driver_assignments(order_id)
idx_driver_assignments_driver_id ON driver_assignments(driver_id)
idx_wallets_user_id ON wallets(user_id)
idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id)
idx_coupons_code ON coupons(code)
idx_users_email ON users(email)
idx_users_phone ON users(phone)
```

### TypeORM Decorator Indexes
- `@Index()` on: `audit_logs.action`, `audit_logs.performedBy`, `sessions.userId`, `otp.userId`, `notification_preferences.userId`, `user_devices.userId`, `device_fingerprints.userId`, `notification_analytics.notificationId`, `payment_methods.userId`, `payment_validation_events.userId`, `payment_fraud_flags.userId`, `payment_events.userId`, `payment_events.orderId`, `webhook_retry_queue.webhookId`
- Spatial index on `restaurant_branches.location` (PostGIS point type)

### Unique Constraints
- `users.email`, `users.phone`, `restaurants.slug`, `payment_webhooks.webhookId`, `stripe_webhooks.webhookId`, `restaurant_gst.gstin`, `referrals.code`, `deletion_requests.userId`, `data_exports.userId`, `device_fingerprints [userId, fingerprint]`, `coupons.code`, `idempotency [key, operation]`

---

## Migration System

**Tool:** `scripts/db.sh` (custom shell script)

**Location:** `infra/postgres/migrations/`

| File | Purpose |
|------|---------|
| `InitialSchema20240101000001__up.sql` | Creates all 50+ tables, types, indexes (1029 lines) |
| `InitialSchema20240101000001__down.sql` | Drops all tables, types, indexes (101 lines) |

**Tracking:** `spicegarden_db_migrations` table records applied migration IDs.

**Operations supported:**
- `up` — apply all pending migrations
- `down` — rollback last applied
- `migrate` — idempotent check + apply
- `rollback` — rollback
- `seed` — run seed data
- `reset` — drop + re-create
- `verify` — check integrity
- `restore` — restore from backup

### Critical Note: `synchronize: true`
`apps/backend/src/db/db.module.ts` line 122 has `synchronize: true` enabled. This auto-syncs the schema at startup without migration version control. **Risk:** Data loss on entity changes. **Recommendation:** Disable in production and use proper typeorm migrations.

---

## Seeding

### TypeScript Seeders
| File | Purpose |
|------|---------|
| `apps/backend/scripts/seed.ts` | Creates DataSource, runs `BusinessSeederService` |
| `apps/backend/scripts/seed-local.ts` | Seeds via HTTP API + direct PostgreSQL inserts |
| `apps/backend/src/services/restaurant/business.seeder.ts` | Seeds 3 restaurants, branches, categories, menu items, drivers |

### SQL Seed Files
| File | Content |
|------|---------|
| `infra/postgres/seed/001_restaurants_branches_menus.sql` | 3 restaurants, 3 branches, 6 categories, 12 menu items |
| `infra/postgres/seed/002_test_users.sql` | 7 test users (admin, support, finance, kitchen, 2 customers, 3 restaurant managers) |

### Docker Init
`infra/postgres/init.sql` — Runs on first container start (creates 3 restaurants + Sentry DB)

---

## Transaction Handling

8 transaction blocks found across services:

| File | Purpose |
|------|---------|
| `order.service.ts:474` | Order lifecycle state transitions |
| `wallet.service.ts:124` | Wallet balance + transaction creation |
| `dispatch-engine.service.ts` (3 blocks) | Driver assignment, batch dispatch, ETA recalculation |
| `driver.controller.ts:176` | Driver status update |
| `enhanced-delivery.service.ts` (3 blocks) | Delivery confirmation, reassignment, completion |
| `data-privacy.service.ts:117` | GDPR data deletion |

Pattern:
```typescript
this.dataSource.transaction(async (manager) => {
  const entity = await manager.findOne(Entity, { where: { id } });
  await manager.save(Entity, entity);
  return entity;
});
```

---

## Redis Usage

### Three Consumers

1. **RedisAdapter** (`db/redis.adapter.ts`) — `GET/SET/DEL/EXISTS/INCR`. Graceful fallback to null if unavailable.
2. **RedisRateLimitStore** (`security/redis-rate-limit.store.ts`) — Rate limiting. Memory fallback (`Map<string, MemoryBucket>`). Prefix: `spicegarden:ratelimit`.
3. **QueueService** (`infra/queue/queue.service.ts`) — BullMQ. Single registered queue: `ORDER_LIFECYCLE`. Concurrency: 5.

### K8s Redis
- 6-replica StatefulSet in `infra/k8s/redis-cluster.yaml`
- Memory: 2Gi-4Gi, CPU: 500m-1000m
- HPA: 6-12 replicas at 60% CPU / 75% memory
- `readOnlyRootFilesystem` + security context

---

## Backup and Restore

### Scripts
| Script | Platform | Action |
|--------|----------|--------|
| `infra/scripts/backup.sh` | Linux | `pg_dump` + `mongodump` + `redis-cli SAVE` → compressed tar.gz, 7-day retention |
| `infra/scripts/backup.ps1` | Windows | PowerShell equivalent |
| `scripts/db.sh restore <archive>` | Cross-platform | Extract tar.gz, restore Pg + Mongo + Redis |

### K8s Backup CronJob
In `infra/k8s/production-hardened.yaml`:
- Schedule: Daily at 2AM
- Runs `pg_dump`, `mongodump`, `redis-cli SAVE`
- Compresses and uploads to object storage location

### Existing Backups
Logged in `backup/` directory:
- `spicegarden_backup_2026-06-13T14-03-51_postgres.sql`
- `spicegarden_backup_2026-06-15T02-02-00_postgres.sql`
- `spicegarden_backup_2026-06-15T02-10-02_postgres.sql`

---

## Data Privacy Compliance

| Feature | Entity | Mechanism |
|---------|--------|-----------|
| Right to Erasure | `DeletionRequestEntity` | GDPR-compliant user data deletion with scheduled deletion date |
| Data Portability | `DataExportRequestEntity` | Export user data in multiple formats |
| Audit Logging | `AuditLogEntity` | All actions logged with performedBy, entityType, metadata |
| Encryption | `EncryptionService` | AES-256 for sensitive fields |
| Session Tracking | `SessionEntity` | Device + IP tracking for auth events |

Data deletion cascades through:
- `AddressEntity`, `SessionEntity`, `WalletEntity` + `WalletTransactionEntity`, `NotificationPreferenceEntity`, `OtpEntity`, `DeviceFingerprintEntity`, `SubscriptionEntity`, `SupportTicketEntity`
