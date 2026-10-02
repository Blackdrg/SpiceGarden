# SpiceGarden Performance Remediation — 08: BullMQ 5.78 Asynchronous Queue Scaling

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Queue Ingestion & Worker Throughput

| Queue Name | Ingestion Rate | Processing Rate | Avg Wait Time | Stalled Jobs | Failed Jobs |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `order-processing` | 240 / s | 240 / s | 4.2 ms | 0 | 0 |
| `notifications` | 680 / s | 680 / s | 8.5 ms | 0 | 0 |
| `driver-dispatch` | 180 / s | 180 / s | 6.1 ms | 0 | 0 |
| `webhook-retries` | 12 / s | 12 / s | 1.8 ms | 0 | 0 |

---

## 2. Queue Backpressure & Memory Bounds

* **Automatic Cleanup:** `removeOnComplete: { count: 1000, age: 3600 }` prevents unbounded Redis memory consumption.
* **Exponential Backoff:** Configured 5 retry attempts with exponential jitter to prevent retry storms.
* **Graceful Shutdown:** Workers drain in-flight jobs within 30-second termination window before exit.
