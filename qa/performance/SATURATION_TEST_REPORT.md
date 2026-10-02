# SPICEGARDEN SATURATION TEST REPORT
**Test ID:** `PERF-SAT-01` | **Target:** Observed System Saturation Boundary

## 1. Benchmark Execution Profile
- **Workload:** Incremental ramp from 10k -> 20k -> 30k -> 35k Virtual Users against mixed read/write API endpoints.
- **Observed Saturation Boundary:** **34,500 Virtual Users** (~125,000 requests/sec).
- **Behavior at Boundary:** At 34,500 VU, backend rate-limiting middleware smoothly engaged, returning `429 Too Many Requests` to protect PostgreSQL pooler and BullMQ from memory exhaustion.
- **Post-Saturation Recovery:** Traffic decreased to 10,000 VU -> System recovered to p99 < 150ms within 4.8 seconds without requiring container restarts.
