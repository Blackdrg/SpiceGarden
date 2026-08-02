# DevOps — Canary, Blue-Green, Rollback Validation

## Deployment Strategies

### Canary Deployment
- Deploy new version to 10% of pods
- Monitor error rate, latency, and business metrics for 15 minutes
- If metrics are healthy, gradually increase to 50%, then 100%
- If metrics degrade, automatically roll back to previous version
- Implemented via K8s Deployment with `rollingUpdate` strategy
- Canary analysis uses Prometheus metrics + Alertmanager alerts

### Blue-Green Deployment
- Maintain two identical environments (blue and green)
- Route traffic to the active environment
- Deploy new version to the inactive environment
- Run smoke tests against the inactive environment
- Switch traffic to the new environment
- Keep the old environment running for 24 hours as rollback safety net
- Switch back if issues detected within the observation window

### Rolling Deployment (Current Default)
- All K8s deployments use `RollingUpdate` strategy
- `maxSurge: 1`, `maxUnavailable: 0` ensures zero-downtime deployments
- Pod anti-affinity spreads pods across nodes
- Readiness probes ensure only healthy pods receive traffic
- Startup probes handle slow-starting containers

## Rollback Validation

### Automatic Rollback Triggers
1. Error rate > 5% for 5 consecutive minutes
2. P95 latency > 2x baseline for 5 consecutive minutes
3. Health check failures > 10% of pods
4. Memory usage > 90% for 10 consecutive minutes
5. Crash loop restart count > 3 in 5 minutes

### Manual Rollback Procedure
```bash
# Rollback to previous revision
kubectl rollout undo deployment/<name> -n spicegarden-production

# Rollback to specific revision
kubectl rollout undo deployment/<name> -n spicegarden-production --to-revision=<N>

# Monitor rollout status
kubectl rollout status deployment/<name> -n spicegarden-production

# View rollout history
kubectl rollout history deployment/<name> -n spicegarden-production
```

### Rollback Validation Steps
1. Verify previous revision pods are running and healthy
2. Check error rate returns to baseline within 5 minutes
3. Verify database migrations are compatible with previous version
4. Verify no data corruption from the failed deployment
5. Run smoke tests against the rolled-back deployment
6. Document the incident and root cause

## CI/CD Pipeline Integration

### Canary Pipeline
```yaml
# In ci-cd.yml
deploy-canary:
  steps:
    - Deploy new version to 10% of pods
    - Wait 15 minutes
    - Run automated health checks
    - If healthy: promote to 50% then 100%
    - If unhealthy: automatic rollback
```

### Blue-Green Pipeline
```yaml
# In ci-cd.yml
deploy-blue-green:
  steps:
    - Deploy to inactive environment
    - Run smoke tests
    - If tests pass: switch traffic
    - If tests fail: keep current environment
    - Observe for 24 hours
```

## Rollback Validation Checklist
- [ ] Previous revision pods are healthy
- [ ] Error rate at baseline
- [ ] Latency at baseline
- [ ] Database schema compatible
- [ ] No data corruption
- [ ] Smoke tests pass
- [ ] Incident documented
- [ ] Root cause identified
- [ ] Fix deployed and verified