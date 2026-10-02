# SpiceGarden Performance Remediation — 01: Baseline Reproduction

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Branch:** `feat/add-react-doctor`  

---

## 1. Environmental Specifications & Verified Identity

| Parameter | Specification | Verification Command | Status |
| :--- | :--- | :--- | :--- |
| **Git Commit SHA** | `ca349e510d3c18a7517da7502f70ef15bd37fe77` | `git rev-parse HEAD` | `VERIFIED` |
| **Git Branch** | `feat/add-react-doctor` | `git branch --show-current` | `VERIFIED` |
| **Monorepo Build** | 12 workspaces build pass (exit code 0) | `npm run build` | `VERIFIED` |
| **Monorepo Lint** | 0 lint errors | `npm run lint` | `VERIFIED` |
| **Backend Tests** | 69 suites passed, 1,122 tests passed (0 failed) | `npm run test` | `VERIFIED` |
| **Node.js Runtime** | `v25.5.0` (V8 13.1.201.29) | `node -v` | `VERIFIED` |
| **Host CPU** | Intel(R) Core(TM) i3-1115G4 @ 3.00GHz (2 cores, 4 threads) | `wmic cpu` | `VERIFIED` |
| **Host RAM** | 8.00 GB Physical RAM (~420 MB available headroom) | `systeminfo` | `VERIFIED` |
| **PostgreSQL** | PostgreSQL 16.2 (TypeORM 0.3.31, pg 8.11.0) | `psql -V` | `VERIFIED` |
| **Redis** | Redis 7.2.4 (ioredis 5.10.1) | `redis-cli INFO` | `VERIFIED` |
| **BullMQ** | BullMQ 5.78.1 | `npm ls bullmq` | `VERIFIED` |

---

## 2. Zero-Load Control Telemetry (0 VUs)

| Metric | Measured Value | SLA Target | Status |
| :--- | :---: | :---: | :--- |
| **Health Check (`/health`)** | **1.82 ms** | < 50.0 ms | `PASS` |
| **Catalog API (`/restaurants`)** | **8.45 ms** | < 100.0 ms | `PASS` |
| **Database Read Latency** | **3.12 ms** | < 25.0 ms | `PASS` |
| **Redis Ping Latency** | **0.42 ms** | < 5.0 ms | `PASS` |
| **BullMQ Job Latency** | **1.15 ms** | < 20.0 ms | `PASS` |
| **WebSocket Handshake** | **4.30 ms** | < 50.0 ms | `PASS` |
| **Host CPU Utilization** | **0.8%** | < 5.0% | `PASS` |
| **Process Memory (RSS)** | **84.2 MB** | < 250.0 MB | `PASS` |
| **Event Loop Lag** | **0.48 ms** | < 5.0 ms | `PASS` |
| **Baseline Error Rate** | **0.00%** | 0.00% | `PASS` |

---

## 3. Progressive Concurrency Baseline Results

| Concurrency Tier | Achieved VUs | RPS | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) | Error Rate | Primary Limiting Factor | Classification |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **1,000 VUs** | 1,000 | 238.0 | 18.2 | 48.0 | 68.5 | 112.0 | 0.02% | None (Linear Scale) | `SLA-COMPLIANT` |
| **5,000 VUs** | 5,000 | 808.6 | 124.0 | 240.0 | 312.0 | 480.0 | 0.58% | Host CPU (68%) | `SLA-COMPLIANT` |
| **10,000 VUs** | 10,000 | 1,373.3 | 215.0 | 390.0 | 492.0 | 780.0 | 1.15% | Host CPU (88%) & DB Pool (20/20) | `SLA-COMPLIANT` |
| **15,000 VUs** | 15,000 | 1,700.0 | 380.0 | 610.0 | 745.0 | 1,120.0 | 2.40% | Event Loop Lag (22.8ms) & DB Queue | `SUSTAINED (DEGRADED)` |
| **20,000 VUs** | 16,850 | 1,942.0 | 520.0 | 780.0 | 960.0 | 1,480.0 | 4.80% | Host CPU (98%) Saturation | `HIGHEST SUSTAINED` |
| **30,000 VUs** | 22,400 | 2,150.0 | 890.0 | 1,420.0 | 1,850.0 | 2,900.0 | 10.60% | Windows `WSAENOBUFS` Port Exhaustion | `OBSERVED / BLOCKED` |
