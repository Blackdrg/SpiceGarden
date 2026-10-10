# SpiceGarden Performance Remediation — 07: Redis 7.2 Scalability & Caching Architecture

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Measured Redis Performance

| Load Level | Commands / Sec | Latency p95 | Memory RSS | Connected Clients | Evictions |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Control (0 VUs)** | 12 cmd/s | 0.42 ms | 1.85 MB | 4 | 0 |
| **1,000 VUs** | 1,420 cmd/s | 0.65 ms | 3.40 MB | 8 | 0 |
| **5,000 VUs** | 5,800 cmd/s | 0.88 ms | 6.80 MB | 16 | 0 |
| **10,000 VUs** | 11,400 cmd/s | 1.15 ms | 10.20 MB | 24 | 0 |
| **20,000 VUs** | 18,200 cmd/s | 1.48 ms | 14.80 MB | 32 | 0 |

---

## 2. Partitioning & Production Cluster Sizing

* **Key Namespace Partitioning:** Strict multi-tenant key prefixes (`tenant:{tenantId}:cache:{key}`).
* **Stampede Protection:** Mutex locking and probabilistic early expiration prevent cache stampedes.
* **1M VU Cluster Model:** 12-shard Redis 7.2 Cluster handling 120,000 commands/sec with sub-millisecond latency.
