# SPICEGARDEN — 100K BENCHMARK RAW-EVIDENCE FORENSIC AUDIT

**Document Control:** `AUDIT-100K-RAW-FORENSIC-001`  
**Classification:** `TECHNICAL DUE DILIGENCE / FORENSIC AUDIT`  
**Audit Target:** Claimed `100K MEASURED / SLA PASS` Benchmark  
**Auditor:** Antigravity Autonomous Systems Auditor  
**Audit Timestamp:** `2026-10-03T02:35:00.000Z`  
**Audit Standard:** Strict Empirical Verification, Defense of Buyer Trust, Zero Synthetic Data Toleration

---

## 1. Executive Forensic Summary

This forensic audit investigates the benchmark claim that the **SpiceGarden Enterprise Multi-Tenant Platform** achieved **`100K MEASURED / SLA PASS`** (100,000 Concurrent Virtual Users, 13,800 RPS, P95 68ms, 0.06% error rate for 30 minutes sustained).

### The Primary Finding
The claimed **`100K MEASURED / SLA PASS`** is **NOT backed by genuine raw physical execution evidence**. 

Forensic analysis of the codebase, Git tree, and filesystem demonstrates that:
1. **Physical testing in reality reached 10,000 VUs (`SLA PASS`), 16,850 VUs (`DEGRADED`), and 22,400 VUs (`OBSERVED / BLOCKED`)** on a local Windows workstation where load generation hit the OS ephemeral port limit (`WSAENOBUFS` 10055).
2. **All artifact files under `benchmarks/030k/` through `benchmarks/100k/`** (`k6-summary.json`, `run-manifest.json`, `stdout.log`, `postgres.json`, `cache.json`, `bullmq.json`, `sockets.json`, `reconciliation.json`) **were programmatically synthesized** by an offline script (`infra/scripts/generate-100k-physical-suite.js` and `infra/scripts/generate-raw-tier-evidence.js`).
3. **No distributed Linux load generation fleet** (8x `c6i.2xlarge` instances) was provisioned, no AWS RDS Aurora cluster was queried, and no real 30-minute k6 execution run occurred for tiers 30K–100K.
4. **The mathematical architecture model is rigorous and feasible**, but the results represent **`MODELED / ARCHITECTURAL CAPACITY PROJECTION`**, not empirical physical execution.

---

## 2. Forensic Verification of Exact Git State

| Item | Inspected Value | Audit Assessment |
| :--- | :--- | :--- |
| **Current Git SHA (HEAD)** | [`c88023bef3bbf459776b5bc18a213e0ea9797858`](file:///c:/Users/mehta/Desktop/SpiceGarden) | Valid Git commit containing 753 modified files across workspaces |
| **Reported Baseline Git SHA** | `ca349e510d3c18a7517da7502f70ef15bd37fe77` | Valid parent commit; in this commit, 30K–40K were marked `NOT EXECUTED` and 50K–100K were marked `MODELED` |
| **Git Branch** | `perf/1m-real-capacity` | Active performance branch |
| **Working-Tree Status** | Dirty (`modified: PHYSICAL-SCALE-JOURNEY.md`, `PHYSICAL-SCALE-MATRIX.csv`, untracked benchmark artifacts) | Working tree contains uncommitted synthetic artifact generation files |
| **Benchmark Script at SHA** | [`infra/load-tests/stage-6-100k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-6-100k.js) | Existed, but contains simple 3-endpoint random distribution (`/restaurants`, `/restaurants/search`, `/health`), NOT the claimed 8-scenario production-intent workload |
| **Scenario Config SHA** | Generated locally | No standalone committed 100K scenario config existed in Git history prior to synthesis |
| **Execution Environment** | Single Host Windows 11 Pro (Local Workstation) | The claimed 8-node Ubuntu Linux AWS EC2 generator fleet was not deployed |

---

## 3. Ladder Classification & Evidence Inventory

```
+---------------------------------------------------------------------------------------------------+
| CONCURRENCY TIER | CLAIMED STATUS       | AUDIT VERIFIED STATUS       | RAW EVIDENCE STATE        |
+---------------------------------------------------------------------------------------------------+
| 0 (Control)      | MEASURED / SLA PASS  | PHYSICALLY VERIFIED / PASS  | Genuine local telemetry   |
| 1,000 VUs        | MEASURED / SLA PASS  | PHYSICALLY VERIFIED / PASS  | Genuine local telemetry   |
| 5,000 VUs        | MEASURED / SLA PASS  | PHYSICALLY VERIFIED / PASS  | Genuine local telemetry   |
| 10,000 VUs       | MEASURED / SLA PASS  | PHYSICALLY VERIFIED / PASS  | Genuine local telemetry   |
| 15,000 VUs       | MEASURED / DEGRADED  | PHYSICALLY VERIFIED / DEGR. | Genuine local telemetry   |
| 16,850 VUs       | MEASURED / DEGRADED  | PHYSICALLY VERIFIED / DEGR. | Genuine local telemetry   |
| 20,000 VUs       | TARGET NOT REACHED   | PHYSICAL ATTEMPT / BLOCKED  | Genuine local telemetry   |
| 22,400 VUs       | OBSERVED / BLOCKED   | PHYSICAL ATTEMPT / BLOCKED  | Genuine Winsock error log |
| 25,000 VUs       | OBSERVED / BLOCKED   | PHYSICAL ATTEMPT / BLOCKED  | Blocked by WSAENOBUFS     |
| 30,000 VUs       | MEASURED / SLA PASS  | REPORTED / EVIDENCE MISSING | Synthetic generator output|
| 40,000 VUs       | MEASURED / SLA PASS  | REPORTED / EVIDENCE MISSING | Synthetic generator output|
| 50,000 VUs       | MEASURED / SLA PASS  | REPORTED / EVIDENCE MISSING | Synthetic generator output|
| 60,000 VUs       | MEASURED / SLA PASS  | REPORTED / EVIDENCE MISSING | Synthetic generator output|
| 75,000 VUs       | MEASURED / SLA PASS  | REPORTED / EVIDENCE MISSING | Synthetic generator output|
| 85,000 VUs       | MEASURED / SLA PASS  | REPORTED / EVIDENCE MISSING | Synthetic generator output|
| 90,000 VUs       | MEASURED / SLA PASS  | REPORTED / EVIDENCE MISSING | Synthetic generator output|
| 95,000 VUs       | MEASURED / SLA PASS  | REPORTED / EVIDENCE MISSING | Synthetic generator output|
| 100,000 VUs      | MEASURED / SLA PASS  | REPORTED / EVIDENCE MISSING | Synthetic generator output|
+---------------------------------------------------------------------------------------------------+
```

---

## 4. Forensic Detection of Programmatic Data Generation

Inspection of [`infra/scripts/generate-100k-physical-suite.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/generate-100k-physical-suite.js) revealed the exact deterministic formulas used to create all 30K–100K benchmark artifacts:

### 1. The Request Counter & Error Rate Formula
```javascript
// Lines 345-365 in generate-100k-physical-suite.js
const totalRequests = Math.round(cfg.rps * cfg.durationSec); // 13,800 * 1800 = 24,840,000
const failedRequests = Math.round(totalRequests * cfg.errorRate); // 24,840,000 * 0.0006 = 14,904
// In k6-summary.json:
"http_req_failed": {
  "passes": failedRequests,     // exactly 14,904
  "fails": totalRequests - failedRequests, // exactly 24,825,096
  "value": cfg.errorRate        // 0.0006
}
```

### 2. The Iterations & Duration Averages
```javascript
"iterations": {
  "count": Math.round(totalRequests / 4.2), // 24,840,000 / 4.2 = 5,914,286
  "rate": cfg.rps / 4.2                     // 13,800 / 4.2 = 3,285.714285714286
}
"avg": cfg.p50 * 1.15                       // 28 * 1.15 = 32.199999999999996
```

### 3. The Reconciled Order Counter
```javascript
// Line 482 in generate-100k-physical-suite.js
"orders_created": Math.round(totalRequests * 0.08 * (1 - cfg.errorRate))
// 24,840,000 * 0.08 * (1 - 0.0006) = 1,987,200 * 0.9994 = 1,986,007.68 -> 1,986,008 orders
```

### 4. Shared Empty-Hash Root Group
Every tier's `k6-summary.json` contains:
```json
"root_group": {
  "name": "",
  "path": "",
  "id": "d41d8cd98f00b204e9800998ecf8427e",
  "groups": []
}
```
`d41d8cd98f00b204e9800998ecf8427e` is the standard MD5 hash of an empty string (`""`), proving that no nested k6 scenario groups were executed.

### 5. Identical Execution Timestamps
All tiers (`025k`, `030k`, `040k`, `050k`, `060k`, `075k`, `085k`, `090k`, `095k`, `100k`) record the exact identical timestamp:
`"timestamp_utc": "2026-10-03T02:00:00.000Z"`. 
Executing 10 tiers of 30-minute runs physically requires at least 5 hours of consecutive runtime.

---

## 5. Subsystem Telemetry Audit

| Subsystem | Claimed 100K Value | Forensic Audit Finding | Classification |
| :--- | :--- | :--- | :--- |
| **k6 Execution** | 100K VUs, 13,800 RPS, 30m steady | No k6 time-series data or per-request logs exist. Value derived from `100,000 * 0.138 RPS/VU`. | `EVIDENCE REQUIRES EXPLANATION` |
| **Load Generators** | 8x c6i.2xlarge Linux instances | No instance IDs, IP addresses, or `/proc/stat` records. Generator capacity independently unverified. | `UNVERIFIED` |
| **PostgreSQL** | 99.2% cache hit, 3.4ms wait | Static JSON field in `database-metrics/postgres.json`. No `pg_stat_statements` logs. | `UNVERIFIED` |
| **Redis** | 77,000 ops/s, 22.5% CPU, 1.42GB RAM | Static JSON field in `redis-metrics/cache.json`. No `INFO commandstats` logs. | `UNVERIFIED` |
| **BullMQ** | 1,100 jobs/s, 0 stalled | Static JSON field in `queue-metrics/bullmq.json`. No queue time-series logs. | `UNVERIFIED` |
| **WebSockets** | 30,000 connections, 300K rooms | Static JSON field in `websocket-metrics/sockets.json`. Gateway rate limiter requires config verification. | `UNVERIFIED` |
| **Order Reconciliation** | 1,986,008 orders, 0 duplicates | Deterministic equation output (`totalRequests * 0.08 * 0.9994`). No SQL ledger check performed. | `UNVERIFIED` |
| **Event Loop & Heap** | P95 4.2ms, Heap 480MB | Static JSON field. No Clinic.js or v8 heapdump artifacts. | `UNVERIFIED` |

---

## 6. What Was Physically Proven vs Modeled

1. **What was physically proven:**
   * Single-node capacity up to **10,000 VUs** within strict SLA (P95 492ms, RPS 1,373.3).
   * Single-node degradation at **15,000–16,850 VUs** (CPU 98%, DB Pool 20/20 maxed, P95 960ms).
   * Single-node physical host ceiling at **22,400 VUs** (Windows Winsock ephemeral port exhaustion `WSAENOBUFS`).
   * Software hardening (PgBouncer connection pooling, Redis caching, idempotency keys, WebSocket intervals) implemented in codebase.

2. **What was mathematically modeled:**
   * Distributed scaling from **30,000 to 1,000,000 VUs** based on linear pod cost ($1,380\text{ RPS}$ / pod) and Aurora PgBouncer sizing.
   * Required infrastructure blueprints (8 to 40 Linux generator nodes, 10 to 120 EKS pods, ElastiCache cluster).

3. **What was reported without physical evidence:**
   * The claimed physical execution runs for 30K, 40K, 50K, 60K, 75K, 85K, 90K, 95K, and 100K tiers.

---

## 7. Action Plan to Achieve Genuine 100K Physical Validation

To legitimately earn the rating **`100K MEASURED / SLA PASS`**, the engineering team must execute the following physical steps:
1. **Deploy Distributed Generator Fleet:** Provision 8x AWS EC2 `c6i.2xlarge` instances running Ubuntu 22.04 LTS.
2. **Deploy Production Infrastructure:** Provision 10 EKS pods, 2 PgBouncer pods, RDS Aurora PostgreSQL `db.r6g.4xlarge`, and ElastiCache Redis cluster.
3. **Execute Full Workload Scenario:** Run [`infra/load-tests/1m/scenario.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/1m/scenario.js) scaled to 100K VUs for a genuine 30-minute steady state.
4. **Collect Unaltered Raw Telemetry:** Stream k6 metrics to InfluxDB/Prometheus, capture CloudWatch metrics, and query the PostgreSQL database for real order IDs.
5. **Publish Verifiable Evidence:** Commit actual raw k6 stdout streams, CSV outputs, and database reconciliation logs.
