# Payment Architecture

**Version:** 1.0.0
**Date:** 2026-06-26
**Classification:** Verified from source code

## Overview

SpiceGarden implements a multi-gateway payment orchestration layer with fraud prevention, idempotency, retries, and chargeback management.

## Architecture

```
Customer Request
    │
    ▼
PaymentsController
    │
    ├─► FraudHardeningService.checkPaymentFraud()
    │       ├─► IP velocity check
    │       ├─► Amount anomaly check
    │       └─► User history check
    │
    ├─► IdempotencyService.validateOrCreate()
    │       └─► Check x-idempotency-key header
    │
    ├─► PaymentService.createPaymentIntent()
    │       └─► GatewayFactory.getGateway(gatewayName)
    │               ├──► StripeGateway
    │               ├──► RazorpayGateway
    │               └──► CodGateway
    │
    └─► Return { clientSecret, gateway }
```

## Payment Gateways

### StripeGateway (`apps/backend/src/services/payments/gateways/stripe-gateway.service.ts`)
- Primary gateway
- Payment intents
- Webhook handling
- Stripe Connect (restaurant payouts)

### RazorpayGateway (`apps/backend/src/services/payments/gateways/razorpay-gateway.service.ts`)
- Secondary gateway (India/INR)
- Payment intents
- Webhook handling
- Razorpay Settlements

### CodGateway (`apps/backend/src/services/payments/gateways/cod-gateway.service.ts`)
- Cash on Delivery fallback
- Wallet integration
- Delivery partner confirmation

## Payment Flow

### Create Payment Intent
```
1. Client → POST /payments/create-intent
   Body: { amount, currency, userId, orderId, paymentMethodId }
   Headers: x-idempotency-key

2. FraudHardeningService.checkPaymentFraud()
   - IP velocity check
   - Amount anomaly detection
   - User history analysis

3. IdempotencyService.validateOrCreate()
   - Check if duplicate request
   - Return cached response if duplicate

4. GatewayFactory.getGateway()
   - Select gateway based on config/request

5. gateway.createPaymentIntent()
   - Call external gateway API
   - Return payment intent

6. Return { clientSecret, gateway }
```

### Webhook Processing
```
1. Gateway → POST /payments/webhook
   Headers: stripe-signature / x-razorpay-signature

2. WebhookService.processWebhook()
   - Verify signature
   - Parse event
   - Update OrderEntity.paymentStatus
   - LedgerService.recordEntry()
   - Enqueue WEBHOOK_RETRY (on failure)
```

## Idempotency

### Implementation
- Header: `x-idempotency-key`
- Scope: `create_payment_intent`, `refund_payment`
- Storage: TypeORM IdempotencyEntity
- Duplicate detection via payload hash

### Entity
```typescript
@Entity('idempotency_keys')
class IdempotencyEntity {
  @PrimaryColumn() idempotency_key: string;
  @Column() scope: string;
  @Column() user_id: string;
  @Column() payload_hash: string;
  @Column() response: any;
  @Column() created_at: Date;
}
```

## Fraud Prevention

### FraudHardeningService
**File:** `apps/backend/src/services/payments/fraud-hardening.service.ts`

### Checks
1. **IP Velocity**: Max requests per IP per time window
2. **Amount Anomaly**: Compare against user's historical amounts
3. **User History**: Check for suspicious patterns

### Entity
```typescript
@Entity('payment_fraud_flags')
class PaymentFraudFlagEntity {
  id: UUID
  userId: UUID
  orderId: UUID
  riskScore: number
  flags: JSON
  createdAt: Date
}
```

## Retry Logic

### RetryService
**File:** `apps/backend/src/services/payments/retry.service.ts`

**Configuration:**
- Max attempts: 3
- Backoff: Exponential (1s base)
- Circuit breaker pattern

## Chargebacks

### ChargebackService
**File:** `apps/backend/src/services/payments/chargeback/chargeback.service.ts`

### Dispute Lifecycle
```
warning → needs_response → under_review → won / lost
```

### Endpoints
- `GET /chargebacks` — List disputes
- `POST /chargebacks/:id/initiate-refund` — Refund won dispute

## Payment Provider Integration

### Stripe Connect
- Restaurant onboarding to Stripe
- Direct payouts to restaurant accounts
- Balance and payout history

### Razorpay Settlements
- Fund account creation
- Settlement history
- Balance management

## Payment Limits

| Limit | Default | Environment Variable |
|-------|---------|---------------------|
| Max single amount | 10,000 | `PAYMENT_MAX_SINGLE_AMOUNT` |
| Daily limit per user | 50,000 | `PAYMENT_DAILY_LIMIT_PER_USER` |

## Security

- No card data stored locally
- Webhook signature verification
- Idempotent operations
- Audit logging of all payment events
- PCI-DSS compliance validation

## Reconciliation

### Services
- **ReconciliationService**: Payment/payout reconciliation
- **LedgerService**: Double-entry bookkeeping

### Endpoints
- `POST /finance/reconciliation/payments`
- `POST /finance/reconciliation/payouts`
- `POST /finance/reconciliation/driver`
- `POST /finance/reconciliation/full`
