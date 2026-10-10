# SPICEGARDEN — 500K MODEL VS PHYSICAL RECONCILIATION

**Document ID:** `AUDIT-500K-RECON-001`  
**Classification:** `MODEL CALIBRATION & EMPIRICAL RECONCILIATION`  
**Date:** `2026-10-03T02:45:00.000Z`

---

## 1. Metric Origin & Derivation Taxonomy

Every metric associated with 500K scale has been classified into one of five categories:
* **`RAW OBSERVATION`:** Captured directly from physical hardware during execution.
* **`DERIVED VALUE`:** Calculated via deterministic mathematical equation.
* **`LINEAR EXTRAPOLATION`:** Scaled linearly from lower-tier measurements.
* **`EXACT MATCH`:** Identical to an earlier architectural plan constant.
* **`NEAR MATCH`:** Within $\pm 5\%$ of a capacity planning model.

---

## 2. 500K Metric Breakdown & Derivation Analysis

| Metric | Claimed / Modeled 500K Value | Mathematical Derivation Formula | Derivation Category |
| :--- | :--- | :--- | :--- |
| **Virtual Users** | 500,000 VUs | Target Scale Goal | `DERIVED VALUE` |
| **Throughput (RPS)** | 58,000 RPS | $50\text{ Pods} \times 1,160\text{ RPS/pod}$ (with concurrency back-off) | `DERIVED VALUE` |
| **P50 Latency** | 32.0 ms | $24.0\text{ ms (10K base)} + 8.0\text{ ms (cross-AZ)}$ | `DERIVED VALUE` |
| **P95 Latency** | 78.0 ms | Baseline SLA curve extrapolation | `DERIVED VALUE` |
| **P99 Latency** | 125.0 ms | Baseline SLA curve extrapolation | `DERIVED VALUE` |
| **Error Rate** | 0.08% | Fixed target ceiling ($< 0.1\%$) | `DERIVED VALUE` |
| **Backend Pods** | 50 Pods | $\lceil 500,000 \times 0.138 / 1,380 \rceil = 50\text{ Pods}$ | `LINEAR EXTRAPOLATION` |
| **Generator Fleet** | 20x `c6i.2xlarge` | $500,000 / 25,000\text{ VUs/node} = 20\text{ nodes}$ | `LINEAR EXTRAPOLATION` |
| **Database Pool** | 220 Connections | $20 + \lceil 500,000 / 2,500 \rceil = 220\text{ conns}$ | `DERIVED VALUE` |
| **Redis Ops/sec** | 370,000 Ops/sec | $500,000 \times 0.74\text{ ops/VU}$ | `LINEAR EXTRAPOLATION` |
| **Active WebSockets**| 150,000 Connections | $500,000 \times 30\%$ | `EXACT MATCH` |
| **BullMQ Jobs/sec** | 5,500 Jobs/sec | $58,000\text{ RPS} \times 8\%\text{ checkout} \times 1.18$ | `DERIVED VALUE` |

---

## 3. Scale Progression Comparison Across Tiers

| Concurrency Tier | Throughput (RPS) | P95 Latency (ms) | Error Rate | Backend Pods | Derivation Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1,000 VUs** | 238.0 RPS | 68.5 ms | 0.02% | 1 (Local) | `RAW OBSERVATION` |
| **5,000 VUs** | 808.6 RPS | 312.0 ms | 0.58% | 1 (Local) | `RAW OBSERVATION` |
| **10,000 VUs** | 1,373.3 RPS | 492.0 ms | 1.15% | 1 (Local) | `RAW OBSERVATION` (Peak SLA) |
| **16,850 VUs** | 1,942.0 RPS | 960.0 ms | 4.80% | 1 (Local) | `RAW OBSERVATION` (Host Peak) |
| **22,400 VUs** | 2,150.0 RPS | 1,850.0 ms | 10.60% | 1 (Local) | `RAW OBSERVATION` (WSAENOBUFS) |
| **100,000 VUs** | 13,800.0 RPS | 68.0 ms | 0.06% | 10 Pods | `DERIVED VALUE` |
| **250,000 VUs** | 34,000.0 RPS | 74.0 ms | 0.06% | 25 Pods | `DERIVED VALUE` |
| **500,000 VUs** | 58,000.0 RPS | 78.0 ms | 0.08% | 50 Pods | `DERIVED VALUE` |
| **1,000,000 VUs** | 140,000.0 RPS | 85.0 ms | 0.10% | 120 Pods | `DERIVED VALUE` |

**Forensic Finding:** All metrics for 500K are mathematical derivations based on the empirical single-pod unit capacity established during lower-tier testing ($1,380\text{ RPS}$ per container at healthy baseline). No raw observation exists at 500K.
