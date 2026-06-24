# Repository Inventory

**Generated:** 2026-06-24  
**Verified from:** Source code inspection and file system analysis

## Root Structure

```
spicegarden/
├─ apps/                    # 7 applications
├─ packages/                # 6 shared packages
├─ infra/                   # Infrastructure & DevOps
├─ docs/                    # Documentation
├─ k8s/                     # Kubernetes manifests (duplicate of infra/k8s)
├─ scripts/                 # Utility scripts
├─ .github/workflows/       # CI/CD workflows (3 files)
├─ package.json             # Monorepo workspace config
├─ compose.dev.yaml         # Docker Compose (9 services)
├─ compose.yaml             # Alternative compose
├─ compose.infra.yaml       # Infra-only compose
├─ compose.debug.yaml       # Debug compose
```

## Applications

| App | Type | Stack | Status | Source Files | Routes/Screens |
|-----|------|-------|--------|--------------|---------------|
| **backend** | NestJS API | Node.js 20, TypeScript, PostgreSQL, MongoDB, Redis | Implemented, runtime-unverified | 678 TS files | REST + WebSocket |
| **customer-web** | Next.js Web | React 19, TypeScript, Redux Toolkit, TanStack Query | Implemented, runtime-unverified | ~35 TSX files | 21 pages |
| **restaurant-dashboard** | Next.js Web | React 19, TypeScript, Socket.IO | Implemented, runtime-unverified | ~3 TSX files | 2 pages |
| **super-admin** | Next.js Web | React 19, TypeScript, Recharts, Sentry | Implemented, runtime-unverified | ~3 TSX files | 2 pages |
| **customer-mobile** | Expo Mobile | React Native, TypeScript, React Navigation | Implemented, runtime-unverified | 43 TS/TSX files | 14 screens |
| **delivery-partner** | Expo Mobile | React Native, Expo, TypeScript | Implemented, runtime-unverified | 3 TS files, android native | 1 main screen |
| **driver-app** | Stub | React Native | Stubbed / placeholder | 2 TSX files (no package.json) | Not functional |
| **launcher** | Electron Desktop | Electron 42, TypeScript, React | Implemented, runtime-unverified | ~10 TS files | Desktop shell |

## Shared Packages

| Package | Purpose | Status | Source Files | Tests |
|---------|---------|--------|--------------|-------|
| **ui** | Shared React components | Implemented | 54 TSX files | 4 test files |
| **shared** | Utilities & constants | Implemented | ~20 TS files | Unknown |
| **api-types** | API contract types | Implemented | ~10 TS files | Unknown |
| **proto** | Protobuf definitions | Implemented | ~5 TS files | Unknown |
| **grpc-transport** | gRPC client transport | Stubbed / placeholder | 1 TS file (throws error) | None |
| **ux** | UX design artifacts | Documentation | ~20 TSX files | Unknown |

## Backend Module Inventory

| Module | Location | Status |
|--------|----------|--------|
| Analytics | `src/modules/analytics/` | Implemented |
| Auth | `src/modules/auth/` + `src/services/auth/` | Implemented |
| Driver Assignment | `src/modules/driver-assignment/` | Implemented |
| Kitchen | `src/modules/kitchen/` | Implemented |
| Ledger | `src/modules/ledger/` | Implemented |
| Notifications | `src/modules/notifications/` | Implemented |
| Orders | `src/modules/orders/` | Implemented |
| Realtime | `src/modules/realtime/` | Implemented |

## Backend Services Inventory

| Service | Location | Status |
|---------|----------|--------|
| AuthService | `src/services/auth/` | Implemented, test-verified |
| OrderService | `src/services/order/` | Implemented, test-verified |
| PaymentService | `src/services/payments/` | Implemented, test-verified |
| RestaurantService | `src/services/restaurant/` | Implemented |
| DeliveryService | `src/services/delivery/` | Implemented, test-verified |
| DriverAssignmentService | `src/modules/driver-assignment/` | Implemented |
| NotificationService | `src/services/notifications/` | Implemented, test-verified |
| WalletService | `src/services/wallet/` | Implemented, test-verified |
| AdminService | `src/services/admin/` | Implemented |
| SupportService | `src/services/support/` | Implemented |
| RefundService | `src/services/refund/` | Implemented |
| LoyaltyService | `src/services/loyalty/` | Implemented |
| SearchService | `src/services/search/` | Implemented |
| MenuCustomizationService | `src/services/menu-customization/` | Implemented |
| MapsService | `src/services/maps/` | Implemented |
| GeoService | `src/services/geo/` | Implemented |
| GSTService | `src/services/gst/` | Implemented |
| FinanceService | `src/services/finance/` | Implemented |

## Database Entities

**Total: 72 entities** (64 in `src/db/entities/` + 8 in `src/services/payments/`)

| Domain | Entity Count |
|--------|-------------|
| Core (User, Session, OTP) | 4 |
| Restaurant | 8 |
| Order | 2 |
| Payment | 10 |
| Financial (Wallet, Ledger, Refund) | 9 |
| Driver | 10 |
| Support | 3 |
| Marketing | 3 |
| Compliance | 3 |
| Operations | 12 |
| Inventory | 4 |
| Other | 6 |

## Infrastructure

| Component | Files | Status |
|-----------|-------|--------|
| Docker Compose | 4 YAML files | Config verified, runtime blocked |
| Kubernetes | 6 YAML files | Config verified, runtime blocked |
| Prometheus | 2 YAML files | Config present |
| Grafana | 3 YAML/JSON files | Config present |
| Alertmanager | 1 YAML file | Config present |
| OpenSearch | 1 JSON config | Config present |
| Filebeat | 1 YAML file | Config present |
| Envoy | 1 YAML file | Config present |

## Scripts

**Total: 19 scripts in infra/scripts/**

| Script | Purpose | Status |
|--------|---------|--------|
| security-tests.js | Security vulnerability tests | Implemented, runtime blocked |
| penetration-tests.js | Penetration testing | Implemented, runtime blocked |
| validate-secrets.js | Secret validation | Implemented, runnable |
| deployment-check.js | Deployment validation | Implemented |
| fake-orders.js | Fake order testing | Implemented |
| breaking-point.js | Breaking point tests | Implemented |
| backup.sh | Backup procedures | Implemented |
| disaster-recovery.sh | Disaster recovery | Implemented |
| autoscaling-validation.sh | Autoscaling tests | Implemented |
| production-validation.sh | Production validation | Implemented |
| verify-stack.js | Stack verification | Implemented |

## CI/CD Workflows

| File | Stages | Status |
|------|--------|--------|
| ci-cd.yml | security-audit, build-test, deploy-staging, deploy-production | Config verified |
| react-doctor.yml | React code quality scans | Config verified |
| rollback.yml | Rollback procedures | Config verified |

## Documentation Status

**Total: 100+ markdown files in root + docs/**

- Documentation in root: 75+ files
- Documentation in docs/: 67 files
- Historical/audit reports: 50+ files
- Architecture docs: 10 files

## Key Findings

### Active Applications
- 7 apps with package.json (backend, customer-web, restaurant-dashboard, super-admin, customer-mobile, delivery-partner, launcher)
- 1 stub app (driver-app) with only source files, no package.json

### Active Packages
- 6 packages defined in workspaces
- grpc-transport is explicitly quarantined/stubbed per its implementation

### Test Evidence
- 62 backend test spec files
- 918 total tests (911 passed, 6 failed, 1 skipped in latest run)
- Tests require MongoDB for some suites but passes without it for most

### Runtime Blockers
- Docker daemon unavailable (validated by compose.dev.yaml config)
- Kubernetes cluster unreachable (Windows environment)
- MongoDB connection fails for integration tests (no running instance)
- Security tests require running backend on localhost:3001