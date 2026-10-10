# SPICEGARDEN — 500K EXTENDED SOAK & STABILITY SPECIFICATION

## 1. Multi-Hour Soak Test Specification

* **Workload Target**: Sustained 500,000 active concurrent VUs (~270,000 RPS).
* **Target Duration**: 4 hours continuous execution.
* **Telemetry Monitored for Drift**:
  - Node.js RSS heap memory growth (leak detection).
  - PostgreSQL active connection count and deadlocks.
  - Redis memory fragmentation ratio.
  - BullMQ queue latency drift.
* **Execution Classification**: `READY_NOT_EXECUTED` (Cloud infrastructure required).
