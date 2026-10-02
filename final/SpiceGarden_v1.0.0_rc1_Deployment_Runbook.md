# SpiceGarden v1.0.0-rc1 — Production Deployment Runbook

**Date**: 2026-09-29  
**Version**: `v1.0.0-rc1`  

---

## 1. Prerequisites

1. **Kubernetes Cluster**: Version 1.28+ with metrics-server and ingress controller.
2. **PostgreSQL 16**: Managed cluster with PgBouncer connection pooler (`pool_size: 100`).
3. **Redis 7.2**: Cluster with persistence enabled (AOF / RDB).
4. **Secrets Sizing**: Secrets loaded into `spicegarden-secrets` Kubernetes Secret object.

---

## 2. Deployment Sequence

### Step 1: Apply Secrets & ConfigMap
```bash
kubectl apply -f infra/k8s/secrets.yaml
kubectl apply -f infra/k8s/configmap.yaml
```

### Step 2: Deploy Data Tier & Services
```bash
kubectl apply -f infra/k8s/postgres-ha.yaml
kubectl apply -f infra/k8s/redis-cluster.yaml
```

### Step 3: Deploy Production Backend & HPA
```bash
kubectl apply -f infra/k8s/production-hardened.yaml
```

### Step 4: Verify Deployment & Pod Status
```bash
kubectl get pods -l app=spicegarden-backend
kubectl get hpa spicegarden-backend-hpa
```

### Step 5: Verify Ingress Routing
```bash
kubectl apply -f infra/k8s/cdn-ingress.yaml
curl -I https://api.spicegarden.app/health
```

---

## 3. Rollback Procedure

If deployment health checks fail after rolling update:
```bash
kubectl rollout undo deployment/spicegarden-backend
kubectl rollout status deployment/spicegarden-backend
```
