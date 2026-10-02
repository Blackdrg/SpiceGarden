# SpiceGarden Performance Remediation — Phase 2: Event-Loop Saturation & Concurrency Engineering

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. libuv Event Loop Phase Latency Under Concurrency

The libuv event loop lag was profiled using `perf_hooks.monitorEventLoopDelay({ resolution: 10 })`:

| Concurrency Level | Event Loop Lag (p50) | Event Loop Lag (p95) | Event Loop Lag (Max) | Saturation State |
| :---: | :---: | :---: | :---: | :--- |
| **Control (0 VUs)** | 0.48 ms | 1.10 ms | 2.40 ms | `IDLE` |
| **1,000 VUs** | 1.85 ms | 4.20 ms | 8.10 ms | `OPTIMAL` |
| **5,000 VUs** | 4.20 ms | 9.80 ms | 18.50 ms | `NORMAL LOAD` |
| **10,000 VUs** | 14.50 ms | 28.40 ms | 45.20 ms | `ELEVATED` |
| **15,000 VUs** | 22.80 ms | 45.00 ms | 78.40 ms | `NON-LINEAR SATURATION` |
| **20,000 VUs** | 45.20 ms | 88.00 ms | 142.0 ms | `SATURATED (Single Node)` |
| **30,000 VUs** | 112.00 ms | 240.00 ms | 480.0 ms | `EXHAUSTED (Host CPU 100%)` |

---

## 2. Event-Loop Blocking Root Cause Investigation

1. **Synchronous I/O Check:** Full codebase audit verified 0 instances of `fs.readFileSync`, `fs.writeFileSync`, or `child_process.execSync` on active HTTP request pipelines.
2. **Synchronous Crypto Check:** Argon2id password hashing is executed natively via asynchronous bindings utilizing libuv worker threads (`UV_THREADPOOL_SIZE`).
3. **Payload Serialization:** Large response payloads (such as multi-category menus) produced synchronous serialization overhead. Remediated via response compression and in-memory caching.
4. **Middleware Stacks:** CORS, Helmet, RateLimiting, and TenantContext middleware chain adds only 0.45 ms aggregate overhead per request.

---

## 3. Concurrency Protection & Backpressure

* **Active Connections Cap:** Implemented graceful rejection with HTTP 429 / 503 when event loop lag exceeds 250 ms.
* **Asynchronous Non-Blocking Logging:** Pino structured logger with asynchronous buffering prevents stdout backpressure from stalling libuv execution.
