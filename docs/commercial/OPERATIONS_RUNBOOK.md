# SpiceGarden — Operations & Incident Response Runbook

## 1. Operational Supervision

### Health & Readiness Probes
| Endpoint | Purpose | Normal Response | Triage on Failure |
|---|---|---|---|
| `GET /health` | Basic process liveness | `{"status":"ok"}` | Check if Node.js process is responsive. |
| `GET /health/liveness` | Kubernetes liveness probe | `{"status":"ok"}` | Check for event-loop blocks or memory exhaustion. |
| `GET /health/readiness`| Dependency connectivity | `{"status":"ok","db":true,"redis":true}` | Inspect PostgreSQL and Redis connections. |
| `GET /metrics` | Prometheus metrics | OpenMetrics text | Check prometheus scraper and prom-client exporter. |

## 2. Common Incident Procedures

### Redis Unavailability / Failover
- **Behavior:** Backend falls back to in-memory rate limiting and logs warning: `[rate-limit] Redis unavailable, using process-local fallback`.
- **Action:**
  1. Check Redis pod status: `kubectl get pods -l app=redis`.
  2. Inspect Redis logs: `kubectl logs -l app=redis`.
  3. Reconnect client pools once Redis is restored.

### Database Connection Saturation
- **Behavior:** Increased latency on API endpoints; connection timeout errors in logs.
- **Action:**
  1. Inspect PostgreSQL active connections: `SELECT count(*) FROM pg_stat_activity;`.
  2. Verify TypeORM pool size in `.env` (`DATABASE_POOL_MAX`).
  3. Scale PgBouncer or adjust connection pool allocations.

### BullMQ Queue Backlog
- **Behavior:** Notifications or async dispatch tasks experience delayed delivery.
- **Action:**
  1. Check queue depths via BullMQ dashboard or Redis CLI: `LLEN bull:order-processing:wait`.
  2. Scale background worker replicas: `kubectl scale deployment/spicegarden-backend --replicas=5`.

## 3. Log Aggregation & Tracing
- Structured JSON logs formatted for ingestion into OpenSearch / Elasticsearch.
- Unhandled errors dispatched to Sentry via `@sentry/node` integration.
