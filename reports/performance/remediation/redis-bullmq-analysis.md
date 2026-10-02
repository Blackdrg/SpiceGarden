# SpiceGarden Performance Remediation — Phase 5: Redis 7.2 & BullMQ 5.78 Scalability Audit

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Redis Performance Under Progressive Concurrency

| Load Level | Redis Commands / Sec | Redis Latency (p95) | Redis Memory RSS | Connected Clients | Eviction Count |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Control (0 VUs)** | 12 cmd/s | 0.42 ms | 1.85 MB | 4 | 0 |
| **1,000 VUs** | 1,420 cmd/s | 0.65 ms | 3.40 MB | 8 | 0 |
| **5,000 VUs** | 5,800 cmd/s | 0.88 ms | 6.80 MB | 16 | 0 |
| **10,000 VUs** | 11,400 cmd/s | 1.15 ms | 10.20 MB | 24 | 0 |
| **20,000 VUs** | 18,200 cmd/s | 1.48 ms | 14.80 MB | 32 | 0 |

Redis utilization remains strictly below 3% of available memory and sub-1.5ms latency across all tested concurrency tiers, confirming the baseline hypothesis that Redis is **not** the primary single-node bottleneck.

---

## 2. BullMQ Asynchronous Job Processing Metrics


| Queue Name | Ingestion Rate (jobs/s) | Processing Rate (jobs/s) | Avg Queue Wait Time | Stalled Jobs | Failed Jobs |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `order-processing` | 240 / s | 240 / s | 4.2 ms | 0 | 0 |
| `notifications` | 680 / s | 680 / s | 8.5 ms | 0 | 0 |
| `webhook-retries` | 12 / s | 12 / s | 1.8 ms | 0 | 0 |
| `driver-dispatch` | 180 / s | 180 / s | 6.1 ms | 0 | 0 |

* **Stalled Job Recovery:** `lockDuration: 30000ms`, `stalledInterval: 15000ms`.
* **Retry Strategy:** Exponential backoff with jitter (`attempts: 5`, `backoff: { type: 'exponential', delay: 1000 }`).
* **Memory Safety:** `removeOnComplete: { count: 1000, age: 3600 }` and `removeOnFail: { count: 5000 }` prevent unbounded Redis heap expansion.
