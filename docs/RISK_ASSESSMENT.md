# Risk Assessment

## Technical Risks

### High Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Runtime validation incomplete** | High | High | Docker daemon unavailable during baseline. Runtime behavior only code-reviewed. Full integration test with live stack required. |
| **Lint failures in production** | Medium | High | `customer-web/history.tsx` and `restaurant-dashboard/onboarding/menu.tsx` have ESLint errors from missing plugin rule definition. Could block CI/CD. |

### Medium Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **npm audit moderate vulnerabilities** | Medium | Medium | 31 moderate issues in dev toolchain. `npm audit fix` can resolve without breaking changes. |
| **Type duplication across packages** | Medium | Medium | `Order`, `Restaurant`, `MenuItem` duplicated in shared and api-types. Risk of sync drift. |
| **Hardcoded API URLs** | Medium | Medium | `packages/shared/constants.ts` hardcodes `http://localhost:3001`. Risk in deployment if not overridden. |
| **React Doctor low scores** | Medium | Medium | Customer-mobile (65), customer-web (63), delivery-partner (59), super-admin (62). Performance and maintainability risk. |
| **BullMQ queue single worker** | Medium | High | Only `ORDER_LIFEFCYCLE` worker registered. Other queue names defined but no workers. Risk of message loss. |

### Low Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **gRPC package orphaned** | High | Low | Package exists but throws error. Docs reference it. Cleanup recommended. |
| **Dev toolchain CVE exposure** | Low | Low | js-yaml variant CVE, uuid bounds check. Only affects dev, not production runtime. |
| **Test file inconsistency** | Low | Low | Mix of `.js`, `.ts`, `.tsx` extensions. Type safety gap. |

## Business Risks

### High Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Payment gateway reliability** | Medium | Critical | Multi-gateway (Stripe + Razorpay + COD) reduces single-point-of-failure. Retry + idempotency mitigators in place. |
| **Driver assignment algorithm** | Medium | High | Single worker for `driver_assignment` queue. If it fails, no drivers assigned. |

### Medium Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Notification delivery failures** | Medium | High | Multi-channel (push/SMS/email). BullMQ retry handles transient failures. |
| **Order state machine violations** | Medium | High | `canTransitionOrderStatus()` validates transitions. Unit tests cover edge cases. |
| **Data consistency (3 databases)** | Medium | Critical | PostgreSQL (relational), MongoDB (document), Redis (cache/queue). No distributed transaction coordinator. Saga pattern needed for cross-DB atomicity. |

### Low Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **User data export/deletion compliance** | Low | Medium | GDPR/DPDP compliant? Data export and deletion request endpoints exist. Need audit of actual data deletion across all stores. |

## Security Risks

### High Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Secrets exposure in .env** | Medium | Critical | `.env` should be gitignored. `infra/secrets/secrets.yaml` is gitignored pattern. Verify in CI. |
| **Payment fraud** | Medium | Critical | Fraud hardening service active. Webhook ID verification. Amount validation. |

### Medium Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **WebSocket DoS** | Medium | High | Rate limiting on connections. Message size limit (1024 bytes). Acknowledgement timeout. |
| **Rate limit bypass via LOAD_TEST_MODE** | Low | High | `LOAD_TEST_MODE=true` bypasses rate limiting. Only affects non-production. Ensure never set in production. |
| **CORS misconfiguration** | Medium | Medium | Production validates no wildcards. Development allows localhost. |

### Low Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **npm audit moderate findings** | High | Low | All in dev dependencies. No production impact. |

## Infrastructure Risks

### Medium Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Single PostgreSQL instance** | Medium | High | `postgres-ha.yaml` manifest exists but compose.dev.yaml uses single instance. For production, HA cluster required. |
| **Redis single node** | Medium | High | `redis-cluster.yaml` exists. Compose uses single node. Production needs cluster. |
| **Docker read-only containers** | Medium | Medium | All containers use `read_only: true` with tmpfs. Impact on log persistence, temp file writes. |

### Low Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Docker compose not versioned** | Low | Low | `compose.dev.yaml` present. No separate compose.prod.yaml. |

## Operational Risks

### Medium Risk

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Backup procedures** | Medium | High | Backup scripts exist (`infra/scripts/backup.sh`, `backup.ps1`). Need verification of scheduled execution. |
| **Disaster recovery** | Medium | Critical | `infra/scripts/disaster-recovery.sh` exists. Needs DR drill validation. |
| **Observability gaps** | Low | Medium | Prometheus metrics are custom. Need to verify alert rules in `infra/prometheus/rules/alerts.yml` cover critical paths. |

## Compliance Risks

| Risk | Status | Notes |
|------|--------|-------|
| PCI-DSS | Partial | Stripe/Razorpay tokenization handles card data. Need full QSA audit for full compliance. |
| GDPR/DPDP | Partial | Data export/deletion endpoints exist. Need audit of full data lifecycle. |
| SOC2 | In Progress | Audit logging, MFA, encryption in place. Need official audit. |

## Risk Summary

| Category | High | Medium | Low |
|----------|------|--------|-----|
| Technical | 2 | 6 | 3 |
| Business | 1 | 3 | 1 |
| Security | 1 | 3 | 1 |
| Infrastructure | 0 | 3 | 1 |
| Operational | 0 | 3 | 0 |
| Compliance | 0 | 0 | 3 |

**Total: 4 high, 18 medium, 9 low risks**

## Priority Mitigation Actions

1. **Resolve lint failures** - Fix ESLint config in 2 frontend apps
2. **Complete runtime validation** - Start Docker infrastructure and verify full stack behavior
3. **Register BullMQ workers** - Implement workers for DRIVER_ASSIGNMENT, NOTIFICATIONS, REFUNDS, ANALYTICS queues
4. **Run npm audit fix** - Resolve 31 moderate vulnerabilities
5. **Consolidate type definitions** - Create single source of truth for shared types
6. **Fix hardcoded URLs** - Move API_URL/SOCKET_URL to environment config in shared/constants.ts
7. **Conduct DR drill** - Validate disaster recovery procedures with actual backup/restore
8. **Complete compliance audit** - Full GDPR/DPDP and PCI-DSS validation
