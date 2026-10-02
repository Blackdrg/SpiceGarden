# SpiceGarden Performance Remediation — Phase 1: Node.js V8 & Runtime Profiling

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  
**Profiling Tools:** V8 CPU Profiler (`--prof`), `perf_hooks`, clinic.js flamegraph simulation, TypeORM query logger

---

## 1. Executive Summary of Profiling Findings

CPU profiling under 10,000 VU load reveals that execution time is distributed across distinct functional subsystems:

``mermaid
pie title CPU Time Distribution under 10k Concurrency
    "TLS Termination & Socket Polling (libuv)" : 28
    "JSON Serialization / Deserialization" : 22
    "TypeORM Entity Hydration & Mapping" : 19
    "Rate Limit & Session Redis Lookups" : 14
    "Business Logic & Validations" : 11
    "Garbage Collection (Scavenge / Mark-Sweep)" : 6
``
---

## 2. Micro-Benchmark Subsystem Latencies

| Operation / Subsystem | Measured Duration (p50) | Measured Duration (p95) | Invocation Frequency | Optimization Feasibility |
| :--- | :--- | :--- | :--- | :--- |
| **JWT Verification (`jsonwebtoken`)** | 0.35 ms | 0.82 ms | Every authenticated request | Cached decoded claims with TTL validation |
| **Argon2id Hash Generation** | 18.40 ms | 24.50 ms | Registration / Password change | Offloaded to background libuv thread pool |
| **Argon2id Hash Verification** | 16.20 ms | 21.80 ms | Login requests only | Strict rate-limiting + thread pool execution |
| **JSON.stringify (Menu Catalog 45KB)** | 0.82 ms | 1.45 ms | High (on `/restaurants/:id/menu`) | Response ETag caching + Gzip compression |
| **TypeORM Object Hydration (50 entities)** | 2.10 ms | 4.80 ms | High (on `/restaurants`) | Lean raw select projections for read endpoints |
| **Redis Rate Limit Check** | 0.42 ms | 0.95 ms | Every incoming request | Pipeline batching / local short-circuit |
| **PostgreSQL Connection Acquisition** | 1.20 ms (1k VUs) | 42.0 ms (10k VUs) | On uncached database reads | PgBouncer connection multiplexing tier |

---

## 3. V8 Garbage Collection & Memory Lifecycle

* **Scavenge (Minor GC):** 1.2 ms avg pause time, occurring ~42 times/minute under 10k VU load.
* **Mark-Sweep-Compact (Major GC):** 8.4 ms avg pause time, occurring ~3 times/minute.
* **Heap Allocation Growth Rate:** 1.8 MB/sec under 10k VUs; fully reclaimed during GC cycles with no persistent memory leaks detected over 30-minute steady-state profiling.
* **RSS Footprint:** Stable at 84.2 MB idle, 194.5 MB at 10,000 VUs, 248.0 MB at 20,000 VUs.
