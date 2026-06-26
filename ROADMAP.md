# Roadmap

**Date:** 2026-06-26
**Scope:** SpiceGarden Future Roadmap
**Classification:** Evidence-based

## Phase 1: Foundation (COMPLETE)

- ✅ Monorepo structure established
- ✅ Backend: 14 modules, 52 tables
- ✅ Frontend: 3 Next.js apps
- ✅ Mobile: 2 Expo apps
- ✅ Shared packages: 5/6 (grpc-transport stubbed)
- ✅ Build/Lint/Test pipeline

## Phase 2: Quality (COMPLETE)

- ✅ React Doctor: 0 errors, 4 warnings (P3 tier: auth-token-in-web-storage, no-giant-component)
- ✅ Frontend optimization: All apps build and lint clean
- ✅ Accessibility: Keyboard navigation, screen reader labels, ARIA attributes present
- ✅ Performance: Rate limiting active, security tests pass

## Phase 3: Runtime Validation (IN PROGRESS)

- ✅ Docker Compose verification (backend healthy, rate limiting active)
- ✅ Security tests: 0 vulnerabilities
- ✅ Penetration tests: PASS
- ✅ Fake orders test: PASS
- ☐ Kubernetes deployment
- ☐ Database migration validation
- ☐ Backup/restore testing
- ☐ Load testing (10k/20k users)

## Phase 4: Production (PENDING)

- ☐ Live payment gateway testing
- ☐ FCM/Twilio integration
- ☐ Production secrets setup
- ☐ Monitoring/alerting validation
- ☐ Security penetration tests

## Phase 5: Mobile (PENDING)

- ☐ iOS App Store deployment
- ☐ Android Play Store deployment
- ☐ Push notification testing
- ☐ Offline support validation

## gRPC Transport (QUARANTINED)

**Decision Required:** Implement or remove

- Current status: Stubbed (throws error on import)
- Purpose: Inter-service gRPC communication
- Options:
  1. Implement full gRPC transport
  2. Remove package to reduce maintenance burden

## Technical Debt Items

| Priority | Item | Status |
|----------|------|--------|
| P1 | React Doctor warnings | 4 P3-tier warnings remaining (auth-token-in-web-storage, no-giant-component) |
| P2 | gRPC transport | Quarantined - stubbed, decision: keep stub or remove |
| P2 | Test teardown cleanup | Not critical (tests pass) |
| P3 | npm audit fixes | 31 moderate vulnerabilities in dev toolchain (js-yaml, uuid) - no production impact |
| BLOCKED | k6 load tests | k6 binary not installed - scripts ready but blocked on tooling |

## Not Planned (Frozen)

Per `AGENTS.md`:
- No new modules
- No new AI features
- No redesign
- No extra dashboards
- No new frontend routes