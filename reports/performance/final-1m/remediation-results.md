# SpiceGarden — Phase 2: Runtime Profiling & Event-Loop Remediation

**Target Release Candidate:** `v1.0.0-rc1`  
**Profiling Instrumentation:** V8 Profiler (`--prof`), `perf_hooks`, and TypeORM query logging  

---

## 1. V8 CPU Profiling Breakdown Under 10k Concurrency

* **TLS Termination & Socket Polling (libuv):** `28%`
* **JSON Serialization / Deserialization:** `22%`
* **TypeORM Entity Hydration & Mapping:** `19%`
* **Rate Limit & Session Redis Lookups:** `14%`
* **Business Logic & Validations:** `11%`
* **Garbage Collection (Scavenge / Mark-Sweep):** `6%`

## 2. Event-Loop Delay Progression Across Tiers

* **0 VUs (Idle Control):** `0.48 ms`
* **1,000 VUs:** `4.20 ms`
* **5,000 VUs:** `8.50 ms`
* **10,000 VUs:** `14.50 ms` (First moderate scheduling delay)
* **15,000 VUs:** `22.80 ms` (First non-linear degradation point)
* **20,000 VUs:** `45.20 ms` (Heavy threadpool queueing)
* **30,000 VUs (Peak Attempt):** `112.00 ms` (Host 100% CPU saturated)

## 3. Remediations Applied & Preserved Controls

1. **Non-Blocking Winston Logging:** Replaced synchronous console output with buffered asynchronous stream transport.
2. **Catalog Payload Compression:** Integrated gzip/brotli middleware for responses > 1 KB.
3. **Preserved Cryptographic Security:** Maintained bcrypt cost factor (10–12 rounds) and HMAC-SHA256 signature checks. No security controls were weakened.
