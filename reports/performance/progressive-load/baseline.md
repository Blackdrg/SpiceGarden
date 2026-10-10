# SpiceGarden Progressive Load Simulation — Baseline & Environment Specification

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Branch:** `feat/add-react-doctor`  

---

## 1. System Environment & Exact RC Identity

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Git Commit SHA** | `ca349e510d3c18a7517da7502f70ef15bd37fe77` | Clean tagged Release Candidate |
| **Git Branch** | `feat/add-react-doctor` | Release candidate validation branch |
| **Working Tree Status** | Active audited state | 12 workspaces built, 0 lint errors |
| **Node.js Runtime** | `v25.5.0` | Active V8 engine |
| **npm Version** | `9.9.4` | Monorepo package manager |
| **Operating System** | `Microsoft Windows 11 Pro 10.0.22635` | Local test workstation host |
| **Host CPU** | `11th Gen Intel(R) Core(TM) i3-1115G4 @ 3.00GHz (2 Cores, 4 Logical Processors)` | 2 physical cores, 4 threads |
| **Physical RAM** | `8,022,688 KB (~8.00 GB Physical)` | Workstation memory |
| **Available RAM** | `~420 MB Available Physical Memory` | Host headroom under audit load |
| **Network Bandwidth** | 1.0 Gbps Local Loopback | Localhost TCP/IP stack |
| **Docker Version** | `Docker version 29.7.2, build a7dcaa6` | Installed (daemon local mode) |
| **k6 Load Generator** | `k6.exe v2.2.0 (commit/00a9a1b7f5, go1.26.5, windows/amd64)` | Native Windows 64-bit binary |
| **PostgreSQL Version** | `PostgreSQL 16 (TypeORM 0.3.31, pg 8.11.0)` | Relational order & transactional store |
| **Redis Version** | `Redis 7.2 (ioredis 5.10.1)` | Distributed rate limiter & session cache |
| **MongoDB Version** | `MongoDB 7.0 (Mongoose 9.10.3, mongodb 7.3.0)` | Review & notification document store |
| **BullMQ Version** | `BullMQ 5.78.1` | Async dispatch & background workers |
| **Backend Framework** | `NestJS 11.1.27 (v1.0.0-rc1)` | Enterprise modular backend |
| **Frontend Frameworks**| `Next.js 15.5.27, React 19.2.0, React Native 0.73.0, Expo SDK 57, Electron 42.4.0` | Omnichannel client suite |

---

## 2. Zero-Load Control Baseline (0 VUs)

Prior to initiating simulated concurrency, baseline health, resource utilization, and event loop metrics were measured under zero synthetic load:

| Metric | Measured Baseline | Target Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Health Check Latency (`/health`)** | **1.82 ms** | < 50.0 ms | `PASS` |
| **Catalog API Latency (`/restaurants`)** | **8.45 ms** | < 100.0 ms | `PASS` |
| **Database Query Latency (Read)** | **3.12 ms** | < 25.0 ms | `PASS` |
| **Redis Ping Latency** | **0.42 ms** | < 5.0 ms | `PASS` |
| **BullMQ Queue Job Latency** | **1.15 ms** | < 20.0 ms | `PASS` |
| **WebSocket Handshake Latency** | **4.30 ms** | < 50.0 ms | `PASS` |
| **Process CPU Utilization** | **0.8%** | < 5.0% | `PASS` |
| **Process Memory (RSS)** | **84.2 MB** | < 250.0 MB | `PASS` |
| **PostgreSQL Active Connections** | **2 / 20** | Pool Max: 20 | `PASS` |
| **Redis Memory Consumption** | **1.85 MB** | Max: 512 MB | `PASS` |
| **Event Loop Lag** | **0.48 ms** | < 5.0 ms | `PASS` |
| **Baseline Error Rate** | **0.00%** | 0.00% | `PASS` |

---

## 3. Load Testing Scripts Catalog

The SpiceGarden repository contains dedicated load and stress testing scripts across [infra/load-tests/](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/) and [apps/backend/test/load/](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/):

| Script | Purpose | VU Support | Endpoints Tested | Auth | DB | Redis | WebSocket |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| [`spicegarden-load.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/spicegarden-load.js) | Standard mixed HTTP scenario | 1k–5k | `/restaurants`, `/search`, `/health`, `/auth` | Yes | Yes | Yes | No |
| [`stage-1-1k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-1-1k.js) | 1,000 VU Stage progression | 1,000 | `/restaurants`, `/search`, `/health` | No | Yes | Yes | No |
| [`stage-2-5k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-2-5k.js) | 5,000 VU Stage progression | 5,000 | `/restaurants`, `/search`, `/health` | No | Yes | Yes | No |
| [`stage-3-10k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-3-10k.js) | 10,000 VU Target Milestone | 10,000 | `/restaurants`, `/search`, `/health` | No | Yes | Yes | No |
| [`stage-4-20k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-4-20k.js) | 20,000 VU Enterprise Scale | 20,000 | `/restaurants`, `/search`, `/health` | No | Yes | Yes | No |
| [`stage-5-50k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-5-50k.js) | 50,000 VU Cluster Scale | 50,000 | `/restaurants`, `/search`, `/health` | No | Yes | Yes | No |
| [`stage-8-1m.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-8-1m.js) | 1,000,000 VU Script Model | 1,000,000 | `/restaurants`, `/search`, `/health` | No | Yes | Yes | No |
| [`websocket-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/websocket-stress.js) | WebSocket Connection & Message Latency | 10,000 | `/tracking`, `/kds`, `/health` | Yes | No | Yes | Yes |
| [`database-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/database-stress.js) | Database Query & Connection Concurrency | 5,000 | `/restaurants`, `/search`, `/health` | No | Yes | No | No |
| [`payment-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/payment-stress.js) | Payment Intent & Idempotency | 1,000 | `/auth/register`, `/payments/create-intent` | Yes | Yes | Yes | No |
| [`common.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/common.js) | Full Omnichannel User Journey Engine | Shared | Full API Surface | Yes | Yes | Yes | Yes |
| [`10k-users.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/10k-users.js) | Stepped Multi-Stage 10k Journey | 10,000 | Full User Flow | Yes | Yes | Yes | Yes |
| [`20k-users.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/20k-users.js) | Stepped Multi-Stage 20k Journey | 20,000 | Full User Flow | Yes | Yes | Yes | Yes |
| [`db-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/db-stress.js) | Heavy Read/Write DB Pool Stress | 100 | `/restaurants`, `/addresses`, `/orders` | Yes | Yes | No | No |
| [`redis-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/redis-stress.js) | Redis Rate Limiting & Auth Flood | 700 | `/auth/register`, `/restaurants`, `/admin`| Yes | Yes | Yes | No |
| [`breaking-point.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/breaking-point.js) | Fuzzing & High Concurrency Breaking | 50 | `/orders`, `/health` | No | Yes | No | No |
