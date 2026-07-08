# Blockers

**Date:** 2026-07-08
**Scope:** SpiceGarden Deployment Blockers
**Classification:** Evidence-based

## P0 - Immediate Blockers (Cannot proceed)

| # | Blocker | Impact | Resolution Required |
|---|---------|--------|---------------------|
| 1 | Docker Desktop Service stopped | Cannot run postgres/redis/mongo locally | User must start Docker Desktop and ensure com.docker.service is running |

## P1 - High Priority Blockers (Must resolve before prod)

| # | Blocker | Impact | Resolution Required |
|---|---------|--------|---------------------|
| 1 | React Doctor scores < 70 (most workspaces) | UI quality issues | Install react-doctor in all workspaces and run Phase 2 fixes |
| 2 | gRPC transport quarantined | Inter-service communication via gRPC unavailable | Intentional - production flows use REST/WebSocket. Remove quarantine if gRPC is needed. |

## P2 - Medium Priority (Should resolve)

| # | Blocker | Impact | Resolution Required |
|---|---------|--------|---------------------|
| 1 | Test teardown warning | Jest worker process may leak | Investigate open handles in integration tests |
| 2 | Outdated JSX transform warning | Console noise in e2e tests | Update React JSX transform configuration |

## RESOLVED

| Issue | Resolution |
|-------|-----------|
| npm audit 31 moderate vulnerabilities | Regenerated yarn.lock with yarn 1.22.22 → 0 vulnerabilities |
| packages/shared test compilation errors | Added `"jest"` to tsconfig types array |
| C: drive full / ENOSPC | Freed ~2.3 GB, reinstalled dependencies |
| npm arborist Invalid Version bug | Switched to yarn 1.22.22 |
| Next.js build failures (super-admin, customer-web) | Fixed ESLint config, tsconfig settings |
| All workspace builds | Verified: 12 workspaces build successfully |
| All unit tests | Verified: backend 32, customer-web 11, restaurant-dashboard 9, super-admin 23, delivery-partner 6, shared 2, ui 28 |
| Backend integration tests | Verified: 1085 passed, 1 skipped |
| Backend e2e tests | Verified: 35 passed |
| Frontend integration/e2e tests | Verified: all pass across customer-web, restaurant-dashboard, super-admin, delivery-partner |

## NOT VERIFIED (Requires Docker)

These items cannot be verified without a running Docker daemon:

- Backend health endpoint
- Metrics endpoint
- WebSocket connectivity
- Database migrations
- Backup/restore procedures
- Load testing at scale
- Security runtime tests

## Resolution Path

1. **Phase 1 (COMPLETE):** Build, lint, unit tests, coverage - ✅ Done
2. **Phase 2 (IN PROGRESS):** React Doctor fixes, frontend quality
3. **Phase 3 (PENDING):** Runtime validation in containerized environment (blocked by Docker daemon)
4. **Phase 4 (PENDING):** Production deployment with live services