# Driver Agreement

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Governing Law:** India  
**Backend reference:** `apps/backend/src/legal/entities/legal.enums.ts:12` (`LegalDocumentType.DRIVER_AGREEMENT`), `apps/backend/src/legal/agreement.service.ts:12-240` — agreement lifecycle.

---

## 1. Independent Contractor

Delivery partners ("Drivers") are independent contractors, not employees, agents, or partners of SpiceGarden. Nothing in this agreement creates an employment relationship. Drivers are responsible for:
- Their own work schedule and availability
- Vehicle maintenance and fuel costs
- Applicable taxes (income tax, GST on services, etc.)
- Insurance coverage as specified below

## 2. Insurance

Drivers must maintain valid:
- Vehicle insurance (comprehensive or third-party as required by law)
- Third-party liability insurance
- Own-damage coverage (recommended)

Proof of insurance must be provided during onboarding and updated if it expires or changes.

**Backend reference:** `apps/backend/src/db/entities/delivery-partner.entity.ts` — driver profile includes insurance verification fields (if exists).

## 3. Code of Conduct

Drivers must adhere to the following standards:
- Safe and lawful driving at all times
- Professional and courteous interaction with customers, restaurants, and support
- Proper vehicle maintenance (clean, safe, roadworthy)
- Use of the app for all order management and communication
- No discrimination or harassment of any kind

## 4. Vehicle Requirements

Vehicles must be:
- Roadworthy and in safe operating condition
- Properly registered with valid registration certificate
- Possess a valid driving license matching the vehicle class
- Equipped with a smartphone running the latest version of the app
- Have a secure phone mount

## 5. Background Verification

Background checks are conducted before activation, including:
- Identity verification (Aadhaar/PAN)
- Driving license verification
- Vehicle registration verification
- Criminal background check (where permitted by law)
- Driving record check

**Backend reference:** `apps/backend/src/services/driver/driver-onboarding.service.ts` — driver onboarding workflow with verification steps.

## 6. GPS and Location Tracking

Drivers consent to location tracking during shifts for:
- Dispatch optimization (finding nearest available driver)
- Route guidance
- Safety and security (SOS protocol)
- Payout verification (proving delivery location and time)

Location data is retained for 30 days after the end of a shift, then deleted.

**Backend reference:**
- Driver GPS entity: `apps/backend/src/db/entities/driver-gps.entity.ts:16-35` — GPS tracking data including lat/lng, accuracy, timestamp, orderId.
- Retention policy: `apps/backend/src/legal/retention.service.ts:25` — `driver_gps: 30 days`.
- Delivery partner deep links: `apps/delivery-partner/app.config.js:25-39` — deep link configuration.

## 7. Payment Terms

Drivers earn commission-based income per delivery:
- Base fare per delivery
- Distance-based incentive for longer routes
- Surge pricing during peak hours
- Performance bonuses for high ratings and low cancellation rates

Earnings are calculated daily and settled weekly to the registered bank account.

**Backend references:**
- Driver incentives: `apps/backend/src/db/entities/driver-incentive.entity.ts:52` — `payoutReference`, `paidAt`.
- Payout reports: `apps/backend/src/db/entities/payout-report.entity.ts:54` — payout tracking.
- Driver earnings: `apps/backend/src/db/entities/driver.entity.ts` — driver profile and earnings.

## 8. Cancellation and Rating

Driver cancellations are tracked and impact:
- Eligibility for incentives
- Driver rating and ranking
- Account standing

Excessive cancellations may result in temporary suspension or deactivation.

**Backend reference:** `apps/backend/src/compliance/compliance.controller.ts:174` — compliance checks for driver restrictions.

## 9. SOS / Emergency Protocol

Drivers have access to an SOS button in the app. When pressed:
1. Operations center is alerted immediately
2. Nearest delivery partners are notified
3. Emergency contacts are contacted
4. If needed, emergency services (dial 100/108) are contacted

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:187` — SOS protocol definition.

## 10. Termination

This agreement may be terminated by either party with 30 days' notice. SpiceGarden may terminate immediately for:
- Safety violations
- Fraud or abuse
- Repeated no-shows or cancellations
- Customer complaints about conduct

Upon termination, any outstanding dues will be settled within the next settlement cycle.

---

*This document is a DRAFT. For questions, contact driver@spicegarden.com.*
