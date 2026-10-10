# SpiceGarden v1.0.0-rc1 — Monitoring & Alert Handover Runbook

**Release**: `v1.0.0-rc1`  
**Classification**: **`ALERT RULES CONFIGURED — RECIPIENT NOTIFICATION BINDING PENDING`**  
**Audience**: Site Reliability Engineers (SRE), DevOps & On-Call Engineering  

---

## 1. Executive Summary

The observability subsystem of **SpiceGarden v1.0.0-rc1** provides comprehensive telemetry via Prometheus metrics exporters, OpenSearch structured JSON logs, and Grafana dashboard suites ([`infra/monitoring/dashboards`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/monitoring/dashboards)). 

All alert rules documented below are formally **CONFIGURED** in the Prometheus Rule definitions (`infra/monitoring/prometheus/alert-rules.yaml`). Live delivery to recipient-specific endpoints (PagerDuty, Slack, Opsgenie, Email) is classified as **HANDOVER PENDING** until the recipient binds their webhook routing keys in Alertmanager.

---

## 2. Production Alert Definitions Matrix

| Alert Name | Trigger Condition (PromQL) | Threshold | Severity | Alert State | Recipient Target | Runbook Reference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HighHttpErrorRate** | `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 1.0` | > 1.0% for 2m | CRITICAL | CONFIGURED | PagerDuty (Pending) | Check pod logs in OpenSearch for 5xx stack traces; inspect DB connection health. |
| **HighApiLatencyP95** | `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1.5` | > 1,500 ms for 3m | WARNING | CONFIGURED | Slack #alerts (Pending) | Check database slow query logs and Redis rate-limiting latency. |
| **HighApiLatencyP99** | `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2.5` | > 2,500 ms for 2m | CRITICAL | CONFIGURED | PagerDuty (Pending) | Check if HPA is actively scaling pods; check PgBouncer pool queue. |
| **EventLoopDelayHigh** | `nodejs_eventloop_lag_p99_seconds > 0.1` | > 100 ms for 1m | CRITICAL | CONFIGURED | PagerDuty (Pending) | Check CPU throttling on API pods; inspect `CryptoConcurrencyLimiter` queue depth. |
| **ApiCpuSaturation** | `sum(rate(container_cpu_usage_seconds_total{container="backend"}[5m])) by (pod) / sum(container_spec_cpu_quota{container="backend"}/100000) by (pod) > 0.85` | > 85% for 3m | WARNING | CONFIGURED | Slack #alerts (Pending) | Verify HPA scale-up; increase max replicas in `production-hardened.yaml` if needed. |
| **ApiMemorySaturation** | `container_memory_working_set_bytes{container="backend"} / container_spec_memory_limit_bytes{container="backend"} > 0.85` | > 85% for 5m | WARNING | CONFIGURED | Slack #alerts (Pending) | Check heap memory in Grafana; inspect for memory leak in long-lived socket sessions. |
| **PostgresPoolExhaustion** | `pg_stat_activity_count{state="active"} / pg_settings_max_connections * 100 > 90` | > 90% for 1m | CRITICAL | CONFIGURED | PagerDuty (Pending) | Check PgBouncer connection pool; restart hung transactions. |
| **PostgresSlowQueries** | `rate(pg_stat_database_xact_commit[5m]) < 10 and rate(pg_stat_database_xact_rollback[5m]) > 5` | Elevated rollbacks for 2m | WARNING | CONFIGURED | Slack #alerts (Pending) | Check PostgreSQL lock contention and TypeORM transaction timeout settings. |
| **RedisConnectionFailures** | `rate(redis_rejected_connections_total[1m]) > 0` | > 0 rejected | CRITICAL | CONFIGURED | PagerDuty (Pending) | Check Redis `maxclients` limit and memory eviction policy. |
| **RedisMemoryHigh** | `redis_memory_used_bytes / redis_memory_max_bytes * 100 > 85` | > 85% for 5m | WARNING | CONFIGURED | Slack #alerts (Pending) | Verify TTL expiration on rate-limit keys and cached menu items. |
| **BullMqQueueBacklog** | `bullmq_queue_waiting_jobs{queue="orders"} > 500` | > 500 jobs for 3m | WARNING | CONFIGURED | Slack #alerts (Pending) | Scale worker concurrency or increase API pod replica count. |
| **HpaAtMaxSaturation** | `kube_hpa_status_current_replicas == kube_hpa_spec_max_replicas` | Current = Max (20) for 10m | WARNING | CONFIGURED | Slack #alerts (Pending) | Increase HPA max replicas or provision additional Kubernetes worker nodes. |
| **PodCrashLooping** | `rate(kube_pod_container_status_restarts_total[15m]) > 0` | > 3 restarts in 15m | CRITICAL | CONFIGURED | PagerDuty (Pending) | Run `kubectl describe pod` and `kubectl logs --previous` to inspect fatal errors. |
| **AuthFailureSpike** | `sum(rate(http_requests_total{route="/auth/login",status="401"}[5m])) > 50` | > 50 failures/s for 2m | WARNING | CONFIGURED | Security Team (Pending) | Check for credential stuffing attack; verify Redis rate-limiter is actively blocking abusive IPs. |
| **PaymentWebhookFailures** | `sum(rate(http_requests_total{route=~"/api/v1/payments/.*/webhook",status=~"4..|5.."}[5m])) > 0` | > 0 failures for 2m | CRITICAL | CONFIGURED | PagerDuty (Pending) | Inspect webhook signature verification secrets and check payload logs. |

---

## 3. Recipient Alertmanager Setup Guide

To complete alert delivery binding:

1. Open `infra/monitoring/prometheus/alertmanager.yaml`.
2. Populate the recipient webhook receivers:
   ```yaml
   receivers:
     - name: 'pagerduty-critical'
       pagerduty_configs:
         - service_key: '<RECIPIENT_PAGERDUTY_INTEGRATION_KEY>'
           severity: 'critical'
     - name: 'slack-warnings'
       slack_configs:
         - api_url: '<RECIPIENT_SLACK_WEBHOOK_URL>'
           channel: '#spicegarden-alerts'
           send_resolved: true
   ```
3. Apply updated Alertmanager configuration:
   ```bash
   kubectl apply -f infra/monitoring/prometheus/alertmanager.yaml -n monitoring
   ```
4. Trigger a test notification via the Prometheus Web UI at `http://prometheus:9090/alerts`.
