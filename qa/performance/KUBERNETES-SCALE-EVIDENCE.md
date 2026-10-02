# SPICEGARDEN — KUBERNETES SCALE EVIDENCE & EKS SIZING

**Document Control:** `K8S-EVID-002` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-03T01:52:00.000Z`  
**Standard:** Kubernetes EKS Cluster Topology & HPA Autoscaling Derivation

---

## 1. Kubernetes Sizing Derivation for 1M Workload

| Tier / Milestone | Target Concurrency | Target Ingress RPS | Backend API Pods | Dedicated BullMQ Pods | PgBouncer Pods | EKS Worker Nodes (`c6i.4xlarge`) | Node CPU Target |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **50K Scale** | 50,000 VUs | 6,900 RPS | 5 Pods | 4 Pods | 2 Pods | 2 Nodes (32 vCPUs) | ~65% |
| **100K Scale** | 100,000 VUs | 13,200 RPS | 10 Pods | 6 Pods | 2 Pods | 3 Nodes (48 vCPUs) | ~70% |
| **250K Scale** | 250,000 VUs | 34,000 RPS | 25 Pods | 10 Pods | 3 Pods | 5 Nodes (80 vCPUs) | ~70% |
| **500K Scale** | 500,000 VUs | 58,000 RPS | 50 Pods | 15 Pods | 4 Pods | 8 Nodes (128 vCPUs) | ~72% |
| **750K Scale** | 750,000 VUs | 103,500 RPS | 75 Pods | 18 Pods | 5 Pods | 11 Nodes (176 vCPUs) | ~74% |
| **1,000,000 Scale**| 1,000,000 VUs | 140,000 RPS | 120 Pods | 20 Pods | 6 Pods | 15 Nodes (240 vCPUs) | ~75% |

---

## 2. Pod Resource Allocation & Reliability Manifest

* **Backend Pod Resources:**
  ```yaml
  resources:
    requests:
      cpu: "1000m"
      memory: "1536Mi"
    limits:
      cpu: "2000m"
      memory: "2048Mi"
  ```
* **Horizontal Pod Autoscaling (HPA):**
  - Min Replicas: 30, Max Replicas: 150
  - Target CPU Utilization: 70%
  - Target Memory Utilization: 75%
* **Pod Disruption Budgets (PDB):** `minAvailable: 80%` to guarantee zero-downtime rolling deployments during peak scale.
* **Manifests Location:** Audited in [`infra/k8s/production-hardened.yaml`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/production-hardened.yaml).
