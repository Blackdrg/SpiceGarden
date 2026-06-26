# Monitoring Reference

**Version:** 1.0.0
**Date:** 2026-06-26
**Classification:** Verified from source code

## Observability Stack

| Component | Purpose | Port | Config |
|-----------|---------|------|--------|
| Prometheus | Metrics collection | 9090 | `infra/prometheus/prometheus.yml` |
| Grafana | Metrics visualization | 3000 | `infra/grafana/provisioning/` |
| Alertmanager | Alert routing | 9093 | `infra/alertmanager/alertmanager.yml` |
| Sentry | Error tracking | - | SDK in backend |
| OpenSearch | Log aggregation | 9200 | `infra/opensearch/index-templates/` |
| Filebeat | Log shipping | - | `infra/filebeat/filebeat.yml` |

## Prometheus Metrics

### Custom Metrics (Backend)

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `http_requests_total` | Counter | method, route, status_code | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | method, route, status_code | Request latency |
| `nodejs_heap_size_total_bytes` | Gauge | - | Node.js heap size |
| `nodejs_event_loop_lag_seconds` | Gauge | - | Event loop lag |
| `nodejs_active_handles_total` | Gauge | - | Active handles |
| `nodejs_active_requests_total` | Gauge | - | Active requests |

### Metric Endpoints

| Endpoint | Auth | Format |
|----------|------|--------|
| `GET /metrics` | No | Prometheus text format |

### Default Metrics
Enabled via `prom-client` `collectDefaultMetrics()`:
- Event loop lag
- Heap size (used, total, limit)
- Active handles/requests
- CPU stats

## Prometheus Configuration

### Global (`infra/prometheus/prometheus.yml`)
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - /etc/prometheus/rules/alerts.yml
  - /etc/prometheus/rules/slos.yml
```

### Scrape Jobs

| Job | Target | Interval |
|-----|--------|----------|
| spicegarden-backend | spicegarden:3001/metrics | 10s |
| prometheus | localhost:9090/metrics | 15s |

### Alert Rules (`infra/prometheus/rules/alerts.yml`)

| Alert | Condition | Severity |
|-------|-----------|----------|
| HighErrorRate | HTTP 5xx rate > 5% | critical |
| HighLatency | p99 latency > 2s | warning |
| DatabaseDown | PostgreSQL unreachable | critical |
| RedisDown | Redis unreachable | critical |
| HighMemoryUsage | Memory > 90% | warning |
| HighCPUUsage | CPU > 80% | warning |
| PodCrashLooping | Pod restarting > 3x | critical |
| CertificateExpiry | TLS cert expiring < 7 days | warning |

### SLO Rules (`infra/prometheus/rules/slos.yml`)

| SLO | Target |
|-----|--------|
| Availability | 99.9% |
| Latency (p99) | < 500ms |
| Error Rate | < 0.1% |

## Grafana Dashboards

### Provisioned Dashboards
- Location: `infra/grafana/dashboards/`
- Auto-provisioned via `infra/grafana/provisioning/dashboards/provider.yml`

### Datasources
- Prometheus: Auto-configured
- OpenSearch: Auto-configured

### Key Panels
1. Request rate (RPS)
2. Error rate (4xx, 5xx)
3. Latency (p50, p95, p99)
4. Active connections
5. Database query time
6. Redis hit rate
7. Queue depth (BullMQ)
8. WebSocket connections

## Alertmanager Configuration

### Receivers

| Receiver | Integration | Channel |
|----------|-------------|---------|
| slack-notifications | Slack | #spicegarden-alerts |
| pagerduty-notifications | PagerDuty | On-call team |

### Routing
```yaml
route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 3h
  receiver: 'slack-notifications'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-notifications'
```

### Inhibit Rules
- Critical alerts inhibit warning alerts for same service
- Database down inhibits dependent service alerts

## Sentry Integration

### Configuration
- DSN: `SENTRY_DSN` environment variable
- Environment: `SENTRY_ENVIRONMENT`
- Release: `SENTRY_RELEASE`

### Features
- Error tracking with stack traces
- Performance monitoring (tracesSampleRate: 1.0)
- Release tracking
- Source map support

### Backend Integration (`apps/backend/src/main.ts:156-165`)
```typescript
sentry.init({ dsn, tracesSampleRate: 1.0 });
app.use(sentry.Handlers.requestHandler);
app.use(sentry.Handlers.tracingHandler);
app.use(sentry.setupExpressErrorHandler());
```

## OpenSearch Logging

### Index Template
- Template: `infra/opensearch/index-templates/spicegarden-logs.json`
- Settings: 1 replica, 1 shard
- Mappings: timestamp, level, message, service, metadata

### Log Shipping
- Filebeat config: `infra/filebeat/filebeat.yml`
- Excludes: node_modules, dist, .git

### Key Log Fields
- `timestamp` — Event time
- `level` — Log level (error, warn, info, debug)
- `service` — Service name (backend, frontend, etc.)
- `message` — Log message
- `metadata` — Structured context
- `userId` — User ID (if authenticated)
- `traceId` — Distributed trace ID

## Logging Service

### Implementation
- Module: `apps/backend/src/logging/logging.module.ts`
- Service: `apps/backend/src/logging/logging.service.ts`

### Features
- Structured JSON logging
- Sensitive data sanitization (`sanitizeForLog()`)
- Configurable log levels

## Key Metrics to Monitor

### Application Metrics
- Request rate (RPS)
- Error rate (4xx, 5xx)
- Response time (p50, p95, p99)
- Active WebSocket connections
- Queue depth and processing time
- Database query performance

### Infrastructure Metrics
- CPU utilization
- Memory utilization
- Disk I/O
- Network I/O
- Pod restart count

### Business Metrics
- Orders per minute
- Payment success rate
- Delivery completion rate
- Active users
- Restaurant availability

## Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| HTTP 5xx rate | > 2% | > 5% |
| p99 latency | > 1s | > 2s |
| Memory usage | > 80% | > 95% |
| CPU usage | > 70% | > 90% |
| Pod restarts | > 2 | > 5 |
| Queue depth | > 1000 | > 5000 |
| DB connections | > 80% max | > 95% max |

## Dashboard URLs (Development)

| Service | URL |
|---------|-----|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |
| Alertmanager | http://localhost:9093 |
| OpenSearch | http://localhost:9200 |
| OpenSearch Dashboards | http://localhost:5601 |

## Health Checks

### Backend
```
GET /health
Response: { "status": "ok", "timestamp": "ISO8601" }
```

### Infrastructure
```bash
npm run verify:stack
# Checks: PostgreSQL, MongoDB, Redis, Backend, Prometheus, Grafana, OpenSearch
```

## Log Retention

| Source | Retention |
|--------|-----------|
| Prometheus | 15 days (default) |
| OpenSearch | 30 days (configurable) |
| Application logs | 7 days |
| Audit logs | 3 years (compliance) |
