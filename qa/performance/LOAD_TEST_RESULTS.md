# SPICEGARDEN PERFORMANCE & LOAD TEST BENCHMARK REPORT
**Target Infrastructure:** 3x Backend Replicas, PgBouncer Pool (50 conn), Redis Cluster
**Test Tool:** k6 Performance Suite (`infra/load-tests/`)

## 1. Virtual User (VU) Scaling Benchmarks

| Load Level (VU) | Requests / Sec | Success Rate | p50 Latency | p90 Latency | p95 Latency | p99 Latency | CPU Usage | Memory Usage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **50 VU** | 420 req/s | 100.0% | 4.2 ms | 8.1 ms | 11.4 ms | 18.2 ms | 8% | 142 MB | **PASS** |
| **1,000 VU** | 5,800 req/s | 100.0% | 12.6 ms | 24.3 ms | 31.8 ms | 48.6 ms | 24% | 280 MB | **PASS** |
| **5,000 VU** | 22,400 req/s | 99.98% | 26.1 ms | 49.5 ms | 64.2 ms | 92.0 ms | 48% | 512 MB | **PASS** |
| **10,000 VU** | 41,200 req/s | 99.94% | 41.5 ms | 78.2 ms | 98.6 ms | 134.0 ms | 68% | 790 MB | **PASS** |
| **20,000 VU** | 78,500 req/s | 99.89% | 68.2 ms | 124.0 ms | 158.4 ms | 215.0 ms | 82% | 1.18 GB | **PASS** |

**Conclusion:** The platform comfortably sustains 20,000 concurrent Virtual Users with sub-220ms p99 latency and 0 container restarts.
