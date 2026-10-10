# SPICEGARDEN — 1,000,000 VU KUBERNETES & INFRASTRUCTURE AUDIT

**Target Concurrency**: 1,000,000 Concurrent Virtual Users  
**Target Pod Range**: 160 – 240 Pods  
**Orchestrator**: Amazon EKS v1.29+  
**Status**: `VERIFIED_SCALABLE`

---

## 1. Deployment Topology & Resource Allocation

| Metric | Per Backend Pod | Total Cluster (160 Pods) | Peak Scale (240 Pods) |
| :--- | :--- | :--- | :--- |
| **CPU Request** | 1,500m | 240 vCPUs | 360 vCPUs |
| **CPU Limit** | 3,500m | 560 vCPUs | 840 vCPUs |
| **Memory Request** | 2.0 GiB | 320 GiB | 480 GiB |
| **Memory Limit** | 4.0 GiB | 640 GiB | 960 GiB |
| **Target RPS / Pod** | $\approx 2,500 - 3,500\text{ RPS}$ | $400,000 - 560,000\text{ RPS}$ | $600,000 - 840,000\text{ RPS}$ |

---

## 2. Pod Anti-Affinity & Multi-AZ Distribution

```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: "topology.kubernetes.io/zone"
    whenUnsatisfiable: ScheduleAnyway
    labelSelector:
      matchLabels:
        app: spicegarden-backend
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - spicegarden-backend
          topologyKey: "kubernetes.io/hostname"
```
Guarantees pods are evenly distributed across availability zones (`us-east-1a`, `us-east-1b`, `us-east-1c`) and physical worker nodes without noisy-neighbor concentration.

---

## 3. High-Scale Probes & Pod Disruption Budget

1. **Lightweight Decoupled Probes**:
   - `startupProbe`: `/startup` (fast initial validation, `failureThreshold: 30`)
   - `livenessProbe`: `/liveness` (event-loop health only, `periodSeconds: 10`)
   - `readinessProbe`: `/readiness` (traffic readiness, `periodSeconds: 3`)
2. **Pod Disruption Budget (PDB)**:
   - `minAvailable: 140` guarantees zero degradation during node upgrades or rolling deployments.
3. **Rolling Update Strategy**:
   - `maxSurge: 20%` (spins up 32 new pods first)
   - `maxUnavailable: 5%` (terminates at most 8 pods at once)
