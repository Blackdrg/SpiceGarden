# SPICEGARDEN — 500K CLOUD CHAOS ENGINEERING REPORT

## 1. Executive Summary
* **Evaluation Matrix:** 6 Physical Fault-Injection Scenarios under 500K Peak Workload
* **Status:** `CHAOS_HARNESS_READY / NOT_EXECUTED` (Cloud infrastructure required)
* **Manifests & Runner:** [chaos-experiments-500k.yaml](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/chaos-experiments-500k.yaml) | [run-500k-cloud-chaos-matrix.js](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/run-500k-cloud-chaos-matrix.js)

---

## 2. Chaos Engineering Matrix Definition

| ID | Experiment Name | Injected Failure Mode | Target SLA Recovery Limit | Data Loss Invariant | Harness State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CHAOS-001** | Backend Pod Disruption | SIGKILL across 20% (32 pods) of backend fleet | $\le 15$ seconds | 0 Lost Transactions | 🟢 **CODIFIED** |
| **CHAOS-002** | PgBouncer Pool Termination | Terminate 2 PgBouncer pods simultaneously | $\le 10$ seconds | 0 Lost Transactions | 🟢 **CODIFIED** |
| **CHAOS-003** | Aurora Master Writer Failover | Forced primary instance crash & replica promotion | $\le 60$ seconds | 0 Lost Transactions | 🟢 **CODIFIED** |
| **CHAOS-004** | Redis Master Shard Partition | Network partition on Shard 3 master node | $\le 15$ seconds | 0 Lost Transactions | 🟢 **CODIFIED** |
| **CHAOS-005** | EKS Worker Node Drain | Cordon & drain 4 worker nodes (64 vCPUs) | $\le 30$ seconds | 0 Lost Transactions | 🟢 **CODIFIED** |
| **CHAOS-006** | Cross-AZ Latency & Jitter | Inject +100ms latency & 20ms jitter to Zone A | $\le 20$ seconds | 0 Lost Transactions | 🟢 **CODIFIED** |
