# SPICEGARDEN — 1,000,000 VU PHYSICAL VALIDATION STATUS & BLOCKER REPORT

**Document Control:** `1M-PHYS-002` | **Classification:** `TECHNICAL AUDIT`  
**Release Candidate:** `v1.0.0-rc1` | **Baseline Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-03T01:52:00.000Z`  
**Standard:** Strict Truth-in-Engineering Separation of Measured Local Data vs Cloud Distributed Sizing

---

## 1. Executive Status Statement

```
========================================================================================
SPICEGARDEN SCALE AUDIT — AUTHORITATIVE SUMMARY
========================================================================================

1. HIGHEST VERIFIED SLA-COMPLIANT CAPACITY:
   10,000 Concurrent Virtual Users (1,373.3 RPS | P95: 492.0 ms | Errors: 1.15%)

2. HIGHEST VERIFIED SUSTAINED CAPACITY (APPLICATION SATURATED):
   16,850 Concurrent Virtual Users (1,942.0 RPS | P95: 960.0 ms | Errors: 4.80%)
   [20K Target Attempt: 20K TARGET / 16,850 ACHIEVED — MEASURED / DEGRADED — TARGET NOT REACHED]

3. HIGHEST PHYSICALLY OBSERVED CONCURRENCY BEFORE SINGLE-HOST WINDOWS RESOURCE EXHAUSTION:
   22,400 Concurrent Virtual Users (2,150.0 RPS | Windows Ephemeral TCP Socket Exhaustion WSAENOBUFS)

4. HIGHEST DERIVED DISTRIBUTED CAPACITY MODEL:
   1,000,000 Concurrent Virtual Users / Workload (140,000 RPS on 120 Pods / 15 Nodes / 300k WebSockets)

----------------------------------------------------------------------------------------
EXPLICIT 1M CAPACITY CLASSIFICATION:
"1M CONCURRENCY WAS MODELED ONLY. 1M CONCURRENCY WAS NOT MEASURED ON PHYSICAL CLOUD FLEET."
========================================================================================
```

---

## 2. Precise Escalation Blocker & Remediation Roadmap

If 1,000,000 physical VUs cannot be reached on the current single Windows workstation:

```text
Highest physical VUs:
16,850

Highest SLA-compliant VUs:
10,000

Highest sustained VUs:
16,850

Highest observed VUs:
22,400

Current limiting component:
Dual Limiter:
1. Node.js Runtime Saturation (CPU 98%, event loop lag 45.2ms, in-process DB pool contention at 16.85K VUs)
2. Windows Single-Host Socket Table Exhaustion (WSAENOBUFS 10055 at 22.4K VUs)

Root cause:
Single-machine execution sharing load-generator and backend server on Windows loopback network stack.

Evidence:
Raw test logs, k6 error output (WSAENOBUFS), TypeORM connection queue telemetry.

Software remediation:
PgBouncer transaction pooling, Redis Pub/Sub WebSocket adapter, composite database indexes, asynchronous logger batching.

Infrastructure remediation:
Deploy distributed Linux load-generation cluster (40× c6i.2xlarge instances) against Amazon EKS (120 Backend Pods on 15× c6i.4xlarge nodes) + RDS PostgreSQL db.r6g.16xlarge + 12-node Redis Cluster.

Next physical target:
25,000 VUs on Distributed Linux Infrastructure
```
