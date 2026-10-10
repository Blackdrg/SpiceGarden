# Database Schema

**Version:** 1.0.0
**Date:** 2026-06-26
**Classification:** Verified from source code

## Overview

SpiceGarden uses three data stores:
- **PostgreSQL** (TypeORM): Primary relational store — 52 entities
- **MongoDB** (Mongoose): Document store — 1 schema (reviews)
- **Redis**: Cache, sessions, BullMQ queue backend

## PostgreSQL Schema

### Core Domain

#### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY (uuid_generate_v4) |
| fullName | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | UNIQUE, NOT NULL |
| passwordHash | VARCHAR(255) | NOT NULL |
| profileImage | VARCHAR(255) | NULLABLE |
| role | VARCHAR(50) | ENUM, DEFAULT 'customer' |
| status | VARCHAR(50) | ENUM, DEFAULT 'active' |
| emailVerified | BOOLEAN | DEFAULT false |
| phoneVerified | BOOLEAN | DEFAULT false |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | DEFAULT NOW() |
| deletedAt | TIMESTAMP | NULLABLE (soft delete) |

**Role Enum:** customer, restaurant, kitchen_staff, delivery_partner, admin, super_admin, support_staff, finance_staff
**Status Enum:** active, inactive, suspended

#### orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| userId | UUID | FK → users(id) |
| restaurantId | UUID | FK → restaurants(id) |
| branchId | UUID | NULLABLE, FK → restaurant_branches(id) |
| driverId | UUID | NULLABLE, FK → drivers(id) |
| otpCode | VARCHAR(20) | NULLABLE |
| orderNumber | VARCHAR(50) | NOT NULL |
| status | VARCHAR(50) | ENUM, DEFAULT 'placed' |
| paymentStatus | VARCHAR(50) | ENUM, DEFAULT 'pending' |
| paymentIntentId | VARCHAR(255) | NULLABLE |
| subtotal | DECIMAL(10,2) | NOT NULL |
| tax | DECIMAL(10,2) | NOT NULL |
| deliveryFee | DECIMAL(10,2) | NOT NULL |
| discount | DECIMAL(10,2) | NOT NULL |
| tip | DECIMAL(10,2) | NOT NULL |
| grandTotal | DECIMAL(10,2) | NOT NULL |
| refundedAmount | DECIMAL(10,2) | DEFAULT 0 |
| couponId | UUID | NULLABLE |
| deliveryAddressId | UUID | NOT NULL |
| deliveredAt | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | DEFAULT NOW() |

**Order Status Enum:** placed, payment_confirmed, restaurant_accepted, preparing, ready, ready_for_pickup, driver_assigned, picked_up, on_the_way, delivered, cancelled, batched
**Payment Status Enum:** pending, completed, failed, refunded

**Relations:**
- 1:N → OrderItemEntity
- 1:1 → GSTDetailEntity
- M:1 → RestaurantBranchEntity

#### order_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| orderId | UUID | FK → orders(id) |
| menuItemId | VARCHAR(255) | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| price | DECIMAL(10,2) | NOT NULL |
| quantity | INTEGER | NOT NULL |
| customizations | JSONB | NULLABLE |

#### restaurants
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(255) | NULLABLE |
| slug | VARCHAR(255) | UNIQUE, NULLABLE |
| description | TEXT | NULLABLE |
| logoUrl | VARCHAR(500) | NULLABLE |
| bannerUrl | VARCHAR(500) | NULLABLE |
| status | VARCHAR(50) | DEFAULT 'active' |
| stripeAccountId | VARCHAR(255) | NULLABLE |
| razorpayFundAccountId | VARCHAR(255) | NULLABLE |
| location | simple-json | NULLABLE { lat, lng } |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | DEFAULT NOW() |

**Relations:**
- 1:N → RestaurantBranchEntity
- 1:1 → RestaurantGSTEntity

#### restaurant_branches
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| restaurantId | UUID | FK → restaurants(id) |
| branchName | VARCHAR(255) | NOT NULL |
| address | TEXT | NOT NULL |
| lat | DECIMAL(10,8) | NULLABLE |
| lng | DECIMAL(11,8) | NULLABLE |
| openingTime | TIME | NULLABLE |
| closingTime | TIME | NULLABLE |
| isOnline | BOOLEAN | DEFAULT true |
| phone | VARCHAR(20) | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | DEFAULT NOW() |

#### restaurant_gst
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| restaurantId | UUID | FK → restaurants(id), UNIQUE |
| gstin | VARCHAR(15) | NULLABLE |
| legalName | VARCHAR(255) | NULLABLE |
| tradeName | VARCHAR(255) | NULLABLE |
| address | TEXT | NULLABLE |

#### drivers
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| userId | UUID | FK → users(id), UNIQUE |
| licenseNumber | VARCHAR(50) | NOT NULL |
| vehicleNumber | VARCHAR(20) | NOT NULL |
| vehicleType | VARCHAR(50) | NOT NULL |
| kycStatus | VARCHAR(50) | DEFAULT 'pending' |
| isOnline | BOOLEAN | DEFAULT false |
| isAvailable | BOOLEAN | DEFAULT false |
| rating | DECIMAL(3,2) | DEFAULT 0 |
| currentLocation | point | NULLABLE |
| totalDeliveries | INTEGER | DEFAULT 0 |
| totalDistance | DECIMAL(10,2) | DEFAULT 0 |
| failureCount | INTEGER | DEFAULT 0 |
| lastLocationUpdate | TIMESTAMP | NULLABLE |
| averageSpeed | DECIMAL(5,2) | NULLABLE |
| fraudScore | INTEGER | DEFAULT 0 |
| isFraudSuspicious | BOOLEAN | DEFAULT false |
| lastFraudCheck | TIMESTAMP | NULLABLE |
| fraudFlags | simple-json | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | DEFAULT NOW() |

### Financial Domain

#### wallets
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| userId | UUID | FK → users(id), UNIQUE |
| balance | DECIMAL(12,2) | DEFAULT 0 |
| currency | VARCHAR(3) | DEFAULT 'INR' |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | DEFAULT NOW() |

#### wallet_transactions
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| walletId | UUID | FK → wallets(id) |
| type | VARCHAR(50) | ENUM |
| amount | DECIMAL(12,2) | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'INR' |
| referenceId | VARCHAR(255) | NULLABLE |
| description | TEXT | NULLABLE |
| metadata | JSONB | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |

#### payment_disputes
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| orderId | UUID | FK → orders(id) |
| disputeId | VARCHAR(255) | NULLABLE |
| disputeType | VARCHAR(50) | NOT NULL |
| disputedAmount | DECIMAL(10,2) | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'INR' |
| reason | TEXT | NULLABLE |
| evidence | simple-json | NULLABLE |
| status | VARCHAR(50) | DEFAULT 'pending' |
| chargedBackAmount | DECIMAL(10,2) | DEFAULT 0 |
| chargedBackAt | TIMESTAMP | NULLABLE |
| isRefundedToCustomer | BOOLEAN | DEFAULT false |
| refundedAt | TIMESTAMP | NULLABLE |
| refundedBy | UUID | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | DEFAULT NOW() |

#### ledger_entries
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| type | VARCHAR(50) | NOT NULL |
| amount | DECIMAL(12,2) | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'INR' |
| referenceId | VARCHAR(255) | NULLABLE |
| description | TEXT | NULLABLE |
| metadata | JSONB | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |

### Loyalty Domain

#### coupons
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| code | VARCHAR(50) | UNIQUE, NOT NULL |
| type | VARCHAR(50) | NOT NULL |
| value | DECIMAL(10,2) | NOT NULL |
| minOrderValue | DECIMAL(10,2) | NULLABLE |
| maxUses | INTEGER | NULLABLE |
| usedCount | INTEGER | DEFAULT 0 |
| active | BOOLEAN | DEFAULT true |
| validFrom | TIMESTAMP | NULLABLE |
| validTo | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |

#### coupon_usage
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| couponId | UUID | FK → coupons(id) |
| userId | UUID | FK → users(id) |
| orderId | UUID | FK → orders(id) |
| usedAt | TIMESTAMP | DEFAULT NOW() |

#### referrals
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| referrerId | UUID | FK → users(id) |
| refereeId | UUID | FK → users(id) |
| code | VARCHAR(50) | NOT NULL |
| status | VARCHAR(50) | DEFAULT 'pending' |
| rewardAmount | DECIMAL(10,2) | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |

### Notification Domain

#### notifications
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| recipientId | VARCHAR(255) | NOT NULL |
| recipientType | VARCHAR(50) | NOT NULL |
| notificationType | VARCHAR(50) | NOT NULL |
| payload | JSONB | NOT NULL |
| status | VARCHAR(50) | ENUM, DEFAULT 'pending' |
| provider | VARCHAR(50) | NULLABLE |
| attempts | INTEGER | DEFAULT 0 |
| maxAttempts | INTEGER | DEFAULT 3 |
| error | TEXT | NULLABLE |
| scheduledAt | TIMESTAMP | NULLABLE |
| sentAt | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |

**Notification Status Enum:** pending, queued, sent, delivered, failed, cancelled

#### user_devices
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| userId | UUID | FK → users(id) |
| fcmToken | VARCHAR(500) | NULLABLE |
| deviceName | VARCHAR(255) | NULLABLE |
| deviceType | VARCHAR(50) | NULLABLE |
| userAgent | TEXT | NULLABLE |
| ipAddress | VARCHAR(45) | NULLABLE |
| isActive | BOOLEAN | DEFAULT true |
| lastUsedAt | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |

#### notification_preferences
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| userId | UUID | FK → users(id) |
| channel | VARCHAR(50) | NOT NULL (push, sms, email, apns) |
| enabled | BOOLEAN | DEFAULT true |
| updatedAt | TIMESTAMP | DEFAULT NOW() |

### Kitchen Domain

#### inventory_items
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| branchId | UUID | FK → restaurant_branches(id) |
| name | VARCHAR(255) | NOT NULL |
| quantity | DECIMAL(10,2) | NOT NULL |
| unit | VARCHAR(50) | NOT NULL |
| threshold | DECIMAL(10,2) | NULLABLE |
| category | VARCHAR(100) | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | DEFAULT NOW() |

#### recipes
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| branchId | UUID | FK → restaurant_branches(id) |
| menuItemId | UUID | FK → menu_items(id) |
| ingredients | JSONB | NOT NULL |
| instructions | TEXT | NULLABLE |
| prepTimeMinutes | INTEGER | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |
| updatedAt | TIMESTAMP | DEFAULT NOW() |

#### batches
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| branchId | UUID | FK → restaurant_branches(id) |
| recipeId | UUID | FK → recipes(id) |
| quantity | INTEGER | NOT NULL |
| status | VARCHAR(50) | DEFAULT 'pending' |
| preparedAt | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |

#### food_preps
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| batchId | UUID | FK → batches(id) |
| chefId | UUID | FK → users(id) |
| qualityCheck | JSONB | NULLABLE |
| preparedAt | TIMESTAMP | DEFAULT NOW() |

#### kitchen_slas
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| branchId | UUID | FK → restaurant_branches(id) |
| metricName | VARCHAR(100) | NOT NULL |
| value | DECIMAL(10,2) | NOT NULL |
| targetValue | DECIMAL(10,2) | NULLABLE |
| unit | VARCHAR(50) | NOT NULL |
| measurementPeriod | VARCHAR(50) | NULLABLE |
| recordedAt | TIMESTAMP | DEFAULT NOW() |

### Compliance Domain

#### audit_logs (MongoDB)
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | MongoDB ID |
| userId | UUID | User who performed action |
| action | String | Action performed |
| resource | String | Resource affected |
| resourceId | String | Resource ID |
| details | Object | Additional details |
| ipAddress | String | Client IP |
| userAgent | String | Client user agent |
| createdAt | Date | Timestamp |

#### deletion_requests
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| userId | UUID | FK → users(id) |
| regulation | VARCHAR(50) | NOT NULL (gdpr, dpdp, self_service) |
| reason | TEXT | NULLABLE |
| status | VARCHAR(50) | DEFAULT 'pending' |
| approvedBy | UUID | NULLABLE |
| processedAt | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |

#### device_fingerprints
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| userId | UUID | FK → users(id) |
| fingerprint | VARCHAR(255) | NOT NULL |
| lastSeen | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | DEFAULT NOW() |

### Full Entity List (65 Total)

| # | Entity | Table |
|---|--------|-------|
| 1 | UserEntity | users |
| 2 | OrderEntity | orders |
| 3 | OrderItemEntity | order_items |
| 4 | RestaurantEntity | restaurants |
| 5 | RestaurantBranchEntity | restaurant_branches |
| 6 | RestaurantGSTEntity | restaurant_gst |
| 7 | RestaurantOnboardingEntity | restaurant_onboarding |
| 8 | MenuCategoryEntity | menu_categories |
| 9 | MenuItemEntity | menu_items |
| 10 | MenuAddonEntity | menu_addons |
| 11 | MenuVariantEntity | menu_variants |
| 12 | MenuItemAvailabilityEntity | menu_item_availability |
| 13 | MenuModerationEntity | menu_moderation |
| 14 | DriverEntity | drivers |
| 15 | DriverAssignmentEntity | driver_assignments |
| 16 | DriverScoreEntity | driver_scores |
| 17 | DriverDocumentEntity | driver_documents |
| 18 | DriverShiftEntity | driver_shifts |
| 19 | DriverPenaltyEntity | driver_penalties |
| 20 | DriverIncentiveEntity | driver_incentives |
| 21 | DriverFraudEntity | driver_fraud |
| 22 | DeliverySLAEntity | delivery_slas |
| 23 | WalletEntity | wallets |
| 24 | WalletTransactionEntity | wallet_transactions |
| 25 | AddressEntity | addresses |
| 26 | PaymentMethodEntity | payment_methods |
| 27 | PaymentDisputeEntity | payment_disputes |
| 28 | CouponEntity | coupons |
| 29 | CouponUsageEntity | coupon_usage |
| 30 | ReferralEntity | referrals |
| 31 | SubscriptionEntity | subscriptions |
| 32 | NotificationEntity | notifications |
| 33 | NotificationPreferenceEntity | notification_preferences |
| 34 | UserDeviceEntity | user_devices |
| 35 | SupportTicketEntity | support_tickets |
| 36 | RefundEntity | refunds |
| 37 | RefundApprovalEntity | refund_approvals |
| 38 | SessionEntity | sessions |
| 39 | OTPEntity | otps |
| 40 | AuditLogEntity | audit_logs (MongoDB) |
| 41 | DeviceFingerprintEntity | device_fingerprints |
| 42 | RecipeEntity | recipes |
| 43 | BatchEntity | batches |
| 44 | FoodPrepEntity | food_preps |
| 45 | KitchenSLAEntity | kitchen_slas |
| 46 | InventoryItemEntity | inventory_items |
| 47 | InventoryAlertEntity | inventory_alerts |
| 48 | SupplierEntity | suppliers |
| 49 | LedgerEntryEntity | ledger_entries |
| 50 | HolidayScheduleEntity | holiday_schedules |
| 51 | SLAAlertEntity | sla_alerts |
| 52 | SurgeZoneEntity | surge_zones |
| 53 | HSNSACEntity | hsn_sac_codes |
| 54 | GSTDetailEntity | gst_details |
| 55 | IdempotencyEntity | idempotency_keys |
| 56 | PaymentValidationEventEntity | payment_validation_events |
| 57 | PaymentFraudFlagEntity | payment_fraud_flags |
| 58 | PaymentEventEntity | payment_events |
| 59 | StripeWebhookEntity | stripe_webhooks |
| 60 | WebhookRetryQueueEntity | webhook_retry_queue |
| 61 | BranchControlEntity | branch_controls |
| 62 | DeletionRequestEntity | deletion_requests |
| 63 | DataExportRequestEntity | data_export_requests |
| 64 | CommissionRuleEntity | commission_rules |
| 65 | ReviewDocument | reviews (MongoDB) |

## MongoDB Schema

### reviews (ReviewDocument)
```typescript
{
  _id: ObjectId,
  restaurantId: string,
  userId: string,
  orderId: string,
  rating: number (1-5),
  comment?: string,
  images?: string[],
  helpful?: number,
  reported?: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Redis Usage

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `spicegarden:rate-limit:*` | Rate limiting | Window-based |
| `spicegarden:session:*` | Session cache | 7 days |
| `bullmq:ORDER_LIFECYCLE:*` | Order queue jobs | Configurable |
| `bullmq:NOTIFICATION_DELIVERY:*` | Notification jobs | Configurable |
| `bullmq:PAYMENT_RETRY:*` | Payment retry jobs | Configurable |
| `bullmq:WEBHOOK_RETRY:*` | Webhook retry jobs | Configurable |

## Database Adapters

| Adapter | File | Purpose |
|---------|------|---------|
| PostgresAdapter | `apps/backend/src/db/postgres.adapter.ts` | TypeORM configuration |
| MongoAdapter | `apps/backend/src/db/mongo.adapter.ts` | Mongoose connection |
| RedisAdapter | `apps/backend/src/db/redis.adapter.ts` | IORedis connection |

## Database Module Configuration

**DbModule** (`apps/backend/src/db/db.module.ts`)
- Global module with TypeORM + Mongoose
- `synchronize: true` in development (auto-schema sync)
- Connection pooling configured via TypeORM
- Mongoose connection factory with error/connected handlers

## Indexes

Key indexes (from `infra/postgres/init.sql`):
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

Additional indexes defined via TypeORM decorators:
- `email` (unique) on users
- `phone` (unique) on users
- `slug` (unique) on restaurants
- `fcmToken` on user_devices

## Migration Strategy

- Development: TypeORM `synchronize: true` (auto-sync)
- Production: Manual migrations via TypeORM CLI
- Initial schema: `infra/postgres/init.sql`
