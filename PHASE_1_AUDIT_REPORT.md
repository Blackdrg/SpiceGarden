# SpiceGarden Phase 1 Audit Report

Verified as of: 2026-06-14 22:11 IST

## Scope

This phase audited the existing repository only. Evidence came from repository files, workspace manifests, command output, dependency audit output, LOC reports, and React Doctor output.

## Repository inventory

- Root workspace: `package.json` with `apps/*` and `packages/*`.
- Apps: `backend`, `customer-web`, `customer-mobile`, `restaurant-dashboard`, `super-admin`, `delivery-partner`, `launcher`.
- Shared packages: `shared`, `ui`, `api-types`, `proto`, `grpc-transport`.
- Infra: Dockerfiles, Compose files, Kubernetes manifests, GitHub workflows, env templates, infra scripts, observability assets, legal docs, and test automation.
- Existing untracked audit helper: `count-project-loc.js` was present and produced zero LOC on Windows because it depended on `wc`. It was corrected to count lines with Node.js and now generates valid reports.

## Verified LOC report

Generated files:

- `loc-report.json`
- `loc-report.md`
- `loc-report.csv`

Key values from `loc-report.json`:

| Metric | Value |
| :--- | ---: |
| Full repo text files | 155,228 |
| Full repo LOC | 27,544,408 |
| Authored business files | 1,181 |
| Authored business LOC | 596,606 |
| Dependencies/generated LOC | 26,947,802 |
| Human ownership | 2.17% |
| node_modules LOC | 26,881,764 |
| node_modules share | 97.59% |

Top authored business categories by LOC:

| Category | Files | LOC |
| :--- | ---: | ---: |
| Backend | 836 | 96,326 |
| Mobile (Customer) | 100 | 53,207 |
| Web (Customer) | 95 | 30,405 |
| Tests | 141 | 16,297 |
| Mobile (Delivery) | 42 | 15,148 |
| Infrastructure | 90 | 11,158 |
| Shared Packages | 178 | 7,929 |
| Dashboard (Admin) | 37 | 6,060 |
| Launcher (Electron) | 58 | 4,736 |
| Dashboard (Restaurant) | 32 | 4,320 |

## Code inventory from actual source patterns

Verified pattern counts:

| Pattern | Count |
| :--- | ---: |
| Backend `@Controller` decorators | 42 |
| Backend `@Module` decorators | 55 |
| Backend `@Injectable` decorators | 91 |
| Backend TypeORM `@Entity` decorators | 69 |
| Exported default TS/TSX functions | 34 |

Additional verified inventory from existing audit documentation:

| Metric | Verified value |
| :--- | ---: |
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

## Dependency analysis

Captured workspace dependency status in:

- `C:\Users\mehta\AppData\Local\Temp\kilo\npm-ls-workspaces.json`

Verified workspace dependency problems:

| Problem | Evidence |
| :--- | :--- |
| Extraneous `@emnapi/runtime@1.10.0` | `npm ls --workspaces --depth=0` |
| Extraneous `crc@` | `npm ls --workspaces --depth=0` |
| Invalid `eslint-config-next@16.2.6` in `restaurant-dashboard` | Expected `15.5.18` from workspace manifest |
| Invalid `eslint-config-next@16.2.6` in `super-admin` | Expected `15.5.18` from workspace manifest |

Captured audit status in:

- `C:\Users\mehta\AppData\Local\Temp\kilo\npm-audit.json`

Verified audit summary:

| Severity | Count |
| :--- | ---: |
| Critical | 0 |
| High | 2 |
| Moderate | 32 |
| Low | 3 |
| Total | 37 |

Notable vulnerable packages:

- `expo` and Expo CLI/config packages: moderate.
- `jest@26.6.3` in `delivery-partner` and `launcher`: moderate/high transitive exposure.
- `node-notifier@6.0.0`: moderate OS command injection advisory.
- `webpack-dev-server`: moderate.
- `next`/`postcss`: moderate.
- `braces` and `micromatch` transitive dependencies: high.

## Build verification

Command: `npm run build`

Result: failed.

Verified blockers:

| Workspace | Blocker |
| :--- | :--- |
| `apps/customer-mobile` | `FastImage` is not exported from `react-native` in `CartScreen.tsx`. |
| `apps/customer-mobile` | `Image` is resolved as the DOM image class and cannot be used as JSX in `CartScreen.tsx`. |
| `apps/customer-mobile` | Duplicate `DESIGN_TOKENS` identifier in `SearchScreen.tsx`. |
| `apps/customer-web` | Next/Turbopack internal error: `Expected file content for file`. |
| `apps/restaurant-dashboard` | Next/Turbopack internal error while writing `/api/inventory`. |
| `apps/super-admin` | Next/Turbopack internal error: missing `next/dist/lib/server-external-packages.jsonc`. |
| `apps/delivery-partner` | `Pressable` is not exported from `react-native` in multiple screens. |
| `apps/launcher` | Build succeeded. |
| Shared packages | Build succeeded. |
| Backend | Build succeeded. |

## Lint verification

Command: `npm run lint`

Result: exit 0.

Caveat: `packages/shared` and `packages/ui` still use placeholder lint scripts:

- `packages/shared`: `echo "lint placeholder"`
- `packages/ui`: `echo "lint placeholder"`

## Test verification

Commands:

- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`

Results:

| Command | Result |
| :--- | :--- |
| Unit | Exit 0; backend 3 suites / 30 tests passed; other workspaces used placeholders or no tests. |
| Integration | Exit 0; backend 8 suites / 34 tests passed; other workspaces used placeholders or no tests. |
| E2E | Exit 0; backend 2 suites / 35 tests passed; other workspaces used placeholders or no tests. |

Caveat: backend Jest runs emitted worker teardown warnings in all three test suites.

## React Doctor verification

Command: `npx react-doctor@latest --verbose`

Result: exit 1.

Score: 48/100, Critical.

Summary:

| Category | Count |
| :--- | ---: |
| Bugs | 3 errors, 58 warnings |
| Performance | 39 warnings |
| Maintainability | 115 warnings |
| Correctness | 2 warnings |
| Total issues | 217 |

Critical issue:

- `apps/customer-mobile/src/screens/CartScreen.tsx:156`: undefined JSX component `Image`.

Notable React Doctor findings:

- Missing effect dependency involving `socketRef.current`.
- Client-side redirects in effects.
- React Native `Dimensions.get` instead of `useWindowDimensions`.
- Fetch inside effects.
- Derived values copied into state.
- Inline render functions.
- TS syntax inside `jest.setup.js`.
- Unused files and unused exports across mobile/frontend apps.

## Security and backend hardening audit findings

Verified from existing repository files and prior audit report:

| Area | Finding |
| :--- | :--- |
| Queue | `apps/backend/src/infra/queue/queue.service.ts` is in-memory simulation, not BullMQ/Redis durable queue. |
| RBAC | `apps/backend/src/security/roles.guard.ts` is placeholder RBAC. |
| CORS | `TrackingGateway` and `KdsGateway` use `cors: { origin: '*' }`. |
| JWT | Auth module has fallback secret behavior when `JWT_SECRET` is absent or placeholder. |
| Env validation | `validate-env-consistency.js` failed on Stripe secret file configuration. |
| CI audit gate | CI runs `npm audit --audit-level=moderate || true`, allowing audit failures. |
| Deployment check | `infra/scripts/deployment-check.js` is Bash content but has `.js` extension and fails under Node. |

## Current blocker list

1. Root build fails in customer-mobile, customer-web, restaurant-dashboard, super-admin, and delivery-partner.
2. React Doctor score is 48/100 with runtime crash risk in customer mobile.
3. Workspace dependency tree has extraneous and invalid dependencies.
4. npm audit reports 37 vulnerabilities, including high-severity transitive issues.
5. Placeholder lint/test scripts remain in shared packages and most frontend/mobile apps.
6. Backend has placeholder RBAC, in-memory queue, wildcard socket CORS, and JWT fallback behavior.
7. Deployment validation script is mislabeled and fails under Node.
8. Environment validation fails for production/staging Stripe secret files.
9. Frontend UI and accessibility work remains incomplete.
10. No verified 10/100/1000/10000-user load/chaos results were produced in this phase.

## Phase 1 verdict

The repository is a large monorepo with substantial backend, frontend, mobile, infra, and documentation coverage. It is not production-ready. Stabilization must start with build failures, dependency hygiene, React Doctor critical runtime issues, and placeholder scripts before backend hardening, UI polish, testing maturity, and load/chaos validation can be trusted.
