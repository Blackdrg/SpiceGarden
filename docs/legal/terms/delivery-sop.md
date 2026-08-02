# Delivery Standard Operating Procedure (SOP)

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Applies to:** All delivery partners and operations personnel

---

## 1. Pre-Shift Checks

Delivery partners must verify the following before starting a shift:
- Vehicle condition (fuel, brakes, lights, tires)
- Phone battery and charging cable
- App version is up to date
- Active delivery assignments are visible in the app
- GPS is enabled and accurate

**Backend reference:** `apps/backend/src/db/entities/delivery-partner.entity.ts` — delivery partner profile and shift management.

## 2. Order Acceptance

Delivery partners must accept orders within the assigned radius. Before accepting:
- Verify restaurant name matches the order
- Confirm order items against the app
- Verify pickup code (4-digit code shown in app)

Do not accept orders outside operating hours or for prohibited items.

## 3. Pickup Procedure

1. Arrive at the restaurant within the estimated pickup window.
2. Provide the pickup code to the restaurant staff.
3. Verify order completeness against the app (item count, special instructions).
4. Mark order as picked up in the app with a timestamp and photo if required.

If items are missing or incorrect, contact support immediately through the app (do not mark as picked up).

## 4. In-Transit Protocol

1. Follow the optimized route provided by the app.
2. Maintain safe driving standards at all times.
3. Do not deviate from the route without app direction.
4. Keep the customer informed of significant delays via the in-app messaging system.
5. Keep the order secure and temperature-appropriate during transit.

**Backend reference:** `apps/backend/src/services/delivery/delivery-pricing.controller.ts:12-20` — delivery route optimization API.

## 5. Delivery Procedure

1. Park safely near the delivery location.
2. Verify the drop-off location matches the customer's specified address.
3. For verified delivery: ask the customer to confirm their name and check the order.
4. For contactless delivery: leave the order at the specified location, take a photo, and upload it through the app.
5. Collect exact cash for COD orders. Do not provide change.
6. Mark delivery as complete in the app.

### Identity Verification
For security, the customer may verify the delivery partner's ID (name, photo, vehicle number) shown in the app.

## 6. Contactless Delivery

Contactless delivery is selected by the customer during checkout. When this option is chosen:
1. Leave the order at the specified location (doorstep, lobby, etc.).
2. Do not ring the doorbell or knock.
3. Take a clear photo of the delivered order.
4. Upload the photo through the app.
5. Mark delivery as complete.

## 7. Issue Handling

If an order is damaged, spilled, or incorrect:
1. Do NOT deliver the compromised order.
2. Contact support immediately through the app.
3. Contact the restaurant through the app messaging system.
4. Take photos of the issue.
5. Do not attempt to fix the order yourself.
6. Follow instructions from support (typically: return to restaurant for remake or cancel order).

**Backend reference:** `apps/backend/src/services/refund/refund.service.ts:343-351` — refund eligibility. Issues reported before delivery are eligible for full refunds.

## 8. End of Shift

At the end of each shift:
1. Return any un-delivered items per the Cancellation Policy.
2. Submit daily cash reconciliation if handling COD orders.
3. Report vehicle or app issues through the partner dashboard.
4. Log out of the app.

**Backend reference:** `apps/backend/src/services/wallet/wallet.service.ts:202-203` — COD reconciliation (note: currently simulated).

## 9. SOS / Emergency Protocol

If you encounter an emergency during a delivery:
1. Press the SOS button in the app.
2. The system will alert the operations center, nearest delivery partners within 5 km, and emergency contacts on file.
3. If police or ambulance is needed, the operations center contacts emergency services (dial 100/108 in India).

## 10. Contact

Operations support: ops@spicegarden.com | In-app: Partner Dashboard → Support

---

*This document is a DRAFT. For questions, contact ops@spicegarden.com.*
