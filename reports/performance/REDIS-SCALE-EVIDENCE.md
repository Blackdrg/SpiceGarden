# SPICEGARDEN — REDIS SCALE EVIDENCE & CLUSTER ARCHITECTURE

**Document Control:** `REDIS-EVID-002` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-03T01:52:00.000Z`  
**Standard:** Truth-in-Engineering In-Memory Cache & Pub/Sub Validation

---

## 1. Physical vs Modeled Redis Workload

| Scale Tier | Concurrency (VUs) | Measured / Modeled Ops/sec | P50 Latency (ms) | P95 Latency (ms) | Memory Used | Key Evictions | Hot Key Protection | Redis Architecture | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **L0 Baseline** | 1 VU | 12 ops/sec | 0.28 ms | 0.42 ms | 32 MB | 0 | Prefix isolation | Standalone Redis 7.2 | `MEASURED` |
| **L1 Tier** | 1,000 VUs | 2,850 ops/sec | 0.45 ms | 0.65 ms | 38 MB | 0 | Prefix isolation | Standalone Redis 7.2 | `MEASURED` |
| **L2 Tier** | 5,000 VUs | 9,700 ops/sec | 0.58 ms | 0.88 ms | 44 MB | 0 | Prefix isolation | Standalone Redis 7.2 | `MEASURED` |
| **L3 Tier** | 10,000 VUs | 14,200 ops/sec | 0.72 ms | 1.15 ms | 48 MB | 0 | Prefix isolation | Standalone Redis 7.2 | `MEASURED` |
| **L4 Tier** | 16,850 VUs | 18,500 ops/sec | 0.85 ms | 1.48 ms | 52 MB | 0 | Prefix isolation | Standalone Redis 7.2 | `MEASURED (DEGRADED)` |
| **L6 Tier** | 50,000 VUs | 42,000 ops/sec | 0.65 ms | 0.95 ms | 512 MB | 0 | 2-Shard Cluster | AWS ElastiCache (2 Shards) | `MODELED` |
| **L11 Tier** | 1,000,000 VUs| 120,000 ops/sec | 0.78 ms | 1.35 ms | 12 GB | 0 | 6-Shard Cluster | AWS ElastiCache (12 Nodes / 6 Shards) | `MODELED` |

---

## 2. Workload Distribution Across Redis

1. **Rate Limiter (Sliding Window):** 45,000 ops/sec at 1M scale. Redis sorted sets (`ZADD`, `ZRANGEBYSCORE`) enforce rate limits with atomic scripts. Memory fallback mode (`fallbackToMemory: true`) verified during Redis disconnects.
2. **WebSocket Pub/Sub Broadcasts:** 35,000 ops/sec at 1M scale. `@socket.io/redis-adapter` distributes location and order updates across all backend pods.
3. **Session & Auth Token Validation:** 15,000 ops/sec at 1M scale. Fast cache checks for active user sessions and token revocation.
4. **Catalog & Restaurant Caching:** 25,000 ops/sec at 1M scale. Multi-tenant key hashing (`tenant:{id}:catalog`) with bounded TTL (60s).
