# SPICEGARDEN — COMPREHENSIVE BOTTLENECK REGISTER
**Document ID:** `PERF-BTN-001` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Classification:** `CONFIDENTIAL / BUYER-DEFENSIBLE`

---

## 1. Bottleneck Classification System

Every bottleneck detected during profiling and scale testing is classified by root resource bound:

1. **CPU-bound:** V8 thread saturation, JSON serialization, cryptographic hashing.
2. **Database-bound:** TypeORM connection pool saturation, unindexed sequential scans, lock waits.
3. **Redis-bound:** Pub/Sub fanout amplification, rate-limiter round trips.
4. **Queue-bound:** BullMQ stalled job locks, worker concurrency starvation.
5. **WebSocket-bound:** File descriptor limits, per-socket memory footprint, reconnect storms.
6. **Network/Host-bound:** Windows ephemeral port exhaustion (`WSAENOBUFS`), TCP TIME_WAIT accumulation.

---

## 2. Detected Bottleneck Inventory

| ID | Category | Description | Onset Tier | Impact | Status |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **BTN-01** | Database | TypeORM default connection pool size (20/20) saturated | 10K VUs | Concurrency wait time spiked from 1.2ms to 42ms | **REMEDIATED (PgBouncer Multiplexing + Pool Config)** |
| **BTN-02** | Database | Missing multi-column index on `RestaurantEntity (tenant_id, is_active)` | 5K VUs | Seq scan cost 48.2ms under table volume | **REMEDIATED (Added Compound Index)** |
| **BTN-03** | Database | Unindexed `OrderItemEntity (order_id)` foreign key cascade | 5K VUs | Join latency spiked during multi-item order fetch | **REMEDIATED (Added B-Tree Index)** |
| **BTN-04** | CPU | Synchronous JSON serialization of heavy menu catalog (45KB) | 10K VUs | Event-loop blocking of 2.1ms per serialization | **REMEDIATED (ETag Caching + Response Compression)** |
| **BTN-05** | Security / Redis | In-memory rate-limiter fallback bypass risk during Redis disconnection | Chaos Injection | Potential per-pod rate-limit dilution if Redis down | **REMEDIATED (Stricter Local Token-Bucket + Health Tripping)** |
| **BTN-06** | WebSocket | Per-socket memory overhead and reconnect storm on pod restart | 2.5K Sockets | Memory footprint ~18KB/socket, reconnect thundering herd | **REMEDIATED (Socket.IO Exponential Jitter Reconnect + Heartbeat Tuning)** |
| **BTN-07** | Queue | BullMQ worker stall lock timeout under heavy CPU load | 15K VUs | 5000ms lock check resulted in stalled job false-positives | **REMEDIATED (StalledInterval 15s + Atomic Job Batching)** |
| **BTN-08** | Network / Host | Windows OS TCP ephemeral port exhaustion (max 16,384 ports) | 22.4K VUs | Socket allocation failed with `WSAENOBUFS` | **DOCUMENTED INFRASTRUCTURE LIMIT (Transition to Linux Fleet)** |