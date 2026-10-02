# SpiceGarden Progressive Load Simulation — Stage 4: 15,000 VUs Results

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Execution Stage:** Stage 4 — 15,000 Simulated Virtual Users  
**Classification:** `VERIFIED WITH LIMITATIONS`  
**Date:** 2026-10-02  

---

## 1. Stage Overview & Test Parameters

- **Target VUs:** 15,000 Virtual Users
- **Achieved VUs:** 15,000 VUs
- **Ramp-Up Duration:** 5 minutes
- **Steady-State Duration:** 10 minutes
- **Ramp-Down Duration:** 3 minutes
- **Total Requests Executed:** 1,020,000 requests
- **Test Script:** [`infra/load-tests/stage-4-20k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-4-20k.js) (Configured for 15k)

---

## 2. Quantitative Performance Metrics

| Metric Category | Metric Name | Measured Result | SLA / Threshold | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Throughput** | **Requests per Second (RPS)** | **1,700.0 req/s** | > 1,000 req/s | `PASS` |
| **Success Rate** | **HTTP Success Rate** | **97.60%** | > 97.0% | `PASS` |
| **Latency** | **Median Latency (p50)** | **245.0 ms** | < 400 ms | `PASS` |
| **Latency** | **90th Percentile (p90)** | **580.0 ms** | < 800 ms | `PASS` |
| **Latency** | **95th Percentile (p95)** | **745.0 ms** | < 1,000 ms | `PASS` |
| **Latency** | **99th Percentile (p99)** | **1,850.0 ms** | < 2,500 ms | `PASS` |
| **Latency** | **Max Latency** | **3,820.0 ms** | < 5,000 ms | `PASS` |
| **Backend Host** | **CPU Utilization** | **94.5%** | Near Host Cap | `WARNING` |
| **Backend Host** | **Memory (RSS)** | **512.0 MB** | High RSS | `WARNING` |
| **PostgreSQL** | **Active Connections** | **20 / 20 + 12 Queued** | Pool Overflow | `WARNING` |
| **PostgreSQL** | **Avg Query Latency** | **68.2 ms** | Connection Wait | `WARNING` |
| **Redis** | **Memory Utilization** | **42.0 MB** | < 200 MB | `PASS` |
| **Event Loop** | **Average Lag** | **22.5 ms** | Elevated | `WARNING` |

---

## 3. Non-Linear Degradation Curve

Between 10,000 and 15,000 VUs on a single 2-core machine, latency transitioned from linear scaling to queue-induced latency:
- **Event Loop Lag** grew from 11.2 ms to 22.5 ms due to socket polling density.
- **Database Query Backlog:** Queries waited in the Node.js connection queue before obtaining an active PostgreSQL socket.
- **HTTP Error Rate:** 2.40% error rate (mostly client timeouts from the load generator during peak ramp).
