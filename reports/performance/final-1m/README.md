# SpiceGarden Enterprise SaaS — Final 1M VU Performance & Scalability Dossier

**Release Candidate:** `v1.0.0-rc1`  
**Immutable Baseline Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Current Audited Branch:** `feat/add-react-doctor`  
**Audit Standard:** Truth-in-Engineering, Evidence-Based Verification, and Conservative Buyer-Safe Classification  
**Audit Date:** 2026-10-02  

---

## 1. Directory Structure & Deliverable Index

This directory contains the definitive, audited evidence package for SpiceGarden Enterprise SaaS:

1. [`baseline-results.md`](./baseline-results.md) — Phase 1: Baseline reproduction metrics (0 to 20k VUs).
2. [`remediation-results.md`](./remediation-results.md) — Phase 2: Runtime profiling, V8 engine optimizations, and event-loop fixes.
3. [`distributed-load-architecture.md`](./distributed-load-architecture.md) — Phase 10: Linux k6 distributed load generator fleet architecture.
4. [`load-generator-capacity.md`](./load-generator-capacity.md) — Workstation vs distributed load-generator capacity boundaries.
5. [`database-results.md`](./database-results.md) — Phase 3: PostgreSQL 16 benchmarks, indexing, and PgBouncer transaction pooling.
6. [`redis-results.md`](./redis-results.md) — Phase 4: Redis 7.2 rate-limiting throughput, Lua scripts, and latency benchmarks.
7. [`bullmq-results.md`](./bullmq-results.md) — Phase 4: BullMQ background queue processing, lag, and worker throughput.
8. [`websocket-results.md`](./websocket-results.md) — Phase 5: Socket.IO gateway, 2,500 socket single-process limits, and Redis Pub/Sub broadcast.
9. [`kubernetes-scaling-results.md`](./kubernetes-scaling-results.md) — Phase 9: Kubernetes deployment manifests, HPA, PDBs, and multi-pod modeling.
10. [`multi-tenant-results.md`](./multi-tenant-results.md) — Phase 7: Multi-tenant data isolation, tenant partitioning, and zero-leakage fuzzing.
11. [`payment-integrity-results.md`](./payment-integrity-results.md) — Phase 8: Mock/sandbox payment idempotency, duplicate webhook resilience, and ledger consistency.
12. [`data-integrity-results.md`](./data-integrity-results.md) — Phase 18: Zero-loss, zero-duplicate, zero-leakage cross-tier audit.
13. [`recovery-results.md`](./recovery-results.md) — Phase 25: Post-load recovery, CPU drain (4.2s), and full process restart (28.0s).
14. [`before-after-results.md`](./before-after-results.md) — Phase 26: Definitive before/after engineering metric comparison table.
15. [`capacity-model.md`](./capacity-model.md) — Phase 16: Mathematical derivation of 50k, 100k, 500k, and 1M tiers.
16. [`1m-test-results.md`](./1m-test-results.md) — Phase 20: 1,000,000 VU workload definition, infrastructure derivation, and status.
17. [`claim-register.md`](./claim-register.md) — Phase 28: Master Claim Register mapping claims CLM-001 through CLM-023 to raw evidence.
18. [`evidence-index.md`](./evidence-index.md) — Raw telemetry artifacts and test script inventory.
