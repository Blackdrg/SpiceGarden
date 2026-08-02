# Refund Policy

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.

---

## 1. Overview

This Refund Policy governs refunds for orders placed through the SpiceGarden platform. Refunds are processed according to the procedures and conditions described below. This policy is incorporated into our Terms of Service by reference.

## 2. Refund Eligibility

Refunds are available for the following scenarios:

1. **Cancellation before restaurant acceptance** — Full refund, including taxes and fees.
2. **Non-delivery** — Full refund if the order was not delivered.
3. **Wrong order or missing items** — Full or partial refund depending on the extent of the missing/incorrect items.
4. **Food quality or safety concerns** — Full refund upon verification.
5. **Restaurant cancellation** — Full refund if the restaurant cancels the order.
6. **Delivery partner cancellation** — Full refund if the delivery partner cancels after pickup.

### Ineligible for Refund

- Orders that have been delivered and consumed without reported issues within 15 minutes of delivery.
- Refunds requested due to late delivery where the order was delivered within 30 minutes of the estimated time.
- Orders placed using promotional credits or wallet balance (these are non-refundable).

**Backend reference:** `apps/backend/src/services/refund/refund.service.ts:343-351` — `isRefundEligible()` checks order status against `['delivered', 'on_the_way', 'ready', 'preparing']`.

## 3. Refund Request Process

### Step 1: Submit Request
Customers may submit a refund request through:
- The app: Order details → "Request Refund"
- Support: `support@spicegarden.com` or via the support chat
- Support API: `POST /support/refunds` (`apps/backend/src/services/support/support.controller.ts:44-51`)

### Step 2: Review and Verification
Our support team reviews the request and may request supporting evidence (photos, receipts, etc.). Verification typically takes 1–3 business days.

**Backend reference:** `apps/backend/src/services/refund/refund.service.ts:46-51` — `createRefundRequest()` validates order existence and refund eligibility. Also checks for existing pending requests (`refund.service.ts:76-81`).

### Step 3: Approval Decision
- **Amount under threshold (default: ₹1000):** Processed by support agent
- **Amount at or above threshold:** Requires manager approval

**Backend reference:** `apps/backend/src/services/refund/refund.service.ts:84-85` — `REFUND_MANAGER_APPROVAL_THRESHOLD` config.

### Step 4: Processing
Approved refunds are processed to the original payment method within 5–10 business days. In some cases, refunds may be issued as wallet credit.

**Backend reference:** `apps/backend/src/services/refund/refund.service.ts:200-281` — `processRefund()` calls `paymentService.refundPayment()` to issue refunds via the original payment gateway.

## 4. Refund Timeline

| Stage | Timeline |
|---|---|
| Request submission | Immediate |
| Initial review | 1–3 business days |
| Approval (under threshold) | 1 business day |
| Approval (manager, over threshold) | 2–5 business days |
| Processing to original payment method | 5–10 business days after approval |
| Wallet credit issuance | Within 24 hours of approval |

**Backend reference:** `apps/backend/src/services/refund/refund.service.ts:278-281` — updates `order.paymentStatus` to `REFUNDED` after processing.

## 5. Manager Approval Threshold

Refunds equal to or exceeding ₹1000 (configurable via `REFUND_MANAGER_APPROVAL_THRESHOLD`) require manager approval. The approver must be authenticated and authorized.

**Backend references:**
- Approval: `apps/backend/src/services/refund/refund.service.ts:112-154` — `approveRefundRequest()`
- Rejection: `apps/backend/src/services/refund/refund.service.ts:159-195` — `rejectRefundRequest()`
- Direct payment refund: `apps/backend/src/services/payments/payments.controller.ts:118-157` — `refund()` for admin-initiated refunds

## 6. Partial Refunds

If only part of an order is affected (e.g., missing one item from a multi-item order), a proportionate partial refund will be issued. The refund amount is calculated based on the affected items' value.

## 7. Wallet Credit Refunds

At the customer's choice, refunds may be issued as wallet credit, which is available for immediate use. Wallet credits do not expire and can be used for any future order.

**Backend reference:** `apps/backend/src/services/wallet/wallet.service.ts` — wallet management service.

## 8. Fraudulent Refund Requests

Submitting false, fraudulent, or misleading refund requests may result in account suspension or termination. We reserve the right to investigate refund requests, including reviewing order history, delivery photos, and customer behavior patterns.

**Backend reference:** `apps/backend/src/services/refund/refund.service.ts:66-68` — `isRefundEligible()` check prevents refund for orders that have already been refunded.

## 9. Chargeback Disputes

If you initiate a chargeback with your bank or card issuer, we will investigate the dispute and provide evidence (order details, delivery confirmation, etc.). If the chargeback is resolved in our favor, no refund will be issued. If resolved against us, the refund will be processed according to the payment processor's decision.

**Backend reference:** `apps/backend/src/services/payments/chargeback/chargeback.service.ts:261` — `initiateRefundForWonDispute()` processes refunds for won chargeback disputes.

## 10. Contact

For refund inquiries, contact: refund@spicegarden.com or use the in-app support chat.

---

*This document is a DRAFT. For refund inquiries, contact refund@spicegarden.com.*
