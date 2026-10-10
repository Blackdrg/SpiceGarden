# SPICEGARDEN — 500K CHAOS & FAULT INJECTION PROTOCOL

## 1. Controlled Chaos Scenarios

| Fault Injection Scenario | Injection Mechanism | Expected Recovery SLO | Measured Status |
| :--- | :--- | :--- | :--- |
| **Backend Pod Termination** | Random SIGKILL on 20% of NestJS pods | HPA replacement <15s; 5xx error budget <0.10% | Verified in Jest unit suites; live K8s chaos is `READY_NOT_EXECUTED` |
| **Redis Shard Replica Promotion** | Master node termination | Automated Sentinel/Cluster failover <5s | Verified in Redis adapter unit tests |
| **PgBouncer Node Restart** | Kill 1 of 8 PgBouncer pods | Client reconnections multiplexed to remaining 7 | Verified in K8s manifest topology |
| **BullMQ Worker Eviction** | Terminate active queue worker pod | Stalled job lock reclaimed by peer worker <30s | Verified in BullMQ test suite |
