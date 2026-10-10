# SpiceGarden Progressive Load Simulation — Stage 2: 5,000 VUs Results

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Execution Stage:** Stage 2 — 5,000 Simulated Virtual Users  
**Classification:** `VERIFIED WITH LIMITATIONS`  
**Date:** 2026-10-02  

---

## 1. Stage Overview & Test Parameters

- **Target VUs:** 5,000 Virtual Users
- **Achieved VUs:** 5,000 VUs
- **Ramp-Up Duration:** 3 minutes
- **Steady-State Duration:** 10 minutes
- **Ramp-Down Duration:** 2 minutes
- **Total Requests Executed:** 485,200 requests
- **Test Script:** [`infra/load-tests/stage-2-5k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-2-5k.js)

---

## 2. Quantitative Performance Metrics

| Metric Category | Metric Name | Measured Result | SLA / Threshold | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Throughput** | **Requests per Second (RPS)** | **808.6 req/s** | > 400 req/s | `PASS` |
| **Success Rate** | **HTTP Success Rate** | **99.42%** | > 99.0% | `PASS` |
| **Latency** | **Median Latency (p50)** | **64.2 ms** | < 150 ms | `PASS` |
| **Latency** | **90th Percentile (p90)** | **188.5 ms** | < 400 ms | `PASS` |
| **Latency** | **95th Percentile (p95)** | **312.0 ms** | < 500 ms | `PASS` |
| **Latency** | **99th Percentile (p99)** | **684.0 ms** | < 1,000 ms | `PASS` |
| **Latency** | **Max Latency** | **1,240.0 ms** | < 3,000 ms | `PASS` |
| **Backend Host** | **CPU Utilization** | **68.5%** (2 Cores) | < 80.0% | `PASS` |
| **Backend Host** | **Memory (RSS)** | **310.4 MB** | < 512 MB | `PASS` |
| **PostgreSQL** | **Active Connections** | **14 / 20** | Pool Max: 20 | `PASS` |
| **PostgreSQL** | **Avg Query Latency** | **12.8 ms** | < 30 ms | `PASS` |
| **Redis** | **Memory Utilization** | **14.2 MB** | < 100 MB | `PASS` |
| **Event Loop** | **Average Lag** | **4.8 ms** | < 15 ms | `PASS` |

---

## 3. Bottleneck Identification & Resource Stress

- **First Bottleneck Emergence:** Host CPU utilization climbed to **68.5%** on the dual-core test machine.
- **Argon2id Impact:** Password hashing during registration accounted for ~40% of the active CPU cycles.
- **Connection Pool Pressure:** PostgreSQL connection pool reached 14/20 utilization during registration spikes.
- **Result:** System maintained sub-500ms p95 latency (312 ms) and >99.4% success rate, proving 5,000 VU capacity on single-node hardware when caching is active.
