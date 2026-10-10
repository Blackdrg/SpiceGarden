# Payment System

## Architecture

SpiceGarden implements a multi-gateway payment abstraction with automatic fallback, fraud detection, idempotency, retries, and comprehensive reconciliation.

### Gateway Hierarchy

| Priority | Gateway | Region | Currency | Status |
|----------|---------|--------|----------|--------|
| Primary | Stripe | Global | USD, EUR, etc. | Active |
| Secondary | Razorpay | India | INR | Active |
| Fallback | Cash on Delivery | All | Local | Active |

### Payment Module Structure

**File:** `apps/backend/src/services/payments/`

| File | Purpose |
|------|---------|
| `payments.controller.ts` | REST API endpoints |
| `payments.service.ts` | Core payment orchestration |
| `payment-provider.controller.ts` | Gateway configuration |
| `gateway-factory.service.ts` | Gateway selection and routing |
| `fraud-hardening.service.ts` | Fraud detection and prevention |
| `idempotency.service.ts` | Idempotency key management |
| `retry.service.ts` | Retry with exponential backoff |
| `payment-hardening.service.ts` | Amount validation, webhook auth |
| `payment.types.ts` | Type definitions |
| `chargeback/` | Chargeback management |
| `webhook/` | Webhook processing |

## Payment Flow

1. **Fraud Hardening** - `FraudHardeningService.checkPaymentFraud()` validates:
   - User payment history
   - Order amount patterns
   - IP reputation
   - Velocity checks

2. **Retry Service** - `RetryService.executeWithRetry()` wraps gateway calls:
   - Exponential backoff
   - Configurable max retries
   - Error classification

3. **Idempotency Check** - `IdempotencyService.validateOrCreate()`:
   - Header: `x-idempotency-key`
   - Operation: `create_payment_intent`
   - Cache: Request + response hash

4. **Gateway Selection** - `PaymentService.createPaymentIntent()`:
   - Query parameter: `gateway` (optional)
   - Default: `PAYMENT_PRIMARY_GATEWAY` env var
   - Factory pattern for gateway instantiation

5. **Payment Capture** - Two-phase commit pattern:
   - Phase 1: Create payment intent
   - Phase 2: Capture/confirm on webhook

## Webhook Processing

### Stripe Webhooks

**Endpoint:** `POST /payments/webhooks/stripe`
**File:** `apps/backend/src/services/payments/webhook.controller.ts`

**Verification:** Stripe signature verification via `STRIPE_WEBHOOK_SECRET`
**Events processed:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`

### Razorpay Webhooks

**Endpoint:** `POST /payments/webhooks/razorpay`
**Verification:** Razorpay signature via `RAZORPAY_WEBHOOK_SECRET`

### Webhook Retry Queue

**Entity:** `webhook-retry-queue.entity.ts`

```sql
gateway VARCHAR(50)
event_type VARCHAR(100)
payload JSONB
attempts INTEGER DEFAULT 0
max_attempts INTEGER DEFAULT 5
next_retry_at TIMESTAMP
last_error TEXT
```

Failed webhooks are queued for retry with exponential backoff.

## Idempotency

**File:** `apps/backend/src/services/payments/idempotency.entity.ts`

Prevents duplicate payment operations using:
- Request hash of amount + currency + userId + orderId
- Cached response for matching keys
- TTL-based expiration

## Fraud Detection

**File:** `apps/backend/src/services/payments/fraud-hardening.service.ts`

**Checks:**
- Payment velocity limits
- Amount threshold validation
- User behavior patterns
- Device fingerprinting
- IP address analysis

**Result:** `FraudCheckResult` with:
- `allowed: boolean`
- `reasons: string[]`
- `riskScore: number`

## Refund Flow

1. **Initiation** - Customer or admin requests refund
2. **Approval** - Requires admin/finance staff approval (`RefundApprovalEntity`)
3. **Gateway call** - Refund via original gateway
4. **Wallet update** - `WalletService` credits if applicable
5. **Notification** - Customer notified via preferred channel
6. **Reconciliation** - Automatic ledger entry

### Refund Endpoints

| Method | Path | Guard | Role |
|--------|------|-------|------|
| POST | `/refunds` | JwtAuthGuard | CUSTOMER |
| GET | `/refunds` | JwtAuthGuard | All |
| PATCH | `/refunds/:id` | JwtAuthGuard | ADMIN, FINANCE_STAFF |
| POST | `/refunds/:id/approve` | JwtAuthGuard, RolesGuard | ADMIN, FINANCE_STAFF |

## COD (Cash on Delivery)

**File:** `apps/backend/src/services/payments/cod.service.ts`

- COD treated as payment gateway
- Failed COD attempts tracked
- Agent collection verification

## Reconciliation

**File:** `apps/backend/src/services/finance/reconciliation.service.ts`

- Daily/weekly reconciliation reports
- Gateway-transaction matching
- Discrepancy detection
- Payout report generation

## Reconciliation Endpoints

| Method | Path | Guard | Role |
|--------|------|-------|------|
| GET | `/finance/reconciliation` | JwtAuthGuard | FINANCE_STAFF, ADMIN |
| GET | `/finance/payouts` | JwtAuthGuard | FINANCE_STAFF, ADMIN |
| GET | `/finance/tax-report` | JwtAuthGuard | FINANCE_STAFF, ADMIN |

## Commission Management

**Entity:** `commission-rule.entity.ts`

```sql
restaurant_id UUID
rate DECIMAL(5,2)
type VARCHAR(50) (percentage, fixed)
min_amount DECIMAL(10,2)
max_amount DECIMAL(10,2)
valid_from TIMESTAMP
valid_to TIMESTAMP
```

## Chargeback Management

**Entity:** `payment-dispute.entity.ts`

- `type`: chargeback, dispute
- `status`: pending, under_review, resolved, lost
- `evidence`: JSONB storage
- Routing to admin/finance

## Tax Reporting

**File:** `apps/backend/src/services/finance/tax-reporting.service.ts`

- HSN/SAC code mapping (`hsn-sac.entity.ts`)
- GST calculation per order
- Invoice generation
- Period-based tax reports
