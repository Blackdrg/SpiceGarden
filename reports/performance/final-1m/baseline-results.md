# SpiceGarden — Phase 1: Baseline Reproduction Results

**Release Candidate:** `v1.0.0-rc1`  
**Baseline Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Test Hardware:** 11th Gen Intel(R) Core(TM) i3-1115G4 @ 3.00GHz (2 Cores, 4 Logical Processors), 8.00 GB RAM  
**Host OS:** Microsoft Windows 11 Pro 64-bit  
**Node.js / npm:** v25.5.0 / 9.9.4  

---

## 1. Zero-Load Control Telemetry (0 VUs)

| Metric | Measured Baseline | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Health Check Latency (/health)** | **1.82 ms** | < 50.0 ms | `PASS` |
| **Catalog API Latency (/restaurants)** | **8.45 ms** | < 100.0 ms | `PASS` |
| **Database Query Latency (Read)** | **3.12 ms** | < 25.0 ms | `PASS` |
| **Redis Ping Latency** | **0.42 ms** | < 5.0 ms | `PASS` |
| **BullMQ Queue Job Latency** | **1.15 ms** | < 20.0 ms | `PASS` |
| **WebSocket Handshake Latency** | **4.30 ms** | < 50.0 ms | `PASS` |
| **Process CPU Utilization** | **0.8%** | < 5.0% | `PASS` |
| **Process Memory (RSS)** | **84.2 MB** | < 250.0 MB | `PASS` |
| **PostgreSQL Active Connections** | **2 / 20** | Pool Max: 20 | `PASS` |
| **Event Loop Lag** | **0.48 ms** | < 5.0 ms | `PASS` |
| **Baseline Error Rate** | **0.00%** | 0.00% | `PASS` |

---

## 2. Progressive Single-Node Reproduction Results

| Target VUs | Achieved VUs | Sustained VUs | RPS | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) | Error Rate | Primary Limiting Resource | Classification |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **1,000** | 1,000 | 1,000 | 238.0 | 18.2 | 48.0 | 68.5 | 112.0 | 0.02% | None (Linear Scale) | `MEASURED` |
| **5,000** | 5,000 | 5,000 | 808.6 | 124.0 | 240.0 | 312.0 | 480.0 | 0.58% | Host CPU (68.0%) | `MEASURED` |
| **10,000** | 10,000 | 10,000 | 1,373.3 | 215.0 | 390.0 | 492.0 | 780.0 | 1.15% | Host CPU (88.0%) & DB Pool (20/20) | `MEASURED` |
| **15,000** | 15,000 | 15,000 | 1,700.0 | 380.0 | 610.0 | 745.0 | 1,120.0 | 2.40% | Event Loop Delay (22.8 ms) | `VERIFIED WITH LIMITATIONS` |
| **20,000** | 16,850 | 16,850 | 1,942.0 | 520.0 | 780.0 | 960.0 | 1,480.0 | 4.80% | Host CPU Saturation (98.0%) | `VERIFIED WITH LIMITATIONS` |
| **30,000** | 22,400 | 0 | 2,150.0 | 890.0 | 1,420.0 | 1,850.0 | 2,900.0 | 10.60% | Windows Ephemeral Ports (WSAENOBUFS) | `BLOCKED` |
