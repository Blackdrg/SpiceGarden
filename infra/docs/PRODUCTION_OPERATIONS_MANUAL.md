# SPICEGARDEN — PRODUCTION OPERATIONS MANUAL (PHASE E)

> **DOCUMENT CLASSIFICATION**: CONFIDENTIAL / ENTERPRISE PRODUCTION OPERATIONS  
> **APPLIES TO**: SPICEGARDEN V1.0.0+ PRODUCTION RUNTIME STACK  
> **OWNER**: SITE RELIABILITY ENGINEERING (SRE) & CLOUD OPERATIONS

---

## 1. PRODUCTION MONITORING ARCHITECTURE

SpiceGarden observability is built upon a unified Prometheus, Grafana, OpenSearch, and Filebeat telemetry pipeline:

```text
               +-----------------------------------------+
               |         Kubernetes Cluster (EKS)        |
               |                                         |
               |   [ Backend Pods ]   [ Workers / BullMQ]|
               |          │                     │        |
               +──────────┼─────────────────────┼────────+
                          │ /metrics            │ /metrics
                          ▼                     ▼
               +─────────────────────────────────────────+
               |        Prometheus Server (:9090)        |
               +────────────────────┬────────────────────+
                                    │ Alerts
                                    ▼
               +─────────────────────────────────────────+
               |        Alertmanager (:9093)             |
               |  (Slack / PagerDuty / Opsgenie / SMS)   |
               +────────────────────┬────────────────────+
                                    │
                                    ▼
               +─────────────────────────────────────────+
               |       Grafana Dashboards (:3000)        |
               |  - API Overview & Golden Signals        |
               |  - Kitchen Display & Rider Fleet        |
               |  - Aurora DB & Redis Cluster Vitals     |
               +─────────────────────────────────────────+
```

### Key Metrics Monitored:
1. **Golden Signals**:
   - **Latency**: P50, P90, P95, P99 request durations partitioned by HTTP route and status code.
   - **Traffic**: Ingress RPS, WebSocket active connections, BullMQ enqueue rate.
   - **Errors**: 5xx error rate percentage, unhandled exception count, database deadlocks.
   - **Saturation**: CPU/Memory utilization, PostgreSQL connection pool queue depth, Redis memory saturation.
2. **Business Telemetry**:
   - Live Order Volume (orders/sec) & Order Confirmation SLA.
   - Payment Capture Success Ratio (>99.5% threshold).
   - Driver GPS Ingestion Rate (pings/sec) & Active Courier Session Count.

---

## 2. PRODUCTION ALERTING & ESCALATION MATRIX

Alerts are routed through **Alertmanager** ([alertmanager.yml](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/alertmanager/alertmanager.yml)) with automated severity triage:

| Severity Level | Response Time | Target Channel | Example Trigger Conditions |
|---|---|---|---|
| **P1 — CRITICAL** | `< 5 minutes` | PagerDuty On-Call + SMS + `#ops-critical` | `DatabaseDown`, `HighErrorRate (>5% 5xx)`, `PaymentFailures (>5/min)` |
| **P2 — HIGH** | `< 15 minutes` | PagerDuty + Slack `#ops-high` | `HighLatency (P95 > 1s)`, `QueueSaturation (>5,000 backlog)`, `DiskUsage (>85%)` |
| **P3 — WARNING** | `< 1 hour` | Slack `#ops-warnings` | `RedisMemoryHigh (>80%)`, `MapsApiQuota (>80%)`, `SMSFallbackTriggered` |
| **P4 — INFO** | Next Business Day | Email / Jira Backlog | `DailyBackupCompleted`, `CertRenewalNotice`, `WeeklyCostSummary` |

---

## 3. BACKUP STRATEGY & LIFECYCLE MANAGEMENT

Automated backups are executed via cron schedules across storage layers:

```text
PostgreSQL (Aurora)    ──> Continuous WAL Archiving + Daily Snapshot (02:00 UTC) ──> S3 Encrypted (KMS)
MongoDB (Audit Logs)   ──> Daily Mongodump (02:30 UTC) ───────────────────────────> S3 Encrypted (KMS)
Redis (ElastiCache)    ──> Daily RDB Snapshot (03:00 UTC) ────────────────────────> S3 Encrypted (KMS)
```

### Backup Execution Commands:
- **Windows (PowerShell)**: `powershell -File infra/scripts/backup.ps1 -BackupDir C:\backup`
- **Linux (Bash)**: `bash infra/scripts/backup.sh`

### S3 Storage Lifecycle Tiers:
- **0–7 Days**: S3 Standard (Immediate restore).
- **8–30 Days**: S3 Standard-IA (Infrequent Access, warm tier).
- **31–365 Days**: S3 Glacier Flexible Retrieval (Cold compliance storage).
- **> 365 Days**: Automatic Purge (per GDPR/CCPA data retention policy).

---

## 4. RESTORE & POINT-IN-TIME RECOVERY (PITR)

### Recovery Point Objective (RPO) & Recovery Time Objective (RTO):
- **Target RPO**: `< 1 minute` (via PostgreSQL Write-Ahead Logging replication).
- **Target RTO**: `< 15 minutes` (Automated restoration pipeline).

### Database Restore Step-by-Step Procedure:
1. **Stop Traffic / Place in Maintenance Mode**:
   ```bash
   kubectl scale deployment spicegarden-backend --replicas=0
   ```
2. **Execute Database Restoration**:
   ```bash
   bash infra/scripts/restore.sh --date 2026-10-03 --target-time "2026-10-03T14:30:00Z"
   ```
3. **Verify Relational Integrity**:
   - Run verification query: `SELECT COUNT(*) FROM orders; SELECT COUNT(*) FROM payments;`
   - Ensure foreign key constraints and schema checksum match.
4. **Resume Application Pods**:
   ```bash
   kubectl scale deployment spicegarden-backend --replicas=10
   ```

---

## 5. DISASTER RECOVERY (DR) & REGIONAL FAILOVER

SpiceGarden implements a **Multi-Region Active-Passive (Warm Standby)** architecture between `us-east-1` (Primary) and `us-west-2` (Secondary Standby):

```text
               User Requests (DNS: api.spicegarden.com)
                                 │
                                 ▼
                     AWS Route 53 DNS Routing
                 (Health Checks & Failover Policy)
                   /                           \
         [Healthy: Primary]              [Failover: Secondary]
                 ▼                                 ▼
       Primary Region (us-east-1)        DR Region (us-west-2)
       - EKS (10-50 pods)                - EKS (2 pods warm standby)
       - Aurora Writer                   - Aurora Read Replica (Cross-Region)
       - Redis Primary                   - Redis Replica (Cross-Region)
```

### DR Failover Validation:
- Script: `powershell -File infra/scripts/disaster-recovery.ps1 -Environment production`
- **Automated Failover Steps**:
  1. Route 53 health check detects 3 consecutive failed probes (30s).
  2. Route 53 swings DNS records to `us-west-2` ALB.
  3. Aurora cross-region replica promoted to standalone Writer (`< 90s`).
  4. Kubernetes HPA in `us-west-2` scales pod replicas from 2 to 25 (`< 120s`).

---

## 6. ZERO-DOWNTIME ROLLBACK & CANARY PROCEDURES

All production deployments follow **Canary / Rolling Deployments** with automated rollback triggers:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spicegarden-backend
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0%
```

### Automated Rollback Triggers:
1. **HTTP 5xx Error Rate > 1.0%** for 2 consecutive minutes during release.
2. **P99 Response Latency > 800ms** on canary traffic.
3. **Container CrashLoopBackOff** on new revision pods.

### Immediate Rollback Command:
```bash
kubectl rollout undo deployment/spicegarden-backend
kubectl rollout status deployment/spicegarden-backend
```

---

## 7. PRODUCTION INCIDENT RUNBOOKS (SOPs)

### RUNBOOK 01: Database Connection Pool Saturation
- **Symptom**: `PostgresPoolExhaustionError`, slow queries, HTTP 504 Gateway Timeouts.
- **Immediate Mitigation**:
  1. Check active connections: `SELECT count(*), state FROM pg_stat_activity GROUP BY state;`
  2. Terminate long-running idle transactions: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < current_timestamp - INTERVAL '2 minutes';`
  3. Scale up read replicas or increase PgBouncer pool ceiling.

### RUNBOOK 02: Payment Gateway Outage
- **Symptom**: Alert `PaymentFailures > 5/min`, Stripe / Razorpay HTTP 502/504 errors.
- **Immediate Mitigation**:
  1. Verify upstream provider status via status page.
  2. Switch payment gateway routing flag: `PATCH /api/admin/system/payment-gateway { "activeProvider": "secondary" }`
  3. Frontend automatically switches checkout fallback method with zero user data loss.

### RUNBOOK 03: Redis Node Eviction & Hot-Key Contention
- **Symptom**: Cache miss spike, increased DB load, Redis memory alert (>85%).
- **Immediate Mitigation**:
  1. Identify hot keys: `redis-cli --hotkeys`
  2. Temporarily increase local memory cache TTL in backend pods to absorb read bursts.
  3. Trigger ElastiCache cluster horizontal shard scale-out.

---

## 8. CLOUD FINOPS & 3RD-PARTY COST MONITORING

Cost optimization safeguards prevent runaway infrastructure and external API expenditures:

| Service Domain | Cost Optimization Guardrails | Monthly Budget Cap |
|---|---|---|
| **AWS Compute (EKS)** | Cluster Autoscaler (Karpenter) with Spot instance mix (70% spot, 30% on-demand) | `$3,500 / mo` |
| **AWS Database (Aurora)** | Auto-scaling storage, automated snapshot pruning (7-day retention) | `$2,200 / mo` |
| **Google Maps API** | Multi-tier caching (24h TTL) achieving **>85% cache hit ratio**, reducing billable API hits | `$800 / mo` |
| **Twilio / SMS Gateway** | Duplicate suppression window (5 min) & OTP rate limiting (max 3/phone/hour) | `$600 / mo` |
| **TOTAL ESTIMATED OPEX** | **High-Density Optimized Multi-Tenant Infrastructure** | **`~$7,100 / mo`** |

---
**Approved by SpiceGarden Technical Operations & SRE Directorate**
