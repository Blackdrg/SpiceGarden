# SPICEGARDEN — 500,000 VU DISTRIBUTED PHYSICAL LOAD TEST REPORT

**Document ID:** `PERF-500K-DISTRIBUTED-AUDIT-001`  
**Classification:** `TECHNICAL DUE DILIGENCE / PERFORMANCE AUDIT`  
**Target Architecture:** Multi-Host k6 → Network → AWS ALB → EKS → NestJS → Redis/PostgreSQL  
**Target Concurrency:** `500,000 Concurrent Virtual Users (500K VUs)`  
**Audit Standard:** Strict Empirical Verification, Defense of Buyer Trust, Zero Synthetic Data Toleration  
**Git Baseline SHA:** `c88023bef3bbf459776b5bc18a213e0ea9797858`  
**Audit Timestamp:** `2026-10-03T11:25:00.000Z`

---

## 1. Primary Classification & Reality Check

In accordance with strict technical due-diligence standards, **no synthetic benchmarks or extrapolated metrics are accepted as physical proof**.

```text
================================================================================
                         500K BENCHMARK AUDIT CLASSIFICATION
================================================================================

              AUTHORITATIVE STATUS FOR 500,000 PHYSICAL VUs:
                              NOT EXECUTED
                   (ARCHITECTURALLY MODELED ONLY)

  * Real physical execution across distributed cloud hardware was NOT executed.
  * Real single-node physical testing reached 10,000 VUs (SLA PASS), 16,850 VUs
    (DEGRADED), and hit host OS socket exhaustion (WSAENOBUFS) at 22,400 VUs.
  * Tiers from 30,000 to 500,000 VUs exist exclusively as mathematical capacity
    models and architectural execution runbooks.

================================================================================
```

---

## 2. Evidence Classification Hierarchy

* **PHYSICALLY EXECUTED:**
  * **0 – 10,000 VUs:** Physically executed and verified on baseline host node (`100K_FINAL_VERDICT.md`). Sustained **1,373.3 RPS**, **P95 492ms**, **1.15% error rate**.
  * **15,000 – 16,850 VUs:** Physically executed; sustained degraded latency (P95 1,840ms, 4.8% errors).
  * **22,400 VUs:** Physical attempt blocked by OS ephemeral socket starvation (`WSAENOBUFS` error 10055).
* **MODELED (Mathematical / Engineering Equations):**
  * Mathematical model for 500K VUs: requires **50 NestJS pods**, **20x `c6i.2xlarge` Linux k6 load-generator nodes**, **2x multi-AZ ALBs**, **Aurora PostgreSQL `db.r6g.8xlarge`**, and a **6-shard Redis cluster** producing an estimated **~58,000 RPS**.
* **ARCHITECTURALLY EXPECTED:**
  * Target k6 Operator / Distributed EC2 fleet configuration outlined in `infra/k8s/` and `infra/load-tests/`.
* **NOT TESTED / NOT EXECUTED:**
  * Physical deployment of 20+ distributed Linux instances targeting a live AWS ALB/EKS cluster under 500,000 active concurrent VUs.

---

## 3. Detailed Audit Sections

### A. EXECUTION SUMMARY
```text
Target:
500,000 VUs

Actual:
10,000 VUs (Physically Sustained / SLA Pass)
16,850 VUs (Physically Sustained / Degraded)
22,400 VUs (Physical Host OS Limit / Blocked)
500,000 VUs (NOT EXECUTED / Architecturally Modeled Only)

Duration:
0s (Physical 500K Run Not Executed)

Status:
NOT EXECUTED (for 500K Physical Distributed Fleet)
```

---

### B. GENERATOR SUMMARY
```text
Total generators required (Modeled):
25 to 50 Linux EC2 instances (depending on 10k–20k VU safe allocation per host)

Total allocated VUs (Physical):
0 (No distributed Linux fleet provisioned)

Peak active VUs (Physical Single Node):
16,850 VUs (Sustained) / 22,400 VUs (Socket Ceiling Attempt)

Peak RPS (Physical Single Node):
1,373.3 RPS

Generator saturation:
Single-host OS Winsock socket exhaustion at 22,400 VUs (WSAENOBUFS)
```

---

### C. APPLICATION SUMMARY
```text
EKS nodes (Modeled Requirement):
7x c6i.4xlarge nodes

NestJS pods (Modeled Requirement):
50 Pods (horizontal autoscale target)

Peak CPU (Physical Baseline Node):
78.4% (at 10K VUs)

Peak memory (Physical Baseline Node):
812 MB (at 10K VUs)

P95 (Physical Baseline at 10K VUs):
492 ms

P99 (Physical Baseline at 10K VUs):
740 ms

5xx (Physical Baseline at 10K VUs):
1.15% (157 / 13,733 sample)
```

---

### D. DATABASE SUMMARY
```text
PostgreSQL peak connections (Modeled Requirement for 500K):
420 connections via PgBouncer transaction pooling (Aurora PostgreSQL db.r6g.8xlarge)

Transactions/sec (Physical Baseline at 10K VUs):
~165 tps

Peak query latency (Physical Baseline at 10K VUs):
18.4 ms

Database saturation:
NO (at 10K VUs baseline) / UNVALIDATED on physical 500K cluster
```

---

### E. REDIS SUMMARY
```text
Peak ops/sec (Modeled Requirement for 500K):
~38,500 ops/sec across 6 shards (ElastiCache Redis 7.2)

Memory (Physical Baseline Node):
64 MB

Latency (Physical Baseline Node):
< 2 ms

Evictions (Physical Baseline Node):
0

Errors (Physical Baseline Node):
0
```

---

### F. LOAD-GENERATION SUMMARY
```text
Peak VUs (Physical):
10,000 VUs (SLA Pass) | 16,850 VUs (Peak Degraded)

Peak RPS (Physical):
1,373.3 RPS

Total requests (Physical 10K Test):
82,398 requests

Dropped iterations:
0 at <=10K VUs; Socket drops observed at >20K VUs on local host

HTTP failure rate (Physical 10K Test):
1.15% (Passed < 2.0% SLA threshold)
```

---

### G. EVIDENCE & ARTIFACT AUDIT

| Artifact Category | Path / Identifier | Verification Status | Checksum / Details |
| :--- | :--- | :--- | :--- |
| **Physical Baseline k6 Telemetry** | Local runtime telemetry | **PHYSICALLY VERIFIED** | Validated up to 10K VUs |
| **Physical Socket Limit Telemetry** | Local Winsock logs | **PHYSICALLY VERIFIED** | `WSAENOBUFS` (10055) at 22.4K VUs |
| **500K Load Script** | `infra/load-tests/stage-7-500k.js` | **REPRODUCIBLE CONFIG** | k6 distributed test script ready |
| **1M Master Scenario** | `infra/load-tests/1m/scenario.js` | **REPRODUCIBLE CONFIG** | Multi-endpoint production workload |
| **500K Tier Synthetic JSONs** | `qa/performance/500k/` | **SYNTHETIC / MODELED** | Generated via `generate-raw-tier-evidence.js`; excluded from physical claims |
| **Forensic Verdict** | `500K_FINAL_VERDICT.md` | **AUDITED REFERENCE** | Confirms 500K status as Modeled Only |

---

## 4. Final Scale Ladder Table

| Tier | VUs | Physical? | Peak RPS | P95 | Error Rate | Status | Evidence |
| :--- | --: | :---: | --: | --: | --: | :---: | :--- |
| **10K** | 10,000 | **YES** | 1,373.3 | 492ms | 1.15% | **PASS** | Physical single-host telemetry |
| **25K** | 22,400 | **YES** | 1,480.0 | >3,500ms | 28.40% | **BLOCKED** | Winsock `WSAENOBUFS` socket starvation |
| **50K** | — | **NO** | — | — | — | **NOT EXECUTED** | Mathematical model only |
| **100K** | — | **NO** | — | — | — | **NOT EXECUTED** | Mathematical model only |
| **200K** | — | **NO** | — | — | — | **NOT EXECUTED** | Mathematical model only |
| **300K** | — | **NO** | — | — | — | **NOT EXECUTED** | Mathematical model only |
| **400K** | — | **NO** | — | — | — | **NOT EXECUTED** | Mathematical model only |
| **500K** | — | **NO** | — | — | — | **NOT EXECUTED** | Mathematical model only |

---

## 5. Authoritative Final Claim

> **Authoritative Due-Diligence Claim:**  
> *"SpiceGarden has physically demonstrated strict SLA compliance at **10,000 concurrent virtual users** (1,373.3 RPS, P95 492ms, 1.15% error rate) on physical hardware. The **500,000 concurrent VU distributed tier remains physically unvalidated** and is currently classified as **ARCHITECTURALLY MODELED ONLY**, pending live execution on a multi-host distributed Linux/AWS EKS test environment."*
