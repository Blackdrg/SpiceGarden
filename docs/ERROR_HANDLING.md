# Error Handling

## Error Handling Strategy

SpiceGarden implements a multi-layered error handling strategy covering HTTP exceptions, validation errors, authentication failures, payment errors, queue failures, and WebSocket errors.

## HTTP Error Responses

### Standard HTTP Status Codes

| Status | Usage |
|--------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation failure) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 405 | Method Not Allowed (dangerous HTTP methods blocked) |
| 409 | Conflict (duplicate email, etc.) |
| 422 | Unprocessable Entity (business rule violation) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Validation Errors

**File:** `apps/backend/src/main.ts:270-276`

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
);
```

**Behavior:**
- `whitelist: true` - Strips properties not defined in DTO
- `forbidNonWhitelisted: true` - Throws error if extra properties present
- `transform: true` - Auto-transforms types (string → number, etc.)

### Custom Exceptions

**File:** `apps/backend/src/common/errors/missing-env.error.ts`

```typescript
export class MissingEnvError extends Error {
  constructor(variable: string, message?: string) {
    super(message || `Required environment variable ${variable} is missing`);
    this.name = 'MissingEnvError';
  }
}
```

Thrown at bootstrap if required production secrets missing.

## Payment Error Handling

### Error Categories

| Category | Handling |
|----------|----------|
| Network timeout | RetryService with exponential backoff |
| Duplicate request | IdempotencyService check |
| Fraud detected | FraudHardeningService blocks with reasons |
| Gateway unavailable | Fallback to alternate gateway |
| Webhook failure | WebhookRetryQueue with retries |
| Amount mismatch | PaymentHardeningService validation |

### Payment Error Response

```json
{
  "error": "Payment blocked due to fraud risk",
  "reasons": ["Unusual amount", "Velocity exceeded"],
  "riskScore": 0.85
}
```

## Queue Error Handling

### Job Failure

**File:** `apps/backend/src/infra/queue/queue.service.ts:133-139`

```typescript
worker.on('completed', (job) => {
  this.logger.log(`Queue job completed: ${queueName}:${job.id}`);
});

worker.on('failed', (job, error) => {
  this.logger.error(`Queue job failed: ${queueName}:${job?.id ?? 'unknown'}`, error.stack);
});
```

### Retry Behavior

- Default: 3 attempts
- Backoff: Exponential (1s, 2s, 4s)
- After max attempts: Job marked FAILED, logged, alerted

## WebSocket Error Handling

### Connection Errors

| Error | Response |
|-------|----------|
| Origin not allowed | Disconnect immediately |
| Rate limit exceeded | Disconnect, log warning |
| Invalid room name | Return error, don't join |
| Invalid location data | Return error, don't broadcast |
| Ack timeout | Resolve with `{ status: 'timeout' }` |

### Client Disconnection

**File:** `apps/backend/src/infra/tracking/tracking.gateway.ts:111-115`

```typescript
handleDisconnect(client: Socket) {
  this.cleanupPendingAcks(client.id);
  this.connectedClients.delete(client.id);
  this.logger.log(`Client ${client.id} disconnected`);
}
```

Cleans up:
- Pending acknowledgements
- Connection tracking

## Authentication Errors

### JWT Errors

| Error | Code | Handling |
|-------|------|----------|
| Missing token | 401 | `UnauthorizedException` |
| Expired token | 401 | `UnauthorizedException` |
| Invalid signature | 401 | `UnauthorizedException` |
| Refresh token invalid | 401 | Force re-login |

### Session Errors

| Error | Code | Handling |
|-------|------|----------|
| Session expired | 401 | `UnauthorizedException` |
| Session revoked | 401 | `UnauthorizedException` |
| Too many sessions | 403 | `ForbiddenException` |

## Authorization Errors

| Error | Code | Handling |
|-------|------|----------|
| Role mismatch | 403 | `ForbiddenException` |
| Permission denied | 403 | `ForbiddenException` |
| Resource ownership | 403 | `ForbiddenException` |

### Permission Guard

**File:** `apps/backend/src/security/permission.guard.ts`

Checks:
1. User role from JWT
2. Required roles from `@Roles()` decorator
3. Required permissions from `@Permissions()` decorator
4. Custom user permissions override

## Database Errors

### TypeORM Errors

| Error | Handling |
|-------|----------|
| Connection lost | Automatic reconnection |
| Unique constraint | 409 Conflict |
| Not found | 404 Not Found |
| FK violation | 400 Bad Request |
| Deadlock | 409 Conflict (retry) |

## Rate Limiting Errors

### Express Rate Limit Response

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please retry after the reset window."
}
```

**Headers:**
- `X-RateLimit-Limit` - Max requests
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp
- `Retry-After` - Seconds until reset

### Redis Rate Limit Fallback

**File:** `apps/backend/src/security/redis-rate-limit.store.ts`

- Falls back to in-memory store if Redis unavailable
- Only in non-production unless `RATE_LIMIT_REDIS_REQUIRED=false`
- Logs warning when fallback active

## Frontend Error Handling

### Error Boundary

**Component:** `packages/ui/ErrorBoundary.tsx`

- Catches React rendering errors
- Shows fallback UI with retry button
- Logs error details

### Network Error Handling

**customer-web:**
```typescript
// useOfflineQueue hook
// Queues requests when offline, processes when back online
```

**delivery-partner:**
```typescript
// websocket service
// Exponential backoff reconnection (10 attempts, 1-30s jitter)
```

## Sentry Integration

### Backend

**File:** `apps/backend/src/main.ts`

```typescript
sentry.Handlers?.requestHandler && app.use(sentry.Handlers.requestHandler);
sentry.Handlers?.tracingHandler && app.use(sentry.Handlers.tracingHandler);
sentry.setupExpressErrorHandler && app.use(sentry.setupExpressErrorHandler());
```

Captures:
- Unhandled exceptions
- Unhandled rejections
- HTTP errors (4xx, 5xx)
- Transaction traces

### Frontend

**Restaurant Dashboard & Super Admin:**
- Sentry ErrorBoundary
- Automatic error capture
- User context enrichment

**Customer Web:**
- ErrorBoundary component only
- No Sentry SDK integration

## Logging Error Details

**File:** `apps/backend/src/logging/logging.service.ts`

### Sanitization

```typescript
sanitizeForLog(data: any): any {
  // Redacts: passwords, tokens, secrets, API keys, card numbers
  // Masks: emails, phone numbers, addresses, IP addresses
}
```

## Recovery Mechanisms

### Idempotency

- Payment operations: Idempotency keys prevent duplicate processing
- Order operations: Idempotent status transitions
- Webhook processing: WebhookRetryQueue deduplication

### Retry Logic

| Component | Strategy |
|-----------|----------|
| Payments | Exponential backoff, max retries |
| Webhooks | BullMQ with retry queue |
| Notifications | Queue with retry |
| Redis connection | Auto-reconnect |

### Graceful Degradation

- Fallback gateway (Stripe → Razorpay → COD)
- Fallback email provider (SendGrid → SMTP)
- In-memory rate limit fallback
- Offline queue for customer-web

## Monitoring Errors

### Prometheus Counters

```typescript
httpRequestCounter.inc({ method, route, status_code })
```

Alert on:
- 5xx error rate spike
- 401 error rate spike (auth issues)
- 429 error rate spike (abuse/attack)

### Queue Failure Tracking

```typescript
worker.on('failed', (job, error) => {
  this.logger.error(`Queue job failed: ${queueName}:${job?.id}`, error.stack);
});
```
