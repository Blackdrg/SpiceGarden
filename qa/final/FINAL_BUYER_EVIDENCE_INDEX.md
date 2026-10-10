# SPICEGARDEN — FINAL BUYER EVIDENCE INDEX & DUE DILIGENCE DOSSIER

## 1. Master Evidence Matrix

| Area | Status | Evidence Document | Environment | Limitation / Boundary | Classification |
|---|---|---|---|---|---|
| **Build & Typecheck** | **12/12 PASS** | `qa/final/FINAL_REMEDIATION_REPORT.md` | Monorepo Workspaces | None (Exit Code 0 across all 12) | `PROVEN_CODE` |
| **Lint & Style** | **0 Errors** | `qa/final/FINAL_REMEDIATION_REPORT.md` | Monorepo Workspaces | None (0 ESLint errors) | `PROVEN_CODE` |
| **Unit & Integration Tests** | **98/98 Suites, 1246 Tests** | `qa/final/FINAL_TEST_EXECUTION.md` | Monorepo Workspaces | 100% Pass, 0 Failures | `PROVEN_CODE` |
| **Backend Coverage** | **>80% All Metrics** | `qa/final/FINAL_TEST_EXECUTION.md` | Backend Workspace | Statements 91.28%, Branches >80%, Functions >90%, Lines >90% | `PROVEN_CODE` |
| **Security Assessment** | **Zero Observed Failures** | `qa/final/FINAL_SECURITY_STATUS.md` | Local Security Suite | Zero observed failures across documented automated security test vectors; 3rd-party pentest unexecuted | `PROVEN_AUTOMATED` |
| **Payments & Idempotency** | **Verified in Code/Sandbox** | `qa/final/FINAL_REMEDIATION_REPORT.md` | Jest / Sandbox | Live bank clearing requires merchant account | `PROVEN_CODE` |
| **Inventory Concurrency** | **Verified in Code** | `qa/final/FINAL_TEST_EXECUTION.md` | Jest / SQLite / Postgres | Zero negative stock proven under concurrent requests | `PROVEN_CODE` |
| **Tenant Isolation** | **Verified in Code** | `qa/final/FINAL_TEST_EXECUTION.md` | Backend Test Suite | Strict row-level tenant filtering verified | `PROVEN_CODE` |
| **Redis & WebSockets** | **Verified in Code** | `qa/final/FINAL_DISTRIBUTED_STATUS.md` | Backend & Redis Adapter | Multi-pod pub/sub architecture verified in code | `PROVEN_CODE` |
| **PostgreSQL / PgBouncer** | **Hardened Manifests** | `infra/k8s/postgres-ha.yaml` | K8s Manifests | PgBouncer connection pool configured | `READY_NOT_EXECUTED` |
| **Local Physical Load** | **1,278.63 RPS (Laptop) / 2,150.00 RPS (Rig)** | `qa/final/FINAL_PERFORMANCE_STATUS.md` | Physical Hosts | Laptop limited by Windows Winsock 10055; Rig reached breaking point at 22.4K VUs | `PROVEN_PHYSICAL` |
| **500K VU Distributed Benchmark** | **Plan & Architecture Ready** | `qa/scalability/500k/FINAL_500K_STATUS.md` | Target 40x c6i Fleet | 500K AWS physical cloud execution is BLOCKED_EXTERNAL (AWS credentials required) | `BLOCKED_EXTERNAL` |
| **AWS Cloud Load** | **Modeled Target** | `qa/final/FINAL_AWS_STATUS.md` | Theoretical Fleet | AWS PHYSICAL VALIDATION: BLOCKED_EXTERNAL | `MODEL_ONLY` |
| **1M VU Scalability** | **Modeled Target** | `qa/final/FINAL_AWS_STATUS.md` | Target 40x c6i fleet | Requires distributed cloud generator fleet | `MODEL_ONLY` |
| **585K RPS Throughput** | **Modeled Target** | `qa/final/FINAL_AWS_STATUS.md` | Target 160-pod cluster | Unexecuted in physical cloud | `MODEL_ONLY` |
| **Soak Stability** | **Codebase Stable** | `qa/final/FINAL_SOAK_STATUS.md` | Local Monorepo | Multi-hour cloud soak test requires AWS cluster | `READY_NOT_EXECUTED` |
| **Chaos Resilience** | **Code Verified** | `qa/final/FINAL_CHAOS_STATUS.md` | Backend Jest Suites | Pod-kill tests require live Kubernetes cluster | `PROVEN_CODE` |
| **Disaster Recovery** | **Scripts Ready** | `qa/final/FINAL_DR_STATUS.md` | Automation Scripts | Target RTO <15m, Target RPO <5m (restore drill unexecuted) | `READY_NOT_EXECUTED` |
| **Mobile Hardware** | **Code & Bundle Pass** | `qa/final/FINAL_TEST_EXECUTION.md` | Mobile Workspace | Physical device lab testing unexecuted | `PROVEN_CODE` |
