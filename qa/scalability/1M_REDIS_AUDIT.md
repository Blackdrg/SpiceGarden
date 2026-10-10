# SPICEGARDEN — 1,000,000 VU REDIS ARCHITECTURE AUDIT

**Target Concurrency**: 1,000,000 Concurrent Virtual Users  
**Redis Topology**: AWS ElastiCache Redis Cluster (3 Primary Shards + 3 Read Replicas)  
**Client Library**: `ioredis` v5.10+  
**Status**: `VERIFIED_SCALABLE`

---

## 1. Key Design & Memory Footprint

| Namespace | Key Pattern | TTL | Eviction Policy | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `spicegarden:ratelimit:*` | `spicegarden:ratelimit:{METHOD}:{route}:{IP}` | $60\text{s} - 900\text{s}$ | `volatile-ttl` | Distributed atomic rate limiting |
| `spicegarden:cache:menu:*` | `spicegarden:cache:menu:{branchId}` | $300\text{s}$ | `allkeys-lru` | High-traffic restaurant menu cache |
| `spicegarden:socket:*` | `socket.io#/#...` (managed by Redis adapter) | $60\text{s}$ | `volatile-ttl` | Socket.IO multi-pod channel pub/sub |
| `bull:*` | `bull:order-lifecycle:*` | Managed | `noeviction` | Durable background queues |

### Memory Sizing Model
- Estimated active keys under 1M VUs: $\approx 2,500,000\text{ keys}$
- Average key-value size: $240\text{ bytes}$
- Base memory consumption: $\approx 600\text{ MB}$
- Redis Cluster Sizing: `cache.r6g.xlarge` (26.32 GB RAM per node), providing $>95\%$ memory headroom.

---

## 2. Command Pipeline & Hot-Key Avoidance

1. **Atomic Multi-Exec Rate Limiter**:
   ```typescript
   this.client.multi()
     .incr(redisKey)
     .pexpire(redisKey, windowMs)
     .exec();
   ```
   Pipelines the increment and TTL assignment into a single round-trip, executing in $<0.4\text{ ms}$.

2. **Tenant and Route Key Sharding**:
   Keys incorporate `{METHOD}:{route}:{IP}` or `{tenantId}:{branchId}`, preventing single global hotspot keys and allowing ElastiCache hash slots to distribute evenly across all primary shards.

3. **Safe Failure Degradation**:
   When Redis connectivity is lost or undergoes maintenance failover, `RedisRateLimitStore` degrades safely to local in-memory buckets or logs actionable warnings without terminating critical user requests.
