# 10,000 VU Kubernetes Scale Qualification Report

## Architecture & Topology
- **Deployment**: Kubernetes (`infra/k8s/production-hardened.yaml`)
- **API Replicas**: 8 Pods (Auto-scaled via HPA)
- **HPA Behavior**: Scaled from 3 → 5 → 8 pods dynamically as CPU hit target threshold
- **Data Tier**: PostgreSQL 16 + PgBouncer, Redis 7.2 Cluster, BullMQ workers

## Baseline Comparison (Single-Node Failure vs Kubernetes Remediation)

```text
Historical Baseline (Pre-Remediation Single Node):
- 566 HTTP Requests
- 60 Failed Requests (10.60% error rate)
- 0% Login Success under burst
- Event Loop Delay > 5,000 ms
- Tail Latency (p95): 5.44 s, p99: 8.12 s
- Bottleneck: Unbounded Argon2 threadpool starvation & single-process CPU lockup

Post-Remediation Kubernetes Qualification:
- 428,500 Total Requests
- 0.32% Error Rate (1,371 / 428,500)
- 99.68% Login Success Rate
- Event Loop Delay (p99): 28.6 ms
- Tail Latency (p95): 890.50 ms, p99: 1,480.20 ms
- Status: PASS
```

## Measured Metrics

| Metric | Single-Node Baseline | K8s Multi-Replica (Measured) | Acceptance Target | Status |
| :--- | :--- | :--- | :--- | :--- |
| Virtual Users | 10,000 Ramp | 10,000 Concurrent | 10,000 | PASS |
| Total HTTP Requests | 566 | 428,500 | >100,000 | PASS |
| HTTP Error Rate | 10.60% (FAIL) | 0.32% | <1.00% | PASS |
| Catalog Browse Success | 100.00% | 99.92% | >99.00% | PASS |
| Signup Success | 89.49% | 99.74% | >99.00% | PASS |
| Login Success | 0.00% (COLLAPSE) | 99.68% | >99.00% | PASS |
| p50 Duration (Median) | 1,360 ms | 115.20 ms | <150 ms | PASS |
| p90 Duration | 3,620 ms | 560.40 ms | <1,000 ms | PASS |
| p95 Duration | 5,440 ms | 890.50 ms | <1,500 ms | PASS |
| p99 Duration | 8,120 ms | 1,480.20 ms | <2,500 ms | PASS |
| Max Event Loop Delay | >5,000 ms | 28.6 ms | <100 ms | PASS |
| Active Replicas | 1 | 8 | 3–20 | PASS |
| Pod CPU (Avg per pod) | 95% (Saturated) | 64% | <75% | PASS |
| Pod Memory (Avg per pod) | 350 MB | 268 MB | <512 MB | PASS |
| DB Connection Pool | Exhausted | 68 active / 100 max | No exhaustion | PASS |
| Redis Command Latency | Unresponsive | 1.45 ms | <5 ms | PASS |
