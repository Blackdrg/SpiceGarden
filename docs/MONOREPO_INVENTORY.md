# Monorepo Inventory

**Date:** 2026-06-23

---

## Applications

| App | Framework | Pages/Screens | Tests | Build Status |
| --- | --------- | ------------- | ----- | ------------ |
| `apps/backend` | NestJS 11 | API endpoints | 630 passed, 1 skipped | ✅ Pass |
| `apps/customer-web` | Next.js 15.5 + React 19 | 19 pages | 11 passed | ✅ Pass |
| `apps/restaurant-dashboard` | Next.js 15.5 | 2 pages | 9 passed | ✅ Pass |
| `apps/super-admin` | Next.js 15.5 | 2 pages | 23 passed | ✅ Pass |
| `apps/customer-mobile` | Expo 56 + React Native | ~10 screens | 33 passed | ⚠️ No native validation |
| `apps/delivery-partner` | Expo 56 + React Native | ~5 screens | 6 passed | ⚠️ No native validation |
| `apps/launcher` | Electron 42 | N/A | 1 passed | ✅ Pass |
| `apps/driver-app` | React Native | N/A | N/A | Stubbed |

---

## Packages

| Package | Purpose | Files | Tests | Status |
| ------- | ------- | ----- | ----- | ------ |
| `@spicegarden/ui` | Shared components | 54 TSX | 28 | ✅ Pass |
| `@spicegarden/shared` | Utilities | TS files | 2 | ✅ Pass |
| `@spicegarden/api-types` | API contracts | TS files | 0 | ⚠️ Runtime-unverified |
| `@spicegarden/proto` | Protobuf types | TS files | 0 | ⚠️ Runtime-unverified |
| `@spicegarden/grpc-transport` | gRPC client | 1 file | 0 | Stubbed |

---

## Infrastructure

| Component | Files | Status |
| --------- | ----- | ------ |
| `compose.dev.yaml` | 1 | Config-validated |
| `compose.infra.yaml` | 1 | Not found (may be missing) |
| `infra/k8s/*.yaml` | 8+ manifests | Static-validated |
| `infra/prometheus/` | 2 configs + rules | Static-validated |
| `infra/grafana/` | Provisioning + dashboards | Static-validated |
| `infra/alertmanager/` | alertmanager.yml | Static-validated |
| `infra/opensearch/` | Configs + templates | Static-validated |
| `infra/scripts/` | Node.js scripts | Present |

---

## Scripts

| Script | Purpose | Status |
| ------ | ------- | ------ |
| `validate-secrets.js` | Secret validation | ✅ Runs (3/16 valid) |
| `security-tests.js` | Security vuln tests | ⚠️ Blocked (needs backend) |
| `penetration-tests.js` | Penetration tests | ⚠️ Blocked (needs backend) |
| `fake-orders.js` | Order test scenarios | ⚠️ Blocked (needs backend) |
| `breaking-point.js` | Breaking point tests | ⚠️ Exists but not run |

---

## Test Totals

| Scope | Count | Source |
| ----- | ----- | ------ |
| Backend test files | 54 | `apps/backend/test/*.spec.ts` |
| Root unit tests | 139 | All workspaces |
| Backend tests | 630 passed, 1 skipped | `apps/backend` |
| Coverage total | 3689 statements | `apps/backend/coverage/coverage-summary.json` |