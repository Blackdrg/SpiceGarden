# SPICEGARDEN — FINAL BUYER EVIDENCE INDEX

**Purpose:** Comprehensive Technical Diligence & Evidence Provenance Register for Acquirers, Technical Auditors, and SRE Leadership.  
**Baseline Git Commit:** `d55af75f6039cb158c9a6823a46d1de170cd2567`  
**Classification Schema:** Forensically conservative demarcation across all capability layers.  

---

## 1. Evidence Directory Breakdown

| Classification Category | Scope & Description | Key Evidence Artifacts |
| :--- | :--- | :--- |
| **PHYSICALLY PROVEN** | Directly executed on physical hardware with measured RPS, latency percentiles, and error rates. | • [`L2_FINAL_PHYSICAL_RESULTS.json`](file:///c:/Users/mehta/Desktop/SpiceGarden/qa/scalability/proof/L2_FINAL_PHYSICAL_RESULTS.json)<br>• [`L2_FINAL_PHYSICAL_PROOF.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/qa/scalability/proof/L2_FINAL_PHYSICAL_PROOF.md)<br>• [`100K_PHYSICAL_VALIDATION_REPORT.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/performance/100K_PHYSICAL_VALIDATION_REPORT.md) |
| **AUTOMATEDALLY PROVEN** | Automated unit, integration, and security test suites executed and verified by test runners. | • Monorepo Build (12/12 workspaces exit 0)<br>• ESLint (0 errors)<br>• Backend Jest (73 suites, 1,142 tests passed)<br>• Automated Security Suites (0 vulnerabilities) |
| **CODE VERIFIED** | Static code analysis proving distributed statelessness, concurrency locks, and idempotency. | • [`redis-io.adapter.ts`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/infra/tracking/redis-io.adapter.ts)<br>• [`wallet.service.ts`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/services/wallet/wallet.service.ts)<br>• [`idempotency.service.ts`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/services/payments/idempotency.service.ts)<br>• [`redis-rate-limit.store.ts`](file:///c:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/security/redis-rate-limit.store.ts) |
| **SIMULATION / MODEL** | Mathematical models and simulations scaling empirical unit baselines to cluster tiers (50K–1M VUs). | • [`1M_SIMULATION_BENCHMARK_FINAL_REPORT.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/qa/final/1M_SIMULATION_BENCHMARK_FINAL_REPORT.md)<br>• [`qa/performance/1000k/manifest.json`](file:///c:/Users/mehta/Desktop/SpiceGarden/qa/performance/1000k/manifest.json) |
| **READY (NOT EXECUTED)** | Fully configured Terraform scripts, Kubernetes manifests, and load test suites awaiting target cluster. | • [`infra/terraform/`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/terraform/)<br>• [`infra/k8s/1m-physical-cluster.yaml`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/1m-physical-cluster.yaml)<br>• [`infra/k8s/staging.yaml`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/staging.yaml) |
| **BLOCKED (EXTERNAL)** | Blocked due to external infrastructure prerequisites (AWS CLI, AWS credentials, active cloud account). | • AWS STS Call Identity Check (CommandNotFoundException / No credentials)<br>• Cloud quota allocations |
| **NOT EXECUTED** | Third-party external activities not yet commissioned. | • External 3rd-Party Penetration Test |
