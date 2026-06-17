# README Changelog

Generated: 2026-06-17T11:50+05:30  
Branch: `feat/add-react-doctor`

## Latest documentation work

- Generated current production-readiness reports for security, build, typecheck, dependency health, test reliability, React Doctor, load testing, security audit, observability, UI/UX, and final readiness.
- Replaced stale current-baseline/status/project reports with current verification state.
- Identified README sections that need to be marked outdated or superseded by the latest production-hardening update.

## Current verified commands to add to README

| Command | Result |
| :--- | :--- |
| `npm run build` | Exit `0` |
| `npx tsc --noEmit` | Exit `0` |
| `npm run lint` | Exit `0` |
| `npm run test:unit` | Exit `0`; 143 tests passed |
| `npm run test:e2e` | Exit `0`; 65 tests passed |
| `npm run test` | Exit `0` |
| `cd apps/backend && npm run test` | 210 passed, 1 skipped |
| `node infra/scripts/security-tests.js` | Exit `0`; 0 vulnerabilities; 96/100 rate-limited responses |
| `npm ls --workspaces --depth=0` | Exit `0` |
| `npm audit --json` | 0 critical, 0 high, 51 moderate |
| `npm run test:load --workspace @spicegarden/backend` | Exit `107`; duplicate k6 metric |
| `npx react-doctor@latest --verbose` | 0 errors, 62 warnings, score `null` |

## Production-hardening changes to document

- `apps/backend/src/security/redis-rate-limit.store.ts` added.
- `apps/backend/src/main.ts` hardened with layered rate limits and explicit trust proxy default.
- `package.json` now includes root `test`.
- `apps/backend/package.json` test scripts narrowed to deterministic local suites.
- `apps/customer-web/package.json`, `apps/restaurant-dashboard/package.json`, and `apps/super-admin/package.json` removed unused `@rushstack/eslint-patch`.
- `package-lock.json` regenerated with dependency cleanup.
- Test fixes added for customer-web checkout, restaurant-dashboard KDS, super-admin analytics, and delivery-partner AsyncStorage.
- UI icon boolean rendering adjusted for Burger, Dessert, and Drink icons.

## Current README action required

Append a latest verification section and mark conflicting older sections as outdated. Do not remove historical content unless it is explicitly superseded by current command evidence.
