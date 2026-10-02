# SpiceGarden Performance Remediation — Master Evidence Index

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Documentation & Technical Deliverables Directory

| # | Document File | Description & Scope | Status |
| :---: | :--- | :--- | :---: |
| 1 | [`baseline-reproduction.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/baseline-reproduction.md) | Phase 0 Environment, SHA, and baseline reproduction | `VERIFIED` |
| 2 | [`node-profile.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/node-profile.md) | Phase 1 V8 CPU, GC pause, and micro-benchmark latencies | `VERIFIED` |
| 3 | [`event-loop-analysis.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/event-loop-analysis.md) | Phase 2 libuv event loop lag, non-blocking crypto audit | `VERIFIED` |
| 4 | [`database-analysis.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/database-analysis.md) | Phase 3 PostgreSQL connection pool, PgBouncer, indexes | `VERIFIED` |
| 5 | [`redis-bullmq-analysis.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/redis-bullmq-analysis.md) | Phase 5 Redis 7.2 throughput, BullMQ queue telemetry | `VERIFIED` |
| 6 | [`websocket-analysis.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/websocket-analysis.md) | Phase 6 WebSocket gateway, Redis adapter, room auth | `VERIFIED` |
| 7 | [`api-performance-analysis.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/api-performance-analysis.md) | Phase 7 Top 20 REST API endpoints performance profile | `VERIFIED` |
| 8 | [`kubernetes-scaling-analysis.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/kubernetes-scaling-analysis.md) | Phase 11 HPA, PDB, Pod scaling efficiency curve | `VERIFIED` |
| 9 | [`distributed-load-generator.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/distributed-load-generator.md) | Phase 12 Distributed k6 Linux worker architecture | `VERIFIED` |
| 10 | [`capacity-model.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/capacity-model.md) | Mathematical per-VU resource consumption model | `VERIFIED` |
| 11 | [`data-integrity-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/data-integrity-results.md) | Phase 9 & 10 Multi-tenant & payment integrity audit | `VERIFIED` |
| 12 | [`recovery-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/recovery-results.md) | Phase 22 Post-stress system drain and recovery | `VERIFIED` |
| 13 | [`before-after-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/before-after-results.md) | Single-node baseline vs remediated architecture | `VERIFIED` |
| 14 | [`bottleneck-analysis.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/bottleneck-analysis.md) | Deep root-cause breakdown across CPU, DB, and network | `VERIFIED` |
| 15 | [`1m-capacity-analysis.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/1m-capacity-analysis.md) | 1,000,000 VU Hyperscale capacity model & architecture | `CAPACITY MODEL` |
| 16 | [`evidence-index.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/remediation/evidence-index.md) | Master catalog and cross-reference index | `VERIFIED` |

---

## 2. Test Scripts & Harness Catalog

* [`infra/load-tests/spicegarden-load.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/spicegarden-load.js) — Standard omnichannel mixed HTTP scenario
* [`infra/load-tests/stage-1-1k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-1-1k.js) — 1,000 VU baseline qualification
* [`infra/load-tests/stage-2-5k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-2-5k.js) — 5,000 VU load test
* [`infra/load-tests/stage-3-10k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-3-10k.js) — 10,000 VU target milestone
* [`infra/load-tests/stage-4-20k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-4-20k.js) — 20,000 VU single-node limit qualification
* [`infra/load-tests/stage-8-1m.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-8-1m.js) — 1,000,000 VU distributed test scenario script
* [`infra/load-tests/websocket-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/websocket-stress.js) — WebSocket real-time gateway stress
* [`infra/load-tests/database-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/database-stress.js) — PostgreSQL connection & query stress
* [`infra/load-tests/payment-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/payment-stress.js) — Payment idempotency & concurrent checkout
