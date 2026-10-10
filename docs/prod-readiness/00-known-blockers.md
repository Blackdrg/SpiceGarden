# Phase 1: Known Blockers

**Document Version:** 1.0
**Status:** Active - Requires Remediation

## 1. React Doctor - Unused Animation Hook File
- **File:** `apps/customer-web/src/hooks/useAnimation.ts`
- **Rule:** `deslop/unused-file`
- **Impact:** Maintainability - adds surface without shipping code
- **Fix:** ✅ COMPLETED - File deleted (no imports found, CSS indicated removed)
- **Status:** RESOLVED

## 2. React Doctor - Auth Token Stored in LocalStorage
- **Files:** 
  - `apps/customer-web/src/pages/checkout.tsx:139` - `localStorage.setItem('sg_token:v1', ...)`
  - `apps/customer-web/src/redux/slices/authSlice.ts:36-37,48` - Stores token in localStorage
- **Rule:** Security - tokens should use httpOnly cookies, not web storage
- **Impact:** XSS vulnerability vector
- **Fix:** Implement httpOnly cookie-based auth with CSRF protection (httpOnly cookies already used for refresh, but access token exposed)
- **Evidence:** `react-doctor-current.json` - no security error currently, but maintainability warning about derived state

### 3. React Doctor - Giant Component (App.tsx → DriverApp)
- **File:** `apps/delivery-partner/App.tsx`
- **Lines:** 109-904 (895 lines total)
- **Rule:** `no-giant-component`
- **Impact:** Maintainability - hard to read, test, and change
- **Fix:** Split into smaller components: Header, Stats, Tabs, ActiveDeliveryPanel, IssueSection, LogPanel, EarningsScreen
- **Evidence:** `react-doctor-output.txt:533`

## Medium Priority Blockers

### 4. React Doctor - Client-side Redirects
- **Files:**
  - `apps/customer-web/src/pages/auth/callback.tsx:30`
  - `apps/customer-web/src/pages/order-details.tsx:74`
- **Rule:** `nextjs-no-client-side-redirect`
- **Impact:** UX - flashes wrong page before redirect
- **Fix:** Use Next.js `redirect()` in server components or middleware

### 5. React Doctor - Date.now() Hydration Mismatch
- **Files:**
  - `apps/customer-web/src/pages/index.tsx:433` (super-admin)
  - `apps/delivery-partner/src/screens/ShiftManagementScreen.tsx:72`
- **Rule:** `rendering-hydration-mismatch-time`
- **Impact:** React hydration errors in SSR
- **Fix:** Move time values into useEffect + useState, or add suppressHydrationWarning

### 6. React Doctor - .expo Directory Not Ignored
- **File:** `apps/customer-mobile/package.json` (triggers check)
- **Rule:** `expo-gitignore`
- **Impact:** Correctness - machine-specific settings committed
- **Fix:** Add `.expo/` to `.gitignore` (already present in root .gitignore line 47)

## Low Priority / Maintainability

### 7. React Doctor - 80 Unused Files
- Multiple component and hook files exist but are not imported anywhere
- Files have `.js` and `.tsx` variants with same content
- **Fix:** Clean up duplicate/unused files

### 8. React Doctor - Inline Function Renders
- 9 instances of `render*()` functions causing component remounts
- **Fix:** Extract to named components

### 9. React Doctor - Dimensions.get() Instead of useWindowDimensions()
- 2 instances in delivery-partner
- **Fix:** Replace with hook for proper rotation handling

## Env Variable Alignment

### 10. Prometheus Dev Config Port Reference
- **File:** `infra/prometheus/prometheus.dev.yml:11`
- **Current:** `backend:3001` (Docker service name)
- **Works when:** Docker network is active
- **Issue:** For local testing without Docker, localhost doesn't resolve
- **Status:** Non-blocking - stack verification passes with Docker running

## Dependency Vulnerabilities

### 11. npm audit - 31 Moderate Vulnerabilities
- **Location:** Dev toolchain only (@expo, jest, webpack, babel)
- **Status:** Non-blocking - no production code affected, 0 high/critical
- **Files:** `js-yaml`, `uuid` dependency chains

## Load Testing Status

- **Current:** k6 smoke test completed (5 VUs, 30s) - PASS (100% success, p95 613.58ms)
- **Scripts:** `test/load/10k-users.js`, `test/load/20k-users.js`, `test/load/breaking-point.js`
- **Status:** ✅ VERIFIED - Smoke test passed, rate limiting working (HTTP 429 at limit)
- **Artifacts:** `docs/prod-readiness/00-command-output/load-smoke-result.txt`

## Mobile App Runtime Gap

- **Status:** Type-check only builds, no Expo runtime validation
- **Blockers:** Requires Expo SDK setup and device/emulator testing
- **Status:** PARTIAL - builds pass, runtime unverified