# SpiceGarden Monitoring and Logging Documentation

**Version:** 0.0.0  
**Last Updated:** 2026-06-27

---

## Table of Contents

1. [Observability Stack](#observability-stack)
2. [Metrics (Prometheus)](#metrics-prometheus)
3. [Alerting](#alerting)
4. [Logging](#logging)
5. [Error Tracking (Sentry)](#error-tracking-sentry)
6. [Dashboards (Grafana)](#dashboards-grafana)
7. [Health Checks](#health-checks)
8. [Stack Verification](#stack-verification)
9. [Configuration Files](#configuration-files)

---

## Observability Stack

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Backend    │───>│  Prometheus  │<──│  Alertmanager │
│  :3001       │    │   :9090      │    │   :9093      │
│  /metrics    │    └──────┬───────┘    └──────┬───────┘
└──────────────┘           │                   │
                    ┌──────▼───────┐           │
                    │   Grafana    │<──────────┘
                    │   :3000      │
                    └──────────────┘
                    ┌──────────────┐
                    │    Sentry    │
                    │ (errors+tracez│
                    ├──────────────┤
                    │  OpenSearch  │
                    │   :9200      │
                    │  (logs)      │
                    └──────────────┘
```

---

## Metrics (Prometheus)

### Core Metrics (from `main.ts`)
Registered at application startup using `prom-client` v15.0.0.

| Metric | Type | Labels |
|--------|------|--------|
| `http_requests_total` | Counter | method, route, status_code |
| `http_request_duration_seconds` | Histogram | method, route, status_code (buckets: 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10) |

**Default metrics:**
- `process_cpu_seconds_total`
- `process_resident_memory_bytes`
- `nodejs_eventloop_latency_seconds`
- etc.

### Metrics Endpoint
- **Path:** `GET /metrics`
- **Content-Type:** `prom-client` registry contentType
- **Auth:** JWT + RBAC (Admin/SuperAdmin + `analytics:read` permission)
- **Also in:** `/metrics` via MetricsModule

### MetricsModule
**File:** `apps/backend/src/metrics/metrics.service.ts`
- In-memory Map-based metrics for: HTTP duration, queue failures, socket failures, payment failures
- Returns Prometheus-format text (separate from prom-client implementation in `main.ts`)

### Interceptors
- `LatencyMetricsInterceptor` (`infra/metrics/latency-metrics.interceptor.ts`)

---

## Alerting

### Alert Rules (5)

| Alert | Expression | Severity | For |
|-------|-----------|----------|-----|
| `HighErrorRate` | `rate(http_request_duration_seconds_count{status_code=~"5.."}[5m]) / rate(http_request_duration_seconds_count[5m]) > 0.05` | **critical** | 1m |
| `HighLatency` | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1` | **warning** | 2m |
| `DatabaseDown` | `up{job="spicegarden-backend"} == 0` | **critical** | 1m |
| `QueueFailures` | `queue_failures_total > 0` | **warning** | 1m |
| `PaymentFailures` | `payment_failures_total > 5` | **critical** | 1m |

### Alertmanager Configuration
**File:** `infra/alertmanager/alertmanager.yml`
- Slack: `#alerts` channel
- PagerDuty routing for critical
- **Inhibit rule:** Critical suppresses warning for same alertname

---

## Logging

### Implementation
**Custom structured logging** (no winston, no pino)

Two implementations:
1. **`LoggingService`** (`apps/backend/src/logging/logging.service.ts`)
2. **`StructuredLogger`** (`apps/backend/src/infra/logging/logging.service.ts`)

### Sensitive Data Redaction
Both use `sanitizeForLog()` and `sanitizeErrorMessage()`:
- Strips: password, token, secret, apiKey, creditCard, cvv, cvc
- Extracts message/stack from errors

### Format
```
[timestamp] [LEVEL] [context] message
```

### JSON Output
`StructuredLogger` outputs JSON:
```json
{
  "level": "error",
  "message": "...",
  "context": "...",
  "timestamp": "..."
}
```

### Queue Logging
BullMQ worker events logged via `Worker.on('completed')` and `Worker.on('failed')`

---

## Error Tracking (Sentry)

### Backend
**Location:** `apps/backend/src/main.ts`
- `@sentry/node` v10.58.0
- Dynamic import (only initializes if `SENTRY_DSN` is set)
- `tracesSampleRate: 1.0` (100% tracing in production)
- `setupExpressErrorHandler()`

### Frontend Apps

| App | Package | Sample Rate |
|-----|---------|-------------|
| customer-web | `@sentry/nextjs` 10.57.0 | traces: 0.05-0.1, profiles: 0.1 |
| restaurant-dashboard | `@sentry/nextjs` | traces: 0.05 |
| super-admin | `@sentry/nextjs` (listed dep) | — |
| UI package | `@sentry/nextjs` | traces: 0.1 (prod) / 0 (dev), profiles: 0.1 / 0 |

### Sentry Configuration Files
```
apps/backend/src/main.ts                   # Dynamic init
apps/customer-web/sentry.client.config.ts  # Client init
apps/restaurant-dashboard/sentry.config.ts  # Server init
packages/ui/sentry.client.ts               # Browser init
```

---

## Dashboards (Grafana)

### Main Dashboard
**File:** `infra/grafana/dashboards/spicegarden.json`

### Provisioning
**Dir:** `infra/grafana/provisioning/` (currently empty — may need setup)

### Grafana Credentials (Compose)
- **URL:** http://localhost:3000
- **User:** admin
- **Password:** Set via `GF_ADMIN_PASSWORD` env var (default: `admin`)
- **Sign-up:** Disabled (`GF_USERS_ALLOW_SIGN_UP=false`)

---

## Health Checks

| Endpoint | Location | Description |
|----------|----------|-------------|
| `GET /health` | `apps/backend/src/app.controller.ts` | Backend health check |
| `GET /orders/health` | `apps/backend/src/services/order/order.controller.ts` | Order service health |
| `GET /metrics` | `apps/backend/src/main.ts` | Prometheus metrics |

### Compose Healthcheck
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## Stack Verification

**Script:** `infra/scripts/verify-stack.js`

**Checks performed:**
1. Backend Health (http://localhost:3001/health)
2. Backend Metrics (http://localhost:3001/metrics)
3. Grafana (http://localhost:3000/api/health)
4. Prometheus (http://localhost:9090/-/healthy)
5. OpenSearch (http://localhost:9200/_cluster/health)
6. Smoke request to `/api/restaurants`

**Usage:**
```bash
npm run verify:stack
# Or
node infra/scripts/verify-stack.js
```

---

## Configuration Files

### Prometheus
- **Production:** `infra/prometheus/prometheus.yml`
- **Development:** `infra/prometheus/prometheus.dev.yml`
- **Alert Rules:** `infra/prometheus/rules/alerts.yml`
- **SLO Rules:** `/etc/prometheus/rules/slos.yml` (referenced in config)

### Alertmanager
- **File:** `infra/alertmanager/alertmanager.yml`
- **Port:** 9093
- **Environment:** `SLACK_WEBHOOK_URL`, `PAGERDUTY_ROUTING_KEY`

### Grafana
- **Dashboards:** `infra/grafana/dashboards/spicegarden.json`
- **Provisioning:** `infra/grafana/provisioning/` (empty)

### OpenSearch
- **Ports:** 9200 (API), 9300 (transport)
- **Java opts:** `-Xms512m -Xmx512m`
- **Admin password:** `Opensearch#2026!` (dev override)
- **Index templates:** `infra/opensearch/index-templates/`

### OpenSearch Dashboards
- **Port:** 5601
- **Hosts:** `http://opensearch:9200`

### Filebeat
**Directory:** `infra/filebeat/` (log shipping config)

---

## Metrics Middleware

**Location:** `apps/backend/src/main.ts:244-254`

```typescript
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path ? req.path : req.baseUrl || req.path;
    httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, duration);
    console.log(`[local-metrics] ${req.method} ${req.path} ${res.statusCode} ${Math.round(duration * 1000)}ms`);
  });
  next();
});
```

---

## Queue Metrics

**File:** `apps/backend/src/infra/queue/queue.service.ts`

BullMQ worker events captured:
```typescript
worker.on('completed', (job) => {
  this.logger.log(`Queue job completed: ${queueName}:${job.id}`);
});

worker.on('failed', (job, error) => {
  this.logger.error(`Queue job failed: ${queueName}:${job?.id ?? 'unknown'}`, error.stack);
});
```

---

## No OpenTelemetry

**Note:** No OpenTelemetry implementation found. Tracing is available via:
1. Sentry tracing (backend + frontend)
2. Prometheus metrics
3. Audit logging
4. Request ID middleware (`x-request-id`)

Custom instrumentation exists in `super-admin/src/instrumentation.ts` but uses Sentry, not full OTel.
