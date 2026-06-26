# Known Issues

**Date:** 2026-06-26
**Scope:** SpiceGarden Known Issues
**Classification:** Evidence-based

## Active Issues

### P0 - Critical

| Issue | Status | Impact | Recommendation |
|-------|--------|--------|----------------|
| Docker/K8s runtime unavailable | NOT VERIFIED | Cannot validate production deployment | Use cloud environment for validation |

### P1 - High Priority

| Issue | Status | Impact | Recommendation |
|-------|--------|--------|----------------|
| React Doctor warnings | IN PROGRESS | UI quality concerns | Phase 2 fixes |
| gRPC transport stubbed | STUBBED | Feature unavailable | Implement or remove |

### P2 - Medium Priority

| Issue | Status | Impact | Recommendation |
|-------|--------|--------|----------------|
| npm audit moderate vulnerabilities | MONITORED | Dev toolchain only, no runtime impact | Routine dependency update |
| Test teardown warning | OBSERVED | Potential memory leaks in tests | Add cleanup to tests |

### P3 - Low Priority

| Issue | Status | Impact | Recommendation |
|-------|--------|--------|----------------|
| TODO in seed.ts | DOCUMENTED | Incomplete seeding logic | Implement deterministic seeding |
| console.log in production code | REVIEWED | Operational logging only | No action needed |

## React Doctor Issues by App

| App | Score | Warning Count | Status |
|-----|-------|---------------|--------|
| customer-mobile | 65/100 | 126 | Phase 2 required |
| customer-web | 63/100 | 32 | Phase 2 required |
| delivery-partner | 59/100 | 51 | Phase 2 required |
| restaurant-dashboard | 74/100 | 5 | Low priority |
| super-admin | 62/100 | 10 | Phase 2 required |

## NOT VERIFIED

- Runtime validation in Docker/Kubernetes
- Mobile app on physical devices
- Load testing at 10k/20k users
- OpenSearch log ingestion
- Payment gateway with live keys
- Notification providers (FCM/Twilio)