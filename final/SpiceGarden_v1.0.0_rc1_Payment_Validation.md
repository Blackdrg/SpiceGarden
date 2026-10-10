# SpiceGarden v1.0.0-rc1 — Payment Provider Validation & Integration Report

**Date**: 2026-09-29  
**Version**: `v1.0.0-rc1`  
**Classification**: **PAYMENT SOFTWARE VERIFIED / LIVE PROVIDER PRODUCTION VALIDATION PENDING**  

---

## 1. Executive Summary

The SpiceGarden payment subsystem supports multi-gateway orchestration ([Stripe](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/services/payments/stripe.gateway.ts), [Razorpay](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/services/payments/razorpay.gateway.ts), [Cash on Delivery](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/services/payments/cod.gateway.ts), and [Wallet/Ledger](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/services/wallet/wallet.service.ts)).

All gateway drivers, signature verification algorithms, idempotent webhook processing pipelines, and double-entry financial ledger logic were validated across extensive unit, integration, and sandbox test scenarios.

Because live merchant accounts and production secret keys are intentionally withheld prior to commercial deployment, the release is classified as **PAYMENT SOFTWARE VERIFIED**, with live production settlement verification pending onboarding.

---

## 2. Sandbox Integration Test Matrix

| Test Scenario | Gateway | Injected Condition | Expected System Behavior | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Successful Payment** | Stripe / Razorpay | Card authorization 200 OK | Order transitions `PENDING` → `CONFIRMED`, ledger balanced | **PASS** |
| **Declined Payment** | Stripe / Razorpay | Insufficient funds / expired card | Order marked `PAYMENT_FAILED`, cart retained, user notified | **PASS** |
| **User Cancelled Payment**| Stripe / Razorpay | User cancels checkout modal | Session closed, order cancelled cleanly | **PASS** |
| **Duplicate Webhook Event**| Stripe / Razorpay | Identical webhook payload replayed | Idempotency guard prevents duplicate crediting / status change | **PASS** |
| **Replayed Webhook** | Stripe / Razorpay | Webhook timestamp > 5 min old | Signature verified, duplicate event recognized & ignored | **PASS** |
| **Out-of-Order Webhook** | Stripe / Razorpay | `payment.succeeded` before intent created | Event queued / safely resolved | **PASS** |
| **Network Gateway Timeout**| Stripe / Razorpay | Gateway HTTP 504 timeout | Fallback retry with exponential backoff; no duplicate charge | **PASS** |
| **Idempotency Key Replay** | Internal API | Re-send `POST /payments/charge` with same key | Cached idempotency response returned; zero double-billing | **PASS** |
| **Full Refund / Reversal** | Wallet / Gateway | Trigger refund on cancelled order | Wallet credited, double-entry ledger debit recorded | **PASS** |
| **Partial Refund** | Wallet / Gateway | Partial item out of stock | Prorated refund applied, tax & fees recalculated accurately | **PASS** |
| **COD Workflow** | Cash on Delivery | Cash payment at doorstep | OTP verification at delivery, driver remittance logged | **PASS** |

---

## 3. Financial Consistency & Idempotency Architecture

1. **Idempotency Entity ([IdempotencyEntity](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/services/payments/idempotency.entity.ts))**:
   * Uses unique transaction tokens and client idempotency keys with SHA-256 payload hashing.
2. **Double-Entry Ledger ([LedgerService](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/services/finance/ledger.service.ts))**:
   * Every credit strictly pairs with a balancing debit entry (`SUM(debits) - SUM(credits) = 0`).
3. **Webhook Verification**:
   * Cryptographic HMAC SHA-256 signature verification enforced for both Stripe and Razorpay payloads before payload parsing.

---

## 4. Final Payment Verdict

```text
PAYMENT SOFTWARE VERIFIED — LIVE PROVIDER PRODUCTION VALIDATION PENDING
```
