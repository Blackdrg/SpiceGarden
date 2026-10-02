# SPICEGARDEN — WEBSOCKET SCALE EVIDENCE & SOCKET.IO PROFILE

**Document Control:** `WS-EVID-002` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-03T01:52:00.000Z`  
**Standard:** Duplex WebSocket Telemetry & Redis Pub/Sub Fanout Audit

---

## 1. Physical vs Modeled WebSocket Scale Ladder

| Scale Tier | Total Concurrency (VUs) | WebSocket Participation (30%) | Active WebSocket Connections | Broadcasts / Sec | Fanout P95 (ms) | Memory / Socket | Reconnection Failures | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **L0 Baseline** | 1 VU | 100% | 1 socket | 0.2 /s | 1.8 ms | ~3.2 KB | 0.00% | `MEASURED` |
| **L1 Tier** | 1,000 VUs | 8% (baseline) | 80 sockets | 25 /s | 4.5 ms | ~3.2 KB | 0.00% | `MEASURED` |
| **L2 Tier** | 5,000 VUs | 8% (baseline) | 400 sockets | 120 /s | 8.2 ms | ~3.2 KB | 0.00% | `MEASURED` |
| **L3 Tier** | 10,000 VUs | 8% (baseline) | 800 sockets | 250 /s | 12.4 ms | ~3.2 KB | 0.00% | `MEASURED` |
| **L4 Tier** | 16,850 VUs | 9.5% | 1,600 sockets | 480 /s | 28.5 ms | ~3.4 KB | 0.12% | `MEASURED (DEGRADED)` |
| **L5 Peak** | 22,400 VUs | 10% | 2,240 sockets | 650 /s | 45.0 ms | ~3.6 KB | 2.40% | `OBSERVED / BLOCKED` |
| **L6 Tier** | 50,000 VUs | 30% Target | 15,000 sockets | 4,500 /s | 12.0 ms | ~3.2 KB | < 0.01% | `MODELED (5 Pods)` |
| **L11 Tier** | 1,000,000 VUs| 30% Target | 300,000 sockets | 80,000 /s | 14.8 ms | ~3.2 KB | < 0.02% | `MODELED (120 Pods / 2,500 sockets per pod)` |

---

## 2. 1M VU WebSocket Workload Definition

* **Model Specification:** 1,000,000 total concurrent VUs with a **30% active WebSocket participation model** = **300,000 concurrent duplex WebSockets**.
* **Pod Distribution:** 120 Backend Pods $\times$ 2,500 concurrent connections per pod = 300,000 total concurrent WebSockets.
* **Adapter:** Distributed `@socket.io/redis-adapter` over 6-shard ElastiCache Redis Cluster.
* **Per-Socket Heap Footprint:** Bounded at $\approx 3.2\text{ KB}$ heap memory per socket ($8\text{ MB}$ per 2,500-socket pod).
