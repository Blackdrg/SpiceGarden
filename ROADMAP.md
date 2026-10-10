# Roadmap

**Last Updated:** 2026-06-30
**Classification:** Evidence-based
**Status:** Phase 1 Complete, Phase 2 In Progress

---

## Phase 1: Foundation & Core Build (COMPLETE)

### Completed Deliverables

| Component | Description | Status |
|-----------|-------------|--------|
| Monorepo Structure | npm workspaces with 12 workspaces | ✅ Complete |
| Backend API | NestJS on port 3001, TypeScript strict | ✅ Complete |
| Backend Entities | 65 TypeORM entities across all domains | ✅ Complete |
| Backend Controllers | 41 REST controllers with validation pipes | ✅ Complete |
| Backend Modules | 58 NestJS feature modules | ✅ Complete |
| Backend Services | 60+ services with full business logic | ✅ Complete |
| Customer Web | Next.js app on port 3002, 23+ pages | ✅ Complete |
| Restaurant Dashboard | Next.js app on port 3003, 10+ pages | ✅ Complete |
| Super Admin | Next.js app on port 3004, 14+ pages | ✅ Complete |
| Customer Mobile | Expo/React Native app, 14+ screens | ✅ Complete |
| Delivery Partner | React Native mobile app | ✅ Complete |
| Launcher | Electron desktop application | ✅ Complete |
| Shared UI Library | `@spicegarden/ui` with 54+ TSX components | ✅ Complete |
| Shared Utilities | `@spicegarden/shared` domain types and helpers | ✅ Complete |
| API Types | `@spicegarden/api-types` shared contracts | ✅ Complete |
| Proto Definitions | `@spicegarden/proto` gRPC service definitions | ✅ Complete |

### Infrastructure Completed

| Component | Description | Status |
|-----------|-------------|--------|
| Docker Compose | compose.dev.yaml, compose.prod.yaml, compose.debug.yaml, compose.infra.yaml, compose.yaml | ✅ Complete |
| Dockerfiles | 6 Dockerfiles for containerized services | ✅ Complete |
| Kubernetes Manifests | 10 manifests (production-hardened, staging, secrets, configmap, postgres-ha, redis-cluster, backend, cdn-ingress) | ✅ Complete |
| Prometheus | prometheus.yml with alert rules and SLO definitions | ✅ Complete |
| Grafana | Dashboard provisioning and spicegarden.json dashboard | ✅ Complete |
| Alertmanager | alertmanager.yml routing configuration | ✅ Complete |
| OpenSearch | Index templates for log aggregation | ✅ Complete |
| Filebeat | Log shipping configuration | ✅ Complete |
| Envoy | Proxy configuration | ✅ Complete |

### Features Completed

| Domain | Implementation | Status |
|--------|---------------|--------|
| Authentication | JWT + OAuth2 (Google/Facebook), Argon2 hashing, session management, 30-day sessions | ✅ Complete |
| Authorization | 8 roles (CUSTOMER, RESTAURANT, KITCHEN_STAFF, DELIVERY_PARTNER, ADMIN, SUPER_ADMIN, SUPPORT_STAFF, FINANCE_STAFF), RBAC permission matrix | ✅ Complete |
| Orders | Full lifecycle (place, confirm, cancel, refund), status transitions, idempotency | ✅ Complete |
| Payments | Stripe, Razorpay, COD gateways; webhooks; fraud detection; chargeback handling | ✅ Complete |
| Wallets | Balance management, transactions, double-entry ledger | ✅ Complete |
| Restaurants | Branches, menus, onboarding, KDS (Kitchen Display System) | ✅ Complete |
| Drivers | Fleet management, assignment, shifts, incentives, penalties, documents | ✅ Complete |
| Delivery | Real-time tracking, dispatch, ETA calculation, WebSocket updates | ✅ Complete |
| Loyalty | Referrals, coupons, points system | ✅ Complete |
| GST/Compliance | Tax reporting, HSN/SAC codes, compliance endpoints | ✅ Complete |
| Finance | Reconciliation, tax reporting, payout reports | ✅ Complete |
| Analytics | Metrics, reporting, event tracking | ✅ Complete |
| Notifications | Push (FCM), email (SendGrid), SMS (Twilio), in-app, preferences | ✅ Complete |
| Search | Menu search, restaurant discovery | ✅ Complete |
| Support | Tickets, routing, customer support | ✅ Complete |
| Reviews | Restaurant and item review system, MongoDB storage | ✅ Complete |
| Refunds | Full refund lifecycle, approval workflows | ✅ Complete |
| Menu Customization | Variants, addons, item customization | ✅ Complete |
| Inventory | Inventory items, alerts, recipes, batch tracking | ✅ Complete |
| Queues | BullMQ (order_lifecycle, driver_assignment, notifications, refunds, analytics) | ✅ Complete |
| WebSocket | Real-time tracking gateway, KDS gateway | ✅ Complete |

### Verification Completed (Phase 1 Baseline)

| Check | Result | Evidence |
|-------|--------|----------|
| Build | ✅ PASS | 12 workspaces, exit code 0 |
| Lint | ✅ PASS | 0 errors across all workspaces |
| Unit Tests | ✅ PASS | 542 passed, 0 failed (28 suites) |
| Backend Coverage | ✅ PASS | Statements 91.28%, Branches 81.1%, Functions 91.22%, Lines 91.21% |
| Security Tests | ✅ PASS | 0 vulnerabilities (SQL injection, XSS, rate limiting, auth bypass, path traversal) |
| Penetration Tests | ✅ PASS | 0 issues (port scan, security headers, CORS, HTTP methods) |
| Stack Boot | ✅ PASS | Backend, Grafana, Prometheus, OpenSearch all reachable |

---

## Phase 2: Quality & Hardening (IN PROGRESS)

### In Progress

| Task | Description | Target | Current |
|------|-------------|--------|---------|
| React Doctor — customer-mobile | Fix 126 warnings to reach 80+ score | 80+/100 | 65/100 |
| React Doctor — customer-web | Fix 32 warnings to reach 80+ score | 80+/100 | 63/100 |
| React Doctor — delivery-partner | Fix 51 warnings to reach 80+ score | 80+/100 | 59/100 |
| React Doctor — restaurant-dashboard | Fix 5 warnings to reach 80+ score | 80+/100 | 74/100 |
| React Doctor — super-admin | Fix 10 warnings to reach 80+ score | 80+/100 | 62/100 |
| npm audit remediation | Resolve 31 moderate dev dependency vulnerabilities | 0 moderate | 31 remaining |
| Production hardening | Final security validation, dependency updates | Complete | In progress |
| Compliance validation | Complete PCI-DSS, SOC2, GDPR validation | Complete | In progress |

### Technical Debt Items

| Priority | Item | Status |
|----------|------|--------|
| P1 | React Doctor scores below 70 (mobile + super-admin) | ⚠️ In Progress |
| P2 | gRPC transport decision (implement or remove stubbed package) | ⚠️ Pending Decision |
| P3 | npm audit moderate vulnerabilities (dev toolchain only) | ⚠️ In Progress |
| P2 | Docker backend image rebuild (runner stage node_modules) | ⚠️ Preliminary |
| P3 | Root-level temp JSON file cleanup (_baseline.json, _scan_day9.json, etc.) | ⚠️ Cleanup |

---

## Phase 3: Production Readiness (PENDING)

### Remaining Work

| Task | Priority | Notes |
|------|----------|-------|
| Live payment gateway testing | P0 | Stripe/Razorpay with production keys |
| FCM/Twilio integration testing | P0 | Push and SMS delivery validation |
| Production secrets provisioning | P0 | Generate and deploy production secrets |
| Monitoring/alerting validation | P0 | Verify Prometheus/Grafana dashboards with real traffic |
| Security penetration tests (external) | P0 | Annual external pentest required for PCI-DSS compliance |
| MFA implementation | P0 | Currently non-compliant for PCI-DSS requirement 8.2 |
| Kubernetes cluster validation | P1 | Deploy to staging cluster and validate |
| Load testing (full stack) | P1 | 10k–100k user k6 scenarios |
| Disaster recovery演练 | P1 | Verify backup/restore procedures |
| Backup verification | P1 | Confirm PostgreSQL, MongoDB, Redis backup scripts work end-to-end |

---

## gRPC Transport (QUARANTINED)

**Decision Required**

- Current status: Stubbed (throws error on import)
- Purpose: Inter-service gRPC communication
- Options:
  1. Implement full gRPC transport
  2. Remove package to reduce maintenance burden

---

## Future Enhancements (FROZEN)

Per `AGENTS.md`, the following are **not planned** until explicitly approved:

- ❌ No new modules
- ❌ No new AI features
- ❌ No redesign
- ❌ No extra dashboards
- ❌ No new frontend routes

**Permitted work only:**
- ✅ Bug fixing
- ✅ Reliability improvements
- ✅ Deployment fixes
- ✅ Production hardening

---

## Milestone Timeline

| Milestone | Estimated Completion | Dependencies |
|-----------|---------------------|--------------|
| Phase 2 React Doctor fixes | 2026-07-15 | Frontend engineering capacity |
| npm audit remediation | 2026-07-30 | Dependency compatibility validation |
| Production hardening complete | 2026-08-15 | Phase 2 completion |
| Compliance sign-off | 2026-09-01 | MFA implementation, external pentest |
| Production deployment | 2026-09-15 | All blockers resolved |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| React Doctor scores stall below 70 | Medium | High | Prioritize mobile/web teams; extract giant components |
| npm audit moderate issues unpatched | Low | Medium | Dev-only; no production runtime impact |
| gRPC decision delayed | Medium | Low | Remove stub if no decision by Q3 |
| gRPC implementation attempted | Low | Medium | Requires architecture review and approval |
| Feature freeze violated | Low | High | Strict PR review gate; no new modules approved |
| MFA implementation skipped | Medium | High | PCI-DSS non-compliance; legal exposure |
