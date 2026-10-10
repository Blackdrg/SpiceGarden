# SPICEGARDEN — PHYSICAL CAPACITY CLAIM RECONCILIATION MASTER REGISTER

**Document ID:** `AUDIT-PHYSICAL-RECON-001`  
**Classification:** `Technical Due-Diligence / Buyer Evidence Reconciliation`  
**Date:** `2026-10-03T11:20:00.000Z`  
**Audit Target SHA:** `d55af75f6039cb158c9a6823a46d1de170cd2567`  

---

## 1. Executive Capacity Reconciliation Summary

To ensure 100% truthfulness and defensibility in buyer due diligence, this register reconciles all capacity statements across the repository. 

All claims are strictly categorized into:
1. **Physically Verified:** Real hardware execution with measured runtime telemetry.
2. **Simulation / Modeled Verified:** Deterministic mathematical capacity simulation (e.g. Model H).
3. **Pending Physical Validation / Blocked:** High-scale tiers awaiting multi-host cloud deployment.

```text
================================================================================
                    CAPACITY EVIDENCE RECONCILIATION MATRIX
================================================================================

Scale Tier      | Physical Execution Status | Simulation Status | Buyer-Grade Defensible Claim
----------------+---------------------------+-------------------+-----------------------------------------
0 – 10,000 VUs  | PHYSICALLY VERIFIED (PASS)| VERIFIED          | 100% Physically Demonstrated (1.37K RPS)
16,850 VUs      | PHYSICALLY VERIFIED (DEG) | VERIFIED          | Measured Single-Node Workstation Limit
22,400 VUs      | PHYSICAL BLOCKED (WSAENO) | VERIFIED          | Host OS Ephemeral Port Exhaustion Point
50K – 100K VUs  | UNVERIFIED (INFRA BLOCKED)| VERIFIED          | Architecturally Modeled
500,000 VUs     | UNVERIFIED (INFRA BLOCKED)| VERIFIED (380K)   | Mathematical Architecture Model
1,000,000 VUs   | UNVERIFIED (INFRA BLOCKED)| VERIFIED (495K)   | In-Process Architecture Simulation Only
585,000 RPS     | UNVERIFIED (INFRA BLOCKED)| VERIFIED (Model H)| In-Process Architecture Simulation Only

================================================================================
```

---

## 2. Granular Itemized Claim Reconciliation Register

### Claim Record 01: 1,000,000 Concurrency & 585K RPS
- **OLD CLAIM:** "SpiceGarden reaches 1,000,000 concurrent VUs and 585,000 RPS."
- **SOURCE:** `reports/acquisition/SPICEGARDEN_25CR_STRATEGIC_ACQUISITION_CASE.md` & `reports/performance/SPICEGARDEN_EXTREME_SCALE_1M_VALIDATION_REPORT.md`
- **NEW EVIDENCE:** `qa/physical/INFRASTRUCTURE_BASELINE.md` & `qa/final/1M_SIMULATION_BENCHMARK_FINAL_REPORT.md`
- **CORRECTED CLAIM:** *"SpiceGarden has architecturally and deterministically simulated 1,000,000 VUs and 585,000 RPS (Model H). Physical validation at 1M VUs remains blocked pending AWS multi-node generator provisioning."*
- **RAW ARTIFACT:** [`qa/final/1M_SIMULATION_BENCHMARK_FINAL_REPORT.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/qa/final/1M_SIMULATION_BENCHMARK_FINAL_REPORT.md)
- **COMMIT:** `d55af75f6039cb158c9a6823a46d1de170cd2567`
- **DATE:** `2026-10-03`

### Claim Record 02: 500,000 Concurrency & 380K RPS
- **OLD CLAIM:** "500,000 VUs validated with 380,000 sustained RPS."
- **SOURCE:** `500K_FINAL_VERDICT.md`, `500K_PHYSICAL_EXECUTION_RUN_REPORT.md`
- **NEW EVIDENCE:** `500K_FINAL_VERDICT.md`
- **CORRECTED CLAIM:** *"500,000 VUs is verified via mathematical capacity equation modeling; physical execution was bounded at 10,000 VUs (SLA Pass) and 16,850 VUs (Host Peak) on local hardware."*
- **RAW ARTIFACT:** [`500K_FINAL_VERDICT.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/500K_FINAL_VERDICT.md)
- **COMMIT:** `c88023bef3bbf459776b5bc18a213e0ea9797858`
- **DATE:** `2026-10-03`

### Claim Record 03: 140,000 RPS Baseline
- **OLD CLAIM:** "140,000 RPS physical throughput."
- **SOURCE:** Historical performance overview slides
- **NEW EVIDENCE:** Historical benchmark runs in `qa/performance/`
- **CORRECTED CLAIM:** *"140,000 RPS represents a cluster-projected capacity tier for a 16-node EKS configuration; actual single-node measured throughput is 1,373.3 RPS."*
- **RAW ARTIFACT:** [`qa/final/CLAIM_TO_EVIDENCE_RECONCILIATION.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/qa/final/CLAIM_TO_EVIDENCE_RECONCILIATION.md)
- **COMMIT:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`
- **DATE:** `2026-10-03`

### Claim Record 04: Physical Scale Ceiling on Local Hardware
- **OLD CLAIM:** "Hardware can run arbitrary load tests."
- **SOURCE:** Developer test notes
- **NEW EVIDENCE:** Winsock error logs at 22,400 VUs (`WSAENOBUFS 10055`)
- **CORRECTED CLAIM:** *"The single Windows workstation host encounters OS-level Winsock buffer exhaustion at 22,400 concurrent sockets. High-scale distributed testing requires a Linux EC2 generator fleet."*
- **RAW ARTIFACT:** [`500K_FINAL_VERDICT.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/500K_FINAL_VERDICT.md#L40)
- **COMMIT:** `c88023bef3bbf459776b5bc18a213e0ea9797858`
- **DATE:** `2026-10-03`

---

## 3. Discrepancy Elimination Sign-Off

No contradictory capacity claims remain in buyer-facing documentation. The boundary between physically demonstrated single-node throughput and mathematically modeled multi-cluster capacity is fully transparent and auditable.
