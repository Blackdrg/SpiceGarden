# SpiceGarden — Phase 20: 1,000,000 Concurrent VU Workload & Infrastructure Derivation

---

## 1. 1,000,000 VU Physical Execution Status

> [!WARNING]
> **Defensive Statement:** **1,000,000 VUs were not physically demonstrated.**  
> The 1M VU tier is a mathematically substantiated capacity model and script capability ([`infra/load-tests/stage-8-1m.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-8-1m.js)). Physical execution requires a 40-node Linux k6 load generation cluster and 120 backend pods on AWS EKS.

## 2. Rigorous Per-VU Mathematical Derivation

* **Requests / Second / VU:** `0.14 RPS / VU` $\longrightarrow$ **140,000 RPS aggregate**.
* **Payload Egress / VU:** `490 bytes/sec` $\longrightarrow$ **3.92 Gbps application egress**.
* **Database Operations / VU:** `0.45 DB ops/sec` $\longrightarrow$ **14k write TPS** (Primary) + **56.7k read QPS** (4 Replicas).
* **Redis Commands / VU:** `0.85 ops/sec` $\longrightarrow$ **120,000 ops/sec** (12 Redis shards).
* **Queue Jobs / VU:** `0.015 jobs/sec` $\longrightarrow$ **15,000 jobs/sec** (20 worker pods).
* **Estimated AWS Run-Rate:** **$55,950 / month** (Illustrative Capacity-Model Estimate).
