# SPICEGARDEN — 500K WEBSOCKET RECONCILIATION & RATE-LIMIT AUDIT

**Document ID:** `AUDIT-500K-WS-001`  
**Classification:** `WEBSOCKET ARCHITECTURE & SECURITY AUDIT`  
**Date:** `2026-10-03T02:45:00.000Z`

---

## 1. WebSocket Concurrency vs VU Distinction

A crucial distinction in load testing is differentiating total virtual users from persistent TCP WebSocket connections:

```
+-------------------------------------------------------------------------------+
|                      500,000 CONCURRENT VIRTUAL USERS                         |
+-------------------------------------------------------------------------------+
| [70% Short-Lived HTTP VUs]   350,000 VUs  --> Catalog, Search, Cart, Checkout |
| [30% Long-Lived WS VUs]      150,000 Sockets --> Live Tracking, KDS, Driver   |
+-------------------------------------------------------------------------------+
```

* **Total Virtual Users:** 500,000 VUs
* **Persistent WebSocket Connections:** 150,000 active sockets
* **Total Room Subscriptions:** 1,500,000 room memberships (~10 rooms/socket)
* **Message Fanout Rate:** $\approx 300,000\text{ Messages/sec}$ via Redis Pub/Sub adapter
* **Per-Pod Sockets:** $150,000 / 50\text{ Pods} = 3,000\text{ Sockets / backend pod}$ (Memory footprint: $\approx 75\text{ MB}$ socket buffers per pod).

---

## 2. Gateway Rate-Limiting & Security Audit

In the backend codebase ([`apps/backend/src/infra/tracking/tracking.gateway.ts`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/infra/tracking/tracking.gateway.ts#L20-L21)):

```typescript
const WS_RATE_LIMIT_MAX = Number(process.env.WS_RATE_LIMIT_MAX || 10);
const WS_RATE_LIMIT_WINDOW_MS = Number(process.env.WS_RATE_LIMIT_WINDOW_MS || 60000);
```

### Rate-Limiter Settings Evaluation
1. **Production Default (`WS_RATE_LIMIT_MAX = 10`):** Protects against socket flooding and connection-based denial of service by limiting each IP to 10 connection attempts per 60 seconds.
2. **Distributed Testing Requirement:** When 20 load generators simulate 150,000 WebSockets, each generator IP initiates $7,500\text{ connections}$. Testing requires setting `WS_RATE_LIMIT_MAX=10000` via environment variable during benchmark execution.
3. **Security Preservation:** Source code maintains the secure default of 10 if the environment variable is not supplied.

---

## 3. Subsystem Metrics Comparison

| Parameter | Planned Capacity Model | Synthetic JSON (`qa/performance/500k/`) | Empirical Telemetry | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Active Sockets** | 150,000 sockets | 150,000 sockets | None | `UNVERIFIED` |
| **Fanout Latency (P95)** | 28.0 ms | 28.0 ms | None | `UNVERIFIED` |
| **Broadcast Adapter** | Redis Pub/Sub Adapter | Redis Pub/Sub Adapter | None | `UNVERIFIED` |

---

## 4. Forensic Finding

The 150,000 WebSocket multiplexing model is architecturally sound for 50 backend pods fronted by a 6-shard Redis cluster. However, the metrics are **theoretical specifications** rather than captured socket connection telemetry.
