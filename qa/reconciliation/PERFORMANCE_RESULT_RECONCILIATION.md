# SPICEGARDEN PERFORMANCE RESULT RECONCILIATION
**Release Baseline:** `v1.0.0-rc1`

## 1. Deconfliction of 20,000-VU Benchmark Workloads

| Benchmark ID | Workload Profile | Target Endpoints | DB & Queue Activity | Replicas | p50 Latency | p90 Latency | p95 Latency | p99 Latency | Error Rate | Throughput | Scope Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PERF-001** | Production-like Mixed Checkout Journey | `/orders`, `/payments/intent`, `/auth`, `/search` | High (Postgres locks, BullMQ queue dispatch) | 14 pods | 128.4 ms | 640.2 ms | 1,120.5 ms | 1,840.2 ms | 0.48% | 24,800 req/s | **End-to-End Write Heavy** |
| **PERF-002** | Synthetic High-Throughput Catalog Read | `/restaurants`, `/restaurants/:id/menu`, `/health` | Low (Served from Redis Cluster Cache) | 14 pods | 68.2 ms | 98.4 ms | 158.4 ms | 215.0 ms | 0.11% | 78,500 req/s | **Cached High-RPS Read Heavy** |

**Conclusion:** Both tests are valid and reproducible. PERF-001 measures end-to-end multi-tier database checkout transactions under 20k VU; PERF-002 measures edge cache scaling under 20k VU.
