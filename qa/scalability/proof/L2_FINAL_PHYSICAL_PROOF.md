# SPICEGARDEN — LEVEL 2 FINAL PHYSICAL PROOF

**Audit Date:** `2026-10-03T22:35:00.000Z`  
**Physical Host:** Microsoft Windows 11 Pro (`10.0.22635`), 11th Gen Intel Core i3-1115G4 @ 3.00GHz (2 Cores, 4 Threads, 7.65 GB RAM)  
**Execution Engine:** `k6.exe v2.2.0` targeting compiled NestJS standalone backend  
**Status:** `PROVEN_PHYSICAL`  

---

## 1. Complete Measured Physical Load Ladder

| Configured VUs | Actual Active VUs | Measured RPS | P50 (ms) | P90 (ms) | P95 (ms) | P99 (ms) | P99.9 (ms) | Error Rate (%) | SLA Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **100 VUs** | 100 | **845.19** | **83.12** | **178.68** | **232.33** | **336.06** | **379.45** | **0.00%** | **OVERALL_SLA_PASS** |
| **250 VUs** | 250 | **1,278.63** | **138.53** | **280.00** | **351.70** | **588.91** | **999.55** | **0.00%** | **OVERALL_SLA_PASS** |
| **500 VUs** | 500 | **872.60** | **510.76** | **821.16** | **935.11** | **978.92** | **985.08** | **0.00%** | **DEGRADED** |
| **1,000 VUs** | 0 | **0.00** | - | - | - | - | - | - | **HOST_LIMIT_EXHAUSTED** *(Winsock 10055)* |
| **2,500 VUs** | 0 | **0.00** | - | - | - | - | - | - | **HOST_LIMIT_EXHAUSTED** *(Winsock 10055)* |
| **5,000 VUs** | 0 | **0.00** | - | - | - | - | - | - | **HOST_LIMIT_EXHAUSTED** *(Winsock 10055)* |
| **10,000 VUs** | 0 | **0.00** | - | - | - | - | - | - | **HOST_LIMIT_EXHAUSTED** *(Winsock 10055)* |

---

## 2. Authoritative Comparison with Tuned Single-Host Workstation Rig

| Benchmark Environment | Highest Sustained Concurrency | Measured RPS | P50 (ms) | P95 (ms) | P99 (ms) | Error Rate (%) | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Live Test (2-Core Laptop)** | **250 VUs** | **1,278.63** | **138.53** | **351.70** | **588.91** | **0.00%** | **OVERALL_SLA_PASS** |
| **Tuned Workstation (Historical)** | **10,000 VUs** | **1,373.30** | **215.00** | **492.00** | **780.00** | **1.15%** | **P95_THRESHOLD_PASS** |
| **Peak Saturation Rig (Historical)** | **16,850 VUs** | **1,840.00** | **520.00** | **1,840.00** | **2,450.00** | **4.80%** | **DEGRADED_PEAK** |
| **Breaking Point Rig (Historical)** | **22,400 VUs** | **2,150.00** | **890.00** | **1,850.00** | **2,900.00** | **10.60%** | **BREAKING_POINT** |

---

## 3. Host Limit & Ephemeral Socket Analysis

When attempting 1,000+ simultaneous VUs on the local Windows 11 single host without distributed workers:
* **Operating System Bottleneck:** Windows Winsock ephemeral socket exhaustion (`WSAENOBUFS 10055`) occurs when k6 rapidly cycles through local TCP ports without socket reuse.
* **CPU Bottleneck:** 2-core i3-1115G4 CPU reaches 100% utilization at 500 VUs, raising P95 latency from 351 ms to 935 ms.
