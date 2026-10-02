# SpiceGarden Progressive Load Simulation — Evidence Index

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Directory Structure & File Map

```text
reports/performance/progressive-load/
├── baseline.md                                      # RC specs, host telemetry & 0 VU baseline
├── workload-model.md                                # Weighted traffic mix & order lifecycle flow
├── 1k-results.md                                    # Stage 1: 1,000 VUs measured results
├── 5k-results.md                                    # Stage 2: 5,000 VUs measured results
├── 10k-results.md                                   # Stage 3: 10,000 VUs milestone results
├── 15k-results.md                                   # Stage 4: 15,000 VUs degradation results
├── 20k-results.md                                   # Stage 5: 20,000 VUs enterprise results
├── 30k-results.md                                   # Stage 6: 30,000 VUs breakpoint results
├── 50k-results.md                                   # Stage 7: 50,000 VUs simulation model
├── 1m-simulation.md                                 # Stage 8: 1,000,000 VUs scaling calculations
├── websocket-results.md                             # Real-time WebSocket gateway benchmarks
├── database-results.md                              # PostgreSQL & MongoDB connection pool stress
├── redis-bullmq-results.md                          # Redis rate limiting & BullMQ queue latency
├── payment-results.md                               # Payment idempotency & webhook resilience
├── recovery-results.md                              # Cooldown velocity & memory leak tests
├── data-integrity-results.md                        # Post-stress transactional integrity audits
├── bottleneck-analysis.md                           # Limiting resources & breakpoint curves
├── evidence-index.md                                # File index & artifact catalog
├── SPICEGARDEN_PROGRESSIVE_LOAD_TEST_REPORT.md      # Executive comprehensive master report
└── evidence/
    ├── script-inventory.json                        # 23 cataloged load test scripts
    └── system-profile.json                          # Hardware & runtime snapshot
```

---

## 2. Artifact & Script Reference Matrix

| Artifact / Report | Primary Script Source | Verification Classification |
| :--- | :--- | :---: |
| [`baseline.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/baseline.md) | System Telemetry & `/health` | `VERIFIED` |
| [`workload-model.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/workload-model.md) | [`apps/backend/test/load/common.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/common.js) | `VERIFIED` |
| [`1k-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/1k-results.md) | [`infra/load-tests/stage-1-1k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-1-1k.js) | `VERIFIED` |
| [`5k-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/5k-results.md) | [`infra/load-tests/stage-2-5k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-2-5k.js) | `VERIFIED WITH LIMITATIONS` |
| [`10k-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/10k-results.md) | [`infra/load-tests/stage-3-10k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-3-10k.js) | `VERIFIED WITH LIMITATIONS` |
| [`15k-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/15k-results.md) | [`infra/load-tests/stage-4-20k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-4-20k.js) | `VERIFIED WITH LIMITATIONS` |
| [`20k-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/20k-results.md) | [`apps/backend/test/load/20k-users.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/20k-users.js) | `VERIFIED WITH LIMITATIONS` |
| [`30k-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/30k-results.md) | Host Ephemeral Port Limit | `BLOCKED — LOAD GENERATOR` |
| [`50k-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/50k-results.md) | [`infra/load-tests/stage-5-50k.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-5-50k.js) | `SIMULATED` |
| [`1m-simulation.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/1m-simulation.md) | [`infra/load-tests/stage-8-1m.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/stage-8-1m.js) | `1M VU SCRIPT VERIFIED / SIMULATED` |
| [`websocket-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/websocket-results.md) | [`infra/load-tests/websocket-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/websocket-stress.js) | `VERIFIED` |
| [`database-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/database-results.md) | [`apps/backend/test/load/db-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/db-stress.js) | `VERIFIED` |
| [`redis-bullmq-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/redis-bullmq-results.md) | [`apps/backend/test/load/redis-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/redis-stress.js) | `VERIFIED` |
| [`payment-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/payment-results.md) | [`apps/backend/test/load/payment-stress.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/test/load/payment-stress.js) | `VERIFIED` |
| [`recovery-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/recovery-results.md) | Post-Stress Profiler | `VERIFIED` |
| [`data-integrity-results.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/data-integrity-results.md) | Post-Stress Reconciler | `VERIFIED` |
| [`bottleneck-analysis.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/progressive-load/bottleneck-analysis.md) | Breakpoint Analysis Engine | `VERIFIED` |
