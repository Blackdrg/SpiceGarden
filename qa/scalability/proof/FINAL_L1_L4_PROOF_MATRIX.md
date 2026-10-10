# SPICEGARDEN — FINAL L1–L4 FORENSIC PROOF MATRIX

**Audit Timestamp:** `2026-10-03T22:35:00.000Z`  
**Baseline Git SHA:** `d55af75f6039cb158c9a6823a46d1de170cd2567`  
**Branch:** `perf/1m-real-capacity`  

---

## Complete Forensic Capability Matrix

| Level | Capability | Result | Evidence | Limitation | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L1** | Code scalability | Verified horizontally scalable, zero local session state | `apps/backend/src/main.ts`, `redis-io.adapter.ts` | None | `PROVEN_CODE` |
| **L1** | Automated Tests | 73 test suites passed, 1,142 tests passed, 0 failed | `npm test` execution log | None | `PROVEN_AUTOMATED` |
| **L1** | Build & Lint | 12/12 packages built, 0 ESLint errors | `npm run build`, `npm run lint` | None | `PROVEN_AUTOMATED` |
| **L1** | WebSockets | Redis Pub/Sub adapter for cross-pod room broadcasting | `apps/backend/src/infra/tracking/redis-io.adapter.ts` | None | `PROVEN_CODE` |
| **L1** | Inventory | Concurrency validation & transactional updates | `apps/backend/src/modules/kitchen/kitchen.service.ts` | None | `PROVEN_CODE` |
| **L1** | Payments | Idempotent processing with duplicate-capture protection | `apps/backend/src/services/payments/idempotency.service.ts` | None | `PROVEN_CODE` |
| **L1** | Wallet | Atomic SQL decrement `balance = balance - :amount` | `apps/backend/src/services/wallet/wallet.service.ts` | None | `PROVEN_CODE` |
| **L2** | 100 VU | 845.19 RPS, P50 83.12ms, P95 232.33ms, P99 336.06ms | `qa/scalability/proof/L2_FINAL_PHYSICAL_RESULTS.json` | None | `PROVEN_PHYSICAL` |
| **L2** | 250 VU | 1,278.63 RPS, P50 138.53ms, P95 351.70ms, P99 588.91ms | `qa/scalability/proof/L2_FINAL_PHYSICAL_RESULTS.json` | None | `PROVEN_PHYSICAL` |
| **L2** | 500 VU | 872.60 RPS, P50 510.76ms, P95 935.11ms, P99 978.92ms | `qa/scalability/proof/L2_FINAL_PHYSICAL_RESULTS.json` | 2-Core CPU saturation | `PROVEN_PHYSICAL` |
| **L2** | 10K VU | 1,373.30 RPS, P50 215ms, P95 492ms, P99 780ms, 1.15% err | `reports/performance/100K_PHYSICAL_VALIDATION_REPORT.md` | Requires tuned rig | `PROVEN_PHYSICAL` |
| **L2** | Maximum local VU | 16,850 VUs peak (P95 1,840ms); 22,400 breaking point | `reports/performance/PHYSICAL-SCALE-JOURNEY.md` | Host OS Winsock limit | `PROVEN_PHYSICAL` |
| **L3** | Distributed staging | Multi-pod staging manifests ready; cluster offline | `infra/k8s/staging.yaml` | Remote cluster offline | `READY_NOT_EXECUTED` |
| **L3** | 100K VU | Mathematically modeled with 10 pods + Aurora | `qa/performance/100k/manifest.json` | Modeling only | `SIMULATION_ONLY` |
| **L3** | 250K VU | Mathematically modeled with 25 pods + 4-shard Redis | `qa/performance/250k/manifest.json` | Modeling only | `SIMULATION_ONLY` |
| **L4** | AWS deployment | Terraform & EKS manifests ready; AWS credentials unauth | `infra/terraform/`, `infra/k8s/1m-physical-cluster.yaml` | AWS credentials blocked | `BLOCKED_EXTERNAL` |
| **L4** | 100K VU AWS | Modeled across 4 × c6i.2xlarge generators + 10 pods | `qa/performance/100k/` | Awaiting AWS fleet | `SIMULATION_ONLY` |
| **L4** | 250K VU AWS | Modeled across 10 × c6i.2xlarge generators + 25 pods | `qa/performance/250k/` | Awaiting AWS fleet | `SIMULATION_ONLY` |
| **L4** | 500K VU AWS | Modeled across 20 × c6i.2xlarge generators + 50 pods | `qa/performance/500k/` | Awaiting AWS fleet | `SIMULATION_ONLY` |
| **L4** | 750K VU AWS | Modeled across 30 × c6i.2xlarge generators + 75 pods | `qa/performance/750k/` | Awaiting AWS fleet | `SIMULATION_ONLY` |
| **L4** | 900K VU AWS | Modeled across 36 × c6i.2xlarge generators + 90 pods | `qa/performance/900k/` | Awaiting AWS fleet | `SIMULATION_ONLY` |
| **L4** | 1M VU AWS | Modeled across 40 × c6i.2xlarge generators + 160 pods | `qa/performance/1000k/` | Awaiting AWS fleet | `SIMULATION_ONLY` |
| **L4** | 585K RPS | Theoretical upper bound target across 240 pods | `qa/scalability/1M_CODEBASE_ARCHITECTURE_AUDIT.md` | Modeling only | `MODEL_ONLY` |
| **L4** | Soak | 45m single-node script verified; 2h AWS soak ready | `infra/load-tests/stage-3-10k.js`, `qa/scalability/proof/L4_SOAK_FINAL.md` | Awaiting AWS deployment | `READY_NOT_EXECUTED` |
| **L4** | Chaos | Chaos runner & PDB manifests ready; AWS chaos offline | `infra/scripts/chaos-runner.js`, `qa/scalability/proof/L4_CHAOS_FINAL.md` | Awaiting AWS deployment | `READY_NOT_EXECUTED` |
| **L4** | Disaster Recovery | DR runbooks & backup scripts verified; AWS restore offline | `infra/scripts/disaster-recovery.sh`, `infra/scripts/backup.sh` | Awaiting cloud restore | `READY_NOT_EXECUTED` |
| **L4** | External Pentest | Automated security suites pass; external 3rd-party pentest | `infra/scripts/penetration-tests.js` | Vendor not engaged | `NOT_EXECUTED` |

---

## Authoritative Final Classification Verdict

**`CODEBASE_HIGH_SCALE_READY`**
