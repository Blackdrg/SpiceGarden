# SPICEGARDEN — BASELINE 1M READINESS REPORT
**Document ID:** `PERF-BASE-001` | **Classification:** `CONFIDENTIAL / BUYER-DEFENSIBLE`  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77` | **Audit Date:** `2026-10-02T19:08:05.211Z`  
**Release Candidate:** `SpiceGarden v1.0.0-rc1`

---

## 1. System Identity & Monorepo Baseline Verification

| Attribute | Measured State | Verification Command | Compliance |
| :--- | :--- | :--- | :--- |
| **Git Commit SHA** | `ca349e510d3c18a7517da7502f70ef15bd37fe77` | `git rev-parse HEAD` | **CONFIRMED** |
| **Workspace Compilation** | 12 / 12 workspaces compile (0 errors) | `npm run build` | **PASS** |
| **Lint Status** | 0 errors across monorepo | `npm run lint` | **PASS** |
| **Backend Test Suites** | 69 passed, 69 total (1,122 tests) | `npm run --prefix apps/backend test` | **PASS (100%)** |
| **Frontend & Shared Tests**| 27 passed, 27 total (113 tests) | `npm test` | **PASS (100%)** |
| **Total Automated Tests** | 1,235 passing, 0 failing | Monorepo Jest Execution | **PASS** |
| **Backend Coverage** | Statements: 91.28% | Branches: 81.10% | Functions: 91.22% | Lines: 91.21% | `npm run --prefix apps/backend test:cov` | **PASS (>80% SLA)** |

---

## 2. Infrastructure Baseline Snapshot

* **Node.js Runtime:** v25.5.0 (V8 13.1.201.29)
* **PostgreSQL:** 16.2 with TypeORM 0.3.31 & PgBouncer Transaction Multiplexing
* **Document Store:** MongoDB 7.0 (Mongoose 9.10.3)
* **In-Memory Cache & Limiter:** Redis 7.2.4 (ioredis 5.10.1)
* **Queue Engine:** BullMQ 5.78.1
* **WebSocket Engine:** Socket.IO / Redis Pub/Sub Adapter (v4.7.4)
* **Physical Test Rig:** 11th Gen Intel(R) Core(TM) i3-1115G4 @ 3.00GHz (2 Cores, 4 Logical Processors), 8.0 GB RAM, Microsoft Windows 11 Pro 64-bit

---

## 3. Physical Baseline Concurrency Reproduction (Single-Node Co-located)

| Target VUs | Actual VUs | Measured RPS | p50 (ms) | p95 (ms) | p99 (ms) | Error Rate | Primary Saturation Point | Classification |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **1,000** | 1,000 | 238.0 | 18.2 | 68.5 | 112.0 | 0.02% | None (Linear scaling) | `MEASURED / SLA PASS` |
| **5,000** | 5,000 | 808.6 | 124.0 | 312.0 | 480.0 | 0.58% | Host CPU (68.0%) | `MEASURED / SLA PASS` |
| **10,000** | 10,000 | 1,373.3 | 215.0 | 492.0 | 780.0 | 1.15% | Host CPU (88.0%) & DB Pool (20/20) | `MEASURED / SLA PASS` |
| **15,000** | 15,000 | 1,700.0 | 380.0 | 745.0 | 1,120.0 | 2.40% | Event-Loop Lag (22.8 ms) | `MEASURED / DEGRADED` |
| **20,000** | 16,850 | 1,942.0 | 520.0 | 960.0 | 1,480.0 | 4.80% | Host CPU Saturation (98.0%) | `MEASURED / DEGRADED` |
| **30,000** | 22,400 | 2,150.0 | 890.0 | 1,850.0 | 2,900.0 | 10.60% | Windows Ephemeral Ports (WSAENOBUFS) | `BLOCKED (Workstation)` |

---

## 4. Key Takeaways & Transition to Distributed Scaling

1. **Physical Single-Node Ceiling:** 10,000 VUs represents the highest SLA-compliant capacity achievable on a dual-core 8GB developer workstation (P95 < 500ms, Errors < 2%).
2. **Workstation Saturation Limit:** 16,850 VUs sustained / 22,400 peak before TCP socket exhaustion.
3. **Requirement for 1M Validation:** Scaling beyond 20,000 VUs requires a distributed Linux load-generator cluster (k6 Kubernetes Operator) and multi-pod horizontal backend fleet behind PgBouncer and Redis Cluster.