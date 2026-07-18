# Deployment Runbook

**Version:** 1.0.0
**Pipeline:** `.github/workflows/ci-cd.yml`

## 1. Pipeline stages
1. `security-audit` — `npm audit --audit-level=high` + Snyk.
2. `build-test` — lint, unit, coverage gate (80%), integration, e2e, build, load (`test:load`), Docker build, Trivy scan.
3. `deploy-staging` — `kubectl apply -f infra/k8s/staging.yaml` + rollout status.
4. `deploy-production` — `kubectl apply -f infra/k8s/production-hardened.yaml` + smoke + HPA/CronJob verify.

## 2. Pre-deploy checklist
- [ ] `npm run build` green on all workspaces
- [ ] `npm run lint` clean
- [ ] `npm run test:unit` + `:integration` + `:e2e` green
- [ ] `npm run test:load` (staging) within SLO
- [ ] Secrets rotated & loaded (`infra/scripts/load-secrets.sh`)
- [ ] DB migrations reviewed (`npm run migration:show`)
- [ ] Swagger off in prod (`SWAGGER_ENABLED=false`)

## 3. Deploy to staging
```bash
kubectl apply -f infra/k8s/staging.yaml
kubectl rollout status deployment/spicegarden-backend -n staging
```

## 4. Deploy to production
```bash
kubectl apply -f infra/k8s/production-hardened.yaml
kubectl rollout status deployment/spicegarden-backend -n production
kubectl get hpa
kubectl get cronjob
```

## 5. Post-deploy verification
- [ ] `GET /health` returns 200 on prod backend
- [ ] Smoke order flow (customer-web) succeeds
- [ ] Grafana dashboard populates; Alertmanager quiet
- [ ] Error rate < SLO for 15 min
