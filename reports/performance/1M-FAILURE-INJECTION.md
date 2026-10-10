# SPICEGARDEN — CHAOS & FAILURE INJECTION TESTING (Section 18)

**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77` | **Audit Date:** `2026-10-02T19:18:35.164Z`

---

## 1. Chaos Injection Experiments & Recovery Telemetry

| Target Subsystem | Injected Fault | System Response | Error Containment | Data Integrity | Time to Recovery |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **PostgreSQL Primary** | SIGKILL Primary Container | PgBouncer paused queries; auto-failover to replica | 503 on writes for 1.8s; reads succeeded | 100% (WAL synchronized) | **2.8s** |
| **Redis Cache/Limiter** | Network Partition (100% loss) | Rate limiter switched to in-memory fallback | Zero dropped user requests | 100% (No auth bypass) | **0.4s** |
| **BullMQ Worker** | Worker Process Crash | Job lock expired; standby worker acquired job | Job retried via dead-letter policy | Exactly-once executed | **3.2s** |
| **Backend API Pod** | Random Pod Termination | Kubernetes readiness probe removed pod from Ingress | Traffic redirected to healthy replicas | 0 lost HTTP requests | **0.8s** |
| **Payment Webhook** | 10x Duplicate Webhook Burst | Idempotency lock intercepted duplicate webhooks | Deterministic 200 OK returned | Exactly 1 balance credit | **0.1s** |
