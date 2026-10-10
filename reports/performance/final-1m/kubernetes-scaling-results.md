# SpiceGarden — Phase 9: Kubernetes Scaling & Manifest Verification

**Manifests:** [`infra/k8s/production-hardened.yaml`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/production-hardened.yaml)  

---

## 1. Horizontal Scaling Model & Formula

Scaling efficiency is defined as:

$$\text{Scaling Efficiency} = \frac{\text{Actual Multi-Pod Throughput}}{N \times \text{Single-Pod Baseline Throughput}}$$

| Tier | Pod Count | Modeled RPS | Target CPU | Scaling Efficiency | Classification |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **1 Pod** | 1 | 1,373.3 | 88% | 100.0% (Baseline) | `MEASURED` |
| **5 Pods** | 5 | 6,900.0 | ~65% | 92.0% (Theoretical) | `CAPACITY MODEL` |
| **10 Pods**| 10 | 13,200.0 | ~70% | 88.0% (Theoretical) | `CAPACITY MODEL` |
| **50 Pods**| 50 | 58,000.0 | ~72% | 84.4% (Theoretical) | `CAPACITY MODEL` |
| **120 Pods**| 120 | 140,000.0 | ~75% | 84.9% (Theoretical) | `1M VU CAPACITY MODEL` |
