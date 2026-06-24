# NEXT EXECUTION PLAN

**Generated:** 2026-06-20  
**Status:** Ready to execute

---

## Phase 1: Frontend Build Verification (High Priority)

| Task | Command | Estimated Time |
|------|---------|----------------|
| Verify customer-web build | `cd apps/customer-web && npm run build` | 60s |
| Verify restaurant-dashboard build | `cd apps/restaurant-dashboard && npm run build` | 60s |
| Verify super-admin build | `cd apps/super-admin && npm run build` | 60s |
| Verify customer-mobile typecheck | `cd apps/customer-mobile && npm run build` | 30s |
| Verify delivery-partner typecheck | `cd apps/delivery-partner && npm run build` | 30s |

---

## Phase 2: Infrastructure Startup (High Priority)

| Task | Command | Prerequisites |
|------|---------|---------------|
| Start Docker infrastructure | `docker-compose -f compose.dev.yaml up -d` | Docker Desktop |
| Wait for health checks | Manual wait | ~60s |
| Start backend dev | `cd apps/backend && LOCAL_DB=sqlite npm run dev` | Ports available |

---

## Phase 3: Security Validation (High Priority)

| Task | Command | Expected Result |
|------|---------|-----------------|
| Run security tests | `node infra/scripts/security-tests.js` | Exit 0 if secure |
| Run penetration tests | `node infra/scripts/penetration-tests.js` | Exit 0 if secure |
| Check rate limiting | Manual verification | 429 responses under load |

---

## Phase 4: Load Test Execution (Medium Priority)

| Task | Command | Target |
|------|---------|--------|
| Smoke test | `npm run test:load` | 50 VUs |
| 50-users test | `k6 run apps/backend/test/load/50-users.js` | 50 VUs |
| 1k-users test | `k6 run apps/backend/test/load/1k-users.js` | 1000 VUs |

---

## Phase 5: RBAC Audit (Medium Priority)

| Task | Command | Expected |
|------|---------|----------|
| Check guard on OrderController | Manual code review | JwtAuthGuard + RolesGuard |
| Check guard on PaymentController | Manual code review | JwtAuthGuard + RolesGuard |
| Check guard on AdminController | Manual code review | JwtAuthGuard + RolesGuard |

---

## Phase 6: Production Preparation (Low Priority)

| Task | Command | Notes |
|------|---------|-------|
| Generate secrets | `powershell -File infra/scripts/generate-secrets.ps1` | Windows only |
| Validate env | `node infra/scripts/validate-env-consistency.js` | Check Stripe keys |
| Deploy to staging | `kubectl apply -f infra/k8s/staging.yaml` | Cluster required |

---

## Execution Order

```
1. Frontend builds → 2. Start infra → 3. Security tests → 4. Load tests → 5. RBAC audit
```

## Time Estimate

| Phase | Hours |
|-------|-------|
| Frontend verification | 0.5 |
| Infrastructure startup | 1 |
| Security validation | 1 |
| Load test execution | 1-2 |
| RBAC audit | 0.5 |
| **Total** | **4-5 hours** |