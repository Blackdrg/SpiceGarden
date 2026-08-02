# Cancellation Policy

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.

---

## 1. Overview

This Cancellation Policy describes the rules for cancelling orders placed through the SpiceGarden platform by customers, restaurants, and delivery partners. Cancellations are governed by order status, timing, and party role.

## 2. Customer Cancellation

### Before Restaurant Acceptance
Customers may cancel an order at any time before the restaurant accepts it. A full refund, including taxes and delivery fees, will be issued.

### After Restaurant Acceptance
Once the restaurant accepts your order, cancellation is subject to the restaurant's cancellation policy:

- **During preparation (order status = `preparing`):** Cancellation may be possible with a partial or full fee depending on preparation progress. If cancelled, a full refund minus a ₹2 platform fee may apply.
- **After pickup (order status = `picked_up` or later):** Cancellation is not permitted. Customers should refuse delivery if the order is incorrect or unsatisfactory. In such cases, a refund will be issued via the Refund Policy.

**Backend reference:** `apps/backend/src/services/order/order.service.ts:16-93` — `placeOrder()` and order status transitions (`pending` → `confirmed` → `preparing` → `picked_up` → `on_the_way` → `delivered`).

## 3. Restaurant Cancellation

Restaurants may cancel orders for operational reasons (e.g., item unavailable, kitchen equipment failure). The cancellation window and consequences are as follows:

- **Before customer arrival at pickup window:** Cancellation is permitted without penalty (first 2 occurrences per month).
- **3rd+ cancellation in a month:** A penalty of 2× the order value is deducted from the next settlement.
- **After pickup:** Cancellation after the restaurant has marked the order as picked up is treated as a failed delivery, and the restaurant may be liable for a remake and redelivery.

**Backend references:**
- Order status enum: `apps/backend/src/shared/domain/order.interface.ts` — `OrderStatus` enum
- Commission rules: `apps/backend/src/db/entities/commission-rule.entity.ts:15-51` — commission configuration

## 4. Delivery Partner Cancellation

Delivery partners may cancel accepted orders under the following conditions:

- **Safety concerns:** Route through a dangerous area or unsafe pickup/delivery location.
- **Vehicle issues:** Vehicle breakdown or mechanical failure.
- **Emergency:** Personal emergency requiring discontinuation of shift.

### Consequences of Cancellation
- **1st cancellation in a 30-day period:** No penalty
- **2nd cancellation in a 30-day period:** Temporary suspension of order acceptance for 6 hours
- **3rd+ cancellation in a 30-day period:** Review by operations team; may result in deactivation after investigation

**Backend reference:** `apps/backend/src/compliance/compliance.controller.ts:174` — compliance checks related to driver cancellations and restrictions.

## 5. Automated Cancellations

The system may automatically cancel orders under the following circumstances:

- **Restaurant non-response:** If a restaurant does not accept an order within 3 minutes, the order is automatically cancelled and the customer is notified.
- **Delivery partner non-response:** If a delivery partner does not accept or move toward pickup within 5 minutes, the order may be reassigned or cancelled.
- **Payment failure:** If payment authorization fails, the order is automatically cancelled.

**Backend reference:** `apps/backend/src/services/order/order.service.ts:40-55` — order placement validation including payment verification.

## 6. Cancellation Refunds

- Cancellations before restaurant acceptance: Full refund (including delivery fee)
- Cancellations after restaurant acceptance but before delivery: Partial refund minus platform fee (₹2)
- Cancellations after delivery has started: No refund; customer should use the Refund Policy for quality/safety issues

**Backend reference:** `apps/backend/src/services/refund/refund.service.ts:343-351` — `isRefundEligible()` defines eligible order statuses (`delivered`, `on_the_way`, `ready`, `preparing`).

## 7. Subscription Cancellations

Customers on auto-renewing subscription plans may cancel at any time. Cancellations take effect at the end of the current billing period. No refunds are issued for unused portions of a subscription period.

**Backend reference:** `apps/backend/src/db/entities/subscription-plan.entity.ts:1-82` — subscription plan entity.

## 8. Notification

When an order is cancelled, all parties (customer, restaurant, delivery partner) are notified via:
- In-app push notification
- SMS (if applicable)

**Backend reference:** `apps/backend/src/services/notifications/notification.service.ts` — notification dispatch service.

## 9. Contact

For cancellation inquiries, contact: cancel@spicegarden.com

---

*This document is a DRAFT. For cancellation inquiries, contact cancel@spicegarden.com.*
