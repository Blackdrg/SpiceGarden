# SpiceGarden — Master Scalability Claim Register (Final 1M Suite)

| Claim ID | Claim Summary | Classification | Evidence Source | Safe Buyer Wording |
| :--- | :--- | :---: | :--- | :--- |
| **CLM-001** | Zero-Load Control: 1.82 ms latency, 0.8% CPU | `MEASURED` | `baseline-results.md` | "Zero-load baseline health endpoint latency measured at 1.82 ms." |
| **CLM-002** | 1,000 VUs: 238 RPS, 68.5 ms p95, 0.02% errors | `MEASURED` | `stage-1-1k.js` | "1,000 VUs sustained at 238 requests/sec with 68.5 ms p95 latency." |
| **CLM-003** | 5,000 VUs: 808.6 RPS, 312 ms p95, 0.58% errors | `MEASURED` | `stage-2-5k.js` | "5,000 VUs sustained at 808.6 requests/sec with 312 ms p95 latency." |
| **CLM-004** | 10,000 VUs: 1,373.3 RPS, 492 ms p95 (SLA pass) | `MEASURED` | `stage-3-10k.js` | "10,000 VUs sustained at 1,373.3 RPS meeting the <500 ms p95 SLA." |
| **CLM-005** | 15,000 VUs: 1,700 RPS, 745 ms p95 (Degraded) | `VERIFIED WITH LIMITATIONS` | `stage-4-20k.js` | "15,000 VUs reached 1,700 RPS with 745 ms p95 latency (degraded)." |
| **CLM-006** | 20,000 VUs Target: 16,850 VUs sustained (960ms p95) | `VERIFIED WITH LIMITATIONS` | `stage-4-20k.js` | "20k target achieved 16,850 sustained VUs on single-node hardware." |
| **CLM-007** | 30,000 VUs Target: 22,400 observed before port limit | `BLOCKED` | `30k-results.md` | "30K target was not achieved; 22,400 VUs were observed before port limits." |
| **CLM-008** | 50,000 VU Multi-Pod Model (6,900 RPS) | `CAPACITY MODEL` | `capacity-model.md` | "50,000 VU capacity model based on 5-pod architecture; not live tested." |
| **CLM-009** | 100,000 VU Multi-Pod Model (13,200 RPS) | `CAPACITY MODEL` | `capacity-model.md` | "100,000 VU capacity model based on 10-pod architecture; not live tested." |
| **CLM-010** | 250,000 VU Multi-Pod Model (34,000 RPS) | `CAPACITY MODEL` | `capacity-model.md` | "250,000 VU capacity model based on 25-pod architecture; not live tested." |
| **CLM-011** | 500,000 VU Multi-Pod Model (58,000 RPS) | `CAPACITY MODEL` | `capacity-model.md` | "500,000 VU capacity model based on 50-pod architecture; not live tested." |
| **CLM-012** | 1,000,000 VU Hyperscale Model (140,000 RPS) | `1M VU CAPACITY MODEL` | `1m-test-results.md` | "1M VU capacity model mathematically derived; physical test not executed." |
| **CLM-013** | Database Read: 1,850 QPS, Write: 340 TPS | `MEASURED` | `database-results.md` | "PostgreSQL single-node read throughput measured at 1,850 QPS." |
| **CLM-014** | Redis Rate Limiting: 18,500 ops/sec, 0.45 ms median | `MEASURED` | `redis-results.md` | "Redis rate limiter throughput measured at 18,500 operations/sec." |
| **CLM-015** | BullMQ Queue Engine: 680 jobs/sec, <15 ms lag | `MEASURED` | `bullmq-results.md` | "BullMQ background queues processed 680 jobs/sec with <15 ms wait." |
| **CLM-016** | Redis 12-Shard Cluster (120k ops/sec) | `CAPACITY MODEL` | `redis-results.md` | "120k Redis ops/sec represents a modeled requirement for 1M VUs." |
| **CLM-017** | WebSocket Single Process: 2,500 sockets (4.2ms p50) | `MEASURED` | `websocket-results.md` | "Single-process WebSocket gateway sustained 2,500 connections." |
| **CLM-018** | Multi-Pod Scaling Efficiency (88–92%) | `CAPACITY MODEL` | `kubernetes-scaling-results.md` | "Multi-pod scaling efficiency is a theoretical architectural model." |
| **CLM-019** | Recovery: 4.2s traffic drain vs 28.0s cold restart | `MEASURED` | `recovery-results.md` | "Traffic normalized in 4.2s; cold-restart recovery measured at 28.0s." |
| **CLM-020** | Multi-Tenant Fuzzing: 1,000 requests, 0 leaks | `MEASURED` | `multi-tenant-results.md` | "Multi-tenant isolation verified with 1,000 fuzzing requests (0 leaks)." |
| **CLM-021** | Payment Idempotency: 20 checkouts + 100 webhooks | `MEASURED` | `payment-integrity-results.md` | "Payment idempotency verified under mock stress (0 duplicate orders)." |
| **CLM-022** | Illustrative AWS Cost Sizing: $55,950 / month | `CAPACITY MODEL` | `capacity-model.md` | "Estimated $55,950/mo is an illustrative 1M capacity model estimate." |
| **CLM-023** | Monorepo Quality: 1,229 tests pass, 0 lint errors | `MEASURED` | `test-results` | "Monorepo verified with 1,229 passing unit/integration tests (0 failures)." |
