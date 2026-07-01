# Changelog

All notable changes to SpiceGarden are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Phase 2 React Doctor integration across all workspaces (zero errors, 62 warnings remaining)
- `infra/scripts/breaking-point.js` — breaking point load testing script
- k6 load test suites: stage-1-1k through stage-8-1m, websocket-stress, database-stress, payment-stress, failure-injection, security-under-load
- Redis-backed `RedisRateLimitStore` with memory fallback for rate limiting
- Layered rate limiting for OTP, auth, orders, and general API routes
- WebSocket origin validation in tracking and KDS gateways
- `SEPARATE_THROTTLE_PER_METHOD` configuration support
- Dangerous HTTP method rejection middleware (TRACE, TRACK, DEBUG, CONNECT)
- PCI-DSS validation service with compliance endpoint
- SOC2 readiness service with security control assessments
- GDPR export and deletion request endpoints
- Secret rotation tracking service (JWT_SECRET, ENCRYPTION_SECRET, etc.)
- Data privacy service with PII masking/unmasking
- Fraud detection hardening service (velocity, daily totals, card testing, IP reputation)
- Payment hardening service with amount and frequency checks
- Centralized non-placeholder secret validation at bootstrap

### Changed

- TypeORM relation/select API updated from array syntax to object syntax across 46+ service files
- Trust proxy behavior now configurable via `TRUST_PROXY` environment variable
- CORS now rejects wildcard origins in production; requires explicit `CORS_ALLOWED_ORIGINS`
- Rate limiting skipped when `LOAD_TEST_MODE=true` and `NODE_ENV=development`
- Next.js native module warning on Windows (SWC WASM fallback) — non-blocking
- `LocalRepositoryModule` mock `findOne` fixed to respect `where` criteria

### Deprecated

- `grpc-transport` package remains quarantined with stub implementation; decision pending (implement or remove)

### Removed

- Unused `@rushstack/eslint-patch` from Next.js workspaces (customer-web, restaurant-dashboard, super-admin)

### Security

- `npm audit` reports **31 moderate vulnerabilities** (0 high, 0 critical); all are dev toolchain-only
- Security tests: **0 vulnerabilities** found (SQL injection, XSS, rate limiting, auth bypass, path traversal all pass)
- Penetration tests: **0 issues** (port scan, security headers, CORS, HTTP methods all pass)
- CSRF protection enforced globally with header + cookie validation
- HPP (HTTP Parameter Pollution) protection enabled
- Mongo sanitization active with custom compatibility layer

### Fixed

- 57 TypeScript compilation errors across 4 workspaces → 0 errors
- 22 missing TypeScript declaration files created (BullMQ, Sentry, lucide-react, expo-notifications)
- In-memory `LocalRepositoryModule` mock broken `findOne` returning first row regardless of criteria
- Auth registration flow blocked by broken mock (every subsequent register returned "Email already registered")
- Docker backend image runner stage missing `node_modules` — rebuild required
- Restaurant dashboard and admin dashboard fake static data replaced with real API calls
- Customer web hardcoded menu items replaced with `/business/restaurants/:id/menu` API fetch
- Backend `apis.service.ts` now returns real menu data from PostgreSQL

---

## [0.5.0] — 2026-06-20

### Added

- Phase 1 verification completed: build, lint, tests, security, penetration tests all passing
- React Doctor integration and initial fixes (errors reduced to 0)
- Fake-to-real data conversion across customer-web, restaurant-dashboard, super-admin
- `/kitchen/orders` and `/kitchen/inventory` endpoints for restaurant operations
- `apps/backend/src/types/` directory with TypeScript declaration files

### Changed

- Monorepo structure refined to 12 workspaces
- Backend entity count: 65 entities across all domains
- Controller count: 41 controllers
- Module count: 58 NestJS modules
- Service count: 60+ backend services
- `BUILD_FIX_REPORT.md` documented fixes for all workspaces (exit code 0 achieved)

### Fixed

- Backend build exit code 0 across all workspaces
- `tsc --noEmit` exit code 0 for all packages
- ESLint exit code 0 (0 errors)

---

## [0.4.0] — 2026-06-19

### Added

- Auth validation report: 15/15 endpoint tests passing (register, login, JWT, session management)
- 231 auth/service tests passing across 25 test suites
- Backend integration test suite with SQLite and in-memory mocks
- E2E test suite (35 tests passing)
- AUTH_ENTITY_AUDIT.md — comprehensive UserEntity analysis
- Repository inventory documentation (65 entities, 15+ services, 35+ infrastructure files)
- Backend audit report covering all modules

### Security

- Rate limiting verification: 96/100 requests correctly rate-limited
- Security script: 0 total vulnerabilities confirmed
- Argon2 password hashing verified in auth service
- JWT strategy with expiration enforcement verified

### Fixed

- Auth registration endpoint: duplicate email detection working
- Auth login endpoint: wrong password rejection working
- Session management: device info, IP tracking, expiry all verified

---

## [0.3.0] — 2026-06-17

### Added

- Security fix report documenting rate-limiting migration
- `RedisRateLimitStore` with configurable TTL and reset support
- Centralized secret validation at application bootstrap
- Per-endpoint rate limit layers (OTP, auth, orders, API)
- WebSocket connection origin validation
- Payment fraud hardening service
- CORS origin normalization with wildcard rejection

### Changed

- Rate limiting moved from single-route in-memory throttling to layered, route-aware system
- Default `trust proxy` behavior changed to disabled unless `TRUST_PROXY` is explicitly enabled
- Security middleware stack: Helmet, HPP, CORS allowlist, mongo sanitization, body limits, dangerous method rejection all retained

### Security

- `npm audit`: 51 moderate vulnerabilities (0 high/critical) at this stage
- P0 API abuse blocker resolved
- Redis-backed rate-limit store implemented (memory fallback when Redis unavailable)

---

## [0.2.0] — 2026-06-17

### Added

- Build stability report documenting TypeScript error resolution
- `apps/backend/src/types/bullmq.d.ts` — BullMQ type declarations
- `apps/backend/src/types/sentry-node.d.ts` — Sentry type declarations
- `lucide-react.d.ts` — icon component types
- `apps/customer-mobile/expo-notifications.d.ts` — push notification types

### Fixed

- 57 TypeScript errors across 4 workspaces → 0 errors
- 46 files updated from TypeORM array syntax to object syntax for `relations` and `select`
- 22 missing declaration files created for third-party libraries
- All 12 workspaces build successfully (exit code 0)
- `tsc --noEmit` passes for all TypeScript packages

---

## [0.1.0] — 2026-06-16

### Added

- Repository audit report with workspace inventory
- Initial 12-workspace npm monorepo structure
- 7 applications: backend, customer-web, restaurant-dashboard, super-admin, customer-mobile, delivery-partner, launcher
- 5 shared packages: ui, shared, proto, grpc-transport, api-types
- 65 backend entities, 41 controllers, 58 modules
- Docker Compose configuration (compose.dev.yaml, compose.prod.yaml, compose.debug.yaml, compose.infra.yaml)
- Kubernetes deployment configs (10 manifests)
- Prometheus/Grafana monitoring stack configuration
- OpenSearch logging configuration
- Load testing scripts (k6 stages 1k–1m)
- Security testing script (`infra/scripts/security-tests.js`)
- Penetration testing script (`infra/scripts/penetration-tests.js`)
- Backup/restore/disaster-recovery scripts

### Security

- Basic security middleware: Helmet, CORS, mongo-sanitize configured
- JWT authentication with Passport strategy
- Argon2 password hashing in auth service

### Infrastructure

- Dockerfiles for 6 services
- 5 Docker Compose files for dev, prod, debug, infra, and production
- 10 Kubernetes manifests for production-hardened deployment
- 18 scripts in `infra/scripts/`
- 10 scripts in `infra/load-tests/`

---

## Versioning Notes

| Version | Date | Key Deliverable |
|---------|------|-----------------|
| 0.1.0 | 2026-06-16 | Monorepo foundation, initial apps/packages |
| 0.2.0 | 2026-06-17 | Build stability fixes, zero TypeScript errors |
| 0.3.0 | 2026-06-17 | Security hardening, rate limiting, CSRF, CORS |
| 0.4.0 | 2026-06-19 | Auth validation, integration/E2E tests, backend audit |
| 0.5.0 | 2026-06-20 | Phase 1 verification, React Doctor, fake-to-real conversion |
| Unreleased | — | Phase 2 React Doctor improvements, production hardening |
