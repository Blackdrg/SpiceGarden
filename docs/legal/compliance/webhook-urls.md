# Webhook URLs and Endpoints

**Status:** DRAFT — First draft, not yet reviewed by legal/security counsel.

---

## 1. Overview

This document lists all public webhook endpoints operated by the SpiceGarden platform. External services (payment gateways, emergency services, monitoring tools) POST to these endpoints to deliver events.

All webhook endpoints are exempt from CSRF protection per `apps/backend/src/security/csrf.middleware.ts:7`.

## 2. Payment Gateway Webhooks

### POST `/payments/webhook`

**URL (Production):** `https://api.spicegarden.com/v1/payments/webhook`  
**URL (Staging):** `https://staging-api.spicegarden.com/v1/payments/webhook`  
**URL (Local):** `http://localhost:3001/v1/payments/webhook`

**Purpose:** Receives payment events from Stripe and Razorpay.

**Authentication:** HMAC signature verification
- Stripe: Validates `Stripe-Signature` header using `STRIPE_WEBHOOK_SECRET`
- Razorpay: Validates `X-Razorpay-Signature` header using `RAZORPAY_WEBHOOK_SECRET`

**Backend references:**
- Route: `apps/backend/src/services/payments/webhook/webhook.controller.ts:7` — `@Controller('payments/webhook')`
- Raw body: `apps/backend/src/main.ts:202` — `{ rawBody: true }` required for signature verification
- Signature validation: `apps/backend/src/services/payments/webhook/webhook.service.ts:158-167` — `constructEvent()` for Stripe, HMAC-SHA256 for Razorpay
- Duplicate detection: `webhook.service.ts:79-87` — checks `webhookId` against `payment_webhooks` table
- Storage: `apps/backend/src/db/entities/payment-webhook.entity.ts:4-18` — `payment_webhooks` table
- Retry queue: `apps/backend/src/db/entities/webhook-retry-queue.entity.ts:3-14` — `webhook_retry_queue` table
- Retry logic: `apps/backend/src/services/payments/webhook/webhook-retry.service.ts` — max attempts with backoff

**Events processed:**
| Gateway | Event Types |
|---|---|
| Stripe | `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.succeeded`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed` |
| Razorpay | `payment.captured`, `payment.failed`, `payment.chargeback`, `refund.processed`, `order.paid` |
| PhonePe | `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `REFUND_SUCCESS` |
| Paytm | `TXN_SUCCESS`, `TXN_FAILURE`, `REFUND` |

**Secrets:**
| Secret Name | Env Variable | Purpose |
|---|---|---|
| Stripe webhook secret | `STRIPE_WEBHOOK_SECRET` | Validate Stripe webhook signatures |
| Razorpay webhook secret | `RAZORPAY_WEBHOOK_SECRET` | Validate Razorpay webhook signatures |
| Stripe Connect webhook secret | `STRIPE_CONNECT_WEBHOOK_SECRET` | Validate Stripe Connect webhooks |

**Backend reference:** `apps/backend/src/infra/secret-loader.service.ts:35-38` — secret mappings.

## 3. Emergency Dispatch Webhook

### POST (External) — Emergency Dispatch

**Config:** `EMERGENCY_WEBHOOK_URL` (env variable) — to be configured per environment  
**API Key:** `EMERGENCY_WEBHOOK_API_KEY` (env variable) — sent as `X-API-Key` header

**Purpose:** Receives emergency incident dispatches (SOS button activations). Called by the emergency dispatch provider when a customer or driver triggers an SOS.

**Backend reference:** `apps/backend/src/services/emergency/webhook-dispatch.provider.ts:12-14` — reads `EMERGENCY_WEBHOOK_URL` and `EMERGENCY_WEBHOOK_API_KEY` from env.

**Payload:**
```json
{
  "incidentId": "uuid",
  "incidentNumber": "INC-001234",
  "driverId": "uuid",
  "location": { "latitude": 12.9716, "longitude": 77.5646 },
  "address": "string",
  "severity": "low|medium|high|critical",
  "notes": {},
  "timestamp": "ISO-8601"
}
```

**Status:** `PARKED — CREDENTIAL/ACCOUNT` — `EMERGENCY_WEBHOOK_URL` and `EMERGENCY_WEBHOOK_API_KEY` are not set in any `.env` file. Must be configured with the emergency response partner's webhook URL.

## 4. Alert/Montoring Webhooks

### POST — Alert Webhook

**Config:** `ALERT_WEBHOOK_URL` (env variable)  
**Auth:** `ALERT_WEBHOOK_SECRET` (env variable) — sent as `Bearer` token in `Authorization` header

**Purpose:** Sends alert notifications for payment failures, fraud, order cancellations, and webhook failures.

**Backend reference:** `apps/backend/src/services/notifications/production-notification.service.ts:100-120` — `sendWebhookAlert()` method.
- Also sends to Slack: `SLACK_WEBHOOK_URL` at `production-notification.service.ts:130`

**Events sent:**
| Event Type | Trigger |
|---|---|
| `payment_failure` | Payment processing failure |
| `payment_success` | Payment processing success |
| `refund_initiated` | Refund request created |
| `refund_completed` | Refund processed |
| `fraud_detected` | Fraud detection triggered |
| `order_cancelled` | Order cancelled |
| `webhook_failure` | Internal webhook dispatch failure |

## 5. Webhook URLs Summary

| Endpoint | Environment | URL |
|---|---|---|
| Payment Gateway Webhooks | Production | `https://api.spicegarden.com/v1/payments/webhook` |
| Payment Gateway Webhooks | Staging | `https://staging-api.spicegarden.com/v1/payments/webhook` |
| Payment Gateway Webhooks | Local | `http://localhost:3001/v1/payments/webhook` |
| Emergency Dispatch | Production | `EMERGENCY_WEBHOOK_URL` (not configured) |
| Alert Webhook | Production | `ALERT_WEBHOOK_URL` (not configured) |
| Slack Alert | Production | `SLACK_WEBHOOK_URL` (not configured) |

## 6. Webhook Security

| Security Control | Implementation | Backend Reference |
|---|---|---|
| CSRF bypass | Webhook paths exempt from CSRF | `csrf.middleware.ts:7` |
| Raw body | `rawBody: true` for signature verification | `main.ts:202` |
| Signature verification | HMAC-SHA256 / Stripe SDK | `webhook.service.ts:158-167` |
| Duplicate prevention | `webhookId` stored and checked | `webhook.service.ts:79-87` |
| Retry mechanism | `webhook_retry_queue` with max attempts | `webhook-retry.service.ts:3-160` |
| IP allowlist | (Not implemented) | — |
| Rate limiting | CSRF-bypassed path; no explicit rate limit | `main.ts:179` — orders rate-limited, webhook exempt |

## 7. Webhook Testing

Webhook endpoints can be tested using:
- Stripe CLI: `stripe listen --forward-to localhost:3001/v1/payments/webhook`
- Razorpay CLI: `razorpay webhook test`
- Manual curl testing with signed payloads

**Backend reference:** Webhook stats endpoint at `webhook.controller.ts:36` — `GET /payments/webhook/stats` (returns webhook health metrics).

---

*This document is a DRAFT. For webhook configuration, contact engineering@spicegarden.com.*
