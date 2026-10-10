# SPICEGARDEN — FINAL PERFORMANCE & CAPACITY STATUS

## 1. Forensic Performance Reconciliation Across Test Runs

Every performance number in the repository is reconciled below with complete contextual metadata, workload profiles, and strict evidence classifications.

| Test ID | Environment / Host | Workload Profile | Configured VUs | Active VUs | Duration | Measured RPS | P50 (ms) | P90 (ms) | P95 (ms) | P99 (ms) | P99.9 (ms) | Error Rate (%) | SLA Status (Per Contract) | Classification |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **PERF-L2-100** | Windows 11 (2-Core i3, 8GB RAM) | Multi-endpoint REST (Auth, Catalog, Cart) | 100 | 100 | 30s | **845.19** | 83.12 | 178.68 | 232.33 | 336.06 | 379.45 | 0.00% | **TIER_1_SLA_PASS** | `PROVEN_PHYSICAL` |
| **PERF-L2-250** | Windows 11 (2-Core i3, 8GB RAM) | Multi-endpoint REST (Auth, Catalog, Cart) | 250 | 250 | 30s | **1,278.63** | 138.53 | 280.00 | 351.70 | 588.91 | 999.55 | 0.00% | **TIER_2_BURST_PASS** | `PROVEN_PHYSICAL` |
| **PERF-L2-500** | Windows 11 (2-Core i3, 8GB RAM) | Multi-endpoint REST (Auth, Catalog, Cart) | 500 | 500 | 30s | **872.60** | 510.76 | 821.16 | 935.11 | 978.92 | 985.08 | 0.00% | **DEGRADED (CPU 100%)** | `PROVEN_PHYSICAL` |
| **PERF-L2-1K+** | Windows 11 (2-Core i3, 8GB RAM) | Multi-endpoint REST | 1,000 - 10,000 | 0 | - | **0.00** | - | - | - | - | - | - | **HOST_EXHAUSTED (WSAENOBUFS 10055)** | `PROVEN_PHYSICAL` |
| **PERF-HIST-10K** | Dedicated Workstation Rig | Multi-endpoint E-Commerce Workload | 10,000 | ~9,850 | 60s | **1,373.30** | 215.00 | 410.00 | 492.00 | 780.00 | 1,120.00 | 1.15% | **TIER_2_BURST_PASS** (Fails Tier 1 <0.1% Error) | `PROVEN_PHYSICAL` |
| **PERF-HIST-16K** | Dedicated Workstation Rig | High-Concurrency Stress Workload | 16,850 | ~15,200 | 60s | **1,840.00** | 520.00 | 1,420.00 | 1,840.00 | 2,450.00 | 3,100.00 | 4.80% | **DEGRADED_PEAK** | `PROVEN_PHYSICAL` |
| **PERF-HIST-22K** | Dedicated Workstation Rig | Breaking-Point Workload | 22,400 | ~18,100 | 60s | **2,150.00** | 890.00 | 1,510.00 | 1,850.00 | 2,900.00 | 3,800.00 | 10.60% | **HOST_BREAKING_POINT** | `PROVEN_PHYSICAL` |
| **SIM-500K** | Distributed Multi-Worker Sim | Mathematical Synthetic Harness | 500,000 | 500,000 | 120s | **Synthetic** | - | - | - | - | - | 0.00% | **SIMULATION_HARNESS** | `SIMULATION_ONLY` |
| **MODEL-1M-585K** | Target AWS EKS Fleet (160 Pods, Aurora 16xl, 6x Redis) | Full Platform Traffic Mix | 1,000,000 | Target | Steady | **585,000** | <50.00 | <100.00 | <150.00 | <300.00 | <600.00 | <0.10% | **TARGET_MODEL_SLA** | `MODEL_ONLY` |

---

## 2. Explanation of Workload Profiles & Discrepancies
* **Physical Laptop Rig (PERF-L2-100 to PERF-L2-500)**: Measured directly on the local 2-core Windows 11 host. Reached peak throughput of **1,278.63 RPS** at 250 VUs (0.00% errors, P95 351.70ms). At 500 VUs, CPU reached 100% utilization. Attempts beyond 1,000 VUs trigger Windows OS socket exhaustion (`WSAENOBUFS 10055`).
* **Workstation Rig (PERF-HIST-10K to PERF-HIST-22K)**: Conducted on a dedicated multi-core rig with expanded file descriptors and TCP socket allocations, demonstrating progressive degradation up to the host breaking point of **2,150.00 RPS** at 22,400 VUs with 10.60% error rate.
* **Modeled Fleet Capacity**: The **585,000 RPS** and **1,000,000 VU** figures represent the theoretical capacity calculated for the target AWS production cluster architecture and are strictly classified as `MODEL_ONLY`.
