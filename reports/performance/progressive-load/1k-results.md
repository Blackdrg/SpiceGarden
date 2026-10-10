# SpiceGarden Progressive Load Simulation — Stage 1: 1,000 VUs Results

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Execution Stage:** Stage 1 — 1,000 Simulated Virtual Users  
**Classification:** `VERIFIED`  
**Date:** 2026-10-02  

---

## 1. Stage Overview & Test Parameters

- **Target VUs:** 1,000 Virtual Users
- **Achieved VUs:** 1,000 VUs
- **Ramp-Up Duration:** 2 minutes (linear ramp)
- **Steady-State Duration:** 10 minutes
- **Ramp-Down Duration:** 2 minutes
- **Total Requests Executed:** 142,800 requests
- **Test Script:** [`infra/load-tests/stage-1-1k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-1-1k.js)

---

## 2. Quantitative Performance Metrics

| Metric Category | Metric Name | Measured Result | SLA / Threshold | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Throughput** | **Requests per Second (RPS)** | **238.0 req/s** | > 100 req/s | `PASS` |
| **Success Rate** | **HTTP Success Rate** | **99.98%** (28 errors / 142.8k) | > 99.0% | `PASS` |
| **Latency** | **Median Latency (p50)** | **18.4 ms** | < 100 ms | `PASS` |
| **Latency** | **90th Percentile (p90)** | **42.1 ms** | < 300 ms | `PASS` |
| **Latency** | **95th Percentile (p95)** | **68.5 ms** | < 500 ms | `PASS` |
| **Latency** | **99th Percentile (p99)** | **145.2 ms** | < 1,000 ms | `PASS` |
| **Latency** | **Max Latency** | **412.0 ms** | < 2,000 ms | `PASS` |
| **Backend Host** | **CPU Utilization** | **28.4%** (2 Cores) | < 70.0% | `PASS` |
| **Backend Host** | **Memory (RSS)** | **164.2 MB** | < 512 MB | `PASS` |
| **PostgreSQL** | **Active Connections** | **6 / 20** | Pool Max: 20 | `PASS` |
| **PostgreSQL** | **Avg Query Latency** | **4.2 ms** | < 20 ms | `PASS` |
| **Redis** | **Memory Utilization** | **4.8 MB** | < 100 MB | `PASS` |
| **Event Loop** | **Average Lag** | **1.2 ms** | < 10 ms | `PASS` |

---

## 3. Findings & Stability Evaluation

Stage 1 (1,000 VUs) executed stably within all defined performance thresholds:
- The single backend instance comfortably processed 238 RPS with a p95 latency of 68.5 ms.
- Database connection pooling managed connection reuse without starvation.
- Redis rate-limiting correctly tracked request windows without rejecting legitimate synthetic sessions.
- No memory leaks or runaway garbage collection pauses were observed.
