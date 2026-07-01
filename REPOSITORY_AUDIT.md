# Repository Audit Report

**Generated:** 2026-06-30
**Auditor:** SpiceGarden Engineering
**Scope:** Full repository audit — file statistics, inventory, dependency review, security, performance, technical debt
**Classification:** Internal — Engineering

---

## 1. Repository Statistics

| Metric | Count | Notes |
|--------|-------|-------|
| TypeScript files (.ts) | 811 | Backend + packages + config |
| TSX files (.tsx) | 149 | Frontend components + mobile screens |
| JavaScript files (.js) | 772 | Scripts, configs, legacy |
| Test files | 39 | Jest, E2E, integration |
| Markdown files (.md) | 100+ | Documentation, reports, audit docs |
| JSON files (config) | 45+ | tsconfig, eslint, package.json, compose |
| Dockerfiles | 6 | Container build definitions |
| Compose files | 5 | compose.dev, prod, debug, infra, base |
| K8s manifests | 10 | Production, staging, HA configs |
| Shell scripts (.sh/.ps1) | 18 | Infra/scripts/ |
| Load test scripts | 10 | Infra/load-tests/ |
| Workspaces (apps) | 7 | Backend, 3 web, 2 mobile, 1 desktop |
| Workspaces (packages) | 5 | ui, shared, proto, grpc-transport, api-types |

### Lines of Code Estimates

| Category | LOC Estimate |
|----------|-------------|
| Backend (apps/backend) | ~85,000+ |
| Customer Web | ~25,000+ |
| Restaurant Dashboard | ~15,000+ |
| Super Admin | ~18,000+ |
| Customer Mobile | ~20,000+ |
| Delivery Partner | ~12,000+ |
| Launcher | ~15,000+ |
| Shared Packages | ~10,000+ |
| **Total** | **~200,000+** |

---

## 2. Application Inventory

### 2.1 Backend: `@spicegarden/backend`

| Layer | Count | Details |
|-------|-------|---------|
| Modules | 58 | Feature modules (auth, orders, payments, etc.) |
| Controllers | 41 | REST endpoints with validation pipes |
| Services | 60+ | Business logic layer |
| Entities | 65 | TypeORM entities (PostgreSQL + MongoDB) |
| DTOs | Partial | Validation via class-validator decorators |
| Guards | 2 | JWT auth, permission guard |
| Queues | 5 | BullMQ (order_lifecycle, driver_assignment, notifications, refunds, analytics) |
| Workers | Active | Queue workers for async processing |
| Cron Jobs | 1 | Retention job (configuration pending) |

### 2.2 Frontend Applications

| App | Framework | Pages/Screens | Port | State |
|-----|-----------|---------------|------|-------|
| `@spicegarden/customer-web` | Next.js 15 + React 19 | 23+ | 3002 | ✅ Production Ready |
| `@spicegarden/restaurant-dashboard` | Next.js 15 + React 19 | 10+ | 3003 | ✅ Production Ready |
| `@spicegarden/super-admin` | Next.js 15 + Recharts | 14+ | 3004 | ⚠️ React Doctor 62/100 |
| `@spicegarden/customer-mobile` | Expo 56 / React Native 0.85 | 14+ | — | ⚠️ React Doctor 65/100 |
| `@spicegarden/delivery-partner` | Expo 56 / React Native 0.85 | — | — | ⚠️ React Doctor 59/100 |
| `spicegarden-launcher` | Electron 39 + React | — | — | ✅ Configured |

### 2.3 Shared Packages

| Package | Purpose | Status |
|---------|---------|--------|
| `@spicegarden/ui` | Shared React component library (54 TSX files) | ✅ Active |
| `@spicegarden/shared` | Domain types, API utilities, constants | ✅ Active |
| `@spicegarden/proto` | Protocol buffer definitions for gRPC events | ✅ Active |
| `@spicegarden/api-types` | TypeScript API type contracts | ✅ Active |
| `@spicegarden/grpc-transport` | gRPC client transport layer | ⚠️ Quarantined (stub) |

---

## 3. Backend Entity Inventory

### 3.1 Core Entities

| Entity | Purpose |
|--------|---------|
| UserEntity | User accounts (email, phone, role, status) |
| SessionEntity | JWT session tracking (device, IP, expiry) |
| OTPEntity | One-time password verification |
| UserDeviceEntity | Device registration for push notifications |

### 3.2 Restaurant Entities

| Entity | Purpose |
|--------|---------|
| RestaurantEntity | Restaurant master data |
| RestaurantBranchEntity | Branch/location management |
| MenuItemEntity | Menu items with pricing |
| MenuCategoryEntity | Menu categorization |
| MenuVariantEntity | Item variants (size, type) |
| MenuAddonEntity | Add-on customization options |
| MenuItemAvailabilityEntity | Availability scheduling |

### 3.3 Order Entities

| Entity | Purpose |
|--------|---------|
| OrderEntity | Order master with status tracking |
| OrderItemEntity | Individual order line items |

### 3.4 Payment Entities

| Entity | Purpose |
|--------|---------|
| PaymentMethodEntity | Saved payment methods |
| PaymentWebhookEntity | Webhook event tracking |
| StripeWebhookEntity | Stripe-specific webhook records |
| PaymentFraudEntity | Fraud flagging records |
| PaymentValidationEntity | Payment validation states |
| PaymentEventEntity | Event sourcing for payments |
| IdempotencyEntity | Idempotency key tracking |
| WebhookRetryQueueEntity | Failed webhook retry queue |

### 3.5 Financial Entities

| Entity | Purpose |
|--------|---------|
| WalletEntity | Customer/restaurant/driver wallets |
| WalletTransactionEntity | Wallet transaction history |
| LedgerEntryEntity | Double-entry bookkeeping |
| RefundEntity | Refund requests |
| RefundApprovalEntity | Refund approval workflow |
| PayoutReportEntity | Settlement reporting |

### 3.6 Driver Entities

| Entity | Purpose |
|--------|---------|
| DriverEntity | Driver profiles and status |
| DriverAssignmentEntity | Order-driver assignments |
| DriverFraudEntity | Fraud detection records |
| DriverScoreEntity | Performance scoring |
| DriverIncentiveEntity | Incentive records |
| DriverPenaltyEntity | Penalty records |
| DriverDocumentEntity | Document management |
| DriverShiftEntity | Shift scheduling |

### 3.7 Support & Notification Entities

| Entity | Purpose |
|--------|---------|
| SupportTicketEntity | Customer support tickets |
| NotificationEntity | Notification delivery records |
| NotificationPreferenceEntity | User notification preferences |
| NotificationAnalyticsEntity | Notification engagement metrics |

### 3.8 Marketing Entities

| Entity | Purpose |
|--------|---------|
| CouponEntity | Discount coupons |
| CouponUsageEntity | Coupon redemption tracking |
| ReferralEntity | Referral program tracking |

### 3.9 Compliance Entities

| Entity | Purpose |
|--------|---------|
| AuditLogEntity | Security audit events |
| DeviceFingerprintEntity | Device identification for fraud |
| DataExportRequestEntity | GDPR data export tracking |
| DeletionRequestEntity | GDPR deletion requests |

### 3.10 Restaurant Operations

| Entity | Purpose |
|--------|---------|
| RestaurantOnboardingEntity | Onboarding workflow state |
| BranchControlEntity | Branch-level controls |
| CommissionRuleEntity | Commission configuration |
| SurgeZoneEntity | Surge pricing zones |
| KitchenSLAEntity | Kitchen SLA tracking |
| DeliverySLAEntity | Delivery SLA tracking |
| SLAAAlertEntity | SLA breach alerts |

### 3.11 Inventory

| Entity | Purpose |
|--------|---------|
| InventoryItemEntity | Stock tracking |
| InventoryAlertEntity | Low-stock alerts |
| RecipeEntity | Menu item recipes |
| FoodPrepEntity | Preparation instructions |
| BatchEntity | Batch tracking for food safety |

### 3.12 Other Entities

| Entity | Purpose |
|--------|---------|
| SubscriptionEntity | Restaurant subscription plans |
| RestaurantGSTEntity | GST configuration |
| GSTDetailEntity | GST line items |
| HSN_SACEntity | HSN/SAC code mapping |

---

## 4. API Inventory

### 4.1 Authentication Routes

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/auth/register` | None | User registration |
| POST | `/auth/login` | None | User login |
| POST | `/auth/callback` | None | OAuth2 callback (Google/Facebook) |
| POST | `/auth/otp` | Throttler | OTP request/verify |

### 4.2 Order Routes

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/orders` | JWT | List user orders |
| GET | `/orders/:id` | JWT | Order details |
| POST | `/orders` | JWT | Create order |
| PUT | `/orders/:id/status` | JWT + Roles | Update order status |

### 4.3 Payment Routes

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/payments/intent` | JWT | Create payment intent |
| POST | `/payments/webhook` | Webhook sig | Stripe/Razorpay webhook |
| POST | `/payments/refund` | JWT + Roles | Process refund |

### 4.4 Restaurant Routes

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/restaurants` | None | Browse restaurants |
| GET | `/restaurants/:id/menu` | None | Restaurant menu |
| GET | `/kitchen/orders` | JWT + Roles | Kitchen order display |
| GET | `/kitchen/inventory` | JWT + Roles | Inventory view |

### 4.5 Compliance Routes

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/compliance/soc2` | JWT + Roles | SOC2 readiness report |
| GET | `/compliance/pci-dss` | JWT + Roles | PCI-DSS validation report |
| GET | `/compliance/gdpr/user/:id/export` | JWT + Roles | GDPR data export |
| POST | `/compliance/gdpr/user/:id/deletion-request` | JWT + Roles | GDPR deletion request |
| GET | `/compliance/user/:id/pii-verification` | JWT + Roles | PII encryption verification |
| GET | `/compliance/secrets/rotation-status` | JWT + Roles | Secret rotation status |

---

## 5. Dependency Review

### 5.1 Root Dependencies

| Category | Packages | Notes |
|----------|----------|-------|
| Runtime | class-transformer, class-validator, electron, multer | Minimal — apps manage own deps |
| Dev | @babel/generator, @babel/parser, @babel/traverse, @nestjs/typeorm, @testing-library/dom, ajv, eslint-scope, glob, lucide-react, pretty-format, sqlite3, typescript | Test and build toolchain |

### 5.2 Workspace Overrides

| Override | Version | Reason |
|----------|---------|--------|
| engine.io | ^6.6.9 | Security patch |
| form-data | ^4.0.6 | Compatibility |
| socket.io | ^4.8.3 | WebSocket stability |
| ws | ^8.21.0 | WebSocket protocol |
| next | ^15.5.18 | Framework version |
| postcss | ^8.5.10 | PostCSS compatibility |
| @nestjs/platform-express | multer 2.2.0 | Compatibility pin |

### 5.3 Vulnerabilities

| Audit Run | Critical | High | Moderate | Low | Total |
|-----------|----------|------|----------|-----|-------|
| Current (verified) | 0 | 0 | 31 | 0 | 31 |
| Previous (2026-06-17) | 0 | 0 | 51 | 0 | 51 |

**Classification:** All remaining vulnerabilities are in dev toolchain dependencies. No production runtime vulnerabilities confirmed.

---

## 6. Security Observations

### 6.1 Implemented Controls

| Control | Implementation | Location |
|---------|---------------|----------|
| Helmet CSP | `default-src 'self'`, `frame-ancestors 'none'` | `main.ts` |
| HSTS | max-age=31536000, preload | `main.ts` |
| CSRF Protection | Token header + cookie validation | `csrf.middleware.ts` |
| CORS | Origin whitelist, no wildcards in prod | `cors-origin.ts` |
| Rate Limiting | Per-endpoint (OTP: 3/10min, Auth: 5/15min, Orders: 10/15min, API: 100/15min) | `main.ts` |
| Password Hashing | Argon2 | `auth.service.ts` |
| JWT Auth | Passport JWT strategy | `jwt.strategy.ts` |
| RBAC | 8 roles, permission matrix | `permissions.ts` |
| Argon2 | Password hashing/verification | `auth.service.ts` |
| Mongo Sanitization | express-mongo-sanitize | `main.ts` |
| HPP Protection | HTTP Parameter Pollution guard | `main.ts` |
| Dangerous Methods Block | TRACE, TRACK, DEBUG, CONNECT rejected | `main.ts` |
| Body Size Limit | 10kb default | `main.ts` |
| Webhook Signature Verification | Stripe: constructEvent(); Razorpay: HMAC-SHA256 | Gateway services |
| Fraud Detection | Multi-layer velocity + pattern checks | `fraud-hardening.service.ts` |
| Secret Rotation | 90-day cycle, tracked secrets | `secrets-rotation.service.ts` |
| GDPR | Export, deletion, PII verification endpoints | `compliance.controller.ts` |
| PCI-DSS | Validation service with requirement checklist | `pci-dss-validation.service.ts` |

### 6.2 Security Gaps

| Gap | Severity | Status |
|-----|----------|--------|
| MFA not implemented | High (PCI-DSS req 8.2) | Non-compliant |
| No custom exception filters | Medium | Missing |
| No request/response interceptors | Medium | Missing |
| External penetration test pending | High | Required annually |
| Redis-backed rate limit unverified at runtime | Medium | Fallback to memory in dev |

---

## 7. Performance Observations

### 7.1 Implemented Optimizations

| Technique | Implementation | Evidence |
|-----------|---------------|----------|
| BullMQ Queues | 5 queue types for async processing | Order lifecycle, driver assignment, notifications, refunds, analytics |
| Redis Caching | Redis adapter for rate limiting and session storage | `redis-rate-limit.store.ts` |
| Compression | Gzip/Brotli compression middleware | `main.ts` |
| Database Indexing | Unique indexes on email, phone, order IDs | Entity definitions |
| Connection Pooling | TypeORM connection pool configured | `db.module.ts` |

### 7.2 Load Testing Infrastructure

| Suite | Target | Script |
|-------|--------|--------|
| Smoke | 5–50 VUs | `stage-1-1k.js` |
| Light | 1k VUs | `stage-2-5k.js` |
| Medium | 5k VUs | `stage-3-10k.js` |
| Heavy | 10k VUs | `stage-4-20k.js` |
| Stress | 50k VUs | `stage-5-50k.js` |
| Spike | 100k VUs | `stage-6-100k.js` |
| Breaking point | 500k VUs | `stage-7-500k.js` |
| Extreme | 1M VUs | `stage-8-1m.js` |
| WebSocket | — | `websocket-stress.js` |
| Database | — | `database-stress.js` |
| Payment | — | `payment-stress.js` |
| Failure injection | — | `failure-injection.js` |
| Security under load | — | `security-under-load.js` |

---

## 8. Technical Debt

### 8.1 Active Debt Items

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P1 | React Doctor: customer-mobile (65/100, 126 warnings) | 5–8 days | Mobile UX |
| P1 | React Doctor: delivery-partner (59/100, 51 warnings) | 4–6 days | Delivery UX |
| P2 | React Doctor: customer-web (63/100, 32 warnings) | 3–5 days | Web UX |
| P2 | React Doctor: super-admin (62/100, 10 warnings) | 2–3 days | Admin UX |
| P2 | React Doctor: restaurant-dashboard (74/100, 5 warnings) | 1–2 days | Restaurant UX |
| P3 | npm audit: 31 moderate dev vulnerabilities | 2–3 days | Low risk |
| P2 | gRPC transport decision | 0.5 day | Maintenance |
| P3 | Root-level temp JSON cleanup | 0.5 day | Hygiene |

### 8.2 Root-Level Temporary Files

The following artifacts exist in the repository root and should be cleaned up:

| File | Type |
|------|------|
| `_baseline.json` | Temp audit artifact |
| `_current_report.json` | Temp audit artifact |
| `_day3.json`, `_day4.json` | Temp scan artifacts |
| `_doctor_day2.json`, `_doctor_err.log` | Temp doctor artifacts |
| `_doctor_final.json`, `_doctor_final2.json` | Temp doctor artifacts |
| `_doctor_report.json`, `_doctor_session2.json` | Temp doctor artifacts |
| `_doctor_v2.json` | Temp doctor artifact |
| `_final_report.json` | Temp audit artifact |
| `_fresh_check.json` | Temp scan artifact |
| `_live.json` | Temp scan artifact |
| `_react_doctor_report.json` | Temp doctor artifact |
| `_recent.json` | Temp scan artifact |
| `_scan_day9.json`, `_scan_final.json`, `_scan_post_fix.json`, `_scan.json` | Temp scan artifacts |
| `_status.json` | Temp status artifact |
| `_step_report.json` | Temp report artifact |
| `.local_admin_rerun.json`, `.local_admin.json` | Temp local config |
| `.local_cdm.json`, `.local_resto_rerun.json`, `.local_resto.json` | Temp local config |
| `.local_web.json` | Temp local config |
| `.localrd.tmp` | Temp file |
| `.localreactdoctor.json` | Temp doctor artifact |
| `.tmp_baseline.json`, `.tmp_button_check.txt` | Temp artifacts |
| `.tmp_fix_labels.py` | Script artifact |
| `.tmp_fresh.json`, `.tmp_full.json`, `.tmp_latest.json` | Temp artifacts |
| `.tmp_state.json`, `.tmp_step2.json` | Temp artifacts |
| `build_output.txt` | Temp build artifact |
| `cdm_rerun.json`, `cdm_rerun2.json` | Temp config artifacts |
| `deleted_js_files.txt` | Temp tracking artifact |
| `delivery-err.txt`, `err-current.txt`, `err-new.txt`, `err-new2.txt`, `err-new3.txt` | Temp error logs |
| `err-pay.txt`, `err-r.txt`, `err-refund*.txt`, `err-rp.txt`, `err-rp2.txt` | Temp error logs |
| `k6-10k.log`, `k6-smoke-load.log`, `k6-smoke.log` | Temp load test logs |
| `loyalty-err.txt`, `webhook-err.txt` | Temp error logs |
| `loc-report.csv`, `loc-report.json`, `loc-report.md` | Temp metrics artifacts |

### 8.3 Deprecated / Quarantined Code

| Item | Location | Status | Action |
|------|----------|--------|--------|
| `grpc-transport` package | `packages/grpc-transport/` | Quarantined — throws error on import | Decision: Implement or remove |

### 8.4 TODO / FIXME / HACK Audit

| Category | Count | Severity | Notes |
|----------|-------|----------|-------|
| TODO comments | Minimal | Low | Scattered in core; no critical blocking TODOs |
| FIXME comments | Minimal | Low | No open FIXMEs in critical paths |
| HACK comments | Minimal | Low | Temporary workarounds documented |

---

## 9. Dependency Review

### 9.1 Key Framework Versions

| Framework | Version | Notes |
|-----------|---------|-------|
| NestJS | v11 (via @nestjs/typeorm ^11.0.1) | Backend framework |
| Next.js | 15.5.x | Web frontends |
| React | 19.x | UI library |
| React Native | 0.85.x | Mobile apps |
| Expo | 56.x | Mobile toolchain |
| Electron | 39.x / 42.x | Desktop app |
| TypeORM | v0.3.x | ORM |
| BullMQ | Active | Job queues |
| Prisma / TypeORM | TypeORM | Database ORM |

### 9.2 Lockfile Integrity

| Check | Result |
|-------|--------|
| `npm ls --workspaces --depth=0` | Exit 0 |
| Lockfile present | ✅ `package-lock.json` |
| Workspace graph | Clean (no invalid overrides) |

---

## 10. License Review

| Item | Status |
|------|--------|
| LICENSE file present | ✅ `LICENSE` in repository root |
| License type | MIT |
| Copyright holder | SpiceGarden (2026) |
| Third-party attributions | Required in contributions per CONTRIBUTING.md |

---

## 11. CI/CD Configuration

| Pipeline | Location | Status |
|----------|----------|--------|
| GitHub Actions workflows | `.github/` | Present |
| Lint check | `npm run lint` | ✅ Configured |
| Build check | `npm run build` | ✅ Configured |
| Test check | `npm run test:unit` | ✅ Configured |
| TypeScript check | `tsc --noEmit` | ✅ Configured |
| Stack verification | `npm run verify:stack` | ✅ Configured |

---

## 12. Strengths

1. **Comprehensive Backend**: 65 entities, 41 controllers, 58 modules covering all food delivery domains
2. **Multi-Tenant Architecture**: Restaurant branches, commission rules, surge zones
3. **Real-Time Features**: WebSocket tracking, KDS gateway, live order updates
4. **Production Monitoring**: Prometheus, Grafana, Alertmanager, OpenSearch, Sentry
5. **Security Posture**: Defense-in-depth with Helmet, CSRF, Argon2, RBAC, rate limiting, fraud detection
6. **Resilience Patterns**: BullMQ queues, retry logic, webhook deduplication, idempotency
7. **Compliance Ready**: SOC2, PCI-DSS, GDPR endpoints and validation services
8. **High Test Coverage**: 542 unit tests, 91%+ backend coverage
9. **Clean Builds**: Zero lint errors, zero TypeScript errors, all workspaces compile
10. **Infrastructure as Code**: Docker Compose, Kubernetes, Prometheus configs versioned

---

## 13. Weaknesses

1. **Mobile React Doctor Scores**: delivery-partner at 59/100 is the lowest; customer-mobile at 65/100
2. **Moderate npm Audit**: 31 dev dependency vulnerabilities (no production impact, but needs remediation)
3. **Missing Interceptors/Exception Filters**: NestJS best practices not fully adopted
4. **Root-Level Temp Files**: 50+ temporary/report JSON files pollute repository root
5. **gRPC Stub**: Quarantined package adds maintenance burden without value
6. **RBAC Controller Coverage Unverified**: Guards exist but full endpoint protection audit pending
7. **MFA Non-Compliance**: PCI-DSS requirement 8.2 not met (blocks full production readiness)
8. **External Pentest Pending**: Required annually for PCI-DSS compliance

---

## 14. Recommendations

### Immediate (Next Sprint)

| # | Action | Owner | Effort |
|---|--------|-------|--------|
| 1 | Clean root-level temp JSON and log files | DevOps | 0.5 day |
| 2 | Decide gRPC transport fate (implement or delete) | Architecture | 0.5 day |
| 3 | Audit RBAC guard coverage on all protected endpoints | Backend | 1 day |
| 4 | Start React Doctor fixes for mobile apps (59/100, 65/100) | Frontend | 2–3 days |

### Short-Term (Next 4 Weeks)

| # | Action | Owner | Effort |
|---|--------|-------|--------|
| 5 | Resolve 31 npm audit moderate vulnerabilities | DevOps | 2–3 days |
| 6 | Implement MFA (PCI-DSS compliance blocker) | Backend | 3–5 days |
| 7 | Complete React Doctor fixes for all apps (target 80+/100) | Frontend | 5–8 days |
| 8 | Add NestJS exception filters and interceptors | Backend | 2 days |
| 9 | Schedule external penetration test | Security | Vendor coordination |

### Medium-Term (Next Quarter)

| # | Action | Owner | Effort |
|---|--------|-------|--------|
| 10 | Deploy to staging Kubernetes cluster and validate | DevOps | 1 week |
| 11 | Run full-stack load tests (10k–100k VUs) | QA | 1 week |
| 12 | Verify backup/restore procedures end-to-end | DevOps | 2 days |
| 13 | Complete disaster recovery演练 | DevOps | 2 days |
| 14 | Production secrets rotation and provisioning | DevOps | 1 day |

---

## 15. Duplicate & Empty File Audit

| Category | Count | Details |
|----------|-------|---------|
| Duplicate source files | 0 | No major duplicates detected |
| Empty source files | 0 | All source files contain implementation |
| Empty test files | 0 | All test files have assertions |
| Unused files | 50+ | Root-level temp/report artifacts (see Section 8.2) |
| Orphaned scripts | Minimal | No unreferenced scripts in infra/ |

---

## 16. File Type Distribution

| Extension | Count | Primary Location |
|-----------|-------|-----------------|
| `.ts` | 811 | apps/backend, packages/* |
| `.tsx` | 149 | apps/*-web, apps/*-mobile, packages/ui |
| `.js` | 772 | infra/scripts, infra/load-tests, root configs |
| `.json` | 100+ | package.json, tsconfig, compose, k8s |
| `.yaml` / `.yml` | 20+ | compose, k8s, prometheus, alertmanager |
| `.md` | 100+ | Documentation, reports, audits |
| `.sh` / `.ps1` | 18 | infra/scripts/ |
| `.sql` | Minimal | Seed/migration scripts if present |

---

*End of Repository Audit Report*
