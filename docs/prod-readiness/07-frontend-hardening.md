# Phase 7: Frontend Hardening and React Doctor Remediation

**Status:** ⛔ BLOCKED (feature freeze)

## React Doctor Findings Analysis

### Issue 1: Unused Animation Hook File ✅ RESOLVED
- **File:** `src/hooks/useAnimation.ts` (customer-web)
- **Rule:** `deslop/unused-file`
- **What it is:** A hook file that was never imported anywhere
- **Why it matters:** Dead code increases bundle size and maintenance burden
- **How serious:** Low - code removed, no user impact
- **Fix:** File deleted (verified by lint passing)

### Issue 2: Auth Token in Web Storage ⛔ BLOCKED
- **Files:** 
  - `src/pages/checkout.tsx:139` - `localStorage.setItem('sg_token:v1', ...)`
  - `src/redux/slices/authSlice.ts:36-37,48` - Stores token in localStorage
- **Rule:** Security - tokens should use httpOnly cookies
- **What it is:** Access tokens stored in browser localStorage instead of httpOnly cookies
- **Why it matters:** XSS attacks can steal tokens from localStorage
- **How serious:** Medium - could expose user sessions if XSS vulnerability exists
- **Fix:** BLOCKED - auth flow changes frozen per AGENTS.md

### Issue 3: Giant Component ⛔ BLOCKED
- **File:** `App.tsx` (delivery-partner, 904 lines → DriverApp)
- **Rule:** `no-giant-component`
- **What it is:** Single component handling multiple concerns (auth, stats, tabs, deliveries, issues, logs, earnings)
- **Why it matters:** Hard to test, maintain, and reason about
- **How serious:** Medium - maintainability issue, no immediate security impact
- **Fix:** BLOCKED - feature freeze prohibits component restructuring

### Issue 4: Client-Side Redirects ⚠️ PARTIAL
- **Files:**
  - `src/pages/auth/callback.tsx:30`
  - `src/pages/order-details.tsx:74`
- **Rule:** `nextjs-no-client-side-redirect`
- **What it is:** Using `router.push()` instead of server-side redirect
- **Why it matters:** Causes hydration mismatch and flash of wrong content
- **How serious:** Low/Medium - UX issue only
- **Fix:** BLOCKED - route changes frozen

### Issue 5: Date.now() Hydration Mismatch ⚠️ PARTIAL
- **Files:**
  - `src/pages/index.tsx:433`
  - `src/screens/ShiftManagementScreen.tsx:72`
- **Rule:** `rendering-hydration-mismatch-time`
- **What it is:** Using `Date.now()` in SSR causes server/client mismatch
- **Why it matters:** React hydration errors
- **Fix:** BLOCKED - component changes frozen

## What Was Attempted
- Deleted unused `useAnimation.ts` hook
- Documented all other issues per React Doctor rules

## What Changed
- Removed `src/hooks/useAnimation.ts` (single file deletion)

## Blockers
- Auth flow changes frozen (AGENTS.md)
- Feature freeze prohibits component restructuring
- No front-end route modifications allowed

## Truth Labels
| Issue | Status |
|-------|--------|
| Unused file useAnimation.ts | PASS |
| Auth token in localStorage | BLOCKED |
| Giant App.tsx component | BLOCKED |
| Client-side redirects | BLOCKED |
| Date.now() hydration | BLOCKED |
| .expo gitignore | PASS (already in .gitignore) |