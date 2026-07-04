# SpiceGarden Database Audit Report

Generated: 2026-07-04
Evidence source: Direct inspection of apps/backend/src/db/entities/, migrations, and infra/postgres/

## 1. Database Technology Stack

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| PostgreSQL | 16 (Docker) | Primary relational database | compose.dev.yaml |
| MongoDB | 7.3.0 | Document storage (reviews) | package.json mongodb@7.3.0 |
| Redis | 7 (Docker) | Queue, caching, rate limiting | ioredis@^5.10.1, bullmq@^5.78.1 |
| SQLite | 6.0.1 | Local development fallback | package.json sqlite3@6.0.1 |
| TypeORM | 0.2.45 | ORM for PostgreSQL | package.json typeorm@^0.2.45 |
| Mongoose | 9.7.0 | ODM for MongoDB | package.json mongoose@9.7.0 |

## 2. ORM Configuration

**File:** `apps/backend/src/db/data-source.ts`
- TypeORM DataSource with PostgreSQL connection
- Pool size: 20 (configurable via DB_POOL_SIZE)
- connectTimeoutMS: 5000
- keepAlive: true
- migrationsRun: true
- synchronize: false (production safety)

**File:** `apps/backend/src/db/db.module.ts`
- `@Global()` module
- Imports TypeOrmModule.forRootAsync (Postgres) + MongooseModule.forRootAsync (Mongo)
- Exports both ORM instances

**File:** `apps/backend/src/db/db-repositories.module.ts`
- `@Global()` module
- Registers 68+ TypeORM entities in TypeOrmModule.forFeature
- Registers 1 Mongoose model (ReviewDocument)

## 3. Complete Entity Inventory

### 3.1 Core Domain Entities

| Entity | Table | PK | Indexes | Relations |
|--------|-------|----|---------|-----------|
| **UserEntity** | users | uuid | email(unique), phone(unique), idx_users_role, idx_users_status, idx_users_email_verified, idx_users_created_at | — |
| **OrderEntity** | orders | uuid | user_id, restaurant_id, driver_id, status, user+status, restaurant+status, created_at | items→OrderItem 1:N, gstDetail→GSTDetail 1:1 |
| **OrderItemEntity** | order_items | uuid | order_id | order→Order N:1, menuItem→MenuItem N:1, hsnSac→HSNSAC N:1 |
| **RestaurantEntity** | restaurants | uuid | slug(unique), status, created_at | branches→Branch 1:N, gstDetail→RestaurantGST 1:1 |
| **RestaurantBranchEntity** | restaurant_branches | uuid | spatial(location) | restaurant→Restaurant N:1, categories→Category 1:N |
| **DriverEntity** | drivers | uuid | user_id(unique), kyc_status, is_online, is_available, user_id | user→User 1:1 |
| **DriverAssignmentEntity** | driver_assignments | uuid | driver, order, status, driver+status, branch, created_at | driver→Driver, order→Order, branch→Branch |
| **PaymentMethodEntity** | user_payment_methods | uuid | user_id | user→User N:1 |
| **AddressEntity** | addresses | uuid | user_id | user→User N:1 |

### 3.2 Order Details

**OrderEntity** (`apps/backend/src/db/entities/order.entity.ts`)
```typescript
@Entity('orders')
@Index('idx_orders_user_id', ['userId'])
@Index('idx_orders_restaurant_id', ['restaurantId'])
@Index('idx_orders_driver_id', ['driverId'])
@Index('idx_orders_status', ['status'])
@Index('idx_orders_user_status', ['userId', 'status'])
@Index('idx_orders_restaurant_status', ['restaurantId', 'status'])
@Index('idx_orders_created_at', ['createdAt'])
export class OrderEntity {
  id: uuid (PK)
  items: OrderItemEntity[] (1:N)
  userId: string
  restaurantId: string
  branchId: string (nullable)
  driverId: string (nullable)
  otpCode: string (nullable)
  orderNumber: string
  status: OrderStatus enum (PLACED default)
  paymentStatus: PaymentStatus enum (PENDING default)
  paymentIntentId: string (nullable)
  subtotal: decimal(10,2)
  tax: decimal(10,2)
  deliveryFee: decimal(10,2)
  discount: decimal(10,2)
  tip: decimal(10,2)
  grandTotal: decimal(10,2)
  refundedAmount: decimal(10,2) default 0
  couponId: string (nullable)
  deliveryAddressId: string
  deliveredAt: Date (nullable)
  gstDetail: GSTDetailEntity (1:1, nullable)
  createdAt: Date
  updatedAt: Date
}
```

### 3.3 User Entity

**UserEntity** (`apps/backend/src/db/entities/user.entity.ts`)
```typescript
@Entity('users')
@Index('idx_users_role', ['role'])
@Index('idx_users_status', ['status'])
@Index('idx_users_email_verified', ['emailVerified'])
@Index('idx_users_created_at', ['createdAt'])
export class UserEntity {
  id: uuid (PK)
  fullName: string
  email: string (unique)
  phone: string (unique)
  passwordHash: string
  profileImage: string (nullable)
  role: UserRole enum (CUSTOMER default)
  status: UserStatus enum (ACTIVE default)
  emailVerified: boolean (default false)
  phoneVerified: boolean (default false)
  createdAt: Date
  updatedAt: Date
  deletedAt: Date (soft delete)
}
```

### 3.4 Restaurant Entity

**RestaurantEntity** (`apps/backend/src/db/entities/restaurant.entity.ts`)
```typescript
@Entity('restaurants')
@Index('idx_restaurants_slug', ['slug'])
@Index('idx_restaurants_status', ['status'])
@Index('idx_restaurants_created_at', ['createdAt'])
export class RestaurantEntity {
  id: uuid (PK)
  name: string (nullable)
  slug: string (unique, nullable)
  description: string (nullable)
  logoUrl: string (nullable)
  bannerUrl: string (nullable)
  status: string (default 'active')
  branches: RestaurantBranchEntity[] (1:N)
  gstDetail: RestaurantGSTEntity (1:1, nullable)
  stripeAccountId: string (nullable)
  razorpayFundAccountId: string (nullable)
  location: { lat: number; lng: number } (simple-json, nullable)
  createdAt: Date
  updatedAt: Date
}
```

### 3.5 Driver Entity

**DriverEntity** (`apps/backend/src/db/entities/driver.entity.ts`)
```typescript
@Entity('drivers')
export class DriverEntity {
  id: uuid (PK)
  userId: string (unique, indexed)
  user: UserEntity (1:1)
  licenseNumber: string (nullable)
  vehicleNumber: string (nullable)
  vehicleType: string (nullable)
  kycStatus: string (default 'pending', indexed)
  isOnline: boolean (default false, indexed)
  isAvailable: boolean (default false, indexed)
  rating: decimal(3,2) default 0
  currentLocation: point (transformer: lng lat)
  totalDeliveries: number (default 0)
  totalDistance: number (default 0)
  failureCount: number (default 0)
  lastLocationUpdate: Date (nullable)
  averageSpeed: decimal(5,2) default 0
  fraudScore: decimal(5,2) default 100
  isFraudSuspicious: boolean (default false)
  lastFraudCheck: Date (nullable)
  fraudFlags: simple-json (nullable)
  createdAt: Date
  updatedAt: Date
}
```

**fraudFlags structure:**
```typescript
{
  gpsSpoofingRisk?: number;
  routeDeviationRisk?: number;
  timingAbuseRisk?: number;
  fakeDeliveryRisk?: number;
}
```

### 3.6 Wallet Entity

**WalletEntity** (`apps/backend/src/db/entities/wallet.entity.ts`)
```typescript
@Entity('wallets')
export class WalletEntity {
  id: uuid (PK)
  userId: string (indexed)
  user: UserEntity (N:1)
  balance: decimal(12,2) default 0
  currency: string (default 'INR')
  createdAt: Date
  updatedAt: Date
}
```

### 3.7 Notification Entity

**NotificationEntity** (`apps/backend/src/db/entities/notification.entity.ts`)
```typescript
@Entity('notifications')
@Index('idx_notifications_recipient_id', ['recipientId'])
@Index('idx_notifications_status', ['status'])
@Index('idx_notifications_recipient_status', ['recipientId', 'status'])
@Index('idx_notifications_next_attempt', ['nextAttemptAt'])
@Index('idx_notifications_created_at', ['createdAt'])
export class NotificationEntity {
  id: uuid (PK)
  recipientId: string
  recipientType: 'user' | 'device' | 'email' | 'phone'
  notificationType: 'push' | 'sms' | 'email' | 'apns'
  payload: simple-json
  provider: 'fcm' | 'twilio' | 'sendgrid' | 'apns'
  status: NotificationStatus enum (PENDING default)
  attemptCount: number (default 0)
  maxAttempts: number (nullable)
  lastAttemptAt: Date (nullable)
  nextAttemptAt: Date (nullable)
  completedAt: Date (nullable)
  errorInfo: simple-json (nullable)
  callbackUrl: string (nullable)
  metadata: simple-json (nullable)
  createdAt: Date
  updatedAt: Date
}
```

### 3.8 Financial Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| **WalletTransactionEntity** | wallet_transactions | walletId(fk), amount decimal(12,2), type(credit/debit), description |
| **PaymentDisputeEntity** | payment_disputes | orderId(fk), disputeId, disputeType, disputedAmount, status |
| **RefundEntity** | refunds | orderId(fk), requestedBy(fk), type, amount, status |
| **RefundApprovalEntity** | refund_approvals | order(fk), refundId, refundAmount, approvalStatus |
| **LedgerEntryEntity** | ledger_entries | transactionId, account, amount decimal(12,2), type |
| **PayoutReportEntity** | payout_reports | restaurantId(fk), grossSales, platformCommission, netPayout, status |
| **CommissionRuleEntity** | commission_rules | restaurantId(fk), type(percentage/fixed), value, validFrom, validTo |

### 3.9 Menu Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| **MenuItemEntity** | menu_items | name, basePrice decimal, isVeg, spiceLevel, status, categoryId(fk), hsnSacId(fk) |
| **MenuCategoryEntity** | menu_categories | name, sortOrder, branchId(fk) |
| **MenuAddonEntity** | menu_addons | menuItemId(fk), addonName, price decimal |
| **MenuVariantEntity** | menu_variants | menuItemId(fk), payload(json), price decimal |
| **MenuItemAvailabilityEntity** | menu_item_availability | menuItemId(fk), branchId(fk), isAvailable, autoDisabled reason |
| **MenuModerationEntity** | menu_moderation | menuItemId(fk), restaurantId(fk), action, status, aiFlags |
| **HSNSACEntity** | hsn_sac_codes | menuItemId(fk), hsnCode, description, gstRate |

### 3.10 Kitchen/Inventory Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| **InventoryItemEntity** | inventory_items | name, currentStock decimal, unit, lowStockThreshold, expiryDate, branchId(fk), supplierId(fk) |
| **InventoryAlertEntity** | inventory_alerts | inventoryItemId(fk), branchId(fk), alertType, currentLevel, thresholdLevel, isResolved |
| **RecipeEntity** | recipes | name, prepTimeMinutes, cookTimeMinutes, yieldQuantity, ingredients(json), instructions |
| **BatchEntity** | batches | name, recipeId(fk), quantityPrepared, status, branchId(fk), startedAt, completedAt |
| **FoodPrepEntity** | food_prep | batchId(fk), staffId, status, actualPrepTimeMinutes, qualityCheck(json), issues |
| **KitchenSLAEntity** | kitchen_sla | metricName, value decimal, unit, targetValue, branchId(fk), measurementPeriod |
| **SupplierEntity** | suppliers | name, contactPerson, email, phone, address, isActive |

### 3.11 Notification Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| **NotificationPreferenceEntity** | notification_preferences | userId(fk), pushOrders, pushPromotions, pushDeliveryUpdates, emailOrders, emailPromotions |
| **NotificationAnalyticsEntity** | notification_analytics | notificationId, deviceToken, event(PushTrackingEvent), receivedAt, openedAt, metadata(json) |
| **UserDeviceEntity** | user_devices | userId(fk), fcmToken, apnsToken, deviceName, deviceType, isActive |

### 3.12 Auth/Session Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| **SessionEntity** | user_sessions | userId(fk), deviceName, deviceType, ipAddress, refreshToken, expiresAt, isActive |
| **OtpEntity** | otp_verifications | userId(fk), type(EMAIL_VERIFICATION/PHONE_VERIFICATION/LOGIN_2FA/PASSWORD_RESET), code, status, expiresAt |
| **DeviceFingerprintEntity** | device_fingerprints | userId(fk), fingerprint, deviceName, isTrusted, unique(userId+fingerprint) |

### 3.13 Driver Fleet Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| **DriverShiftEntity** | driver_shifts | driverId, startTime, endTime, status, totalEarnings, totalDeliveries |
| **DriverScoreEntity** | driver_scores | driverId(fk), branchId(fk), overallScore, onTimeDeliveryRate, acceptanceRate |
| **DriverPenaltyEntity** | driver_penalties | driverId(fk), type, amount, status, issuedBy, paidAt |
| **DriverIncentiveEntity** | driver_incentives | driverId(fk), type(PEAK_TIME_BONUS/WEEKLY_TARGET/ETC), amount, status |
| **DriverFraudEntity** | driver_fraud | driverId(fk), orderId(fk), branchId(fk), fraudType, severity, evidence(json), isResolved |
| **DriverDocumentEntity** | driver_documents | driverId(fk), documentType, documentUrl, status, expiryDate |
| **DeliverySLAEntity** | delivery_sla | driverId(fk), branchId(fk), metricName, value decimal, unit, targetValue |

### 3.14 Compliance/Legal Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| **AuditLogEntity** | audit_logs | action, performedBy, entityType, entityId, metadata(json), ipAddress |
| **DeletionRequestEntity** | deletion_requests | userId(fk), status, regulation, reason, scheduledDeletionDate, completedAt |
| **DataExportRequestEntity** | data_exports | userId(fk), status, regulation, exportUrl(json), exportFormat(json) |

### 3.15 Miscellaneous Entities

| Entity | Table | Key Fields |
|--------|-------|------------|
| **CouponEntity** | coupons | code(unique), type, status, scope, discountValue, validFrom, validUntil, usageCount |
| **CouponUsageEntity** | coupon_usages | couponId, userId, status, orderId, discountApplied, orderAmount |
| **ReferralEntity** | referrals | code(unique), referrerId(fk), refereeId(fk), status, rewardType |
| **SubscriptionEntity** | subscriptions | userId(fk), planName, status, expiryDate, benefits(json) |
| **SLAAlertEntity** | sla_alerts | branchId(fk), slaType, targetValue, actualValue, isBreached, breachSeverity, relatedOrderId(fk) |
| **SurgeZoneEntity** | surge_zones | name, polygon(json), multiplier decimal, isActive, startTime, endTime |
| **HolidayScheduleEntity** | holiday_schedules | branchId(fk), holidayName, startDate, endDate, scheduleType, isRecurring |
| **SupportTicketEntity** | support_tickets | ticketNumber, subject, category, priority, status, createdById(fk), assignedToId(fk), escalationLevel, slaBreachedAt, metadata(json), satisfactionRating |
| **TicketMessageEntity** | ticket_messages | ticketId(fk), senderId(fk), message, isInternalNote, isSystemMessage, attachments(json) |
| **DisputeEntity** | disputes | orderId(fk), customerId(fk), restaurantId, driverId, type, status, creditAmount decimal, evidence(json), escalated |
| **RestaurantOnboardingEntity** | restaurant_onboarding | restaurantId(fk), currentStep, status, businessDetails(json), documentStatus(json), bankDetails(json), menuSetup(json) |
| **RestaurantGSTEntity** | restaurant_gst | restaurantId(fk), gstin(unique), legalNameOfBusiness, tradeName, address, stateCode |
| **GSTDetailEntity** | gst_details | orderId(fk), taxableValue, cgstRate/Amount, sgstRate/Amount, igstRate/Amount, totalGstAmount, placeOfSupply |
| **PaymentWebhookEntity** | payment_webhooks | gateway, webhookId(unique), eventType, processedAt |
| **StripeWebhookEntity** | stripe_webhooks | webhookId(unique), eventType, processedAt |
| **IdempotencyEntity** | idempotency_keys | key, operation(unique key+operation), userId, requestPayload(json), responsePayload(json), isCompleted |
| **PaymentValidationEventEntity** | payment_validation_events | userId, validationType, amount, validationData(json), passed |
| **PaymentFraudFlagEntity** | payment_fraud_flags | userId, flagType, amount, riskScore, evidence(json), isBlocked |
| **PaymentEventEntity** | payment_events | userId, orderId, event, payload(json), isProcessed |
| **WebhookRetryQueueEntity** | webhook_retry_queue | webhookId, gateway, eventType, payload(json), attempt, maxAttempts, status |
| **BranchControlEntity** | branch_controls | branchId, controlType, controlValue(json), isActive, expiresAt |
| **ReviewDocument** (Mongoose) | reviews (Mongo) | userId, restaurantId, orderId, rating(1-5), comment, images |

### 3.16 Mongoose Schema

**File:** `apps/backend/src/db/schemas/review.schema.ts`
- `ReviewDocument` — timestamps enabled
- Fields: userId(required), restaurantId(required), orderId(required), rating(required, min:1 max:5), comment, images(string array)

## 4. Migrations

### 4.1 Initial Schema Migration
**File:** `apps/backend/src/db/migrations/InitialSchema20240101000001.ts`
- Creates 10 core tables: users, restaurants, restaurant_branches, menu_categories, menu_items, orders, order_items, drivers, driver_assignments, wallets, wallet_transactions, notifications
- Creates 7 ENUM types: user_role, user_status, order_status, payment_status, payment_method_type, driver_kyc_status, notification_status
- Creates 15 indexes on common query patterns

### 4.2 Production Indexes Migration
**File:** `apps/backend/src/db/migrations/AddProductionIndexes202406280001.ts`
- Adds indexes for: menu_items (category_id, status, name), drivers (user_id, kyc_status, is_online, is_available), wallets (user_id), order_items (order_id), menu_categories (branch_id), refunds (order_id, user_id, status), payment_disputes (order_id, status), restaurant_gst (restaurant_id), inventory_items (low_stock_threshold), surge_zones (is_active, created_at), subscriptions (user_id, status), gst_details (order_id), referrals (referrer_id, referee_id)

## 5. Redis Usage

### 5.1 Queue Service
**File:** `apps/backend/src/infra/queue/queue.service.ts`
- BullMQ with ioredis connection
- Worker: `ORDER_LIFECYCLE` → `OrderProcessor.processOrderLifecycle`
- Options: attempts (3), exponential backoff (1000ms), removeOnComplete/onFail

### 5.2 Rate Limiting Store
**File:** `apps/backend/src/security/redis-rate-limit.store.ts`
- Implements express-rate-limit Store interface
- Redis-backed with ioredis, lazy connect, maxRetriesPerRequest:1
- Falls back to in-memory Map if Redis unavailable
- Prefix: `spicegarden:${namespace}`

### 5.3 Caching
- Session caching (5-min TTL in VaultService)
- Rate limiter state in Redis

## 6. Index Analysis

### 6.1 Core Query Patterns Covered
| Query Pattern | Index | Evidence |
|--------------|-------|----------|
| User by email | `idx_users_email_verified` (unique on email) | user.entity.ts:16 |
| User by role | `idx_users_role` | user.entity.ts:5 |
| Orders by user+status | `idx_orders_user_status` | order.entity.ts:12 |
| Orders by restaurant+status | `idx_orders_restaurant_status` | order.entity.ts:13 |
| Orders by created_at | `idx_orders_created_at` | order.entity.ts:14 |
| Notifications by recipient+status | `idx_notifications_recipient_status` | notification.entity.ts:8 |
| Drivers by online/available | `idx_drivers_is_online`, `idx_drivers_is_available` | driver.entity.ts:30,34 |

### 6.2 Missing Indexes (Potential Performance Risks)
| Entity | Missing Index | Impact |
|--------|--------------|--------|
| OrderEntity | Composite (userId, status, createdAt) for list queries | Medium |
| OrderItemEntity | (menuItemId) for menu analytics | Low |
| WalletTransactionEntity | (walletId, createdAt) for transaction history | Medium |
| NotificationEntity | (recipientId, createdAt) for notification feed | Medium |
| CouponEntity | (status, validFrom, validUntil) for coupon validation | Low |

## 7. Data Integrity

### 7.1 Constraints
- **Soft delete**: UserEntity, RestaurantEntity (deletedAt)
- **Unique constraints**: UserEntity.email, UserEntity.phone, RestaurantEntity.slug, CouponEntity.code, ReferralEntity.code, DeletionRequestEntity (user+status)
- **Foreign keys**: Enforced via TypeORM relations with cascade where appropriate
- **Enum validation**: UserRole, UserStatus, OrderStatus, PaymentStatus, NotificationStatus, DriverKycStatus

### 7.2 Transactions
- Wallet operations (credit/debit) should use transactions to prevent double-spending
- Refund processing should be transactional
- Payment webhook processing should be idempotent

## 8. Database Gaps

| Gap | Severity | Evidence |
|------|----------|----------|
| No read replicas configured | Medium | data-source.ts shows single connection |
| No connection pooling monitoring | Low | Pool size fixed at 20 |
| Missing composite indexes on OrderEntity for list queries | Medium | order.entity.ts |
| No database-level cascade rules defined | Low | TypeORM relations but no onDelete/onUpdate |
| No data archival strategy | Medium | No TTL/archival for old orders/notifications |
| SQLite fallback not tested in CI | Low | local-repository.module.ts exists but unused |
| No migration for NotificationPreferenceEntity | Low | Entity exists but no migration |