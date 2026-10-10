# SPICEGARDEN — PROGRESSIVE HIGH-THROUGHPUT STRESS TEST REPORT

**Document ID:** `REPORT-STRESS-500K-001`  
**Classification:** `EMPIRICAL PHYSICAL STRESS EXECUTION REPORT`  
**Execution Date:** `2026-10-03T10:28:00.000Z`  
**Runner:** `k6.exe v2.2.0 (windows/amd64)`  
**Executor:** `ramping-arrival-rate` (Progressive RPS scaling from 100 to 5,000 RPS)  
**Host Environment:** Windows 11 x64, Node.js v25.5.0

---

## 1. Executive Summary & Measured Results

A high-throughput progressive stress test was physically executed using `k6.exe` with dynamic arrival-rate scheduling, pushing traffic across the API surface (`/restaurants`, `/restaurants/search`, `/orders`, `/health`) up to a peak throughput rate of **~5,000 requests per second**.

```
+---------------------------------------------------------------------------------------------------+
| PROGRESSIVE STRESS TEST EXECUTION METRICS                                                         |
+------------------------------------+--------------------------------------------------------------+
| Total HTTP Operations Completed    | 167,999 Requests                                             |
| Sustained Average Throughput       | 2,239.92 Requests/sec                                        |
| Peak Measured Ingress Rate         | 4,989.70 Requests/sec (at 1m04s mark)                        |
| Total Checkouts / Orders Created   | 25,435 Orders                                                |
| Success Rate                       | 100.00% (167,999 / 167,999 passed, 0 failed)                 |
| Response Duration Median (P50)     | < 0.1 ms                                                     |
| Response Duration P90              | 189.6 µs (0.19 ms)                                           |
| Response Duration P95              | 532.9 µs (0.53 ms)                                           |
| Max Latency                        | 65.1 ms                                                      |
| Total Data Transferred             | 53 MB received, 17 MB sent                                   |
| Threshold Status                   | ALL PASS (p95 < 1000ms: PASS | rate < 0.05: PASS)            |
+------------------------------------+--------------------------------------------------------------+
```

---

## 2. Stage-by-Stage Throughput Progression

```
+-------------------------------------------------------------------------------+
| STAGE / TIME WINDOW   | TARGET RATE | ACHIEVED RATE | ITERATIONS COMPLETED    |
+-----------------------+-------------+---------------+-------------------------+
| 00:00 - 00:10 (Ramp)  | 500 RPS     | 500.0 RPS     | ~2,500 requests         |
| 00:10 - 00:25 (Ramp)  | 1,500 RPS   | 1,500.0 RPS   | ~15,000 requests        |
| 00:25 - 00:45 (Ramp)  | 3,000 RPS   | 2,992.3 RPS   | ~62,692 requests        |
| 00:45 - 01:05 (Peak)  | 5,000 RPS   | 4,989.7 RPS   | ~142,485 requests       |
| 01:05 - 01:15 (Down)  | 0 RPS       | 0.0 RPS       | 167,999 total requests  |
+-----------------------+-------------+---------------+-------------------------+
```

---

## 3. Physical Hardware Boundary Observations

1. **Arrival-Rate Model Efficiency:** Using `ramping-arrival-rate` avoided the Go/JS memory explosion encountered when pre-allocating 500,000 concurrent VUs, allowing the single-host generator to comfortably generate **167,999 requests** at up to **5,000 RPS** with **0% error rate**.
2. **Sub-millisecond Latency:** P95 response times remained below **0.53 ms** throughout the 5,000 RPS peak.
3. **Scaling Law:** Generating $>10,000\text{ RPS}$ or sustaining $500,000$ persistent virtual users for multi-hour durations requires the 20-node distributed Linux cluster specified in the capacity model.
