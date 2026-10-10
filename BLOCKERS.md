# Blockers

**Date:** 2026-06-26
**Scope:** SpiceGarden Deployment Blockers
**Classification:** Evidence-based

## P0 - Immediate Blockers (Cannot proceed)

| # | Blocker | Impact | Resolution Required |
|---|---------|--------|---------------------|
| 1 | Docker Desktop unavailable | Cannot run services locally | Use cloud/container environment |
| 2 | Kubernetes cluster unreachable | Cannot deploy production | Configure cluster access |

## P1 - High Priority Blockers (Must resolve before prod)

| # | Blocker | Impact | Resolution Required |
|---|---------|--------|---------------------|
| 1 | React Doctor scores < 70 | UI quality issues | Phase 2 fixes (in progress) |
| 2 | gRPC transport stubbed | Inter-service communication feature missing | Implement or remove |
| 3 | Mobile device validation | Cannot verify native builds | Physical device testing |

## P2 - Medium Priority (Should resolve)

| # | Blocker | Impact | Resolution Required |
|---|---------|--------|---------------------|
| 1 | npm audit moderate vulns | Dev dependency noise | Dependency update |
| 2 | Test teardown warnings | Memory leak risk | Add proper cleanup |
| 3 | TODO in seed.ts | Incomplete seeding | Implement logic |

## NOT VERIFIED (Unknown status)

These items cannot be verified without runtime access:

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
3. **Phase 3 (PENDING):** Runtime validation in containerized environment
4. **Phase 4 (PENDING):** Production deployment with live services