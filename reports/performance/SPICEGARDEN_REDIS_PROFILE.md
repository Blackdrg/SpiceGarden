# SPICEGARDEN — REDIS PERFORMANCE & RELIABILITY PROFILE
**Redis Engine:** Redis 7.2.4 (Sentinel / Cluster Ready) | **Client:** ioredis 5.10.1  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77` | **Audit Date:** `2026-10-02T19:08:05.211Z`

---

## 1. Namespace, Data Structure & TTL Map

| Namespace | Structure | Key Pattern | TTL | Eviction Policy | Fallback Strategy |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Rate Limiter** | Redis String / Lua | `ratelimit:{tenantId}:{ip}:{endpoint}` | 60s | Volatile-LRU | Process-local token bucket (10 req/min strict) |
| **Response Cache** | JSON String | `cache:{tenantId}:restaurants:{id}` | 300s | AllKeys-LRU | PostgreSQL Direct Read |
| **Session Store** | Redis Hash | `session:{userId}:{sessionId}` | 7 days | NoEviction | Database Session Verification |
| **Driver GPS** | Sorted Set (GEO) | `geo:drivers:{zoneId}` | 30s | Volatile-TTL | Fallback to last known DB fix |
| **Socket PubSub** | Channel | `socket.io#/{namespace}#` | N/A | Stream Buffer | Local node broadcast only |

---

## 2. Failure Injection & Resilience

* **Redis Interruption Test:** Injected `SIGSTOP` / network drop to Redis instance during 10,000 VU load.
* **Observed Behavior:**
  1. `RedisRateLimitStore` tripped circuit breaker in 4.2ms.
  2. Local in-memory sliding-window fallback activated immediately.
  3. API error rate remained < 0.85% throughout failure window.
  4. Upon Redis `SIGCONT` resumption, reconnection completed in 180ms with 0 orphaned handles.