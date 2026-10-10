# SpiceGarden — Phase 4: Redis In-Memory Performance & Rate Limiting

**Redis Version:** 7.2.4  
**Client:** `ioredis 5.10.1`  

---

## 1. Measured Single-Node Redis Performance

* **Rate Limiting Throughput:** **18,500 operations/sec** via atomic sliding-window Lua scripts.
* **Command Latency:** **0.45 ms median**, **1.15 ms p95**.
* **Memory Footprint:** 1.85 MB at zero-load, 56.8 MB at 20,000 VUs.
* **Classification:** `MEASURED`

## 2. 1M Model Redis Cluster Requirement

* **Aggregate Command Rate:** **120,000 commands/sec**.
* **Specification:** 12-node / 6-shard Redis Cluster (AWS ElastiCache `cache.r6g.2xlarge`).
* **Classification:** `CAPACITY MODEL`
