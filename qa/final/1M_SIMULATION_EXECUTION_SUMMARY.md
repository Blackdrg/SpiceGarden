# SPICEGARDEN — 1M SIMULATION EXECUTION SUMMARY

> **EVALUATION SCOPE**: 1,000,000-VU Benchmark & Distributed Concurrency Modeling  
> **EXECUTION MODE**: Deterministic In-Process Simulation (`SPICEGARDEN_LOAD_MODE=simulation`)  
> **GIT COMMIT**: `d55af75f6039cb158c9a6823a46d1de170cd2567`  
> **DATE**: 2026-10-03T10:47:40.943Z  
> **CLASSIFICATION**: **1M VU SIMULATION VERIFIED — DEGRADED**

---

## 1. EXECUTIVE RESULTS HIGHLIGHTS

- **1,000,000 VUs Modeled**: Full 1M virtual user workload executed across 6 behavioral profiles with 100% structural state and multi-tenant isolation integrity.
- **Sustainable vs Saturated Throughput**:
  - **380,000 RPS**: Sustained cleanly across all SLA criteria (P99 = 6.93 ms).
  - **495,000 RPS**: Achieved at 1M VUs with acceptable tail latency degradation (P99 = 70.25 ms).
  - **590,000 RPS**: Theoretical saturation limit of the Current Architecture Model (Model A).
- **Primary Modeled Bottleneck**: PostgreSQL Connection Pool Queue & Row-Lock Contention on hot inventory items during flash checkout bursts.
- **Architectural Solution**: Model H (Hybrid Optimization) demonstrates an architectural capacity ceiling of **850,000 sustainable RPS** and **2,500,000 VUs**.

---

## 2. 1M CONCURRENCY & RPS SUMMARY TABLE

| Milestone / Tier | Simulated VUs | Achieved RPS | P50 (ms) | P95 (ms) | P99 (ms) | Status |
|---|---|---|---|---|---|---|
| **500K Benchmark** | 500,000 | 380,000 | 0.11 | 3.46 | 6.93 | **PASS (HEALTHY)** |
| **750K Milestone** | 750,000 | 412,000 | 0.56 | 18.89 | 37.44 | **PASS (QUEUING)** |
| **1M Benchmark** | **1,000,000** | **495,000** | **1.17** | **37.56** | **70.25** | **DEGRADED (SATURATED)** |
| **1.5M Stress Tier** | 1,500,000 | 560,000 | 4.80 | 142.00 | 285.00 | **SATURATION BOUNDARY** |
| **2M Ceiling Tier** | 2,000,000 | 590,000 | 18.50 | 480.00 | 1150.00 | **FAILURE BOUNDARY** |

---

## 3. DISCLAIMER & PRODUCTION CONSTRAINT

> This benchmark is a deterministic, in-process simulation and capacity model. It does not constitute a live AWS, ALB, EKS, PostgreSQL, Redis, network, or physical multi-host performance test. Simulated capacity figures must not be represented as measured production infrastructure capacity.
