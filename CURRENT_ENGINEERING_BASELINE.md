# Current Engineering Baseline - SpiceGarden

**Generated:** 2026-06-16
**Branch:** feat/add-react-doctor
**Classification:** Advanced Startup-Grade Pre-Production System

## Git Status

```
On branch feat/add-react-doctor
Changes not staged for commit:
  modified:   PROJECT_STATUS_REPORT.md
  modified:   README.md
  modified:   README_CHANGELOG.md
  modified:   README_GAP_REPORT.md
Untracked:
  CURRENT_STATUS_SUMMARY.md
```

## Workspace Dependencies

```
@spicegarden/backend@0.0.0 -> apps/backend (INVALID: @sentry/node@10.58.0 overrides ^8.55.2)
@spicegarden/customer-mobile@1.0.0 -> apps/customer-mobile
@spicegarden/customer-web@0.1.0 -> apps/customer-web
@spicegarden/delivery-partner@1.0.0 -> apps/delivery-partner
@spicegarden/restaurant-dashboard@0.1.0 -> apps/restaurant-dashboard
@spicegarden/super-admin@0.1.0 -> apps/super-admin
@spicegarden/api-types@1.0.0 -> packages/api-types
@spicegarden/grpc-transport@1.0.0 -> packages/grpc-transport
@spicegarden/proto@1.0.0 -> packages/proto
@spicegarden/shared@0.0.0 -> packages/shared
@spicegarden/ui@0.1.0 -> packages/ui
spicegarden-launcher@1.0.0 -> apps/launcher
```

## Build Status

```
✅ PASSED - All 11 workspaces compile successfully
```

### Verification
- Backend tsc: ✅ 0 errors
- Customer Mobile tsc: ✅ 0 errors  
- Customer Web next build: ✅ Compiled successfully (23 pages)
- Restaurant Dashboard next build: ✅ Compiled successfully (10 pages)
- Super Admin next build: ✅ Compiled successfully (14 pages)
- UI package tsc: ✅ 0 errors
- All other packages: ✅ Passed

## Lint Status

```
PASSED - All workspaces lint without errors
```

## TypeScript Status

```
✅ PASSED - 0 errors across all workspaces
```

## Security Status

```
BLOCKED - Rate Limiting VULNERABLE (0/100 requests blocked)
SECURITY TESTS REQUIRE RUNNING BACKEND
```

### Vulnerability Summary
- **Total vulnerabilities:** 56
- **Moderate:** 51
- **High:** 5
- **Invalid packages:**
  - @sentry/node@10.58.0 (expected ^8.55.2)

### Security Fixes Needed
1. Add ThrottlerGuard to AuthController
2. Configure trust proxy for proper IP detection
3. Validate secrets on startup

## Test Status

```
PASSED - Unit tests: 30 passed
```

## React Doctor Status

```
SCORE: ~61-74/100
Issues found: 32 bugs + 28 maintainability warnings + 2 performance
```

### React Doctor Issues (unaddressed in this phase)
- Missing effect dependencies
- Client-side redirects in useEffect
- State initialized from mount effects (Date.now)
- JS-thread animations