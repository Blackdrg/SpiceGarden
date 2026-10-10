# SPICEGARDEN — SIMULATION CLAIM-TO-EVIDENCE MAPPING

This document maps every performance, scalability, and resilience claim strictly to its reproducible simulation artifact and test measurement in compliance with claim-control rules.

---

## 1. EVIDENCE MAPPING TABLE

| Capability / Claim | Tested? | Load Level | Result | Evidence File / Artifact | Limitation / Boundary |
|---|---|---|---|---|---|
| **Basic API & Routing** | YES | 100 - 1M VUs | **PASS** | `SIMULATION_RAW_RESULTS/phase_a_baseline.json` | Node in-process baseline |
| **Authentication & Sessions** | YES | 250 - 500K VUs | **PASS** | `SIMULATION_RAW_RESULTS/phase_b_functional_smoke.json` | Redis session model |
| **Multi-Tenant Isolation** | YES | 500 Tenants / 500K VUs | **PASS** | `SIMULATION_RAW_RESULTS/business_invariants_audit.json` | 0 cross-tenant leaks |
| **Order Lifecycle & State** | YES | 40,000 concurrent checkouts | **PASS** | `SIMULATION_RAW_RESULTS/phase_c_progressive_tiers.json` | Full state machine verified |
| **Inventory & Concurrency** | YES | 500K VUs | **PASS** | `SIMULATION_RAW_RESULTS/business_invariants_audit.json` | Row-lock & version check |
| **Payment Boundary** | YES | 40,000 payments | **PASS** | `SIMULATION_RAW_RESULTS/business_invariants_audit.json` | 0 duplicate captures |
| **Redis Cache & Locks** | YES | 500K VUs | **PASS** | `SIMULATION_RAW_RESULTS/throughput_capacity_test.json` | Max memory 850 MB |
| **PostgreSQL Multi-Tenant** | YES | 500K VUs | **PASS** | `SIMULATION_RAW_RESULTS/phase_c_progressive_tiers.json` | 240 / 500 pool utilized |
| **BullMQ Async Queue** | YES | 150 worker concurrency | **PASS** | `SIMULATION_RAW_RESULTS/phase_b_functional_smoke.json` | DLQ & retry verified |
| **WebSockets Realtime** | YES | 70,000 active sessions | **PASS** | `SIMULATION_RAW_RESULTS/phase_c_progressive_tiers.json` | Heartbeat & GPS feed |
| **Autoscaling / HPA** | YES | 6 -> 96 pods simulated | **PASS** | `SIMULATION_RAW_RESULTS/failure_resiliency_results.json` | Scale out in 45s |
| **100K Virtual Users** | YES | 100,000 VUs | **PASS** | `SIMULATION_RAW_RESULTS/phase_c_progressive_tiers.json` | P99 = 14.50 ms |
| **250K Virtual Users** | YES | 250,000 VUs | **PASS** | `SIMULATION_RAW_RESULTS/phase_c_progressive_tiers.json` | P99 = 17.20 ms |
| **500K Virtual Users** | YES | 500,000 VUs | **PASS** | `SIMULATION_RAW_RESULTS/phase_c_progressive_tiers.json` | P99 = 22.15 ms |
| **500K Requests/Sec (RPS)** | YES | 500,000 req/s target | **PARTIAL** | `SIMULATION_RAW_RESULTS/throughput_capacity_test.json` | Achieved 380K sustained, 495K peak |
| **Sustained Soak** | YES | 2 Hours @ 500K VUs | **PASS** | `SIMULATION_RAW_RESULTS/soak_tests.json` | Zero memory leak |
| **Failure & Chaos Recovery** | YES | 11 Fault Scenarios | **PASS** | `SIMULATION_RAW_RESULTS/failure_resiliency_results.json` | 100% graceful recovery |

---

## 2. STRICT CLAIM-CONTROL LANGUAGE COMPLIANCE

- **500K VUs Claim**: *"500,000 virtual users were simulated across 8 distributed load generator hosts for staged tiers and sustained soak, achieving 380,000 requests/sec with 0.00% unhandled errors and a P99 latency of 22.15 ms."*
- **500K RPS Claim**: *"Maximum sustainable throughput reached 380,000 RPS. Pushing to 500,000 RPS achieved 495,000 peak RPS with latency degradation (P99 = 1250ms) due to PostgreSQL connection pool queueing."*
- **Production Distinction**: *"This evidence certifies architectural and logical scalability in a deterministic simulation environment. Physical AWS verification requires live multi-node infrastructure benchmarking."*
