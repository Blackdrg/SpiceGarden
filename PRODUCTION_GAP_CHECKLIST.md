# Production Gap Checklist

Verified as of: 2026-06-14 20:59 IST

## Critical blockers

| Priority | Gap | Impact | Affected files | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| Critical | Root build fails | Prevents production build confidence and CI release readiness | `apps/customer-mobile/src/screens/CartScreen.tsx`, `apps/customer-mobile/src/screens/SearchScreen.tsx` | Fix `FastImage` import/runtime image component, remove duplicate `DESIGN_TOKENS`, and rerun `npm run build`. |
| Critical | React runtime crash risk | Customer mobile cart can crash when rendering item images | `apps/customer-mobile/src/screens/CartScreen.tsx:156` | Import the correct image component and verify with React Doctor. |
| Critical | CI audit does not fail | Moderate vulnerabilities can ship to production | `.github/workflows/ci-cd.yml:21` | Replace `|| true` with a failing audit gate or documented exception process. |
| Critical | Placeholder RBAC | Authorization may be incomplete or incorrect | `apps/backend/src/security/roles.guard.ts` | Replace placeholder role check with verified RBAC policy. |
| Critical | In-memory queue simulation | Queue state is not durable or production-safe | `apps/backend/src/infra/queue/queue.service.ts` | Replace with durable queue provider or explicitly isolate simulation behind non-production config. |
| Critical | Wildcard CORS on sockets | Broad cross-origin access can increase attack surface | `apps/backend/src/infra/tracking/tracking.gateway.ts`, `apps/backend/src/services/restaurant/kds.gateway.ts` | Restrict origins to known frontend/admin domains. |
| Critical | Localhost defaults in shared code | Web/mobile clients can point to local development services | `packages/shared/constants.ts`, `packages/shared/api.ts` | Use environment-driven API/socket URLs with production-safe defaults or build-time validation. |
| Critical | Env validator fails | Production and staging secret references are incomplete | `infra/scripts/validate-env-consistency.js` | Configure production Stripe secret file and staging Stripe secret reference. |
| Critical | Placeholder/empty third-party keys | Payments, notifications, push, maps, and email may not work | `.env`, `.env.production.example` | Replace placeholders and empty values with environment-specific secret files. |

## Major blockers

| Priority | Gap | Impact | Affected files | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| Major | Placeholder test scripts | Root test commands can pass without real coverage | Multiple workspace `package.json` files | Replace echo scripts with real tests or remove misleading scripts. |
| Major | Direct Jest failures | App/package test health is weaker than root scripts suggest | `apps/customer-mobile`, `apps/customer-web`, `apps/restaurant-dashboard`, `apps/delivery-partner`, `packages/ui` | Fix Jest configs, Detox config, TS parsing, and RN preset migration. |
| Major | NPM vulnerabilities | Dependency risk remains visible and unresolved | `npm-audit.json` | Upgrade affected Expo packages and rerun audit. |
| Major | Invalid/extraneous dependencies | Workspace install tree is inconsistent | `npm-ls-workspaces.json` | Remove extraneous packages and align `eslint-config-next` versions. |
| Major | Dockerfile backend-only | Frontend/mobile artifacts are not validated in container build | `Dockerfile` | Add separate frontend/mobile build checks or document backend-only image boundary. |
| Major | Docker copies root `node_modules` | Final image may include unnecessary or wrong dependency set | `Dockerfile` | Copy backend dependency tree only or use workspace pruning. |
| Major | Older K8s manifest less hardened | Staging/basic deployments may lack production controls | `infra/k8s/backend-deployment.yaml` | Align with `production-hardened.yaml` or retire the simpler manifest. |
| Major | Deployment validation script broken | Production validation cannot run as Node script | `infra/scripts/deployment-check.js` | Rename to `.sh`, keep Bash entrypoint, or rewrite as JS. |
| Major | CI load test can skip | Performance gate may not run | `.github/workflows/ci-cd.yml:67` | Make load test required or gate skip behind explicit input. |

## Medium blockers

| Priority | Gap | Impact | Affected files | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| Medium | React Doctor warnings | UX/runtime quality issues remain across apps | React Doctor log | Fix top warnings: effect dependencies, redirects, dimensions, eager imports, fetch-in-effect, derived state. |
| Medium | React type mismatch | Customer web uses React 19 with React 18 types | `apps/customer-web/package.json` | Align React and React type package versions. |
| Medium | ESLint config mismatch | Restaurant and super-admin installs invalid `eslint-config-next@16.2.6` | `apps/restaurant-dashboard/package.json`, `apps/super-admin/package.json` | Remove stale lock entries or align manifest and lockfile. |
| Medium | Next config ignores ESLint during builds | Build can pass with lint errors | `apps/customer-web/next.config.js`, `apps/restaurant-dashboard/next.config.js`, `apps/super-admin/next.config.js` | Re-enable ESLint in CI or add explicit lint gate. |
| Medium | Expo gitignore warning | React Doctor flagged Expo config, though `.expo/` exists | `.gitignore` | Verify `.expo/` is committed nowhere and consider ignoring Expo project files explicitly. |
| Medium | Payment placeholders | Payment flow may be incomplete | `.env`, `apps/backend/src/services/payments/payments.service.ts` | Configure real gateway credentials per environment and verify webhook secrets. |
| Medium | Auth fallback secret | Non-production fallback secret could be copied accidentally | `apps/backend/src/services/auth/auth.module.ts` | Ensure production requires real secret and fail closed. |

## Minor blockers

| Priority | Gap | Impact | Affected files | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| Minor | README stale counts | Docs can mislead maintainers | `README.md` | Use appended verified section and rerun audit after major changes. |
| Minor | `.npmrc` disables audit/fund | Developers may miss audit signals | `.npmrc` | Consider `audit=true` or document why disabled. |
| Minor | Deployment script extension mismatch | Confuses Windows and CI execution | `infra/scripts/deployment-check.js` | Rename to `deployment-check.sh` or implement JS. |
| Minor | Share URL in React Doctor output | Not needed in repo docs | React Doctor log | Do not include share URL in internal reports. |

## Readiness gates

Do not mark production-ready until all critical blockers are closed and these commands pass:

| Gate | Command | Expected result |
| :--- | :--- | :--- |
| Build | `npm run build` | Exit 0 |
| Unit tests | `npm run test:unit` | Exit 0 with real coverage where claimed |
| Integration tests | `npm run test:integration` | Exit 0 with real coverage where claimed |
| E2E tests | `npm run test:e2e` | Exit 0 with real coverage where claimed |
| Audit | `npm audit --audit-level=moderate` | Exit 0 or documented exception |
| Env validation | `node infra/scripts/validate-env-consistency.js` | Exit 0 |
| React Doctor | `npx react-doctor@latest --verbose` | No critical runtime bugs |
| Deployment validation | `bash infra/scripts/deployment-check.sh` or fixed JS equivalent | Exit 0 in target environment |

## Top 10 immediate fixes

1. Fix `apps/customer-mobile/src/screens/CartScreen.tsx` undefined `Image` and `FastImage` build errors.
2. Fix duplicate `DESIGN_TOKENS` in `apps/customer-mobile/src/screens/SearchScreen.tsx`.
3. Replace placeholder test scripts with real tests or remove them.
4. Fix direct Jest failures in customer-web, restaurant-dashboard, delivery-partner, and UI.
5. Make CI `npm audit --audit-level=moderate` fail instead of passing with `|| true`.
6. Replace placeholder RBAC and in-memory queue before production use.
7. Restrict Socket.IO CORS origins.
8. Make API/socket URLs environment-driven instead of localhost defaults.
9. Resolve env validator failures and placeholder third-party secrets.
10. Align Kubernetes manifests and fix deployment validation script execution.

## Final production verdict

Not production-ready. The strongest readiness evidence is the hardened Kubernetes manifest and existing backend service coverage. The strongest blockers are verified build failure, React runtime crash risk, weak CI security gates, placeholder backend behavior, localhost defaults, and incomplete environment/secret validation.
