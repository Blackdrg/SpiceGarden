# SPICEGARDEN PAYMENT PIPELINE QUALIFICATION
**Payment Methods Supported:** Stripe (Cards, Apple Pay, Google Pay), Razorpay (UPI, NetBanking), Cash on Delivery (COD)

## 1. Payment Integration & Webhook Reconciliation

| Provider / Method | Mode | Idempotency Handling | Signature Verification | Refund Handling | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stripe** | Direct Intent API | Header `Idempotency-Key` + Intent ID | `stripe-signature` cryptographic HMAC | Instant & Partial Refund APIs | **PASS** |
| **Razorpay** | Checkout Gateway | Order ID deduplication | `x-razorpay-signature` validation | Webhook refund reconciliation | **PASS** |
| **Cash on Delivery** | Internal OTP | Unique OTP verification per order | Server-side secure hash matching | Wallet credit compensation on return | **PASS** |

## 2. Edge Case Simulations
- **Duplicate Webhook Delivery:** Simulated 5 identical `payment_intent.succeeded` webhooks -> 1st updates DB, 2nd-5th return 200 OK without duplicating ledger transactions. **Result: PASS**.
- **Timeout during Capture:** Payment intent remains in `REQUIRES_CAPTURE` until worker reconciles. **Result: PASS**.
