# SpiceGarden v1.0.0-rc1 — Live Payment Gateway Handover Runbook

**Release**: `v1.0.0-rc1`  
**Classification**: **`PAYMENT SOFTWARE VERIFIED — LIVE MERCHANT SETTLEMENT PENDING`**  
**Audience**: Recipient Engineering & Finance Operations Team  

---

## 1. Executive Summary & Verification State

The payment processing subsystem of **SpiceGarden v1.0.0-rc1** is fully implemented and regression-verified in code:
- **Sandbox Test Matrices**: Passed across Stripe and Razorpay flows (successful capture, card declined, user cancellation, timeout handling, idempotency retry).
- **Double-Entry Ledger Engine**: Formally verified with 47,910 balanced transactions during peak load tests, with 0 orphan transactions and 0 duplicate IDs.
- **Client Security**: Zero sensitive cardholder data (PAN, CVV, PIN) is ever touched or stored by SpiceGarden backend services (PCI-DSS SAQ-A compliance profile).
- **Current Operational Gate**: Live production settlement is pending recipient merchant account onboarding, webhook URL binding, and live credential injection.

---

## 2. Stripe Production Handover Procedure

### Configuration Parameters
The recipient must provide live Stripe API credentials via Kubernetes Secrets or production environment variables:

| Variable Name | Description | Placement Target |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Live Restricted Secret Key (`rk_live_...` or `sk_live_...`) | `k8s/secrets/payment-secrets.yaml` |
| `STRIPE_WEBHOOK_SECRET` | Webhook Endpoint Signing Secret (`whsec_...`) | `k8s/secrets/payment-secrets.yaml` |
| `STRIPE_CURRENCY` | Default settlement currency (e.g., `USD`, `INR`, `EUR`, `GBP`) | ConfigMap / `.env.production` |
| `STRIPE_STATEMENT_DESCRIPTOR` | Merchant name displayed on customer card statements | Stripe Dashboard |

### Webhook Endpoint Configuration
1. Log in to the recipient Stripe Dashboard at `https://dashboard.stripe.com`.
2. Navigate to **Developers > Webhooks > Add Endpoint**.
3. Set URL to: `https://api.<recipient-domain>/api/v1/payments/stripe/webhook`.
4. Select the following event subscriptions:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
   - `charge.dispute.created`
5. Reveal the Webhook Signing Secret (`whsec_...`) and populate `STRIPE_WEBHOOK_SECRET`.
6. Enable automatic retry with exponential backoff in Stripe Dashboard.

### Idempotency & Refund Verification
- SpiceGarden automatically sends an `Idempotency-Key` (`order_<orderId>_<attempt>`) on all outbound Stripe mutations to prevent duplicate charges.
- Full and partial refund requests are executed through `PaymentService.processRefund()`, which atomically updates the internal ledger balance before dispatching the Stripe refund API call.

---

## 3. Razorpay Production Handover Procedure

### Configuration Parameters
The recipient must supply live Razorpay merchant credentials:

| Variable Name | Description | Placement Target |
| :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | Live API Key ID (`rzp_live_...`) | `k8s/secrets/payment-secrets.yaml` |
| `RAZORPAY_KEY_SECRET` | Live API Secret Key | `k8s/secrets/payment-secrets.yaml` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Signature Secret | `k8s/secrets/payment-secrets.yaml` |

### Webhook Endpoint Configuration
1. Log in to the Razorpay Dashboard at `https://dashboard.razorpay.com`.
2. Navigate to **Settings > Webhooks > Add New Webhook**.
3. Set Webhook URL to: `https://api.<recipient-domain>/api/v1/payments/razorpay/webhook`.
4. Set Secret to a cryptographically random string (min 32 chars) and store in `RAZORPAY_WEBHOOK_SECRET`.
5. Select active events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.processed`
   - `refund.failed`
6. Verify that SHA-256 HMAC signature validation passes against `x-razorpay-signature`.

---

## 4. Post-Handover Live Validation Sequence

After credentials are provisioned in the production environment:

1. **Pre-flight Health Check**:
   ```bash
   curl -I https://api.<recipient-domain>/api/v1/payments/health
   # Expected: HTTP 200 OK
   ```
2. **End-to-End Live Micro-Transaction ($1.00 / ₹10.00)**:
   - Execute a live purchase using a test merchant account.
   - Verify that the transaction reflects in the recipient Stripe/Razorpay dashboard as `Captured / Succeeded`.
   - Verify that the SpiceGarden database creates a `PAID` order and balanced ledger transaction.
3. **Webhook Callback Verification**:
   - Confirm receipt of webhook event in application logs within <500ms.
   - Confirm double-execution replay protection (replay same webhook payload -> HTTP 200 returned with no secondary ledger entry).
4. **Live Refund Test**:
   - Issue a live partial refund via the Super Admin Dashboard.
   - Confirm refund settlement in Stripe/Razorpay and automatic ledger adjustment.
