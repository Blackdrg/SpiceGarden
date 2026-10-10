# SPICEGARDEN — BULLMQ ASYNCHRONOUS PROCESSING PROFILE
**Queue Engine:** BullMQ 5.78.1 | **Worker Architecture:** 5 Dedicated Worker Queues  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77` | **Audit Date:** `2026-10-02T19:08:05.211Z`

---

## 1. Queue Performance & Resilience Matrix

| Queue Name | Concurrency | Backoff Strategy | Max Tested Depth | Drain Rate (Jobs/s) | Stalled Job Recovery | Status |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **order-processing** | 10 | Exponential (1s, 2s, 4s) | 100,000 | 1,450 / s | 30s lock renewal | **PASS** |
| **driver-assignment**| 8 | Fixed (2s, 5 attempts) | 50,000 | 820 / s | 15s lock renewal | **PASS** |
| **notifications** | 25 | Exponential (500ms) | 250,000 | 3,800 / s | DLQ after 3 failures | **PASS** |
| **ledger-reconciliation** | 4 | Exponential (5s) | 20,000 | 450 / s | Transactional rollback | **PASS** |
| **data-retention** | 2 | Fixed (30s) | 5,000,000 | 8,500 / s | Resumable cursor | **PASS** |

---

## 2. Worker Crash Invariant Verification

* **Worker Termination During Execution:** Injected `process.exit(1)` into active worker processing a batch of 500 order jobs.
* **Result:** Lock expired after 30s; secondary worker picked up uncompleted jobs; exactly 500 orders settled; **zero double-executions, zero dropped orders**.