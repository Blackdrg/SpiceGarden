# Phase 6 — Web/Mobile Runtime & Deployment Proof Report

**Date:** 2026-06-22
**Status:** PARTIAL — CI/CD and manifests exist; no cluster deployment validated.

---

## 1. Web App Runtime Status

| App | Build | Lint | Unit Tests | Runtime Validated Against Backend |
|-----|-------|------|-----------|----------------------------------|
| customer-web | ✅ Pass | ✅ Pass | ✅ 11 tests pass | ❌ Not validated (Docker not running) |
| restaurant-dashboard | ✅ Pass | ✅ Pass | ✅ 9 tests pass | ❌ Not validated |
| super-admin | ✅ Pass | ✅ Pass | ✅ 23 tests pass | ❌ Not validated |

---

## 2. Mobile App Runtime Status

| App | Build | Lint | Unit Tests | Emulator / Device Validated |
|-----|-------|------|-----------|----------------------------|
| customer-mobile | ✅ Pass | ✅ Pass | ✅ 33 tests pass | ❌ Not validated |
| delivery-partner | ✅ Pass | ✅ Pass | ✅ 6 tests pass | ❌ Not validated |

**Caveats:**
- Mobile tests use `react-test-renderer` (deprecated warning).
- `expo-location` is used in delivery-partner but native emulator/device validation not performed.
- Geolocation stubs isolated; no critical mobile flow blockers identified in unit tests.

---

## 3. Deployment Path Status

| Path | Manifest | CI/CD | Runtime Validated |
|------|----------|-------|-------------------|
| Docker Compose | ✅ Valid | N/A | ❌ Docker Desktop not running |
| Kubernetes staging | ✅ `infra/k8s/staging.yaml` | ✅ `.github/workflows/ci-cd.yml` | ❌ No cluster |
| Kubernetes production | ✅ `k8s/production-hardened.yaml` | ✅ `.github/workflows/ci-cd.yml` | ❌ No cluster |

### CI/CD Pipeline Status

| Stage | Configured | Run in This Session |
|-------|-----------|---------------------|
| Security audit | ✅ | ❌ Not run |
| Lint | ✅ | ✅ All workspaces pass |
| Build | ✅ | ⚠️ Partial (timeout but component builds pass) |
| Unit tests | ✅ | ✅ 134+ backend tests pass |
| Integration tests | ✅ | ✅ Run via `npm run test:integration` |
| E2E tests | ✅ | ✅ Run via `npm run test:e2e` |
| Docker push | ✅ | ❌ Not run |
| Deploy staging | ✅ | ❌ Cluster unavailable |
| Deploy production | ✅ | ❌ Cluster unavailable |

**Observation:** Security audit in CI uses `npm audit --audit-level=moderate || true`, meaning it **fails open** on vulnerabilities.

---

## 4. K8s Manifest Fixes Applied

| File | Fix |
|------|-----|
| `k8s/backend-deployment.yaml` | containerPort 3000 → 3001; probe ports 3000 → 3001 |
| `infra/k8s/staging.yaml` | Verified present and valid (already existed) |

---

## 5. Recommended Next Steps

1. Run CI/CD pipeline against a real staging cluster.
2. Add `test:cov` to CI and fail on threshold misses.
3. Change CI security audit to `npm audit --audit-level=high` (remove `|| true`).
4. Validate `NEXT_PUBLIC_API_URL` in deployed frontend containers against backend service URL.
5. Add mobile Expo builds to CI pipeline.
