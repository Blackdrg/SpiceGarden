# Database Reference

**Date:** 2026-06-26
**Scope:** SpiceGarden Database Architecture
**Classification:** Evidence-based

## Executive Summary

**Primary Database:** PostgreSQL 16
**Secondary:** MongoDB 7 (for unstructured data)
**Cache/Queue:** Redis 7

## Schema Location

- `infra/postgres/migrations/InitialSchema20240101000001__up.sql` (1029 lines)
- `infra/postgres/init.sql` (bootstrap initialization)

## PostgreSQL Tables (52 tables)

### Core Tables

| Table | Purpose | References |
|-------|---------|------------|
| users | User accounts | - |
| restaurants | Restaurant entities | - |
| restaurant_branches | Branch locations | restaurants |
| orders | Order records | users, restaurants |
| order_items | Order line items | orders |
| menu_items | Menu dishes | menu_categories |
| menu_categories | Menu categories | restaurant_branches |

### User Management

| Table | Purpose | References |
|-------|---------|------------|
| user_addresses | Delivery addresses | users |
| user_devices | Device tokens | users |
| user_sessions | Refresh tokens | users |
| otp_verifications | Phone/email verification | users |
| device_fingerprints | Fraud detection | users |

### Restaurant Operations

| Table | Purpose | References |
|-------|---------|------------|
| menu_addons | Extra toppings | menu_items |
| menu_variants | Item variations | menu_items |
| menu_item_availability | Daily availability | menu_items |
| menu_moderation | Content moderation | menu_items |
| restaurant_onboarding | Onboarding steps | restaurants |
| branch_controls | Order acceptance | restaurant_branches |
| holiday_schedules | Closed days | restaurant_branches |

### Order Lifecycle

| Table | Purpose | References |
|-------|---------|------------|
| driver_assignments | Driver/order mapping | orders, drivers |
| batches | Kitchen batch preparation | restaurant_branches |
| food_prep | Prep tracking | orders, batches, menu_items |
| kitchen_sla | SLA targets | restaurant_branches |
| delivery_sla | Delivery times | restaurants |

### Payments

| Table | Purpose | References |
|-------|---------|------------|
| payment_methods | Saved payment methods | users |
| payment_events | Payment events log | orders |
| payment_validation_events | Validation logs | orders |
| payment_fraud | Fraud detection | orders, users |
| payment_webhooks | Incoming webhooks | - |
| stripe_webhooks | Stripe events | - |
| payment_disputes | Chargebacks | orders |
| disputes | Order disputes | orders |

### Refunds & Financial

| Table | Purpose | References |
|-------|---------|------------|
| refunds | Refund requests | orders |
| refund_approvals | Approval trail | refunds |
| ledger_entries | Double-entry ledger | - |
| payout_reports | Restaurant payouts | restaurants |
| commission_rules | Commission rates | restaurants |

### Loyalty & Promotions

| Table | Purpose | References |
|-------|---------|------------|
| wallets | User wallet balances | users |
| wallet_transactions | Transaction history | wallets |
| coupons | Discount codes | - |
| coupon_usages | Coupon redemptions | coupons, users |
| referrals | Referral program | users |

### Compliance & GST

| Table | Purpose | References |
|-------|---------|------------|
| gst_details | Order GST breakdown | orders |
| restaurant_gst | Restaurant GST info | restaurants |
| hsn_sac_codes | Tax codes | - |

### Driver Management

| Table | Purpose | References |
|-------|---------|------------|
| drivers | Driver profiles | users |
| driver_documents | KYC documents | drivers |
| driver_shifts | Shift tracking | drivers |
| driver_scores | Performance ratings | drivers |
| driver_fraud | Fraud alerts | drivers |
| driver_incentives | Incentive payouts | drivers |
| driver_penalties | Penalty deductions | drivers |

### Support & Operations

| Table | Purpose | References |
|-------|---------|------------|
| support_tickets | Customer tickets | users, restaurants |
| sla_alerts | SLA breach alerts | restaurant_branches |

### Infrastructure

| Table | Purpose | References |
|-------|---------|------------|
| idempotency | Duplicate prevention | - |
| notifications | Push notifications | users |
| notification_preferences | User settings | users |
| notification_analytics | Delivery tracking | notifications |
| webhook_retry_queue | Failed webhooks retry | - |

## Indexes

| Index | Column | Purpose |
|-------|--------|---------|
| idx_orders_user_id | orders(user_id) | User order lookup |
| idx_orders_status | orders(status) | Status queries |
| idx_orders_created_at | orders(created_at) | Date sorting |
| idx_orders_restaurant_id | orders(restaurant_id) | Restaurant orders |
| idx_order_items_order_id | order_items(order_id) | Order items |
| idx_menu_items_category_id | menu_items(category_id) | Category filter |
| idx_menu_items_status | menu_items(status) | Availability filter |
| idx_restaurant_branches_restaurant_id | restaurant_branches(restaurant_id) | Branch lookup |
| idx_driver_assignments_order_id | driver_assignments(order_id) | Order assignment |
| idx_driver_assignments_driver_id | driver_assignments(driver_id) | Driver orders |
| idx_wallets_user_id | wallets(user_id) | Wallet lookup |
| idx_wallet_transactions_wallet_id | wallet_transactions(wallet_id) | Transaction history |
| idx_coupons_code | coupons(code) | Coupon validation |
| idx_users_email | users(email) | Login lookup |
| idx_users_phone | users(phone) | Phone lookup |

## MongoDB Collections

**Purpose:** Used for search/indexing (via @nestjs/mongoose)

- Reviews collection
- Additional unstructured data

## Redis Usage

**Purpose:** Caching, rate limiting, queues

- Rate limiting store (RedisRateLimitStore)
- BullMQ queue backend
- Session cache

## Seeds

**File:** `infra/postgres/seed/`

| Seed File | Purpose |
|-----------|---------|
| 001_restaurants_branches_menus.sql | Restaurants, branches, sample menu |
| 002_test_users.sql | Test user accounts |

## Data Relationships

```
users
├── orders
├── user_addresses
├── user_devices
├── wallets
│   └── wallet_transactions
├── coupons → coupon_usages
└── referrals

restaurants
├── restaurant_branches
│   ├── menu_categories → menu_items
│   ├── branch_controls
│   └── holiday_schedules
├── drivers → driver_shifts
├── gst_details
└── payout_reports

orders
├── order_items
├── driver_assignments → drivers
├── payments, refunds, disputes
├── food_prep → batches
└── notifications
```

## Migration Status

- Initial schema: `InitialSchema20240101000001` - APPLIED
- Down migration available

## NOT VERIFIED

- Actual database connectivity (requires Docker runtime)
- Migration execution status
- Seed data application