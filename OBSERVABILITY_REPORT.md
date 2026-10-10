# Observability Report

**Date:** 2026-06-26
**Scope:** SpiceGarden Observability Stack
**Classification:** Evidence-based

## Metrics Stack

### Prometheus

**File:** `infra/prometheus/prometheus.dev.yml`
**Image:** prom/prometheus:v2.51.0
**Port:** 9090

**Targets Configured:**
- backend:3001 (backend service)
- postgres:9187 (PostgreSQL exporter)
- redis:9121 (Redis exporter)

### Metrics Endpoint

**Location:** `src/main.ts:250-253`
**Endpoint:** `/metrics`
**Format:** Prometheus text format

**Custom Metrics:**
```javascript
httpRequestCounter: Counter
  - Labels: method, route, status_code
  - Purpose: Request counting

httpRequestDuration: Histogram
  - Labels: method, route, status_code
  - Buckets: 5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s
```

## Dashboards

### Grafana

**File:** `infra/grafana/dashboards/spicegarden.json`
**Image:** grafana/grafana-enterprise:10.4.0
**Port:** 3000

**Panels:** 8 configured panels

**Data Sources:**
- Prometheus (metrics)
- OpenSearch (logs)

**Provisioning:**
- `infra/grafana/provisioning/datasources/datasources.yml`
- `infra/grafana/provisioning/dashboards/provider.yml`

## Alerting

### Alertmanager

**File:** `infra/alertmanager/alertmanager.yml`
**Image:** prom/alertmanager:v0.27.0
**Port:** 9093

**Integrations:**
- Slack webhook (optional)
- PagerDuty routing key (optional)

### Alert Rules

**Files:**
- `infra/prometheus/rules/alerts.yml`
- `infra/prometheus/rules/slos.yml`

## Logging

### OpenSearch

**Image:** opensearchproject/opensearch:2.15.0
**Ports:** 9200, 9300
**Dashboards:** 5601

**Index Template:** `infra/opensearch/index-templates/spicegarden-logs.json`

### Filebeat

**File:** `infra/filebeat/filebeat.yml`
**Purpose:** Log shipping to OpenSearch

## Health Checks

### Backend

**Endpoint:** `/health` (HTTP GET)
**Response:** 200 OK when service healthy

**Checks Performed:**
- Database connectivity (PostgreSQL)
- Database connectivity (MongoDB)
- Redis connectivity
- Service status

## Metrics Collection Points

From `src/main.ts:256-266`:

```javascript
// Request duration tracking
httpRequestDuration.observe({ method, route, status_code }, duration);

// Request counter
httpRequestCounter.inc({ method, route, status_code });
```

## NOT VERIFIED

- Live metrics rendering in Grafana
- Alert firing behavior
- Log ingestion into OpenSearch
- Dashboard panel functionality