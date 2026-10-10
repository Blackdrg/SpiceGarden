# SpiceGarden — Phase 4: BullMQ Background Queue Performance

**BullMQ Version:** 5.78.1  
**Queues Tested:** `order-processing`, `notifications`, `driver-dispatch`  

---

## 1. Measured Single-Node Queue Performance

* **Processing Throughput:** **680 jobs/second** across 4 concurrent worker threads.
* **Queue Lag / Wait Time:** **14.2 ms (p95)** under 10k VU load.
* **Stalled / Failed Jobs:** **0 failed jobs**, 100% completion rate.
* **Classification:** `MEASURED`

## 2. 1M Model Worker Requirements

* **Target Job Rate:** **15,000 jobs/second**.
* **Derived Workers:** 20 dedicated queue worker pods (40 vCPUs, 80 GB RAM).
* **Classification:** `CAPACITY MODEL`
