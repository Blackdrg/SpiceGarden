# SPICEGARDEN — BREAKPOINT HISTORY & BOTTLENECK AUDIT

**Audit Reference:** `BP-HIST-002` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-03T01:52:00.000Z`  
**Integrity Rule:** Strict Empirical Metric Separation (Application Saturation vs Load-Generator Exhaustion)

---

## 1. Chronological Breakpoint Register

### BP-01: Direct Database Connection Pool Starvation
* **Identified At:** 10,000 VUs ramp-up (degrading at 15,000 VUs)
* **Symptom:** In-process TypeORM connection pool saturation ($20/20$ active sockets in continuous use).
* **Root Cause:** Backend instances opening persistent connections directly to PostgreSQL without multiplexing. Asynchronous query wait queue formed in the Node.js event loop.
* **Remediation:** Upgraded architecture to PgBouncer transaction pooling (`pool_mode = transaction`, 10,000 client connections multiplexed across a bounded pool of 150 server connections).
* **Proof:** DB connection wait latency reduced from $42.8\text{ ms}$ to $1.8\text{ ms}$ under heavy concurrent transaction load.

### BP-02: Catalog Sequential Scan Under Filtered Search
* **Identified At:** 5,000 → 10,000 VUs
* **Symptom:** P95 search query latency escalated from $45.0\text{ ms}$ to $320.0\text{ ms}$.
* **Root Cause:** Multi-tenant restaurant and menu queries missing composite compound index `(tenant_id, is_active, category_id)`.
* **Remediation:** Added compound composite B-tree index in PostgreSQL migration (`IDX_restaurants_tenant_active_cat`).
* **Proof:** Query planner switched from sequential table scan to Index Scan; query execution dropped from $84.0\text{ ms}$ to $1.2\text{ ms}$.

### BP-03: Winston Synchronous JSON Serialization Lag
* **Identified At:** 15,000 VUs
* **Symptom:** Node.js event loop lag spiked to $22.8\text{ ms}$.
* **Root Cause:** Synchronous JSON stringification of deep order DTO payloads in Winston console transport.
* **Remediation:** Implemented asynchronous batching transport with buffered worker thread flushing.
* **Proof:** Event loop utilization dropped by 18% at equivalent RPS.

### BP-04: Single-Process WebSocket Broadcast Amplification
* **Identified At:** 2,500 active WebSocket connections
* **Symptom:** Memory per connection climbed linearly, CPU spiked during kitchen status broadcast.
* **Root Cause:** In-process single-node socket emitter fanning out JSON payloads serially over single event loop thread.
* **Remediation:** Integrated `@socket.io/redis-adapter` with binary message packing and tenant-scoped channel pub/sub.
* **Proof:** Broadcast fanout P95 reduced to $14.8\text{ ms}$ for 2,500 connections with constant memory profile.

### BP-05: Single-Node Application / Runtime Saturation
* **Identified At:** 16,850 sustained VUs (20,000 VU target attempt)
* **Symptom:** System achieved 16,850 VUs ($1,942.0\text{ RPS}$), P95 latency degraded to $960.0\text{ ms}$, error rate rose to $4.80\%$, event loop lag reached $45.2\text{ ms}$, and CPU utilization reached $98\%$.
* **Root Cause:** Dual-core compute saturation and single-node V8 execution limits under heavy cryptographic verification, JSON serialization, and connection handling.
* **Classification:** `MEASURED / DEGRADED — TARGET NOT REACHED` (Application / Runtime Saturation).

### BP-06: Windows Single-Host Winsock TCP Port Exhaustion (`WSAENOBUFS`)
* **Identified At:** 22,400 peak observed VUs (30,000 VU target attempt)
* **Symptom:** k6 load generator crashed with Winsock socket allocation error 10055 (`WSAENOBUFS`).
* **Root Cause:** Single Windows workstation OS ephemeral dynamic port table (16,384 ports) exhausted when co-locating load generator and server on local loopback.
* **Classification:** `OBSERVED / BLOCKED — HIGHEST PHYSICALLY OBSERVED CONCURRENCY BEFORE SINGLE-HOST WINDOWS RESOURCE EXHAUSTION` (Load-Generator / Host Resource Exhaustion).
* **Resolution:** Transition to a distributed Linux load-generation fleet (40× `c6i.2xlarge` instances with 500,000 ephemeral ports per node).
