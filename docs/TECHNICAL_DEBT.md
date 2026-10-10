# Technical Debt

## Overview

This document catalogs identified technical debt, its impact, and recommended remediation actions.

## High Priority Debt

### 1. Only ORDER_LIFECYCLE Worker Registered

**Location:** `apps/backend/src/infra/queue/queue.module.ts`

**Issue:** Queue names `DRIVER_ASSIGNMENT`, `NOTIFICATIONS`, `REFUNDS`, `ANALYTICS` are defined but no workers are registered. Jobs enqueued to these queues will wait indefinitely.

**Impact:** HIGH - Background processing fails silently for non-order events.

**Remediation:** Register workers for all queue names or remove unused queue definitions.

### 2. Lint Failures in Frontend

**Locations:**
- `apps/customer-web/src/pages/history.tsx:1`
- `apps/restaurant-dashboard/src/pages/onboarding/menu.tsx:1`

**Issue:** ESLint rule `react/inline-style-prop` has missing definition.

**Impact:** MEDIUM - CI/CD blocked for these workspaces.

**Remediation:** Add missing ESLint plugin or remove the rule from config.

### 3. npm Audit Moderate Vulnerabilities

**Count:** 31 moderate (0 high/critical)

**Location:** Dev dependencies (Jest, js-yaml, uuid via sockjs/xcode)

**Impact:** MEDIUM - Dev toolchain exposure.

**Remediation:** Run `npm audit fix` (non-breaking) or `npm audit fix --force` (breaking).

## Medium Priority Debt

### 4. Type Duplication Across Packages

**Packages:** `@spicegarden/shared`, `@spicegarden/api-types`, `@spicegarden/proto`

**Issue:** `Order`, `Restaurant`, `MenuItem`, `DriverProfile`, `DeliveryOrder` defined in multiple packages with different field sets.

**Impact:** MEDIUM - Risk of sync drift between packages.

**Remediation:** Create single source of truth in `@spicegarden/shared` and re-export.

### 5. Hardcoded API_URL

**File:** `packages/shared/constants.ts`

**Issue:** `API_URL = 'http://localhost:3001'` hardcoded.

**Impact:** MEDIUM - Risk of using wrong URL in deployment.

**Remediation:** Read from environment variable at source.

### 6. Redux Placeholder in Admin Dashboards

**Files:** `apps/restaurant-dashboard/src/redux/`, `apps/super-admin/src/redux/`

**Issue:** Redux store configured with empty/dummy reducer. Actual state managed via `useReducer` at component level.

**Impact:** MEDIUM - Unnecessary bundle weight, confusing architecture.

**Remediation:** Remove Redux configuration from these apps or implement proper Redux store.

### 7. gRPC Transport Quarantined

**Package:** `@spicegarden/grpc-transport`

**Issue:** Package exists but throws error. Proto definitions are hand-written TypeScript. No protoc pipeline.

**Impact:** LOW - Dead code taking space.

**Remediation:** Either implement proper gRPC or remove the package entirely.

### 8. Test File Extension Inconsistency

**Location:** `apps/backend/test/*.spec.js` (legacy JS files alongside .ts)

**Issue:** Mix of `.js`, `.ts`, `.tsx` test files.

**Impact:** LOW - Type safety gap.

**Remediation:** Convert `.js` tests to `.ts` during maintenance.

## Low Priority Debt

### 9. React Doctor Low Scores

| App | Score | Issues |
|-----|-------|--------|
| customer-mobile | 65 | 126 warnings |
| customer-web | 63 | 32 warnings |
| delivery-partner | 59 | 51 warnings |
| super-admin | 62 | 10 warnings |
| restaurant-dashboard | 74 | 5 warnings |

**Impact:** LOW - UX quality, bundle size.

**Remediation:** Gradual improvement - fix warnings during feature work.

### 10. Inline Styles in Frontend

**Observation:** Multiple `.module.css` files exist but some components use inline styles.

**Impact:** LOW - Maintainability.

**Remediation:** Migrate inline styles to CSS modules during refactoring.

### 11. Consumer-Mobile Missing Sentry Integration

**Files:** `apps/customer-mobile/` - No Sentry SDK

**Impact:** LOW - No error tracking on mobile.

**Remediation:** Add `@sentry/react-native` integration.

### 12. No Automated Dependency Updates

**Observation:** No Dependabot or Renovate configuration found.

**Impact:** LOW - Manual dependency management.

**Remediation:** Enable Dependabot for automated PRs.

## Architecture Debt

### 13. No CDN Configuration

**Impact:** MEDIUM - Frontend asset delivery latency.

**Remediation:** Configure CloudFront or Cloudflare CDN.

### 14. Single Redis Instance

**Current:** Single Redis in compose.dev.yaml

**Impact:** HIGH - Single point of failure for queues, sessions, rate limits.

**Remediation:** Deploy Redis Cluster (manifest exists: `redis-cluster.yaml`).

### 15. Single PostgreSQL Instance

**Current:** Single PostgreSQL in compose.dev.yaml

**Impact:** HIGH - No HA, no read scaling.

**Remediation:** Deploy PostgreSQL HA (manifest exists: `postgres-ha.yaml`).

### 16. WebSocket Sticky Sessions Not Configured

**Impact:** MEDIUM - Cannot scale WebSocket horizontally.

**Remediation:** Configure Socket.IO Redis adapter for multi-instance scaling.

## Documentation Debt

### 17. Docs Directory Proliferation

**Current:** 81+ files in `docs/`

**Issue:** Many historical/progress reports mixed with current documentation.

**Impact:** MEDIUM - Hard to find current information.

**Remediation:** This documentation set consolidates current state. Archive historical reports.

### 18. Missing Migration Guide

**Impact:** LOW - Hard to upgrade dependencies.

**Remediation:** Create upgrade guides for major version bumps.

## Code Quality Debt

### 19. `any` Type Usage

**File:** `apps/backend/src/services/order/order.service.ts`

**Issue:** Several parameters typed as `any`.

**Impact:** LOW - Type safety.

**Remediation:** Add proper DTO types.

### 20. Commented/Debug Code

**Observation:** Many `_cw*.json`, `_dp*.json`, `_sa*.json`, `_rd*.json` files in app directories (debug artifacts).

**Impact:** LOW - Repository cleanliness.

**Remediation:** Clean up debug artifacts.

## Remediation Priority Matrix

| Priority | Count | Key Items |
|----------|-------|-----------|
| P0 (Critical) | 1 | Register missing BullMQ workers |
| P1 (High) | 2 | Fix ESLint, npm audit |
| P2 (Medium) | 8 | Type consolidation, hardcoded URLs, CDN, Redis HA |
| P3 (Low) | 9 | React Doctor, test extensions, Sentry mobile |
