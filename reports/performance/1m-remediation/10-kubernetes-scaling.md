# SpiceGarden Performance Remediation — 10: Kubernetes Architecture & Deployment Hardening

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Kubernetes Manifest Specifications

Hardened manifests in [`infra/k8s/production-hardened.yaml`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/production-hardened.yaml) establish:

* **Resource Allocation:** Requests: 1000m CPU / 1Gi RAM; Limits: 2000m CPU / 2Gi RAM.
* **Probes:** Startup (failureThreshold: 30), Liveness (15s delay), Readiness (10s delay).
* **High Availability:** `PodDisruptionBudget` (minAvailable: 80%) and `topologySpreadConstraints` across 3 availability zones.
* **Graceful Termination:** 30s `terminationGracePeriodSeconds` ensuring in-flight HTTP and BullMQ jobs complete.
