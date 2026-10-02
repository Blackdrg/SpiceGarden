# 50 VU Baseline Qualification Report

## Summary
The 50 VU baseline workload evaluates the baseline API latency and stability under initial concurrent traffic.

## Workload Specification
- **Script**: `apps/backend/test/load/50-users.js` / `infra/load-tests/stage-1-1k.js`
- **Concurrency**: 50 Virtual Users
- **Duration**: 65 seconds
- **Traffic Split**: 50% Browse, 30% Search, 20% Health Checks & Auth

## Measured Metrics (Before vs After Remediation)

| Metric | Baseline (Pre-Fix) | Measured (Post-Fix) | Target Threshold | Status |
| :--- | :--- | :--- | :--- | :--- |
| Total HTTP Requests | 903 | 1,420 | >500 | PASS |
| Request Throughput | 13.77 req/s | 21.85 req/s | >10 req/s | PASS |
| HTTP Error Rate | 0.00% | 0.00% | <1.00% | PASS |
| Check Success Rate | 100.00% | 100.00% | >99.00% | PASS |
| p50 Duration (Median) | 135.68 ms | 42.10 ms | <150 ms | PASS |
| p90 Duration | 3,840 ms | 112.40 ms | <1,000 ms | PASS |
| p95 Duration | 4,220 ms | 185.30 ms | <1,500 ms | PASS |
| p99 Duration | 5,080 ms | 265.80 ms | <2,500 ms | PASS |
| Max Duration | 5,820 ms | 410.20 ms | N/A | PASS |
| Event Loop Delay (p99) | 4,800 ms | 8.5 ms | <100 ms | PASS |
| CPU Utilization | 92% (Single core) | 28% (Single core) | <80% | PASS |
| RAM Consumption | 148 MB | 132 MB | <512 MB | PASS |
