# Operations Runbook

## Overview

This runbook provides operational procedures for monitoring, incident response, backup/recovery, and system verification for the SpiceGarden platform.

## Health Check Endpoints

### Backend Health Endpoint

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "mongodb": "connected"
  }
}
```

### Metrics Endpoint

**Endpoint:** `GET /metrics`

Provides Prometheus-formatted metrics including:
- HTTP request duration histograms
- Queue length and processing metrics
- Database connection pool stats
- Cache hit/miss ratios

```bash
# Check health
curl -s http://localhost:3001/health | jq

# Fetch metrics
curl -s http://localhost:3001/metrics | head -20
```

## Monitoring Stack Access

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Grafana | 3000 | http://localhost:3000 | Dashboards |
| Prometheus | 9090 | http://localhost:9090 | Metrics query |
| Alertmanager | 9093 | http://localhost:9093 | Alert management |
| OpenSearch | 9200 | http://localhost:9200 | Log storage |
| OpenSearch Dashboards | 5601 | http://localhost:5601 | Log visualization |

### Grafana Dashboards

**Location:** `infra/grafana/provisioning/dashboards/`

Dashboards are provisioned via `provider.yml`:
```yaml
apiVersion: 1
providers:
  - name: 'spicegarden'
    orgId: 1
    folder: 'SpiceGarden'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /etc/grafana/provisioning/dashboards
```

### Prometheus Rules

**Location:** `infra/prometheus/rules/`

| File | Purpose |
|------|---------|
| `alerts.yml` | Alert definitions |
| `slos.yml` | Service level objectives |

### Alertmanager Configuration

**File:** `infra/alertmanager/alertmanager.yml`

| Receiver | Type |
|----------|------|
| `slack-notifications` | Slack webhook to #alerts |
| `pagerduty-notifications` | PagerDuty escalation |

## Log Aggregation

### Filebeat Configuration

**File:** `infra/filebeat/filebeat.yml`

Logs are aggregated to OpenSearch:
```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/spicegarden/*.log
    fields:
      service: backend
output.elasticsearch:
  hosts: ["opensearch:9200"]
```

### Log Retention Policy
- Application logs: 30 days
- Audit logs: 90 days
- Security logs: 180 days

## Incident Response Workflow

### Detection
1. Alert triggered via Prometheus rule
2. Alertmanager routes to Slack/PagerDuty
3. On-call engineer acknowledges

### Triage
```bash
# Check service status
kubectl get pods -n spicegarden

# Check logs
kubectl logs -n spicegarden spicegarden-backend-0 --tail=100

# Check resource usage
kubectl top pods -n spicegarden
```

### Escalation
| Severity | Response Time | Escalation |
|----------|---------------|------------|
| Critical | 15 minutes | Page on-call |
| Warning | 1 hour | Slack #alerts |
| Info | 4 hours | Ticket |

## Backup and Restore Procedures

### Backup Script

**File:** `infra/scripts/backup.sh`

```bash
# Run manual backup
bash infra/scripts/backup.sh

# Backup includes:
# - PostgreSQL database dump
# - MongoDB dump
# - Redis RDB snapshot
# - Configuration files
```

### Automated Backups

**Kubernetes CronJob:** `spicegarden-backup`

- Schedule: Daily at 2:00 UTC (`"0 2 * * *"`)
- Retention: 3 successful, 5 failed jobs

### Disaster Recovery

**Script:** `infra/scripts/disaster-recovery.sh`

```bash
# Restore production from backup
bash infra/scripts/disaster-recovery.sh --production

# Restore staging from backup
bash infra/scripts/disaster-recovery.sh --staging
```

### Recovery Steps
1. Identify backup timestamp
2. Stop application pods
3. Restore database from dump
4. Validate data integrity
5. Restart services

## Log Rotation and Retention

### Logrotate Configuration
```bash
# /etc/logrotate.d/spicegarden
/var/log/spicegarden/*.log {
  daily
  rotate 30
  compress
  delaycompress
  missingok
  notifempty
}
```

### Retention Schedule
| Log Type | Retention |
|----------|-----------|
| Application | 30 days |
| Access logs | 90 days |
| Security events | 180 days |
| Audit trails | 365 days |

## Stack Verification

### Verify Stack Script

**File:** `infra/scripts/verify-stack.js`

```bash
# Run stack verification
node infra/scripts/verify-stack.js

# Checks:
# - Backend reachable on port 3001
# - Grafana reachable on port 3000
# - Prometheus reachable on port 9090
# - OpenSearch reachable on port 9200
```

### Manual Verification
```bash
# Backend
curl -f http://localhost:3001/health

# Grafana
curl -f http://localhost:3000/api/health

# Prometheus
curl -f http://localhost:9090/-/healthy

# OpenSearch
curl -f http://localhost:9200/_cluster/health
```

## Production Validation Scripts

### Autoscaling Validation

```bash
bash infra/scripts/autoscaling-validation.sh production
```

### Environment Validation

```bash
# Validate environment consistency
node infra/scripts/validate-env-consistency.js

# Validate secrets
node infra/scripts/validate-secrets.js
```

## On-Call Escalation

### Rotation Schedule
- Primary: Backend engineer
- Secondary: DevOps engineer
- Manager escalation: After 30 minutes unresolved

### Contact Information
| Role | Contact |
|------|---------|
| On-call Engineer | Configured in Alertmanager |
| Slack #alerts | Internal channel |
| PagerDuty | Production incidents |

## Daily Operations Checklist

- [ ] Check `/health` endpoint responses
- [ ] Review Grafana dashboards for anomalies
- [ ] Verify backup job completed successfully
- [ ] Check disk space on all nodes
- [ ] Review error rate in Prometheus
- [ ] Validate SSL certificate expiry

## Weekly Operations Checklist

- [ ] Review alert history and tune thresholds
- [ ] Run penetration tests
- [ ] Validate log rotation
- [ ] Check Redis memory usage
- [ ] Review database slow query log

## Monthly Operations Checklist

- [ ] Run load tests (Stage 3 - 10k users)
- [ ] Rotate secrets via `infra/scripts/secrets-rotation.ps1.js`
- [ ] Disaster recovery drill
- [ ] Update Grafana dashboards if needed

## Kubernetes Operations

### Deployment Commands

```bash
# Deploy staging
kubectl apply -f infra/k8s/staging.yaml

# Deploy production
kubectl apply -f infra/k8s/production-hardened.yaml

# Deploy CDN/Ingress
kubectl apply -f infra/k8s/cdn-ingress.yaml
```

### Pod Management

```bash
# Check pod status
kubectl get pods -n spicegarden

# View pod logs
kubectl logs -n spicegarden -l app=spicegarden-backend

# Restart deployment
kubectl rollout restart deployment/spicegarden-backend -n spicegarden
```

### HPA Monitoring

```bash
# Check HPA status
kubectl get hpa -n spicegarden

# Describe HPA for details
kubectl describe hpa spicegarden-backend-hpa -n spicegarden
```

## Service Dependencies

| Service | Port | Dependency |
|---------|------|------------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache and queues |
| MongoDB | 27017 | Document storage |
| Backend | 3001 | API server |

## Service Level Objectives (SLOs)

| Metric | SLO | Alert Threshold |
|--------|-----|-----------------|
| Availability | 99.9% | 99% |
| Request latency (p95) | <500ms | <1s |
| Error rate | <1% | >5% |
| Queue processing time | <30s | >60s |