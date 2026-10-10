# SPICEGARDEN — 1M SIMULATION CLAIM-TO-EVIDENCE MAPPING

This document maps every 1M benchmark claim strictly to its reproducible simulation artifact and test measurement in compliance with claim-control rules.

---

## 1. EVIDENCE MAPPING TABLE

| Capability / Claim | Tested? | Modeled Concurrency | Result | Evidence File / Artifact | Modeled Boundary & Limitations |
|---|---|---|---|---|---|
| **1M VU Concurrency** | YES | 1,000,000 VUs | **PASS (DEGRADED)** | `1m_vu_ladder_results.json` | P99 = 70.25 ms (Acceptable degradation) |
| **1M RPS Capacity Modeling** | YES | Up to 1,000,000 RPS | **SATURATED** | `1m_rps_capacity_progression.json` | Max sustainable = 380K RPS, Peak = 495K RPS |
| **500K VU Baseline** | YES | 500,000 VUs | **PASS (HEALTHY)** | `1m_vu_ladder_results.json` | P99 = 6.93 ms, 0.00% errors |
| **750K VU Concurrency** | YES | 750,000 VUs | **PASS (QUEUING)** | `1m_vu_ladder_results.json` | P99 = 37.44 ms, 0.00% errors |
| **2M VU Stress Ceiling** | YES | 2,000,000 VUs | **FAILURE BOUNDARY** | `1m_vu_ladder_results.json` | P99 = 1150 ms, Saturation reached |
| **6 Traffic Profiles** | YES | 1M VUs per profile | **PASS** | `1m_traffic_profiles_results.json` | All profiles executed without invariant loss |
| **Load Generator Scaling** | YES | 8 to 64 Hosts | **PASS** | `load_generator_scaling.json` | 16+ hosts eliminate generator drops |
| **Network Conditions** | YES | 3 Profiles | **PASS** | `network_profiles_modeling.json` | Degraded network adds bounded latency |
| **8 Optimization Models** | YES | Models A to H | **MODELED** | `architectural_optimization_scenarios.json` | Model H unlocks 850K RPS |
| **Advanced Chaos (10 Scenarios)**| YES | 10 Fault Injections | **PASS** | `advanced_chaos_matrix.json` | 100% graceful recovery |
| **Repeatability (3 Runs)** | YES | 500K, 750K, 1M | **PASS** | `repeatability_statistics.json` | StdDev < 0.15ms (<0.5% variance) |

---

## 2. MANDATORY CLAIM-CONTROL DISCLAIMER

> **EXPLICIT DISCLAIMER**  
> This benchmark is a deterministic, in-process simulation and capacity model. It does not constitute a live AWS, ALB, EKS, PostgreSQL, Redis, network, or physical multi-host performance test. Simulated capacity figures must not be represented as measured production infrastructure capacity.
