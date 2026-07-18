# Monitoring, Logging & Alerting Guide

**Version:** 1.0.0
**Services (enable with observability profile):** Prometheus (9090), Grafana (3000), OpenSearch (9200), Alertmanager (9093).

## 1. Metrics (Prometheus)
- Scrape: backend `/metrics` (NestJS prom client).
- Key SLIs: request rate, p95/p99 latency, error rate (5xx), queue depth (BullMQ), DB connection pool, Redis memory.
- Dashboards provisioned from `infra/grafana/dashboards`.

## 2. Logs (OpenSearch)
- Structured JSON logs from all services → OpenSearch via Filebeat/fluentd.
- Retention: 30 days hot, 90 days warm (per Data Retention Policy).
- Query patterns: `level:error`, `trace_id`, `user_id`, `order_id`.

## 3. Alerts (Alertmanager)
- Rules: `infra/prometheus/rules/*.yml`.
- Critical: 5xx > 1% for 5 min, p99 > 2 s, queue depth growing, DB down, Redis down, migration pending.
- Routing: P1 → page on-call; P2 → Slack #alerts; P3 → ticket.

## 4. SLO / Error budget
- Availability SLO 99.9% (see `RELIABILITY_TESTING.md`).
- Error budget burn alerts at 14×/1h and 7×/6h.

## 5. On-call
- See `RELIABILITY_TESTING.md` escalation matrix.
- Run `docs/ops/incident-playbook.md` on any P1.
