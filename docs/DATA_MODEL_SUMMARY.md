# Data Model Summary

**Date:** 2026-06-23

---

## Entities (65 total)

**Source:** `apps/backend/src/db/entities/*.ts`

### Core Entities (tested)

| Entity | Coverage | Lines | Status |
| ------ | -------: | ----: | ------ |
| user.entity.ts | 100% | 16 lines | ✅ Fully tested |
| session.entity.ts | 93% | 15 lines | ✅ Well tested |
| restaurant.entity.ts | 90% | 20 lines | ✅ Well tested |
| order.entity.ts | 91% | 34 lines | ✅ Well tested |
| order-item.entity.ts | 90% | 31 lines | ✅ Well tested |
| payment-webhook.entity.ts | 100% | 8 lines | ✅ Fully tested |
| wallet.entity.ts | 91% | 11 lines | ✅ Well tested |
| wallet-transaction.entity.ts | 92% | 12 lines | ✅ Well tested |
| refund.entity.ts | 94% | 35 lines | ✅ Well tested |
| gst-detail.entity.ts | 90% | 20 lines | ✅ Well tested |
| hsn-sac.entity.ts | 87% | 15 lines | ✅ Well tested |
| coupon.entity.ts | 100% | 40 lines | ✅ Fully tested |
| referral.entity.ts | 94% | 31 lines | ✅ Well tested |
| notification.entity.ts | 100% | 20 lines | ✅ Fully tested |
| audit-log.entity.ts | 100% | 10 lines | ✅ Fully tested |

### Partial Coverage Entities

| Entity | Coverage | Lines | Status |
| ------ | -------: | ----: | ------ |
| restaurant-branch.entity.ts | 63% | 24 lines | ⚠️ Partial |
| driver.entity.ts | 89% | 28 lines | ⚠️ Well tested |
| driver-score.entity.ts | 90% | 20 lines | ⚠️ Well tested |
| driver-fraud.entity.ts | 86% | 21 lines | ⚠️ Well tested |
| driver-assignment.entity.ts | 88% | 24 lines | ⚠️ Well tested |

---

## Entity Count by Domain

| Domain | Entity Count |
| ------ | -----------: |
| User/Auth | 5 (user, session, otp, device, preferences) |
| Restaurant | 4 (restaurant, branch, menu-item, category) |
| Order | 3 (order, order-item, coupon-usage) |
| Payment | 5 (payment, webhook, fraud, dispute, event) |
| Delivery | 4 (driver, assignment, score, fraud) |
| Wallet | 2 (wallet, transaction) |
| Notification | 2 (notification, preference) |
| Refund | 2 (refund, approval) |
| GST/Tax | 2 (gst-detail, hsn-sac) |
| Audit/Compliance | 2 (audit-log, compliance-log, deletion-request, data-export) |
| Loyalty | 1 (referral) |
| Subscription | 1 (subscription) |

---

## Database Configuration

**Source:** `apps/backend/src/app.module.ts`

| Store | Adapter | Status |
| ----- | ------- | ------ |
| PostgreSQL | TypeORM 1.0.0 | Primary (relational) |
| MongoDB | Mongoose 9.7.0 | Secondary (documents) |
| Redis | ioredis 5.10.1 | Cache/queues/rate-limiting |

**Evidence:** `apps/backend/src/db/database-failover.service.ts` — failover logic implemented with 77% coverage.