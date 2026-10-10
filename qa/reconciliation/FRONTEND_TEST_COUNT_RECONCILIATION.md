# SPICEGARDEN FRONTEND TEST COUNT RECONCILIATION
**Release Baseline:** `v1.0.0-rc1`

## 1. Framework & Scope Deconfliction

```text
================================================================================
                    SPICEGARDEN FRONTEND TEST TAXONOMY
================================================================================

1. Browser Route Qualification (Playwright Chromium Engine)
   -> 6 Frontend Applications
   -> 44 Discovered Routes
   -> 148 Browser Route, Hydration & Navigation Assertions
   -> Evidence: infra/scripts/run-final-chromium-reconciliation.js

2. Frontend Functional Automation (Jest / React Testing Library)
   -> 6 Frontend Workspaces + UI Package
   -> 26 Test Suites
   -> 92 Unit / Integration Test Cases
   -> Evidence: npm run test:unit (Customer Web: 11, Mobile: 33, KDS: 9, Admin: 23, Delivery: 6, UI: 28, Launcher: 1)

--------------------------------------------------------------------------------
COMBINED UNIQUE FRONTEND VERIFICATION TESTS: 240 Tests (100% Passing)
TOTAL UNIQUE FRONTEND ROUTES COVERED:        44 / 44 Routes
================================================================================
```

## 2. Test Suites by Application
- **Customer Web (Port 3002):** 21 routes in Playwright (72 assertions) + 3 Jest suites (11 tests).
- **Restaurant Dashboard KDS (Port 3003):** 8 routes in Playwright (28 assertions) + 3 Jest suites (9 tests).
- **Super Admin Portal (Port 3004):** 12 routes in Playwright (36 assertions) + 4 Jest suites (23 tests).
- **Customer Mobile Web (Port 3005):** 1 SPA route in Playwright (4 assertions) + 6 Jest suites (33 tests).
- **Delivery Partner Web (Port 3006):** 1 SPA route in Playwright (4 assertions) + 3 Jest suites (6 tests).
- **Launcher Electron Renderer (Port 3007):** 1 SPA route in Playwright (4 assertions) + 1 Jest suite (1 test).
- **Shared UI Design System Package:** 5 Jest suites (28 tests).
