# Observability

## Overview

SpiceGarden implements comprehensive observability through metrics (Prometheus), visualization (Grafana), error tracking (Sentry), and log aggregation (OpenSearch + Filebeat).

## Observability Stack

| Component | Version | Port | Purpose |
|-----------|---------|------|---------|
| Prometheus | v2.51.0 | 9090 | Metrics collection and storage |
| Grafana | 10.4.0 | 3000 | Metrics visualization and dashboards |
| Alertmanager | v0.27.0 | 9093 | Alert routing and notification |
| Sentry | 10.58.0 | N/A | Error tracking and performance monitoring |
| OpenSearch | 2.15.0 | 9200 | Log aggregation and search |
| OpenSearch Dashboards | 2.15.0 | 5601 | Log visualization |

## Metrics (Prometheus)

### Prometheus Configuration

**File:** `infra/prometheus/prometheus.yml`
**Dev Config:** `infra/prometheus/prometheus.dev.yml`

### Custom Metrics

**File:** `apps/backend/src/main.ts`

#### HTTP Request Metrics

```typescript
const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route, and status code.",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
```

#### Default Node.js Metrics

```typescript
collectDefaultMetrics({ register: metricsRegistry });
```

Includes:
- Process CPU usage
- Process memory usage
- Event loop lag
- Open file descriptors
- Active handles/requests

### Metrics Middleware

**File:** `apps/backend/src/main.ts:256-266`

```typescript
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path ? req.path : req.baseUrl || req.path;
    httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, duration);
  });
  next();
});
```

### Metrics Endpoint

```
GET http://localhost:3001/metrics
```

**Content-Type:** `text/plain; version=0.0.4; charset=utf-8`

## Dashboards (Grafana)

### Dashboard Configuration

**File:** `infra/grafana/dashboards/spicegarden.json`

**Provisioning:**
- Dashboard JSON in `infra/grafana/dashboards/`
- Datasource provisioning in `infra/grafana/provisioning/datasources/`
- Dashboard provisioning in `infra/grafana/provisioning/dashboards/`

### Grafana Access

```
URL: http://localhost:3000
Admin: admin (configured via GF_SECURITY_ADMIN_PASSWORD)
```

**Default credentials (dev):**
- Username: admin
- Password: admin (or GF_ADMIN_PASSWORD env var)

## Alerting (Alertmanager)

### Alert Configuration

**File:** `infra/alertmanager/alertmanager.yml`

**File:** `infra/prometheus/rules/alerts.yml`

### Alert Routing

| Alert | Route | Severity |
|-------|-------|----------|
| High error rate | Slack + PagerDuty | Critical |
| High latency | Slack | Warning |
| Service down | PagerDuty | Critical |
| Database connection failure | PagerDuty | Critical |
| Queue depth high | Slack | Warning |
| Disk usage high | Slack | Warning |

### SLO Alerts

**File:** `infra/prometheus/rules/slos.yml`

- Availability SLO tracking
- Latency SLO tracking
- Error budget burn rate alerts

## Logging (OpenSearch + Filebeat)

### Log Aggregation

**Stack:**
- **Filebeat** - Log shipping from containers
- **OpenSearch** - Log storage and indexing
- **OpenSearch Dashboards** - Log search and visualization

### Filebeat Configuration

**File:** `infra/filebeat/filebeat.yml`

### OpenSearch Index Templates

**File:** `infra/opensearch/index-templates/spicegarden-logs.json`

### Log Access

```
OpenSearch: http://localhost:9200
OpenSearch Dashboards: http://localhost:5601
```

## Structured Logging

### Logger Service

**File:** `apps/backend/src/logging/logging.service.ts`

Features:
- Structured JSON logging
- Log levels (error, warn, info, debug)
- Correlation ID support
- PII sanitization via `sanitizeForLog()`

### Log Format

```typescript
{
  "level": "info",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "context": "OrderService",
  "message": "Order created",
  "correlationId": "uuid",
  "userId": "uuid",
  "orderId": "uuid",
  "duration": 150
}
```

### PII Sanitization

```typescript
sanitizeForLog(data: any): any {
  // Removes: passwords, tokens, secrets, card numbers
  // Masks: emails, phone numbers, addresses
}
```

## Error Tracking (Sentry)

### Backend Sentry

**Initialization:** `apps/backend/src/main.ts:156-165`

```typescript
sentry.init({
  dsn: configService.get<string>("SENTRY_DSN"),
  tracesSampleRate: 1.0,
});
```

### Frontend Sentry

**Restaurant Dashboard:** `apps/restaurant-dashboard/sentry.config.ts`
**Super Admin:** `apps/super-admin/sentry.config.ts`

### Error Boundary

**Component:** `packages/ui/ErrorBoundary.tsx`

- Class-based boundary
- Fallback UI with retry
- Error details capture

## Service Health

### Health Check Endpoint

```
GET http://localhost:3001/health
```

### Kubernetes Probes

**File:** `infra/k8s/production-hardened.yaml`

| Probe | Path | Initial Delay | Period |
|-------|------|---------------|--------|
| Liveness | /health | 40s | 30s |
| Readiness | /health | 10s | 10s |
| Startup | /health | 10s | 10s |

## Infrastructure Monitoring

### Docker Compose Health Checks

All services include health checks:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- MongoDB: `mongosh --eval db.adminCommand('ping')`
- Backend: `curl -f http://localhost:3001/health`
- Frontends: `curl -f http://localhost:3000/`

### Stack Verification

**Script:** `infra/scripts/verify-stack.js`

Checks all 7 infrastructure services:
- PostgreSQL (5432)
- Redis (6379)
- MongoDB (27017)
- Prometheus (9090)
- Grafana (3000)
- OpenSearch (9200)
- Alertmanager (9093)

## Key Metrics to Monitor

### Application Metrics

| Metric | Type | Alert Threshold |
|--------|------|-----------------|
| `http_requests_total` | Counter | Error rate > 5% |
| `http_request_duration_seconds` | Histogram | p99 > 1s |
| Order creation rate | Counter | Sudden drop > 50% |
| Payment success rate | Counter | < 95% |
| Queue job failures | Counter | > 10/hour |

### Infrastructure Metrics

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| CPU usage | K8s/Prometheus | > 80% |
| Memory usage | K8s/Prometheus | > 85% |
| PostgreSQL connections | postgres_exporter | > 80% max |
| Redis memory | redis_exporter | > 80% max |
| Disk usage | node_exporter | > 85% |

### Business Metrics

- Order volume per hour
- Average order value
- Delivery completion rate
| Refund rate | Alert if > 5% |
| Driver acceptance rate | Alert if < 70% |

## Troubleshooting

### Metrics Not Appearing

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check backend metrics endpoint
curl http://localhost:3001/metrics | head -20

# Verify registry
```

### Dashboard Not Loading

```bash
# Check Grafana provisioning
docker logs spicegarden-grafana

# Verify datasource
curl http://admin:admin@localhost:3000/api/datasources
```

### Alerts Not Firing

```bash
# Check Alertmanager config
curl http://localhost:9093/api/v1/alerts

# Verify Prometheus rules loaded
curl http://localhost:9090/api/v1/rules
```
