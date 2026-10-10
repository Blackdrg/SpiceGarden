# Queue Reference

**Version:** 1.0.0
**Date:** 2026-06-26
**Classification:** Verified from source code

## Queue System: BullMQ + Redis

SpiceGarden uses **BullMQ** for reliable asynchronous job processing, backed by **Redis**.

## Queue Module

| File | Purpose |
|------|---------|
| `apps/backend/src/infra/queue/queue.module.ts` | Global queue module |
| `apps/backend/src/infra/queue/queue.service.ts` | Queue management service |
| `apps/backend/src/infra/queue/order.processor.ts` | Order lifecycle processor |
| `apps/backend/src/shared/contracts/queues.ts` | Queue name constants |

## Queue Names

```typescript
export const QUEUE_NAMES = {
  ORDER_LIFECYCLE: 'order-lifecycle',
  NOTIFICATION_DELIVERY: 'notification-delivery',
  PAYMENT_RETRY: 'payment-retry',
  WEBHOOK_RETRY: 'webhook-retry',
} as const;
```

## Queue Service

### Features

| Feature | Implementation |
|---------|---------------|
| Connection | IORedis with retry config |
| Workers | Auto-registered on module init |
| Retry | Exponential backoff (default 3 attempts) |
| Cleanup | Auto-remove completed (1 day / 1000 jobs) |
| Priority | Supported via `priority` option |
| Delay | Supported via `delay` option |
| Job IDs | Supported for idempotency |

### Configuration
```typescript
{
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
}
```

### Job Options
```typescript
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: { age: 86400, count: 1000 },
  removeOnFail: { age: 86400, count: 1000 },
}
```

## Order Lifecycle Queue

### Processor: `OrderProcessor`

**File:** `apps/backend/src/infra/queue/order.processor.ts`

**Method:** `processOrderLifecycle(data, job)`

**Flow:**
```
1. Order placed (status: PLACED)
2. → Create payment intent
3. → If success: status → PAYMENT_CONFIRMED
4. → Notify restaurant (WebSocket push)
5. → Assign driver
6. → Driver picks up: status → PICKED_UP
7. → On the way: status → ON_THE_WAY
8. → Delivered: status → DELIVERED
```

## Notification Queue

### NotificationQueueService

**File:** `apps/backend/src/services/notifications/queue/notification-queue.service.ts`

### Features
- Multi-channel: push (FCM/APNs), SMS (Twilio), email (SendGrid)
- Retry with configurable max attempts
- Status tracking: pending → queued → sent → delivered / failed
- Callback URL support
- Metadata support

### Notification Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/notification-queue/queue` | Queue notification |
| GET | `/notification-queue/:id` | Get notification |
| GET | `/notification-queue` | List by status |
| POST | `/notification-queue/:id/cancel` | Cancel notification |
| GET | `/notification-queue/stats/overview` | Statistics |
| POST | `/notification-queue/process` | Process queue |

## Payment Retry Queue

### RetryService

**File:** `apps/backend/src/services/payments/retry.service.ts`

**Method:** `executeWithRetry(fn, operationName, context)`

**Features:**
- Exponential backoff
- Circuit breaker pattern
- Max 3 retries by default
- Audit logging of failures

## Webhook Retry Queue

### WebhookRetryService

**File:** `apps/backend/src/services/payments/webhook/webhook-retry.service.ts`

**Features:**
- Retries failed webhook deliveries
- Max attempts configurable
- Stores webhook payload for replay

## Queue Monitoring

### Metrics
- Queue depth (waiting + active jobs)
- Job processing time
- Failure rate
- Retry count

### Administration
Access via `/notification-queue` endpoints for:
- Manual re-processing
- Status inspection
- Cancellation

## Redis Configuration

### Connection
```typescript
const redisUrl = this.configService.get('REDIS_URL') || 'redis://localhost:6379';
this.connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
```

### Fallback
Rate limiting store falls back to memory when Redis is unavailable (non-production).

## Best Practices

1. **Idempotency**: Use jobId for deduplication
2. **Timeouts**: Set appropriate job timeouts
3. **Monitoring**: Track queue depth and failure rates
4. **Graceful shutdown**: Workers complete in-progress jobs
5. **Backpressure**: Monitor queue depth vs processing capacity
