# KNOWN ISSUES AND BLOCKERS

**Generated:** 2026-06-20  
**Verified from:** Repository analysis

---

## Current Blockers

| Issue | Category | Status | Evidence |
|-------|----------|--------|----------|
| Security tests not executed | Security | ⏳ Blocked | `infra/scripts/security-tests.js` requires backend on port 3001 |
| Penetration tests not executed | Security | ⏳ Blocked | `infra/scripts/penetration-tests.js` requires backend |
| Load tests not executed | Performance | ⏳ Blocked | `npm run test:load` requires running stack |
| Frontend builds not verified | Build | ⚠️ Pending | `npm run build` timed out on frontends |
| K8s infrastructure not validated | Infrastructure | ⏳ Blocked | No cluster access |

---

## Runtime Blockers

| Service | Required For | Status |
|---------|--------------|--------|
| Backend (port 3001) | Security tests | Not running |
| PostgreSQL (port 5432) | Full load tests | Not running |
| Redis (port 6379) | Rate limiting | Not running |
| MongoDB (port 27017) | Reviews/logs | Not running |

---

## Known Code Issues (Verified)

| File | Issue | Status |
|------|-------|--------|
| `packages/ui/index.ts` | ES module syntax may not parse | ⚠️ Pending |
| `apps/customer-mobile/*` | TypeScript errors reported | ⚠️ Pending |
| `apps/restaurant-dashboard/*` | E2E file TypeScript parse issue | ⚠️ Pending |
| `apps/delivery-partner/*` | React Native Jest preset migration | ⚠️ Pending |

---

## Environment Validation Issues

| Check | Status | Evidence |
|-------|--------|----------|
| `validate-env-consistency.js` | ⚠️ Issues found | Stripe secret file keys referenced in .env.production.example |
| Secrets directory | ⚠️ Missing | `secrets/` not present (gitignored) |

---

## Repository Issues (Verified)

| Issue | Status | Notes |
|-------|--------|-------|
| Apps count mismatch | ⚠️ Present | README claims 8 apps, only 7 in workspaces |
| Test count mismatch | ⚠️ Present | Claims of 231 tests vs actual 99 verified |
| Production claims | ⚠️ Overstated | Not validated at runtime |

---

## Resolution Path

1. **Start infrastructure:** `docker-compose -f compose.dev.yaml up -d`
2. **Start backend:** `cd apps/backend && npm run dev`
3. **Run security tests:** `node infra/scripts/security-tests.js`
4. **Run smoke tests:** `npm run test:load`
5. **Verify frontend builds:** `npm run build` per app