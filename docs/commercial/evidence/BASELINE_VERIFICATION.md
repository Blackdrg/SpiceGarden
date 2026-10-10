# SpiceGarden — Baseline Verification Evidence

**Timestamp:** 2026-09-29T19:00:00Z  
**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Environment:** Node.js v25.5.0, npm 9.9.4, Windows x64 (PowerShell 7+)  
**Repository State:** Frozen RC-1.0.0

---

## 1. Official Commands Executed

```bash
# 1. Monorepo Unit & Workspace Test Suite
npm run test:unit

# 2. Monorepo Production Build Across All Workspaces
npm run build

# 3. Monorepo ESLint Across All Workspaces
npm run lint

# 4. Backend Comprehensive Test Suite
cd apps/backend && npm test

# 5. Backend Test Coverage Gate
cd apps/backend && npm run test:cov

# 6. Environment Consistency Validation
node infra/scripts/validate-env-consistency.js

# 7. Repository Legal / IP Checklist
node infra/scripts/legal-check.js
```

---

## 2. Machine-Verifiable Results

| Verification Category | Measured Output | Gate / Target | Gate Status |
|---|---|---|---|
| **Total Test Suites** | 96 suites (69 backend + 27 workspace) | 96 suites | ✅ VERIFIED |
| **Total Tests Passed** | 1,235 tests | 1,235 tests | ✅ VERIFIED (100% Pass) |
| **Failed Tests** | 0 | 0 | ✅ VERIFIED |
| **Skipped Tests** | 0 | 0 | ✅ VERIFIED |
| **Workspace Builds** | 12 / 12 workspaces exit code 0 | 12 / 12 | ✅ VERIFIED |
| **Workspace Lint** | 12 / 12 workspaces exit code 0 | 12 / 12 | ✅ VERIFIED (0 errors) |
| **Coverage: Statements** | **92.07%** | $\ge 80.00\%$ | ✅ VERIFIED (+12.07%) |
| **Coverage: Branches** | **81.66%** | $\ge 80.00\%$ | ✅ VERIFIED (+1.66%) |
| **Coverage: Functions** | **92.54%** | $\ge 80.00\%$ | ✅ VERIFIED (+12.54%) |
| **Coverage: Lines** | **92.12%** | $\ge 80.00\%$ | ✅ VERIFIED (+12.12%) |
| **Environment Sync** | Exit code 0 (All dev, staging, prod configs valid) | 100% | ✅ VERIFIED |
| **Legal Checklist** | Exit code 0 (9 / 9 items passed) | 9 / 9 | ✅ VERIFIED |

---

## 3. Workspace-Specific Breakdown

| Workspace Directory | Package Name | Tests Passed | Build Result | Lint Result |
|---|---|---|---|---|
| `apps/backend` | `@spicegarden/backend` | 1,122 passed, 0 failed | Exit Code 0 (`dist/` generated) | Exit Code 0 |
| `apps/customer-web` | `@spicegarden/customer-web` | 11 passed, 0 failed | Exit Code 0 (21 Next.js routes) | Exit Code 0 |
| `apps/restaurant-dashboard` | `@spicegarden/restaurant-dashboard` | 9 passed, 0 failed | Exit Code 0 (10 Next.js routes) | Exit Code 0 |
| `apps/super-admin` | `@spicegarden/super-admin` | 23 passed, 0 failed | Exit Code 0 (14 Next.js routes) | Exit Code 0 |
| `apps/customer-mobile` | `@spicegarden/customer-mobile` | 33 passed, 0 failed | Exit Code 0 (`tsc --noEmit`) | Exit Code 0 |
| `apps/delivery-partner` | `@spicegarden/delivery-partner` | 6 passed, 0 failed | Exit Code 0 (`tsc --noEmit`) | Exit Code 0 |
| `apps/launcher` | `spicegarden-launcher` | 1 passed, 0 failed | Exit Code 0 (Main & Webpack) | Exit Code 0 |
| `packages/ui` | `@spicegarden/ui` | 28 passed, 0 failed | Exit Code 0 (`dist/` generated) | Exit Code 0 |
| `packages/shared` | `@spicegarden/shared` | 2 passed, 0 failed | Exit Code 0 (`dist/` generated) | Exit Code 0 |
| `packages/api-types` | `@spicegarden/api-types` | Type check PASS | Exit Code 0 (`tsc --noEmit`) | Exit Code 0 |
| `packages/grpc-transport` | `@spicegarden/grpc-transport` | Type check PASS | Exit Code 0 (`tsc --noEmit`) | Exit Code 0 |
| `packages/proto` | `@spicegarden/proto` | Type check PASS | Exit Code 0 (`tsc --noEmit`) | Exit Code 0 |

---

## 4. Known Exclusions & Boundary Conditions

1. **Docker Multi-Container Orchestration:** Local multi-container Docker runtime execution is intentionally excluded from local test scopes; application code and individual container builds are verified.
2. **Live External Merchant Credentials:** Live payment gateway transactions (Stripe/Razorpay), real-world SMS (Twilio), and push delivery (FCM/APNs) require active third-party credentials.
3. **Physical Mobile Device Testing:** Mobile builds pass TypeScript compilation and unit tests; physical device testing requires physical hardware and developer signing keys.
