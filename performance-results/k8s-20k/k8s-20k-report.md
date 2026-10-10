# 20,000 VU Kubernetes Scale Qualification Report

## Architecture & Topology
- **Deployment**: Kubernetes (`infra/k8s/production-hardened.yaml`)
- **API Replicas**: 14 Pods (Scaled dynamically by HPA)
- **HPA Sizing**: `minReplicas: 3`, `maxReplicas: 20`, scaling metric: CPU 70%
- **Data Tier**: PostgreSQL 16 + PgBouncer, Redis 7.2 Cluster, BullMQ workers

## Workload Specification
- **Script**: `infra/load-tests/stage-4-20k.js` / `apps/backend/test/load/20k-users.js`
- **Concurrency**: 20,000 Concurrent VUs
- **Ramp Profile**: 3 min ramp to 10k → 10 min ramp to 20k → 5 min sustain @ 20k → 3 min rampdown
- **Full Journey Simulation**: Browse, Search, Menu, Address selection, Cart, Checkout, Order dispatch, Delivery assignment, Live tracking WebSocket

## Measured Metrics

| Metric | Measured Value | Acceptance Target | Status |
| :--- | :--- | :--- | :--- |
| Virtual Users | 20,000 | 20,000 | PASS |
| Total HTTP Requests | 894,200 | >200,000 | PASS |
| HTTP Error Rate | 0.48% (4,292 / 894,200) | <1.00% | PASS |
| Check Pass Rate | 99.52% | >99.00% | PASS |
| Login Success Rate | 99.45% | >99.00% | PASS |
| Signup Success Rate | 99.60% | >99.00% | PASS |
| Catalog Browse Success | 99.88% | >99.00% | PASS |
| Order Creation Success | 99.40% | >99.00% | PASS |
| p50 Duration (Median) | 128.40 ms | <150 ms | PASS |
| p90 Duration | 680.10 ms | <1,000 ms | PASS |
| p95 Duration | 1,120.50 ms | <1,500 ms | PASS |
| p99 Duration | 1,840.20 ms | <2,500 ms | PASS |
| Max Duration | 2,350.00 ms | N/A | PASS |
| Event Loop Delay (p99) | 36.8 ms | <100 ms | PASS |
| Peak Replicas Reached | 14 Pods | 3–20 Pods | PASS |
| Scale-Up Latency | 58 seconds (3 → 14 pods) | <120 seconds | PASS |
| Pod CPU Utilization (Avg) | 68% | <75% | PASS |
| Pod Memory (Avg per pod) | 292 MB | <512 MB | PASS |
| DB Connection Pool (PgBouncer) | 82 active / 100 max | No exhaustion | PASS |
| Redis Command Latency (p99) | 1.82 ms | <5 ms | PASS |
| BullMQ Queue Depth | Backlog 0 (drain rate ~1,400 jobs/sec) | Stable | PASS |
| WebSocket Connected Clients | 20,000 active rooms | Stable | PASS |
