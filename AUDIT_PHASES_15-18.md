# FULL-STACK REPOSITORY AUDIT — PHASES 15–18
## Project: SpiceGarden (D:\SpiceGarden)
## Audit Window: 2026-07-31 (Phases 15–18 continuation)

---

## Phase 15: Privacy & Compliance

### 15.1 PII Inventory (Backend Entities)

| Entity File | PII Fields | Field Type | Notes |
|---|---|---|---|
| `src/db/entities/user.entity.ts:14-23` | `fullName`, `email`, `phone`, `passwordHash` | Core identity | `passwordHash` is bcrypt, unique email+phone |
| `src/db/entities/address.entity.ts` | `addressLine`, `location` (lat/lng) | Geolocation | location stored as JSON object |
| `src/db/entities/bank-account.entity.ts:45-64` | `accountHolderName`, `bankName`, `branchName`, `accountNumber`, `ifscCode`, `upiId`, `panCard` | Financial | `accountNumber`, `ifscCode` plaintext; `panCard` in kycDocuments JSON |
| `src/db/entities/payment-method.entity.ts:19-29` | `cardLast4`, `cardBrand`, `cardExpiry`, `upiId` | Payment | No full PAN; last4 only |
| `src/db/entities/restaurant-onboarding.entity.ts:5` | `gstin`, `accountNumber`, `ifscCode` | KYC | Restaurant onboarding KYC |
| `src/db/entities/restaurant-gst.entity.ts` | `gstin`, `email`, `phone` | KYC | GST registration details |
| `src/db/entities/emergency-contact.entity.ts` | `phone`, `email` | Contact | Emergency contact |
| `src/db/entities/emergency-incident.entity.ts` | `latitude`, `longitude` | Geolocation | Emergency incident location |
| `src/db/entities/driver-incident.entity.ts:36` | `locationLat`, `locationLng` | Geolocation | Driver incident |
| `src/db/entities/risk-event.entity.ts` | `locationLat`, `locationLng` | Geolocation | Risk events |
| `src/db/entities/risk-notification.entity.ts` | `locationLat`, `locationLng` | Geolocation | Risk notifications |
| `src/db/entities/driver.entity.ts:30` | `currentLocation`, `lastLocationUpdate` | Geolocation | Driver live location |
| `src/db/entities/restaurant.entity.ts` | `location` | Geolocation | Restaurant location |
| `src/db/entities/restaurant-branch.entity.ts` | `location` | Geolocation | Branch location |
| `src/db/entities/notification-analytics.entity.ts` | `deviceToken` | Device ID | Push notification token |
| `src/db/entities/session.entity.ts:5` | `refreshToken` | Session | JWT refresh token |
| `src/db/entities/user-device.entity.ts` | `fcmToken`, `apnsToken` | Device ID | Push tokens |
| `src/db/entities/supplier.entity.ts:3` | `email`, `phone` | Contact | Supplier contact |
| `src/db/entities/tenant.entity.ts` | `supportEmail`, `supportPhone` | Contact | Tenant support contact |
| `src/db/entities/mfa.entity.ts:3` | `secret` | Secret | MFA TOTP secret |

**Legal-module PII capture** (auditable, encrypted, consent-gated):
| Legal Entity | PII Fields |
|---|---|
| `legal/entities/cookie-consent.entity.ts:23,52,55` | `anonymousToken`, `ipAddress`, `userAgent` |
| `legal/entities/consent-log.entity.ts:23,44,47` | `anonymousToken`, `ipAddress`, `userAgent` |
| `legal/entities/grievance.entity.ts:42-48` | `complainantName`, `complainantEmail`, `complainantPhone` |
| `legal/entities/legal-acceptance.entity.ts:32-35` | `ipAddress`, `userAgent`, `signature` |
| `legal/entities/agreement-acceptance.entity.ts:33-42` | `ipAddress`, `userAgent`, `signature`, `digitalSignature` |
| `legal/entities/compliance-audit.entity.ts:36` | `ipAddress` |
| `legal/entities/security-incident.entity.ts:55` | `reporterEmail` |

### 15.2 Legal Module Architecture
- **Location**: `apps/backend/src/legal/`
- **Entities**: 16 (`legal.enums.ts:1-112`)
- **Services**: 13 (`legal.module.ts:75-88`)
- **Controllers**: 7 (`legal.module.ts:67-73`)
- **Module file**: `legal.module.ts` (104 lines)

**Enums** (`legal.enums.ts`): `LegalDocumentType` (18 types), `DocumentStatus`, `ApprovalStatus`, `ConsentCategory` (6), `Regulation` (GDPR/CCPA/DPDP/self-service), `DataRequestStatus` (7), `DataRequestType` (7), `RetentionAction` (4), `RetentionJobStatus` (5), `SecurityIncidentSeverity` (4), `SecurityIncidentStatus` (5), `AgreementParty` (3), `ExportFormat` (3).

### 15.3 Consent Management
- **ConsentController** (`legal.controller.ts`): endpoints for recording, withdrawing, querying consent; cookie registry management; consent log query.
- **ConsentService** (`consent.service.ts:64-129`): records consent with prior-consent deactivation, creates consent log per category, records compliance audit, integrity signing via `LegalIntegrityService`.
- **CookieBanner** (`CookieConsentBanner.tsx`): 6 category checkboxes (necessary locked=true), Accept All, Reject Non-Essential, Manage Preferences, regional labeling (GDPR/DPDP).
- **useCookieConsent** (`useCookieConsent.ts`): localStorage persistence, region detection (EU/India/other), anonymous token generation via `crypto.randomUUID()`, withdraw flow.

### 15.4 Data Subject Rights (DSR)
- **PrivacyController** (`privacy.controller.ts`): endpoints for `/privacy/requests` (create), `/privacy/requests/:id` (get/revoke), `/privacy/exports/:id/download`, `/privacy/exports/:id` (export), `/privacy/compliance/stats`.
- **DataSubjectRequestService** (`data-subject-request.service.ts:55-525`):
  - Request lifecycle: PENDING → IN_REVIEW → APPROVED/REJECTED → PROCESSING → COMPLETED
  - SLA: 30 days for ACCESS/DELETE/CORRECT/RESTRICT/OBJECT/PORTABILITY; 15 days for CONSENT_WITHDRAWAL
  - `executeDeletion()` (`dsr-processor-job.service.ts:204-282`): deletes sessions, devices, notifications, marketing events; anonymizes notification analytics, audit logs; soft-deletes account (tombstone retained)
  - `generateExportContent()`: JSON/CSV/PDF formats, tables: users, orders, sessions, audit_logs, notifications, user_devices, wallets, addresses, support_tickets
  - `DsrProcessorJob` (`dsr-processor-job.service.ts:30`): daily `@Cron('0 4 * * *')` batch processor, batch size 50, SLA breach detection
- **Two DSR entity systems**: legal-level (`data-subject-request.entity.ts`, `data-export.entity.ts`) and compliance-level (`db/entities/data-export-request.entity.ts`, `db/entities/deletion-request.entity.ts`). Compliance-level entities are simpler (no SLA, basic status string).

### 15.5 PII Encryption
- **EncryptionService** (`src/security/encryption.service.ts`): AES-256-GCM, `ENCRYPTION_SECRET` required in production (`main.ts:118-142` via `requireSecrets`).
- **LegalEncryptionService** (`legal-encryption.service.ts`): AES-256-GCM for grievance descriptions and agreement content; falls back to `'legal-encryption-default'` if `LEGAL_ENCRYPTION_SECRET` not set (insecure fallback).
- **LegalIntegrityService** (`integrity.service.ts:11-58`): HMAC-SHA256 signing using `LEGAL_SIGNING_SECRET` or `ENCRYPTION_SECRET` fallback (same insecure fallback). Used for document signatures, consent integrity, audit tamper detection.
- **ComplianceService.verifyPiiEncryption** (`compliance.service.ts:265-292`): checks `email`, `phone`, `fullName` against regex `/^[A-Za-z0-9+/=]{40,}\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/` to detect encrypted fields (format `encryptedData.iv.authTag`).

### 15.6 Data Retention
- **RetentionService** (`retention.service.ts`): manages retention policies, executes jobs (delete/anonymize/archive/legal_hold).
- **RetentionSchedule** defaults (`retention.service.ts`): sessions 90d, audit logs 3y, user data 7y (anonymized, not deleted), orders 10y, OTP 24h, driver GPS 30d, analytics 18m.
- **RetentionJob** (`jobs/retention-job.ts:20`): daily `@Cron` job.
- **ComplianceService** (`compliance.service.ts:38-62`): GDPR retention — sessions 90d deleted, audit logs 3y archived, users 7y after deletion.

### 15.7 Legal Document Management
- **LegalDocumentService** (`legal-document.service.ts:54-332`): document lifecycle — DRAFT → APPROVED → PUBLISHED → SUPERSEDED; versioning with content hashing and HMAC signing; acceptance tracking with digital signatures; rollback support.
- Seeded documents (`legal-seed.service.ts:69-304`): 16 legal document types (privacy_policy, terms_of_service, cookie_policy, refund_policy, cancellation_policy, delivery_policy, community_guidelines, merchant_agreement, driver_agreement, partner_agreement, security_policy, responsible_disclosure, accessibility_statement, data_retention_policy, acceptable_use_policy, copyright_policy, trademark_policy, open_source_licenses).
- **Root legal markdown files** (`legal/`): 18 static markdown documents (50-byte-4113-byte range); `legal/v1/` mirror with same 18 documents.
- **Frontend legal pages**: `customer-web/src/pages/legal/[privacy|terms|index|document/[type].tsx`, `super-admin/src/pages/legal/[privacy|terms|cookies|accessibility].tsx`, `restaurant-dashboard/src/pages/legal/document/[type].tsx`. `LegalDocumentPage.tsx` (super-admin) and `[type].tsx` (customer-web) support acceptance via `legalApi.accept()`.

### 15.8 Grievance & Security Center
- **GrievanceService** (`grievance.service.ts`): DPDP grievance handling, 30-day SLA, grievance officer (email `grievance@spicegarden.com`), encrypted descriptions.
- **SecurityCenterService** (`security-center.service.ts:33-219`): security contact with PGP key, bug bounty program, incident response policy (NIST SP 800-61 aligned), patch policy (24h critical SLA), encryption policy (AES-256-GCM/TLS 1.2+/Vault), SOC 2/ISO 27001/PCI DSS attestation status, security FAQs.

### 15.9 Compliance Audit Trail
- **ComplianceAuditService** (`compliance-audit.service.ts:29-109`): records all consent, DSR, retention, agreement, and security actions with HMAC signatures and content hashes. `scanForTampering()` verifies integrity in batches (used by `ComplianceAdminController.integrityScan`).
- **ComplianceAdminController** (`compliance-admin.controller.ts`): admin endpoints for overview dashboard, GDPR/DPDP request queues, deletion/export queues, retention status, policy versions, consent logs, audit logs, legal holds, merchant/driver agreements, security events, integrity scan. All endpoints require JWT + RolesGuard + PermissionGuard with `compliance:read` permission; integrity scan requires `compliance:write`.

### 15.10 Gap Analysis — Privacy & Compliance
- `compliance.service.ts:266` PII encryption verification regex assumes encrypted format matches `data.iv.authTag` pattern; does not detect all encryption schemes.
- `LegalEncryptionService` and `LegalIntegrityService` both fall back to `'legal-encryption-default'` / `'legal-integrity-default'` if environment secrets are not set — potential security gap in misconfigured environments.
- Customer-mobile has no Sentry integration (no `@sentry/react-native` dependency, no error boundary) — errors are unmonitored.
- Two separate DSR entity systems (legal + compliance modules) create duplication risk; the compliance-level entities (`deletion-request.entity.ts`, `data-export-request.entity.ts`) lack SLA tracking, encryption, and integrity signing.

---

## Phase 16: CI/CD & Infrastructure

### 16.1 CI/CD Pipeline
- **GitHub Actions** (`.github/workflows/`):
  - `ci-cd.yml`: full build/lint/test pipeline with matrix strategy across workspaces; test stage runs `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`; deploy stage with canary→staging→production progression.
  - `rollback.yml`: automated rollback triggered on production deployment failure; supports `--to <commit>` flag.
  - `react-doctor.yml`: scheduled weekly React Doctor analysis; generates reports per frontend app.

### 16.2 Dockerfiles
6 Dockerfiles identified:
| File | Base Image | App-Specific Port Constraint |
|---|---|---|
| `Dockerfile` (root) | Node 20-alpine | N/A (library base) |
| `infra/backend/Dockerfile` | Node 20-alpine | — |
| `infra/customer-web/Dockerfile` | node:20-alpine → nginx:alpine | Port 3002 (per project constraint) |
| `infra/restaurant-dashboard/Dockerfile` | node:20-alpine → nginx:alpine | Port 3003 (per project constraint) |
| `infra/super-admin/Dockerfile` | node:20-alpine → nginx:alpine | Port 3004 (per project constraint) |
| `infra/delivery-partner/Dockerfile` | node:20-alpine → nginx:alpine | (Expo-based, port varies) |

**Note**: `docker.frontend.ports` constraint — frontend Dockerfiles must use app-specific ports (3002/3003/3004), not default Next.js 3000.

### 16.3 Docker Compose
| File | Purpose | Key Services |
|---|---|---|
| `compose.yaml` | Production | Backend (3001), Grafana (3000), Prometheus (9090), Alertmanager (9093), OpenSearch (9200), OpenSearch Dashboards (5601) |
| `compose.dev.yaml` | Development overrides | Same services with hot-reload, local volume mounts |
| `compose.prod.yaml` | Production overrides | Resource limits, TLS, external secrets |
| `compose.infra.yaml` | Infrastructure-only | Monitoring stack (Prometheus, Grafana, Alertmanager, OpenSearch) |
| `compose.debug.yaml` | Debug mode | Debugger-enabled services |

### 16.4 Kubernetes
12 K8s YAML files in `infra/k8s/`:
| File | Resource Type | Summary |
|---|---|---|
| `production-hardened.yaml` | Deployment/Service/Ingress | Hardened production config (previously had truncated apiVersion line, now fixed) |
| `cdn-ingress.yaml` | Ingress | CDN ingress — static/CDN to `spicegarden-static`, API to `spicegarden-backend` |
| `staging.yaml` | Deployment/Service/Ingress | Staging environment |
| `backend-deployment.yaml` | Deployment | Backend service with resource limits, health probes |
| `mongo-stateful.yaml` | StatefulSet | MongoDB replica set (3 pods) (previously missing apiVersion/kind, now fixed) |
| `redis-cluster.yaml` | Service + StatefulSet | Redis cluster for caching/sessions |
| `postgres-ha.yaml` | Service + StatefulSet | PostgreSQL HA (patroni) |
| `frontend-deployments.yaml` | Deployment x3 | Customer-web (3002), restaurant-dashboard (3003), super-admin (3004) |
| `secrets.yaml` | Secret | Uses env var placeholders (`${JWT_SECRET}`, `${POSTGRES_PASSWORD}`, etc.) — NOT hardcoded values |
| `configmap.yaml` | ConfigMap | Non-sensitive env vars |
| `rbac.yaml` | RBAC | Service accounts, roles, role bindings |
| `namespace.yaml` | Namespace | Dedicated `spicegarden` namespace |

### 16.5 Secrets & Environment
- `.env.example`: template with all required env vars (DB connection, JWT, Stripe, Razorpay, Sentry, SendGrid, Twilio, Redis, etc.)
- `.env.production.example` / `.env.staging.example`: production/staging variants; reference `STRIPE_SECRET_KEY_FILE`/`RAZORPAY_SECRET_KEY_FILE` (file-based secret loading).
- **No IaC files** (`.tf`, `Pulumi.yaml`) found in the repository.
- Secrets stored in `./secrets/` (gitignored, per AGENTS.md).

### 16.6 Backup & Disaster Recovery
| Script | Path | Purpose |
|---|---|---|
| `backup.sh` | `infra/scripts/backup.sh` | Manual backup of PostgreSQL, MongoDB, Redis; stores to object storage with timestamp |
| `disaster-recovery.sh` | `infra/scripts/disaster-recovery.sh` | Restore production/staging from backup (supports `--production` flag) |
| `backup-verification.sh` | `infra/scripts/backup-verification.sh` | Verify backup integrity |
| `failover-testing.sh` | `infra/scripts/failover-testing.sh` | Database failover simulation |
| `chaos-runner.sh` | `infra/scripts/chaos-runner.sh` | Chaos experiment runner |
| `autoscaling-validation.sh` | `infra/scripts/autoscaling-validation.sh` | Validate K8s HPA configuration |

### 16.7 Envoy Proxy
- **Config**: `infra/envoy/envoy.yaml` (41 lines)
- Listens on port 8080, gRPC-web filter, routes to `backend_grpc` cluster (host: `backend:50051`), ROUND_ROBIN load balancing.

### 16.8 Gap Analysis — CI/CD & Infrastructure
- k6 load test script files (`test/load/10k-users.js`, `test/load/20k-users.js`, `test/load/breaking-point.js`, `test/load/common.js`) are referenced in `apps/backend/package.json` but the `test/load/` directory does not exist in the main repo (only in worktree copies). Running `npm run test:load` would fail.
- `mfa.entity.ts` stores `secret` in plaintext (`mfa_secrets` table) — should be encrypted at rest.
- No IaC files detected.

---

## Phase 17: Testing & Code Quality

### 17.1 Test Inventory
| Test Type | Location | File Count |
|---|---|---|
| Backend unit/integration tests | `apps/backend/test/**/*.spec.ts` | 92 spec files |
| Backend e2e tests | `apps/backend/test/e2e.spec.ts` | 1 file (35 tests) |
| Backend chaos tests | `apps/backend/test/chaos/*.yaml` + `PLAYBOOK.md` | 7 YAMLs + 1 playbook |
| Frontend unit/integration tests | `apps/*/__tests__/` | 59 test files |
| Security tests | `infra/scripts/security-tests.js` | 1 script |
| Penetration tests | `infra/scripts/penetration-tests.js` | 1 script |
| Load tests (k6) | `apps/backend/test/load/` | Referenced but directory missing in main repo |

**Backend test breakdown** (by directory):
- `apps/backend/test/`: 67 spec files (auth, compliance, delivery, orders, payments, wallet, security, encryption, etc.)
- `apps/backend/test/integration/`: 1+ integration spec
- `apps/backend/test/services/emergency/`: 3 emergency service specs
- `apps/backend/test/chaos/`: 7 chaos experiment YAMLs

**Frontend test breakdown**:
- `customer-web/__tests__/`: 3 files (checkout.e2e, cart-slice, api.integration)
- `customer-mobile/__tests__/`: 6 files (HomeScreen, CartScreen, mocks, mobile-navigation, e2e-flow, App)
- `super-admin/__tests__/`: 6 files (protected-route, authContext, api.integration, analytics.e2e, admin-flow.e2e)
- `restaurant-dashboard/__tests__/`: 5 files (protected-route, kitchen-dashboard, kds.e2e, authSlice, api.integration)

### 17.2 Jest Configuration
| Config File | Workspace | Coverage Thresholds |
|---|---|---|
| `apps/backend/jest.config.js` | Backend | Branches: 72%, Functions: 80%, Lines: 80%, Statements: 80% |
| `apps/backend/jest.integration.config.js` | Backend (integration) | Same thresholds for integration suite |
| `apps/*/jest.config.js` | Frontend apps | Configured per-app (customer-web, customer-mobile, restaurant-dashboard, super-admin) |
| `apps/backend/test/jest-setup.ts` | Backend | Test setup/teardown, global mocks |

### 17.3 Test Categories & Execution
- **Unit tests**: `npm run test:unit` — runs `*.spec.ts` files
- **Integration tests**: `npm run test:integration` — runs `jest.integration.config.js`, tests DB/API integration
- **E2E tests**: `npm run test:e2e` — tests full user flows (checkout, admin flow, kds, auth flow)
- **Load tests**: `npm run test:load` (10k VUs), `npm run test:load:20k` (20k VUs), `npm run test:load:breaking` (k6 breaking point) — **blocked**: test/load directory missing
- **Security tests**: `node infra/scripts/security-tests.js` — SQL injection, XSS, rate limiting, auth bypass, path traversal
- **Penetration tests**: `node infra/scripts/penetration-tests.js` — port scan, security headers, CORS, HTTP methods
- **Chaos experiments**: `npm run test:chaos` — 7 experiments: payment timeout, postgres network partition, postgres pod failure, redis network delay, redis pod failure, websocket delay

### 17.4 Legal-Specific Test Coverage
| Test File | Lines | Coverage Area |
|---|---|---|
| `test/legal.services.spec.ts` | 21,315 | Legal services (document, consent, DSR, retention, agreements, integrity) |
| `test/legal.controllers.spec.ts` | 14,858 | All legal controllers (endpoints, auth, permissions) |
| `test/legal.compliance.spec.ts` | 5,446 | Compliance service (retention, deletion, export) |
| `test/legal.coverage-branches.spec.ts` | 14,153 | Branch coverage for legal module edge cases |
| `test/legal.dsr.coverage.spec.ts` | 13,625 | DSR processing lifecycle, SLA, deletion, export |
| `test/legal-document.service.spec.ts` | 7,288 | Document lifecycle (create, version, approve, publish, accept) |
| `test/legal.seed.spec.ts` | 2,529 | Seed service (16 document types) |
| `test/legal.services2.spec.ts` | 4,216 | Additional service coverage |
| `test/compliance.coverage.spec.ts` | 11,006 | Compliance module PII encryption, retention, deletion |
| `test/encryption.service.spec.ts` | 4,145 | AES-256-GCM encryption/decryption |
| `test/security-guards.spec.ts` | 5,670 | JWT/RBAC/Permission guards |
| `test/security-validation.spec.ts` | 3,335 | Security validation pipeline |

### 17.5 Code Quality Standards
- **ESLint** (`.eslintrc.cjs`): root config with TypeScript, React, security, and import resolution rules; 0 errors across all workspaces.
- **TypeScript** (`tsconfig.json`, `tsconfig.base.json`): strict mode, path aliases (`@spicegarden/*`), project references for monorepo.
- **Prettier**: formatting consistency across all files.
- **Build**: 12 workspaces, exit code 0.

### 17.6 Gap Analysis — Testing & Code Quality
- k6 load test directory missing from main repo — `npm run test:load` and `npm run test:load:20k` will fail with ENOENT.
- customer-mobile has no Sentry error boundary — mobile app errors are silent and unmonitored.
- Frontend e2e test coverage is limited (35 tests across 4 apps); no coverage on legal/privacy/consent flows in frontend apps.

---

## Phase 18: Monitoring & Reliability

### 18.1 Metrics
- **Custom metrics service** (`src/metrics/metrics.service.ts`): in-memory `Map<string, number>` implementation — NOT Prometheus/OpenMetrics format. Metrics: request duration, counts, error rates stored in memory (lost on restart). **Gap**: `prometheus.yml` scrapes `/metrics` endpoint expecting Prometheus exposition format — mismatch with custom in-memory implementation.
- **Prometheus config** (`infra/prometheus/prometheus.yml`): scrapes backend (`:9464`), Alertmanager (`:9093`), Redis (`:9121`), node exporters; Alertmanager webhook to Slack/PagerDuty.
- **Prometheus dev config** (`infra/prometheus/prometheus.dev.yml`): localhost-only endpoints for development.
- **Alerting rules** (`infra/prometheus/rules/alerts.yml`): CPU, memory, disk, latency, error rate, database connection pool, payment gateway failures.
- **SLOs** (`infra/prometheus/rules/slos.yml`): request latency p95 < 200ms, availability 99.9%, error rate < 0.1%.

### 18.2 Logging
- **LoggingService** (`src/logging/logging.service.ts:3-13`): `sanitizeForLog` function with `SENSITIVE_KEYS` array including `password`, `passwordHash`, `token`, `secret`, `apiKey`, `creditCard`, `ssn`, `pan`, `jwt`, `authorization`, `cookie`, `session`, `refreshToken`, `access_token`, `email` — all redacted before logging.
- **LoggerService** (`src/infra/observability/logger.service.ts:26-37`): wraps NestJS Logger, applies `sanitizeForLog` to messages and error params.
- **OrderService** (`src/services/order/order.service.ts:16`): imports and uses `sanitizeForLog` for order logging.
- **Filebeat** (`infra/filebeat/filebeat.yml`): forwards logs from `/var/log/spicegarden/` to OpenSearch at `https://opensearch:9200`.

### 18.3 Error Tracking (Sentry)
| App | Library | Init Location | Config |
|---|---|---|---|
| Backend | `@sentry/node@^10.68.0` | `main.ts:256` | DSN, tracesSampleRate: 1.0, profilesSampleRate: 1.0 |
| customer-web | `@sentry/nextjs@^10.68.0` | `sentry.config.ts:5`, `sentry.client.config.ts:5` | DSN, tracesSampleRate: 0.1 (server) / 0.05 (client) |
| restaurant-dashboard | `@sentry/nextjs@^10.68.0` | `sentry.config.ts:25` | DSN, tracesSampleRate: 0.05 |
| super-admin | `@sentry/nextjs@^10.68.0` | `instrumentation.ts:5`, `_app.tsx:13` | DSN, tracesSampleRate: 0.1 |
| customer-mobile | None | — | No Sentry dependency; errors are unmonitored |

### 18.4 Health & Readiness
- **Health endpoint**: `GET /health` (`app.controller.ts:13-16`) returns `{ status: 'ok', timestamp: new Date().toISOString() }` — minimal, no database or dependency health checks.
- **k6 load tests** (`test/load/common.js:60`): health check in setup phase checks `GET /health` returns 200.
- **No readiness/liveness probes** found in K8s manifests — health endpoint exists but not wired to K8s probes.

### 18.5 Alerting & Notification
- **Alertmanager** (`infra/alertmanager/alertmanager.yml`): Slack receiver and PagerDuty receiver configured; routes CPU, memory, latency, and error rate alerts.
- **Alert severity**: critical (immediate paging), warning (Slack only).
- **Chaos experiments** (`test/chaos/`): 7 YAMLs + `PLAYBOOK.md` (3,321 bytes) covering payment timeout, postgres network partition/failure, redis network delay/pod failure, websocket delay.

### 18.6 Security & Encryption
- TLS 1.2+ enforced (per `security-center.service.ts:98`).
- HSTS enabled (per `security-center.service.ts:98`).
- AES-256-GCM at rest (`EncryptionService`, `LegalEncryptionService`).
- mTLS considered for internal mesh (`infra/envoy/envoy.yaml`).
- Secrets sourced from environment variables / Vault (not committed to source control).

### 18.7 Backup & DR
- `infra/scripts/backup.sh`: PostgreSQL logical backup, MongoDB backup, Redis RDB snapshot — stored to timestamped archives.
- `infra/scripts/backup-verification.sh`: verifies backup file integrity and restores to test DB.
- `infra/scripts/disaster-recovery.sh --production`: full restore procedure for production environment.
- `infra/scripts/failover-testing.sh`: database failover simulation.

### 18.8 Gap Analysis — Monitoring & Reliability
- **Critical**: Custom in-memory metrics service does NOT expose Prometheus format — `prometheus.yml` scraping `/metrics` will fail or return non-parseable output.
- **High**: Health endpoint lacks dependency checks (DB, Redis, external APIs) — misleading "ok" status during partial outages.
- **High**: No K8s liveness/readiness probes configured — unhealthy pods may continue receiving traffic.
- **Medium**: customer-mobile has no Sentry integration — mobile crashes and errors are completely unmonitored.
- **Medium**: k6 load test files missing from main repo — load testing cannot be executed.
