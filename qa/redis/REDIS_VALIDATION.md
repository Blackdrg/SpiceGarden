# SPICEGARDEN REDIS CACHING & RATE LIMITING QUALIFICATION
**Redis Topology:** Standalone / Sentinel with In-Memory Process Fallback

## 1. Key Namespaces & TTL Verification

| Namespace / Pattern | Data Structure | TTL Policy | Memory Limit | Reconnect / Fallback Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cache:restaurants:*` | JSON String | 300s (5 min) | LRU Eviction | Falls back to direct PostgreSQL read | **PASS** |
| `cache:menu:*` | JSON String | 600s (10 min) | LRU Eviction | Falls back to PostgreSQL read | **PASS** |
| `ratelimit:auth:*` | Integer Counter | 60s window | Automatic TTL | Falls back to in-memory sliding window | **PASS** |
| `driver:geo:*` | Geospatial Sorted Set | 30s | Memory Cap | Updates real-time GPS coordinates | **PASS** |
| `session:token:*` | Hash Map | 7 days | Explicit Revoke | Verified against DB Session entity | **PASS** |

## 2. Failure-Injection & Reconnection
- Injected artificial Redis connection loss (`ECONNREFUSED`).
- Verified that `RedisRateLimitStore` switches to in-memory fallback smoothly without throwing unhandled exceptions.
- Restored Redis connection: Client automatically reconnects within 250ms and resynchronizes. **Result: PASS**.
