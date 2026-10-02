# SpiceGarden Buyer Evidence Index

**Target RC Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Branch:** `feat/add-react-doctor`  
**Date:** 2026-10-02  
**Purpose:** Technical Due Diligence & Buyer Audit Index  

This document indexes all verification artifacts, test logs, coverage metrics, and operational readiness evidence generated during the SpiceGarden Release Candidate audit.

---

## Evidence Classification Matrix

| Evidence Category | File / Artifact Path | Status Classification | Primary Verification Method |
| :--- | :--- | :--- | :--- |
| **Monorepo Build Verification** | [`evidence/build-verification.log`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/operational-readiness/evidence/build-verification.log) | `REPRODUCIBLE` | `npm run build` executed across all 12 workspaces (Exit code 0). |
| **Monorepo Lint Verification** | [`evidence/lint-verification.log`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/operational-readiness/evidence/lint-verification.log) | `REPRODUCIBLE` | `npm run lint` executed across all 12 workspaces (0 errors). |
| **Full Test Suite (1,235 tests)** | [`evidence/test-suite-breakdown.log`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/operational-readiness/evidence/test-suite-breakdown.log) | `REPRODUCIBLE` | `npm run test:all` executed across 96 suites (100% pass). |
| **Backend Code Coverage (91.28%)** | [`evidence/backend-coverage.log`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/operational-readiness/evidence/backend-coverage.log) | `REPRODUCIBLE` | `npm --prefix apps/backend run test:cov` (Jest 29). |
| **Security & Penetration Suite** | [`evidence/security-suite.log`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/operational-readiness/evidence/security-suite.log) | `REPRODUCIBLE` | `security-tests.js`, `rbac-coverage.spec.ts`, `csrf.middleware.spec.ts`. |
| **Dependency Security Audit** | [`reports/dependency-security-audit.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/dependency-security-audit.md) | `REPRODUCIBLE` | `npm audit --json` (21 vulnerabilities classified; 0 critical). |
| **Disaster Recovery Drill** | [`evidence/dr-validation.log`](file:///c:/Users/mehta/Desktop/SpiceGarden/reports/operational-readiness/evidence/dr-validation.log) | `SIMULATED` | `infra/scripts/disaster-recovery.ps1` & failover unit specs. |
| **Stripe Gateway Integration** | `apps/backend/src/services/payments/gateways/stripe-gateway.service.ts` | `SIMULATED` | `stripe-gateway.spec.ts`, `webhook.service.spec.ts` (HMAC & idempotency). |
| **Razorpay Gateway Integration** | `apps/backend/src/services/payments/gateways/razorpay-gateway.service.ts` | `SIMULATED` | `razorpay-gateway.spec.ts`, `webhook.service.spec.ts` (Signature verification). |
| **SMS & Push Notifications** | `apps/backend/src/services/notifications/production-notification.service.ts` | `SIMULATED` | `production-notification.service.spec.ts` (Twilio/FCM adapter unit tests). |
| **Google & Facebook OAuth** | `apps/backend/src/services/auth/auth.service.ts` | `SIMULATED` | `auth.service.spec.ts` (Passport strategy simulations). |
| **Geo & Distance Matrix** | `apps/backend/src/services/geo/geo.service.ts` | `SIMULATED` | `geo.service.spec.ts`, `maps.service.spec.js` (Haversine & Maps API tests). |
| **Sentry APM / Telemetry** | `apps/backend/src/main.ts` | `CONFIGURATION EXISTS` | `@sentry/node` & `@sentry/nextjs` integrated; live DSN pending buyer config. |
| **Load Testing Scripts** | `infra/load-tests/` (1k to 1m VU scripts) | `SIMULATED` | k6 v2.2.0 script validation; simulated workload curves. |
| **Mobile Cross-Platform** | `apps/customer-mobile/__tests__/` | `SIMULATED` | Automated Jest / React Native test renderer suites (33 tests pass). |
| **Physical Mobile Devices** | Local USB / Cloud Device Lab | `PENDING` | Physical Android/iOS validation pending buyer hardware lab. |
| **Architecture Documentation** | [`docs/`](file:///c:/Users/mehta/Desktop/SpiceGarden/docs/) | `SELLER-REPORTED` | System architecture, ER diagrams, data flow specifications. |
| **Kubernetes & Cloud Ingress** | [`infra/k8s/`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/) | `REPRODUCIBLE` | Hardened manifests, HPA, PodSecurityPolicies, NGINX ingress. |
| **Software Bill of Materials** | [`legal/SBOM.json`](file:///c:/Users/mehta/Desktop/SpiceGarden/legal/SBOM.json), [`legal/SBOM.xml`](file:///c:/Users/mehta/Desktop/SpiceGarden/legal/SBOM.xml) | `REPRODUCIBLE` | CycloneDX / SPDX standard machine-readable inventory. |
| **IP & Chain of Title** | [`legal/chain-of-title.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/legal/chain-of-title.md) | `SELLER-REPORTED` | Contributor assignment matrix, copyright declarations. |

---

## Verification Legend

* **`REPRODUCIBLE`**: Independently executed and validated within the current local audit environment with zero errors.
* **`SIMULATED`**: Validated using sandbox data, mock gateways, memory engines, and deterministic automated unit/integration test suites.
* **`SELLER-REPORTED`**: Present in the codebase documentation and architecture blueprints.
* **`EXTERNAL/THIRD-PARTY`**: Requires live third-party SaaS contracts (e.g., Stripe, Twilio, AWS/GCP, Sentry).
* **`PENDING`**: Operational activities requiring production cloud cluster provisioning or physical hardware deployment.
