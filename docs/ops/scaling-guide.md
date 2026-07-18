# Scaling Guide

**Version:** 1.0.0
**Owner:** Platform Engineering

## 1. Horizontal Scaling (HPA)
Kubernetes HPA on CPU (70%) and custom metrics (req/s, queue depth):
```bash
kubectl apply -f infra/k8s/production-hardened.yaml   # includes HPA defs
kubectl get hpa
infra/scripts/autoscaling-validation.sh production   # validates HPA behavior
```
- Backend is stateless → safe to scale horizontally.
- BullMQ workers scale independently of API pods.

## 2. Vertical Scaling
- Bump `resources.requests/limits` in the k8s manifests; redeploy.
- Postgres: increase instance class / connection pool (`TypeORM` pool size in env).
- Redis: increase memory limit; enable cluster mode if needed.

## 3. Database Scaling
- Read replicas for reporting/analytics queries.
- Connection pooling (PgBouncer) between API and Postgres.
- Index review via `npm run test:load` and slow-query logs.

## 4. Load validation
```bash
npm run test:load:1k      # smoke
npm run test:load:10k     # baseline
npm run test:load:20k     # peak
# 50k/100k/500k/1m for capacity planning
```
Results archived in `docs/prod-readiness/00-command-output/load-*.txt`.

## 5. Capacity planning
- Target: p99 < 2s at 10k concurrent; error budget > 0.
- Headroom: plan 2× expected peak; HPA maxReplicas set accordingly.
- See `docs/SCALABILITY.md` and `LOAD_AND_PERFORMANCE_REPORT.md`.
