# Roadmap

**Date:** 2026-06-26
**Last Updated:** 2026-06-26T20:10 IST (Phase 3 completion)
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

## Phase 3: Runtime Validation (COMPLETE)

- ✅ Docker Compose verification (postgres, redis, mongo, prometheus, grafana, opensearch)
  - `docker-compose -f compose.dev.yaml up -d` — all 6 services started and healthy
  - `node infra/scripts/verify-stack.js` — PASS (5/5 checks OK)
- ✅ Security tests: 0 vulnerabilities in normal mode (rate limiting correct)
  - Note: With `LOAD_TEST_MODE=true`, rate limiting is intentionally disabled per `main.ts:136`
- ✅ Penetration tests: PASS (0 issues - port scan, headers, CORS, HTTP methods)
- ✅ Fake orders test: PASS
- ✅ Kubernetes YAML validation: 7/7 manifests pass `kubectl apply --dry-run=client`
- ✅ k6 load testing: installed (v1.7.1), smoke test executed and completed
  - 50 VUs, 356 complete iterations, 0 HTTP failures
  - signup_success: 100%, browse_restaurants_success: 100%
  - Rate limiting correctly disabled with `LOAD_TEST_MODE=true` and `NODE_ENV=development`
  - `main.ts:135-138` — rate limiters skipped when `LOAD_TEST_MODE=true` and not production
- ✅ Database schema: TypeORM `synchronize: true` (auto-sync, no migration files)
  - 52 entities in `db.module.ts` entities array
  - 64 entities in `db-repositories.module.ts` (includes additional modules)
- ✅ Backup/restore scripts: present and validated
  - `infra/scripts/backup.sh` — PostgreSQL pg_dump + MongoDB mongodump + Redis SAVE + tar.gz
  - `infra/scripts/restore.sh` — PostgreSQL psql restore + MongoDB mongorestore + Redis RDB restore
  - `infra/scripts/disaster-recovery.sh` — full DR procedure documented

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
| P2 | Docker backend image | Runner stage missing node_modules — rebuild required for containerized backend |

## Not Planned (Frozen)

Per `AGENTS.md`:
- No new modules
- No new AI features
- No redesign
- No extra dashboards
- No new frontend routes