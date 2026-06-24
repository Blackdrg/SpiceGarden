# Known Blockers and Gaps

**Date:** 2026-06-23

---

## P0 Blockers (Immediate)

| # | Blocker | Impact | Fix Required |
| - | ------- | ------ | ------------ |
| 1 | Coverage threshold failure | CI/CD blocked | +20-30 tests for branches/functions |
| 2 | 31 npm audit moderate vulnerabilities | Security risk | Dev toolchain updates (non-critical) |
| 3 | Production secrets incomplete | Deployment blocked | 13 provider keys needed |
| 4 | Docker daemon unavailable | Full stack validation blocked | Docker Desktop access |
| 5 | K8s cluster unavailable | Deploy validation blocked | Cluster access |
| 6 | Runtime security tests blocked | Unvalidated security | Start backend on port 3001 |

---

## P1 Blockers (High)

| # | Gap | Impact |
| - | --- | ------ |
| 1 | Live payment gateway validation | No production payment flow |
| 2 | Live notification provider validation | No email/SMS/push in production |
| 3 | Mobile native build validation | No device runtime evidence |
| 4 | gRPC transport still stubbed | Not usable for production |
| 5 | RBAC endpoint coverage audit | Security gap in authorization |
| 6 | Observability stack runtime | No metrics/logs/alerting validated |

---

## P2 Blockers (Medium)

| # | Gap | Notes |
| - | --- | ----- |
| 1 | Sentry runtime validation | Error tracking unvalidated |
| 2 | Expo CI builds | Mobile app store deployment blocked |
| 3 | Historical documentation cleanup | Docs reconciliation ongoing |
| 4 | Driver app implementation | Currently stubbed (1 screen) |
| 5 | Full load test (10k/20k) | Not executed |

---

## Environment Blockers

| Resource | Status | Required For |
| -------- | ------ | ------------ |
| Docker daemon | ❌ Unavailable | Compose stack, full validation |
| Kubernetes API | ❌ Unavailable | k8s deploy validation |
| MongoDB | ❌ Unavailable | Some tests, production state |
| Redis | ❌ Unavailable | Rate limiting, queues |
| Running backend | ❌ Unavailable | Security tests, health checks |

---

## Build/Runtime Blockers

| Component | Block Reason | Workaround |
| --------- | ------------ | ---------- |
| UI package | Previously TS errors (fixed) | `lucide-react.d.ts` added |
| customer-web e2e tests | SWC binary Windows issue | Run on Linux/macOS |
| super-admin e2e tests | SWC binary Windows issue | Run on Linux/macOS |