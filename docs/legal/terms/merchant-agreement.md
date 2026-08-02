# Merchant Agreement

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Governing Law:** India  
**Backend reference:** `apps/backend/src/legal/entities/legal.enums.ts:11` (`LegalDocumentType.MERCHANT_AGREEMENT`), `apps/backend/src/legal/agreement.service.ts:12-240` — agreement lifecycle management.

---

## 1. Appointment

SpiceGarden appoints the restaurant ("Merchant") as a merchant partner to list and sell menu items through the SpiceGarden platform. This appointment is non-exclusive and may be revoked at any time.

## 2. Commission Policy

A platform commission is deducted per the agreed rate card. Rates are visible in the merchant dashboard at `restaurant-dashboard/src/pages/settings.tsx`. The commission rate varies by:
- Restaurant category (Quick Service Restaurant, Fine Dining, etc.)
- Order volume tier
- Subscription plan

**Backend references:**
- Commission rules: `apps/backend/src/db/entities/commission-rule.entity.ts:15-51` — configurable commission rates by category and order value.
- Subscription plans: `apps/backend/src/db/entities/subscription-plan.entity.ts:65` — `commissionRate` field.

## 3. Settlement Policy

Net payable is settled on a T+1 cycle (next business day) to the registered bank account after deductions (commission, taxes, fees). Settlement reports are available in the merchant dashboard.

**Backend references:**
- Settlement service: `apps/backend/src/services/finance/settlement.service.ts:38-42` — `createSettlementReport()` calculates `netAmount = totalAmount - gatewayFee - taxAmount`.
- Settlement entity: `apps/backend/src/db/entities/settlement-report.entity.ts:19-74` — settlement report fields including `settlementDate`, `netAmount`, `gatewayFee`, `taxAmount`.
- Payout report: `apps/backend/src/db/entities/payout-report.entity.ts:12-57` — `netPayout`, `payoutReference`, `payoutDate`.

## 4. Tax (GST)

Merchants are responsible for applicable GST. SpiceGarden facilitates tax computation and invoicing where applicable. GST details must be provided during onboarding and updated if they change.

**Backend references:**
- Restaurant onboarding: `apps/backend/src/db/entities/restaurant.entity.ts` — includes `gstNumber` field.
- Restaurant onboarding state: `apps/backend/src/db/entities/restaurant-onboarding.entity.ts:12` — `PAYOUT_SETUP` onboarding step.
- GST reports: `restaurant-dashboard/src/pages/gst-reports.tsx` — merchant-facing GST report UI.

## 5. Food Safety

Merchants must comply with FSSAI licensing and food safety standards:
- Maintain valid FSSAI license
- Follow HACCP (Hazard Analysis Critical Control Points) guidelines
- Maintain food storage temperatures as specified
- Ensure all kitchen staff have food safety training

**Backend reference:** `apps/backend/src/services/restaurant/restaurant-onboarding.service.ts` — verifies FSSAI documentation during onboarding.

## 6. Restaurant SLA

Restaurants must meet the following service level agreements:

| Metric | SLA |
|---|---|
| Order acceptance | Within 3 minutes of assignment |
| Order preparation | Within the time shown in the app |
| Order accuracy | 98% of orders must match the submitted items |
| Cancellation rate | Below 5% of total orders |

Breaches of SLA affect restaurant ranking in search results and may result in penalties.

**Backend reference:** `apps/backend/src/db/entities/sla-alert.entity.ts:14` — SLA alert types: `prep_time`, `order_wait_time`, `delivery_time`, `food_quality`, `prep_delay`.

## 7. KYC Policy

Valid KYC documents (FSSAI license, GST registration, bank account details, business address proof) are required before onboarding and periodically renewed (minimum every 12 months).

**Backend reference:** `apps/backend/src/db/entities/restaurant.entity.ts` — includes KYC fields (`gstNumber`, `fssaiLicense`, `bankAccount`, etc.).

## 8. Menu Management

Merchants are responsible for maintaining accurate menu information including:
- Item names and descriptions
- Prices
- Availability (out-of-stock items must be marked as unavailable)
- Dietary tags and allergen information

## 9. Data Handling

Merchants may access customer data (names, delivery addresses, contact information) only as necessary to fulfill orders. Customer data must not be used for marketing or shared with third parties without explicit consent.

**Backend reference:** `apps/backend/src/services/restaurant/restaurant-orders.controller.ts` — restaurant order data access API.

## 10. Termination

Either party may terminate this agreement with 30 days' written notice. Upon termination:
- Outstanding payments will be settled per the Settlement Policy
- Menu will be removed from the platform
- Customer data will be deleted per the Data Retention Policy
- Historical order data will be retained per tax law requirements

---

*This document is a DRAFT. For questions, contact merchant@spicegarden.com.*
