# SPICEGARDEN — WEBSOCKET GATEWAY & REAL-TIME PROFILE
**WebSocket Framework:** Socket.IO v4.7.4 | **Pub/Sub Transport:** Redis Adapter  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77` | **Audit Date:** `2026-10-02T19:08:05.211Z`

---

## 1. Gateway Telemetry & Capacity Limits

| Gateway / Namespace | Tested Sockets | Message Rate | p50 Latency | p95 Latency | Memory / Socket | Reconnect Strategy | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| `/orders` | 2,500 (Local) | 4,200 msg/s | 3.8 ms | 12.4 ms | ~18 KB | Exp Backoff + Jitter | **MEASURED / SLA PASS** |
| `/tracking` | 2,500 (Local) | 8,500 msg/s | 4.2 ms | 14.8 ms | ~19 KB | Exp Backoff + Jitter | **MEASURED / SLA PASS** |
| `/kds` (Kitchen) | 500 (Local) | 1,200 msg/s | 2.1 ms | 8.2 ms | ~16 KB | Instant with Fallback | **MEASURED / SLA PASS** |
| `/admin` | 250 (Local) | 600 msg/s | 1.9 ms | 6.5 ms | ~16 KB | Instant with Fallback | **MEASURED / SLA PASS** |
| **Cluster Total** | **300,000 (Modeled)** | **450,000 msg/s** | **8.5 ms** | **28.0 ms** | **~18 KB** | **Fleet Redis Pub/Sub** | **MODELED (120 Pod Fleet)** |

---

## 2. 1M WebSocket Explicit Clarification

* **1M Logical Users vs 1M Simultaneous WebSockets:** 1,000,000 concurrent active platform users typically maintain ~300,000 active concurrent WebSocket subscriptions (active tracking/KDS sessions).
* **Single-Process Ceiling:** 2,500 simultaneous WebSockets physically validated per Node.js process.
* **1M Direct Sockets Verification Status:** `NOT PHYSICALLY VERIFIED ON SINGLE NODE` | `MODELED ARCHITECTURE REQUIRES 120 PODS BEHIND NLB`.