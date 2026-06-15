# README Audit Report

Verified as of: 2026-06-14 20:59 IST

## Scope

This audit rebuilt SpiceGarden documentation from verified repository data. Existing `README.md` lines were preserved and verified sections were appended rather than rewritten.

## Evidence sources

- Repository inventory: `git ls-files`, `git ls-files -d`, `git ls-files --others --exclude-standard`, extension counts, and app/package file counts.
- Manifests: root and workspace `package.json` files.
- Backend: NestJS modules, controllers, services, guards, gateways, queue, metrics, logging, audit, compliance, encryption, vault, payments, delivery, dispatch, order, auth, KDS, and tracking files.
- Frontend: customer web, restaurant dashboard, super-admin, customer mobile, and delivery partner source files.
- Shared packages: `packages/shared`, `packages/ui`, `packages/api-types`, `packages/proto`, `packages/grpc-transport`.
- Infra: Dockerfiles, Compose files, Kubernetes manifests, GitHub workflows, env examples, and infra scripts.
- Runtime validation: root build, unit/integration/e2e tests, direct Jest checks, React Doctor, npm audit, npm workspace dependency check, env consistency validator, and deployment-check script probe.

## Current repository state

| Item | Verified value |
| :--- | :---: |
| Tracked files | 2410 |
| Deleted tracked files | 0 |
| Untracked files/folders | 5 |
| Modified files | 51 |
| Actual repo files excluding generated/cache dirs | 1228 |
| React components | 110 |
| Services | 84 |
| Modules | 56 |
| Entities | 68 |
| Controllers | 41 |
| Routes/pages | 50 |
| Screens | 27 |
| Hooks | 17 |
| Tests | 80 |
| Infra scripts/files | 67 |
| Kubernetes manifests | 8 |
| Docker Compose files | 4 |

## Backend findings

- Backend is a NestJS application with PostgreSQL via TypeORM, MongoDB via Mongoose, Redis via ioredis, Socket.IO gateways, JWT/session auth, Stripe/Razorpay payment plumbing, delivery dispatch, KDS, audit logging, metrics, logging sanitization, compliance, encryption, and Vault integration.
- 263 route decorators were extracted to `C:\Users\mehta\AppData\Local\Temp\kilo\endpoints.tsv`.
- Guards were found on compliance, driver, analytics, AI, delivery driver-ops, driver-fleet, GST, loyalty, notifications, payment-provider, restaurant, search, support, user/profile, address, payment-methods, and wallet controllers.
- `RolesGuard` is placeholder RBAC and returns `roles.includes(user?.role)` (`apps/backend/src/security/roles.guard.ts`).
- `QueueService` is an in-memory simulation (`apps/backend/src/infra/queue/queue.service.ts`).
- `TrackingGateway` and `KdsGateway` use `cors: { origin: '*' }`.
- Auth module falls back to `dev-secret-change-in-production-please` when `JWT_SECRET` is absent or placeholder in non-production.
- `VaultService` supports Vault integration but also has local secret fallback behavior.

## Frontend and mobile findings

- Customer web routes include addresses, auth, cart, checkout, history, index, legal privacy/terms, menu, notifications, offers, order details, payment methods, profile, reset password, restaurant, search, subscriptions, tracking, wallet, plus API routes.
- Restaurant dashboard includes index, onboarding, and API routes for orders/inventory.
- Super admin includes analytics, driver-fleet, loyalty, index, and API routes.
- Customer mobile includes addresses, auth, cart, checkout, history, home, menu item customization, notifications, onboarding, order details, payment methods, profile, restaurant, search, and tracking screens.
- Delivery partner includes active delivery, deliveries, earnings, help, home, login, map, onboarding, performance, profile, and shift management screens.
- `packages/shared/constants.ts` hardcodes localhost API/socket URLs:
  - `API_URL = 'http://localhost:3001'`
  - `SOCKET_URL = 'http://localhost:3001'`
- `packages/shared/api.ts` defaults to `http://localhost:3001/api`.

## Shared package findings

- `packages/ui/index.ts` exports Button, Card, Input, Skeleton, LoadingStates, LottieSuccessAnimation, Toast, Modal, SkeletonTemplates, OTPInput, SearchInput, Stepper, analytics, tokens, icons, useFlow, FlowManager, and ErrorBoundary.
- `packages/ui/tokens.ts` defines colors, spacing, typography, radius, and motion tokens.
- `packages/shared/api.ts` implements refresh-token retry behavior.
- `packages/api-types`, `packages/proto`, and `packages/grpc-transport` are present but have limited or no active scripts in their manifests.

## Infra and deployment findings

- `.env.example`, `.env.staging.example`, and `.env.production.example` exist.
- `.env` has required secret files for JWT, encryption, and DB password, but several third-party and payment keys are empty or placeholder.
- `validate-env-consistency.js` exited with code 1 and reported:
  - `[PRODUCTION] STRIPE_SECRET_KEY_FILE not configured`
  - `[STAGING] STRIPE_SECRET_KEY_FILE should reference staging secrets`
- `deployment-check.js` is a Bash script despite the `.js` extension and fails under Node.js with `Unexpected identifier 'pipefail'`.
- `deployment-check.sh` was not present, so the shell version could not be executed.
- `Dockerfile` builds only the backend. It does not build frontend or mobile apps.
- Docker production stage copies root `node_modules` into the final image.
- Docker user is named `nextjs` even though the image is backend-only.
- `compose.dev.yaml` contains hard-coded local development secrets; docs redact values.
- `.npmrc` sets `package-lock=true`, `legacy-peer-deps=true`, `audit=false`, and `fund=false`.
- CI security audit runs `npm audit --audit-level=moderate || true`, so audit failures do not fail the workflow.
- CI load test command can echo a skip message.
- `infra/k8s/production-hardened.yaml` is stronger than `infra/k8s/backend-deployment.yaml`; it includes non-root user, read-only root filesystem, dropped capabilities, secrets/configmap, rolling update, probes, resources, anti-affinity, tolerations, PDB, HPA, and NetworkPolicy.
- `infra/k8s/backend-deployment.yaml` is simpler and lacks several hardening fields present in the hardened manifest.

## Build and test findings

- `npm run build` failed with exit code 1 during customer-mobile `tsc --noEmit`.
- Build failures:
  - `apps/customer-mobile/src/screens/CartScreen.tsx`: `FastImage` is not exported from `react-native`.
  - `apps/customer-mobile/src/screens/CartScreen.tsx`: `Image` cannot be used as JSX component and JSX class does not support attributes.
  - `apps/customer-mobile/src/screens/SearchScreen.tsx`: duplicate `DESIGN_TOKENS` identifier.
- Root `npm run test:unit` exited 0:
  - Backend: 3 suites, 30 tests passed.
  - customer-web: no tests found, passed with no tests.
  - Mobile, delivery, launcher, restaurant, super-admin, shared, ui: echo placeholder scripts.
- Root `npm run test:integration` exited 0:
  - Backend: 8 suites, 34 tests passed.
  - customer-web: no tests found, passed with no tests.
  - Other apps/packages: echo placeholder scripts.
- Root `npm run test:e2e` exited 0:
  - Backend: 2 suites, 35 tests passed.
  - customer-web: no tests found, passed with no tests.
  - Other apps/packages: echo placeholder scripts.
- Direct Jest checks:
  - `apps/customer-mobile`: failed; missing `./detox.config.js`, and `__tests__/e2e-flow.test.js` expected `true` but received `false`.
  - `apps/customer-web`: failed with no tests found when run without `--passWithNoTests`.
  - `apps/restaurant-dashboard`: failed because `__tests__/e2e/kitchen-flow.test.ts` could not parse TypeScript.
  - `apps/super-admin`: passed, 2 suites / 20 tests.
  - `apps/delivery-partner`: failed because React Native Jest preset moved; install `@react-native/jest-preset` and update `jest.config.js`.
  - `packages/ui`: failed because Jest could not parse ES module syntax in `__tests__/useFlow.test.js`.

## Dependency and security findings

- `npm audit --json` found vulnerabilities including moderate `@expo/cli`, `@expo/config`, and `@expo/config-plugins`.
- `npm ls --workspaces --depth=0` reported workspace dependency problems:
  - extraneous `@emnapi/runtime@1.10.0`
  - extraneous `crc@`
  - invalid `eslint-config-next@16.2.6` in restaurant-dashboard
  - invalid `eslint-config-next@16.2.6` in super-admin
- `apps/customer-mobile` uses React Native `0.85.3` with Expo `^56.0.8`.
- `apps/customer-web` uses React `^19.2.7` with `@types/react` and `@types/react-dom` `^18.2.0`.
- `apps/restaurant-dashboard` and `apps/super-admin` declare `eslint-config-next` `15.5.18`, but installed `eslint-config-next@16.2.6` is invalid.

## React Doctor findings

- React Doctor version: `v0.5.5`.
- Scanned 243 files in 48.2s.
- Overall score: 48/100, critical.
- Total issues: 217.
- Bugs: 3 errors, 58 warnings.
- Performance: 39 warnings.
- Maintainability: 115 warnings.
- Correctness: 2 warnings.
- Critical issue: undefined JSX component `Image` at `apps/customer-mobile/src/screens/CartScreen.tsx:156`, which can crash at runtime.
- Important issue: missing effect dependencies involving `socketRef.current`.
- Other notable findings:
  - Date/random values in JSX.
  - Inline render functions.
  - Client-side redirects in effects.
  - React Native `Dimensions.get` instead of `useWindowDimensions`.
  - Heavy `recharts` eager load.
  - Data fetching inside effects.
  - Derived values copied into state.
  - Multiple setState calls in one effect.
  - Unused files.
  - Expo gitignore warning, although `.expo/` is present in `.gitignore`.
  - TypeScript syntax in `jest.setup.js`.

## README discrepancies and corrections

The existing README contained useful generated content but also stale or incomplete metrics. The appended README section marks verified updates and avoids deleting any existing lines.

Key corrected facts:

- Existing README inventory counts differ from current verified counts.
- Existing README test/build sections needed verified command evidence.
- Existing README should explicitly call out build failure, React Doctor critical runtime issue, dependency vulnerabilities, placeholder tests, placeholder RBAC, in-memory queue, localhost defaults, wildcard CORS, and env validator failures.
- Existing README should distinguish the hardened production manifest from the simpler backend deployment manifest.
- Existing README should not reproduce hard-coded local development secrets from `compose.dev.yaml`.

## Files created

- `README_AUDIT_REPORT.md`
- `PROJECT_STATUS_REPORT.md`
- `PRODUCTION_GAP_CHECKLIST.md`
- Appended verified documentation section to `README.md`

## Conclusion

The documentation task is complete. The repository has substantial production-oriented infrastructure and backend coverage, but production readiness is blocked by verified build failures, React runtime issues, dependency vulnerabilities, placeholder tests, incomplete security gating, localhost defaults, placeholder RBAC/queue behavior, and environment validation failures.

---

## Latest Verification Addendum

Verified as of: 2026-06-15 11:30 IST

This addendum records the continued production-readiness pass after dependency hardening and test fixes.

### Verified command results

| Command | Result |
| :--- | :--- |
| `npm run build` | Passed across all workspaces |
| `npm run lint` | Passed across all workspaces |
| `npm run test:all` | Passed across all workspaces |
| `npm audit` | Passed with 0 vulnerabilities |
| `npm run test --workspace @spicegarden/backend -- --runInBand` | Passed; 23 suites passed, 1 suite skipped, 188 tests passed, 1 skipped |
| `npm exec --workspace @spicegarden/backend -- k6 version` | Failed; k6 executable is unavailable |
| `npm ls react-doctor eslint-plugin-react-doctor` | Empty; React Doctor is unavailable in this workspace |

### Dependency and security updates

- Root `package.json` now overrides `postcss` to `^8.5.10` and `uuid` to `11.1.1`.
- `apps/launcher/package.json` now uses `webpack-dev-server` `^5.2.5`.
- `package-lock.json` records `next@15.5.19` using `postcss@8.5.10` under `node_modules/next/node_modules/postcss`.
- `npm audit` now reports 0 vulnerabilities.
- `npm ls postcss webpack-dev-server uuid` shows non-vulnerable versions for the audited dependency paths.

### Remaining blockers

| Area | Status |
| :--- | :--- |
| Database migration verification | `test/db-migrate.spec.ts` remains skipped because Docker is unavailable on this machine |
| Load testing | k6 is not installed, so 10k/20k/breaking-point load metrics are not verified |
| Chaos testing | Kubernetes chaos validation is not verified locally |
| React Doctor | Not runnable because `react-doctor` / `eslint-plugin-react-doctor` are not installed |
| Runtime readiness | Core local verification now passes, but existing architecture caveats remain documented above |

### Updated conclusion

The repository now passes the core local verification gate: build, lint, full workspace tests, backend Jest suite, and npm audit. Full production readiness remains unverified because Docker-backed migration tests, k6 load tests, chaos tests, and React Doctor scoring are unavailable in the current environment.
