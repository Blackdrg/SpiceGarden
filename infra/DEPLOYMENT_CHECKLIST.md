# Production Deployment Checklist

## Pre-Launch Verification

### Staging Environment
- [ ] Deploy to staging: `kubectl apply -f infra/k8s/staging.yaml`
- [ ] Validate staging ingress: `kubectl get ingress -n spicegarden-staging`
- [ ] Run smoke tests: `curl https://staging-api.spicegarden.com/health`
- [ ] Verify TLS certificate: `kubectl get certificate -n spicegarden-staging`

### Production Environment
- [ ] Deploy hardened config: `kubectl apply -f infra/k8s/production-hardened.yaml`
- [ ] Verify deployment health: `kubectl get pods -l app=spicegarden-backend`
- [ ] Check rolling update strategy (maxSurge: 1, maxUnavailable: 0)
- [ ] Validate pod anti-affinity scheduling
- [ ] Confirm resource limits: 512Mi-1Gi memory, 500m-1000m CPU

### SSL/TLS
- [ ] Install cert-manager: `kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml`
- [ ] Configure Let's Encrypt cluster issuer
- [ ] Validate TLS secret: `kubectl get secret spicegarden-prod-tls`
- [ ] Test SSL renewal: Check cert-manager certificates are valid

### CDN Configuration
- [ ] Deploy CDN ingress: `kubectl apply -f infra/k8s/cdn-ingress.yaml`
- [ ] Verify static asset caching rules (30d for images/css/js)
- [ ] Confirm cache headers: X-Cache-Status, Cache-Control
- [ ] Test CDN endpoint: `curl -I https://cdn.spicegarden.com/images/test.jpg`

### Backups
- [ ] Create backup PVC: `kubectl apply -f infra/k8s/production-hardened.yaml` (includes backup-pvc)
- [ ] Verify CronJob schedule: `kubectl get cronjob spicegarden-backup`
- [ ] Test manual backup: `kubectl create job --from=cronjob/spicegarden-backup spicegarden-backup-test`
- [ ] Validate backup retention: 3 successful, 5 failed job history

### Disaster Recovery Tested
- [ ] Run DR validation: `bash infra/scripts/disaster-recovery.sh --production`
- [ ] Verify backup restoration procedure
- [ ] Test database restore from backup artifacts
- [ ] Validate secrets restoration: `kubectl get secret spicegarden-secrets`

### Monitoring Enabled
- [ ] Prometheus targets: `kubectl port-forward svc/prometheus 9090` → http://localhost:9090/targets
- [ ] Grafana dashboards: `kubectl get pods -l app=grafana`
- [ ] Alertmanager config: `kubectl get secret spicegarden-secrets -o jsonpath='{.data.slack-webhook-url}'`
- [ ] Verify SLO alerts: HighErrorRate, HighLatency, DatabaseDown, QueueFailures

### Domain Config
- [ ] DNS A record: api.spicegarden.com → Load Balancer IP
- [ ] DNS A record: cdn.spicegarden.com → Load Balancer IP
- [ ] DNS A record: monitoring.spicegarden.com → Grafana Load Balancer
- [ ] Verify DNS propagation: `nslookup api.spicegarden.com`

### DNS Failover
- [ ] Configure health check endpoints on DNS provider
- [ ] Set failover TTL: 60 seconds for critical endpoints
- [ ] Test failover: Temporarily stop pods, verify DNS switch
- [ ] Document failover runbook

### Autoscaling Verified
- [ ] Run validation: `bash infra/scripts/autoscaling-validation.sh spicegarden-production`
- [ ] Verify HPA: `kubectl get hpa spicegarden-backend-hpa -o yaml`
- [ ] Test scale up: Generate load > 50 RPS
- [ ] Confirm max replicas: 30 for production
- [ ] Verify custom metrics: requests_per_second, request_latency_95p

## Deployment Commands

```bash
# 1. Generate production secrets
bash infra/scripts/setup-secrets.sh

# 2. Update secrets.yaml with production values
kubectl create secret generic spicegarden-secrets \
  --from-env-file=secrets/production.env \
  -n spicegarden-production

# 3. Deploy to staging first
kubectl apply -f infra/k8s/staging.yaml

# 4. Deploy to production
kubectl apply -f infra/k8s/production-hardened.yaml

# 5. Validate autoscaling
bash infra/scripts/autoscaling-validation.sh spicegarden-production

# 6. Verify all components
kubectl get all -l app=spicegarden-backend
```

## Rollback Procedure

```bash
# Rollback deployment
kubectl rollout undo deployment/spicegarden-backend

# Restore from backup
bash infra/scripts/disaster-recovery.sh --production --backup-date YYYYMMDD_HHMMSS
```

## Health Endpoints

| Endpoint | Purpose | Expected |
|----------|---------|----------|
| `/health` | Basic liveness | `{ status: "ok" }` |
| `/health/secrets` | Secrets validation | `{ status: "ok" \| "degraded" }` |
| `/metrics` | Prometheus metrics | Text exposition format |
| `/compliance/soc2` | SOC2 readiness | Audit status |
| `/compliance/pci-dss` | PCI-DSS compliance | Payment security status |