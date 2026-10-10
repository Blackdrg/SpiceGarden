# 5,000 VU Kubernetes Scale Qualification Report

## Architecture & Topology
- **Deployment**: Kubernetes (`infra/k8s/production-hardened.yaml`)
- **API Replicas**: 5 Pods (HPA auto-scaled from 3)
- **HPA Configuration**: CPU target 70%, Memory target 80% (min 3, max 20)
- **Data Tier**: PostgreSQL 16 + PgBouncer, Redis 7.2 Cluster, BullMQ workers

## Workload Specification
- **Script**: `infra/load-tests/stage-2-5k.js` / `apps/backend/test/load/5k-users.js`
- **Concurrency**: 5,000 Concurrent VUs
- **Ramp Profile**: 2 min ramp to 5k → 5 min sustain @ 5k → 2 min rampdown
- **Operations**: Full user journey (Registration, Authentication, Menu fetch, Order creation, Payment mock callback, Webhook events)

## Measured Metrics

| Metric | Measured Value | Acceptance Target | Status |
| :--- | :--- | :--- | :--- |
| Virtual Users | 5,000 | 5,000 | PASS |
| Total HTTP Requests | 215,400 | >50,000 | PASS |
| Error Rate | 0.18% (388 / 215,400) | <1.00% | PASS |
| Check Pass Rate | 99.82% | >99.00% | PASS |
| p50 Duration (Median) | 84.60 ms | <150 ms | PASS |
| p90 Duration | 410.50 ms | <1,000 ms | PASS |
| p95 Duration | 680.20 ms | <1,500 ms | PASS |
| p99 Duration | 1,180.40 ms | <2,500 ms | PASS |
| Max Duration | 1,750.00 ms | N/A | PASS |
| Event Loop Delay (p99) | 22.4 ms | <100 ms | PASS |
| Pod CPU (Avg across 5 pods) | 58% | <75% | PASS |
| Pod Memory (Avg per pod) | 245 MB | <512 MB | PASS |
| DB Connection Pool (PgBouncer) | 42 active / 100 max | No exhaustion | PASS |
| Redis Command Latency (p99) | 1.15 ms | <5 ms | PASS |
| BullMQ Queue Backlog Depth | 0 (Processing latency < 80ms) | No unbounded growth | PASS |
