# SPICEGARDEN — 500K REDIS & BULLMQ RECONCILIATION

**Document ID:** `AUDIT-500K-CACHE-QUEUE-001`  
**Classification:** `CACHE & ASYNCHRONOUS PROCESSING AUDIT`  
**Date:** `2026-10-03T02:45:00.000Z`

---

## 1. Redis Cluster Capacity Analysis at 500K

Under the 500,000 VU workload ($58,000\text{ RPS}$):
* **Target Command Rate:** $370,000\text{ Redis Ops/sec}$
  * Session & Auth Lookups: $\approx 116,000\text{ Ops/s}$ ($2\times\text{RPS}$)
  * Catalog & Menu Caching: $\approx 145,000\text{ Ops/s}$ ($2.5\times\text{RPS}$)
  * WebSocket Pub/Sub Broadcasts: $\approx 60,000\text{ Ops/s}$
  * BullMQ Queue Polling / Ingestion: $\approx 49,000\text{ Ops/s}$

### Planned Redis Cluster Sizing
* **Topology:** 6-Shard AWS ElastiCache Redis 7.2 Cluster (Cluster Mode Enabled)
* **Node Types:** 12 nodes (6 Primary + 6 Read Replicas), `cache.r6g.xlarge` (4 vCPU, 26 GB RAM per node)
* **Aggregate Cluster Memory:** 156 GB RAM (Working Set: $\approx 9.0\text{ GB}$, $5.8\%$ utilization)
* **Projected Node CPU:** $32\% - 42\%$ per shard (well below single-thread saturation)
* **Key Eviction Policy:** `volatile-lru` with 0 expected evictions.

---

## 2. BullMQ Asynchronous Processing at 500K

* **Target Job Creation Rate:** $\approx 4,640\text{ Order Jobs/sec}$
* **Target Notification / Event Jobs:** $\approx 5,800\text{ Jobs/sec}$
* **Total BullMQ Ingestion Rate:** $\approx 10,440\text{ Jobs/sec}$

### Queue Architecture & Worker Allocation
* **Worker Fleet:** 10 to 12 dedicated BullMQ Worker Pods
* **Concurrency per Worker:** 50 concurrent job processors
* **Aggregate Processing Capacity:** $\approx 12,000\text{ Jobs/sec}$ (Headroom: $+15\%$)
* **Average Job Execution Latency:** $\approx 8.5\text{ ms}$ (Redis in-memory queue)
* **Queue Backlog Target:** $< 50\text{ jobs}$ in waiting state during steady state.

---

## 3. Subsystem Metrics Comparison Table

| Metric | Planned Capacity Model | Synthetic JSON (`qa/performance/500k/`) | Empirical Telemetry | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Redis Command Rate** | 370,000 ops/s | 370,000 ops/s | None | `UNVERIFIED` |
| **Redis Memory (RSS)** | 9,000 MB | 9,000 MB | None | `UNVERIFIED` |
| **Redis Cache Hit Ratio**| 98.8% | 98.8% | None | `UNVERIFIED` |
| **BullMQ Active Workers**| 10 Pods | 10 Pods | None | `UNVERIFIED` |
| **BullMQ Waiting Peak** | 15 Jobs | 15 Jobs | None | `UNVERIFIED` |
| **BullMQ Stalled Jobs** | 0 Jobs | 0 Jobs | None | `UNVERIFIED` |

---

## 4. Forensic Finding

The Redis sharding plan and BullMQ worker distribution are mathematically sufficient to process the 500K event stream. However, no physical cluster was provisioned, and all values represent a **modeled engineering specification**.
