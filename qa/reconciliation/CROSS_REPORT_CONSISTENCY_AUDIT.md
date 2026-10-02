# SPICEGARDEN CROSS-REPORT CONSISTENCY AUDIT
**Release Baseline:** `v1.0.0-rc1` | **Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`

## 1. Cross-Document Alignment Register

| Metric / Attribute | Value in Previous Reports | Value in Authoritative QA Record | Status | Alignment Note |
| :--- | :--- | :--- | :--- | :--- |
| **Monorepo Workspaces** | 12 workspaces | **12 workspaces** | **RECONCILED** | All 12 packages clean compile |
| **Backend Tests** | 1,122 tests | **1,122 tests (69 suites)** | **RECONCILED** | 100% passing across 69 suites |
| **Backend Coverage** | 91.28% | **91.28% Statements \| 91.21% Lines** | **RECONCILED** | Exceeds 80% threshold |
| **Frontend Test Counts** | 148 vs 92 | **148 Browser Assertions + 92 Functional Unit Tests** | **RECONCILED** | Separated Playwright from Jest |
| **Frontend Routes** | 44 routes | **44 routes across 6 applications** | **RECONCILED** | Verified across all 44 routes |
| **Responsive Check Count**| 308 checks | **396 checks (44 routes x 9 viewports)** | **CORRECTED & RECONCILED** | Full 9-viewport matrix executed |
| **Interactive Controls** | "38 / 22 Executable" | **38 catalogued: 16 True E2E / 6 Partial E2E / 16 Component & Prototype** | **CORRECTED & RECONCILED** | Master CSV deconflicted; 22 not called full E2E |
| **Payment Verification** | "Production Payment" | **Sandbox/Provider Validated (Live clearing NOT executed)** | **CORRECTED & RECONCILED** | Scoped to sandbox/provider evidence |
| **Customer Mobile Scope**| "100% Complete" | **Verified: Auth/Catalog/Cart/Checkout \| Prototype: Tracking/Details** | **CORRECTED & RECONCILED** | Mobile prototypes explicitly noted |
| **SMS / Push Notifications**| "Production Verified" | **Sandbox/Mock Validated (Live delivery unverified)** | **CORRECTED & RECONCILED** | Environment-dependent credentials |
| **Cross-App Sync** | "Full Live E2E" | **Fixture-assisted integration evidence** | **CORRECTED & RECONCILED** | Live simultaneous E2E not claimed |
| **20k VU Latency** | 1840ms vs 215ms | **PERF-001: 1840ms (Mixed) \| PERF-002: 215ms (Cached)**| **DIFFERENT TEST SCOPE** | Workload profiles deconflicted |
| **Recovery Metrics** | 3.2s vs 9m30s | **Pod Failover: 3.2s \| Cold DR: 9m30s (RPO 12m)** | **RECONCILED** | Tier 1 vs Tier 3 separated |
| **Security Phrasing** | "Zero Vulnerabilities" | **0 findings across 5 documented automated vectors** | **CORRECTED & RECONCILED** | Scoped to automated test suite |
| **Defect Severities** | P0=0, P1=0 | **P0: 0, P1: 0, P2: 0, P3: 0, P4: 5** | **RECONCILED** | 5 non-blocking A11y styling hints |
