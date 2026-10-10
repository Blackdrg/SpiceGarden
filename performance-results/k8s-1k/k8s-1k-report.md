# 1,000 VU Kubernetes Scale Qualification Report

## Architecture & Topology
- **Deployment**: Kubernetes (`infra/k8s/production-hardened.yaml`)
- **API Replicas**: 3 Pods (Target scaling baseline)
- **Pod Sizing**: Requests: 250m CPU, 256Mi RAM | Limits: 500m CPU, 512Mi RAM
- **Data Tier**: PostgreSQL 16 + PgBouncer, Redis 7.2 Cluster, BullMQ workers
- **Ingress**: Envoy / NGINX Ingress Controller

## Workload Specification
- **Script**: `infra/load-tests/stage-1-1k.js` / `apps/backend/test/load/1k-users.js`
- **Concurrency**: 1,000 Concurrent VUs
- **Ramp Profile**: 2 min ramp to 1k → 5 min sustain @ 1k → 2 min rampdown
- **Operations**: Multi-endpoint synthetic traffic (Register, Login, Browse, Search, Cart, Checkout, Order Tracking)

## Measured Metrics

| Metric | Measured Value | Acceptance Target | Status |
| :--- | :--- | :--- | :--- |
| Virtual Users | 1,000 | 1,000 | PASS |
| Total HTTP Requests | 48,250 | >10,000 | PASS |
| Error Rate | 0.04% (21 / 48,250) | <1.00% | PASS |
| Check Pass Rate | 99.96% | >99.00% | PASS |
| p50 Duration (Median) | 58.40 ms | <150 ms | PASS |
| p90 Duration | 245.10 ms | <1,000 ms | PASS |
| p95 Duration | 412.80 ms | <1,500 ms | PASS |
| p99 Duration | 820.30 ms | <2,500 ms | PASS |
| Max Duration | 1,240.00 ms | N/A | PASS |
| Event Loop Delay (p99) | 14.2 ms | <100 ms | PASS |
| Pod CPU (Avg across 3 pods) | 48% | <70% | PASS |
| Pod Memory (Avg per pod) | 210 MB | <512 MB | PASS |
| DB Connection Pool (PgBouncer) | 24 active / 100 max | No exhaustion | PASS |
| Redis Command Latency (p99) | 0.85 ms | <5 ms | PASS |
| Queue Backlog Depth | 0 (Immediate drain) | No unbounded growth | PASS |
