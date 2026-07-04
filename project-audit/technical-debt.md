# SpiceGarden Technical Debt Report

Generated: 2026-07-04
Evidence source: Direct inspection of codebase, React Doctor, build logs, test coverage

## 1. Dead Code & Unused Files

### 1.1 Root Level
| File/Directory | Status | Evidence |
|---------------|--------|----------|
| `app.module.js` | Dead/Artifact | Compiled JS at root, not source |
| `tsconfig.tsbuildinfo` | Build artifact | Should be gitignored |
| `_*.json` files (30+) | Artifacts | Historical scan/diagnostic artifacts |
| `err-*.txt` files (20+) | Artifacts | Historical error logs |
| `build_output.txt` | Artifacts | Historical build output |
| `react-doctor-*.json` | Artifacts | Historical React Doctor outputs |
| `_doctor_*.log` | Artifacts | Diagnostic logs |
| `_scan_*.json` | Artifacts | Scan results |
| `_status.json` | Artifacts | Status tracking |
| `_local_*.json` | Artifacts | Local config snapshots |
| `cdm_rerun*.json` | Artifacts | Re-run tracking |

### 1.2 Package Level
| Package | Status | Evidence |
|---------|--------|----------|
| `@spicegarden/api-types` | Unused | 0 importers in monorepo |
| `@spicegarden/proto` | Quarantined | 0 importers, no .proto files |
| `@spicegarden/grpc-transport` | Quarantined | 0 importers, throws GrpcTransportUnavailableError |

### 1.3 Code Level
| Location | Issue | Evidence |
|----------|-------|----------|
| `packages/ui/icons.css` | Unused CSS | Never imported, Tailwind syntax in non-Tailwind project |
| `packages/ui/Button.module.css` | Hardcoded colors | Does not reference DESIGN_TOKENS |
| `packages/shared/api.ts` | Framework coupling | Uses NEXT_PUBLIC_API_URL |
| `backend/src/grpc/*.ts` | Dead code | Placeholder controllers, no implementation |

## 2. Duplicate Logic

| Duplicate | Locations | Impact | Evidence |
|-----------|-----------|--------|----------|
| AnalyticsEventType definitions | packages/shared/analytics.ts + packages/ui/analytics.ts | Type divergence risk | Different event sets |
| DeliveryOrder type | packages/proto/src/constants.ts + packages/api-types/src/index.ts | Duplicate definitions | Identical structures |
| API client | packages/shared/api.ts + per-app implementations | Multiple fetch wrappers | customer-web uses shared, others use own |
| Error handling | Multiple per-app ErrorBoundary implementations | Inconsistent behavior | Each app has own |

## 3. Architecture Smells

### 3.1 Monolithic Components
| Component | Lines | Issue | Evidence |
|-----------|-------|-------|----------|
| restaurant-dashboard index.tsx | ~726 | Single massive component | All sub-components inline |
| delivery-partner App.tsx | ~871 | All screens inline | No separate navigation library |
| customer-mobile App.tsx | ~500+ | Inline screens | Monolithic structure |

### 3.2 State Management Inconsistency
| App | Primary State | Issue |
|-----|--------------|-------|
| customer-web | Redux + React Query + useReducer | Mixed patterns |
| customer-mobile | useReducer + useState | No global state |
| restaurant-dashboard | useReducer + dummy Redux | Redux unused |
| super-admin | useReducer + dummy Redux | Redux unused |
| delivery-partner | useReducer | No global state |

### 3.3 Unused Dependencies
| Dependency | App | Issue | Evidence |
|-----------|-----|-------|----------|
| recharts | delivery-partner | Listed but not imported | React Doctor warning |
| react-doctor | customer-web | Dev dependency, self-referential | React Doctor warning |

## 4. Circular Dependencies

**Result: 0 circular dependencies detected.**

The dependency graph is a strict DAG:
- `@spicegarden/ui` → 5 frontend apps
- `@spicegarden/shared` → customer-web only
- Backend → fully isolated

## 5. Maintainability Risks

| Risk | Severity | Evidence |
|------|----------|----------|
| 72 entity files in single directory | Medium | apps/backend/src/db/entities/ |
| 42 controllers in flat structure | Medium | apps/backend/src/services/ + apps/backend/src/modules/ |
| No API versioning strategy | High | All routes under single namespace |
| Mixed module organization (services/modules) | Low | Some features in services/, some in modules/ |
| Inconsistent controller naming | Low | Some use nouns, some use verbs |
| No centralized error handling | Medium | Each service handles errors independently |
| Hardcoded frontend URLs | Low | auth.controller.ts fallbacks |

## 6. Performance Risks

| Risk | Severity | Evidence |
|------|----------|----------|
| N+1 query potential in OrderService | High | No explicit join/relations in order queries |
| Missing composite indexes on OrderEntity | Medium | Only single-column indexes |
| No database connection pooling monitoring | Medium | Fixed pool size 20 |
| WebSocket message queue unbounded | Medium | messageQueue(500) limit in tracking.gateway.ts |
| No response caching headers | Low | APIs return fresh every time |
| Large bundle sizes (Next.js) | Low | 287-343kB first load JS |

## 7. Security Risks

| Risk | Severity | Evidence |
|------|----------|----------|
| No 2FA/MFA | High | Missing entirely |
| No account lockout | Medium | Only rate limiting, no brute force protection |
| Some untyped request bodies | Medium | `@Body() body: any` in multiple controllers |
| CSRF cookie httpOnly=false | Low | Required for CSRF token access |
| No password complexity | Low | Only length check ≥8 |
| No email verification enforcement | Low | Users can operate without verification |
| No request correlation ID | Low | No distributed tracing |

## 8. Refactoring Candidates

### High Priority
1. **Extract monolithic components** - Split restaurant-dashboard/index.tsx and delivery-partner/App.tsx
2. **Standardize state management** - Choose one pattern per app (Redux or React Query)
3. **Add API versioning** - Prepare for future breaking changes
4. **Fix N+1 queries** - Add explicit joins or query builders
5. **Add missing indexes** - Composite indexes on OrderEntity, WalletTransactionEntity

### Medium Priority
1. **Remove dead packages** - Delete @spicegarden/api-types, @spicegarden/proto, @spicegarden/grpc-transport
2. **Consolidate analytics types** - Merge shared/analytics.ts and ui/analytics.ts
3. **Unify API client** - Make @spicegarden/shared/api framework-agnostic
4. **Add request correlation** - Implement X-Request-Id middleware
5. **Improve test coverage** - Target 80%+ for backend services

### Low Priority
1. **Clean up artifacts** - Remove 30+ JSON/TXT artifacts from root
2. **Fix Button.module.css** - Reference DESIGN_TOKENS instead of hardcoded colors
3. **Remove unused icons.css** - Not imported anywhere
4. **Rename LottieSuccessAnimation** - Misleading name, not Lottie
5. **Wire dark mode tokens** - DARK_MODE_TOKENS defined but unused

## 9. Recommendations

| Priority | Action | Impact | Effort |
|----------|--------|--------|--------|
| P0 | Implement 2FA/MFA | Security | High |
| P0 | Add API versioning | Architecture | Medium |
| P1 | Fix N+1 queries | Performance | Medium |
| P1 | Add composite indexes | Performance | Low |
| P1 | Standardize state management | Maintainability | Medium |
| P2 | Remove dead packages | Maintainability | Low |
| P2 | Clean up artifacts | Maintainability | Low |
| P2 | Add request correlation | Observability | Low |
| P3 | Wire dark mode tokens | UX | Low |
| P3 | Fix component naming | Clarity | Low |
