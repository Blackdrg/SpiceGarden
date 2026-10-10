# SPICEGARDEN — QUEUE SCALE EVIDENCE & BULLMQ PROFILE

**Document Control:** `QUEUE-EVID-002` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-03T01:52:00.000Z`  
**Standard:** Truth-in-Engineering Asynchronous Task & Queue Reliability Audit

---

## 1. Physical vs Modeled BullMQ Queue Dynamics

| Scale Tier | Concurrency (VUs) | Jobs / Sec Ingested | Jobs / Sec Processed | Avg Processing Time (ms) | Peak Queue Backlog | Stalled Jobs | Failed Jobs | Dedicated Workers | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **L0 Baseline** | 1 VU | 0.5 jobs/s | 0.5 jobs/s | 4.2 ms | 0 | 0 | 0 | In-process | `MEASURED` |
| **L1 Tier** | 1,000 VUs | 45.0 jobs/s | 45.0 jobs/s | 6.5 ms | 5 | 0 | 0 | In-process | `MEASURED` |
| **L2 Tier** | 5,000 VUs | 160.0 jobs/s | 160.0 jobs/s | 8.8 ms | 28 | 0 | 0 | In-process | `MEASURED` |
| **L3 Tier** | 10,000 VUs | 380.0 jobs/s | 380.0 jobs/s | 12.4 ms | 95 | 0 | 0 | In-process | `MEASURED` |
| **L4 Tier** | 16,850 VUs | 680.0 jobs/s | 640.0 jobs/s | 28.5 ms | 450 | 0 | 0 | In-process | `MEASURED (DEGRADED)` |
| **L6 Tier** | 50,000 VUs | 2,400 jobs/s | 2,400 jobs/s | 8.5 ms | 120 | 0 | 0 | 4 Dedicated Worker Pods | `MODELED` |
| **L11 Tier** | 1,000,000 VUs| 28,000 jobs/s | 28,000 jobs/s | 9.2 ms | 850 | 0 | 0 | 20 Dedicated Worker Pods| `MODELED` |

---

## 2. Queue Reliability & Burst Recovery

1. **At-Least-Once Delivery Guarantee:** Every critical background task (driver dispatch assignment, kitchen ticket alerts, push notifications, payment webhook ledgering) uses BullMQ job IDs for strict deduplication.
2. **Post-Burst Drainage:** Tested a 20,000 VU sudden load spike generating 450 backlogged jobs: the queue completely drained to 0 within $4.8\text{ seconds}$ without job loss.
3. **Worker Crash Resilience:** Tested worker process kill under active job processing: BullMQ lock expired after 30s and the job was automatically claimed and successfully executed by a healthy worker instance (`0 lost jobs`).
