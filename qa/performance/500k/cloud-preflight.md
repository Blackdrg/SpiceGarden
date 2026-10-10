# SPICEGARDEN — CLOUD PRE-FLIGHT VERIFICATION MATRIX (500K TIER)

**Document Control:** `PREFLIGHT-500K-AWS-001`  
**Target Workload:** `500,000 Concurrent Virtual Users (500K VUs)`  
**Audit Standard:** Strict Technical Due Diligence, Zero Synthetic Claim Toleration  
**Audit Timestamp:** `2026-10-03T11:40:00.000Z`

---

## 1. Cloud Pre-Flight Matrix

| ID | Component / Check | Expected Requirement | Actual Status | Verdict | Evidence / Reference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CHK-AWS-CLI** | AWS CLI & IAM Profile | CLI v2 installed with EC2/EKS/ALB provisioning IAM roles | `aws` CLI not installed in execution PATH; no active profile | **BLOCKED** | Shell execution error code 1 |
| **CHK-DOCKER** | Docker Engine Daemon | Running daemon for local container execution / runner tests | Daemon offline (npipe unreachable) | **BLOCKED** | `docker ps` daemon connection error |
| **CHK-EC2-QUOTA** | EC2 vCPU Regional Quota | Min 200–400 vCPUs for 25x–50x `c6i.2xlarge` generators | Unverified assumption (requires cloud connection) | **UNVERIFIED ASSUMPTION** | AWS Service Quotas pending |
| **CHK-EKS** | Amazon EKS Cluster | Active 7x `c6i.4xlarge` cluster with 50 NestJS pods | Manifests configured (`infra/k8s/production-hardened.yaml`) | **CONFIGURED** | Target endpoint unprovisioned |
| **CHK-ALB** | AWS ALB Pre-warming | Multi-AZ ALB pre-warmed to 40 LCUs (>60k RPS capacity) | Ingress defined (`infra/k8s/cdn-ingress.yaml`) | **CONFIGURED** | Live ALB DNS unassigned |
| **CHK-REDIS** | ElastiCache Redis Cluster | 6-shard cluster (12 nodes `cache.r6g.xlarge`) | Cluster manifests ready in `infra/` | **CONFIGURED** | Live cluster unprovisioned |
| **CHK-POSTGRES** | Aurora PostgreSQL + PgBouncer | `db.r6g.8xlarge` with 220–420 PgBouncer transaction pool | TypeORM & PgBouncer manifests configured | **CONFIGURED** | Local DB fallback active |
| **CHK-K6-LOCAL** | Local k6 Binary | k6 engine installed for scenario execution | k6 v2.2.0 installed (Windows x86_64) | **PASS (LOCAL ONLY)** | `k6 version` returns v2.2.0 |

---

## 2. Pre-Flight Conclusion & Hard Blocker Statement

> [!CAUTION]
> **PRE-FLIGHT HARD BLOCKER:**  
> The physical execution of the 500,000 VU distributed benchmark requires an active, authenticated AWS cloud environment to provision the 25x `c6i.2xlarge` Linux generator fleet, the multi-AZ Application Load Balancer, the Amazon EKS cluster, and the Redis/PostgreSQL data tiers.
> 
> Because this local execution environment lacks direct AWS cloud credentials and connectivity, the 500K distributed physical run **cannot physically execute on live cloud hardware from this session**.
> 
> All 500K scenarios, distributed runners, orchestration manifests, and runbooks are **FULLY CONFIGURED AND REPRODUCIBLE** in `infra/load-tests/` and `infra/k8s/`.
