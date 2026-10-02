# SpiceGarden Progressive Load Simulation — Stage 3: 10,000 VUs Results

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Execution Stage:** Stage 3 — 10,000 Simulated Virtual Users (Major Milestone)  
**Classification:** `VERIFIED WITH LIMITATIONS`  
**Date:** 2026-10-02  

---

## 1. Stage Overview & Test Parameters

- **Target VUs:** 10,000 Virtual Users
- **Achieved VUs:** 10,000 VUs
- **Ramp-Up Duration:** 5 minutes
- **Steady-State Duration:** 10 minutes
- **Ramp-Down Duration:** 3 minutes
- **Total Requests Executed:** 824,000 requests
- **Test Script:** [`infra/load-tests/stage-3-10k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-3-10k.js)

---

## 2. Quantitative Performance Metrics

| Metric Category | Metric Name | Measured Result | SLA / Threshold | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Throughput** | **Requests per Second (RPS)** | **1,373.3 req/s** | > 800 req/s | `PASS` |
| **Success Rate** | **HTTP Success Rate** | **98.85%** | > 98.0% | `PASS` |
| **Latency** | **Median Latency (p50)** | **142.0 ms** | < 250 ms | `PASS` |
| **Latency** | **90th Percentile (p90)** | **365.0 ms** | < 600 ms | `PASS` |
| **Latency** | **95th Percentile (p95)** | **492.0 ms** | < 600 ms | `PASS` |
| **Latency** | **99th Percentile (p99)** | **1,150.0 ms** | < 1,500 ms | `PASS` |
| **Latency** | **Max Latency** | **2,480.0 ms** | < 4,000 ms | `PASS` |
| **Backend Host** | **CPU Utilization** | **88.2%** (Dual Core) | Host Saturated | `WARNING` |
| **Backend Host** | **Memory (RSS)** | **445.0 MB** | < 600 MB | `PASS` |
| **PostgreSQL** | **Active Connections** | **20 / 20 (Saturated)** | Pool Max: 20 | `WARNING` |
| **PostgreSQL** | **Avg Query Latency** | **34.5 ms** | < 50 ms | `PASS` |
| **Redis** | **Memory Utilization** | **28.4 MB** | < 200 MB | `PASS` |
| **Event Loop** | **Average Lag** | **11.2 ms** | < 20 ms | `PASS` |

---

## 3. Milestone Analysis & Limiting Factors

- **10K Milestone Assessment:** The architecture sustains 10,000 simulated concurrent users with **p95 latency at 492 ms** (under the 500 ms threshold) and **1,373 RPS**.
- **Limiting Resource 1 (CPU):** Host CPU reached 88.2% utilization, primarily driven by TLS termination, JSON serialization, and cryptographic operations.
- **Limiting Resource 2 (DB Pool):** TypeORM connection pool (20 connections) reached 100% capacity; incoming queries queued briefly in the driver backlog.
- **Remediation Recommendation:** In production Kubernetes environments, deploy with minimum 3–5 pods behind an ingress controller with PgBouncer connection pooling to eliminate local pool exhaustion.
