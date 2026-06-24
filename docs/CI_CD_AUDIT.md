# CI/CD Audit

**Date:** 2026-06-23

---

## CI/CD Workflows

**Source:** `.github/workflows/`

| Workflow | Trigger | Stages | Status |
| -------- | ------- | ------ | ------ |
| `ci-cd.yml` | push/PR/cron | security-audit → build-test → deploy-staging → deploy-production | Configured |
| `react-doctor.yml` | PR push | React Doctor quality analysis | Configured |
| `rollback.yml` | workflow_dispatch | Production rollback via kubectl | Configured |

---

## CI Build-Test Stage

**Source:** `.github/workflows/ci-cd.yml:37-90`

| Step | Command | Status |
| ---- | ------- | ------ |
| Install | `npm ci` | ✅ Will pass |
| Lint | `npm run lint` | ✅ Will pass |
| Unit tests | `npm run test:unit` | ✅ Will pass |
| Coverage gate | `npm run test:cov` | ❌ Will fail (thresholds not met) |
| Integration tests | `npm run test:integration` | ✅ Will pass |
| E2E tests | `npm run test:e2e` | ⚠️ May fail on Windows runners |
| Build | `npm run build` | ✅ Will pass |
| Load test | `npm run test:load` | ⚠️ May fail (backend not running in CI) |

---

## Coverage Gate Enforcement

**Source:** `.github/workflows/ci-cd.yml:61-63`

```yaml
- name: Run backend coverage gate
  run: npm run test:cov
  working-directory: apps/backend
```

**Threshold:** 80% global (branches, functions, lines, statements)

**Current status:** Fails on branches (63.05%), functions (63.22%), lines (79.82%)

---

## Security Audit Stage

**Source:** `.github/workflows/ci-cd.yml:27-35`

| Step | Command | Status |
| ---- | ------- | ------ |
| npm audit | `npm audit --audit-level=high` | ✅ Will pass (0 high) |
| Snyk | Conditional | ⚠️ Requires `SNYK_TOKEN` secret |

---

## Deploy Stages

| Stage | Condition | Validation | Status |
| ----- | --------- | ---------- | ------ |
| Deploy staging | `develop` branch | Helm/kubectl | ⚠️ Unvalidated |
| Deploy production | `main` branch | Helm/kubectl | ⚠️ Unvalidated |

**Blockers:** Kubernetes cluster not available in current environment.

---

## CI Blind Spots

1. No k6 load test validation — tests require running backend service
2. No security test validation — requires running backend on port 3001
3. Windows SWC binary issues may affect e2e tests on Windows runners
4. No canary deployment validation
5. No database migration validation in CI