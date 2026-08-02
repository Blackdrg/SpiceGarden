# Delivery Policy

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.

---

## 1. Service Areas

Delivery is available within mapped coverage areas displayed in the app. Coverage areas may change without notice. Before placing an order, you will be notified if your location is outside the current delivery zone.

**Backend reference:** `apps/backend/src/services/delivery/delivery-pricing.controller.ts:12-43` — `/delivery/fee` API calculates delivery fee based on distance and demand.

## 2. Delivery Fees

Delivery fees are calculated based on:
- Distance from restaurant to delivery location
- Demand at the time of order (surge pricing during peak hours)
- Promotional terms (free delivery for orders above a minimum amount or for subscribers)

The exact fee is displayed at checkout before order confirmation.

**Backend reference:** `apps/backend/src/services/delivery/delivery-pricing.controller.ts:12-20` — fee calculation endpoint.

## 3. Estimated Delivery Times

Estimated delivery times are calculated based on:
- Current restaurant preparation time (menu-based estimates)
- Travel time (Google Maps API)
- Current demand and delivery partner availability

Estimates are not guaranteed. Delays may occur due to:
- Weather conditions
- Traffic congestion
- Restaurant preparation delays
- High-order volume

**Backend reference:** `apps/backend/src/services/delivery/delivery-pricing.controller.ts` — delivery estimation logic.

## 4. Delivery Partner

A delivery partner is assigned to each order. The partner picks up the order from the restaurant and delivers it to you.

### Verification
For security, you may be asked to verify the delivery partner's identity (name, photo, vehicle number) before accepting the order. For COD orders, the exact amount should be verified.

**Backend reference:** `apps/backend/src/db/entities/delivery-partner.entity.ts` (if exists) — delivery partner profile data.

## 5. Contactless Delivery

Contactless delivery is available as an option during checkout. The delivery partner will leave the order at your specified location and mark delivery as complete. A photo of the delivered order may be taken and is visible in the app.

## 6. Cash on Delivery (COD)

For COD orders, the exact amount must be paid to the delivery partner upon delivery. The delivery partner will show the order total on their device. No change is provided by the delivery partner; please have exact change ready.

**Backend reference:** `apps/backend/src/services/wallet/wallet.controller.ts:111-120` — `refundCOD()` endpoint for COD refunds.

## 7. Delivery Issues

If you experience any issues with your delivery:
- **Late delivery:** Not eligible for refund but report via the app for feedback.
- **Wrong or missing items:** Report immediately in the app or via support. Eligible for refund/replacement.
- **Damaged packaging:** Report with photos for a partial or full refund.
- **No-show delivery partner:** The order will be reassigned. If repeatedly unresolved, a full refund is issued.

**Backend reference:** `apps/backend/src/services/refund/refund.service.ts:343-351` — refund eligibility for delivered/on_the_way orders.

## 8. Delivery Standard Operating Procedure

The full Delivery SOP is maintained in `docs/legal/terms/delivery-sop.md` and covers pre-shift checks, order acceptance, pickup, in-transit protocol, delivery procedure, contactless delivery, issue handling, and end-of-shift procedures.

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:161-174` — Delivery SOP seed definition.

## 9. Prohibited Items

The following items are prohibited from delivery:
- Alcohol (where restricted by local law)
- Explosives, flammable materials, or other hazardous substances
- Illegal items
- Live animals (except service animals)

Restaurants must not list prohibited items. Violations may result in account suspension.

## 10. Contact

For delivery inquiries, contact: delivery@spicegarden.com

---

*This document is a DRAFT. For delivery inquiries, contact delivery@spicegarden.com.*
