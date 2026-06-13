# SpiceGarden — Enterprise Food Delivery Platform

**Generated:** 2026-06-13  
**Scope:** This README now includes a repository-wide inventory of tracked files and folders, workspace package metadata, commands, ports, ignored/generated-file notes, and current working-tree status. Secret values and local environment values are intentionally not included.

---

## Repository Overview

SpiceGarden is an npm-workspace monorepo for a food-delivery platform with a NestJS backend, customer web/mobile apps, restaurant dashboard, super-admin dashboard, delivery partner apps, Electron launcher, shared API/UI/proto packages, infrastructure manifests, observability configuration, legal documents, UX documentation, and automation scripts.

| Metric | Value |
| :--- | :---: |
| Tracked files | 2,308 |
| Tracked directories | 392 |
| Markdown documents | 87 |
| TypeScript files | 593 |
| JavaScript files | 796 |
| Current modified files | 9 |
| Current deleted files | 1 |
| Current untracked files/folders | 13 |

---

## Workspace Packages

| Path | Package name | Files | Dependencies | Scripts |
| :--- | :--- | :--- | :--- | :--- |
| `apps/backend` | @spicegarden/backend | 1514 files | 57 deps | start, dev, build, lint, test, test:watch, test:cov, test:unit, test:integration, test:e2e, test:load, test:load:20k, test:load:breaking, test:chaos, test:all, test:mongo |
| `apps/customer-mobile` | @spicegarden/customer-mobile | 137 files | 26 deps | start, start:ci, android, ios, build, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/customer-web` | @spicegarden/customer-web | 76 files | 26 deps | dev, build, start, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/delivery-partner` | @spicegarden/delivery-partner | 75 files | 14 deps | start, android, ios, web, build, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/driver-app` | driver-app | 2 files | 0 deps | none |
| `apps/launcher` | spicegarden-launcher | 85 files | 21 deps | dev, dev:main, dev:renderer, build, build:main, build:renderer, dist, dist:installer, dist:portable, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/restaurant-dashboard` | @spicegarden/restaurant-dashboard | 33 files | 17 deps | dev, build, start, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/super-admin` | @spicegarden/super-admin | 34 files | 18 deps | dev, build, start, lint, test:unit, test:integration, test:e2e, test:all |
| `packages/api-types` | @spicegarden/api-types | 3 files | 4 deps | build, type-check, lint |
| `packages/grpc-transport` | grpc-transport | 3 files | 0 deps | none |
| `packages/proto` | proto | 5 files | 0 deps | none |
| `packages/shared` | @spicegarden/shared | 12 files | 1 deps | build, dev, lint, test:unit, test:integration, test:e2e, test:all |
| `packages/ui` | @spicegarden/ui | 144 files | 1 deps | build, lint, test:unit, test:integration, test:e2e, test:all |
| `packages/ux` | ux | 13 files | 0 deps | none |

---

## Commands, Ports, and Local Rules

### Root npm scripts

- `npm run dev` — run all workspace dev scripts
- `npm run build` — build all packages
- `npm run lint` — lint all packages
- `npm run test:unit` — run workspace unit tests
- `npm run test:integration` — run workspace integration tests
- `npm run test:e2e` — run workspace end-to-end tests
- `npm run test:all` — run all workspace tests
- `docker-compose -f compose.dev.yaml up -d` — start dev infrastructure
- `docker-compose -f compose.dev.yaml down` — stop dev infrastructure
- `powershell -File infra/scripts/generate-secrets.ps1` — generate local secrets on Windows
- `node infra/scripts/fake-orders.js` — run synthetic order tests
- `node infra/scripts/breaking-point.js` — run stress tests
- `node infra/scripts/security-tests.js` — run security vulnerability tests
- `node infra/scripts/penetration-tests.js` — run penetration tests
- `npm run test:load` — run k6 load tests for 10k users
- `npm run test:load:20k` — run k6 load tests for 20k users
- `npm run test:chaos` — run chaos experiments

### Documented ports

| Service | Port |
| :--- | :---: |
| Backend | 3001 |
| Grafana | 3000 |
| Prometheus | 9090 |
| Alertmanager | 9093 |
| OpenSearch | 9200 |
| OpenSearch Dashboards | 5601 |

### Feature-freeze rules from `AGENTS.md`

- No new modules
- No new AI features
- No redesign
- No extra dashboards
- No new frontend routes
- Only bug fixing, reliability improvements, deployment fixes, and production hardening are permitted without approval

---

## Top-Level Folder Map

| Folder | Description | Tracked files | Extension mix |
| :--- | :--- | :---: | :--- |
| `.github` | GitHub Actions workflows | 3 | yml: 3 |
| `.kilo` | Kilo configuration | 1 | json: 1 |
| `.storybook` | Storybook configuration | 2 | ts: 2 |
| `FrontendGaps` | Frontend test gap documentation | 2 | md: 1, json: 1 |
| `__tests__` | Root test utilities | 1 | ts: 1 |
| `apps` | Workspace applications | 1956 | js: 712, map: 584, ts: 394, tsx: 88, json: 31, webp: 20, xml: 16, md: 15, proto: 14, png: 10, css: 9, yaml: 7, gradle: 6, txt: 5, tsbuildinfo: 4, kt: 4, properties: 4, local: 3, html: 3, bak: 2, gitignore: 2, keystore: 2, pro: 2, jar: 2, (no ext): 2, bat: 2, bin: 2, dll: 2, cjs: 1, gitkeep: 1, gitattributes: 1, ico: 1, yml: 1, pak: 1, asar: 1, ps1: 1, nsh: 1 |
| `docs` | Architecture and platform documentation | 11 | md: 10, json: 1 |
| `infra` | Infrastructure and deployment assets | 67 | sh: 14, js: 13, yaml: 9, md: 8, yml: 8, ps1: 7, sql: 5, json: 3 |
| `k8s` | Repository folder | 1 | yaml: 1 |
| `legal` | Legal and contributor documents | 3 | md: 3 |
| `packages` | Shared packages | 180 | ts: 57, js: 50, tsx: 48, md: 13, json: 10, css: 1, tsbuildinfo: 1 |
| `scripts` | Repository scripts | 22 | js: 17, sh: 2, ps1: 1, ts: 1, cmd: 1 |
| `ux` | UX documentation | 20 | md: 20 |

---

## Directory Inventory

| Directory | Kind | Purpose | Tracked files |
| :--- | :--- | :--- | :---: |
| `.` | Project directory | Repository root. | 39 |
| `/.github` | Project directory | Project directory. | 3 |
| `/.github/workflows` | Project directory | GitHub Actions workflows. | 3 |
| `/.kilo` | Project directory | Project directory. | 1 |
| `/.storybook` | Project directory | Project directory. | 2 |
| `/FrontendGaps` | Project directory | Project directory. | 2 |
| `/__tests__` | Project directory | Project directory. | 1 |
| `/apps` | Project directory | Project directory. | 1956 |
| `/apps/backend` | Project directory | NestJS backend application. | 1514 |
| `/apps/backend/dist` | Project directory | Project directory. | 1137 |
| `/apps/backend/dist/audit` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/common` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/common/errors` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/compliance` | Project directory | Project directory. | 12 |
| `/apps/backend/dist/controllers` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/db` | Project directory | Project directory. | 146 |
| `/apps/backend/dist/db/entities` | Project directory | Project directory. | 130 |
| `/apps/backend/dist/db/interfaces` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/db/schemas` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/gateway` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/grpc` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/infra` | Project directory | Project directory. | 14 |
| `/apps/backend/dist/infra/observability` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/infra/queue` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/infra/tracking` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/jobs` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/legal` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/logging` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/metrics` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/modules` | Project directory | Project directory. | 34 |
| `/apps/backend/dist/modules/analytics` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/modules/auth` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/modules/driver-assignment` | Project directory | Project directory. | 10 |
| `/apps/backend/dist/modules/kitchen` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/modules/ledger` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/modules/notifications` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/modules/orders` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/modules/realtime` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/security` | Project directory | Project directory. | 14 |
| `/apps/backend/dist/services` | Project directory | Project directory. | 258 |
| `/apps/backend/dist/services/admin` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/ai` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/auth` | Project directory | Project directory. | 12 |
| `/apps/backend/dist/services/auth/strategies` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/delivery` | Project directory | Project directory. | 18 |
| `/apps/backend/dist/services/driver-fleet` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/finance` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/services/geo` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/gst` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/loyalty` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/maps` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/menu-customization` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/notifications` | Project directory | Project directory. | 18 |
| `/apps/backend/dist/services/notifications/queue` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/order` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/services/payment-provider` | Project directory | Project directory. | 10 |
| `/apps/backend/dist/services/payments` | Project directory | Project directory. | 54 |
| `/apps/backend/dist/services/payments/chargeback` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/payments/gateways` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/services/payments/webhook` | Project directory | Project directory. | 10 |
| `/apps/backend/dist/services/privacy` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/services/refund` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/restaurant` | Project directory | Project directory. | 30 |
| `/apps/backend/dist/services/review` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/search` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/support` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/services/user` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/services/users` | Project directory | Project directory. | 10 |
| `/apps/backend/dist/services/wallet` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/shared` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/shared/contracts` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/shared/domain` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/src` | Project directory | Project directory. | 540 |
| `/apps/backend/dist/src/audit` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/src/common` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/common/errors` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/compliance` | Project directory | Project directory. | 12 |
| `/apps/backend/dist/src/controllers` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/db` | Project directory | Project directory. | 146 |
| `/apps/backend/dist/src/db/entities` | Project directory | Project directory. | 130 |
| `/apps/backend/dist/src/db/interfaces` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/db/schemas` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/gateway` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/grpc` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/src/infra` | Project directory | Project directory. | 14 |
| `/apps/backend/dist/src/infra/observability` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/infra/queue` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/infra/tracking` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/src/jobs` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/legal` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/src/logging` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/src/metrics` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/src/modules` | Project directory | Project directory. | 34 |
| `/apps/backend/dist/src/modules/analytics` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/modules/auth` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/modules/driver-assignment` | Project directory | Project directory. | 10 |
| `/apps/backend/dist/src/modules/kitchen` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/modules/ledger` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/src/modules/notifications` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/modules/orders` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/modules/realtime` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/security` | Project directory | Project directory. | 14 |
| `/apps/backend/dist/src/services` | Project directory | Project directory. | 258 |
| `/apps/backend/dist/src/services/admin` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/ai` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/auth` | Project directory | Project directory. | 12 |
| `/apps/backend/dist/src/services/auth/strategies` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/delivery` | Project directory | Project directory. | 18 |
| `/apps/backend/dist/src/services/driver-fleet` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/finance` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/src/services/geo` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/gst` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/loyalty` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/maps` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/menu-customization` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/notifications` | Project directory | Project directory. | 18 |
| `/apps/backend/dist/src/services/notifications/queue` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/order` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/src/services/payment-provider` | Project directory | Project directory. | 10 |
| `/apps/backend/dist/src/services/payments` | Project directory | Project directory. | 54 |
| `/apps/backend/dist/src/services/payments/chargeback` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/payments/gateways` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/src/services/payments/webhook` | Project directory | Project directory. | 10 |
| `/apps/backend/dist/src/services/privacy` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/services/refund` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/restaurant` | Project directory | Project directory. | 30 |
| `/apps/backend/dist/src/services/review` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/search` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/support` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/src/services/user` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/services/users` | Project directory | Project directory. | 10 |
| `/apps/backend/dist/src/services/wallet` | Project directory | Project directory. | 8 |
| `/apps/backend/dist/src/shared` | Project directory | Project directory. | 6 |
| `/apps/backend/dist/src/shared/contracts` | Project directory | Project directory. | 2 |
| `/apps/backend/dist/src/shared/domain` | Project directory | Project directory. | 4 |
| `/apps/backend/dist/test` | Project directory | Project directory. | 56 |
| `/apps/backend/dist/test/__mocks__` | Project directory | Project directory. | 4 |
| `/apps/backend/scripts` | Project directory | Project directory. | 1 |
| `/apps/backend/src` | Project directory | Project directory. | 292 |
| `/apps/backend/src/audit` | Project directory | Project directory. | 2 |
| `/apps/backend/src/common` | Project directory | Project directory. | 1 |
| `/apps/backend/src/common/errors` | Project directory | Project directory. | 1 |
| `/apps/backend/src/compliance` | Project directory | Project directory. | 6 |
| `/apps/backend/src/controllers` | Project directory | Project directory. | 1 |
| `/apps/backend/src/db` | Project directory | Backend database entities/schemas/config. | 73 |
| `/apps/backend/src/db/entities` | TypeORM entities | Backend database entities/schemas/config. | 65 |
| `/apps/backend/src/db/interfaces` | Project directory | Backend database entities/schemas/config. | 1 |
| `/apps/backend/src/db/schemas` | Mongoose schemas | Backend database entities/schemas/config. | 1 |
| `/apps/backend/src/gateway` | Project directory | Project directory. | 1 |
| `/apps/backend/src/grpc` | Project directory | Project directory. | 4 |
| `/apps/backend/src/infra` | Project directory | Project directory. | 7 |
| `/apps/backend/src/infra/observability` | Project directory | Project directory. | 1 |
| `/apps/backend/src/infra/queue` | Project directory | Project directory. | 3 |
| `/apps/backend/src/infra/tracking` | Project directory | Project directory. | 2 |
| `/apps/backend/src/jobs` | Project directory | Project directory. | 1 |
| `/apps/backend/src/legal` | Project directory | Project directory. | 2 |
| `/apps/backend/src/logging` | Project directory | Project directory. | 2 |
| `/apps/backend/src/metrics` | Project directory | Project directory. | 4 |
| `/apps/backend/src/modules` | Backend NestJS module | Backend NestJS modules. | 17 |
| `/apps/backend/src/modules/analytics` | Backend NestJS module | Backend NestJS modules. | 3 |
| `/apps/backend/src/modules/auth` | Backend NestJS module | Backend NestJS modules. | 1 |
| `/apps/backend/src/modules/driver-assignment` | Backend NestJS module | Backend NestJS modules. | 5 |
| `/apps/backend/src/modules/kitchen` | Backend NestJS module | Backend NestJS modules. | 3 |
| `/apps/backend/src/modules/ledger` | Backend NestJS module | Backend NestJS modules. | 2 |
| `/apps/backend/src/modules/notifications` | Backend NestJS module | Backend NestJS modules. | 1 |
| `/apps/backend/src/modules/orders` | Backend NestJS module | Backend NestJS modules. | 1 |
| `/apps/backend/src/modules/realtime` | Backend NestJS module | Backend NestJS modules. | 1 |
| `/apps/backend/src/proto` | gRPC contracts | gRPC Protocol Buffer contracts. | 14 |
| `/apps/backend/src/proto/admin` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/analytics` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/auth` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/driver-assignment` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/driver-fleet` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/drivers` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/loyalty` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/notifications` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/orders` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/payments` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/refunds` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/restaurants` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/search` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/proto/wallet` | gRPC contracts | gRPC Protocol Buffer contracts. | 1 |
| `/apps/backend/src/security` | Project directory | Backend security middleware, guards, encryption, and vault. | 8 |
| `/apps/backend/src/services` | Backend service domain | Backend service domain modules. | 130 |
| `/apps/backend/src/services/admin` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/ai` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/auth` | Backend service domain | Backend service domain modules. | 6 |
| `/apps/backend/src/services/auth/strategies` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/delivery` | Backend service domain | Backend service domain modules. | 9 |
| `/apps/backend/src/services/driver-fleet` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/finance` | Backend service domain | Backend service domain modules. | 4 |
| `/apps/backend/src/services/geo` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/gst` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/loyalty` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/maps` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/menu-customization` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/notifications` | Backend service domain | Backend service domain modules. | 9 |
| `/apps/backend/src/services/notifications/queue` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/order` | Backend service domain | Backend service domain modules. | 4 |
| `/apps/backend/src/services/payment-provider` | Backend service domain | Backend service domain modules. | 5 |
| `/apps/backend/src/services/payments` | Backend service domain | Backend service domain modules. | 27 |
| `/apps/backend/src/services/payments/chargeback` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/payments/gateways` | Backend service domain | Backend service domain modules. | 4 |
| `/apps/backend/src/services/payments/webhook` | Backend service domain | Backend service domain modules. | 5 |
| `/apps/backend/src/services/privacy` | Backend service domain | Backend service domain modules. | 1 |
| `/apps/backend/src/services/refund` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/restaurant` | Backend service domain | Backend service domain modules. | 15 |
| `/apps/backend/src/services/review` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/search` | Backend service domain | Backend service domain modules. | 4 |
| `/apps/backend/src/services/support` | Backend service domain | Backend service domain modules. | 4 |
| `/apps/backend/src/services/user` | Backend service domain | Backend service domain modules. | 3 |
| `/apps/backend/src/services/users` | Backend service domain | Backend service domain modules. | 5 |
| `/apps/backend/src/services/wallet` | Backend service domain | Backend service domain modules. | 4 |
| `/apps/backend/src/shared` | Project directory | Project directory. | 3 |
| `/apps/backend/src/shared/contracts` | Project directory | Project directory. | 1 |
| `/apps/backend/src/shared/domain` | Project directory | Project directory. | 2 |
| `/apps/backend/src/types` | Project directory | Project directory. | 6 |
| `/apps/backend/test` | Backend tests | Backend tests, load tests, and chaos experiments. | 73 |
| `/apps/backend/test/__mocks__` | Backend tests | Backend tests, load tests, and chaos experiments. | 2 |
| `/apps/backend/test/chaos` | Chaos experiments | Backend tests, load tests, and chaos experiments. | 7 |
| `/apps/backend/test/load` | Load tests | Backend tests, load tests, and chaos experiments. | 13 |
| `/apps/customer-mobile` | Project directory | Expo customer mobile application. | 137 |
| `/apps/customer-mobile/.expo` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/__tests__` | Project directory | Expo customer mobile application. | 9 |
| `/apps/customer-mobile/__tests__/screens` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android` | Project directory | Expo customer mobile application. | 36 |
| `/apps/customer-mobile/android/app` | Project directory | Expo customer mobile application. | 28 |
| `/apps/customer-mobile/android/app/src` | Project directory | Expo customer mobile application. | 25 |
| `/apps/customer-mobile/android/app/src/debug` | Project directory | Expo customer mobile application. | 1 |
| `/apps/customer-mobile/android/app/src/debugOptimized` | Project directory | Expo customer mobile application. | 1 |
| `/apps/customer-mobile/android/app/src/main` | Project directory | Expo customer mobile application. | 23 |
| `/apps/customer-mobile/android/app/src/main/java` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/java/com` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/java/com/spicegarden` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/java/com/spicegarden/customer` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/res` | Project directory | Expo customer mobile application. | 20 |
| `/apps/customer-mobile/android/app/src/main/res/drawable` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/res/drawable-hdpi` | Project directory | Expo customer mobile application. | 1 |
| `/apps/customer-mobile/android/app/src/main/res/drawable-mdpi` | Project directory | Expo customer mobile application. | 1 |
| `/apps/customer-mobile/android/app/src/main/res/drawable-xhdpi` | Project directory | Expo customer mobile application. | 1 |
| `/apps/customer-mobile/android/app/src/main/res/drawable-xxhdpi` | Project directory | Expo customer mobile application. | 1 |
| `/apps/customer-mobile/android/app/src/main/res/drawable-xxxhdpi` | Project directory | Expo customer mobile application. | 1 |
| `/apps/customer-mobile/android/app/src/main/res/mipmap-hdpi` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/res/mipmap-mdpi` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/res/mipmap-xhdpi` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/res/mipmap-xxhdpi` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/res/mipmap-xxxhdpi` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/app/src/main/res/values` | Project directory | Expo customer mobile application. | 3 |
| `/apps/customer-mobile/android/gradle` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/android/gradle/wrapper` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/e2e` | Project directory | Expo customer mobile application. | 1 |
| `/apps/customer-mobile/src` | Project directory | Expo customer mobile application. | 72 |
| `/apps/customer-mobile/src/@types` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/src/components` | Project directory | Expo customer mobile application. | 11 |
| `/apps/customer-mobile/src/constants` | Project directory | Expo customer mobile application. | 9 |
| `/apps/customer-mobile/src/hooks` | Project directory | Expo customer mobile application. | 3 |
| `/apps/customer-mobile/src/navigation` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/src/screens` | Mobile screens | Expo customer mobile application. | 26 |
| `/apps/customer-mobile/src/services` | Project directory | Expo customer mobile application. | 5 |
| `/apps/customer-mobile/src/storage` | Project directory | Expo customer mobile application. | 2 |
| `/apps/customer-mobile/src/utils` | Project directory | Expo customer mobile application. | 11 |
| `/apps/customer-web` | Project directory | Next.js customer web application. | 76 |
| `/apps/customer-web/public` | Project directory | Next.js customer web application. | 2 |
| `/apps/customer-web/public/icons` | Project directory | Next.js customer web application. | 1 |
| `/apps/customer-web/src` | Project directory | Next.js customer web application. | 55 |
| `/apps/customer-web/src/components` | Project directory | Next.js customer web application. | 3 |
| `/apps/customer-web/src/contexts` | Project directory | Next.js customer web application. | 2 |
| `/apps/customer-web/src/hooks` | Project directory | Next.js customer web application. | 12 |
| `/apps/customer-web/src/pages` | Next.js pages/API routes | Next.js customer web application. | 29 |
| `/apps/customer-web/src/pages/api` | Next.js pages/API routes | Next.js customer web application. | 2 |
| `/apps/customer-web/src/pages/auth` | Next.js pages/API routes | Next.js customer web application. | 1 |
| `/apps/customer-web/src/pages/legal` | Next.js pages/API routes | Next.js customer web application. | 2 |
| `/apps/customer-web/src/redux` | Project directory | Next.js customer web application. | 6 |
| `/apps/customer-web/src/redux/slices` | Project directory | Next.js customer web application. | 4 |
| `/apps/customer-web/src/types` | Project directory | Next.js customer web application. | 1 |
| `/apps/delivery-partner` | Project directory | Expo delivery partner application. | 75 |
| `/apps/delivery-partner/.expo` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/@types` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/android` | Project directory | Expo delivery partner application. | 36 |
| `/apps/delivery-partner/android/app` | Project directory | Expo delivery partner application. | 28 |
| `/apps/delivery-partner/android/app/src` | Project directory | Expo delivery partner application. | 25 |
| `/apps/delivery-partner/android/app/src/debug` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/android/app/src/debugOptimized` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/android/app/src/main` | Project directory | Expo delivery partner application. | 23 |
| `/apps/delivery-partner/android/app/src/main/java` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/java/com` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/java/com/spicegarden` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/java/com/spicegarden/driver` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/res` | Project directory | Expo delivery partner application. | 20 |
| `/apps/delivery-partner/android/app/src/main/res/drawable` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/res/drawable-hdpi` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/android/app/src/main/res/drawable-mdpi` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/android/app/src/main/res/drawable-xhdpi` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/android/app/src/main/res/drawable-xxhdpi` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/android/app/src/main/res/drawable-xxxhdpi` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/android/app/src/main/res/mipmap-hdpi` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/res/mipmap-mdpi` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/res/mipmap-xhdpi` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/res/mipmap-xxhdpi` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/res/mipmap-xxxhdpi` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/app/src/main/res/values` | Project directory | Expo delivery partner application. | 3 |
| `/apps/delivery-partner/android/gradle` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/android/gradle/wrapper` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/src` | Project directory | Expo delivery partner application. | 21 |
| `/apps/delivery-partner/src/@types` | Project directory | Expo delivery partner application. | 2 |
| `/apps/delivery-partner/src/hooks` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/src/navigation` | Project directory | Expo delivery partner application. | 1 |
| `/apps/delivery-partner/src/screens` | Delivery partner screens | Expo delivery partner application. | 12 |
| `/apps/delivery-partner/src/services` | Project directory | Expo delivery partner application. | 3 |
| `/apps/delivery-partner/src/services/__tests` | Project directory | Expo delivery partner application. | 1 |
| `/apps/driver-app` | Project directory | Driver mobile application. | 2 |
| `/apps/launcher` | Project directory | Electron desktop launcher. | 85 |
| `/apps/launcher/assets` | Project directory | Electron desktop launcher. | 3 |
| `/apps/launcher/build` | Project directory | Electron desktop launcher. | 9 |
| `/apps/launcher/build/win-unpacked` | Project directory | Electron desktop launcher. | 7 |
| `/apps/launcher/build/win-unpacked/resources` | Project directory | Electron desktop launcher. | 1 |
| `/apps/launcher/dist` | Project directory | Electron desktop launcher. | 35 |
| `/apps/launcher/dist/main` | Project directory | Electron desktop launcher. | 32 |
| `/apps/launcher/dist/renderer` | Project directory | Electron desktop launcher. | 3 |
| `/apps/launcher/scripts` | Project directory | Electron desktop launcher. | 3 |
| `/apps/launcher/src` | Project directory | Electron desktop launcher. | 24 |
| `/apps/launcher/src/main` | Project directory | Electron desktop launcher. | 16 |
| `/apps/launcher/src/renderer` | Project directory | Electron desktop launcher. | 8 |
| `/apps/launcher/src/renderer/components` | Project directory | Electron desktop launcher. | 2 |
| `/apps/launcher/src/renderer/pages` | Project directory | Electron desktop launcher. | 2 |
| `/apps/restaurant-dashboard` | Project directory | Next.js restaurant dashboard/KDS. | 33 |
| `/apps/restaurant-dashboard/__tests__` | Project directory | Next.js restaurant dashboard/KDS. | 5 |
| `/apps/restaurant-dashboard/__tests__/e2e` | Project directory | Next.js restaurant dashboard/KDS. | 1 |
| `/apps/restaurant-dashboard/src` | Project directory | Next.js restaurant dashboard/KDS. | 15 |
| `/apps/restaurant-dashboard/src/pages` | Restaurant dashboard pages | Next.js restaurant dashboard/KDS. | 13 |
| `/apps/restaurant-dashboard/src/pages/api` | Restaurant dashboard pages | Next.js restaurant dashboard/KDS. | 2 |
| `/apps/restaurant-dashboard/src/pages/onboarding` | Restaurant dashboard pages | Next.js restaurant dashboard/KDS. | 8 |
| `/apps/restaurant-dashboard/src/redux` | Project directory | Next.js restaurant dashboard/KDS. | 1 |
| `/apps/restaurant-dashboard/src/types` | Project directory | Next.js restaurant dashboard/KDS. | 1 |
| `/apps/super-admin` | Project directory | Next.js super-admin dashboard. | 34 |
| `/apps/super-admin/__tests__` | Project directory | Next.js super-admin dashboard. | 2 |
| `/apps/super-admin/src` | Project directory | Next.js super-admin dashboard. | 17 |
| `/apps/super-admin/src/pages` | Admin dashboard pages | Next.js super-admin dashboard. | 16 |
| `/apps/super-admin/src/pages/analytics` | Admin dashboard pages | Next.js super-admin dashboard. | 3 |
| `/apps/super-admin/src/pages/api` | Admin dashboard pages | Next.js super-admin dashboard. | 2 |
| `/apps/super-admin/src/pages/api/admin` | Admin dashboard pages | Next.js super-admin dashboard. | 1 |
| `/apps/super-admin/src/pages/driver-fleet` | Admin dashboard pages | Next.js super-admin dashboard. | 5 |
| `/apps/super-admin/src/pages/loyalty` | Admin dashboard pages | Next.js super-admin dashboard. | 3 |
| `/apps/super-admin/src/redux` | Project directory | Next.js super-admin dashboard. | 1 |
| `/apps/super-admin/types` | Project directory | Next.js super-admin dashboard. | 2 |
| `/docs` | Documentation | Architecture, API, security, and phase documentation. | 11 |
| `/docs/security` | Documentation | Architecture, API, security, and phase documentation. | 2 |
| `/infra` | Project directory | Project directory. | 67 |
| `/infra/alertmanager` | Project directory | Project directory. | 1 |
| `/infra/docs` | Project directory | Project directory. | 3 |
| `/infra/envoy` | Project directory | Project directory. | 1 |
| `/infra/filebeat` | Project directory | Project directory. | 1 |
| `/infra/grafana` | Project directory | Grafana dashboards/provisioning. | 3 |
| `/infra/grafana/dashboards` | Project directory | Grafana dashboards/provisioning. | 1 |
| `/infra/grafana/provisioning` | Project directory | Grafana dashboards/provisioning. | 2 |
| `/infra/grafana/provisioning/dashboards` | Project directory | Grafana dashboards/provisioning. | 1 |
| `/infra/grafana/provisioning/datasources` | Project directory | Grafana dashboards/provisioning. | 1 |
| `/infra/k8s` | Kubernetes manifests | Kubernetes manifests. | 8 |
| `/infra/opensearch` | Project directory | OpenSearch index templates. | 1 |
| `/infra/opensearch/index-templates` | Project directory | OpenSearch index templates. | 1 |
| `/infra/postgres` | Project directory | PostgreSQL init, migrations, and seed SQL. | 5 |
| `/infra/postgres/migrations` | Database migrations | PostgreSQL init, migrations, and seed SQL. | 2 |
| `/infra/postgres/seed` | Database seed scripts | PostgreSQL init, migrations, and seed SQL. | 2 |
| `/infra/prometheus` | Project directory | Prometheus metrics/alerts. | 4 |
| `/infra/prometheus/rules` | Project directory | Prometheus metrics/alerts. | 2 |
| `/infra/scripts` | Infrastructure scripts | Infrastructure automation scripts. | 35 |
| `/k8s` | Project directory | Project directory. | 1 |
| `/legal` | Legal docs | Legal and contributor agreement documentation. | 3 |
| `/packages` | Project directory | Project directory. | 180 |
| `/packages/api-types` | Project directory | Shared API TypeScript types. | 3 |
| `/packages/api-types/src` | Project directory | Shared API TypeScript types. | 1 |
| `/packages/grpc-transport` | Project directory | Shared gRPC transport utilities. | 3 |
| `/packages/grpc-transport/src` | Project directory | Shared gRPC transport utilities. | 1 |
| `/packages/proto` | Project directory | Shared Protocol Buffer package. | 5 |
| `/packages/proto/src` | Project directory | Shared Protocol Buffer package. | 3 |
| `/packages/shared` | Project directory | Shared API/client utilities. | 12 |
| `/packages/shared/dist` | Project directory | Shared API/client utilities. | 5 |
| `/packages/ui` | UI package | Shared UI components, icons, tokens, and tests. | 144 |
| `/packages/ui/__tests__` | UI tests | Shared UI components, icons, tokens, and tests. | 11 |
| `/packages/ui/icons` | UI icon components | Shared UI components, icons, tokens, and tests. | 48 |
| `/packages/ui/icons/admin` | UI icon components | Shared UI components, icons, tokens, and tests. | 3 |
| `/packages/ui/icons/commerce` | UI icon components | Shared UI components, icons, tokens, and tests. | 12 |
| `/packages/ui/icons/delivery` | UI icon components | Shared UI components, icons, tokens, and tests. | 3 |
| `/packages/ui/icons/kitchen` | UI icon components | Shared UI components, icons, tokens, and tests. | 6 |
| `/packages/ui/icons/navigation` | UI icon components | Shared UI components, icons, tokens, and tests. | 9 |
| `/packages/ui/icons/system` | UI icon components | Shared UI components, icons, tokens, and tests. | 9 |
| `/packages/ux` | Project directory | UX phase-1 design documentation. | 13 |
| `/packages/ux/phase-1` | UX phase-1 docs | UX phase-1 design documentation. | 13 |
| `/scripts` | Repository scripts | Repository maintenance scripts. | 22 |
| `/ux` | Project directory | UX phase documentation. | 20 |
| `/ux/phase-1` | UX phase-1 docs | UX phase documentation. | 14 |
| `/ux/phase-2` | UX phase-2 docs | UX phase documentation. | 5 |

---

## File Extension Summary

| Extension | Count |
| :--- | :---: |
| `js` | 793 |
| `map` | 584 |
| `ts` | 457 |
| `tsx` | 136 |
| `md` | 87 |
| `json` | 49 |
| `yaml` | 21 |
| `webp` | 20 |
| `sh` | 16 |
| `xml` | 16 |
| `proto` | 14 |
| `yml` | 12 |
| `css` | 10 |
| `png` | 10 |
| `ps1` | 9 |
| `txt` | 7 |
| `gradle` | 6 |
| `sql` | 5 |
| `tsbuildinfo` | 5 |
| `(no ext)` | 4 |
| `kt` | 4 |
| `properties` | 4 |
| `cjs` | 3 |
| `example` | 3 |
| `gitignore` | 3 |
| `html` | 3 |
| `local` | 3 |
| `bak` | 2 |
| `bat` | 2 |
| `bin` | 2 |
| `dll` | 2 |
| `gitattributes` | 2 |
| `jar` | 2 |
| `keystore` | 2 |
| `pro` | 2 |
| `asar` | 1 |
| `cmd` | 1 |
| `dockerignore` | 1 |
| `gitkeep` | 1 |
| `ico` | 1 |
| `npmrc` | 1 |
| `nsh` | 1 |
| `pak` | 1 |

---

## Current Working-Tree Status

| Status | Path | Note |
| :--- | :--- | :--- |
| Modified | `.eslintrc.cjs` | Working-tree modification present during README generation. |
| Modified | `README.md` | Working-tree modification present during README generation. |
| Modified | `apps/customer-web/next.config.js` | Working-tree modification present during README generation. |
| Modified | `apps/customer-web/src/pages/index.tsx` | Working-tree modification present during README generation. |
| Modified | `apps/restaurant-dashboard/next.config.js` | Working-tree modification present during README generation. |
| Modified | `apps/super-admin/next.config.js` | Working-tree modification present during README generation. |
| Modified | `packages/ui/icons/index.js` | Working-tree modification present during README generation. |
| Modified | `packages/ui/icons/index.ts` | Working-tree modification present during README generation. |
| Modified | `packages/ui/tsconfig.tsbuildinfo` | Working-tree modification present during README generation. |
| Deleted | `frontend_readme.md` | File deleted in working tree during README generation. |
| Untracked | `README_temp.md` | New or ignored file/folder present during README generation. |
| Untracked | `backup/` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/BurgerIcon.js` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/BurgerIcon.tsx` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/DessertIcon.js` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/DessertIcon.tsx` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/DrinkIcon.js` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/DrinkIcon.tsx` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/HealthyIcon.js` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/HealthyIcon.tsx` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/PizzaIcon.js` | New or ignored file/folder present during README generation. |
| Untracked | `packages/ui/icons/commerce/PizzaIcon.tsx` | New or ignored file/folder present during README generation. |
| Untracked | `tsconfig.tsbuildinfo` | New or ignored file/folder present during README generation. |

---

## Ignored or Generated Areas Summarized Only

- `node_modules/` — dependency cache; not expanded in the tracked inventory
- `secrets/` — local secret files; values and individual secret filenames are intentionally not documented
- `.env` and `.env.*.local` — environment files; values are intentionally not documented
- `.next/`, `out/`, `dist/`, `build/` — generated build output; tracked build artifacts are listed, but ignored build output is summarized only
- `.kilo/`, `.kilocode/` — local tool configuration and caches

---

## Complete Tracked File Inventory

| File | Kind | Purpose | Lines/bytes |
| :--- | :--- | :--- | :---: |
| `.dockerignore` | Docker ignore | Docker build ignore rules. | 26 |
| `.env.example` | Environment template | Environment template with keys: NODE_ENV, PORT, SESSION_DURATION_DAYS, REFRESH_TOKEN_LENGTH, DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, MONGO_URI, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN, ENCRYPTION_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PAYMENT_PRIMARY_GATEWAY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_RELEASE, .... | 93 |
| `.env.production.example` | File | File: .env.production. | 68 |
| `.env.staging.example` | File | File: .env.staging. | 63 |
| `.eslintrc.cjs` | JavaScript | Source file: .eslintrc. | 49 |
| `.gitattributes` | Git attributes | Git attributes rule file. | 2 |
| `.github/workflows/ci-cd.yml` | YAML | YAML config with services: push, pull_request, schedule, security-audit, build-test, deploy-staging, deploy-production. | 168 |
| `.github/workflows/react-doctor.yml` | YAML | YAML config with services: pull_request, push, react-doctor. | 27 |
| `.github/workflows/rollback.yml` | YAML | YAML config with services: workflow_dispatch, issues, rollback. | 81 |
| `.gitignore` | Git ignore | Git ignore rule file. | 44 |
| `.kilo/kilo.json` | JSON | JSON data file. | 4 |
| `.npmrc` | npm config | npm configuration file. | 6 |
| `.storybook/main.ts` | TypeScript | Source file: main. | 13 |
| `.storybook/preview.ts` | TypeScript | Source file: preview. | 15 |
| `AGENTS.md` | Markdown | SpiceGarden Development Commands — - `docker-compose -f compose.dev.yaml up -d` - Start dev infrastructure (Docker Desktop required) - `docker-compose -f compose.dev.yaml down` - Stop infrastructure - `powershell -F | 73 |
| `BUSINESS_ENGINE.md` | Markdown | SpiceGarden Business Engine — - **3 Real Restaurants** seeded with authentic data: - Spice Garden - Downtown (Pakistani cuisine) - Spice Garden - Mall Road (Fast food) - Spice Garden - Gulshan (Italian cuisine) | 111 |
| `CONTRIBUTING.md` | Markdown | Contributing to SpiceGarden — Thank you for your interest in contributing to SpiceGarden! This document outlines the contribution process and legal requirements. By contributing to SpiceGarden, you agree to the | 52 |
| `Dockerfile` | Executable/config | Repository file: Dockerfile. | 51 |
| `FrontendGaps/README.md` | Markdown | Frontend Testing & UI Polish Implementation - COMPLETE — All frontend gaps have been addressed with comprehensive tests and UI components. Total tests: **54 passing**. - **Cart Slice Tests** (`__tests__/cart.test.tsx`): 86.66% statement | 100 |
| `FrontendGaps/cross-browser-config.json` | JSON | JSON configuration file. | 31 |
| `IMPLEMENTATION_SUMMARY.md` | Markdown | IMPLEMENTATION SUMMARY — IMPLEMENTATION SUMMARY ✅ Network status handling: useNetworkStatus hook created ✅ Offline-first patterns: useOfflineQueue hook created ✅ Error boundaries: ErrorBoundary component c | 21 |
| `INTERNAL_ALPHA_TESTING.md` | Markdown | Phase I - Internal Alpha Testing — Break the system. Fix everything. - Focus: Basic functionality - Test: Place orders, track orders, basic navigation - Focus: Real-world usage patterns - Test: Multiple orders, wall | 63 |
| `LEGAL_trademark-search.md` | Markdown | Trademark Search and Registration — **Company:** SpiceGarden Technologies Private Limited **Date:** June 10, 2026 **Status:** Preliminary Search Complete - **Mark:** "SpiceGarden" - **Class:** 39 (Transportation & St | 77 |
| `LICENSE` | Executable/config | Repository file: LICENSE. | 21 |
| `MASTER_TRACKING_SHEET.md` | Markdown | Master Tracking Sheet — **Current Phase:** Internal Alpha Testing (May 2026) \| Module \| Build % \| Tested % \| Production % \| Status \| \|--------\|---------\|----------\|--------------\|--------\| \| Auth \| 95 \| 4 | 182 |
| `PLAN.md` | Markdown | Enterprise-Level Implementation Plan: Customer Mobile & Delivery Partner Apps — \| Priority \| Area \| Customer Mobile \| Delivery Partner \| Impact \| Effort \| \|----------\|------\|-----------------\|------------------\|--------\|--------\| \| P0 \| Navigation Flow \| Missi | 466 |
| `PRODUCTION_READINESS_SUMMARY.md` | Markdown | PRODUCTION READINESS IMPLEMENTATION SUMMARY — All requested production readiness features have been successfully implemented in the SpiceGarden customer web application. This includes: - Enhanced all three core pages with prod | 141 |
| `README.md` | Markdown | SpiceGarden — Enterprise Food Delivery Platform — **Generated:** 2026-06-13 **Scope:** This README now includes a repository-wide inventory of tracked files and folders, workspace package metadata, commands, ports, ignored/generat | 2,915 |
| `RELIABILITY_TESTING.md` | Markdown | Production Reliability Testing — Comprehensive load, failure recovery, and chaos testing for SpiceGarden. ```bash npm run test:reliability # Failure recovery unit tests (26 tests) npm run test:chaos # Chaos experi | 185 |
| `SECURITY_NOTICE.md` | Markdown | Security & Production Readiness Notice — **⚠️ CRITICAL: Read before production deployment** Last updated: 2026-05-30 --- - **Issue**: `JWT_SECRET` was hardcoded as `secret-key-change-in-production` in `.env.example` - **I | 122 |
| `TESTING_STRATEGY.md` | Markdown | Comprehensive Testing Strategy for SpiceGarden Delivery Engine — This document outlines the testing strategy for verifying the delivery engine upgrades including driver reassignment, batch order processing, traffic-aware routing, ETA correction, | 305 |
| `TODO.md` | Markdown | TODO — SpiceGarden Platform — - [x] 1) Create monorepo root (package.json + workspaces) and base scripts - [x] 2) Create docs and business architecture notes - [x] 3) Scaffold 6 major systems as empty apps/pack | 45 |
| `UX_PHASE_1_Figma_Architecture_PLAN.md` | Markdown | PHASE 1 — COMPLETE FIGMA UX ARCHITECTURE + ENTERPRISE UI/UX SYSTEM (Plan) — Ready to be implemented as markdown spec inside this repo (to be recreated in Figma). --- - Monorepo contains 5 product surfaces: Customer (web+mobile), Restaurant Dashboard, Deliv | 152 |
| `UX_PHASE_1_TODO.md` | Markdown | UX Phase 1 - Status — Deliver complete Figma UX architecture + enterprise UI/UX system via markdown spec. - [x] All 12 UX documents created in `packages/ux/phase-1/` --- \| Module \| Status \| \|--------\|-- | 141 |
| `V1_SCOPE.md` | Markdown | V1 Scope - Frozen — > **Last Updated:** 2026-05-25 > **Status:** Ready for Production Testing - [x] Signup/Login (`apps/customer-web/src/pages/auth.tsx`) - [x] Browse restaurants (`apps/customer-web/s | 64 |
| `__tests__/test-utils.ts` | TypeScript | Test file for test utils. | 91 |
| `app.module.js` | JavaScript | NestJS module: app.module. | 99 |
| `app.module.ts` | TypeScript | NestJS module: app.module. | 50 |
| `apps/backend/README.md` | Markdown | SpiceGarden Backend — NestJS 10 API (TypeScript, CommonJS) on port 3001 for Internal Alpha testing. ``` Test Suites: 9 passed, 9 total Tests: 56 passed, 56 total ``` ```bash npm run dev -w @spicegarden/ | 72 |
| `apps/backend/dist/apis.controller.js` | Build artifact | Compiled or packaged artifact: apis.controller. | 50 |
| `apps/backend/dist/apis.controller.js.map` | Build artifact | Compiled or packaged artifact: apis.controller.js. | 1 |
| `apps/backend/dist/apis.module.js` | Build artifact | Compiled or packaged artifact: apis.module. | 22 |
| `apps/backend/dist/apis.module.js.map` | Build artifact | Compiled or packaged artifact: apis.module.js. | 1 |
| `apps/backend/dist/apis.service.js` | Build artifact | Compiled or packaged artifact: apis.service. | 20 |
| `apps/backend/dist/apis.service.js.map` | Build artifact | Compiled or packaged artifact: apis.service.js. | 1 |
| `apps/backend/dist/app.controller.js` | Build artifact | Compiled or packaged artifact: app.controller. | 44 |
| `apps/backend/dist/app.controller.js.map` | Build artifact | Compiled or packaged artifact: app.controller.js. | 1 |
| `apps/backend/dist/app.http.module.js` | Build artifact | Compiled or packaged artifact: app.http.module. | 48 |
| `apps/backend/dist/app.http.module.js.map` | Build artifact | Compiled or packaged artifact: app.http.module.js. | 1 |
| `apps/backend/dist/app.module.js` | Build artifact | Compiled or packaged artifact: app.module. | 121 |
| `apps/backend/dist/app.module.js.map` | Build artifact | Compiled or packaged artifact: app.module.js. | 1 |
| `apps/backend/dist/app.service.js` | Build artifact | Compiled or packaged artifact: app.service. | 20 |
| `apps/backend/dist/app.service.js.map` | Build artifact | Compiled or packaged artifact: app.service.js. | 1 |
| `apps/backend/dist/audit/audit.module.js` | Build artifact | Compiled or packaged artifact: audit.module. | 21 |
| `apps/backend/dist/audit/audit.module.js.map` | Build artifact | Compiled or packaged artifact: audit.module.js. | 1 |
| `apps/backend/dist/audit/audit.service.js` | Build artifact | Compiled or packaged artifact: audit.service. | 177 |
| `apps/backend/dist/audit/audit.service.js.map` | Build artifact | Compiled or packaged artifact: audit.service.js. | 1 |
| `apps/backend/dist/common/errors/missing-env.error.js` | Build artifact | Compiled or packaged artifact: missing env.error. | 34 |
| `apps/backend/dist/common/errors/missing-env.error.js.map` | Build artifact | Compiled or packaged artifact: missing env.error.js. | 1 |
| `apps/backend/dist/compliance/compliance.controller.js` | Build artifact | Compiled or packaged artifact: compliance.controller. | 343 |
| `apps/backend/dist/compliance/compliance.controller.js.map` | Build artifact | Compiled or packaged artifact: compliance.controller.js. | 1 |
| `apps/backend/dist/compliance/compliance.module.js` | Build artifact | Compiled or packaged artifact: compliance.module. | 24 |
| `apps/backend/dist/compliance/compliance.module.js.map` | Build artifact | Compiled or packaged artifact: compliance.module.js. | 1 |
| `apps/backend/dist/compliance/compliance.service.js` | Build artifact | Compiled or packaged artifact: compliance.service. | 260 |
| `apps/backend/dist/compliance/compliance.service.js.map` | Build artifact | Compiled or packaged artifact: compliance.service.js. | 1 |
| `apps/backend/dist/compliance/pci-dss-validation.service.js` | Build artifact | Compiled or packaged artifact: pci dss validation.service. | 272 |
| `apps/backend/dist/compliance/pci-dss-validation.service.js.map` | Build artifact | Compiled or packaged artifact: pci dss validation.service.js. | 1 |
| `apps/backend/dist/compliance/secrets-rotation.service.js` | Build artifact | Compiled or packaged artifact: secrets rotation.service. | 130 |
| `apps/backend/dist/compliance/secrets-rotation.service.js.map` | Build artifact | Compiled or packaged artifact: secrets rotation.service.js. | 1 |
| `apps/backend/dist/compliance/soc2-readiness.service.js` | Build artifact | Compiled or packaged artifact: soc2 readiness.service. | 251 |
| `apps/backend/dist/compliance/soc2-readiness.service.js.map` | Build artifact | Compiled or packaged artifact: soc2 readiness.service.js. | 1 |
| `apps/backend/dist/controllers/driver.controller.js` | Build artifact | Compiled or packaged artifact: driver.controller. | 327 |
| `apps/backend/dist/controllers/driver.controller.js.map` | Build artifact | Compiled or packaged artifact: driver.controller.js. | 1 |
| `apps/backend/dist/db/database-failover.service.js` | Build artifact | Compiled or packaged artifact: database failover.service. | 135 |
| `apps/backend/dist/db/database-failover.service.js.map` | Build artifact | Compiled or packaged artifact: database failover.service.js. | 1 |
| `apps/backend/dist/db/db.module.js` | Build artifact | Compiled or packaged artifact: db.module. | 196 |
| `apps/backend/dist/db/db.module.js.map` | Build artifact | Compiled or packaged artifact: db.module.js. | 1 |
| `apps/backend/dist/db/entities/address.entity.js` | Build artifact | Compiled or packaged artifact: address.entity. | 84 |
| `apps/backend/dist/db/entities/address.entity.js.map` | Build artifact | Compiled or packaged artifact: address.entity.js. | 1 |
| `apps/backend/dist/db/entities/audit-log.entity.js` | Build artifact | Compiled or packaged artifact: audit log.entity. | 62 |
| `apps/backend/dist/db/entities/audit-log.entity.js.map` | Build artifact | Compiled or packaged artifact: audit log.entity.js. | 1 |
| `apps/backend/dist/db/entities/batch.entity.js` | Build artifact | Compiled or packaged artifact: batch.entity. | 107 |
| `apps/backend/dist/db/entities/batch.entity.js.map` | Build artifact | Compiled or packaged artifact: batch.entity.js. | 1 |
| `apps/backend/dist/db/entities/branch-control.entity.js` | Build artifact | Compiled or packaged artifact: branch control.entity. | 80 |
| `apps/backend/dist/db/entities/branch-control.entity.js.map` | Build artifact | Compiled or packaged artifact: branch control.entity.js. | 1 |
| `apps/backend/dist/db/entities/commission-rule.entity.js` | Build artifact | Compiled or packaged artifact: commission rule.entity. | 102 |
| `apps/backend/dist/db/entities/commission-rule.entity.js.map` | Build artifact | Compiled or packaged artifact: commission rule.entity.js. | 1 |
| `apps/backend/dist/db/entities/coupon-usage.entity.js` | Build artifact | Compiled or packaged artifact: coupon usage.entity. | 67 |
| `apps/backend/dist/db/entities/coupon-usage.entity.js.map` | Build artifact | Compiled or packaged artifact: coupon usage.entity.js. | 1 |
| `apps/backend/dist/db/entities/coupon.entity.js` | Build artifact | Compiled or packaged artifact: coupon.entity. | 156 |
| `apps/backend/dist/db/entities/coupon.entity.js.map` | Build artifact | Compiled or packaged artifact: coupon.entity.js. | 1 |
| `apps/backend/dist/db/entities/data-export-request.entity.js` | Build artifact | Compiled or packaged artifact: data export request.entity. | 76 |
| `apps/backend/dist/db/entities/data-export-request.entity.js.map` | Build artifact | Compiled or packaged artifact: data export request.entity.js. | 1 |
| `apps/backend/dist/db/entities/deletion-request.entity.js` | Build artifact | Compiled or packaged artifact: deletion request.entity. | 71 |
| `apps/backend/dist/db/entities/deletion-request.entity.js.map` | Build artifact | Compiled or packaged artifact: deletion request.entity.js. | 1 |
| `apps/backend/dist/db/entities/delivery-sla.entity.js` | Build artifact | Compiled or packaged artifact: delivery sla.entity. | 82 |
| `apps/backend/dist/db/entities/delivery-sla.entity.js.map` | Build artifact | Compiled or packaged artifact: delivery sla.entity.js. | 1 |
| `apps/backend/dist/db/entities/device-fingerprint.entity.js` | Build artifact | Compiled or packaged artifact: device fingerprint.entity. | 78 |
| `apps/backend/dist/db/entities/device-fingerprint.entity.js.map` | Build artifact | Compiled or packaged artifact: device fingerprint.entity.js. | 1 |
| `apps/backend/dist/db/entities/dispute.entity.js` | Build artifact | Compiled or packaged artifact: dispute.entity. | 141 |
| `apps/backend/dist/db/entities/dispute.entity.js.map` | Build artifact | Compiled or packaged artifact: dispute.entity.js. | 1 |
| `apps/backend/dist/db/entities/driver-assignment.entity.js` | Build artifact | Compiled or packaged artifact: driver assignment.entity. | 103 |
| `apps/backend/dist/db/entities/driver-assignment.entity.js.map` | Build artifact | Compiled or packaged artifact: driver assignment.entity.js. | 1 |
| `apps/backend/dist/db/entities/driver-document.entity.js` | Build artifact | Compiled or packaged artifact: driver document.entity. | 96 |
| `apps/backend/dist/db/entities/driver-document.entity.js.map` | Build artifact | Compiled or packaged artifact: driver document.entity.js. | 1 |
| `apps/backend/dist/db/entities/driver-fraud.entity.js` | Build artifact | Compiled or packaged artifact: driver fraud.entity. | 88 |
| `apps/backend/dist/db/entities/driver-fraud.entity.js.map` | Build artifact | Compiled or packaged artifact: driver fraud.entity.js. | 1 |
| `apps/backend/dist/db/entities/driver-incentive.entity.js` | Build artifact | Compiled or packaged artifact: driver incentive.entity. | 101 |
| `apps/backend/dist/db/entities/driver-incentive.entity.js.map` | Build artifact | Compiled or packaged artifact: driver incentive.entity.js. | 1 |
| `apps/backend/dist/db/entities/driver-penalty.entity.js` | Build artifact | Compiled or packaged artifact: driver penalty.entity. | 120 |
| `apps/backend/dist/db/entities/driver-penalty.entity.js.map` | Build artifact | Compiled or packaged artifact: driver penalty.entity.js. | 1 |
| `apps/backend/dist/db/entities/driver-score.entity.js` | Build artifact | Compiled or packaged artifact: driver score.entity. | 92 |
| `apps/backend/dist/db/entities/driver-score.entity.js.map` | Build artifact | Compiled or packaged artifact: driver score.entity.js. | 1 |
| `apps/backend/dist/db/entities/driver-shift.entity.js` | Build artifact | Compiled or packaged artifact: driver shift.entity. | 87 |
| `apps/backend/dist/db/entities/driver-shift.entity.js.map` | Build artifact | Compiled or packaged artifact: driver shift.entity.js. | 1 |
| `apps/backend/dist/db/entities/driver.entity.js` | Build artifact | Compiled or packaged artifact: driver.entity. | 135 |
| `apps/backend/dist/db/entities/driver.entity.js.map` | Build artifact | Compiled or packaged artifact: driver.entity.js. | 1 |
| `apps/backend/dist/db/entities/food-prep.entity.js` | Build artifact | Compiled or packaged artifact: food prep.entity. | 97 |
| `apps/backend/dist/db/entities/food-prep.entity.js.map` | Build artifact | Compiled or packaged artifact: food prep.entity.js. | 1 |
| `apps/backend/dist/db/entities/gst-detail.entity.js` | Build artifact | Compiled or packaged artifact: gst detail.entity. | 96 |
| `apps/backend/dist/db/entities/gst-detail.entity.js.map` | Build artifact | Compiled or packaged artifact: gst detail.entity.js. | 1 |
| `apps/backend/dist/db/entities/holiday-schedule.entity.js` | Build artifact | Compiled or packaged artifact: holiday schedule.entity. | 101 |
| `apps/backend/dist/db/entities/holiday-schedule.entity.js.map` | Build artifact | Compiled or packaged artifact: holiday schedule.entity.js. | 1 |
| `apps/backend/dist/db/entities/hsn-sac.entity.js` | Build artifact | Compiled or packaged artifact: hsn sac.entity. | 71 |
| `apps/backend/dist/db/entities/hsn-sac.entity.js.map` | Build artifact | Compiled or packaged artifact: hsn sac.entity.js. | 1 |
| `apps/backend/dist/db/entities/inventory-alert.entity.js` | Build artifact | Compiled or packaged artifact: inventory alert.entity. | 82 |
| `apps/backend/dist/db/entities/inventory-alert.entity.js.map` | Build artifact | Compiled or packaged artifact: inventory alert.entity.js. | 1 |
| `apps/backend/dist/db/entities/inventory-item.entity.js` | Build artifact | Compiled or packaged artifact: inventory item.entity. | 107 |
| `apps/backend/dist/db/entities/inventory-item.entity.js.map` | Build artifact | Compiled or packaged artifact: inventory item.entity.js. | 1 |
| `apps/backend/dist/db/entities/kitchen-sla.entity.js` | Build artifact | Compiled or packaged artifact: kitchen sla.entity. | 76 |
| `apps/backend/dist/db/entities/kitchen-sla.entity.js.map` | Build artifact | Compiled or packaged artifact: kitchen sla.entity.js. | 1 |
| `apps/backend/dist/db/entities/ledger-entry.entity.js` | Build artifact | Compiled or packaged artifact: ledger entry.entity. | 65 |
| `apps/backend/dist/db/entities/ledger-entry.entity.js.map` | Build artifact | Compiled or packaged artifact: ledger entry.entity.js. | 1 |
| `apps/backend/dist/db/entities/menu-addon.entity.js` | Build artifact | Compiled or packaged artifact: menu addon.entity. | 56 |
| `apps/backend/dist/db/entities/menu-addon.entity.js.map` | Build artifact | Compiled or packaged artifact: menu addon.entity.js. | 1 |
| `apps/backend/dist/db/entities/menu-category.entity.js` | Build artifact | Compiled or packaged artifact: menu category.entity. | 57 |
| `apps/backend/dist/db/entities/menu-category.entity.js.map` | Build artifact | Compiled or packaged artifact: menu category.entity.js. | 1 |
| `apps/backend/dist/db/entities/menu-item-availability.entity.js` | Build artifact | Compiled or packaged artifact: menu item availability.entity. | 82 |
| `apps/backend/dist/db/entities/menu-item-availability.entity.js.map` | Build artifact | Compiled or packaged artifact: menu item availability.entity.js. | 1 |
| `apps/backend/dist/db/entities/menu-item.entity.js` | Build artifact | Compiled or packaged artifact: menu item.entity. | 93 |
| `apps/backend/dist/db/entities/menu-item.entity.js.map` | Build artifact | Compiled or packaged artifact: menu item.entity.js. | 1 |
| `apps/backend/dist/db/entities/menu-moderation.entity.js` | Build artifact | Compiled or packaged artifact: menu moderation.entity. | 120 |
| `apps/backend/dist/db/entities/menu-moderation.entity.js.map` | Build artifact | Compiled or packaged artifact: menu moderation.entity.js. | 1 |
| `apps/backend/dist/db/entities/menu-variant.entity.js` | Build artifact | Compiled or packaged artifact: menu variant.entity. | 61 |
| `apps/backend/dist/db/entities/menu-variant.entity.js.map` | Build artifact | Compiled or packaged artifact: menu variant.entity.js. | 1 |
| `apps/backend/dist/db/entities/notification-analytics.entity.js` | Build artifact | Compiled or packaged artifact: notification analytics.entity. | 79 |
| `apps/backend/dist/db/entities/notification-analytics.entity.js.map` | Build artifact | Compiled or packaged artifact: notification analytics.entity.js. | 1 |
| `apps/backend/dist/db/entities/notification-preference.entity.js` | Build artifact | Compiled or packaged artifact: notification preference.entity. | 77 |
| `apps/backend/dist/db/entities/notification-preference.entity.js.map` | Build artifact | Compiled or packaged artifact: notification preference.entity.js. | 1 |
| `apps/backend/dist/db/entities/notification-status.enum.js` | Build artifact | Compiled or packaged artifact: notification status.enum. | 13 |
| `apps/backend/dist/db/entities/notification-status.enum.js.map` | Build artifact | Compiled or packaged artifact: notification status.enum.js. | 1 |
| `apps/backend/dist/db/entities/notification.entity.js` | Build artifact | Compiled or packaged artifact: notification.entity. | 106 |
| `apps/backend/dist/db/entities/notification.entity.js.map` | Build artifact | Compiled or packaged artifact: notification.entity.js. | 1 |
| `apps/backend/dist/db/entities/order-item.entity.js` | Build artifact | Compiled or packaged artifact: order item.entity. | 138 |
| `apps/backend/dist/db/entities/order-item.entity.js.map` | Build artifact | Compiled or packaged artifact: order item.entity.js. | 1 |
| `apps/backend/dist/db/entities/order.entity.js` | Build artifact | Compiled or packaged artifact: order.entity. | 149 |
| `apps/backend/dist/db/entities/order.entity.js.map` | Build artifact | Compiled or packaged artifact: order.entity.js. | 1 |
| `apps/backend/dist/db/entities/otp.entity.js` | Build artifact | Compiled or packaged artifact: otp.entity. | 85 |
| `apps/backend/dist/db/entities/otp.entity.js.map` | Build artifact | Compiled or packaged artifact: otp.entity.js. | 1 |
| `apps/backend/dist/db/entities/payment-dispute.entity.js` | Build artifact | Compiled or packaged artifact: payment dispute.entity. | 106 |
| `apps/backend/dist/db/entities/payment-dispute.entity.js.map` | Build artifact | Compiled or packaged artifact: payment dispute.entity.js. | 1 |
| `apps/backend/dist/db/entities/payment-method.entity.js` | Build artifact | Compiled or packaged artifact: payment method.entity. | 87 |
| `apps/backend/dist/db/entities/payment-method.entity.js.map` | Build artifact | Compiled or packaged artifact: payment method.entity.js. | 1 |
| `apps/backend/dist/db/entities/payment-webhook.entity.js` | Build artifact | Compiled or packaged artifact: payment webhook.entity. | 50 |
| `apps/backend/dist/db/entities/payment-webhook.entity.js.map` | Build artifact | Compiled or packaged artifact: payment webhook.entity.js. | 1 |
| `apps/backend/dist/db/entities/payout-report.entity.js` | Build artifact | Compiled or packaged artifact: payout report.entity. | 119 |
| `apps/backend/dist/db/entities/payout-report.entity.js.map` | Build artifact | Compiled or packaged artifact: payout report.entity.js. | 1 |
| `apps/backend/dist/db/entities/recipe.entity.js` | Build artifact | Compiled or packaged artifact: recipe.entity. | 101 |
| `apps/backend/dist/db/entities/recipe.entity.js.map` | Build artifact | Compiled or packaged artifact: recipe.entity.js. | 1 |
| `apps/backend/dist/db/entities/referral.entity.js` | Build artifact | Compiled or packaged artifact: referral.entity. | 115 |
| `apps/backend/dist/db/entities/referral.entity.js.map` | Build artifact | Compiled or packaged artifact: referral.entity.js. | 1 |
| `apps/backend/dist/db/entities/refund-approval.entity.js` | Build artifact | Compiled or packaged artifact: refund approval.entity. | 121 |
| `apps/backend/dist/db/entities/refund-approval.entity.js.map` | Build artifact | Compiled or packaged artifact: refund approval.entity.js. | 1 |
| `apps/backend/dist/db/entities/refund.entity.js` | Build artifact | Compiled or packaged artifact: refund.entity. | 131 |
| `apps/backend/dist/db/entities/refund.entity.js.map` | Build artifact | Compiled or packaged artifact: refund.entity.js. | 1 |
| `apps/backend/dist/db/entities/restaurant-branch.entity.js` | Build artifact | Compiled or packaged artifact: restaurant branch.entity. | 95 |
| `apps/backend/dist/db/entities/restaurant-branch.entity.js.map` | Build artifact | Compiled or packaged artifact: restaurant branch.entity.js. | 1 |
| `apps/backend/dist/db/entities/restaurant-gst.entity.js` | Build artifact | Compiled or packaged artifact: restaurant gst.entity. | 101 |
| `apps/backend/dist/db/entities/restaurant-gst.entity.js.map` | Build artifact | Compiled or packaged artifact: restaurant gst.entity.js. | 1 |
| `apps/backend/dist/db/entities/restaurant-onboarding.entity.js` | Build artifact | Compiled or packaged artifact: restaurant onboarding.entity. | 111 |
| `apps/backend/dist/db/entities/restaurant-onboarding.entity.js.map` | Build artifact | Compiled or packaged artifact: restaurant onboarding.entity.js. | 1 |
| `apps/backend/dist/db/entities/restaurant.entity.js` | Build artifact | Compiled or packaged artifact: restaurant.entity. | 92 |
| `apps/backend/dist/db/entities/restaurant.entity.js.map` | Build artifact | Compiled or packaged artifact: restaurant.entity.js. | 1 |
| `apps/backend/dist/db/entities/session.entity.js` | Build artifact | Compiled or packaged artifact: session.entity. | 77 |
| `apps/backend/dist/db/entities/session.entity.js.map` | Build artifact | Compiled or packaged artifact: session.entity.js. | 1 |
| `apps/backend/dist/db/entities/sla-alert.entity.js` | Build artifact | Compiled or packaged artifact: sla alert.entity. | 87 |
| `apps/backend/dist/db/entities/sla-alert.entity.js.map` | Build artifact | Compiled or packaged artifact: sla alert.entity.js. | 1 |
| `apps/backend/dist/db/entities/stripe-webhook.entity.js` | Build artifact | Compiled or packaged artifact: stripe webhook.entity. | 45 |
| `apps/backend/dist/db/entities/stripe-webhook.entity.js.map` | Build artifact | Compiled or packaged artifact: stripe webhook.entity.js. | 1 |
| `apps/backend/dist/db/entities/subscription.entity.js` | Build artifact | Compiled or packaged artifact: subscription.entity. | 66 |
| `apps/backend/dist/db/entities/subscription.entity.js.map` | Build artifact | Compiled or packaged artifact: subscription.entity.js. | 1 |
| `apps/backend/dist/db/entities/supplier.entity.js` | Build artifact | Compiled or packaged artifact: supplier.entity. | 71 |
| `apps/backend/dist/db/entities/supplier.entity.js.map` | Build artifact | Compiled or packaged artifact: supplier.entity.js. | 1 |
| `apps/backend/dist/db/entities/support-ticket.entity.js` | Build artifact | Compiled or packaged artifact: support ticket.entity. | 216 |
| `apps/backend/dist/db/entities/support-ticket.entity.js.map` | Build artifact | Compiled or packaged artifact: support ticket.entity.js. | 1 |
| `apps/backend/dist/db/entities/surge-zone.entity.js` | Build artifact | Compiled or packaged artifact: surge zone.entity. | 65 |
| `apps/backend/dist/db/entities/surge-zone.entity.js.map` | Build artifact | Compiled or packaged artifact: surge zone.entity.js. | 1 |
| `apps/backend/dist/db/entities/user-device.entity.js` | Build artifact | Compiled or packaged artifact: user device.entity. | 82 |
| `apps/backend/dist/db/entities/user-device.entity.js.map` | Build artifact | Compiled or packaged artifact: user device.entity.js. | 1 |
| `apps/backend/dist/db/entities/user.entity.js` | Build artifact | Compiled or packaged artifact: user.entity. | 86 |
| `apps/backend/dist/db/entities/user.entity.js.map` | Build artifact | Compiled or packaged artifact: user.entity.js. | 1 |
| `apps/backend/dist/db/entities/wallet-transaction.entity.js` | Build artifact | Compiled or packaged artifact: wallet transaction.entity. | 61 |
| `apps/backend/dist/db/entities/wallet-transaction.entity.js.map` | Build artifact | Compiled or packaged artifact: wallet transaction.entity.js. | 1 |
| `apps/backend/dist/db/entities/wallet.entity.js` | Build artifact | Compiled or packaged artifact: wallet.entity. | 56 |
| `apps/backend/dist/db/entities/wallet.entity.js.map` | Build artifact | Compiled or packaged artifact: wallet.entity.js. | 1 |
| `apps/backend/dist/db/entities/webhook-retry-queue.entity.js` | Build artifact | Compiled or packaged artifact: webhook retry queue.entity. | 86 |
| `apps/backend/dist/db/entities/webhook-retry-queue.entity.js.map` | Build artifact | Compiled or packaged artifact: webhook retry queue.entity.js. | 1 |
| `apps/backend/dist/db/interfaces/database-adapter.interface.js` | Build artifact | Compiled or packaged artifact: database adapter.interface. | 3 |
| `apps/backend/dist/db/interfaces/database-adapter.interface.js.map` | Build artifact | Compiled or packaged artifact: database adapter.interface.js. | 1 |
| `apps/backend/dist/db/local-repository.module.js` | Build artifact | Compiled or packaged artifact: local repository.module. | 175 |
| `apps/backend/dist/db/local-repository.module.js.map` | Build artifact | Compiled or packaged artifact: local repository.module.js. | 1 |
| `apps/backend/dist/db/mongo.adapter.js` | Build artifact | Compiled or packaged artifact: mongo.adapter. | 50 |
| `apps/backend/dist/db/mongo.adapter.js.map` | Build artifact | Compiled or packaged artifact: mongo.adapter.js. | 1 |
| `apps/backend/dist/db/postgres.adapter.js` | Build artifact | Compiled or packaged artifact: postgres.adapter. | 51 |
| `apps/backend/dist/db/postgres.adapter.js.map` | Build artifact | Compiled or packaged artifact: postgres.adapter.js. | 1 |
| `apps/backend/dist/db/redis.adapter.js` | Build artifact | Compiled or packaged artifact: redis.adapter. | 122 |
| `apps/backend/dist/db/redis.adapter.js.map` | Build artifact | Compiled or packaged artifact: redis.adapter.js. | 1 |
| `apps/backend/dist/db/schemas/review.schema.js` | Build artifact | Compiled or packaged artifact: review.schema. | 52 |
| `apps/backend/dist/db/schemas/review.schema.js.map` | Build artifact | Compiled or packaged artifact: review.schema.js. | 1 |
| `apps/backend/dist/gateway/gateway.module.js` | Build artifact | Compiled or packaged artifact: gateway.module. | 17 |
| `apps/backend/dist/gateway/gateway.module.js.map` | Build artifact | Compiled or packaged artifact: gateway.module.js. | 1 |
| `apps/backend/dist/grpc/auth.controller.js` | Build artifact | Compiled or packaged artifact: auth.controller. | 34 |
| `apps/backend/dist/grpc/auth.controller.js.map` | Build artifact | Compiled or packaged artifact: auth.controller.js. | 1 |
| `apps/backend/dist/grpc/grpc-app.module.js` | Build artifact | Compiled or packaged artifact: grpc app.module. | 40 |
| `apps/backend/dist/grpc/grpc-app.module.js.map` | Build artifact | Compiled or packaged artifact: grpc app.module.js. | 1 |
| `apps/backend/dist/grpc/grpc.module.js` | Build artifact | Compiled or packaged artifact: grpc.module. | 26 |
| `apps/backend/dist/grpc/grpc.module.js.map` | Build artifact | Compiled or packaged artifact: grpc.module.js. | 1 |
| `apps/backend/dist/grpc/order.controller.js` | Build artifact | Compiled or packaged artifact: order.controller. | 36 |
| `apps/backend/dist/grpc/order.controller.js.map` | Build artifact | Compiled or packaged artifact: order.controller.js. | 1 |
| `apps/backend/dist/infra/observability/logger.service.js` | Build artifact | Compiled or packaged artifact: logger.service. | 67 |
| `apps/backend/dist/infra/observability/logger.service.js.map` | Build artifact | Compiled or packaged artifact: logger.service.js. | 1 |
| `apps/backend/dist/infra/queue/order.processor.js` | Build artifact | Compiled or packaged artifact: order.processor. | 42 |
| `apps/backend/dist/infra/queue/order.processor.js.map` | Build artifact | Compiled or packaged artifact: order.processor.js. | 1 |
| `apps/backend/dist/infra/queue/queue.module.js` | Build artifact | Compiled or packaged artifact: queue.module. | 23 |
| `apps/backend/dist/infra/queue/queue.module.js.map` | Build artifact | Compiled or packaged artifact: queue.module.js. | 1 |
| `apps/backend/dist/infra/queue/queue.service.js` | Build artifact | Compiled or packaged artifact: queue.service. | 40 |
| `apps/backend/dist/infra/queue/queue.service.js.map` | Build artifact | Compiled or packaged artifact: queue.service.js. | 1 |
| `apps/backend/dist/infra/secret-loader.service.js` | Build artifact | Compiled or packaged artifact: secret loader.service. | 129 |
| `apps/backend/dist/infra/secret-loader.service.js.map` | Build artifact | Compiled or packaged artifact: secret loader.service.js. | 1 |
| `apps/backend/dist/infra/tracking/tracking.gateway.js` | Build artifact | Compiled or packaged artifact: tracking.gateway. | 283 |
| `apps/backend/dist/infra/tracking/tracking.gateway.js.map` | Build artifact | Compiled or packaged artifact: tracking.gateway.js. | 1 |
| `apps/backend/dist/infra/tracking/tracking.module.js` | Build artifact | Compiled or packaged artifact: tracking.module. | 24 |
| `apps/backend/dist/infra/tracking/tracking.module.js.map` | Build artifact | Compiled or packaged artifact: tracking.module.js. | 1 |
| `apps/backend/dist/jobs/retention-job.js` | Build artifact | Compiled or packaged artifact: retention job. | 71 |
| `apps/backend/dist/jobs/retention-job.js.map` | Build artifact | Compiled or packaged artifact: retention job.js. | 1 |
| `apps/backend/dist/legal/legal.controller.js` | Build artifact | Compiled or packaged artifact: legal.controller. | 124 |
| `apps/backend/dist/legal/legal.controller.js.map` | Build artifact | Compiled or packaged artifact: legal.controller.js. | 1 |
| `apps/backend/dist/legal/legal.module.js` | Build artifact | Compiled or packaged artifact: legal.module. | 20 |
| `apps/backend/dist/legal/legal.module.js.map` | Build artifact | Compiled or packaged artifact: legal.module.js. | 1 |
| `apps/backend/dist/local-dev.module.js` | Build artifact | Compiled or packaged artifact: local dev.module. | 63 |
| `apps/backend/dist/local-dev.module.js.map` | Build artifact | Compiled or packaged artifact: local dev.module.js. | 1 |
| `apps/backend/dist/logging/logging.module.js` | Build artifact | Compiled or packaged artifact: logging.module. | 26 |
| `apps/backend/dist/logging/logging.module.js.map` | Build artifact | Compiled or packaged artifact: logging.module.js. | 1 |
| `apps/backend/dist/logging/logging.service.js` | Build artifact | Compiled or packaged artifact: logging.service. | 102 |
| `apps/backend/dist/logging/logging.service.js.map` | Build artifact | Compiled or packaged artifact: logging.service.js. | 1 |
| `apps/backend/dist/main-grpc.js` | Build artifact | Compiled or packaged artifact: main grpc. | 27 |
| `apps/backend/dist/main-grpc.js.map` | Build artifact | Compiled or packaged artifact: main grpc.js. | 1 |
| `apps/backend/dist/main.js` | Build artifact | Compiled or packaged artifact: main. | 136 |
| `apps/backend/dist/main.js.map` | Build artifact | Compiled or packaged artifact: main.js. | 1 |
| `apps/backend/dist/metrics/latency-metrics.interceptor.js` | Build artifact | Compiled or packaged artifact: latency metrics.interceptor. | 42 |
| `apps/backend/dist/metrics/latency-metrics.interceptor.js.map` | Build artifact | Compiled or packaged artifact: latency metrics.interceptor.js. | 1 |
| `apps/backend/dist/metrics/metrics.controller.js` | Build artifact | Compiled or packaged artifact: metrics.controller. | 35 |
| `apps/backend/dist/metrics/metrics.controller.js.map` | Build artifact | Compiled or packaged artifact: metrics.controller.js. | 1 |
| `apps/backend/dist/metrics/metrics.module.js` | Build artifact | Compiled or packaged artifact: metrics.module. | 22 |
| `apps/backend/dist/metrics/metrics.module.js.map` | Build artifact | Compiled or packaged artifact: metrics.module.js. | 1 |
| `apps/backend/dist/metrics/metrics.service.js` | Build artifact | Compiled or packaged artifact: metrics.service. | 79 |
| `apps/backend/dist/metrics/metrics.service.js.map` | Build artifact | Compiled or packaged artifact: metrics.service.js. | 1 |
| `apps/backend/dist/modules/analytics/analytics.controller.js` | Build artifact | Compiled or packaged artifact: analytics.controller. | 127 |
| `apps/backend/dist/modules/analytics/analytics.controller.js.map` | Build artifact | Compiled or packaged artifact: analytics.controller.js. | 1 |
| `apps/backend/dist/modules/analytics/analytics.module.js` | Build artifact | Compiled or packaged artifact: analytics.module. | 27 |
| `apps/backend/dist/modules/analytics/analytics.module.js.map` | Build artifact | Compiled or packaged artifact: analytics.module.js. | 1 |
| `apps/backend/dist/modules/analytics/analytics.service.js` | Build artifact | Compiled or packaged artifact: analytics.service. | 337 |
| `apps/backend/dist/modules/analytics/analytics.service.js.map` | Build artifact | Compiled or packaged artifact: analytics.service.js. | 1 |
| `apps/backend/dist/modules/auth/auth.module.js` | Build artifact | Compiled or packaged artifact: auth.module. | 20 |
| `apps/backend/dist/modules/auth/auth.module.js.map` | Build artifact | Compiled or packaged artifact: auth.module.js. | 1 |
| `apps/backend/dist/modules/driver-assignment/dispatch-engine.service.js` | Build artifact | Compiled or packaged artifact: dispatch engine.service. | 211 |
| `apps/backend/dist/modules/driver-assignment/dispatch-engine.service.js.map` | Build artifact | Compiled or packaged artifact: dispatch engine.service.js. | 1 |
| `apps/backend/dist/modules/driver-assignment/driver-assignment.controller.js` | Build artifact | Compiled or packaged artifact: driver assignment.controller. | 204 |
| `apps/backend/dist/modules/driver-assignment/driver-assignment.controller.js.map` | Build artifact | Compiled or packaged artifact: driver assignment.controller.js. | 1 |
| `apps/backend/dist/modules/driver-assignment/driver-assignment.module.js` | Build artifact | Compiled or packaged artifact: driver assignment.module. | 30 |
| `apps/backend/dist/modules/driver-assignment/driver-assignment.module.js.map` | Build artifact | Compiled or packaged artifact: driver assignment.module.js. | 1 |
| `apps/backend/dist/modules/driver-assignment/driver-assignment.service.js` | Build artifact | Compiled or packaged artifact: driver assignment.service. | 305 |
| `apps/backend/dist/modules/driver-assignment/driver-assignment.service.js.map` | Build artifact | Compiled or packaged artifact: driver assignment.service.js. | 1 |
| `apps/backend/dist/modules/driver-assignment/eta-intelligence.service.js` | Build artifact | Compiled or packaged artifact: eta intelligence.service. | 143 |
| `apps/backend/dist/modules/driver-assignment/eta-intelligence.service.js.map` | Build artifact | Compiled or packaged artifact: eta intelligence.service.js. | 1 |
| `apps/backend/dist/modules/kitchen/kitchen.controller.js` | Build artifact | Compiled or packaged artifact: kitchen.controller. | 299 |
| `apps/backend/dist/modules/kitchen/kitchen.controller.js.map` | Build artifact | Compiled or packaged artifact: kitchen.controller.js. | 1 |
| `apps/backend/dist/modules/kitchen/kitchen.module.js` | Build artifact | Compiled or packaged artifact: kitchen.module. | 24 |
| `apps/backend/dist/modules/kitchen/kitchen.module.js.map` | Build artifact | Compiled or packaged artifact: kitchen.module.js. | 1 |
| `apps/backend/dist/modules/kitchen/kitchen.service.js` | Build artifact | Compiled or packaged artifact: kitchen.service. | 794 |
| `apps/backend/dist/modules/kitchen/kitchen.service.js.map` | Build artifact | Compiled or packaged artifact: kitchen.service.js. | 1 |
| `apps/backend/dist/modules/ledger/ledger.module.js` | Build artifact | Compiled or packaged artifact: ledger.module. | 23 |
| `apps/backend/dist/modules/ledger/ledger.module.js.map` | Build artifact | Compiled or packaged artifact: ledger.module.js. | 1 |
| `apps/backend/dist/modules/ledger/ledger.service.js` | Build artifact | Compiled or packaged artifact: ledger.service. | 69 |
| `apps/backend/dist/modules/ledger/ledger.service.js.map` | Build artifact | Compiled or packaged artifact: ledger.service.js. | 1 |
| `apps/backend/dist/modules/notifications/notifications.module.js` | Build artifact | Compiled or packaged artifact: notifications.module. | 24 |
| `apps/backend/dist/modules/notifications/notifications.module.js.map` | Build artifact | Compiled or packaged artifact: notifications.module.js. | 1 |
| `apps/backend/dist/modules/orders/orders.module.js` | Build artifact | Compiled or packaged artifact: orders.module. | 20 |
| `apps/backend/dist/modules/orders/orders.module.js.map` | Build artifact | Compiled or packaged artifact: orders.module.js. | 1 |
| `apps/backend/dist/modules/realtime/realtime.module.js` | Build artifact | Compiled or packaged artifact: realtime.module. | 20 |
| `apps/backend/dist/modules/realtime/realtime.module.js.map` | Build artifact | Compiled or packaged artifact: realtime.module.js. | 1 |
| `apps/backend/dist/security/csrf.middleware.js` | Build artifact | Compiled or packaged artifact: csrf.middleware. | 82 |
| `apps/backend/dist/security/csrf.middleware.js.map` | Build artifact | Compiled or packaged artifact: csrf.middleware.js. | 1 |
| `apps/backend/dist/security/encryption.service.js` | Build artifact | Compiled or packaged artifact: encryption.service. | 107 |
| `apps/backend/dist/security/encryption.service.js.map` | Build artifact | Compiled or packaged artifact: encryption.service.js. | 1 |
| `apps/backend/dist/security/jwt-auth.guard.js` | Build artifact | Compiled or packaged artifact: jwt auth.guard. | 18 |
| `apps/backend/dist/security/jwt-auth.guard.js.map` | Build artifact | Compiled or packaged artifact: jwt auth.guard.js. | 1 |
| `apps/backend/dist/security/roles.decorator.js` | Build artifact | Compiled or packaged artifact: roles.decorator. | 7 |
| `apps/backend/dist/security/roles.decorator.js.map` | Build artifact | Compiled or packaged artifact: roles.decorator.js. | 1 |
| `apps/backend/dist/security/roles.guard.js` | Build artifact | Compiled or packaged artifact: roles.guard. | 35 |
| `apps/backend/dist/security/roles.guard.js.map` | Build artifact | Compiled or packaged artifact: roles.guard.js. | 1 |
| `apps/backend/dist/security/security.module.js` | Build artifact | Compiled or packaged artifact: security.module. | 31 |
| `apps/backend/dist/security/security.module.js.map` | Build artifact | Compiled or packaged artifact: security.module.js. | 1 |
| `apps/backend/dist/security/vault.service.js` | Build artifact | Compiled or packaged artifact: vault.service. | 152 |
| `apps/backend/dist/security/vault.service.js.map` | Build artifact | Compiled or packaged artifact: vault.service.js. | 1 |
| `apps/backend/dist/services/admin/admin.controller.js` | Build artifact | Compiled or packaged artifact: admin.controller. | 71 |
| `apps/backend/dist/services/admin/admin.controller.js.map` | Build artifact | Compiled or packaged artifact: admin.controller.js. | 1 |
| `apps/backend/dist/services/admin/admin.module.js` | Build artifact | Compiled or packaged artifact: admin.module. | 27 |
| `apps/backend/dist/services/admin/admin.module.js.map` | Build artifact | Compiled or packaged artifact: admin.module.js. | 1 |
| `apps/backend/dist/services/admin/admin.service.js` | Build artifact | Compiled or packaged artifact: admin.service. | 134 |
| `apps/backend/dist/services/admin/admin.service.js.map` | Build artifact | Compiled or packaged artifact: admin.service.js. | 1 |
| `apps/backend/dist/services/ai/ai.controller.js` | Build artifact | Compiled or packaged artifact: ai.controller. | 62 |
| `apps/backend/dist/services/ai/ai.controller.js.map` | Build artifact | Compiled or packaged artifact: ai.controller.js. | 1 |
| `apps/backend/dist/services/ai/ai.module.js` | Build artifact | Compiled or packaged artifact: ai.module. | 27 |
| `apps/backend/dist/services/ai/ai.module.js.map` | Build artifact | Compiled or packaged artifact: ai.module.js. | 1 |
| `apps/backend/dist/services/ai/ai.service.js` | Build artifact | Compiled or packaged artifact: ai.service. | 89 |
| `apps/backend/dist/services/ai/ai.service.js.map` | Build artifact | Compiled or packaged artifact: ai.service.js. | 1 |
| `apps/backend/dist/services/auth/auth.controller.js` | Build artifact | Compiled or packaged artifact: auth.controller. | 84 |
| `apps/backend/dist/services/auth/auth.controller.js.map` | Build artifact | Compiled or packaged artifact: auth.controller.js. | 1 |
| `apps/backend/dist/services/auth/auth.module.js` | Build artifact | Compiled or packaged artifact: auth.module. | 59 |
| `apps/backend/dist/services/auth/auth.module.js.map` | Build artifact | Compiled or packaged artifact: auth.module.js. | 1 |
| `apps/backend/dist/services/auth/auth.service.js` | Build artifact | Compiled or packaged artifact: auth.service. | 120 |
| `apps/backend/dist/services/auth/auth.service.js.map` | Build artifact | Compiled or packaged artifact: auth.service.js. | 1 |
| `apps/backend/dist/services/auth/strategies/facebook.strategy.js` | Build artifact | Compiled or packaged artifact: facebook.strategy. | 45 |
| `apps/backend/dist/services/auth/strategies/facebook.strategy.js.map` | Build artifact | Compiled or packaged artifact: facebook.strategy.js. | 1 |
| `apps/backend/dist/services/auth/strategies/google.strategy.js` | Build artifact | Compiled or packaged artifact: google.strategy. | 45 |
| `apps/backend/dist/services/auth/strategies/google.strategy.js.map` | Build artifact | Compiled or packaged artifact: google.strategy.js. | 1 |
| `apps/backend/dist/services/auth/strategies/jwt.strategy.js` | Build artifact | Compiled or packaged artifact: jwt.strategy. | 36 |
| `apps/backend/dist/services/auth/strategies/jwt.strategy.js.map` | Build artifact | Compiled or packaged artifact: jwt.strategy.js. | 1 |
| `apps/backend/dist/services/delivery/delivery.module.js` | Build artifact | Compiled or packaged artifact: delivery.module. | 26 |
| `apps/backend/dist/services/delivery/delivery.module.js.map` | Build artifact | Compiled or packaged artifact: delivery.module.js. | 1 |
| `apps/backend/dist/services/delivery/delivery.service.js` | Build artifact | Compiled or packaged artifact: delivery.service. | 157 |
| `apps/backend/dist/services/delivery/delivery.service.js.map` | Build artifact | Compiled or packaged artifact: delivery.service.js. | 1 |
| `apps/backend/dist/services/delivery/driver-onboarding.service.js` | Build artifact | Compiled or packaged artifact: driver onboarding.service. | 171 |
| `apps/backend/dist/services/delivery/driver-onboarding.service.js.map` | Build artifact | Compiled or packaged artifact: driver onboarding.service.js. | 1 |
| `apps/backend/dist/services/delivery/driver-ops.controller.js` | Build artifact | Compiled or packaged artifact: driver ops.controller. | 131 |
| `apps/backend/dist/services/delivery/driver-ops.controller.js.map` | Build artifact | Compiled or packaged artifact: driver ops.controller.js. | 1 |
| `apps/backend/dist/services/delivery/driver-ops.module.js` | Build artifact | Compiled or packaged artifact: driver ops.module. | 32 |
| `apps/backend/dist/services/delivery/driver-ops.module.js.map` | Build artifact | Compiled or packaged artifact: driver ops.module.js. | 1 |
| `apps/backend/dist/services/delivery/driver-payout.service.js` | Build artifact | Compiled or packaged artifact: driver payout.service. | 148 |
| `apps/backend/dist/services/delivery/driver-payout.service.js.map` | Build artifact | Compiled or packaged artifact: driver payout.service.js. | 1 |
| `apps/backend/dist/services/delivery/enhanced-delivery.module.js` | Build artifact | Compiled or packaged artifact: enhanced delivery.module. | 26 |
| `apps/backend/dist/services/delivery/enhanced-delivery.module.js.map` | Build artifact | Compiled or packaged artifact: enhanced delivery.module.js. | 1 |
| `apps/backend/dist/services/delivery/enhanced-delivery.service.js` | Build artifact | Compiled or packaged artifact: enhanced delivery.service. | 336 |
| `apps/backend/dist/services/delivery/enhanced-delivery.service.js.map` | Build artifact | Compiled or packaged artifact: enhanced delivery.service.js. | 1 |
| `apps/backend/dist/services/delivery/heatmap.service.js` | Build artifact | Compiled or packaged artifact: heatmap.service. | 161 |
| `apps/backend/dist/services/delivery/heatmap.service.js.map` | Build artifact | Compiled or packaged artifact: heatmap.service.js. | 1 |
| `apps/backend/dist/services/driver-fleet/driver-fleet.controller.js` | Build artifact | Compiled or packaged artifact: driver fleet.controller. | 157 |
| `apps/backend/dist/services/driver-fleet/driver-fleet.controller.js.map` | Build artifact | Compiled or packaged artifact: driver fleet.controller.js. | 1 |
| `apps/backend/dist/services/driver-fleet/driver-fleet.module.js` | Build artifact | Compiled or packaged artifact: driver fleet.module. | 27 |
| `apps/backend/dist/services/driver-fleet/driver-fleet.module.js.map` | Build artifact | Compiled or packaged artifact: driver fleet.module.js. | 1 |
| `apps/backend/dist/services/driver-fleet/driver-fleet.service.js` | Build artifact | Compiled or packaged artifact: driver fleet.service. | 248 |
| `apps/backend/dist/services/driver-fleet/driver-fleet.service.js.map` | Build artifact | Compiled or packaged artifact: driver fleet.service.js. | 1 |
| `apps/backend/dist/services/finance/finance.controller.js` | Build artifact | Compiled or packaged artifact: finance.controller. | 88 |
| `apps/backend/dist/services/finance/finance.controller.js.map` | Build artifact | Compiled or packaged artifact: finance.controller.js. | 1 |
| `apps/backend/dist/services/finance/finance.module.js` | Build artifact | Compiled or packaged artifact: finance.module. | 28 |
| `apps/backend/dist/services/finance/finance.module.js.map` | Build artifact | Compiled or packaged artifact: finance.module.js. | 1 |
| `apps/backend/dist/services/finance/reconciliation.service.js` | Build artifact | Compiled or packaged artifact: reconciliation.service. | 179 |
| `apps/backend/dist/services/finance/reconciliation.service.js.map` | Build artifact | Compiled or packaged artifact: reconciliation.service.js. | 1 |
| `apps/backend/dist/services/finance/tax-reporting.service.js` | Build artifact | Compiled or packaged artifact: tax reporting.service. | 165 |
| `apps/backend/dist/services/finance/tax-reporting.service.js.map` | Build artifact | Compiled or packaged artifact: tax reporting.service.js. | 1 |
| `apps/backend/dist/services/geo/enhanced-geo.service.js` | Build artifact | Compiled or packaged artifact: enhanced geo.service. | 318 |
| `apps/backend/dist/services/geo/enhanced-geo.service.js.map` | Build artifact | Compiled or packaged artifact: enhanced geo.service.js. | 1 |
| `apps/backend/dist/services/geo/geo.module.js` | Build artifact | Compiled or packaged artifact: geo.module. | 23 |
| `apps/backend/dist/services/geo/geo.module.js.map` | Build artifact | Compiled or packaged artifact: geo.module.js. | 1 |
| `apps/backend/dist/services/geo/geo.service.js` | Build artifact | Compiled or packaged artifact: geo.service. | 141 |
| `apps/backend/dist/services/geo/geo.service.js.map` | Build artifact | Compiled or packaged artifact: geo.service.js. | 1 |
| `apps/backend/dist/services/gst/gst.controller.js` | Build artifact | Compiled or packaged artifact: gst.controller. | 81 |
| `apps/backend/dist/services/gst/gst.controller.js.map` | Build artifact | Compiled or packaged artifact: gst.controller.js. | 1 |
| `apps/backend/dist/services/gst/gst.module.js` | Build artifact | Compiled or packaged artifact: gst.module. | 27 |
| `apps/backend/dist/services/gst/gst.module.js.map` | Build artifact | Compiled or packaged artifact: gst.module.js. | 1 |
| `apps/backend/dist/services/gst/gst.service.js` | Build artifact | Compiled or packaged artifact: gst.service. | 316 |
| `apps/backend/dist/services/gst/gst.service.js.map` | Build artifact | Compiled or packaged artifact: gst.service.js. | 1 |
| `apps/backend/dist/services/loyalty/loyalty.controller.js` | Build artifact | Compiled or packaged artifact: loyalty.controller. | 144 |
| `apps/backend/dist/services/loyalty/loyalty.controller.js.map` | Build artifact | Compiled or packaged artifact: loyalty.controller.js. | 1 |
| `apps/backend/dist/services/loyalty/loyalty.module.js` | Build artifact | Compiled or packaged artifact: loyalty.module. | 27 |
| `apps/backend/dist/services/loyalty/loyalty.module.js.map` | Build artifact | Compiled or packaged artifact: loyalty.module.js. | 1 |
| `apps/backend/dist/services/loyalty/loyalty.service.js` | Build artifact | Compiled or packaged artifact: loyalty.service. | 275 |
| `apps/backend/dist/services/loyalty/loyalty.service.js.map` | Build artifact | Compiled or packaged artifact: loyalty.service.js. | 1 |
| `apps/backend/dist/services/maps/maps.controller.js` | Build artifact | Compiled or packaged artifact: maps.controller. | 108 |
| `apps/backend/dist/services/maps/maps.controller.js.map` | Build artifact | Compiled or packaged artifact: maps.controller.js. | 1 |
| `apps/backend/dist/services/maps/maps.module.js` | Build artifact | Compiled or packaged artifact: maps.module. | 25 |
| `apps/backend/dist/services/maps/maps.module.js.map` | Build artifact | Compiled or packaged artifact: maps.module.js. | 1 |
| `apps/backend/dist/services/maps/maps.service.js` | Build artifact | Compiled or packaged artifact: maps.service. | 198 |
| `apps/backend/dist/services/maps/maps.service.js.map` | Build artifact | Compiled or packaged artifact: maps.service.js. | 1 |
| `apps/backend/dist/services/menu-customization/menu-customization.controller.js` | Build artifact | Compiled or packaged artifact: menu customization.controller. | 70 |
| `apps/backend/dist/services/menu-customization/menu-customization.controller.js.map` | Build artifact | Compiled or packaged artifact: menu customization.controller.js. | 1 |
| `apps/backend/dist/services/menu-customization/menu-customization.module.js` | Build artifact | Compiled or packaged artifact: menu customization.module. | 25 |
| `apps/backend/dist/services/menu-customization/menu-customization.module.js.map` | Build artifact | Compiled or packaged artifact: menu customization.module.js. | 1 |
| `apps/backend/dist/services/menu-customization/menu-customization.service.js` | Build artifact | Compiled or packaged artifact: menu customization.service. | 99 |
| `apps/backend/dist/services/menu-customization/menu-customization.service.js.map` | Build artifact | Compiled or packaged artifact: menu customization.service.js. | 1 |
| `apps/backend/dist/services/notifications/device.controller.js` | Build artifact | Compiled or packaged artifact: device.controller. | 65 |
| `apps/backend/dist/services/notifications/device.controller.js.map` | Build artifact | Compiled or packaged artifact: device.controller.js. | 1 |
| `apps/backend/dist/services/notifications/notification-preferences.controller.js` | Build artifact | Compiled or packaged artifact: notification preferences.controller. | 54 |
| `apps/backend/dist/services/notifications/notification-preferences.controller.js.map` | Build artifact | Compiled or packaged artifact: notification preferences.controller.js. | 1 |
| `apps/backend/dist/services/notifications/notification-preferences.service.js` | Build artifact | Compiled or packaged artifact: notification preferences.service. | 59 |
| `apps/backend/dist/services/notifications/notification-preferences.service.js.map` | Build artifact | Compiled or packaged artifact: notification preferences.service.js. | 1 |
| `apps/backend/dist/services/notifications/notification.module.js` | Build artifact | Compiled or packaged artifact: notification.module. | 31 |
| `apps/backend/dist/services/notifications/notification.module.js.map` | Build artifact | Compiled or packaged artifact: notification.module.js. | 1 |
| `apps/backend/dist/services/notifications/notification.service.js` | Build artifact | Compiled or packaged artifact: notification.service. | 296 |
| `apps/backend/dist/services/notifications/notification.service.js.map` | Build artifact | Compiled or packaged artifact: notification.service.js. | 1 |
| `apps/backend/dist/services/notifications/production-notification.service.js` | Build artifact | Compiled or packaged artifact: production notification.service. | 194 |
| `apps/backend/dist/services/notifications/production-notification.service.js.map` | Build artifact | Compiled or packaged artifact: production notification.service.js. | 1 |
| `apps/backend/dist/services/notifications/queue/notification-queue.controller.js` | Build artifact | Compiled or packaged artifact: notification queue.controller. | 151 |
| `apps/backend/dist/services/notifications/queue/notification-queue.controller.js.map` | Build artifact | Compiled or packaged artifact: notification queue.controller.js. | 1 |
| `apps/backend/dist/services/notifications/queue/notification-queue.module.js` | Build artifact | Compiled or packaged artifact: notification queue.module. | 29 |
| `apps/backend/dist/services/notifications/queue/notification-queue.module.js.map` | Build artifact | Compiled or packaged artifact: notification queue.module.js. | 1 |
| `apps/backend/dist/services/notifications/queue/notification-queue.service.js` | Build artifact | Compiled or packaged artifact: notification queue.service. | 202 |
| `apps/backend/dist/services/notifications/queue/notification-queue.service.js.map` | Build artifact | Compiled or packaged artifact: notification queue.service.js. | 1 |
| `apps/backend/dist/services/order/order.controller.js` | Build artifact | Compiled or packaged artifact: order.controller. | 49 |
| `apps/backend/dist/services/order/order.controller.js.map` | Build artifact | Compiled or packaged artifact: order.controller.js. | 1 |
| `apps/backend/dist/services/order/order.module.js` | Build artifact | Compiled or packaged artifact: order.module. | 29 |
| `apps/backend/dist/services/order/order.module.js.map` | Build artifact | Compiled or packaged artifact: order.module.js. | 1 |
| `apps/backend/dist/services/order/order.service.js` | Build artifact | Compiled or packaged artifact: order.service. | 451 |
| `apps/backend/dist/services/order/order.service.js.map` | Build artifact | Compiled or packaged artifact: order.service.js. | 1 |
| `apps/backend/dist/services/order/order.service.spec.js` | Build artifact | Compiled or packaged artifact: order.service.spec. | 316 |
| `apps/backend/dist/services/order/order.service.spec.js.map` | Build artifact | Compiled or packaged artifact: order.service.spec.js. | 1 |
| `apps/backend/dist/services/payment-provider/driver-payout-provider.service.js` | Build artifact | Compiled or packaged artifact: driver payout provider.service. | 156 |
| `apps/backend/dist/services/payment-provider/driver-payout-provider.service.js.map` | Build artifact | Compiled or packaged artifact: driver payout provider.service.js. | 1 |
| `apps/backend/dist/services/payment-provider/payment-provider.controller.js` | Build artifact | Compiled or packaged artifact: payment provider.controller. | 152 |
| `apps/backend/dist/services/payment-provider/payment-provider.controller.js.map` | Build artifact | Compiled or packaged artifact: payment provider.controller.js. | 1 |
| `apps/backend/dist/services/payment-provider/payment-provider.module.js` | Build artifact | Compiled or packaged artifact: payment provider.module. | 41 |
| `apps/backend/dist/services/payment-provider/payment-provider.module.js.map` | Build artifact | Compiled or packaged artifact: payment provider.module.js. | 1 |
| `apps/backend/dist/services/payment-provider/razorpay-settlement.service.js` | Build artifact | Compiled or packaged artifact: razorpay settlement.service. | 241 |
| `apps/backend/dist/services/payment-provider/razorpay-settlement.service.js.map` | Build artifact | Compiled or packaged artifact: razorpay settlement.service.js. | 1 |
| `apps/backend/dist/services/payment-provider/stripe-connect.service.js` | Build artifact | Compiled or packaged artifact: stripe connect.service. | 275 |
| `apps/backend/dist/services/payment-provider/stripe-connect.service.js.map` | Build artifact | Compiled or packaged artifact: stripe connect.service.js. | 1 |
| `apps/backend/dist/services/payments/chargeback/chargeback.controller.js` | Build artifact | Compiled or packaged artifact: chargeback.controller. | 120 |
| `apps/backend/dist/services/payments/chargeback/chargeback.controller.js.map` | Build artifact | Compiled or packaged artifact: chargeback.controller.js. | 1 |
| `apps/backend/dist/services/payments/chargeback/chargeback.module.js` | Build artifact | Compiled or packaged artifact: chargeback.module. | 29 |
| `apps/backend/dist/services/payments/chargeback/chargeback.module.js.map` | Build artifact | Compiled or packaged artifact: chargeback.module.js. | 1 |
| `apps/backend/dist/services/payments/chargeback/chargeback.service.js` | Build artifact | Compiled or packaged artifact: chargeback.service. | 234 |
| `apps/backend/dist/services/payments/chargeback/chargeback.service.js.map` | Build artifact | Compiled or packaged artifact: chargeback.service.js. | 1 |
| `apps/backend/dist/services/payments/cod.service.js` | Build artifact | Compiled or packaged artifact: cod.service. | 44 |
| `apps/backend/dist/services/payments/cod.service.js.map` | Build artifact | Compiled or packaged artifact: cod.service.js. | 1 |
| `apps/backend/dist/services/payments/fraud-hardening.service.js` | Build artifact | Compiled or packaged artifact: fraud hardening.service. | 215 |
| `apps/backend/dist/services/payments/fraud-hardening.service.js.map` | Build artifact | Compiled or packaged artifact: fraud hardening.service.js. | 1 |
| `apps/backend/dist/services/payments/fraud-hardening.service.spec.js` | Build artifact | Compiled or packaged artifact: fraud hardening.service.spec. | 85 |
| `apps/backend/dist/services/payments/fraud-hardening.service.spec.js.map` | Build artifact | Compiled or packaged artifact: fraud hardening.service.spec.js. | 1 |
| `apps/backend/dist/services/payments/gateway-factory.service.js` | Build artifact | Compiled or packaged artifact: gateway factory.service. | 61 |
| `apps/backend/dist/services/payments/gateway-factory.service.js.map` | Build artifact | Compiled or packaged artifact: gateway factory.service.js. | 1 |
| `apps/backend/dist/services/payments/gateways/cod-gateway.service.js` | Build artifact | Compiled or packaged artifact: cod gateway.service. | 84 |
| `apps/backend/dist/services/payments/gateways/cod-gateway.service.js.map` | Build artifact | Compiled or packaged artifact: cod gateway.service.js. | 1 |
| `apps/backend/dist/services/payments/gateways/payment-gateway.interface.js` | Build artifact | Compiled or packaged artifact: payment gateway.interface. | 3 |
| `apps/backend/dist/services/payments/gateways/payment-gateway.interface.js.map` | Build artifact | Compiled or packaged artifact: payment gateway.interface.js. | 1 |
| `apps/backend/dist/services/payments/gateways/razorpay-gateway.service.js` | Build artifact | Compiled or packaged artifact: razorpay gateway.service. | 215 |
| `apps/backend/dist/services/payments/gateways/razorpay-gateway.service.js.map` | Build artifact | Compiled or packaged artifact: razorpay gateway.service.js. | 1 |
| `apps/backend/dist/services/payments/gateways/stripe-gateway.service.js` | Build artifact | Compiled or packaged artifact: stripe gateway.service. | 132 |
| `apps/backend/dist/services/payments/gateways/stripe-gateway.service.js.map` | Build artifact | Compiled or packaged artifact: stripe gateway.service.js. | 1 |
| `apps/backend/dist/services/payments/idempotency.entity.js` | Build artifact | Compiled or packaged artifact: idempotency.entity. | 71 |
| `apps/backend/dist/services/payments/idempotency.entity.js.map` | Build artifact | Compiled or packaged artifact: idempotency.entity.js. | 1 |
| `apps/backend/dist/services/payments/idempotency.service.js` | Build artifact | Compiled or packaged artifact: idempotency.service. | 73 |
| `apps/backend/dist/services/payments/idempotency.service.js.map` | Build artifact | Compiled or packaged artifact: idempotency.service.js. | 1 |
| `apps/backend/dist/services/payments/payment-event.entity.js` | Build artifact | Compiled or packaged artifact: payment event.entity. | 57 |
| `apps/backend/dist/services/payments/payment-event.entity.js.map` | Build artifact | Compiled or packaged artifact: payment event.entity.js. | 1 |
| `apps/backend/dist/services/payments/payment-fraud.entity.js` | Build artifact | Compiled or packaged artifact: payment fraud.entity. | 76 |
| `apps/backend/dist/services/payments/payment-fraud.entity.js.map` | Build artifact | Compiled or packaged artifact: payment fraud.entity.js. | 1 |
| `apps/backend/dist/services/payments/payment-hardening.service.js` | Build artifact | Compiled or packaged artifact: payment hardening.service. | 322 |
| `apps/backend/dist/services/payments/payment-hardening.service.js.map` | Build artifact | Compiled or packaged artifact: payment hardening.service.js. | 1 |
| `apps/backend/dist/services/payments/payment-validation.entity.js` | Build artifact | Compiled or packaged artifact: payment validation.entity. | 61 |
| `apps/backend/dist/services/payments/payment-validation.entity.js.map` | Build artifact | Compiled or packaged artifact: payment validation.entity.js. | 1 |
| `apps/backend/dist/services/payments/payment.types.js` | Build artifact | Compiled or packaged artifact: payment.types. | 3 |
| `apps/backend/dist/services/payments/payment.types.js.map` | Build artifact | Compiled or packaged artifact: payment.types.js. | 1 |
| `apps/backend/dist/services/payments/payments.controller.js` | Build artifact | Compiled or packaged artifact: payments.controller. | 160 |
| `apps/backend/dist/services/payments/payments.controller.js.map` | Build artifact | Compiled or packaged artifact: payments.controller.js. | 1 |
| `apps/backend/dist/services/payments/payments.module.js` | Build artifact | Compiled or packaged artifact: payments.module. | 61 |
| `apps/backend/dist/services/payments/payments.module.js.map` | Build artifact | Compiled or packaged artifact: payments.module.js. | 1 |
| `apps/backend/dist/services/payments/payments.service.js` | Build artifact | Compiled or packaged artifact: payments.service. | 132 |
| `apps/backend/dist/services/payments/payments.service.js.map` | Build artifact | Compiled or packaged artifact: payments.service.js. | 1 |
| `apps/backend/dist/services/payments/retry.service.js` | Build artifact | Compiled or packaged artifact: retry.service. | 147 |
| `apps/backend/dist/services/payments/retry.service.js.map` | Build artifact | Compiled or packaged artifact: retry.service.js. | 1 |
| `apps/backend/dist/services/payments/webhook/webhook-retry.module.js` | Build artifact | Compiled or packaged artifact: webhook retry.module. | 23 |
| `apps/backend/dist/services/payments/webhook/webhook-retry.module.js.map` | Build artifact | Compiled or packaged artifact: webhook retry.module.js. | 1 |
| `apps/backend/dist/services/payments/webhook/webhook-retry.service.js` | Build artifact | Compiled or packaged artifact: webhook retry.service. | 129 |
| `apps/backend/dist/services/payments/webhook/webhook-retry.service.js.map` | Build artifact | Compiled or packaged artifact: webhook retry.service.js. | 1 |
| `apps/backend/dist/services/payments/webhook/webhook.controller.js` | Build artifact | Compiled or packaged artifact: webhook.controller. | 60 |
| `apps/backend/dist/services/payments/webhook/webhook.controller.js.map` | Build artifact | Compiled or packaged artifact: webhook.controller.js. | 1 |
| `apps/backend/dist/services/payments/webhook/webhook.module.js` | Build artifact | Compiled or packaged artifact: webhook.module. | 36 |
| `apps/backend/dist/services/payments/webhook/webhook.module.js.map` | Build artifact | Compiled or packaged artifact: webhook.module.js. | 1 |
| `apps/backend/dist/services/payments/webhook/webhook.service.js` | Build artifact | Compiled or packaged artifact: webhook.service. | 476 |
| `apps/backend/dist/services/payments/webhook/webhook.service.js.map` | Build artifact | Compiled or packaged artifact: webhook.service.js. | 1 |
| `apps/backend/dist/services/privacy/data-privacy.service.js` | Build artifact | Compiled or packaged artifact: data privacy.service. | 134 |
| `apps/backend/dist/services/privacy/data-privacy.service.js.map` | Build artifact | Compiled or packaged artifact: data privacy.service.js. | 1 |
| `apps/backend/dist/services/refund/refund.controller.js` | Build artifact | Compiled or packaged artifact: refund.controller. | 191 |
| `apps/backend/dist/services/refund/refund.controller.js.map` | Build artifact | Compiled or packaged artifact: refund.controller.js. | 1 |
| `apps/backend/dist/services/refund/refund.module.js` | Build artifact | Compiled or packaged artifact: refund.module. | 33 |
| `apps/backend/dist/services/refund/refund.module.js.map` | Build artifact | Compiled or packaged artifact: refund.module.js. | 1 |
| `apps/backend/dist/services/refund/refund.service.js` | Build artifact | Compiled or packaged artifact: refund.service. | 349 |
| `apps/backend/dist/services/refund/refund.service.js.map` | Build artifact | Compiled or packaged artifact: refund.service.js. | 1 |
| `apps/backend/dist/services/restaurant/branch-management.service.js` | Build artifact | Compiled or packaged artifact: branch management.service. | 116 |
| `apps/backend/dist/services/restaurant/branch-management.service.js.map` | Build artifact | Compiled or packaged artifact: branch management.service.js. | 1 |
| `apps/backend/dist/services/restaurant/business-engine.controller.js` | Build artifact | Compiled or packaged artifact: business engine.controller. | 106 |
| `apps/backend/dist/services/restaurant/business-engine.controller.js.map` | Build artifact | Compiled or packaged artifact: business engine.controller.js. | 1 |
| `apps/backend/dist/services/restaurant/business-engine.service.js` | Build artifact | Compiled or packaged artifact: business engine.service. | 267 |
| `apps/backend/dist/services/restaurant/business-engine.service.js.map` | Build artifact | Compiled or packaged artifact: business engine.service.js. | 1 |
| `apps/backend/dist/services/restaurant/business.seeder.js` | Build artifact | Compiled or packaged artifact: business.seeder. | 160 |
| `apps/backend/dist/services/restaurant/business.seeder.js.map` | Build artifact | Compiled or packaged artifact: business.seeder.js. | 1 |
| `apps/backend/dist/services/restaurant/commission.service.js` | Build artifact | Compiled or packaged artifact: commission.service. | 116 |
| `apps/backend/dist/services/restaurant/commission.service.js.map` | Build artifact | Compiled or packaged artifact: commission.service.js. | 1 |
| `apps/backend/dist/services/restaurant/kds.gateway.js` | Build artifact | Compiled or packaged artifact: kds.gateway. | 58 |
| `apps/backend/dist/services/restaurant/kds.gateway.js.map` | Build artifact | Compiled or packaged artifact: kds.gateway.js. | 1 |
| `apps/backend/dist/services/restaurant/menu-moderation.service.js` | Build artifact | Compiled or packaged artifact: menu moderation.service. | 149 |
| `apps/backend/dist/services/restaurant/menu-moderation.service.js.map` | Build artifact | Compiled or packaged artifact: menu moderation.service.js. | 1 |
| `apps/backend/dist/services/restaurant/onboarding.controller.js` | Build artifact | Compiled or packaged artifact: onboarding.controller. | 190 |
| `apps/backend/dist/services/restaurant/onboarding.controller.js.map` | Build artifact | Compiled or packaged artifact: onboarding.controller.js. | 1 |
| `apps/backend/dist/services/restaurant/onboarding.service.js` | Build artifact | Compiled or packaged artifact: onboarding.service. | 193 |
| `apps/backend/dist/services/restaurant/onboarding.service.js.map` | Build artifact | Compiled or packaged artifact: onboarding.service.js. | 1 |
| `apps/backend/dist/services/restaurant/payout.service.js` | Build artifact | Compiled or packaged artifact: payout.service. | 160 |
| `apps/backend/dist/services/restaurant/payout.service.js.map` | Build artifact | Compiled or packaged artifact: payout.service.js. | 1 |
| `apps/backend/dist/services/restaurant/restaurant-ops.controller.js` | Build artifact | Compiled or packaged artifact: restaurant ops.controller. | 229 |
| `apps/backend/dist/services/restaurant/restaurant-ops.controller.js.map` | Build artifact | Compiled or packaged artifact: restaurant ops.controller.js. | 1 |
| `apps/backend/dist/services/restaurant/restaurant-ops.service.js` | Build artifact | Compiled or packaged artifact: restaurant ops.service. | 131 |
| `apps/backend/dist/services/restaurant/restaurant-ops.service.js.map` | Build artifact | Compiled or packaged artifact: restaurant ops.service.js. | 1 |
| `apps/backend/dist/services/restaurant/restaurant.controller.js` | Build artifact | Compiled or packaged artifact: restaurant.controller. | 87 |
| `apps/backend/dist/services/restaurant/restaurant.controller.js.map` | Build artifact | Compiled or packaged artifact: restaurant.controller.js. | 1 |
| `apps/backend/dist/services/restaurant/restaurant.module.js` | Build artifact | Compiled or packaged artifact: restaurant.module. | 55 |
| `apps/backend/dist/services/restaurant/restaurant.module.js.map` | Build artifact | Compiled or packaged artifact: restaurant.module.js. | 1 |
| `apps/backend/dist/services/restaurant/restaurant.service.js` | Build artifact | Compiled or packaged artifact: restaurant.service. | 95 |
| `apps/backend/dist/services/restaurant/restaurant.service.js.map` | Build artifact | Compiled or packaged artifact: restaurant.service.js. | 1 |
| `apps/backend/dist/services/review/review.controller.js` | Build artifact | Compiled or packaged artifact: review.controller. | 69 |
| `apps/backend/dist/services/review/review.controller.js.map` | Build artifact | Compiled or packaged artifact: review.controller.js. | 1 |
| `apps/backend/dist/services/review/review.module.js` | Build artifact | Compiled or packaged artifact: review.module. | 25 |
| `apps/backend/dist/services/review/review.module.js.map` | Build artifact | Compiled or packaged artifact: review.module.js. | 1 |
| `apps/backend/dist/services/review/review.service.js` | Build artifact | Compiled or packaged artifact: review.service. | 56 |
| `apps/backend/dist/services/review/review.service.js.map` | Build artifact | Compiled or packaged artifact: review.service.js. | 1 |
| `apps/backend/dist/services/search/search.controller.js` | Build artifact | Compiled or packaged artifact: search.controller. | 60 |
| `apps/backend/dist/services/search/search.controller.js.map` | Build artifact | Compiled or packaged artifact: search.controller.js. | 1 |
| `apps/backend/dist/services/search/search.module.js` | Build artifact | Compiled or packaged artifact: search.module. | 25 |
| `apps/backend/dist/services/search/search.module.js.map` | Build artifact | Compiled or packaged artifact: search.module.js. | 1 |
| `apps/backend/dist/services/search/search.service.js` | Build artifact | Compiled or packaged artifact: search.service. | 59 |
| `apps/backend/dist/services/search/search.service.js.map` | Build artifact | Compiled or packaged artifact: search.service.js. | 1 |
| `apps/backend/dist/services/support/customer-support.service.js` | Build artifact | Compiled or packaged artifact: customer support.service. | 191 |
| `apps/backend/dist/services/support/customer-support.service.js.map` | Build artifact | Compiled or packaged artifact: customer support.service.js. | 1 |
| `apps/backend/dist/services/support/support.controller.js` | Build artifact | Compiled or packaged artifact: support.controller. | 121 |
| `apps/backend/dist/services/support/support.controller.js.map` | Build artifact | Compiled or packaged artifact: support.controller.js. | 1 |
| `apps/backend/dist/services/support/support.module.js` | Build artifact | Compiled or packaged artifact: support.module. | 32 |
| `apps/backend/dist/services/support/support.module.js.map` | Build artifact | Compiled or packaged artifact: support.module.js. | 1 |
| `apps/backend/dist/services/support/ticket-routing.service.js` | Build artifact | Compiled or packaged artifact: ticket routing.service. | 156 |
| `apps/backend/dist/services/support/ticket-routing.service.js.map` | Build artifact | Compiled or packaged artifact: ticket routing.service.js. | 1 |
| `apps/backend/dist/services/user/user-profile.controller.js` | Build artifact | Compiled or packaged artifact: user profile.controller. | 126 |
| `apps/backend/dist/services/user/user-profile.controller.js.map` | Build artifact | Compiled or packaged artifact: user profile.controller.js. | 1 |
| `apps/backend/dist/services/user/user-profile.module.js` | Build artifact | Compiled or packaged artifact: user profile.module. | 25 |
| `apps/backend/dist/services/user/user-profile.module.js.map` | Build artifact | Compiled or packaged artifact: user profile.module.js. | 1 |
| `apps/backend/dist/services/user/user-profile.service.js` | Build artifact | Compiled or packaged artifact: user profile.service. | 106 |
| `apps/backend/dist/services/user/user-profile.service.js.map` | Build artifact | Compiled or packaged artifact: user profile.service.js. | 1 |
| `apps/backend/dist/services/users/address.controller.js` | Build artifact | Compiled or packaged artifact: address.controller. | 78 |
| `apps/backend/dist/services/users/address.controller.js.map` | Build artifact | Compiled or packaged artifact: address.controller.js. | 1 |
| `apps/backend/dist/services/users/address.service.js` | Build artifact | Compiled or packaged artifact: address.service. | 50 |
| `apps/backend/dist/services/users/address.service.js.map` | Build artifact | Compiled or packaged artifact: address.service.js. | 1 |
| `apps/backend/dist/services/users/payment-methods.controller.js` | Build artifact | Compiled or packaged artifact: payment methods.controller. | 78 |
| `apps/backend/dist/services/users/payment-methods.controller.js.map` | Build artifact | Compiled or packaged artifact: payment methods.controller.js. | 1 |
| `apps/backend/dist/services/users/payment-methods.service.js` | Build artifact | Compiled or packaged artifact: payment methods.service. | 50 |
| `apps/backend/dist/services/users/payment-methods.service.js.map` | Build artifact | Compiled or packaged artifact: payment methods.service.js. | 1 |
| `apps/backend/dist/services/users/user.module.js` | Build artifact | Compiled or packaged artifact: user.module. | 23 |
| `apps/backend/dist/services/users/user.module.js.map` | Build artifact | Compiled or packaged artifact: user.module.js. | 1 |
| `apps/backend/dist/services/wallet/wallet.controller.js` | Build artifact | Compiled or packaged artifact: wallet.controller. | 155 |
| `apps/backend/dist/services/wallet/wallet.controller.js.map` | Build artifact | Compiled or packaged artifact: wallet.controller.js. | 1 |
| `apps/backend/dist/services/wallet/wallet.module.js` | Build artifact | Compiled or packaged artifact: wallet.module. | 27 |
| `apps/backend/dist/services/wallet/wallet.module.js.map` | Build artifact | Compiled or packaged artifact: wallet.module.js. | 1 |
| `apps/backend/dist/services/wallet/wallet.service.js` | Build artifact | Compiled or packaged artifact: wallet.service. | 255 |
| `apps/backend/dist/services/wallet/wallet.service.js.map` | Build artifact | Compiled or packaged artifact: wallet.service.js. | 1 |
| `apps/backend/dist/services/wallet/wallet.service.spec.js` | Build artifact | Compiled or packaged artifact: wallet.service.spec. | 97 |
| `apps/backend/dist/services/wallet/wallet.service.spec.js.map` | Build artifact | Compiled or packaged artifact: wallet.service.spec.js. | 1 |
| `apps/backend/dist/shared/contracts/queues.js` | Build artifact | Compiled or packaged artifact: queues. | 11 |
| `apps/backend/dist/shared/contracts/queues.js.map` | Build artifact | Compiled or packaged artifact: queues.js. | 1 |
| `apps/backend/dist/shared/domain/order.interface.js` | Build artifact | Compiled or packaged artifact: order.interface. | 25 |
| `apps/backend/dist/shared/domain/order.interface.js.map` | Build artifact | Compiled or packaged artifact: order.interface.js. | 1 |
| `apps/backend/dist/shared/domain/user.interface.js` | Build artifact | Compiled or packaged artifact: user.interface. | 21 |
| `apps/backend/dist/shared/domain/user.interface.js.map` | Build artifact | Compiled or packaged artifact: user.interface.js. | 1 |
| `apps/backend/dist/src/apis.controller.js` | Build artifact | Compiled or packaged artifact: apis.controller. | 50 |
| `apps/backend/dist/src/apis.controller.js.map` | Build artifact | Compiled or packaged artifact: apis.controller.js. | 1 |
| `apps/backend/dist/src/apis.module.js` | Build artifact | Compiled or packaged artifact: apis.module. | 22 |
| `apps/backend/dist/src/apis.module.js.map` | Build artifact | Compiled or packaged artifact: apis.module.js. | 1 |
| `apps/backend/dist/src/apis.service.js` | Build artifact | Compiled or packaged artifact: apis.service. | 20 |
| `apps/backend/dist/src/apis.service.js.map` | Build artifact | Compiled or packaged artifact: apis.service.js. | 1 |
| `apps/backend/dist/src/app.controller.js` | Build artifact | Compiled or packaged artifact: app.controller. | 44 |
| `apps/backend/dist/src/app.controller.js.map` | Build artifact | Compiled or packaged artifact: app.controller.js. | 1 |
| `apps/backend/dist/src/app.http.module.js` | Build artifact | Compiled or packaged artifact: app.http.module. | 48 |
| `apps/backend/dist/src/app.http.module.js.map` | Build artifact | Compiled or packaged artifact: app.http.module.js. | 1 |
| `apps/backend/dist/src/app.module.js` | Build artifact | Compiled or packaged artifact: app.module. | 121 |
| `apps/backend/dist/src/app.module.js.map` | Build artifact | Compiled or packaged artifact: app.module.js. | 1 |
| `apps/backend/dist/src/app.service.js` | Build artifact | Compiled or packaged artifact: app.service. | 20 |
| `apps/backend/dist/src/app.service.js.map` | Build artifact | Compiled or packaged artifact: app.service.js. | 1 |
| `apps/backend/dist/src/audit/audit.module.js` | Build artifact | Compiled or packaged artifact: audit.module. | 21 |
| `apps/backend/dist/src/audit/audit.module.js.map` | Build artifact | Compiled or packaged artifact: audit.module.js. | 1 |
| `apps/backend/dist/src/audit/audit.service.js` | Build artifact | Compiled or packaged artifact: audit.service. | 177 |
| `apps/backend/dist/src/audit/audit.service.js.map` | Build artifact | Compiled or packaged artifact: audit.service.js. | 1 |
| `apps/backend/dist/src/common/errors/missing-env.error.js` | Build artifact | Compiled or packaged artifact: missing env.error. | 34 |
| `apps/backend/dist/src/common/errors/missing-env.error.js.map` | Build artifact | Compiled or packaged artifact: missing env.error.js. | 1 |
| `apps/backend/dist/src/compliance/compliance.controller.js` | Build artifact | Compiled or packaged artifact: compliance.controller. | 343 |
| `apps/backend/dist/src/compliance/compliance.controller.js.map` | Build artifact | Compiled or packaged artifact: compliance.controller.js. | 1 |
| `apps/backend/dist/src/compliance/compliance.module.js` | Build artifact | Compiled or packaged artifact: compliance.module. | 24 |
| `apps/backend/dist/src/compliance/compliance.module.js.map` | Build artifact | Compiled or packaged artifact: compliance.module.js. | 1 |
| `apps/backend/dist/src/compliance/compliance.service.js` | Build artifact | Compiled or packaged artifact: compliance.service. | 260 |
| `apps/backend/dist/src/compliance/compliance.service.js.map` | Build artifact | Compiled or packaged artifact: compliance.service.js. | 1 |
| `apps/backend/dist/src/compliance/pci-dss-validation.service.js` | Build artifact | Compiled or packaged artifact: pci dss validation.service. | 272 |
| `apps/backend/dist/src/compliance/pci-dss-validation.service.js.map` | Build artifact | Compiled or packaged artifact: pci dss validation.service.js. | 1 |
| `apps/backend/dist/src/compliance/secrets-rotation.service.js` | Build artifact | Compiled or packaged artifact: secrets rotation.service. | 130 |
| `apps/backend/dist/src/compliance/secrets-rotation.service.js.map` | Build artifact | Compiled or packaged artifact: secrets rotation.service.js. | 1 |
| `apps/backend/dist/src/compliance/soc2-readiness.service.js` | Build artifact | Compiled or packaged artifact: soc2 readiness.service. | 251 |
| `apps/backend/dist/src/compliance/soc2-readiness.service.js.map` | Build artifact | Compiled or packaged artifact: soc2 readiness.service.js. | 1 |
| `apps/backend/dist/src/controllers/driver.controller.js` | Build artifact | Compiled or packaged artifact: driver.controller. | 327 |
| `apps/backend/dist/src/controllers/driver.controller.js.map` | Build artifact | Compiled or packaged artifact: driver.controller.js. | 1 |
| `apps/backend/dist/src/db/database-failover.service.js` | Build artifact | Compiled or packaged artifact: database failover.service. | 135 |
| `apps/backend/dist/src/db/database-failover.service.js.map` | Build artifact | Compiled or packaged artifact: database failover.service.js. | 1 |
| `apps/backend/dist/src/db/db.module.js` | Build artifact | Compiled or packaged artifact: db.module. | 196 |
| `apps/backend/dist/src/db/db.module.js.map` | Build artifact | Compiled or packaged artifact: db.module.js. | 1 |
| `apps/backend/dist/src/db/entities/address.entity.js` | Build artifact | Compiled or packaged artifact: address.entity. | 84 |
| `apps/backend/dist/src/db/entities/address.entity.js.map` | Build artifact | Compiled or packaged artifact: address.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/audit-log.entity.js` | Build artifact | Compiled or packaged artifact: audit log.entity. | 62 |
| `apps/backend/dist/src/db/entities/audit-log.entity.js.map` | Build artifact | Compiled or packaged artifact: audit log.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/batch.entity.js` | Build artifact | Compiled or packaged artifact: batch.entity. | 107 |
| `apps/backend/dist/src/db/entities/batch.entity.js.map` | Build artifact | Compiled or packaged artifact: batch.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/branch-control.entity.js` | Build artifact | Compiled or packaged artifact: branch control.entity. | 80 |
| `apps/backend/dist/src/db/entities/branch-control.entity.js.map` | Build artifact | Compiled or packaged artifact: branch control.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/commission-rule.entity.js` | Build artifact | Compiled or packaged artifact: commission rule.entity. | 102 |
| `apps/backend/dist/src/db/entities/commission-rule.entity.js.map` | Build artifact | Compiled or packaged artifact: commission rule.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/coupon-usage.entity.js` | Build artifact | Compiled or packaged artifact: coupon usage.entity. | 67 |
| `apps/backend/dist/src/db/entities/coupon-usage.entity.js.map` | Build artifact | Compiled or packaged artifact: coupon usage.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/coupon.entity.js` | Build artifact | Compiled or packaged artifact: coupon.entity. | 156 |
| `apps/backend/dist/src/db/entities/coupon.entity.js.map` | Build artifact | Compiled or packaged artifact: coupon.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/data-export-request.entity.js` | Build artifact | Compiled or packaged artifact: data export request.entity. | 76 |
| `apps/backend/dist/src/db/entities/data-export-request.entity.js.map` | Build artifact | Compiled or packaged artifact: data export request.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/deletion-request.entity.js` | Build artifact | Compiled or packaged artifact: deletion request.entity. | 71 |
| `apps/backend/dist/src/db/entities/deletion-request.entity.js.map` | Build artifact | Compiled or packaged artifact: deletion request.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/delivery-sla.entity.js` | Build artifact | Compiled or packaged artifact: delivery sla.entity. | 82 |
| `apps/backend/dist/src/db/entities/delivery-sla.entity.js.map` | Build artifact | Compiled or packaged artifact: delivery sla.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/device-fingerprint.entity.js` | Build artifact | Compiled or packaged artifact: device fingerprint.entity. | 78 |
| `apps/backend/dist/src/db/entities/device-fingerprint.entity.js.map` | Build artifact | Compiled or packaged artifact: device fingerprint.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/dispute.entity.js` | Build artifact | Compiled or packaged artifact: dispute.entity. | 141 |
| `apps/backend/dist/src/db/entities/dispute.entity.js.map` | Build artifact | Compiled or packaged artifact: dispute.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/driver-assignment.entity.js` | Build artifact | Compiled or packaged artifact: driver assignment.entity. | 103 |
| `apps/backend/dist/src/db/entities/driver-assignment.entity.js.map` | Build artifact | Compiled or packaged artifact: driver assignment.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/driver-document.entity.js` | Build artifact | Compiled or packaged artifact: driver document.entity. | 96 |
| `apps/backend/dist/src/db/entities/driver-document.entity.js.map` | Build artifact | Compiled or packaged artifact: driver document.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/driver-fraud.entity.js` | Build artifact | Compiled or packaged artifact: driver fraud.entity. | 88 |
| `apps/backend/dist/src/db/entities/driver-fraud.entity.js.map` | Build artifact | Compiled or packaged artifact: driver fraud.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/driver-incentive.entity.js` | Build artifact | Compiled or packaged artifact: driver incentive.entity. | 101 |
| `apps/backend/dist/src/db/entities/driver-incentive.entity.js.map` | Build artifact | Compiled or packaged artifact: driver incentive.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/driver-penalty.entity.js` | Build artifact | Compiled or packaged artifact: driver penalty.entity. | 120 |
| `apps/backend/dist/src/db/entities/driver-penalty.entity.js.map` | Build artifact | Compiled or packaged artifact: driver penalty.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/driver-score.entity.js` | Build artifact | Compiled or packaged artifact: driver score.entity. | 92 |
| `apps/backend/dist/src/db/entities/driver-score.entity.js.map` | Build artifact | Compiled or packaged artifact: driver score.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/driver-shift.entity.js` | Build artifact | Compiled or packaged artifact: driver shift.entity. | 87 |
| `apps/backend/dist/src/db/entities/driver-shift.entity.js.map` | Build artifact | Compiled or packaged artifact: driver shift.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/driver.entity.js` | Build artifact | Compiled or packaged artifact: driver.entity. | 135 |
| `apps/backend/dist/src/db/entities/driver.entity.js.map` | Build artifact | Compiled or packaged artifact: driver.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/food-prep.entity.js` | Build artifact | Compiled or packaged artifact: food prep.entity. | 97 |
| `apps/backend/dist/src/db/entities/food-prep.entity.js.map` | Build artifact | Compiled or packaged artifact: food prep.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/gst-detail.entity.js` | Build artifact | Compiled or packaged artifact: gst detail.entity. | 96 |
| `apps/backend/dist/src/db/entities/gst-detail.entity.js.map` | Build artifact | Compiled or packaged artifact: gst detail.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/holiday-schedule.entity.js` | Build artifact | Compiled or packaged artifact: holiday schedule.entity. | 101 |
| `apps/backend/dist/src/db/entities/holiday-schedule.entity.js.map` | Build artifact | Compiled or packaged artifact: holiday schedule.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/hsn-sac.entity.js` | Build artifact | Compiled or packaged artifact: hsn sac.entity. | 71 |
| `apps/backend/dist/src/db/entities/hsn-sac.entity.js.map` | Build artifact | Compiled or packaged artifact: hsn sac.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/inventory-alert.entity.js` | Build artifact | Compiled or packaged artifact: inventory alert.entity. | 82 |
| `apps/backend/dist/src/db/entities/inventory-alert.entity.js.map` | Build artifact | Compiled or packaged artifact: inventory alert.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/inventory-item.entity.js` | Build artifact | Compiled or packaged artifact: inventory item.entity. | 107 |
| `apps/backend/dist/src/db/entities/inventory-item.entity.js.map` | Build artifact | Compiled or packaged artifact: inventory item.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/kitchen-sla.entity.js` | Build artifact | Compiled or packaged artifact: kitchen sla.entity. | 76 |
| `apps/backend/dist/src/db/entities/kitchen-sla.entity.js.map` | Build artifact | Compiled or packaged artifact: kitchen sla.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/ledger-entry.entity.js` | Build artifact | Compiled or packaged artifact: ledger entry.entity. | 65 |
| `apps/backend/dist/src/db/entities/ledger-entry.entity.js.map` | Build artifact | Compiled or packaged artifact: ledger entry.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/menu-addon.entity.js` | Build artifact | Compiled or packaged artifact: menu addon.entity. | 56 |
| `apps/backend/dist/src/db/entities/menu-addon.entity.js.map` | Build artifact | Compiled or packaged artifact: menu addon.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/menu-category.entity.js` | Build artifact | Compiled or packaged artifact: menu category.entity. | 57 |
| `apps/backend/dist/src/db/entities/menu-category.entity.js.map` | Build artifact | Compiled or packaged artifact: menu category.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/menu-item-availability.entity.js` | Build artifact | Compiled or packaged artifact: menu item availability.entity. | 82 |
| `apps/backend/dist/src/db/entities/menu-item-availability.entity.js.map` | Build artifact | Compiled or packaged artifact: menu item availability.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/menu-item.entity.js` | Build artifact | Compiled or packaged artifact: menu item.entity. | 93 |
| `apps/backend/dist/src/db/entities/menu-item.entity.js.map` | Build artifact | Compiled or packaged artifact: menu item.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/menu-moderation.entity.js` | Build artifact | Compiled or packaged artifact: menu moderation.entity. | 120 |
| `apps/backend/dist/src/db/entities/menu-moderation.entity.js.map` | Build artifact | Compiled or packaged artifact: menu moderation.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/menu-variant.entity.js` | Build artifact | Compiled or packaged artifact: menu variant.entity. | 61 |
| `apps/backend/dist/src/db/entities/menu-variant.entity.js.map` | Build artifact | Compiled or packaged artifact: menu variant.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/notification-analytics.entity.js` | Build artifact | Compiled or packaged artifact: notification analytics.entity. | 79 |
| `apps/backend/dist/src/db/entities/notification-analytics.entity.js.map` | Build artifact | Compiled or packaged artifact: notification analytics.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/notification-preference.entity.js` | Build artifact | Compiled or packaged artifact: notification preference.entity. | 77 |
| `apps/backend/dist/src/db/entities/notification-preference.entity.js.map` | Build artifact | Compiled or packaged artifact: notification preference.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/notification-status.enum.js` | Build artifact | Compiled or packaged artifact: notification status.enum. | 13 |
| `apps/backend/dist/src/db/entities/notification-status.enum.js.map` | Build artifact | Compiled or packaged artifact: notification status.enum.js. | 1 |
| `apps/backend/dist/src/db/entities/notification.entity.js` | Build artifact | Compiled or packaged artifact: notification.entity. | 106 |
| `apps/backend/dist/src/db/entities/notification.entity.js.map` | Build artifact | Compiled or packaged artifact: notification.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/order-item.entity.js` | Build artifact | Compiled or packaged artifact: order item.entity. | 138 |
| `apps/backend/dist/src/db/entities/order-item.entity.js.map` | Build artifact | Compiled or packaged artifact: order item.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/order.entity.js` | Build artifact | Compiled or packaged artifact: order.entity. | 149 |
| `apps/backend/dist/src/db/entities/order.entity.js.map` | Build artifact | Compiled or packaged artifact: order.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/otp.entity.js` | Build artifact | Compiled or packaged artifact: otp.entity. | 85 |
| `apps/backend/dist/src/db/entities/otp.entity.js.map` | Build artifact | Compiled or packaged artifact: otp.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/payment-dispute.entity.js` | Build artifact | Compiled or packaged artifact: payment dispute.entity. | 106 |
| `apps/backend/dist/src/db/entities/payment-dispute.entity.js.map` | Build artifact | Compiled or packaged artifact: payment dispute.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/payment-method.entity.js` | Build artifact | Compiled or packaged artifact: payment method.entity. | 87 |
| `apps/backend/dist/src/db/entities/payment-method.entity.js.map` | Build artifact | Compiled or packaged artifact: payment method.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/payment-webhook.entity.js` | Build artifact | Compiled or packaged artifact: payment webhook.entity. | 50 |
| `apps/backend/dist/src/db/entities/payment-webhook.entity.js.map` | Build artifact | Compiled or packaged artifact: payment webhook.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/payout-report.entity.js` | Build artifact | Compiled or packaged artifact: payout report.entity. | 119 |
| `apps/backend/dist/src/db/entities/payout-report.entity.js.map` | Build artifact | Compiled or packaged artifact: payout report.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/recipe.entity.js` | Build artifact | Compiled or packaged artifact: recipe.entity. | 101 |
| `apps/backend/dist/src/db/entities/recipe.entity.js.map` | Build artifact | Compiled or packaged artifact: recipe.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/referral.entity.js` | Build artifact | Compiled or packaged artifact: referral.entity. | 115 |
| `apps/backend/dist/src/db/entities/referral.entity.js.map` | Build artifact | Compiled or packaged artifact: referral.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/refund-approval.entity.js` | Build artifact | Compiled or packaged artifact: refund approval.entity. | 121 |
| `apps/backend/dist/src/db/entities/refund-approval.entity.js.map` | Build artifact | Compiled or packaged artifact: refund approval.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/refund.entity.js` | Build artifact | Compiled or packaged artifact: refund.entity. | 131 |
| `apps/backend/dist/src/db/entities/refund.entity.js.map` | Build artifact | Compiled or packaged artifact: refund.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/restaurant-branch.entity.js` | Build artifact | Compiled or packaged artifact: restaurant branch.entity. | 95 |
| `apps/backend/dist/src/db/entities/restaurant-branch.entity.js.map` | Build artifact | Compiled or packaged artifact: restaurant branch.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/restaurant-gst.entity.js` | Build artifact | Compiled or packaged artifact: restaurant gst.entity. | 101 |
| `apps/backend/dist/src/db/entities/restaurant-gst.entity.js.map` | Build artifact | Compiled or packaged artifact: restaurant gst.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/restaurant-onboarding.entity.js` | Build artifact | Compiled or packaged artifact: restaurant onboarding.entity. | 111 |
| `apps/backend/dist/src/db/entities/restaurant-onboarding.entity.js.map` | Build artifact | Compiled or packaged artifact: restaurant onboarding.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/restaurant.entity.js` | Build artifact | Compiled or packaged artifact: restaurant.entity. | 92 |
| `apps/backend/dist/src/db/entities/restaurant.entity.js.map` | Build artifact | Compiled or packaged artifact: restaurant.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/session.entity.js` | Build artifact | Compiled or packaged artifact: session.entity. | 77 |
| `apps/backend/dist/src/db/entities/session.entity.js.map` | Build artifact | Compiled or packaged artifact: session.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/sla-alert.entity.js` | Build artifact | Compiled or packaged artifact: sla alert.entity. | 87 |
| `apps/backend/dist/src/db/entities/sla-alert.entity.js.map` | Build artifact | Compiled or packaged artifact: sla alert.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/stripe-webhook.entity.js` | Build artifact | Compiled or packaged artifact: stripe webhook.entity. | 45 |
| `apps/backend/dist/src/db/entities/stripe-webhook.entity.js.map` | Build artifact | Compiled or packaged artifact: stripe webhook.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/subscription.entity.js` | Build artifact | Compiled or packaged artifact: subscription.entity. | 66 |
| `apps/backend/dist/src/db/entities/subscription.entity.js.map` | Build artifact | Compiled or packaged artifact: subscription.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/supplier.entity.js` | Build artifact | Compiled or packaged artifact: supplier.entity. | 71 |
| `apps/backend/dist/src/db/entities/supplier.entity.js.map` | Build artifact | Compiled or packaged artifact: supplier.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/support-ticket.entity.js` | Build artifact | Compiled or packaged artifact: support ticket.entity. | 216 |
| `apps/backend/dist/src/db/entities/support-ticket.entity.js.map` | Build artifact | Compiled or packaged artifact: support ticket.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/surge-zone.entity.js` | Build artifact | Compiled or packaged artifact: surge zone.entity. | 65 |
| `apps/backend/dist/src/db/entities/surge-zone.entity.js.map` | Build artifact | Compiled or packaged artifact: surge zone.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/user-device.entity.js` | Build artifact | Compiled or packaged artifact: user device.entity. | 82 |
| `apps/backend/dist/src/db/entities/user-device.entity.js.map` | Build artifact | Compiled or packaged artifact: user device.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/user.entity.js` | Build artifact | Compiled or packaged artifact: user.entity. | 86 |
| `apps/backend/dist/src/db/entities/user.entity.js.map` | Build artifact | Compiled or packaged artifact: user.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/wallet-transaction.entity.js` | Build artifact | Compiled or packaged artifact: wallet transaction.entity. | 61 |
| `apps/backend/dist/src/db/entities/wallet-transaction.entity.js.map` | Build artifact | Compiled or packaged artifact: wallet transaction.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/wallet.entity.js` | Build artifact | Compiled or packaged artifact: wallet.entity. | 56 |
| `apps/backend/dist/src/db/entities/wallet.entity.js.map` | Build artifact | Compiled or packaged artifact: wallet.entity.js. | 1 |
| `apps/backend/dist/src/db/entities/webhook-retry-queue.entity.js` | Build artifact | Compiled or packaged artifact: webhook retry queue.entity. | 86 |
| `apps/backend/dist/src/db/entities/webhook-retry-queue.entity.js.map` | Build artifact | Compiled or packaged artifact: webhook retry queue.entity.js. | 1 |
| `apps/backend/dist/src/db/interfaces/database-adapter.interface.js` | Build artifact | Compiled or packaged artifact: database adapter.interface. | 3 |
| `apps/backend/dist/src/db/interfaces/database-adapter.interface.js.map` | Build artifact | Compiled or packaged artifact: database adapter.interface.js. | 1 |
| `apps/backend/dist/src/db/local-repository.module.js` | Build artifact | Compiled or packaged artifact: local repository.module. | 175 |
| `apps/backend/dist/src/db/local-repository.module.js.map` | Build artifact | Compiled or packaged artifact: local repository.module.js. | 1 |
| `apps/backend/dist/src/db/mongo.adapter.js` | Build artifact | Compiled or packaged artifact: mongo.adapter. | 50 |
| `apps/backend/dist/src/db/mongo.adapter.js.map` | Build artifact | Compiled or packaged artifact: mongo.adapter.js. | 1 |
| `apps/backend/dist/src/db/postgres.adapter.js` | Build artifact | Compiled or packaged artifact: postgres.adapter. | 51 |
| `apps/backend/dist/src/db/postgres.adapter.js.map` | Build artifact | Compiled or packaged artifact: postgres.adapter.js. | 1 |
| `apps/backend/dist/src/db/redis.adapter.js` | Build artifact | Compiled or packaged artifact: redis.adapter. | 122 |
| `apps/backend/dist/src/db/redis.adapter.js.map` | Build artifact | Compiled or packaged artifact: redis.adapter.js. | 1 |
| `apps/backend/dist/src/db/schemas/review.schema.js` | Build artifact | Compiled or packaged artifact: review.schema. | 52 |
| `apps/backend/dist/src/db/schemas/review.schema.js.map` | Build artifact | Compiled or packaged artifact: review.schema.js. | 1 |
| `apps/backend/dist/src/gateway/gateway.module.js` | Build artifact | Compiled or packaged artifact: gateway.module. | 17 |
| `apps/backend/dist/src/gateway/gateway.module.js.map` | Build artifact | Compiled or packaged artifact: gateway.module.js. | 1 |
| `apps/backend/dist/src/grpc/auth.controller.js` | Build artifact | Compiled or packaged artifact: auth.controller. | 34 |
| `apps/backend/dist/src/grpc/auth.controller.js.map` | Build artifact | Compiled or packaged artifact: auth.controller.js. | 1 |
| `apps/backend/dist/src/grpc/grpc-app.module.js` | Build artifact | Compiled or packaged artifact: grpc app.module. | 40 |
| `apps/backend/dist/src/grpc/grpc-app.module.js.map` | Build artifact | Compiled or packaged artifact: grpc app.module.js. | 1 |
| `apps/backend/dist/src/grpc/grpc.module.js` | Build artifact | Compiled or packaged artifact: grpc.module. | 26 |
| `apps/backend/dist/src/grpc/grpc.module.js.map` | Build artifact | Compiled or packaged artifact: grpc.module.js. | 1 |
| `apps/backend/dist/src/grpc/order.controller.js` | Build artifact | Compiled or packaged artifact: order.controller. | 36 |
| `apps/backend/dist/src/grpc/order.controller.js.map` | Build artifact | Compiled or packaged artifact: order.controller.js. | 1 |
| `apps/backend/dist/src/infra/observability/logger.service.js` | Build artifact | Compiled or packaged artifact: logger.service. | 67 |
| `apps/backend/dist/src/infra/observability/logger.service.js.map` | Build artifact | Compiled or packaged artifact: logger.service.js. | 1 |
| `apps/backend/dist/src/infra/queue/order.processor.js` | Build artifact | Compiled or packaged artifact: order.processor. | 42 |
| `apps/backend/dist/src/infra/queue/order.processor.js.map` | Build artifact | Compiled or packaged artifact: order.processor.js. | 1 |
| `apps/backend/dist/src/infra/queue/queue.module.js` | Build artifact | Compiled or packaged artifact: queue.module. | 23 |
| `apps/backend/dist/src/infra/queue/queue.module.js.map` | Build artifact | Compiled or packaged artifact: queue.module.js. | 1 |
| `apps/backend/dist/src/infra/queue/queue.service.js` | Build artifact | Compiled or packaged artifact: queue.service. | 40 |
| `apps/backend/dist/src/infra/queue/queue.service.js.map` | Build artifact | Compiled or packaged artifact: queue.service.js. | 1 |
| `apps/backend/dist/src/infra/secret-loader.service.js` | Build artifact | Compiled or packaged artifact: secret loader.service. | 129 |
| `apps/backend/dist/src/infra/secret-loader.service.js.map` | Build artifact | Compiled or packaged artifact: secret loader.service.js. | 1 |
| `apps/backend/dist/src/infra/tracking/tracking.gateway.js` | Build artifact | Compiled or packaged artifact: tracking.gateway. | 283 |
| `apps/backend/dist/src/infra/tracking/tracking.gateway.js.map` | Build artifact | Compiled or packaged artifact: tracking.gateway.js. | 1 |
| `apps/backend/dist/src/infra/tracking/tracking.module.js` | Build artifact | Compiled or packaged artifact: tracking.module. | 24 |
| `apps/backend/dist/src/infra/tracking/tracking.module.js.map` | Build artifact | Compiled or packaged artifact: tracking.module.js. | 1 |
| `apps/backend/dist/src/jobs/retention-job.js` | Build artifact | Compiled or packaged artifact: retention job. | 71 |
| `apps/backend/dist/src/jobs/retention-job.js.map` | Build artifact | Compiled or packaged artifact: retention job.js. | 1 |
| `apps/backend/dist/src/legal/legal.controller.js` | Build artifact | Compiled or packaged artifact: legal.controller. | 124 |
| `apps/backend/dist/src/legal/legal.controller.js.map` | Build artifact | Compiled or packaged artifact: legal.controller.js. | 1 |
| `apps/backend/dist/src/legal/legal.module.js` | Build artifact | Compiled or packaged artifact: legal.module. | 20 |
| `apps/backend/dist/src/legal/legal.module.js.map` | Build artifact | Compiled or packaged artifact: legal.module.js. | 1 |
| `apps/backend/dist/src/local-dev.module.js` | Build artifact | Compiled or packaged artifact: local dev.module. | 63 |
| `apps/backend/dist/src/local-dev.module.js.map` | Build artifact | Compiled or packaged artifact: local dev.module.js. | 1 |
| `apps/backend/dist/src/logging/logging.module.js` | Build artifact | Compiled or packaged artifact: logging.module. | 26 |
| `apps/backend/dist/src/logging/logging.module.js.map` | Build artifact | Compiled or packaged artifact: logging.module.js. | 1 |
| `apps/backend/dist/src/logging/logging.service.js` | Build artifact | Compiled or packaged artifact: logging.service. | 102 |
| `apps/backend/dist/src/logging/logging.service.js.map` | Build artifact | Compiled or packaged artifact: logging.service.js. | 1 |
| `apps/backend/dist/src/main-grpc.js` | Build artifact | Compiled or packaged artifact: main grpc. | 27 |
| `apps/backend/dist/src/main-grpc.js.map` | Build artifact | Compiled or packaged artifact: main grpc.js. | 1 |
| `apps/backend/dist/src/main.js` | Build artifact | Compiled or packaged artifact: main. | 136 |
| `apps/backend/dist/src/main.js.map` | Build artifact | Compiled or packaged artifact: main.js. | 1 |
| `apps/backend/dist/src/metrics/latency-metrics.interceptor.js` | Build artifact | Compiled or packaged artifact: latency metrics.interceptor. | 42 |
| `apps/backend/dist/src/metrics/latency-metrics.interceptor.js.map` | Build artifact | Compiled or packaged artifact: latency metrics.interceptor.js. | 1 |
| `apps/backend/dist/src/metrics/metrics.controller.js` | Build artifact | Compiled or packaged artifact: metrics.controller. | 35 |
| `apps/backend/dist/src/metrics/metrics.controller.js.map` | Build artifact | Compiled or packaged artifact: metrics.controller.js. | 1 |
| `apps/backend/dist/src/metrics/metrics.module.js` | Build artifact | Compiled or packaged artifact: metrics.module. | 22 |
| `apps/backend/dist/src/metrics/metrics.module.js.map` | Build artifact | Compiled or packaged artifact: metrics.module.js. | 1 |
| `apps/backend/dist/src/metrics/metrics.service.js` | Build artifact | Compiled or packaged artifact: metrics.service. | 79 |
| `apps/backend/dist/src/metrics/metrics.service.js.map` | Build artifact | Compiled or packaged artifact: metrics.service.js. | 1 |
| `apps/backend/dist/src/modules/analytics/analytics.controller.js` | Build artifact | Compiled or packaged artifact: analytics.controller. | 127 |
| `apps/backend/dist/src/modules/analytics/analytics.controller.js.map` | Build artifact | Compiled or packaged artifact: analytics.controller.js. | 1 |
| `apps/backend/dist/src/modules/analytics/analytics.module.js` | Build artifact | Compiled or packaged artifact: analytics.module. | 27 |
| `apps/backend/dist/src/modules/analytics/analytics.module.js.map` | Build artifact | Compiled or packaged artifact: analytics.module.js. | 1 |
| `apps/backend/dist/src/modules/analytics/analytics.service.js` | Build artifact | Compiled or packaged artifact: analytics.service. | 337 |
| `apps/backend/dist/src/modules/analytics/analytics.service.js.map` | Build artifact | Compiled or packaged artifact: analytics.service.js. | 1 |
| `apps/backend/dist/src/modules/auth/auth.module.js` | Build artifact | Compiled or packaged artifact: auth.module. | 20 |
| `apps/backend/dist/src/modules/auth/auth.module.js.map` | Build artifact | Compiled or packaged artifact: auth.module.js. | 1 |
| `apps/backend/dist/src/modules/driver-assignment/dispatch-engine.service.js` | Build artifact | Compiled or packaged artifact: dispatch engine.service. | 211 |
| `apps/backend/dist/src/modules/driver-assignment/dispatch-engine.service.js.map` | Build artifact | Compiled or packaged artifact: dispatch engine.service.js. | 1 |
| `apps/backend/dist/src/modules/driver-assignment/driver-assignment.controller.js` | Build artifact | Compiled or packaged artifact: driver assignment.controller. | 204 |
| `apps/backend/dist/src/modules/driver-assignment/driver-assignment.controller.js.map` | Build artifact | Compiled or packaged artifact: driver assignment.controller.js. | 1 |
| `apps/backend/dist/src/modules/driver-assignment/driver-assignment.module.js` | Build artifact | Compiled or packaged artifact: driver assignment.module. | 30 |
| `apps/backend/dist/src/modules/driver-assignment/driver-assignment.module.js.map` | Build artifact | Compiled or packaged artifact: driver assignment.module.js. | 1 |
| `apps/backend/dist/src/modules/driver-assignment/driver-assignment.service.js` | Build artifact | Compiled or packaged artifact: driver assignment.service. | 305 |
| `apps/backend/dist/src/modules/driver-assignment/driver-assignment.service.js.map` | Build artifact | Compiled or packaged artifact: driver assignment.service.js. | 1 |
| `apps/backend/dist/src/modules/driver-assignment/eta-intelligence.service.js` | Build artifact | Compiled or packaged artifact: eta intelligence.service. | 143 |
| `apps/backend/dist/src/modules/driver-assignment/eta-intelligence.service.js.map` | Build artifact | Compiled or packaged artifact: eta intelligence.service.js. | 1 |
| `apps/backend/dist/src/modules/kitchen/kitchen.controller.js` | Build artifact | Compiled or packaged artifact: kitchen.controller. | 299 |
| `apps/backend/dist/src/modules/kitchen/kitchen.controller.js.map` | Build artifact | Compiled or packaged artifact: kitchen.controller.js. | 1 |
| `apps/backend/dist/src/modules/kitchen/kitchen.module.js` | Build artifact | Compiled or packaged artifact: kitchen.module. | 24 |
| `apps/backend/dist/src/modules/kitchen/kitchen.module.js.map` | Build artifact | Compiled or packaged artifact: kitchen.module.js. | 1 |
| `apps/backend/dist/src/modules/kitchen/kitchen.service.js` | Build artifact | Compiled or packaged artifact: kitchen.service. | 794 |
| `apps/backend/dist/src/modules/kitchen/kitchen.service.js.map` | Build artifact | Compiled or packaged artifact: kitchen.service.js. | 1 |
| `apps/backend/dist/src/modules/ledger/ledger.module.js` | Build artifact | Compiled or packaged artifact: ledger.module. | 23 |
| `apps/backend/dist/src/modules/ledger/ledger.module.js.map` | Build artifact | Compiled or packaged artifact: ledger.module.js. | 1 |
| `apps/backend/dist/src/modules/ledger/ledger.service.js` | Build artifact | Compiled or packaged artifact: ledger.service. | 69 |
| `apps/backend/dist/src/modules/ledger/ledger.service.js.map` | Build artifact | Compiled or packaged artifact: ledger.service.js. | 1 |
| `apps/backend/dist/src/modules/notifications/notifications.module.js` | Build artifact | Compiled or packaged artifact: notifications.module. | 24 |
| `apps/backend/dist/src/modules/notifications/notifications.module.js.map` | Build artifact | Compiled or packaged artifact: notifications.module.js. | 1 |
| `apps/backend/dist/src/modules/orders/orders.module.js` | Build artifact | Compiled or packaged artifact: orders.module. | 20 |
| `apps/backend/dist/src/modules/orders/orders.module.js.map` | Build artifact | Compiled or packaged artifact: orders.module.js. | 1 |
| `apps/backend/dist/src/modules/realtime/realtime.module.js` | Build artifact | Compiled or packaged artifact: realtime.module. | 20 |
| `apps/backend/dist/src/modules/realtime/realtime.module.js.map` | Build artifact | Compiled or packaged artifact: realtime.module.js. | 1 |
| `apps/backend/dist/src/security/csrf.middleware.js` | Build artifact | Compiled or packaged artifact: csrf.middleware. | 82 |
| `apps/backend/dist/src/security/csrf.middleware.js.map` | Build artifact | Compiled or packaged artifact: csrf.middleware.js. | 1 |
| `apps/backend/dist/src/security/encryption.service.js` | Build artifact | Compiled or packaged artifact: encryption.service. | 107 |
| `apps/backend/dist/src/security/encryption.service.js.map` | Build artifact | Compiled or packaged artifact: encryption.service.js. | 1 |
| `apps/backend/dist/src/security/jwt-auth.guard.js` | Build artifact | Compiled or packaged artifact: jwt auth.guard. | 18 |
| `apps/backend/dist/src/security/jwt-auth.guard.js.map` | Build artifact | Compiled or packaged artifact: jwt auth.guard.js. | 1 |
| `apps/backend/dist/src/security/roles.decorator.js` | Build artifact | Compiled or packaged artifact: roles.decorator. | 7 |
| `apps/backend/dist/src/security/roles.decorator.js.map` | Build artifact | Compiled or packaged artifact: roles.decorator.js. | 1 |
| `apps/backend/dist/src/security/roles.guard.js` | Build artifact | Compiled or packaged artifact: roles.guard. | 35 |
| `apps/backend/dist/src/security/roles.guard.js.map` | Build artifact | Compiled or packaged artifact: roles.guard.js. | 1 |
| `apps/backend/dist/src/security/security.module.js` | Build artifact | Compiled or packaged artifact: security.module. | 31 |
| `apps/backend/dist/src/security/security.module.js.map` | Build artifact | Compiled or packaged artifact: security.module.js. | 1 |
| `apps/backend/dist/src/security/vault.service.js` | Build artifact | Compiled or packaged artifact: vault.service. | 152 |
| `apps/backend/dist/src/security/vault.service.js.map` | Build artifact | Compiled or packaged artifact: vault.service.js. | 1 |
| `apps/backend/dist/src/services/admin/admin.controller.js` | Build artifact | Compiled or packaged artifact: admin.controller. | 71 |
| `apps/backend/dist/src/services/admin/admin.controller.js.map` | Build artifact | Compiled or packaged artifact: admin.controller.js. | 1 |
| `apps/backend/dist/src/services/admin/admin.module.js` | Build artifact | Compiled or packaged artifact: admin.module. | 27 |
| `apps/backend/dist/src/services/admin/admin.module.js.map` | Build artifact | Compiled or packaged artifact: admin.module.js. | 1 |
| `apps/backend/dist/src/services/admin/admin.service.js` | Build artifact | Compiled or packaged artifact: admin.service. | 134 |
| `apps/backend/dist/src/services/admin/admin.service.js.map` | Build artifact | Compiled or packaged artifact: admin.service.js. | 1 |
| `apps/backend/dist/src/services/ai/ai.controller.js` | Build artifact | Compiled or packaged artifact: ai.controller. | 62 |
| `apps/backend/dist/src/services/ai/ai.controller.js.map` | Build artifact | Compiled or packaged artifact: ai.controller.js. | 1 |
| `apps/backend/dist/src/services/ai/ai.module.js` | Build artifact | Compiled or packaged artifact: ai.module. | 27 |
| `apps/backend/dist/src/services/ai/ai.module.js.map` | Build artifact | Compiled or packaged artifact: ai.module.js. | 1 |
| `apps/backend/dist/src/services/ai/ai.service.js` | Build artifact | Compiled or packaged artifact: ai.service. | 89 |
| `apps/backend/dist/src/services/ai/ai.service.js.map` | Build artifact | Compiled or packaged artifact: ai.service.js. | 1 |
| `apps/backend/dist/src/services/auth/auth.controller.js` | Build artifact | Compiled or packaged artifact: auth.controller. | 84 |
| `apps/backend/dist/src/services/auth/auth.controller.js.map` | Build artifact | Compiled or packaged artifact: auth.controller.js. | 1 |
| `apps/backend/dist/src/services/auth/auth.module.js` | Build artifact | Compiled or packaged artifact: auth.module. | 59 |
| `apps/backend/dist/src/services/auth/auth.module.js.map` | Build artifact | Compiled or packaged artifact: auth.module.js. | 1 |
| `apps/backend/dist/src/services/auth/auth.service.js` | Build artifact | Compiled or packaged artifact: auth.service. | 120 |
| `apps/backend/dist/src/services/auth/auth.service.js.map` | Build artifact | Compiled or packaged artifact: auth.service.js. | 1 |
| `apps/backend/dist/src/services/auth/strategies/facebook.strategy.js` | Build artifact | Compiled or packaged artifact: facebook.strategy. | 45 |
| `apps/backend/dist/src/services/auth/strategies/facebook.strategy.js.map` | Build artifact | Compiled or packaged artifact: facebook.strategy.js. | 1 |
| `apps/backend/dist/src/services/auth/strategies/google.strategy.js` | Build artifact | Compiled or packaged artifact: google.strategy. | 45 |
| `apps/backend/dist/src/services/auth/strategies/google.strategy.js.map` | Build artifact | Compiled or packaged artifact: google.strategy.js. | 1 |
| `apps/backend/dist/src/services/auth/strategies/jwt.strategy.js` | Build artifact | Compiled or packaged artifact: jwt.strategy. | 36 |
| `apps/backend/dist/src/services/auth/strategies/jwt.strategy.js.map` | Build artifact | Compiled or packaged artifact: jwt.strategy.js. | 1 |
| `apps/backend/dist/src/services/delivery/delivery.module.js` | Build artifact | Compiled or packaged artifact: delivery.module. | 26 |
| `apps/backend/dist/src/services/delivery/delivery.module.js.map` | Build artifact | Compiled or packaged artifact: delivery.module.js. | 1 |
| `apps/backend/dist/src/services/delivery/delivery.service.js` | Build artifact | Compiled or packaged artifact: delivery.service. | 157 |
| `apps/backend/dist/src/services/delivery/delivery.service.js.map` | Build artifact | Compiled or packaged artifact: delivery.service.js. | 1 |
| `apps/backend/dist/src/services/delivery/driver-onboarding.service.js` | Build artifact | Compiled or packaged artifact: driver onboarding.service. | 171 |
| `apps/backend/dist/src/services/delivery/driver-onboarding.service.js.map` | Build artifact | Compiled or packaged artifact: driver onboarding.service.js. | 1 |
| `apps/backend/dist/src/services/delivery/driver-ops.controller.js` | Build artifact | Compiled or packaged artifact: driver ops.controller. | 131 |
| `apps/backend/dist/src/services/delivery/driver-ops.controller.js.map` | Build artifact | Compiled or packaged artifact: driver ops.controller.js. | 1 |
| `apps/backend/dist/src/services/delivery/driver-ops.module.js` | Build artifact | Compiled or packaged artifact: driver ops.module. | 32 |
| `apps/backend/dist/src/services/delivery/driver-ops.module.js.map` | Build artifact | Compiled or packaged artifact: driver ops.module.js. | 1 |
| `apps/backend/dist/src/services/delivery/driver-payout.service.js` | Build artifact | Compiled or packaged artifact: driver payout.service. | 148 |
| `apps/backend/dist/src/services/delivery/driver-payout.service.js.map` | Build artifact | Compiled or packaged artifact: driver payout.service.js. | 1 |
| `apps/backend/dist/src/services/delivery/enhanced-delivery.module.js` | Build artifact | Compiled or packaged artifact: enhanced delivery.module. | 26 |
| `apps/backend/dist/src/services/delivery/enhanced-delivery.module.js.map` | Build artifact | Compiled or packaged artifact: enhanced delivery.module.js. | 1 |
| `apps/backend/dist/src/services/delivery/enhanced-delivery.service.js` | Build artifact | Compiled or packaged artifact: enhanced delivery.service. | 336 |
| `apps/backend/dist/src/services/delivery/enhanced-delivery.service.js.map` | Build artifact | Compiled or packaged artifact: enhanced delivery.service.js. | 1 |
| `apps/backend/dist/src/services/delivery/heatmap.service.js` | Build artifact | Compiled or packaged artifact: heatmap.service. | 161 |
| `apps/backend/dist/src/services/delivery/heatmap.service.js.map` | Build artifact | Compiled or packaged artifact: heatmap.service.js. | 1 |
| `apps/backend/dist/src/services/driver-fleet/driver-fleet.controller.js` | Build artifact | Compiled or packaged artifact: driver fleet.controller. | 157 |
| `apps/backend/dist/src/services/driver-fleet/driver-fleet.controller.js.map` | Build artifact | Compiled or packaged artifact: driver fleet.controller.js. | 1 |
| `apps/backend/dist/src/services/driver-fleet/driver-fleet.module.js` | Build artifact | Compiled or packaged artifact: driver fleet.module. | 27 |
| `apps/backend/dist/src/services/driver-fleet/driver-fleet.module.js.map` | Build artifact | Compiled or packaged artifact: driver fleet.module.js. | 1 |
| `apps/backend/dist/src/services/driver-fleet/driver-fleet.service.js` | Build artifact | Compiled or packaged artifact: driver fleet.service. | 248 |
| `apps/backend/dist/src/services/driver-fleet/driver-fleet.service.js.map` | Build artifact | Compiled or packaged artifact: driver fleet.service.js. | 1 |
| `apps/backend/dist/src/services/finance/finance.controller.js` | Build artifact | Compiled or packaged artifact: finance.controller. | 88 |
| `apps/backend/dist/src/services/finance/finance.controller.js.map` | Build artifact | Compiled or packaged artifact: finance.controller.js. | 1 |
| `apps/backend/dist/src/services/finance/finance.module.js` | Build artifact | Compiled or packaged artifact: finance.module. | 28 |
| `apps/backend/dist/src/services/finance/finance.module.js.map` | Build artifact | Compiled or packaged artifact: finance.module.js. | 1 |
| `apps/backend/dist/src/services/finance/reconciliation.service.js` | Build artifact | Compiled or packaged artifact: reconciliation.service. | 179 |
| `apps/backend/dist/src/services/finance/reconciliation.service.js.map` | Build artifact | Compiled or packaged artifact: reconciliation.service.js. | 1 |
| `apps/backend/dist/src/services/finance/tax-reporting.service.js` | Build artifact | Compiled or packaged artifact: tax reporting.service. | 165 |
| `apps/backend/dist/src/services/finance/tax-reporting.service.js.map` | Build artifact | Compiled or packaged artifact: tax reporting.service.js. | 1 |
| `apps/backend/dist/src/services/geo/enhanced-geo.service.js` | Build artifact | Compiled or packaged artifact: enhanced geo.service. | 318 |
| `apps/backend/dist/src/services/geo/enhanced-geo.service.js.map` | Build artifact | Compiled or packaged artifact: enhanced geo.service.js. | 1 |
| `apps/backend/dist/src/services/geo/geo.module.js` | Build artifact | Compiled or packaged artifact: geo.module. | 23 |
| `apps/backend/dist/src/services/geo/geo.module.js.map` | Build artifact | Compiled or packaged artifact: geo.module.js. | 1 |
| `apps/backend/dist/src/services/geo/geo.service.js` | Build artifact | Compiled or packaged artifact: geo.service. | 141 |
| `apps/backend/dist/src/services/geo/geo.service.js.map` | Build artifact | Compiled or packaged artifact: geo.service.js. | 1 |
| `apps/backend/dist/src/services/gst/gst.controller.js` | Build artifact | Compiled or packaged artifact: gst.controller. | 81 |
| `apps/backend/dist/src/services/gst/gst.controller.js.map` | Build artifact | Compiled or packaged artifact: gst.controller.js. | 1 |
| `apps/backend/dist/src/services/gst/gst.module.js` | Build artifact | Compiled or packaged artifact: gst.module. | 27 |
| `apps/backend/dist/src/services/gst/gst.module.js.map` | Build artifact | Compiled or packaged artifact: gst.module.js. | 1 |
| `apps/backend/dist/src/services/gst/gst.service.js` | Build artifact | Compiled or packaged artifact: gst.service. | 316 |
| `apps/backend/dist/src/services/gst/gst.service.js.map` | Build artifact | Compiled or packaged artifact: gst.service.js. | 1 |
| `apps/backend/dist/src/services/loyalty/loyalty.controller.js` | Build artifact | Compiled or packaged artifact: loyalty.controller. | 144 |
| `apps/backend/dist/src/services/loyalty/loyalty.controller.js.map` | Build artifact | Compiled or packaged artifact: loyalty.controller.js. | 1 |
| `apps/backend/dist/src/services/loyalty/loyalty.module.js` | Build artifact | Compiled or packaged artifact: loyalty.module. | 27 |
| `apps/backend/dist/src/services/loyalty/loyalty.module.js.map` | Build artifact | Compiled or packaged artifact: loyalty.module.js. | 1 |
| `apps/backend/dist/src/services/loyalty/loyalty.service.js` | Build artifact | Compiled or packaged artifact: loyalty.service. | 275 |
| `apps/backend/dist/src/services/loyalty/loyalty.service.js.map` | Build artifact | Compiled or packaged artifact: loyalty.service.js. | 1 |
| `apps/backend/dist/src/services/maps/maps.controller.js` | Build artifact | Compiled or packaged artifact: maps.controller. | 108 |
| `apps/backend/dist/src/services/maps/maps.controller.js.map` | Build artifact | Compiled or packaged artifact: maps.controller.js. | 1 |
| `apps/backend/dist/src/services/maps/maps.module.js` | Build artifact | Compiled or packaged artifact: maps.module. | 25 |
| `apps/backend/dist/src/services/maps/maps.module.js.map` | Build artifact | Compiled or packaged artifact: maps.module.js. | 1 |
| `apps/backend/dist/src/services/maps/maps.service.js` | Build artifact | Compiled or packaged artifact: maps.service. | 198 |
| `apps/backend/dist/src/services/maps/maps.service.js.map` | Build artifact | Compiled or packaged artifact: maps.service.js. | 1 |
| `apps/backend/dist/src/services/menu-customization/menu-customization.controller.js` | Build artifact | Compiled or packaged artifact: menu customization.controller. | 70 |
| `apps/backend/dist/src/services/menu-customization/menu-customization.controller.js.map` | Build artifact | Compiled or packaged artifact: menu customization.controller.js. | 1 |
| `apps/backend/dist/src/services/menu-customization/menu-customization.module.js` | Build artifact | Compiled or packaged artifact: menu customization.module. | 25 |
| `apps/backend/dist/src/services/menu-customization/menu-customization.module.js.map` | Build artifact | Compiled or packaged artifact: menu customization.module.js. | 1 |
| `apps/backend/dist/src/services/menu-customization/menu-customization.service.js` | Build artifact | Compiled or packaged artifact: menu customization.service. | 99 |
| `apps/backend/dist/src/services/menu-customization/menu-customization.service.js.map` | Build artifact | Compiled or packaged artifact: menu customization.service.js. | 1 |
| `apps/backend/dist/src/services/notifications/device.controller.js` | Build artifact | Compiled or packaged artifact: device.controller. | 65 |
| `apps/backend/dist/src/services/notifications/device.controller.js.map` | Build artifact | Compiled or packaged artifact: device.controller.js. | 1 |
| `apps/backend/dist/src/services/notifications/notification-preferences.controller.js` | Build artifact | Compiled or packaged artifact: notification preferences.controller. | 54 |
| `apps/backend/dist/src/services/notifications/notification-preferences.controller.js.map` | Build artifact | Compiled or packaged artifact: notification preferences.controller.js. | 1 |
| `apps/backend/dist/src/services/notifications/notification-preferences.service.js` | Build artifact | Compiled or packaged artifact: notification preferences.service. | 59 |
| `apps/backend/dist/src/services/notifications/notification-preferences.service.js.map` | Build artifact | Compiled or packaged artifact: notification preferences.service.js. | 1 |
| `apps/backend/dist/src/services/notifications/notification.module.js` | Build artifact | Compiled or packaged artifact: notification.module. | 31 |
| `apps/backend/dist/src/services/notifications/notification.module.js.map` | Build artifact | Compiled or packaged artifact: notification.module.js. | 1 |
| `apps/backend/dist/src/services/notifications/notification.service.js` | Build artifact | Compiled or packaged artifact: notification.service. | 296 |
| `apps/backend/dist/src/services/notifications/notification.service.js.map` | Build artifact | Compiled or packaged artifact: notification.service.js. | 1 |
| `apps/backend/dist/src/services/notifications/production-notification.service.js` | Build artifact | Compiled or packaged artifact: production notification.service. | 194 |
| `apps/backend/dist/src/services/notifications/production-notification.service.js.map` | Build artifact | Compiled or packaged artifact: production notification.service.js. | 1 |
| `apps/backend/dist/src/services/notifications/queue/notification-queue.controller.js` | Build artifact | Compiled or packaged artifact: notification queue.controller. | 151 |
| `apps/backend/dist/src/services/notifications/queue/notification-queue.controller.js.map` | Build artifact | Compiled or packaged artifact: notification queue.controller.js. | 1 |
| `apps/backend/dist/src/services/notifications/queue/notification-queue.module.js` | Build artifact | Compiled or packaged artifact: notification queue.module. | 29 |
| `apps/backend/dist/src/services/notifications/queue/notification-queue.module.js.map` | Build artifact | Compiled or packaged artifact: notification queue.module.js. | 1 |
| `apps/backend/dist/src/services/notifications/queue/notification-queue.service.js` | Build artifact | Compiled or packaged artifact: notification queue.service. | 202 |
| `apps/backend/dist/src/services/notifications/queue/notification-queue.service.js.map` | Build artifact | Compiled or packaged artifact: notification queue.service.js. | 1 |
| `apps/backend/dist/src/services/order/order.controller.js` | Build artifact | Compiled or packaged artifact: order.controller. | 49 |
| `apps/backend/dist/src/services/order/order.controller.js.map` | Build artifact | Compiled or packaged artifact: order.controller.js. | 1 |
| `apps/backend/dist/src/services/order/order.module.js` | Build artifact | Compiled or packaged artifact: order.module. | 29 |
| `apps/backend/dist/src/services/order/order.module.js.map` | Build artifact | Compiled or packaged artifact: order.module.js. | 1 |
| `apps/backend/dist/src/services/order/order.service.js` | Build artifact | Compiled or packaged artifact: order.service. | 451 |
| `apps/backend/dist/src/services/order/order.service.js.map` | Build artifact | Compiled or packaged artifact: order.service.js. | 1 |
| `apps/backend/dist/src/services/order/order.service.spec.js` | Build artifact | Compiled or packaged artifact: order.service.spec. | 316 |
| `apps/backend/dist/src/services/order/order.service.spec.js.map` | Build artifact | Compiled or packaged artifact: order.service.spec.js. | 1 |
| `apps/backend/dist/src/services/payment-provider/driver-payout-provider.service.js` | Build artifact | Compiled or packaged artifact: driver payout provider.service. | 156 |
| `apps/backend/dist/src/services/payment-provider/driver-payout-provider.service.js.map` | Build artifact | Compiled or packaged artifact: driver payout provider.service.js. | 1 |
| `apps/backend/dist/src/services/payment-provider/payment-provider.controller.js` | Build artifact | Compiled or packaged artifact: payment provider.controller. | 152 |
| `apps/backend/dist/src/services/payment-provider/payment-provider.controller.js.map` | Build artifact | Compiled or packaged artifact: payment provider.controller.js. | 1 |
| `apps/backend/dist/src/services/payment-provider/payment-provider.module.js` | Build artifact | Compiled or packaged artifact: payment provider.module. | 41 |
| `apps/backend/dist/src/services/payment-provider/payment-provider.module.js.map` | Build artifact | Compiled or packaged artifact: payment provider.module.js. | 1 |
| `apps/backend/dist/src/services/payment-provider/razorpay-settlement.service.js` | Build artifact | Compiled or packaged artifact: razorpay settlement.service. | 241 |
| `apps/backend/dist/src/services/payment-provider/razorpay-settlement.service.js.map` | Build artifact | Compiled or packaged artifact: razorpay settlement.service.js. | 1 |
| `apps/backend/dist/src/services/payment-provider/stripe-connect.service.js` | Build artifact | Compiled or packaged artifact: stripe connect.service. | 275 |
| `apps/backend/dist/src/services/payment-provider/stripe-connect.service.js.map` | Build artifact | Compiled or packaged artifact: stripe connect.service.js. | 1 |
| `apps/backend/dist/src/services/payments/chargeback/chargeback.controller.js` | Build artifact | Compiled or packaged artifact: chargeback.controller. | 120 |
| `apps/backend/dist/src/services/payments/chargeback/chargeback.controller.js.map` | Build artifact | Compiled or packaged artifact: chargeback.controller.js. | 1 |
| `apps/backend/dist/src/services/payments/chargeback/chargeback.module.js` | Build artifact | Compiled or packaged artifact: chargeback.module. | 29 |
| `apps/backend/dist/src/services/payments/chargeback/chargeback.module.js.map` | Build artifact | Compiled or packaged artifact: chargeback.module.js. | 1 |
| `apps/backend/dist/src/services/payments/chargeback/chargeback.service.js` | Build artifact | Compiled or packaged artifact: chargeback.service. | 234 |
| `apps/backend/dist/src/services/payments/chargeback/chargeback.service.js.map` | Build artifact | Compiled or packaged artifact: chargeback.service.js. | 1 |
| `apps/backend/dist/src/services/payments/cod.service.js` | Build artifact | Compiled or packaged artifact: cod.service. | 44 |
| `apps/backend/dist/src/services/payments/cod.service.js.map` | Build artifact | Compiled or packaged artifact: cod.service.js. | 1 |
| `apps/backend/dist/src/services/payments/fraud-hardening.service.js` | Build artifact | Compiled or packaged artifact: fraud hardening.service. | 215 |
| `apps/backend/dist/src/services/payments/fraud-hardening.service.js.map` | Build artifact | Compiled or packaged artifact: fraud hardening.service.js. | 1 |
| `apps/backend/dist/src/services/payments/fraud-hardening.service.spec.js` | Build artifact | Compiled or packaged artifact: fraud hardening.service.spec. | 85 |
| `apps/backend/dist/src/services/payments/fraud-hardening.service.spec.js.map` | Build artifact | Compiled or packaged artifact: fraud hardening.service.spec.js. | 1 |
| `apps/backend/dist/src/services/payments/gateway-factory.service.js` | Build artifact | Compiled or packaged artifact: gateway factory.service. | 61 |
| `apps/backend/dist/src/services/payments/gateway-factory.service.js.map` | Build artifact | Compiled or packaged artifact: gateway factory.service.js. | 1 |
| `apps/backend/dist/src/services/payments/gateways/cod-gateway.service.js` | Build artifact | Compiled or packaged artifact: cod gateway.service. | 84 |
| `apps/backend/dist/src/services/payments/gateways/cod-gateway.service.js.map` | Build artifact | Compiled or packaged artifact: cod gateway.service.js. | 1 |
| `apps/backend/dist/src/services/payments/gateways/payment-gateway.interface.js` | Build artifact | Compiled or packaged artifact: payment gateway.interface. | 3 |
| `apps/backend/dist/src/services/payments/gateways/payment-gateway.interface.js.map` | Build artifact | Compiled or packaged artifact: payment gateway.interface.js. | 1 |
| `apps/backend/dist/src/services/payments/gateways/razorpay-gateway.service.js` | Build artifact | Compiled or packaged artifact: razorpay gateway.service. | 215 |
| `apps/backend/dist/src/services/payments/gateways/razorpay-gateway.service.js.map` | Build artifact | Compiled or packaged artifact: razorpay gateway.service.js. | 1 |
| `apps/backend/dist/src/services/payments/gateways/stripe-gateway.service.js` | Build artifact | Compiled or packaged artifact: stripe gateway.service. | 132 |
| `apps/backend/dist/src/services/payments/gateways/stripe-gateway.service.js.map` | Build artifact | Compiled or packaged artifact: stripe gateway.service.js. | 1 |
| `apps/backend/dist/src/services/payments/idempotency.entity.js` | Build artifact | Compiled or packaged artifact: idempotency.entity. | 71 |
| `apps/backend/dist/src/services/payments/idempotency.entity.js.map` | Build artifact | Compiled or packaged artifact: idempotency.entity.js. | 1 |
| `apps/backend/dist/src/services/payments/idempotency.service.js` | Build artifact | Compiled or packaged artifact: idempotency.service. | 73 |
| `apps/backend/dist/src/services/payments/idempotency.service.js.map` | Build artifact | Compiled or packaged artifact: idempotency.service.js. | 1 |
| `apps/backend/dist/src/services/payments/payment-event.entity.js` | Build artifact | Compiled or packaged artifact: payment event.entity. | 57 |
| `apps/backend/dist/src/services/payments/payment-event.entity.js.map` | Build artifact | Compiled or packaged artifact: payment event.entity.js. | 1 |
| `apps/backend/dist/src/services/payments/payment-fraud.entity.js` | Build artifact | Compiled or packaged artifact: payment fraud.entity. | 76 |
| `apps/backend/dist/src/services/payments/payment-fraud.entity.js.map` | Build artifact | Compiled or packaged artifact: payment fraud.entity.js. | 1 |
| `apps/backend/dist/src/services/payments/payment-hardening.service.js` | Build artifact | Compiled or packaged artifact: payment hardening.service. | 322 |
| `apps/backend/dist/src/services/payments/payment-hardening.service.js.map` | Build artifact | Compiled or packaged artifact: payment hardening.service.js. | 1 |
| `apps/backend/dist/src/services/payments/payment-validation.entity.js` | Build artifact | Compiled or packaged artifact: payment validation.entity. | 61 |
| `apps/backend/dist/src/services/payments/payment-validation.entity.js.map` | Build artifact | Compiled or packaged artifact: payment validation.entity.js. | 1 |
| `apps/backend/dist/src/services/payments/payment.types.js` | Build artifact | Compiled or packaged artifact: payment.types. | 3 |
| `apps/backend/dist/src/services/payments/payment.types.js.map` | Build artifact | Compiled or packaged artifact: payment.types.js. | 1 |
| `apps/backend/dist/src/services/payments/payments.controller.js` | Build artifact | Compiled or packaged artifact: payments.controller. | 160 |
| `apps/backend/dist/src/services/payments/payments.controller.js.map` | Build artifact | Compiled or packaged artifact: payments.controller.js. | 1 |
| `apps/backend/dist/src/services/payments/payments.module.js` | Build artifact | Compiled or packaged artifact: payments.module. | 61 |
| `apps/backend/dist/src/services/payments/payments.module.js.map` | Build artifact | Compiled or packaged artifact: payments.module.js. | 1 |
| `apps/backend/dist/src/services/payments/payments.service.js` | Build artifact | Compiled or packaged artifact: payments.service. | 132 |
| `apps/backend/dist/src/services/payments/payments.service.js.map` | Build artifact | Compiled or packaged artifact: payments.service.js. | 1 |
| `apps/backend/dist/src/services/payments/retry.service.js` | Build artifact | Compiled or packaged artifact: retry.service. | 147 |
| `apps/backend/dist/src/services/payments/retry.service.js.map` | Build artifact | Compiled or packaged artifact: retry.service.js. | 1 |
| `apps/backend/dist/src/services/payments/webhook/webhook-retry.module.js` | Build artifact | Compiled or packaged artifact: webhook retry.module. | 23 |
| `apps/backend/dist/src/services/payments/webhook/webhook-retry.module.js.map` | Build artifact | Compiled or packaged artifact: webhook retry.module.js. | 1 |
| `apps/backend/dist/src/services/payments/webhook/webhook-retry.service.js` | Build artifact | Compiled or packaged artifact: webhook retry.service. | 129 |
| `apps/backend/dist/src/services/payments/webhook/webhook-retry.service.js.map` | Build artifact | Compiled or packaged artifact: webhook retry.service.js. | 1 |
| `apps/backend/dist/src/services/payments/webhook/webhook.controller.js` | Build artifact | Compiled or packaged artifact: webhook.controller. | 60 |
| `apps/backend/dist/src/services/payments/webhook/webhook.controller.js.map` | Build artifact | Compiled or packaged artifact: webhook.controller.js. | 1 |
| `apps/backend/dist/src/services/payments/webhook/webhook.module.js` | Build artifact | Compiled or packaged artifact: webhook.module. | 36 |
| `apps/backend/dist/src/services/payments/webhook/webhook.module.js.map` | Build artifact | Compiled or packaged artifact: webhook.module.js. | 1 |
| `apps/backend/dist/src/services/payments/webhook/webhook.service.js` | Build artifact | Compiled or packaged artifact: webhook.service. | 476 |
| `apps/backend/dist/src/services/payments/webhook/webhook.service.js.map` | Build artifact | Compiled or packaged artifact: webhook.service.js. | 1 |
| `apps/backend/dist/src/services/privacy/data-privacy.service.js` | Build artifact | Compiled or packaged artifact: data privacy.service. | 134 |
| `apps/backend/dist/src/services/privacy/data-privacy.service.js.map` | Build artifact | Compiled or packaged artifact: data privacy.service.js. | 1 |
| `apps/backend/dist/src/services/refund/refund.controller.js` | Build artifact | Compiled or packaged artifact: refund.controller. | 191 |
| `apps/backend/dist/src/services/refund/refund.controller.js.map` | Build artifact | Compiled or packaged artifact: refund.controller.js. | 1 |
| `apps/backend/dist/src/services/refund/refund.module.js` | Build artifact | Compiled or packaged artifact: refund.module. | 33 |
| `apps/backend/dist/src/services/refund/refund.module.js.map` | Build artifact | Compiled or packaged artifact: refund.module.js. | 1 |
| `apps/backend/dist/src/services/refund/refund.service.js` | Build artifact | Compiled or packaged artifact: refund.service. | 349 |
| `apps/backend/dist/src/services/refund/refund.service.js.map` | Build artifact | Compiled or packaged artifact: refund.service.js. | 1 |
| `apps/backend/dist/src/services/restaurant/branch-management.service.js` | Build artifact | Compiled or packaged artifact: branch management.service. | 116 |
| `apps/backend/dist/src/services/restaurant/branch-management.service.js.map` | Build artifact | Compiled or packaged artifact: branch management.service.js. | 1 |
| `apps/backend/dist/src/services/restaurant/business-engine.controller.js` | Build artifact | Compiled or packaged artifact: business engine.controller. | 106 |
| `apps/backend/dist/src/services/restaurant/business-engine.controller.js.map` | Build artifact | Compiled or packaged artifact: business engine.controller.js. | 1 |
| `apps/backend/dist/src/services/restaurant/business-engine.service.js` | Build artifact | Compiled or packaged artifact: business engine.service. | 267 |
| `apps/backend/dist/src/services/restaurant/business-engine.service.js.map` | Build artifact | Compiled or packaged artifact: business engine.service.js. | 1 |
| `apps/backend/dist/src/services/restaurant/business.seeder.js` | Build artifact | Compiled or packaged artifact: business.seeder. | 160 |
| `apps/backend/dist/src/services/restaurant/business.seeder.js.map` | Build artifact | Compiled or packaged artifact: business.seeder.js. | 1 |
| `apps/backend/dist/src/services/restaurant/commission.service.js` | Build artifact | Compiled or packaged artifact: commission.service. | 116 |
| `apps/backend/dist/src/services/restaurant/commission.service.js.map` | Build artifact | Compiled or packaged artifact: commission.service.js. | 1 |
| `apps/backend/dist/src/services/restaurant/kds.gateway.js` | Build artifact | Compiled or packaged artifact: kds.gateway. | 58 |
| `apps/backend/dist/src/services/restaurant/kds.gateway.js.map` | Build artifact | Compiled or packaged artifact: kds.gateway.js. | 1 |
| `apps/backend/dist/src/services/restaurant/menu-moderation.service.js` | Build artifact | Compiled or packaged artifact: menu moderation.service. | 149 |
| `apps/backend/dist/src/services/restaurant/menu-moderation.service.js.map` | Build artifact | Compiled or packaged artifact: menu moderation.service.js. | 1 |
| `apps/backend/dist/src/services/restaurant/onboarding.controller.js` | Build artifact | Compiled or packaged artifact: onboarding.controller. | 190 |
| `apps/backend/dist/src/services/restaurant/onboarding.controller.js.map` | Build artifact | Compiled or packaged artifact: onboarding.controller.js. | 1 |
| `apps/backend/dist/src/services/restaurant/onboarding.service.js` | Build artifact | Compiled or packaged artifact: onboarding.service. | 193 |
| `apps/backend/dist/src/services/restaurant/onboarding.service.js.map` | Build artifact | Compiled or packaged artifact: onboarding.service.js. | 1 |
| `apps/backend/dist/src/services/restaurant/payout.service.js` | Build artifact | Compiled or packaged artifact: payout.service. | 160 |
| `apps/backend/dist/src/services/restaurant/payout.service.js.map` | Build artifact | Compiled or packaged artifact: payout.service.js. | 1 |
| `apps/backend/dist/src/services/restaurant/restaurant-ops.controller.js` | Build artifact | Compiled or packaged artifact: restaurant ops.controller. | 229 |
| `apps/backend/dist/src/services/restaurant/restaurant-ops.controller.js.map` | Build artifact | Compiled or packaged artifact: restaurant ops.controller.js. | 1 |
| `apps/backend/dist/src/services/restaurant/restaurant-ops.service.js` | Build artifact | Compiled or packaged artifact: restaurant ops.service. | 131 |
| `apps/backend/dist/src/services/restaurant/restaurant-ops.service.js.map` | Build artifact | Compiled or packaged artifact: restaurant ops.service.js. | 1 |
| `apps/backend/dist/src/services/restaurant/restaurant.controller.js` | Build artifact | Compiled or packaged artifact: restaurant.controller. | 87 |
| `apps/backend/dist/src/services/restaurant/restaurant.controller.js.map` | Build artifact | Compiled or packaged artifact: restaurant.controller.js. | 1 |
| `apps/backend/dist/src/services/restaurant/restaurant.module.js` | Build artifact | Compiled or packaged artifact: restaurant.module. | 55 |
| `apps/backend/dist/src/services/restaurant/restaurant.module.js.map` | Build artifact | Compiled or packaged artifact: restaurant.module.js. | 1 |
| `apps/backend/dist/src/services/restaurant/restaurant.service.js` | Build artifact | Compiled or packaged artifact: restaurant.service. | 95 |
| `apps/backend/dist/src/services/restaurant/restaurant.service.js.map` | Build artifact | Compiled or packaged artifact: restaurant.service.js. | 1 |
| `apps/backend/dist/src/services/review/review.controller.js` | Build artifact | Compiled or packaged artifact: review.controller. | 69 |
| `apps/backend/dist/src/services/review/review.controller.js.map` | Build artifact | Compiled or packaged artifact: review.controller.js. | 1 |
| `apps/backend/dist/src/services/review/review.module.js` | Build artifact | Compiled or packaged artifact: review.module. | 25 |
| `apps/backend/dist/src/services/review/review.module.js.map` | Build artifact | Compiled or packaged artifact: review.module.js. | 1 |
| `apps/backend/dist/src/services/review/review.service.js` | Build artifact | Compiled or packaged artifact: review.service. | 56 |
| `apps/backend/dist/src/services/review/review.service.js.map` | Build artifact | Compiled or packaged artifact: review.service.js. | 1 |
| `apps/backend/dist/src/services/search/search.controller.js` | Build artifact | Compiled or packaged artifact: search.controller. | 60 |
| `apps/backend/dist/src/services/search/search.controller.js.map` | Build artifact | Compiled or packaged artifact: search.controller.js. | 1 |
| `apps/backend/dist/src/services/search/search.module.js` | Build artifact | Compiled or packaged artifact: search.module. | 25 |
| `apps/backend/dist/src/services/search/search.module.js.map` | Build artifact | Compiled or packaged artifact: search.module.js. | 1 |
| `apps/backend/dist/src/services/search/search.service.js` | Build artifact | Compiled or packaged artifact: search.service. | 59 |
| `apps/backend/dist/src/services/search/search.service.js.map` | Build artifact | Compiled or packaged artifact: search.service.js. | 1 |
| `apps/backend/dist/src/services/support/customer-support.service.js` | Build artifact | Compiled or packaged artifact: customer support.service. | 191 |
| `apps/backend/dist/src/services/support/customer-support.service.js.map` | Build artifact | Compiled or packaged artifact: customer support.service.js. | 1 |
| `apps/backend/dist/src/services/support/support.controller.js` | Build artifact | Compiled or packaged artifact: support.controller. | 121 |
| `apps/backend/dist/src/services/support/support.controller.js.map` | Build artifact | Compiled or packaged artifact: support.controller.js. | 1 |
| `apps/backend/dist/src/services/support/support.module.js` | Build artifact | Compiled or packaged artifact: support.module. | 32 |
| `apps/backend/dist/src/services/support/support.module.js.map` | Build artifact | Compiled or packaged artifact: support.module.js. | 1 |
| `apps/backend/dist/src/services/support/ticket-routing.service.js` | Build artifact | Compiled or packaged artifact: ticket routing.service. | 156 |
| `apps/backend/dist/src/services/support/ticket-routing.service.js.map` | Build artifact | Compiled or packaged artifact: ticket routing.service.js. | 1 |
| `apps/backend/dist/src/services/user/user-profile.controller.js` | Build artifact | Compiled or packaged artifact: user profile.controller. | 126 |
| `apps/backend/dist/src/services/user/user-profile.controller.js.map` | Build artifact | Compiled or packaged artifact: user profile.controller.js. | 1 |
| `apps/backend/dist/src/services/user/user-profile.module.js` | Build artifact | Compiled or packaged artifact: user profile.module. | 25 |
| `apps/backend/dist/src/services/user/user-profile.module.js.map` | Build artifact | Compiled or packaged artifact: user profile.module.js. | 1 |
| `apps/backend/dist/src/services/user/user-profile.service.js` | Build artifact | Compiled or packaged artifact: user profile.service. | 106 |
| `apps/backend/dist/src/services/user/user-profile.service.js.map` | Build artifact | Compiled or packaged artifact: user profile.service.js. | 1 |
| `apps/backend/dist/src/services/users/address.controller.js` | Build artifact | Compiled or packaged artifact: address.controller. | 78 |
| `apps/backend/dist/src/services/users/address.controller.js.map` | Build artifact | Compiled or packaged artifact: address.controller.js. | 1 |
| `apps/backend/dist/src/services/users/address.service.js` | Build artifact | Compiled or packaged artifact: address.service. | 50 |
| `apps/backend/dist/src/services/users/address.service.js.map` | Build artifact | Compiled or packaged artifact: address.service.js. | 1 |
| `apps/backend/dist/src/services/users/payment-methods.controller.js` | Build artifact | Compiled or packaged artifact: payment methods.controller. | 78 |
| `apps/backend/dist/src/services/users/payment-methods.controller.js.map` | Build artifact | Compiled or packaged artifact: payment methods.controller.js. | 1 |
| `apps/backend/dist/src/services/users/payment-methods.service.js` | Build artifact | Compiled or packaged artifact: payment methods.service. | 50 |
| `apps/backend/dist/src/services/users/payment-methods.service.js.map` | Build artifact | Compiled or packaged artifact: payment methods.service.js. | 1 |
| `apps/backend/dist/src/services/users/user.module.js` | Build artifact | Compiled or packaged artifact: user.module. | 23 |
| `apps/backend/dist/src/services/users/user.module.js.map` | Build artifact | Compiled or packaged artifact: user.module.js. | 1 |
| `apps/backend/dist/src/services/wallet/wallet.controller.js` | Build artifact | Compiled or packaged artifact: wallet.controller. | 155 |
| `apps/backend/dist/src/services/wallet/wallet.controller.js.map` | Build artifact | Compiled or packaged artifact: wallet.controller.js. | 1 |
| `apps/backend/dist/src/services/wallet/wallet.module.js` | Build artifact | Compiled or packaged artifact: wallet.module. | 27 |
| `apps/backend/dist/src/services/wallet/wallet.module.js.map` | Build artifact | Compiled or packaged artifact: wallet.module.js. | 1 |
| `apps/backend/dist/src/services/wallet/wallet.service.js` | Build artifact | Compiled or packaged artifact: wallet.service. | 255 |
| `apps/backend/dist/src/services/wallet/wallet.service.js.map` | Build artifact | Compiled or packaged artifact: wallet.service.js. | 1 |
| `apps/backend/dist/src/services/wallet/wallet.service.spec.js` | Build artifact | Compiled or packaged artifact: wallet.service.spec. | 97 |
| `apps/backend/dist/src/services/wallet/wallet.service.spec.js.map` | Build artifact | Compiled or packaged artifact: wallet.service.spec.js. | 1 |
| `apps/backend/dist/src/shared/contracts/queues.js` | Build artifact | Compiled or packaged artifact: queues. | 11 |
| `apps/backend/dist/src/shared/contracts/queues.js.map` | Build artifact | Compiled or packaged artifact: queues.js. | 1 |
| `apps/backend/dist/src/shared/domain/order.interface.js` | Build artifact | Compiled or packaged artifact: order.interface. | 25 |
| `apps/backend/dist/src/shared/domain/order.interface.js.map` | Build artifact | Compiled or packaged artifact: order.interface.js. | 1 |
| `apps/backend/dist/src/shared/domain/user.interface.js` | Build artifact | Compiled or packaged artifact: user.interface. | 21 |
| `apps/backend/dist/src/shared/domain/user.interface.js.map` | Build artifact | Compiled or packaged artifact: user.interface.js. | 1 |
| `apps/backend/dist/test/__mocks__/typeorm.js` | Build artifact | Compiled or packaged artifact: typeorm. | 47 |
| `apps/backend/dist/test/__mocks__/typeorm.js.map` | Build artifact | Compiled or packaged artifact: typeorm.js. | 1 |
| `apps/backend/dist/test/__mocks__/typeorm.mock.js` | Build artifact | Compiled or packaged artifact: typeorm.mock. | 96 |
| `apps/backend/dist/test/__mocks__/typeorm.mock.js.map` | Build artifact | Compiled or packaged artifact: typeorm.mock.js. | 1 |
| `apps/backend/dist/test/auth.integration.spec.js` | Build artifact | Compiled or packaged artifact: auth.integration.spec. | 55 |
| `apps/backend/dist/test/auth.integration.spec.js.map` | Build artifact | Compiled or packaged artifact: auth.integration.spec.js. | 1 |
| `apps/backend/dist/test/auth.service.spec.js` | Build artifact | Compiled or packaged artifact: auth.service.spec. | 9 |
| `apps/backend/dist/test/auth.service.spec.js.map` | Build artifact | Compiled or packaged artifact: auth.service.spec.js. | 1 |
| `apps/backend/dist/test/compliance.service.spec.js` | Build artifact | Compiled or packaged artifact: compliance.service.spec. | 198 |
| `apps/backend/dist/test/compliance.service.spec.js.map` | Build artifact | Compiled or packaged artifact: compliance.service.spec.js. | 1 |
| `apps/backend/dist/test/db-migrate.spec.js` | Build artifact | Compiled or packaged artifact: db migrate.spec. | 171 |
| `apps/backend/dist/test/db-migrate.spec.js.map` | Build artifact | Compiled or packaged artifact: db migrate.spec.js. | 1 |
| `apps/backend/dist/test/delivery-edge-cases.spec.js` | Build artifact | Compiled or packaged artifact: delivery edge cases.spec. | 198 |
| `apps/backend/dist/test/delivery-edge-cases.spec.js.map` | Build artifact | Compiled or packaged artifact: delivery edge cases.spec.js. | 1 |
| `apps/backend/dist/test/delivery.integration.spec.js` | Build artifact | Compiled or packaged artifact: delivery.integration.spec. | 97 |
| `apps/backend/dist/test/delivery.integration.spec.js.map` | Build artifact | Compiled or packaged artifact: delivery.integration.spec.js. | 1 |
| `apps/backend/dist/test/delivery.service.spec.js` | Build artifact | Compiled or packaged artifact: delivery.service.spec. | 72 |
| `apps/backend/dist/test/delivery.service.spec.js.map` | Build artifact | Compiled or packaged artifact: delivery.service.spec.js. | 1 |
| `apps/backend/dist/test/driver-customer.integration.spec.js` | Build artifact | Compiled or packaged artifact: driver customer.integration.spec. | 70 |
| `apps/backend/dist/test/driver-customer.integration.spec.js.map` | Build artifact | Compiled or packaged artifact: driver customer.integration.spec.js. | 1 |
| `apps/backend/dist/test/e2e.spec.js` | Build artifact | Compiled or packaged artifact: e2e.spec. | 150 |
| `apps/backend/dist/test/e2e.spec.js.map` | Build artifact | Compiled or packaged artifact: e2e.spec.js. | 1 |
| `apps/backend/dist/test/jest-setup.js` | Build artifact | Compiled or packaged artifact: jest setup. | 94 |
| `apps/backend/dist/test/jest-setup.js.map` | Build artifact | Compiled or packaged artifact: jest setup.js. | 1 |
| `apps/backend/dist/test/kitchen.service.spec.js` | Build artifact | Compiled or packaged artifact: kitchen.service.spec. | 122 |
| `apps/backend/dist/test/kitchen.service.spec.js.map` | Build artifact | Compiled or packaged artifact: kitchen.service.spec.js. | 1 |
| `apps/backend/dist/test/loyalty-edge-cases.spec.js` | Build artifact | Compiled or packaged artifact: loyalty edge cases.spec. | 153 |
| `apps/backend/dist/test/loyalty-edge-cases.spec.js.map` | Build artifact | Compiled or packaged artifact: loyalty edge cases.spec.js. | 1 |
| `apps/backend/dist/test/mongo-connection.spec.js` | Build artifact | Compiled or packaged artifact: mongo connection.spec. | 97 |
| `apps/backend/dist/test/mongo-connection.spec.js.map` | Build artifact | Compiled or packaged artifact: mongo connection.spec.js. | 1 |
| `apps/backend/dist/test/nnotification.service.spec.js` | Build artifact | Compiled or packaged artifact: nnotification.service.spec. | 9 |
| `apps/backend/dist/test/nnotification.service.spec.js.map` | Build artifact | Compiled or packaged artifact: nnotification.service.spec.js. | 1 |
| `apps/backend/dist/test/order-edge-cases.spec.js` | Build artifact | Compiled or packaged artifact: order edge cases.spec. | 217 |
| `apps/backend/dist/test/order-edge-cases.spec.js.map` | Build artifact | Compiled or packaged artifact: order edge cases.spec.js. | 1 |
| `apps/backend/dist/test/order-flow.integration.spec.js` | Build artifact | Compiled or packaged artifact: order flow.integration.spec. | 114 |
| `apps/backend/dist/test/order-flow.integration.spec.js.map` | Build artifact | Compiled or packaged artifact: order flow.integration.spec.js. | 1 |
| `apps/backend/dist/test/order-kds.integration.spec.js` | Build artifact | Compiled or packaged artifact: order kds.integration.spec. | 37 |
| `apps/backend/dist/test/order-kds.integration.spec.js.map` | Build artifact | Compiled or packaged artifact: order kds.integration.spec.js. | 1 |
| `apps/backend/dist/test/order.service.spec.js` | Build artifact | Compiled or packaged artifact: order.service.spec. | 111 |
| `apps/backend/dist/test/order.service.spec.js.map` | Build artifact | Compiled or packaged artifact: order.service.spec.js. | 1 |
| `apps/backend/dist/test/payment-order.integration.spec.js` | Build artifact | Compiled or packaged artifact: payment order.integration.spec. | 45 |
| `apps/backend/dist/test/payment-order.integration.spec.js.map` | Build artifact | Compiled or packaged artifact: payment order.integration.spec.js. | 1 |
| `apps/backend/dist/test/payment-verification.e2e.spec.js` | Build artifact | Compiled or packaged artifact: payment verification.e2e.spec. | 237 |
| `apps/backend/dist/test/payment-verification.e2e.spec.js.map` | Build artifact | Compiled or packaged artifact: payment verification.e2e.spec.js. | 1 |
| `apps/backend/dist/test/payment.integration.spec.js` | Build artifact | Compiled or packaged artifact: payment.integration.spec. | 56 |
| `apps/backend/dist/test/payment.integration.spec.js.map` | Build artifact | Compiled or packaged artifact: payment.integration.spec.js. | 1 |
| `apps/backend/dist/test/payments.module.spec.js` | Build artifact | Compiled or packaged artifact: payments.module.spec. | 116 |
| `apps/backend/dist/test/payments.module.spec.js.map` | Build artifact | Compiled or packaged artifact: payments.module.spec.js. | 1 |
| `apps/backend/dist/test/payments.service.spec.js` | Build artifact | Compiled or packaged artifact: payments.service.spec. | 9 |
| `apps/backend/dist/test/payments.service.spec.js.map` | Build artifact | Compiled or packaged artifact: payments.service.spec.js. | 1 |
| `apps/backend/dist/test/refund-wallet.integration.spec.js` | Build artifact | Compiled or packaged artifact: refund wallet.integration.spec. | 59 |
| `apps/backend/dist/test/refund-wallet.integration.spec.js.map` | Build artifact | Compiled or packaged artifact: refund wallet.integration.spec.js. | 1 |
| `apps/backend/dist/test/reliability.failure-recovery.spec.js` | Build artifact | Compiled or packaged artifact: reliability.failure recovery.spec. | 595 |
| `apps/backend/dist/test/reliability.failure-recovery.spec.js.map` | Build artifact | Compiled or packaged artifact: reliability.failure recovery.spec.js. | 1 |
| `apps/backend/dist/test/wallet-edge-cases.spec.js` | Build artifact | Compiled or packaged artifact: wallet edge cases.spec. | 137 |
| `apps/backend/dist/test/wallet-edge-cases.spec.js.map` | Build artifact | Compiled or packaged artifact: wallet edge cases.spec.js. | 1 |
| `apps/backend/dist/tsconfig.tsbuildinfo` | Build artifact | Compiled or packaged artifact: tsconfig. | 1 |
| `apps/backend/jest.config.js` | JavaScript | Configuration source for jest.config. | 25 |
| `apps/backend/lint-full.txt` | Text | Text file: lint full. | 463 |
| `apps/backend/nest-cli.json` | JSON | JSON data file. | 8 |
| `apps/backend/package-lock.json` | JSON | JSON file. | 11,099 |
| `apps/backend/package.json` | Package manifest | Package manifest for `@spicegarden/backend` v0.0.0; 57 dependencies; scripts: start, dev, build, lint, test, test:watch, test:cov, test:unit, test:integration, test:e2e, test:load, test:load:20k, test:load:breaking, test:chaos, test:all, test:mongo. | 86 |
| `apps/backend/scripts/test-mongo.js` | JavaScript | Source file: test mongo. | 126 |
| `apps/backend/src/apis.controller.ts` | TypeScript | API controller: apis.controller. | 19 |
| `apps/backend/src/apis.module.ts` | TypeScript | NestJS module: apis.module. | 10 |
| `apps/backend/src/apis.service.ts` | TypeScript | Backend service: apis.service. | 13 |
| `apps/backend/src/app.controller.ts` | TypeScript | API controller: app.controller. | 18 |
| `apps/backend/src/app.http.module.ts` | TypeScript | NestJS module: app.http.module. | 37 |
| `apps/backend/src/app.module.ts` | TypeScript | NestJS module: app.module. | 77 |
| `apps/backend/src/app.service.ts` | TypeScript | Backend service: app.service. | 9 |
| `apps/backend/src/audit/audit.module.ts` | TypeScript | NestJS module: audit.module. | 8 |
| `apps/backend/src/audit/audit.service.ts` | TypeScript | Backend service: audit.service. | 275 |
| `apps/backend/src/common/errors/missing-env.error.ts` | TypeScript | Source file: missing env.error. | 32 |
| `apps/backend/src/compliance/compliance.controller.ts` | TypeScript | API controller: compliance.controller. | 223 |
| `apps/backend/src/compliance/compliance.module.ts` | TypeScript | NestJS module: compliance.module. | 17 |
| `apps/backend/src/compliance/compliance.service.ts` | TypeScript | Backend service: compliance.service. | 288 |
| `apps/backend/src/compliance/pci-dss-validation.service.ts` | TypeScript | Backend service: pci dss validation.service. | 294 |
| `apps/backend/src/compliance/secrets-rotation.service.ts` | TypeScript | Backend service: secrets rotation.service. | 135 |
| `apps/backend/src/compliance/soc2-readiness.service.ts` | TypeScript | Backend service: soc2 readiness.service. | 266 |
| `apps/backend/src/controllers/driver.controller.ts` | TypeScript | API controller: driver.controller. | 286 |
| `apps/backend/src/db/database-failover.service.ts` | TypeScript | Backend service: database failover.service. | 143 |
| `apps/backend/src/db/db.module.ts` | TypeScript | NestJS module: db.module. | 159 |
| `apps/backend/src/db/entities/address.entity.ts` | TypeScript | TypeORM entity: address.entity. | 45 |
| `apps/backend/src/db/entities/audit-log.entity.ts` | TypeScript | TypeORM entity: audit log.entity. | 31 |
| `apps/backend/src/db/entities/batch.entity.ts` | TypeScript | TypeORM entity: batch.entity. | 58 |
| `apps/backend/src/db/entities/branch-control.entity.ts` | TypeScript | TypeORM entity: branch control.entity. | 40 |
| `apps/backend/src/db/entities/commission-rule.entity.ts` | TypeScript | TypeORM entity: commission rule.entity. | 58 |
| `apps/backend/src/db/entities/coupon-usage.entity.ts` | TypeScript | TypeORM entity: coupon usage.entity. | 36 |
| `apps/backend/src/db/entities/coupon.entity.ts` | TypeScript | TypeORM entity: coupon.entity. | 99 |
| `apps/backend/src/db/entities/data-export-request.entity.ts` | TypeScript | TypeORM entity: data export request.entity. | 39 |
| `apps/backend/src/db/entities/deletion-request.entity.ts` | TypeScript | TypeORM entity: deletion request.entity. | 36 |
| `apps/backend/src/db/entities/delivery-sla.entity.ts` | TypeScript | TypeORM entity: delivery sla.entity. | 43 |
| `apps/backend/src/db/entities/device-fingerprint.entity.ts` | TypeScript | TypeORM entity: device fingerprint.entity. | 41 |
| `apps/backend/src/db/entities/dispute.entity.ts` | TypeScript | TypeORM entity: dispute.entity. | 89 |
| `apps/backend/src/db/entities/driver-assignment.entity.ts` | TypeScript | TypeORM entity: driver assignment.entity. | 60 |
| `apps/backend/src/db/entities/driver-document.entity.ts` | TypeScript | TypeORM entity: driver document.entity. | 56 |
| `apps/backend/src/db/entities/driver-fraud.entity.ts` | TypeScript | TypeORM entity: driver fraud.entity. | 54 |
| `apps/backend/src/db/entities/driver-incentive.entity.ts` | TypeScript | TypeORM entity: driver incentive.entity. | 59 |
| `apps/backend/src/db/entities/driver-penalty.entity.ts` | TypeScript | TypeORM entity: driver penalty.entity. | 73 |
| `apps/backend/src/db/entities/driver-score.entity.ts` | TypeScript | TypeORM entity: driver score.entity. | 49 |
| `apps/backend/src/db/entities/driver-shift.entity.ts` | TypeScript | TypeORM entity: driver shift.entity. | 49 |
| `apps/backend/src/db/entities/driver.entity.ts` | TypeScript | TypeORM entity: driver.entity. | 81 |
| `apps/backend/src/db/entities/food-prep.entity.ts` | TypeScript | TypeORM entity: food prep.entity. | 58 |
| `apps/backend/src/db/entities/gst-detail.entity.ts` | TypeScript | TypeORM entity: gst detail.entity. | 50 |
| `apps/backend/src/db/entities/holiday-schedule.entity.ts` | TypeScript | TypeORM entity: holiday schedule.entity. | 54 |
| `apps/backend/src/db/entities/hsn-sac.entity.ts` | TypeScript | TypeORM entity: hsn sac.entity. | 35 |
| `apps/backend/src/db/entities/inventory-alert.entity.ts` | TypeScript | TypeORM entity: inventory alert.entity. | 42 |
| `apps/backend/src/db/entities/inventory-item.entity.ts` | TypeScript | TypeORM entity: inventory item.entity. | 58 |
| `apps/backend/src/db/entities/kitchen-sla.entity.ts` | TypeScript | TypeORM entity: kitchen sla.entity. | 39 |
| `apps/backend/src/db/entities/ledger-entry.entity.ts` | TypeScript | TypeORM entity: ledger entry.entity. | 31 |
| `apps/backend/src/db/entities/menu-addon.entity.ts` | TypeScript | TypeORM entity: menu addon.entity. | 27 |
| `apps/backend/src/db/entities/menu-category.entity.ts` | TypeScript | TypeORM entity: menu category.entity. | 28 |
| `apps/backend/src/db/entities/menu-item-availability.entity.ts` | TypeScript | TypeORM entity: menu item availability.entity. | 42 |
| `apps/backend/src/db/entities/menu-item.entity.ts` | TypeScript | TypeORM entity: menu item.entity. | 50 |
| `apps/backend/src/db/entities/menu-moderation.entity.ts` | TypeScript | TypeORM entity: menu moderation.entity. | 75 |
| `apps/backend/src/db/entities/menu-variant.entity.ts` | TypeScript | TypeORM entity: menu variant.entity. | 30 |
| `apps/backend/src/db/entities/notification-analytics.entity.ts` | TypeScript | TypeORM entity: notification analytics.entity. | 48 |
| `apps/backend/src/db/entities/notification-preference.entity.ts` | TypeScript | TypeORM entity: notification preference.entity. | 40 |
| `apps/backend/src/db/entities/notification-status.enum.ts` | TypeScript | TypeORM entity: notification status.enum. | 11 |
| `apps/backend/src/db/entities/notification.entity.ts` | TypeScript | TypeORM entity: notification.entity. | 63 |
| `apps/backend/src/db/entities/order-item.entity.ts` | TypeScript | TypeORM entity: order item.entity. | 78 |
| `apps/backend/src/db/entities/order.entity.ts` | TypeScript | TypeORM entity: order.entity. | 83 |
| `apps/backend/src/db/entities/otp.entity.ts` | TypeScript | TypeORM entity: otp.entity. | 50 |
| `apps/backend/src/db/entities/payment-dispute.entity.ts` | TypeScript | TypeORM entity: payment dispute.entity. | 56 |
| `apps/backend/src/db/entities/payment-method.entity.ts` | TypeScript | TypeORM entity: payment method.entity. | 46 |
| `apps/backend/src/db/entities/payment-webhook.entity.ts` | TypeScript | TypeORM entity: payment webhook.entity. | 25 |
| `apps/backend/src/db/entities/payout-report.entity.ts` | TypeScript | TypeORM entity: payout report.entity. | 76 |
| `apps/backend/src/db/entities/recipe.entity.ts` | TypeScript | TypeORM entity: recipe.entity. | 59 |
| `apps/backend/src/db/entities/referral.entity.ts` | TypeScript | TypeORM entity: referral.entity. | 68 |
| `apps/backend/src/db/entities/refund-approval.entity.ts` | TypeScript | TypeORM entity: refund approval.entity. | 65 |
| `apps/backend/src/db/entities/refund.entity.ts` | TypeScript | TypeORM entity: refund.entity. | 80 |
| `apps/backend/src/db/entities/restaurant-branch.entity.ts` | TypeScript | TypeORM entity: restaurant branch.entity. | 58 |
| `apps/backend/src/db/entities/restaurant-gst.entity.ts` | TypeScript | TypeORM entity: restaurant gst.entity. | 53 |
| `apps/backend/src/db/entities/restaurant-onboarding.entity.ts` | TypeScript | TypeORM entity: restaurant onboarding.entity. | 91 |
| `apps/backend/src/db/entities/restaurant.entity.ts` | TypeScript | TypeORM entity: restaurant.entity. | 49 |
| `apps/backend/src/db/entities/session.entity.ts` | TypeScript | TypeORM entity: session.entity. | 40 |
| `apps/backend/src/db/entities/sla-alert.entity.ts` | TypeScript | TypeORM entity: sla alert.entity. | 45 |
| `apps/backend/src/db/entities/stripe-webhook.entity.ts` | TypeScript | TypeORM entity: stripe webhook.entity. | 19 |
| `apps/backend/src/db/entities/subscription.entity.ts` | TypeScript | TypeORM entity: subscription.entity. | 33 |
| `apps/backend/src/db/entities/supplier.entity.ts` | TypeScript | TypeORM entity: supplier.entity. | 36 |
| `apps/backend/src/db/entities/support-ticket.entity.ts` | TypeScript | TypeORM entity: support ticket.entity. | 136 |
| `apps/backend/src/db/entities/surge-zone.entity.ts` | TypeScript | TypeORM entity: surge zone.entity. | 31 |
| `apps/backend/src/db/entities/user-device.entity.ts` | TypeScript | TypeORM entity: user device.entity. | 43 |
| `apps/backend/src/db/entities/user.entity.ts` | TypeScript | TypeORM entity: user.entity. | 45 |
| `apps/backend/src/db/entities/wallet-transaction.entity.ts` | TypeScript | TypeORM entity: wallet transaction.entity. | 30 |
| `apps/backend/src/db/entities/wallet.entity.ts` | TypeScript | TypeORM entity: wallet.entity. | 27 |
| `apps/backend/src/db/entities/webhook-retry-queue.entity.ts` | TypeScript | TypeORM entity: webhook retry queue.entity. | 44 |
| `apps/backend/src/db/interfaces/database-adapter.interface.ts` | TypeScript | Source file: database adapter.interface. | 11 |
| `apps/backend/src/db/local-repository.module.ts` | TypeScript | NestJS module: local repository.module. | 166 |
| `apps/backend/src/db/mongo.adapter.ts` | TypeScript | Source file: mongo.adapter. | 37 |
| `apps/backend/src/db/postgres.adapter.ts` | TypeScript | Source file: postgres.adapter. | 32 |
| `apps/backend/src/db/redis.adapter.ts` | TypeScript | Source file: redis.adapter. | 102 |
| `apps/backend/src/db/schemas/review.schema.ts` | TypeScript | Database schema definition. | 26 |
| `apps/backend/src/gateway/gateway.module.ts` | TypeScript | NestJS module: gateway.module. | 5 |
| `apps/backend/src/grpc/auth.controller.ts` | TypeScript | API controller: auth.controller. | 15 |
| `apps/backend/src/grpc/grpc-app.module.ts` | TypeScript | NestJS module: grpc app.module. | 28 |
| `apps/backend/src/grpc/grpc.module.ts` | TypeScript | NestJS module: grpc.module. | 14 |
| `apps/backend/src/grpc/order.controller.ts` | TypeScript | API controller: order.controller. | 14 |
| `apps/backend/src/infra/observability/logger.service.ts` | TypeScript | Backend service: logger.service. | 62 |
| `apps/backend/src/infra/queue/order.processor.ts` | TypeScript | Source file: order.processor. | 31 |
| `apps/backend/src/infra/queue/queue.module.ts` | TypeScript | NestJS module: queue.module. | 11 |
| `apps/backend/src/infra/queue/queue.service.ts` | TypeScript | Backend service: queue.service. | 25 |
| `apps/backend/src/infra/secret-loader.service.ts` | TypeScript | Backend service: secret loader.service. | 83 |
| `apps/backend/src/infra/tracking/tracking.gateway.ts` | TypeScript | Socket.IO or API gateway file. | 292 |
| `apps/backend/src/infra/tracking/tracking.module.ts` | TypeScript | NestJS module: tracking.module. | 13 |
| `apps/backend/src/jobs/retention-job.ts` | TypeScript | Source file: retention job. | 51 |
| `apps/backend/src/legal/legal.controller.ts` | TypeScript | API controller: legal.controller. | 96 |
| `apps/backend/src/legal/legal.module.ts` | TypeScript | NestJS module: legal.module. | 7 |
| `apps/backend/src/local-dev.module.ts` | TypeScript | NestJS module: local dev.module. | 18 |
| `apps/backend/src/logging/logging.module.ts` | TypeScript | NestJS module: logging.module. | 14 |
| `apps/backend/src/logging/logging.service.ts` | TypeScript | Backend service: logging.service. | 94 |
| `apps/backend/src/main-grpc.ts` | TypeScript | Source file: main grpc. | 28 |
| `apps/backend/src/main.ts` | TypeScript | Source file: main. | 128 |
| `apps/backend/src/metrics/latency-metrics.interceptor.ts` | TypeScript | Source file: latency metrics.interceptor. | 35 |
| `apps/backend/src/metrics/metrics.controller.ts` | TypeScript | API controller: metrics.controller. | 12 |
| `apps/backend/src/metrics/metrics.module.ts` | TypeScript | NestJS module: metrics.module. | 9 |
| `apps/backend/src/metrics/metrics.service.ts` | TypeScript | Backend service: metrics.service. | 104 |
| `apps/backend/src/modules/analytics/analytics.controller.ts` | TypeScript | API controller: analytics.controller. | 61 |
| `apps/backend/src/modules/analytics/analytics.module.ts` | TypeScript | NestJS module: analytics.module. | 22 |
| `apps/backend/src/modules/analytics/analytics.service.ts` | TypeScript | Backend service: analytics.service. | 346 |
| `apps/backend/src/modules/auth/auth.module.ts` | TypeScript | NestJS module: auth.module. | 9 |
| `apps/backend/src/modules/driver-assignment/dispatch-engine.service.ts` | TypeScript | Backend service: dispatch engine.service. | 306 |
| `apps/backend/src/modules/driver-assignment/driver-assignment.controller.ts` | TypeScript | API controller: driver assignment.controller. | 189 |
| `apps/backend/src/modules/driver-assignment/driver-assignment.module.ts` | TypeScript | NestJS module: driver assignment.module. | 17 |
| `apps/backend/src/modules/driver-assignment/driver-assignment.service.ts` | TypeScript | Backend service: driver assignment.service. | 424 |
| `apps/backend/src/modules/driver-assignment/eta-intelligence.service.ts` | TypeScript | Backend service: eta intelligence.service. | 216 |
| `apps/backend/src/modules/kitchen/kitchen.controller.ts` | TypeScript | API controller: kitchen.controller. | 195 |
| `apps/backend/src/modules/kitchen/kitchen.module.ts` | TypeScript | NestJS module: kitchen.module. | 11 |
| `apps/backend/src/modules/kitchen/kitchen.service.ts` | TypeScript | Backend service: kitchen.service. | 949 |
| `apps/backend/src/modules/ledger/ledger.module.ts` | TypeScript | NestJS module: ledger.module. | 12 |
| `apps/backend/src/modules/ledger/ledger.service.ts` | TypeScript | Backend service: ledger.service. | 119 |
| `apps/backend/src/modules/notifications/notifications.module.ts` | TypeScript | NestJS module: notifications.module. | 15 |
| `apps/backend/src/modules/orders/orders.module.ts` | TypeScript | NestJS module: orders.module. | 9 |
| `apps/backend/src/modules/realtime/realtime.module.ts` | TypeScript | NestJS module: realtime.module. | 9 |
| `apps/backend/src/proto/admin/admin.proto` | Protocol Buffer | Protocol Buffer contract for admin. | 84 |
| `apps/backend/src/proto/analytics/analytics.proto` | Protocol Buffer | Protocol Buffer contract for analytics. | 75 |
| `apps/backend/src/proto/auth/auth.proto` | Protocol Buffer | Protocol Buffer contract for auth. | 56 |
| `apps/backend/src/proto/driver-assignment/driver-assignment.proto` | Protocol Buffer | Protocol Buffer contract for driver assignment. | 167 |
| `apps/backend/src/proto/driver-fleet/driver-fleet.proto` | Protocol Buffer | Protocol Buffer contract for driver fleet. | 108 |
| `apps/backend/src/proto/drivers/drivers.proto` | Protocol Buffer | Protocol Buffer contract for drivers. | 133 |
| `apps/backend/src/proto/loyalty/loyalty.proto` | Protocol Buffer | Protocol Buffer contract for loyalty. | 118 |
| `apps/backend/src/proto/notifications/notifications.proto` | Protocol Buffer | Protocol Buffer contract for notifications. | 111 |
| `apps/backend/src/proto/orders/orders.proto` | Protocol Buffer | Protocol Buffer contract for orders. | 96 |
| `apps/backend/src/proto/payments/payments.proto` | Protocol Buffer | Protocol Buffer contract for payments. | 58 |
| `apps/backend/src/proto/refunds/refunds.proto` | Protocol Buffer | Protocol Buffer contract for refunds. | 65 |
| `apps/backend/src/proto/restaurants/restaurants.proto` | Protocol Buffer | Protocol Buffer contract for restaurants. | 101 |
| `apps/backend/src/proto/search/search.proto` | Protocol Buffer | Protocol Buffer contract for search. | 36 |
| `apps/backend/src/proto/wallet/wallet.proto` | Protocol Buffer | Protocol Buffer contract for wallet. | 101 |
| `apps/backend/src/security/csrf.middleware.ts` | TypeScript | Express/Nest middleware: csrf.middleware. | 43 |
| `apps/backend/src/security/encryption.service.ts` | TypeScript | Backend service: encryption.service. | 60 |
| `apps/backend/src/security/encryption.service.ts.bak` | Backup copy | Backup copy of apps/backend/src/security/encryption.service.ts. | 60 |
| `apps/backend/src/security/jwt-auth.guard.ts` | TypeScript | Auth guard: jwt auth.guard. | 6 |
| `apps/backend/src/security/roles.decorator.ts` | TypeScript | Source file: roles.decorator. | 4 |
| `apps/backend/src/security/roles.guard.ts` | TypeScript | Auth guard: roles.guard. | 19 |
| `apps/backend/src/security/security.module.ts` | TypeScript | NestJS module: security.module. | 22 |
| `apps/backend/src/security/vault.service.ts` | TypeScript | Backend service: vault.service. | 153 |
| `apps/backend/src/services/admin/admin.controller.ts` | TypeScript | Service/helper module: admin.controller. | 28 |
| `apps/backend/src/services/admin/admin.module.ts` | TypeScript | Service/helper module: admin.module. | 20 |
| `apps/backend/src/services/admin/admin.service.ts` | TypeScript | Service/helper module: admin.service. | 117 |
| `apps/backend/src/services/ai/ai.controller.ts` | TypeScript | Service/helper module: ai.controller. | 26 |
| `apps/backend/src/services/ai/ai.module.ts` | TypeScript | Service/helper module: ai.module. | 18 |
| `apps/backend/src/services/ai/ai.service.ts` | TypeScript | Service/helper module: ai.service. | 81 |
| `apps/backend/src/services/auth/auth.controller.ts` | TypeScript | Service/helper module: auth.controller. | 57 |
| `apps/backend/src/services/auth/auth.module.ts` | TypeScript | Service/helper module: auth.module. | 50 |
| `apps/backend/src/services/auth/auth.service.ts` | TypeScript | Service/helper module: auth.service. | 72 |
| `apps/backend/src/services/auth/strategies/facebook.strategy.ts` | TypeScript | Service/helper module: facebook.strategy. | 28 |
| `apps/backend/src/services/auth/strategies/google.strategy.ts` | TypeScript | Service/helper module: google.strategy. | 28 |
| `apps/backend/src/services/auth/strategies/jwt.strategy.ts` | TypeScript | Service/helper module: jwt.strategy. | 20 |
| `apps/backend/src/services/delivery/delivery.module.ts` | TypeScript | Service/helper module: delivery.module. | 23 |
| `apps/backend/src/services/delivery/delivery.service.ts` | TypeScript | Service/helper module: delivery.service. | 147 |
| `apps/backend/src/services/delivery/driver-onboarding.service.ts` | TypeScript | Service/helper module: driver onboarding.service. | 184 |
| `apps/backend/src/services/delivery/driver-ops.controller.ts` | TypeScript | Service/helper module: driver ops.controller. | 67 |
| `apps/backend/src/services/delivery/driver-ops.module.ts` | TypeScript | Service/helper module: driver ops.module. | 26 |
| `apps/backend/src/services/delivery/driver-payout.service.ts` | TypeScript | Service/helper module: driver payout.service. | 152 |
| `apps/backend/src/services/delivery/enhanced-delivery.module.ts` | TypeScript | Service/helper module: enhanced delivery.module. | 18 |
| `apps/backend/src/services/delivery/enhanced-delivery.service.ts` | TypeScript | Service/helper module: enhanced delivery.service. | 414 |
| `apps/backend/src/services/delivery/heatmap.service.ts` | TypeScript | Service/helper module: heatmap.service. | 199 |
| `apps/backend/src/services/driver-fleet/driver-fleet.controller.ts` | TypeScript | Service/helper module: driver fleet.controller. | 79 |
| `apps/backend/src/services/driver-fleet/driver-fleet.module.ts` | TypeScript | Service/helper module: driver fleet.module. | 23 |
| `apps/backend/src/services/driver-fleet/driver-fleet.service.ts` | TypeScript | Service/helper module: driver fleet.service. | 225 |
| `apps/backend/src/services/finance/finance.controller.ts` | TypeScript | Service/helper module: finance.controller. | 62 |
| `apps/backend/src/services/finance/finance.module.ts` | TypeScript | Service/helper module: finance.module. | 24 |
| `apps/backend/src/services/finance/reconciliation.service.ts` | TypeScript | Service/helper module: reconciliation.service. | 173 |
| `apps/backend/src/services/finance/tax-reporting.service.ts` | TypeScript | Service/helper module: tax reporting.service. | 161 |
| `apps/backend/src/services/geo/enhanced-geo.service.ts` | TypeScript | Service/helper module: enhanced geo.service. | 483 |
| `apps/backend/src/services/geo/geo.module.ts` | TypeScript | Service/helper module: geo.module. | 15 |
| `apps/backend/src/services/geo/geo.service.ts` | TypeScript | Service/helper module: geo.service. | 165 |
| `apps/backend/src/services/gst/gst.controller.ts` | TypeScript | Service/helper module: gst.controller. | 40 |
| `apps/backend/src/services/gst/gst.module.ts` | TypeScript | Service/helper module: gst.module. | 23 |
| `apps/backend/src/services/gst/gst.service.ts` | TypeScript | Service/helper module: gst.service. | 377 |
| `apps/backend/src/services/loyalty/loyalty.controller.ts` | TypeScript | Service/helper module: loyalty.controller. | 73 |
| `apps/backend/src/services/loyalty/loyalty.module.ts` | TypeScript | Service/helper module: loyalty.module. | 22 |
| `apps/backend/src/services/loyalty/loyalty.service.ts` | TypeScript | Service/helper module: loyalty.service. | 258 |
| `apps/backend/src/services/maps/maps.controller.ts` | TypeScript | Service/helper module: maps.controller. | 73 |
| `apps/backend/src/services/maps/maps.module.ts` | TypeScript | Service/helper module: maps.module. | 17 |
| `apps/backend/src/services/maps/maps.service.ts` | TypeScript | Service/helper module: maps.service. | 252 |
| `apps/backend/src/services/menu-customization/menu-customization.controller.ts` | TypeScript | Service/helper module: menu customization.controller. | 30 |
| `apps/backend/src/services/menu-customization/menu-customization.module.ts` | TypeScript | Service/helper module: menu customization.module. | 16 |
| `apps/backend/src/services/menu-customization/menu-customization.service.ts` | TypeScript | Service/helper module: menu customization.service. | 83 |
| `apps/backend/src/services/notifications/device.controller.ts` | TypeScript | Service/helper module: device.controller. | 43 |
| `apps/backend/src/services/notifications/notification-preferences.controller.ts` | TypeScript | Service/helper module: notification preferences.controller. | 21 |
| `apps/backend/src/services/notifications/notification-preferences.service.ts` | TypeScript | Service/helper module: notification preferences.service. | 41 |
| `apps/backend/src/services/notifications/notification.module.ts` | TypeScript | Service/helper module: notification.module. | 24 |
| `apps/backend/src/services/notifications/notification.service.ts` | TypeScript | Service/helper module: notification.service. | 273 |
| `apps/backend/src/services/notifications/production-notification.service.ts` | TypeScript | Service/helper module: production notification.service. | 229 |
| `apps/backend/src/services/notifications/queue/notification-queue.controller.ts` | TypeScript | Service/helper module: notification queue.controller. | 122 |
| `apps/backend/src/services/notifications/queue/notification-queue.module.ts` | TypeScript | Service/helper module: notification queue.module. | 21 |
| `apps/backend/src/services/notifications/queue/notification-queue.service.ts` | TypeScript | Service/helper module: notification queue.service. | 262 |
| `apps/backend/src/services/order/order.controller.ts` | TypeScript | Service/helper module: order.controller. | 25 |
| `apps/backend/src/services/order/order.module.ts` | TypeScript | Service/helper module: order.module. | 20 |
| `apps/backend/src/services/order/order.service.spec.ts` | TypeScript | Test file for order.service.spec. | 373 |
| `apps/backend/src/services/order/order.service.ts` | TypeScript | Service/helper module: order.service. | 519 |
| `apps/backend/src/services/payment-provider/driver-payout-provider.service.ts` | TypeScript | Service/helper module: driver payout provider.service. | 165 |
| `apps/backend/src/services/payment-provider/payment-provider.controller.ts` | TypeScript | Service/helper module: payment provider.controller. | 114 |
| `apps/backend/src/services/payment-provider/payment-provider.module.ts` | TypeScript | Service/helper module: payment provider.module. | 35 |
| `apps/backend/src/services/payment-provider/razorpay-settlement.service.ts` | TypeScript | Service/helper module: razorpay settlement.service. | 291 |
| `apps/backend/src/services/payment-provider/stripe-connect.service.ts` | TypeScript | Service/helper module: stripe connect.service. | 315 |
| `apps/backend/src/services/payments/chargeback/chargeback.controller.ts` | TypeScript | Service/helper module: chargeback.controller. | 100 |
| `apps/backend/src/services/payments/chargeback/chargeback.module.ts` | TypeScript | Service/helper module: chargeback.module. | 23 |
| `apps/backend/src/services/payments/chargeback/chargeback.service.ts` | TypeScript | Service/helper module: chargeback.service. | 248 |
| `apps/backend/src/services/payments/cod.service.ts` | TypeScript | Service/helper module: cod.service. | 57 |
| `apps/backend/src/services/payments/fraud-hardening.service.spec.ts` | TypeScript | Test file for fraud hardening.service.spec. | 99 |
| `apps/backend/src/services/payments/fraud-hardening.service.ts` | TypeScript | Service/helper module: fraud hardening.service. | 257 |
| `apps/backend/src/services/payments/gateway-factory.service.ts` | TypeScript | Service/helper module: gateway factory.service. | 52 |
| `apps/backend/src/services/payments/gateways/cod-gateway.service.ts` | TypeScript | Service/helper module: cod gateway.service. | 100 |
| `apps/backend/src/services/payments/gateways/payment-gateway.interface.ts` | TypeScript | Service/helper module: payment gateway.interface. | 12 |
| `apps/backend/src/services/payments/gateways/razorpay-gateway.service.ts` | TypeScript | Service/helper module: razorpay gateway.service. | 205 |
| `apps/backend/src/services/payments/gateways/stripe-gateway.service.ts` | TypeScript | Service/helper module: stripe gateway.service. | 145 |
| `apps/backend/src/services/payments/idempotency.entity.ts` | TypeScript | Service/helper module: idempotency.entity. | 36 |
| `apps/backend/src/services/payments/idempotency.service.ts` | TypeScript | Service/helper module: idempotency.service. | 77 |
| `apps/backend/src/services/payments/payment-event.entity.ts` | TypeScript | Service/helper module: payment event.entity. | 28 |
| `apps/backend/src/services/payments/payment-fraud.entity.ts` | TypeScript | Service/helper module: payment fraud.entity. | 46 |
| `apps/backend/src/services/payments/payment-hardening.service.ts` | TypeScript | Service/helper module: payment hardening.service. | 431 |
| `apps/backend/src/services/payments/payment-validation.entity.ts` | TypeScript | Service/helper module: payment validation.entity. | 30 |
| `apps/backend/src/services/payments/payment.types.ts` | TypeScript | Service/helper module: payment.types. | 32 |
| `apps/backend/src/services/payments/payments.controller.ts` | TypeScript | Service/helper module: payments.controller. | 169 |
| `apps/backend/src/services/payments/payments.module.ts` | TypeScript | Service/helper module: payments.module. | 62 |
| `apps/backend/src/services/payments/payments.service.ts` | TypeScript | Service/helper module: payments.service. | 313 |
| `apps/backend/src/services/payments/retry.service.ts` | TypeScript | Service/helper module: retry.service. | 171 |
| `apps/backend/src/services/payments/webhook/webhook-retry.module.ts` | TypeScript | Service/helper module: webhook retry.module. | 12 |
| `apps/backend/src/services/payments/webhook/webhook-retry.service.ts` | TypeScript | Service/helper module: webhook retry.service. | 133 |
| `apps/backend/src/services/payments/webhook/webhook.controller.ts` | TypeScript | Service/helper module: webhook.controller. | 38 |
| `apps/backend/src/services/payments/webhook/webhook.module.ts` | TypeScript | Service/helper module: webhook.module. | 31 |
| `apps/backend/src/services/payments/webhook/webhook.service.ts` | TypeScript | Service/helper module: webhook.service. | 535 |
| `apps/backend/src/services/privacy/data-privacy.service.ts` | TypeScript | Service/helper module: data privacy.service. | 150 |
| `apps/backend/src/services/refund/refund.controller.ts` | TypeScript | Service/helper module: refund.controller. | 172 |
| `apps/backend/src/services/refund/refund.module.ts` | TypeScript | Service/helper module: refund.module. | 28 |
| `apps/backend/src/services/refund/refund.service.ts` | TypeScript | Service/helper module: refund.service. | 483 |
| `apps/backend/src/services/restaurant/branch-management.service.ts` | TypeScript | Service/helper module: branch management.service. | 115 |
| `apps/backend/src/services/restaurant/business-engine.controller.ts` | TypeScript | Service/helper module: business engine.controller. | 53 |
| `apps/backend/src/services/restaurant/business-engine.service.ts` | TypeScript | Service/helper module: business engine.service. | 311 |
| `apps/backend/src/services/restaurant/business.seeder.ts` | TypeScript | Service/helper module: business.seeder. | 180 |
| `apps/backend/src/services/restaurant/commission.service.ts` | TypeScript | Service/helper module: commission.service. | 116 |
| `apps/backend/src/services/restaurant/kds.gateway.ts` | TypeScript | Service/helper module: kds.gateway. | 45 |
| `apps/backend/src/services/restaurant/menu-moderation.service.ts` | TypeScript | Service/helper module: menu moderation.service. | 166 |
| `apps/backend/src/services/restaurant/onboarding.controller.ts` | TypeScript | Service/helper module: onboarding.controller. | 154 |
| `apps/backend/src/services/restaurant/onboarding.service.ts` | TypeScript | Service/helper module: onboarding.service. | 245 |
| `apps/backend/src/services/restaurant/payout.service.ts` | TypeScript | Service/helper module: payout.service. | 150 |
| `apps/backend/src/services/restaurant/restaurant-ops.controller.ts` | TypeScript | Service/helper module: restaurant ops.controller. | 129 |
| `apps/backend/src/services/restaurant/restaurant-ops.service.ts` | TypeScript | Service/helper module: restaurant ops.service. | 121 |
| `apps/backend/src/services/restaurant/restaurant.controller.ts` | TypeScript | Service/helper module: restaurant.controller. | 46 |
| `apps/backend/src/services/restaurant/restaurant.module.ts` | TypeScript | Service/helper module: restaurant.module. | 57 |
| `apps/backend/src/services/restaurant/restaurant.service.ts` | TypeScript | Service/helper module: restaurant.service. | 79 |
| `apps/backend/src/services/review/review.controller.ts` | TypeScript | Service/helper module: review.controller. | 29 |
| `apps/backend/src/services/review/review.module.ts` | TypeScript | Service/helper module: review.module. | 12 |
| `apps/backend/src/services/review/review.service.ts` | TypeScript | Service/helper module: review.service. | 39 |
| `apps/backend/src/services/search/search.controller.ts` | TypeScript | Service/helper module: search.controller. | 29 |
| `apps/backend/src/services/search/search.controller.ts.bak` | Backup copy | Backup copy of apps/backend/src/services/search/search.controller.ts. | 48 |
| `apps/backend/src/services/search/search.module.ts` | TypeScript | Service/helper module: search.module. | 16 |
| `apps/backend/src/services/search/search.service.ts` | TypeScript | Service/helper module: search.service. | 45 |
| `apps/backend/src/services/support/customer-support.service.ts` | TypeScript | Service/helper module: customer support.service. | 227 |
| `apps/backend/src/services/support/support.controller.ts` | TypeScript | Service/helper module: support.controller. | 59 |
| `apps/backend/src/services/support/support.module.ts` | TypeScript | Service/helper module: support.module. | 25 |
| `apps/backend/src/services/support/ticket-routing.service.ts` | TypeScript | Service/helper module: ticket routing.service. | 158 |
| `apps/backend/src/services/user/user-profile.controller.ts` | TypeScript | Service/helper module: user profile.controller. | 78 |
| `apps/backend/src/services/user/user-profile.module.ts` | TypeScript | Service/helper module: user profile.module. | 15 |
| `apps/backend/src/services/user/user-profile.service.ts` | TypeScript | Service/helper module: user profile.service. | 127 |
| `apps/backend/src/services/users/address.controller.ts` | TypeScript | Service/helper module: address.controller. | 33 |
| `apps/backend/src/services/users/address.service.ts` | TypeScript | Service/helper module: address.service. | 35 |
| `apps/backend/src/services/users/payment-methods.controller.ts` | TypeScript | Service/helper module: payment methods.controller. | 33 |
| `apps/backend/src/services/users/payment-methods.service.ts` | TypeScript | Service/helper module: payment methods.service. | 34 |
| `apps/backend/src/services/users/user.module.ts` | TypeScript | Service/helper module: user.module. | 13 |
| `apps/backend/src/services/wallet/wallet.controller.ts` | TypeScript | Service/helper module: wallet.controller. | 117 |
| `apps/backend/src/services/wallet/wallet.module.ts` | TypeScript | Service/helper module: wallet.module. | 17 |
| `apps/backend/src/services/wallet/wallet.service.spec.ts` | TypeScript | Test file for wallet.service.spec. | 109 |
| `apps/backend/src/services/wallet/wallet.service.ts` | TypeScript | Service/helper module: wallet.service. | 352 |
| `apps/backend/src/shared/contracts/queues.ts` | TypeScript | Source file: queues. | 8 |
| `apps/backend/src/shared/domain/order.interface.ts` | TypeScript | Source file: order.interface. | 41 |
| `apps/backend/src/shared/domain/user.interface.ts` | TypeScript | Source file: user.interface. | 33 |
| `apps/backend/src/types/crypto-js.d.ts` | TypeScript | Type declaration for crypto js.d. | 5 |
| `apps/backend/src/types/global.d.ts` | TypeScript | Type declaration for global.d. | 28 |
| `apps/backend/src/types/node.d.ts` | TypeScript | Type declaration for node.d. | 14 |
| `apps/backend/src/types/passport-facebook.d.ts` | TypeScript | Type declaration for passport facebook.d. | 17 |
| `apps/backend/src/types/passport-google-oauth20.d.ts` | TypeScript | Type declaration for passport google oauth20.d. | 17 |
| `apps/backend/src/types/passport-jwt.d.ts` | TypeScript | Type declaration for passport jwt.d. | 2 |
| `apps/backend/standalone-package.json` | JSON | JSON file. | 24 |
| `apps/backend/test/README.md` | Markdown | SpiceGarden Backend Test Suite — Comprehensive testing strategy targeting 80%+ code coverage. ```bash npm run test:unit ``` Services covered: - `order.service.spec.ts` - Order placement, payment confirmation, canc | 97 |
| `apps/backend/test/__mocks__/typeorm.mock.ts` | TypeScript | Test file for typeorm.mock. | 96 |
| `apps/backend/test/__mocks__/typeorm.ts` | TypeScript | Test file for typeorm. | 50 |
| `apps/backend/test/auth.integration.spec.js` | JavaScript | Test file for auth.integration.spec. | 55 |
| `apps/backend/test/auth.integration.spec.ts` | TypeScript | Test file for auth.integration.spec. | 65 |
| `apps/backend/test/auth.service.spec.ts` | TypeScript | Test file for auth.service.spec. | 8 |
| `apps/backend/test/chaos/PLAYBOOK.md` | Markdown | Chaos Testing Playbook — This playbook outlines chaos experiments for the SpiceGarden backend system. 1. Chaos Mesh installed: `kubectl apply -f https://mirrors.chaos-mesh.org/v2.5.0/install/manifests/crd/ | 128 |
| `apps/backend/test/chaos/chaos-payment-timeout.yaml` | YAML | YAML config with services: selector, delay. | 18 |
| `apps/backend/test/chaos/chaos-postgres-network-partition.yaml` | YAML | YAML config with services: selector, partition. | 20 |
| `apps/backend/test/chaos/chaos-postgres-pod-failure.yaml` | YAML | YAML config with services: selector, scheduler. | 15 |
| `apps/backend/test/chaos/chaos-redis-network-delay.yaml` | YAML | YAML config with services: selector, delay, scheduler. | 18 |
| `apps/backend/test/chaos/chaos-redis-pod-failure.yaml` | YAML | YAML config with services: selector, scheduler. | 15 |
| `apps/backend/test/chaos/chaos-websocket-delay.yaml` | YAML | YAML config with services: selector, delay, direction. | 20 |
| `apps/backend/test/compliance.service.spec.ts` | TypeScript | Test file for compliance.service.spec. | 231 |
| `apps/backend/test/db-migrate.spec.ts` | TypeScript | Test file for db migrate.spec. | 127 |
| `apps/backend/test/delivery-edge-cases.spec.ts` | TypeScript | Test file for delivery edge cases.spec. | 235 |
| `apps/backend/test/delivery.integration.spec.js` | JavaScript | Test file for delivery.integration.spec. | 97 |
| `apps/backend/test/delivery.integration.spec.ts` | TypeScript | Test file for delivery.integration.spec. | 112 |
| `apps/backend/test/delivery.service.spec.js` | JavaScript | Test file for delivery.service.spec. | 73 |
| `apps/backend/test/delivery.service.spec.ts` | TypeScript | Test file for delivery.service.spec. | 87 |
| `apps/backend/test/driver-assignment.service.spec.js` | JavaScript | Test file for driver assignment.service.spec. | 205 |
| `apps/backend/test/driver-customer.integration.spec.js` | JavaScript | Test file for driver customer.integration.spec. | 70 |
| `apps/backend/test/driver-customer.integration.spec.ts` | TypeScript | Test file for driver customer.integration.spec. | 82 |
| `apps/backend/test/driver-fleet.service.spec.js` | JavaScript | Test file for driver fleet.service.spec. | 257 |
| `apps/backend/test/e2e.spec.js` | JavaScript | Test file for e2e.spec. | 150 |
| `apps/backend/test/e2e.spec.ts` | TypeScript | Test file for e2e.spec. | 177 |
| `apps/backend/test/geo.service.spec.js` | JavaScript | Test file for geo.service.spec. | 197 |
| `apps/backend/test/jest-setup.js` | JavaScript | Test file for jest setup. | 100 |
| `apps/backend/test/jest-setup.ts` | TypeScript | Test file for jest setup. | 100 |
| `apps/backend/test/kitchen.service.spec.cjs` | JavaScript | Test file for kitchen.service.spec. | 341 |
| `apps/backend/test/kitchen.service.spec.js` | JavaScript | Test file for kitchen.service.spec. | 140 |
| `apps/backend/test/kitchen.service.spec.ts` | TypeScript | Test file for kitchen.service.spec. | 157 |
| `apps/backend/test/load/10k-users.js` | JavaScript | Test file for 10k users. | 95 |
| `apps/backend/test/load/1k-users.js` | JavaScript | Test file for 1k users. | 95 |
| `apps/backend/test/load/20k-users.js` | JavaScript | Test file for 20k users. | 78 |
| `apps/backend/test/load/5k-users.js` | JavaScript | Test file for 5k users. | 95 |
| `apps/backend/test/load/breaking-point.js` | JavaScript | Test file for breaking point. | 82 |
| `apps/backend/test/load/concurrent-users.js` | JavaScript | Test file for concurrent users. | 180 |
| `apps/backend/test/load/db-bottleneck.js` | JavaScript | Test file for db bottleneck. | 152 |
| `apps/backend/test/load/friday-dinner-rush.js` | JavaScript | Test file for friday dinner rush. | 131 |
| `apps/backend/test/load/order-placement-stress.js` | JavaScript | Test file for order placement stress. | 115 |
| `apps/backend/test/load/payment-spike.js` | JavaScript | Test file for payment spike. | 100 |
| `apps/backend/test/load/redis-saturation.js` | JavaScript | Test file for redis saturation. | 98 |
| `apps/backend/test/load/user-flow-10k.js` | JavaScript | Test file for user flow 10k. | 211 |
| `apps/backend/test/load/websocket-stress.js` | JavaScript | Test file for websocket stress. | 184 |
| `apps/backend/test/loyalty-edge-cases.spec.ts` | TypeScript | Test file for loyalty edge cases.spec. | 186 |
| `apps/backend/test/loyalty.service.spec.js` | JavaScript | Test file for loyalty.service.spec. | 289 |
| `apps/backend/test/maps.service.spec.js` | JavaScript | Test file for maps.service.spec. | 248 |
| `apps/backend/test/mongo-connection.spec.js` | JavaScript | Test file for mongo connection.spec. | 99 |
| `apps/backend/test/mongo-connection.spec.ts` | TypeScript | Test file for mongo connection.spec. | 111 |
| `apps/backend/test/nnotification.service.spec.ts` | TypeScript | Test file for nnotification.service.spec. | 8 |
| `apps/backend/test/notification.service.spec.js` | JavaScript | Test file for notification.service.spec. | 235 |
| `apps/backend/test/order-edge-cases.spec.ts` | TypeScript | Test file for order edge cases.spec. | 264 |
| `apps/backend/test/order-flow.integration.spec.js` | JavaScript | Test file for order flow.integration.spec. | 117 |
| `apps/backend/test/order-flow.integration.spec.ts` | TypeScript | Test file for order flow.integration.spec. | 135 |
| `apps/backend/test/order-kds.integration.spec.js` | JavaScript | Test file for order kds.integration.spec. | 37 |
| `apps/backend/test/order-kds.integration.spec.ts` | TypeScript | Test file for order kds.integration.spec. | 41 |
| `apps/backend/test/order.service.spec.js` | JavaScript | Test file for order.service.spec. | 231 |
| `apps/backend/test/order.service.spec.ts` | TypeScript | Test file for order.service.spec. | 139 |
| `apps/backend/test/payment-order.integration.spec.js` | JavaScript | Test file for payment order.integration.spec. | 46 |
| `apps/backend/test/payment-order.integration.spec.ts` | TypeScript | Test file for payment order.integration.spec. | 52 |
| `apps/backend/test/payment-verification.e2e.spec.ts` | TypeScript | Test file for payment verification.e2e.spec. | 277 |
| `apps/backend/test/payment.integration.spec.js` | JavaScript | Test file for payment.integration.spec. | 56 |
| `apps/backend/test/payment.integration.spec.ts` | TypeScript | Test file for payment.integration.spec. | 70 |
| `apps/backend/test/payments.module.spec.ts` | TypeScript | Test file for payments.module.spec. | 89 |
| `apps/backend/test/payments.service.spec.js` | JavaScript | Test file for payments.service.spec. | 186 |
| `apps/backend/test/payments.service.spec.ts` | TypeScript | Test file for payments.service.spec. | 8 |
| `apps/backend/test/refund-wallet.integration.spec.js` | JavaScript | Test file for refund wallet.integration.spec. | 59 |
| `apps/backend/test/refund-wallet.integration.spec.ts` | TypeScript | Test file for refund wallet.integration.spec. | 70 |
| `apps/backend/test/reliability.failure-recovery.spec.ts` | TypeScript | Test file for reliability.failure recovery.spec. | 702 |
| `apps/backend/test/tax-reporting.service.spec.js` | JavaScript | Test file for tax reporting.service.spec. | 192 |
| `apps/backend/test/wallet-edge-cases.spec.ts` | TypeScript | Test file for wallet edge cases.spec. | 164 |
| `apps/backend/test/wallet.service.spec.js` | JavaScript | Test file for wallet.service.spec. | 178 |
| `apps/backend/tsc-errors-current.txt` | Text | Text file: tsc errors current. | 465 |
| `apps/backend/tsc-errors.txt` | Text | Text file: tsc errors. | 501 |
| `apps/backend/tsconfig.build.json` | JSON | JSON configuration file. | 10 |
| `apps/backend/tsconfig.json` | JSON | TypeScript config; extends none; src/**/*, src/types/*.d.ts, test/**/*. | 22 |
| `apps/customer-mobile/.eslintrc.json` | JSON | JSON data file. | 25 |
| `apps/customer-mobile/.expo/README.md` | Markdown | README — > Why do I have a folder named ".expo" in my project? The ".expo" folder is created when an Expo project is started using "expo start" command. > What do the files contain? - "devi | 15 |
| `apps/customer-mobile/.expo/devices.json` | JSON | JSON data file. | 4 |
| `apps/customer-mobile/App.js` | JavaScript | Source file: App. | 55 |
| `apps/customer-mobile/App.tsx` | TypeScript | Source file: App. | 68 |
| `apps/customer-mobile/README.md` | Markdown | Customer Mobile — React Native app. Responsibilities: - Browse menu - Order food - Track order (timeline + live updates) - Subscription plans - Dining booking - Self pickup Tech (target): React Nati | 14 |
| `apps/customer-mobile/__tests__/App.test.js` | JavaScript | Test file for App.test. | 15 |
| `apps/customer-mobile/__tests__/App.test.tsx` | TypeScript | Test file for App.test. | 10 |
| `apps/customer-mobile/__tests__/auth-cart.integration.spec.js` | JavaScript | Test file for auth cart.integration.spec. | 52 |
| `apps/customer-mobile/__tests__/auth-cart.integration.spec.ts` | TypeScript | Test file for auth cart.integration.spec. | 63 |
| `apps/customer-mobile/__tests__/e2e-flow.test.js` | JavaScript | Test file for e2e flow.test. | 114 |
| `apps/customer-mobile/__tests__/e2e-flow.test.tsx` | TypeScript | Test file for e2e flow.test. | 138 |
| `apps/customer-mobile/__tests__/mobile-navigation.test.js` | JavaScript | Test file for mobile navigation.test. | 173 |
| `apps/customer-mobile/__tests__/screens/CartScreen.test.js` | JavaScript | Test file for Cart Screen.test. | 57 |
| `apps/customer-mobile/__tests__/screens/HomeScreen.test.js` | JavaScript | Test file for Home Screen.test. | 53 |
| `apps/customer-mobile/android/.gitignore` | Android | Android project file. | 20 |
| `apps/customer-mobile/android/app/build.gradle` | Android | Gradle Android build configuration. | 183 |
| `apps/customer-mobile/android/app/debug.keystore` | Android | Android signing keystore. | 9 |
| `apps/customer-mobile/android/app/proguard-rules.pro` | Android | ProGuard/R8 optimization rules. | 15 |
| `apps/customer-mobile/android/app/src/debug/AndroidManifest.xml` | Android | Android manifest file. | 8 |
| `apps/customer-mobile/android/app/src/debugOptimized/AndroidManifest.xml` | Android | Android manifest file. | 8 |
| `apps/customer-mobile/android/app/src/main/AndroidManifest.xml` | Android | Android manifest file. | 31 |
| `apps/customer-mobile/android/app/src/main/java/com/spicegarden/customer/MainActivity.kt` | Android | Kotlin Android source file. | 62 |
| `apps/customer-mobile/android/app/src/main/java/com/spicegarden/customer/MainApplication.kt` | Android | Kotlin Android source file. | 46 |
| `apps/customer-mobile/android/app/src/main/res/drawable-hdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 87 |
| `apps/customer-mobile/android/app/src/main/res/drawable-mdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 39 |
| `apps/customer-mobile/android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 112 |
| `apps/customer-mobile/android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 219 |
| `apps/customer-mobile/android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 291 |
| `apps/customer-mobile/android/app/src/main/res/drawable/ic_launcher_background.xml` | Android | Android resource file: ic launcher background. | 6 |
| `apps/customer-mobile/android/app/src/main/res/drawable/rn_edit_text_material.xml` | Android | Android resource file: rn edit text material. | 38 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 15 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 14 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 16 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 20 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 12 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 30 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 37 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 41 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 29 |
| `apps/customer-mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 61 |
| `apps/customer-mobile/android/app/src/main/res/values/colors.xml` | Android | Android resource file: colors. | 4 |
| `apps/customer-mobile/android/app/src/main/res/values/strings.xml` | Android | Android resource file: strings. | 4 |
| `apps/customer-mobile/android/app/src/main/res/values/styles.xml` | Android | Android resource file: styles. | 9 |
| `apps/customer-mobile/android/build.gradle` | Android | Gradle Android build configuration. | 25 |
| `apps/customer-mobile/android/gradle.properties` | Android | Android project file. | 62 |
| `apps/customer-mobile/android/gradle/wrapper/gradle-wrapper.jar` | Android | Android project file. | 148 |
| `apps/customer-mobile/android/gradle/wrapper/gradle-wrapper.properties` | Android | Android project file. | 8 |
| `apps/customer-mobile/android/gradlew` | Android | Android project file. | 249 |
| `apps/customer-mobile/android/gradlew.bat` | Android | Android project file. | 99 |
| `apps/customer-mobile/android/settings.gradle` | Android | Gradle Android build configuration. | 40 |
| `apps/customer-mobile/app.config.js` | JavaScript | Configuration source for app.config. | 50 |
| `apps/customer-mobile/babel.config.js` | JavaScript | Configuration source for babel.config. | 6 |
| `apps/customer-mobile/detox.config.js` | JavaScript | Configuration source for detox.config. | 41 |
| `apps/customer-mobile/e2e/App.e2e.test.js` | JavaScript | Test file for App.e2e.test. | 103 |
| `apps/customer-mobile/eas.json` | JSON | JSON data file. | 30 |
| `apps/customer-mobile/eslint.config.js` | JavaScript | Configuration source for eslint.config. | 9 |
| `apps/customer-mobile/index.js` | JavaScript | Source file: index. | 5 |
| `apps/customer-mobile/jest.config.js` | JavaScript | Configuration source for jest.config. | 12 |
| `apps/customer-mobile/jest.config.simple.js` | JavaScript | Configuration source for jest.config.simple. | 12 |
| `apps/customer-mobile/jest.setup.js` | JavaScript | Source file: jest.setup. | 5 |
| `apps/customer-mobile/metro.config.js` | JavaScript | Configuration source for metro.config. | 10 |
| `apps/customer-mobile/package.json` | Package manifest | Package manifest for `@spicegarden/customer-mobile` v1.0.0; 26 dependencies; scripts: start, start:ci, android, ios, build, lint, test:unit, test:integration, test:e2e, test:all. | 49 |
| `apps/customer-mobile/src/@types/module-declarations.d.ts` | TypeScript | NestJS module: module declarations.d. | 153 |
| `apps/customer-mobile/src/@types/react-navigation.d.ts` | TypeScript | Type declaration for react navigation.d. | 60 |
| `apps/customer-mobile/src/components/EmptyState.js` | JavaScript | UI component: Empty State. | 62 |
| `apps/customer-mobile/src/components/EmptyState.tsx` | TypeScript | UI component: Empty State. | 68 |
| `apps/customer-mobile/src/components/LoadingState.js` | JavaScript | UI component: Loading State. | 34 |
| `apps/customer-mobile/src/components/LoadingState.tsx` | TypeScript | UI component: Loading State. | 38 |
| `apps/customer-mobile/src/components/OrderCard.js` | JavaScript | UI component: Order Card. | 191 |
| `apps/customer-mobile/src/components/OrderCard.tsx` | TypeScript | UI component: Order Card. | 204 |
| `apps/customer-mobile/src/components/OrderTabs.js` | JavaScript | UI component: Order Tabs. | 57 |
| `apps/customer-mobile/src/components/OrderTabs.tsx` | TypeScript | UI component: Order Tabs. | 71 |
| `apps/customer-mobile/src/components/OrderTimeline.tsx` | TypeScript | UI component: Order Timeline. | 115 |
| `apps/customer-mobile/src/components/SkeletonLoader.js` | JavaScript | UI component: Skeleton Loader. | 16 |
| `apps/customer-mobile/src/components/SkeletonLoader.tsx` | TypeScript | UI component: Skeleton Loader. | 50 |
| `apps/customer-mobile/src/config.ts` | TypeScript | Configuration source for config. | 34 |
| `apps/customer-mobile/src/constants/api.ts` | TypeScript | Constants file for api. | 15 |
| `apps/customer-mobile/src/constants/i18n.js` | JavaScript | Constants file for i18n. | 103 |
| `apps/customer-mobile/src/constants/i18n.ts` | TypeScript | Constants file for i18n. | 81 |
| `apps/customer-mobile/src/constants/order.constants.js` | JavaScript | Constants file for order.constants. | 35 |
| `apps/customer-mobile/src/constants/order.constants.ts` | TypeScript | Constants file for order.constants. | 36 |
| `apps/customer-mobile/src/constants/storage.keys.js` | JavaScript | Constants file for storage.keys. | 13 |
| `apps/customer-mobile/src/constants/storage.keys.ts` | TypeScript | Constants file for storage.keys. | 13 |
| `apps/customer-mobile/src/constants/strings.js` | JavaScript | Constants file for strings. | 77 |
| `apps/customer-mobile/src/constants/strings.ts` | TypeScript | Constants file for strings. | 76 |
| `apps/customer-mobile/src/hooks/useHaptics.ts` | TypeScript | React hook: use Haptics. | 33 |
| `apps/customer-mobile/src/hooks/useOrderHistory.js` | JavaScript | React hook: use Order History. | 136 |
| `apps/customer-mobile/src/hooks/useOrderHistory.ts` | TypeScript | React hook: use Order History. | 106 |
| `apps/customer-mobile/src/navigation/types.js` | JavaScript | Type declaration for types. | 3 |
| `apps/customer-mobile/src/navigation/types.ts` | TypeScript | Type declaration for types. | 33 |
| `apps/customer-mobile/src/screens/AddressesScreen.tsx` | TypeScript | Mobile screen: Addresses Screen. | 354 |
| `apps/customer-mobile/src/screens/AuthScreen.js` | JavaScript | Mobile screen: Auth Screen. | 323 |
| `apps/customer-mobile/src/screens/AuthScreen.tsx` | TypeScript | Mobile screen: Auth Screen. | 345 |
| `apps/customer-mobile/src/screens/CartScreen.js` | JavaScript | Mobile screen: Cart Screen. | 254 |
| `apps/customer-mobile/src/screens/CartScreen.tsx` | TypeScript | Mobile screen: Cart Screen. | 310 |
| `apps/customer-mobile/src/screens/CheckoutScreen.js` | JavaScript | Mobile screen: Checkout Screen. | 438 |
| `apps/customer-mobile/src/screens/CheckoutScreen.tsx` | TypeScript | Mobile screen: Checkout Screen. | 522 |
| `apps/customer-mobile/src/screens/HistoryScreen.js` | JavaScript | Mobile screen: History Screen. | 180 |
| `apps/customer-mobile/src/screens/HistoryScreen.tsx` | TypeScript | Mobile screen: History Screen. | 217 |
| `apps/customer-mobile/src/screens/HomeScreen.js` | JavaScript | Mobile screen: Home Screen. | 256 |
| `apps/customer-mobile/src/screens/HomeScreen.tsx` | TypeScript | Mobile screen: Home Screen. | 109 |
| `apps/customer-mobile/src/screens/MenuItemCustomizationScreen.tsx` | TypeScript | Mobile screen: Menu Item Customization Screen. | 365 |
| `apps/customer-mobile/src/screens/NotificationsScreen.tsx` | TypeScript | Mobile screen: Notifications Screen. | 209 |
| `apps/customer-mobile/src/screens/OnboardingScreen.js` | JavaScript | Mobile screen: Onboarding Screen. | 313 |
| `apps/customer-mobile/src/screens/OnboardingScreen.tsx` | TypeScript | Mobile screen: Onboarding Screen. | 337 |
| `apps/customer-mobile/src/screens/OrderDetailsScreen.js` | JavaScript | Mobile screen: Order Details Screen. | 31 |
| `apps/customer-mobile/src/screens/OrderDetailsScreen.tsx` | TypeScript | Mobile screen: Order Details Screen. | 8 |
| `apps/customer-mobile/src/screens/PaymentMethodsScreen.tsx` | TypeScript | Mobile screen: Payment Methods Screen. | 355 |
| `apps/customer-mobile/src/screens/ProfileScreen.js` | JavaScript | Mobile screen: Profile Screen. | 464 |
| `apps/customer-mobile/src/screens/ProfileScreen.tsx` | TypeScript | Mobile screen: Profile Screen. | 526 |
| `apps/customer-mobile/src/screens/RestaurantScreen.js` | JavaScript | Mobile screen: Restaurant Screen. | 246 |
| `apps/customer-mobile/src/screens/RestaurantScreen.tsx` | TypeScript | Mobile screen: Restaurant Screen. | 87 |
| `apps/customer-mobile/src/screens/SearchScreen.js` | JavaScript | Mobile screen: Search Screen. | 480 |
| `apps/customer-mobile/src/screens/SearchScreen.tsx` | TypeScript | Mobile screen: Search Screen. | 554 |
| `apps/customer-mobile/src/screens/TrackingScreen.js` | JavaScript | Mobile screen: Tracking Screen. | 31 |
| `apps/customer-mobile/src/screens/TrackingScreen.tsx` | TypeScript | Mobile screen: Tracking Screen. | 58 |
| `apps/customer-mobile/src/services/order.service.js` | JavaScript | Service/helper module: order.service. | 168 |
| `apps/customer-mobile/src/services/order.service.ts` | TypeScript | Service/helper module: order.service. | 229 |
| `apps/customer-mobile/src/services/push-notification.service.ts` | TypeScript | Service/helper module: push notification.service. | 82 |
| `apps/customer-mobile/src/services/websocket.service.js` | JavaScript | Service/helper module: websocket.service. | 186 |
| `apps/customer-mobile/src/services/websocket.service.ts` | TypeScript | Service/helper module: websocket.service. | 226 |
| `apps/customer-mobile/src/storage/storageKeys.js` | JavaScript | Storage key/state module: storage Keys. | 10 |
| `apps/customer-mobile/src/storage/storageKeys.ts` | TypeScript | Storage key/state module: storage Keys. | 8 |
| `apps/customer-mobile/src/utils/currency.js` | JavaScript | Utility module: currency. | 38 |
| `apps/customer-mobile/src/utils/currency.ts` | TypeScript | Utility module: currency. | 35 |
| `apps/customer-mobile/src/utils/navigation.ts` | TypeScript | Utility module: navigation. | 74 |
| `apps/customer-mobile/src/utils/order.utils.js` | JavaScript | Utility module: order.utils. | 62 |
| `apps/customer-mobile/src/utils/order.utils.ts` | TypeScript | Utility module: order.utils. | 63 |
| `apps/customer-mobile/src/utils/safe-parse.js` | JavaScript | Utility module: safe parse. | 12 |
| `apps/customer-mobile/src/utils/safe-parse.ts` | TypeScript | Utility module: safe parse. | 8 |
| `apps/customer-mobile/src/utils/secure-storage.js` | JavaScript | Utility module: secure storage. | 159 |
| `apps/customer-mobile/src/utils/secure-storage.ts` | TypeScript | Utility module: secure storage. | 144 |
| `apps/customer-mobile/src/utils/validation.js` | JavaScript | Utility module: validation. | 98 |
| `apps/customer-mobile/src/utils/validation.ts` | TypeScript | Utility module: validation. | 98 |
| `apps/customer-mobile/trace.txt` | Text | Text file: trace. | 12,852 |
| `apps/customer-mobile/tsconfig.json` | JSON | TypeScript config; extends none; src/**/*.ts, src/**/*.tsx. | 34 |
| `apps/customer-web/.env.staging.local` | File | File: .env.staging. | 4 |
| `apps/customer-web/README.md` | Markdown | Customer Web — Next.js + React website (SEO-focused). Responsibilities: - Browse menu - Order food - Track order - Subscription plans - Dining booking - Self pickup Tech (target): Next.js, React | 14 |
| `apps/customer-web/eslint.config.js` | JavaScript | Configuration source for eslint.config. | 6 |
| `apps/customer-web/jest-dom.d.ts` | TypeScript | Type declaration for jest dom.d. | 2 |
| `apps/customer-web/jest-globals.d.ts` | TypeScript | Type declaration for jest globals.d. | 4 |
| `apps/customer-web/jest-setup.d.ts` | TypeScript | Type declaration for jest setup.d. | 12 |
| `apps/customer-web/jest.config.js` | JavaScript | Configuration source for jest.config. | 17 |
| `apps/customer-web/jest.setup.js` | JavaScript | Source file: jest.setup. | 2 |
| `apps/customer-web/jest.setup.ts` | TypeScript | Source file: jest.setup. | 14 |
| `apps/customer-web/next-env.d.ts` | TypeScript | Type declaration for next env.d. | 7 |
| `apps/customer-web/next.config.js` | JavaScript | Configuration source for next.config. | 18 |
| `apps/customer-web/package.json` | Package manifest | Package manifest for `@spicegarden/customer-web` v0.1.0; 26 dependencies; scripts: dev, build, start, lint, test:unit, test:integration, test:e2e, test:all. | 46 |
| `apps/customer-web/public/icons/.gitkeep` | File | File: .gitkeep. | 1 |
| `apps/customer-web/public/manifest.json` | JSON | JSON data file. | 46 |
| `apps/customer-web/sentry.client.config.ts` | TypeScript | Configuration source for sentry.client.config. | 12 |
| `apps/customer-web/sentry.config.ts` | TypeScript | Configuration source for sentry.config. | 10 |
| `apps/customer-web/sentry.d.ts` | TypeScript | Type declaration for sentry.d. | 16 |
| `apps/customer-web/src/analytics.ts` | TypeScript | Source file: analytics. | 22 |
| `apps/customer-web/src/components/ErrorBoundary.tsx` | TypeScript | UI component: Error Boundary. | 44 |
| `apps/customer-web/src/components/OfflineIndicator.js` | JavaScript | UI component: Offline Indicator. | 46 |
| `apps/customer-web/src/components/OfflineIndicator.tsx` | TypeScript | UI component: Offline Indicator. | 53 |
| `apps/customer-web/src/contexts/NetworkStatusContext.js` | JavaScript | React context provider: Network Status Context. | 58 |
| `apps/customer-web/src/contexts/NetworkStatusContext.tsx` | TypeScript | React context provider: Network Status Context. | 25 |
| `apps/customer-web/src/hooks/useAnimation.js` | JavaScript | React hook: use Animation. | 70 |
| `apps/customer-web/src/hooks/useAnimation.ts` | TypeScript | React hook: use Animation. | 69 |
| `apps/customer-web/src/hooks/useAuth.js` | JavaScript | React hook: use Auth. | 33 |
| `apps/customer-web/src/hooks/useAuth.ts` | TypeScript | React hook: use Auth. | 35 |
| `apps/customer-web/src/hooks/useMotion.js` | JavaScript | React hook: use Motion. | 23 |
| `apps/customer-web/src/hooks/useMotion.ts` | TypeScript | React hook: use Motion. | 24 |
| `apps/customer-web/src/hooks/useNetworkStatus.js` | JavaScript | React hook: use Network Status. | 28 |
| `apps/customer-web/src/hooks/useNetworkStatus.ts` | TypeScript | React hook: use Network Status. | 30 |
| `apps/customer-web/src/hooks/useOfflineQueue.js` | JavaScript | React hook: use Offline Queue. | 127 |
| `apps/customer-web/src/hooks/useOfflineQueue.ts` | TypeScript | React hook: use Offline Queue. | 155 |
| `apps/customer-web/src/hooks/useTracking.js` | JavaScript | React hook: use Tracking. | 43 |
| `apps/customer-web/src/hooks/useTracking.ts` | TypeScript | React hook: use Tracking. | 47 |
| `apps/customer-web/src/middleware.ts` | TypeScript | Express/Nest middleware: middleware. | 14 |
| `apps/customer-web/src/pages/_app.tsx` | TypeScript | Next.js page/route: app. | 22 |
| `apps/customer-web/src/pages/addresses.tsx` | TypeScript | Next.js page/route: addresses. | 219 |
| `apps/customer-web/src/pages/api/categories.ts` | TypeScript | Next.js API route: categories. | 13 |
| `apps/customer-web/src/pages/api/restaurants.ts` | TypeScript | Next.js API route: restaurants. | 32 |
| `apps/customer-web/src/pages/auth.tsx` | TypeScript | Next.js page/route: auth. | 187 |
| `apps/customer-web/src/pages/auth/callback.tsx` | TypeScript | Next.js page/route: callback. | 58 |
| `apps/customer-web/src/pages/cart.tsx` | TypeScript | Next.js page/route: cart. | 89 |
| `apps/customer-web/src/pages/checkout.tsx` | TypeScript | Next.js page/route: checkout. | 265 |
| `apps/customer-web/src/pages/history.tsx` | TypeScript | Next.js page/route: history. | 242 |
| `apps/customer-web/src/pages/index.module.css` | CSS | Styles for index.module. | 205 |
| `apps/customer-web/src/pages/index.tsx` | TypeScript | Next.js page/route: index. | 242 |
| `apps/customer-web/src/pages/legal/privacy.tsx` | TypeScript | Next.js page/route: privacy. | 97 |
| `apps/customer-web/src/pages/legal/terms.tsx` | TypeScript | Next.js page/route: terms. | 81 |
| `apps/customer-web/src/pages/menu.tsx` | TypeScript | Next.js page/route: menu. | 234 |
| `apps/customer-web/src/pages/notifications.tsx` | TypeScript | Next.js page/route: notifications. | 159 |
| `apps/customer-web/src/pages/offers.module.css` | CSS | Styles for offers.module. | 110 |
| `apps/customer-web/src/pages/offers.tsx` | TypeScript | Next.js page/route: offers. | 96 |
| `apps/customer-web/src/pages/order-details.tsx` | TypeScript | Next.js page/route: order details. | 292 |
| `apps/customer-web/src/pages/payment-methods.tsx` | TypeScript | Next.js page/route: payment methods. | 229 |
| `apps/customer-web/src/pages/profile.tsx` | TypeScript | Next.js page/route: profile. | 281 |
| `apps/customer-web/src/pages/reset-password.module.css` | CSS | Styles for reset password.module. | 68 |
| `apps/customer-web/src/pages/reset-password.tsx` | TypeScript | Next.js page/route: reset password. | 207 |
| `apps/customer-web/src/pages/restaurant.tsx` | TypeScript | Next.js page/route: restaurant. | 116 |
| `apps/customer-web/src/pages/search.tsx` | TypeScript | Next.js page/route: search. | 173 |
| `apps/customer-web/src/pages/subscriptions.module.css` | CSS | Styles for subscriptions.module. | 121 |
| `apps/customer-web/src/pages/subscriptions.tsx` | TypeScript | Next.js page/route: subscriptions. | 90 |
| `apps/customer-web/src/pages/tracking.module.css` | CSS | Styles for tracking.module. | 163 |
| `apps/customer-web/src/pages/tracking.tsx` | TypeScript | Next.js page/route: tracking. | 170 |
| `apps/customer-web/src/pages/wallet.tsx` | TypeScript | Next.js page/route: wallet. | 95 |
| `apps/customer-web/src/redux/slices/authSlice.js` | JavaScript | Redux state/store file: auth Slice. | 41 |
| `apps/customer-web/src/redux/slices/authSlice.ts` | TypeScript | Redux state/store file: auth Slice. | 59 |
| `apps/customer-web/src/redux/slices/cartSlice.js` | JavaScript | Redux state/store file: cart Slice. | 57 |
| `apps/customer-web/src/redux/slices/cartSlice.ts` | TypeScript | Redux state/store file: cart Slice. | 67 |
| `apps/customer-web/src/redux/store.js` | JavaScript | Redux state/store file: store. | 16 |
| `apps/customer-web/src/redux/store.ts` | TypeScript | Redux state/store file: store. | 19 |
| `apps/customer-web/src/types/sentry.d.ts` | TypeScript | Type declaration for sentry.d. | 17 |
| `apps/customer-web/test-setup.d.ts` | TypeScript | Type declaration for test setup.d. | 10 |
| `apps/customer-web/tsconfig.json` | JSON | TypeScript config; extends none; next-env.d.ts, **/*.ts, **/*.tsx, .next/types/**/*.ts. | 46 |
| `apps/customer-web/tsconfig.test.json` | JSON | TypeScript config; extends ./tsconfig.json; default include. | 15 |
| `apps/customer-web/tsconfig.tsbuildinfo` | TypeScript cache | TypeScript incremental build cache. | 1 |
| `apps/delivery-partner/.eslintrc.js` | JavaScript | Source file: .eslintrc. | 18 |
| `apps/delivery-partner/.expo/README.md` | Markdown | README — > Why do I have a folder named ".expo" in my project? The ".expo" folder is created when an Expo project is started using "expo start" command. > What do the files contain? - "devi | 15 |
| `apps/delivery-partner/.expo/devices.json` | JSON | JSON data file. | 4 |
| `apps/delivery-partner/.gitattributes` | Git attributes | Git attributes rule file. | 2 |
| `apps/delivery-partner/@types/geolocation.d.ts` | TypeScript | Type declaration for geolocation.d. | 31 |
| `apps/delivery-partner/App.tsx` | TypeScript | Source file: App. | 833 |
| `apps/delivery-partner/README.md` | Markdown | Delivery Partner App — React Native app. Responsibilities: - Accept orders - Navigation - Earnings tracking - Delivery proof Tech (target): React Native. | 12 |
| `apps/delivery-partner/android/.gitignore` | Android | Android project file. | 20 |
| `apps/delivery-partner/android/app/build.gradle` | Android | Gradle Android build configuration. | 183 |
| `apps/delivery-partner/android/app/debug.keystore` | Android | Android signing keystore. | 9 |
| `apps/delivery-partner/android/app/proguard-rules.pro` | Android | ProGuard/R8 optimization rules. | 15 |
| `apps/delivery-partner/android/app/src/debug/AndroidManifest.xml` | Android | Android manifest file. | 8 |
| `apps/delivery-partner/android/app/src/debugOptimized/AndroidManifest.xml` | Android | Android manifest file. | 8 |
| `apps/delivery-partner/android/app/src/main/AndroidManifest.xml` | Android | Android manifest file. | 31 |
| `apps/delivery-partner/android/app/src/main/java/com/spicegarden/driver/MainActivity.kt` | Android | Kotlin Android source file. | 62 |
| `apps/delivery-partner/android/app/src/main/java/com/spicegarden/driver/MainApplication.kt` | Android | Kotlin Android source file. | 46 |
| `apps/delivery-partner/android/app/src/main/res/drawable-hdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 87 |
| `apps/delivery-partner/android/app/src/main/res/drawable-mdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 39 |
| `apps/delivery-partner/android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 112 |
| `apps/delivery-partner/android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 219 |
| `apps/delivery-partner/android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png` | Android | Android resource file: splashscreen logo. | 291 |
| `apps/delivery-partner/android/app/src/main/res/drawable/ic_launcher_background.xml` | Android | Android resource file: ic launcher background. | 6 |
| `apps/delivery-partner/android/app/src/main/res/drawable/rn_edit_text_material.xml` | Android | Android resource file: rn edit text material. | 38 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-hdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 15 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 14 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-mdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 16 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 20 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-xhdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 12 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 30 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 37 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 41 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp` | Android | Android resource file: ic launcher. | 29 |
| `apps/delivery-partner/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.webp` | Android | Android resource file: ic launcher round. | 61 |
| `apps/delivery-partner/android/app/src/main/res/values/colors.xml` | Android | Android resource file: colors. | 4 |
| `apps/delivery-partner/android/app/src/main/res/values/strings.xml` | Android | Android resource file: strings. | 4 |
| `apps/delivery-partner/android/app/src/main/res/values/styles.xml` | Android | Android resource file: styles. | 9 |
| `apps/delivery-partner/android/build.gradle` | Android | Gradle Android build configuration. | 25 |
| `apps/delivery-partner/android/gradle.properties` | Android | Android project file. | 62 |
| `apps/delivery-partner/android/gradle/wrapper/gradle-wrapper.jar` | Android | Android project file. | 148 |
| `apps/delivery-partner/android/gradle/wrapper/gradle-wrapper.properties` | Android | Android project file. | 8 |
| `apps/delivery-partner/android/gradlew` | Android | Android project file. | 249 |
| `apps/delivery-partner/android/gradlew.bat` | Android | Android project file. | 99 |
| `apps/delivery-partner/android/settings.gradle` | Android | Gradle Android build configuration. | 40 |
| `apps/delivery-partner/app.config.js` | JavaScript | Configuration source for app.config. | 50 |
| `apps/delivery-partner/babel.config.js` | JavaScript | Configuration source for babel.config. | 6 |
| `apps/delivery-partner/detox.config.js` | JavaScript | Configuration source for detox.config. | 51 |
| `apps/delivery-partner/eas.json` | JSON | JSON data file. | 29 |
| `apps/delivery-partner/eslint.config.js` | JavaScript | Configuration source for eslint.config. | 9 |
| `apps/delivery-partner/index.js` | JavaScript | Source file: index. | 5 |
| `apps/delivery-partner/jest.config.js` | JavaScript | Configuration source for jest.config. | 15 |
| `apps/delivery-partner/jest.setup.js` | JavaScript | Source file: jest.setup. | 10 |
| `apps/delivery-partner/metro.config.js` | JavaScript | Configuration source for metro.config. | 8 |
| `apps/delivery-partner/package.json` | Package manifest | Package manifest for `@spicegarden/delivery-partner` v1.0.0; 14 dependencies; scripts: start, android, ios, web, build, lint, test:unit, test:integration, test:e2e, test:all. | 37 |
| `apps/delivery-partner/src/@types/module-declarations.d.ts` | TypeScript | NestJS module: module declarations.d. | 97 |
| `apps/delivery-partner/src/@types/react-navigation.d.ts` | TypeScript | Type declaration for react navigation.d. | 55 |
| `apps/delivery-partner/src/hooks/useDriverProfile.ts` | TypeScript | React hook: use Driver Profile. | 49 |
| `apps/delivery-partner/src/navigation/types.ts` | TypeScript | Type declaration for types. | 14 |
| `apps/delivery-partner/src/react-native-types.d.ts` | TypeScript | Type declaration for react native types.d. | 26 |
| `apps/delivery-partner/src/react-native.d.ts` | TypeScript | Type declaration for react native.d. | 28 |
| `apps/delivery-partner/src/screens/ActiveDeliveryScreen.tsx` | TypeScript | Mobile screen: Active Delivery Screen. | 484 |
| `apps/delivery-partner/src/screens/DeliveriesScreen.tsx` | TypeScript | Mobile screen: Deliveries Screen. | 393 |
| `apps/delivery-partner/src/screens/EarningsScreen.tsx` | TypeScript | Mobile screen: Earnings Screen. | 348 |
| `apps/delivery-partner/src/screens/HelpScreen.tsx` | TypeScript | Mobile screen: Help Screen. | 125 |
| `apps/delivery-partner/src/screens/HomeScreen.tsx` | TypeScript | Mobile screen: Home Screen. | 210 |
| `apps/delivery-partner/src/screens/LoginScreen.tsx` | TypeScript | Mobile screen: Login Screen. | 184 |
| `apps/delivery-partner/src/screens/MapScreen.tsx` | TypeScript | Mobile screen: Map Screen. | 223 |
| `apps/delivery-partner/src/screens/OnboardingScreen.tsx` | TypeScript | Mobile screen: Onboarding Screen. | 425 |
| `apps/delivery-partner/src/screens/PerformanceScreen.tsx` | TypeScript | Mobile screen: Performance Screen. | 161 |
| `apps/delivery-partner/src/screens/ProfileScreen.tsx` | TypeScript | Mobile screen: Profile Screen. | 352 |
| `apps/delivery-partner/src/screens/ShiftManagementScreen.tsx` | TypeScript | Mobile screen: Shift Management Screen. | 195 |
| `apps/delivery-partner/src/screens/index.ts` | TypeScript | Mobile screen: index. | 11 |
| `apps/delivery-partner/src/services/__tests/delivery-api.service.test.ts` | TypeScript | Test file for delivery api.service.test. | 38 |
| `apps/delivery-partner/src/services/delivery-api.service.ts` | TypeScript | Service/helper module: delivery api.service. | 337 |
| `apps/delivery-partner/src/services/storage.service.ts` | TypeScript | Service/helper module: storage.service. | 81 |
| `apps/delivery-partner/tsconfig.json` | JSON | TypeScript config; extends none; src/**/*.ts, src/**/*.tsx. | 24 |
| `apps/driver-app/App.js` | JavaScript | Source file: App. | 319 |
| `apps/driver-app/App.tsx` | TypeScript | Source file: App. | 361 |
| `apps/launcher/.eslintrc.json` | JSON | JSON data file. | 3 |
| `apps/launcher/ARCHITECTURE.md` | Markdown | SpiceGarden Launcher - Architecture Summary — - `main.ts` - Electron main process with window/tray management - `preload.ts` - Secure IPC bridge exposing APIs to renderer - `store-manager.ts` - Configuration and secrets persis | 74 |
| `apps/launcher/QUICKSTART.md` | Markdown | SpiceGarden Launcher - Quick Start — - [x] Windows 10/11 - [x] Docker Desktop - [x] Node.js 18+ - [x] 4GB+ RAM ```powershell cd apps\launcher npm install ``` ```powershell npm run generate-env ``` ```powershell npm ru | 52 |
| `apps/launcher/README.md` | Markdown | SpiceGarden Launcher — Enterprise Windows .exe launcher for the SpiceGarden Food Delivery Platform. ``` apps/launcher/ ├── package.json # Electron dependencies and build config ├── tsconfig.main.json # T | 190 |
| `apps/launcher/SETUP-GUIDE.md` | Markdown | SpiceGarden Launcher - Complete Setup Guide — ```powershell cd apps\launcher npm install ``` ```powershell node scripts\generate-icon.js ``` This creates a placeholder `assets\icon.ico`. Replace with your custom icon for produ | 72 |
| `apps/launcher/assets/ICON-README.md` | Markdown | SpiceGarden Launcher - Icons needed for Windows packaging — - `icon.ico` - Windows application icon (256x256, 128x128, 64x64, 48x48, 32x32, 16x16) 1. **Online ICO Generator**: Use https://icoconvert.com/ to convert PNG to ICO 2. **Command-l | 18 |
| `apps/launcher/assets/generate-icon.html` | HTML | HTML template for generate icon. | 38 |
| `apps/launcher/assets/icon.ico` | Image asset | Image asset: icon. | 1 |
| `apps/launcher/build/builder-debug.yml` | YAML | YAML config with services: firstOrDefaultFilePatterns, nodeModuleFilePatterns. | 20 |
| `apps/launcher/build/builder-effective-config.yaml` | YAML | YAML config with services: target. | 22 |
| `apps/launcher/build/win-unpacked/resources.pak` | Build artifact | Compiled or packaged artifact: resources. | 21,958 |
| `apps/launcher/build/win-unpacked/resources/app.asar` | Build artifact | Compiled or packaged artifact: app. | 267,202 |
| `apps/launcher/build/win-unpacked/snapshot_blob.bin` | Build artifact | Compiled or packaged artifact: snapshot blob. | 1,048 |
| `apps/launcher/build/win-unpacked/v8_context_snapshot.bin` | Build artifact | Compiled or packaged artifact: v8 context snapshot. | 2,953 |
| `apps/launcher/build/win-unpacked/vk_swiftshader.dll` | Build artifact | Compiled or packaged artifact: vk swiftshader. | 12,402 |
| `apps/launcher/build/win-unpacked/vk_swiftshader_icd.json` | JSON | JSON data file. | 1 |
| `apps/launcher/build/win-unpacked/vulkan-1.dll` | Build artifact | Compiled or packaged artifact: vulkan 1. | 2,470 |
| `apps/launcher/dist/main/auto-updater.d.ts` | Build artifact | Compiled or packaged artifact: auto updater.d. | 7 |
| `apps/launcher/dist/main/auto-updater.d.ts.map` | Build artifact | Compiled or packaged artifact: auto updater.d.ts. | 1 |
| `apps/launcher/dist/main/auto-updater.js` | Build artifact | Compiled or packaged artifact: auto updater. | 55 |
| `apps/launcher/dist/main/auto-updater.js.map` | Build artifact | Compiled or packaged artifact: auto updater.js. | 1 |
| `apps/launcher/dist/main/docker-manager.d.ts` | Build artifact | Compiled or packaged artifact: docker manager.d. | 30 |
| `apps/launcher/dist/main/docker-manager.d.ts.map` | Build artifact | Compiled or packaged artifact: docker manager.d.ts. | 1 |
| `apps/launcher/dist/main/docker-manager.js` | Build artifact | Compiled or packaged artifact: docker manager. | 164 |
| `apps/launcher/dist/main/docker-manager.js.map` | Build artifact | Compiled or packaged artifact: docker manager.js. | 1 |
| `apps/launcher/dist/main/environment-manager.d.ts` | Build artifact | Compiled or packaged artifact: environment manager.d. | 36 |
| `apps/launcher/dist/main/environment-manager.d.ts.map` | Build artifact | Compiled or packaged artifact: environment manager.d.ts. | 1 |
| `apps/launcher/dist/main/environment-manager.js` | Build artifact | Compiled or packaged artifact: environment manager. | 243 |
| `apps/launcher/dist/main/environment-manager.js.map` | Build artifact | Compiled or packaged artifact: environment manager.js. | 1 |
| `apps/launcher/dist/main/error-handler.d.ts` | Build artifact | Compiled or packaged artifact: error handler.d. | 23 |
| `apps/launcher/dist/main/error-handler.d.ts.map` | Build artifact | Compiled or packaged artifact: error handler.d.ts. | 1 |
| `apps/launcher/dist/main/error-handler.js` | Build artifact | Compiled or packaged artifact: error handler. | 124 |
| `apps/launcher/dist/main/error-handler.js.map` | Build artifact | Compiled or packaged artifact: error handler.js. | 1 |
| `apps/launcher/dist/main/main.d.ts` | Build artifact | Compiled or packaged artifact: main.d. | 2 |
| `apps/launcher/dist/main/main.d.ts.map` | Build artifact | Compiled or packaged artifact: main.d.ts. | 1 |
| `apps/launcher/dist/main/main.js` | Build artifact | Compiled or packaged artifact: main. | 245 |
| `apps/launcher/dist/main/main.js.map` | Build artifact | Compiled or packaged artifact: main.js. | 1 |
| `apps/launcher/dist/main/preload.d.ts` | Build artifact | Compiled or packaged artifact: preload.d. | 2 |
| `apps/launcher/dist/main/preload.d.ts.map` | Build artifact | Compiled or packaged artifact: preload.d.ts. | 1 |
| `apps/launcher/dist/main/preload.js` | Build artifact | Compiled or packaged artifact: preload. | 21 |
| `apps/launcher/dist/main/preload.js.map` | Build artifact | Compiled or packaged artifact: preload.js. | 1 |
| `apps/launcher/dist/main/process-manager.d.ts` | Build artifact | Compiled or packaged artifact: process manager.d. | 36 |
| `apps/launcher/dist/main/process-manager.d.ts.map` | Build artifact | Compiled or packaged artifact: process manager.d.ts. | 1 |
| `apps/launcher/dist/main/process-manager.js` | Build artifact | Compiled or packaged artifact: process manager. | 159 |
| `apps/launcher/dist/main/process-manager.js.map` | Build artifact | Compiled or packaged artifact: process manager.js. | 1 |
| `apps/launcher/dist/main/store-manager.d.ts` | Build artifact | Compiled or packaged artifact: store manager.d. | 22 |
| `apps/launcher/dist/main/store-manager.d.ts.map` | Build artifact | Compiled or packaged artifact: store manager.d.ts. | 1 |
| `apps/launcher/dist/main/store-manager.js` | Build artifact | Compiled or packaged artifact: store manager. | 94 |
| `apps/launcher/dist/main/store-manager.js.map` | Build artifact | Compiled or packaged artifact: store manager.js. | 1 |
| `apps/launcher/dist/renderer/index.html` | Build artifact | Compiled or packaged artifact: index. | 1 |
| `apps/launcher/dist/renderer/renderer.js` | Build artifact | Compiled or packaged artifact: renderer. | 2 |
| `apps/launcher/dist/renderer/renderer.js.LICENSE.txt` | Build artifact | Compiled or packaged artifact: renderer.js.LICENSE. | 50 |
| `apps/launcher/eslint.config.js` | JavaScript | Configuration source for eslint.config. | 56 |
| `apps/launcher/package.json` | Package manifest | Package manifest for `spicegarden-launcher` v1.0.0; 21 dependencies; scripts: dev, dev:main, dev:renderer, build, build:main, build:renderer, dist, dist:installer, dist:portable, lint, test:unit, test:integration, test:e2e, test:all. | 75 |
| `apps/launcher/scripts/generate-icon.js` | JavaScript | Source file: generate icon. | 67 |
| `apps/launcher/scripts/generate-icon.ps1` | Script | Script: generate icon. | 21 |
| `apps/launcher/scripts/installer.nsh` | Script | Script: installer. | 4 |
| `apps/launcher/src/main/auto-updater.js` | JavaScript | Source file: auto updater. | 55 |
| `apps/launcher/src/main/auto-updater.ts` | TypeScript | Source file: auto updater. | 57 |
| `apps/launcher/src/main/docker-manager.js` | JavaScript | Source file: docker manager. | 164 |
| `apps/launcher/src/main/docker-manager.ts` | TypeScript | Source file: docker manager. | 153 |
| `apps/launcher/src/main/environment-manager.js` | JavaScript | Source file: environment manager. | 243 |
| `apps/launcher/src/main/environment-manager.ts` | TypeScript | Source file: environment manager. | 244 |
| `apps/launcher/src/main/error-handler.js` | JavaScript | Source file: error handler. | 124 |
| `apps/launcher/src/main/error-handler.ts` | TypeScript | Source file: error handler. | 107 |
| `apps/launcher/src/main/main.js` | JavaScript | Source file: main. | 244 |
| `apps/launcher/src/main/main.ts` | TypeScript | Source file: main. | 267 |
| `apps/launcher/src/main/preload.js` | JavaScript | Source file: preload. | 21 |
| `apps/launcher/src/main/preload.ts` | TypeScript | Source file: preload. | 19 |
| `apps/launcher/src/main/process-manager.js` | JavaScript | Source file: process manager. | 159 |
| `apps/launcher/src/main/process-manager.ts` | TypeScript | Source file: process manager. | 162 |
| `apps/launcher/src/main/store-manager.js` | JavaScript | Source file: store manager. | 94 |
| `apps/launcher/src/main/store-manager.ts` | TypeScript | Source file: store manager. | 77 |
| `apps/launcher/src/renderer/components/ServiceStatusCard.js` | JavaScript | UI component: Service Status Card. | 32 |
| `apps/launcher/src/renderer/components/ServiceStatusCard.tsx` | TypeScript | UI component: Service Status Card. | 35 |
| `apps/launcher/src/renderer/index.html` | HTML | HTML template for index. | 14 |
| `apps/launcher/src/renderer/index.js` | JavaScript | Source file: index. | 14 |
| `apps/launcher/src/renderer/index.tsx` | TypeScript | Source file: index. | 9 |
| `apps/launcher/src/renderer/pages/Dashboard.js` | JavaScript | Source file: Dashboard. | 108 |
| `apps/launcher/src/renderer/pages/Dashboard.tsx` | TypeScript | Source file: Dashboard. | 104 |
| `apps/launcher/src/renderer/styles.css` | CSS | Styles for styles. | 176 |
| `apps/launcher/tsconfig.json` | JSON | TypeScript config; extends none; src/**/*.ts, src/**/*.tsx. | 16 |
| `apps/launcher/tsconfig.main.json` | JSON | JSON configuration file. | 21 |
| `apps/launcher/tsconfig.renderer.json` | JSON | JSON configuration file. | 17 |
| `apps/launcher/webpack.renderer.config.js` | JavaScript | Configuration source for webpack.renderer.config. | 45 |
| `apps/restaurant-dashboard/.env.staging.local` | File | File: .env.staging. | 4 |
| `apps/restaurant-dashboard/README.md` | Markdown | Restaurant Management Dashboard — React dashboard for outlet/kitchen operations. Responsibilities: - Manage incoming orders - Kitchen workflow - Menu management - Inventory sync - Pricing control Tech (target): Rea | 13 |
| `apps/restaurant-dashboard/__tests__/e2e/kitchen-flow.test.ts` | TypeScript | Test file for kitchen flow.test. | 52 |
| `apps/restaurant-dashboard/__tests__/kitchen-business.test.js` | JavaScript | Test file for kitchen business.test. | 88 |
| `apps/restaurant-dashboard/__tests__/kitchen.test.tsx` | TypeScript | Test file for kitchen.test. | 53 |
| `apps/restaurant-dashboard/__tests__/restaurant-flow.e2e.test.js` | JavaScript | Test file for restaurant flow.e2e.test. | 60 |
| `apps/restaurant-dashboard/__tests__/restaurant-flow.e2e.test.ts` | TypeScript | Test file for restaurant flow.e2e.test. | 72 |
| `apps/restaurant-dashboard/eslint.config.js` | JavaScript | Configuration source for eslint.config. | 11 |
| `apps/restaurant-dashboard/jest.config.js` | JavaScript | Configuration source for jest.config. | 5 |
| `apps/restaurant-dashboard/jest.setup.js` | JavaScript | Source file: jest.setup. | 20 |
| `apps/restaurant-dashboard/jest.setup.ts` | TypeScript | Source file: jest.setup. | 14 |
| `apps/restaurant-dashboard/next-env.d.ts` | TypeScript | Type declaration for next env.d. | 7 |
| `apps/restaurant-dashboard/next.config.js` | JavaScript | Configuration source for next.config. | 18 |
| `apps/restaurant-dashboard/package.json` | Package manifest | Package manifest for `@spicegarden/restaurant-dashboard` v0.1.0; 17 dependencies; scripts: dev, build, start, lint, test:unit, test:integration, test:e2e, test:all. | 37 |
| `apps/restaurant-dashboard/sentry.config.ts` | TypeScript | Configuration source for sentry.config. | 36 |
| `apps/restaurant-dashboard/src/pages/_app.tsx` | TypeScript | Next.js page/route: app. | 32 |
| `apps/restaurant-dashboard/src/pages/api/inventory.ts` | TypeScript | Next.js API route: inventory. | 13 |
| `apps/restaurant-dashboard/src/pages/api/orders.ts` | TypeScript | Next.js API route: orders. | 34 |
| `apps/restaurant-dashboard/src/pages/index.module.css` | CSS | Styles for index.module. | 765 |
| `apps/restaurant-dashboard/src/pages/index.tsx` | TypeScript | Next.js page/route: index. | 546 |
| `apps/restaurant-dashboard/src/pages/onboarding/business.tsx` | TypeScript | Next.js page/route: business. | 145 |
| `apps/restaurant-dashboard/src/pages/onboarding/documents.tsx` | TypeScript | Next.js page/route: documents. | 124 |
| `apps/restaurant-dashboard/src/pages/onboarding/gst.module.css` | CSS | Styles for gst.module. | 56 |
| `apps/restaurant-dashboard/src/pages/onboarding/gst.tsx` | TypeScript | Next.js page/route: gst. | 86 |
| `apps/restaurant-dashboard/src/pages/onboarding/index.tsx` | TypeScript | Next.js page/route: index. | 85 |
| `apps/restaurant-dashboard/src/pages/onboarding/menu.tsx` | TypeScript | Next.js page/route: menu. | 141 |
| `apps/restaurant-dashboard/src/pages/onboarding/payout.tsx` | TypeScript | Next.js page/route: payout. | 144 |
| `apps/restaurant-dashboard/src/pages/onboarding/pricing.tsx` | TypeScript | Next.js page/route: pricing. | 79 |
| `apps/restaurant-dashboard/src/redux/store.ts` | TypeScript | Redux state/store file: store. | 10 |
| `apps/restaurant-dashboard/src/types/sentry.d.ts` | TypeScript | Type declaration for sentry.d. | 11 |
| `apps/restaurant-dashboard/tsconfig.json` | JSON | TypeScript config; extends none; next-env.d.ts, **/*.ts, **/*.tsx. | 22 |
| `apps/restaurant-dashboard/tsconfig.test.json` | JSON | TypeScript config; extends ./tsconfig.json; default include. | 9 |
| `apps/restaurant-dashboard/tsconfig.tsbuildinfo` | TypeScript cache | TypeScript incremental build cache. | 1 |
| `apps/super-admin/.env.staging.local` | File | File: .env.staging. | 4 |
| `apps/super-admin/README.md` | Markdown | Super Admin Platform — React admin panel. Responsibilities: - Platform control - Revenue analytics - Promotions - Customer support + disputes - Platform analytics Tech (target): React admin panel. | 13 |
| `apps/super-admin/__tests__/admin-flow.e2e.test.js` | JavaScript | Test file for admin flow.e2e.test. | 97 |
| `apps/super-admin/__tests__/admin-flow.e2e.test.ts` | TypeScript | Test file for admin flow.e2e.test. | 123 |
| `apps/super-admin/eslint.config.js` | JavaScript | Configuration source for eslint.config. | 14 |
| `apps/super-admin/instrumentation.ts` | TypeScript | Source file: instrumentation. | 12 |
| `apps/super-admin/jest.config.js` | JavaScript | Configuration source for jest.config. | 12 |
| `apps/super-admin/jest.setup.js` | JavaScript | Source file: jest.setup. | 1 |
| `apps/super-admin/jest.setup.ts` | TypeScript | Source file: jest.setup. | 14 |
| `apps/super-admin/next-env.d.ts` | TypeScript | Type declaration for next env.d. | 7 |
| `apps/super-admin/next.config.js` | JavaScript | Configuration source for next.config. | 17 |
| `apps/super-admin/package.json` | Package manifest | Package manifest for `@spicegarden/super-admin` v0.1.0; 18 dependencies; scripts: dev, build, start, lint, test:unit, test:integration, test:e2e, test:all. | 38 |
| `apps/super-admin/src/pages/AdminDashboard.module.css` | CSS | Styles for Admin Dashboard.module. | 553 |
| `apps/super-admin/src/pages/_app.tsx` | TypeScript | Next.js page/route: app. | 32 |
| `apps/super-admin/src/pages/analytics/customers.tsx` | TypeScript | Next.js page/route: customers. | 82 |
| `apps/super-admin/src/pages/analytics/index.tsx` | TypeScript | Next.js page/route: index. | 92 |
| `apps/super-admin/src/pages/analytics/top-dishes.tsx` | TypeScript | Next.js page/route: top dishes. | 62 |
| `apps/super-admin/src/pages/api/admin/stats.ts` | TypeScript | Next.js API route: stats. | 78 |
| `apps/super-admin/src/pages/api/orders.ts` | TypeScript | Next.js API route: orders. | 32 |
| `apps/super-admin/src/pages/driver-fleet/earnings.tsx` | TypeScript | Next.js page/route: earnings. | 10 |
| `apps/super-admin/src/pages/driver-fleet/incentives.tsx` | TypeScript | Next.js page/route: incentives. | 10 |
| `apps/super-admin/src/pages/driver-fleet/overview.tsx` | TypeScript | Next.js page/route: overview. | 95 |
| `apps/super-admin/src/pages/driver-fleet/penalties.tsx` | TypeScript | Next.js page/route: penalties. | 75 |
| `apps/super-admin/src/pages/driver-fleet/shifts.tsx` | TypeScript | Next.js page/route: shifts. | 10 |
| `apps/super-admin/src/pages/index.tsx` | TypeScript | Next.js page/route: index. | 671 |
| `apps/super-admin/src/pages/loyalty/coupons.tsx` | TypeScript | Next.js page/route: coupons. | 118 |
| `apps/super-admin/src/pages/loyalty/index.tsx` | TypeScript | Next.js page/route: index. | 23 |
| `apps/super-admin/src/pages/loyalty/referrals.tsx` | TypeScript | Next.js page/route: referrals. | 73 |
| `apps/super-admin/src/redux/store.ts` | TypeScript | Redux state/store file: store. | 11 |
| `apps/super-admin/tsconfig.json` | JSON | TypeScript config; extends none; next-env.d.ts, **/*.ts, **/*.tsx. | 22 |
| `apps/super-admin/tsconfig.test.json` | JSON | TypeScript config; extends ./tsconfig.json; default include. | 9 |
| `apps/super-admin/tsconfig.tsbuildinfo` | TypeScript cache | TypeScript incremental build cache. | 1 |
| `apps/super-admin/types/node.d.ts` | TypeScript | Type declaration for node.d. | 11 |
| `apps/super-admin/types/sentry.d.ts` | TypeScript | Type declaration for sentry.d. | 11 |
| `build_output.txt` | Text | Text file: build output. | 230 |
| `compose.debug.yaml` | YAML | Docker Compose configuration file. | 12 |
| `compose.dev.yaml` | YAML | Docker Compose configuration file. | 129 |
| `compose.infra.yaml` | YAML | Docker Compose configuration file. | 264 |
| `compose.yaml` | YAML | Docker Compose configuration file. | 9 |
| `deleted_js_files.txt` | Text | Text file: deleted js files. | 181 |
| `docs/business-architecture.md` | Markdown | SpiceGarden — Business Architecture (Phase 0) — 1. Food Delivery 2. Self Pickup 3. Dining Reservation 4. Subscription Membership 5. Scheduled Orders 6. Corporate/Bulk Orders 7. Loyalty & Rewards 1. Customer Platform - Customer-f | 52 |
| `docs/grpc-migration-final-state.md` | Markdown | gRPC Migration - Final State — - 14 proto files defined under `apps/backend/src/proto/` - Proto compilation script at `infra/scripts/compile-protos.js` - Proto package at `packages/proto/` - gRPC dependencies in | 75 |
| `docs/grpc-migration-plan.md` | Markdown | REST → gRPC Migration Plan — Replace SpiceGarden's REST APIs with gRPC while keeping the existing Express + Socket.IO stack intact during the transition. Client apps are migrated incrementally behind feature f | 51 |
| `docs/icon-audit.md` | Markdown | Icon Audit Report — Found **90+ emoji instances** across 5 apps. No SVG icons, font-awesome, or material-icons libraries detected. All icons are currently using Unicode emojis that need replacement wi | 383 |
| `docs/phase-2-backend-architecture.md` | Markdown | PHASE 2 — Enterprise Backend Architecture (Scalable Backend for 200k–300k users) — Target scale and reliability: - Users: 200,000–300,000 - Concurrent: 10,000–20,000 - Peak load: 5,000–8,000 orders/hour - Availability: 99.9% - Downtime: near zero - API latency: < | 153 |
| `docs/phase-3-database-architecture.md` | Markdown | PHASE 3 — Enterprise Database Architecture (Production-ready for 200k–300k users) — For a food delivery system, database architecture impacts: - Speed - Stability - Scalability - Real-time performance - Order reliability **Non-negotiable rule:** do **not** use one | 247 |
| `docs/phase-4-frontend-architecture.md` | Markdown | PHASE 4 — Enterprise Frontend Architecture (React Native + React + Next.js) — 1. Customer App 2. Customer Website 3. Delivery Partner App 4. Restaurant Dashboard 5. Admin Panel 6. Consumer Landing Page + Admin Landing Page You are not building one frontend. | 405 |
| `docs/platform-apis.md` | Markdown | SpiceGarden — Platform APIs (Concept) — This document outlines key API domains. Implementation will be done in Phase 1. - Email login - OTP/phone login - Social login (Google/Apple) - Forgot password - Device/session man | 57 |
| `docs/security/compliance.md` | Markdown | Security Compliance Documentation — This document outlines the security compliance measures implemented in SpiceGarden. - **Location**: `apps/backend/src/services/payments/fraud-hardening.service.ts` - **Features**: | 165 |
| `docs/security/threat-model.json` | JSON | JSON data file. | 213 |
| `docs/v1-architecture-freeze.md` | Markdown | SpiceGarden V1 Architecture Freeze — **Date:** 2026-05-23 **Status:** Core feature scope locked for V1 --- \| Feature \| Backend Status \| Frontend Status \| Notes \| \|---------\|---------------\|-----------------\|-------\| \| | 66 |
| `eslint.config.cjs` | JavaScript | Configuration source for eslint.config. | 131 |
| `infra/DEPLOYMENT_CHECKLIST.md` | Markdown | Production Deployment Checklist — - [ ] Deploy to staging: `kubectl apply -f infra/k8s/staging.yaml` - [ ] Validate staging ingress: `kubectl get ingress -n spicegarden-staging` - [ ] Run smoke tests: `curl https:/ | 109 |
| `infra/DNS_FAILOVER.md` | Markdown | DNS Failover Configuration — ``` ┌─────────────────────┐ │ Primary Region │ │ (AWS/Primary DC) │ └─────────┬─────────┘ │ DNS: api.spicegarden.com Health: /health endpoint │ ▼ ┌─────────────────────┐ │ Secondar | 133 |
| `infra/DOCKER_STABILITY.md` | Markdown | Docker Stability Guide — The SIGBUS (bus error) occurs when containerd cannot access memory or storage properly, typically due to: - WSL filesystem corruption (Windows) - Disk space exhaustion - Memory pre | 98 |
| `infra/README.md` | Markdown | SpiceGarden Infrastructure — Docker-based infrastructure for Internal Alpha testing (May 2026). ```bash bash ./infra/scripts/setup-secrets.sh cp .env.example .env docker-compose -f compose.infra.yaml up -d nod | 180 |
| `infra/TESTING_PLAN.md` | Markdown | Internal Alpha Testing Plan - Phase I — Break system. Fix everything. Test with friends, family, team. \| Category \| Test Type \| Tool \| Target \| Success Criteria \| \|----------\|-----------\|------\|--------\|----------------- | 78 |
| `infra/alertmanager/alertmanager.yml` | YAML | Alertmanager routing configuration. | 33 |
| `infra/docs/API_VERSION_STRATEGY.md` | Markdown | API Versioning Strategy — The SpiceGarden API follows a **URL-based versioning strategy** with semantic versioning principles. This ensures backward compatibility, clear upgrade paths, and enterprise-grade | 160 |
| `infra/docs/LOAD_BENCHMARKS.md` | Markdown | Load Testing Benchmarks — This document provides evidence of load testing benchmarks for the SpiceGarden platform. All benchmarks are run using k6 and validated against enterprise-grade performance threshol | 235 |
| `infra/docs/MULTI_REGION_ARCHITECTURE.md` | Markdown | Multi-Region Architecture — SpiceGarden implements a **multi-region active-active architecture** with regional failover capabilities. This ensures low latency for users, high availability, and disaster recove | 267 |
| `infra/envoy/envoy.yaml` | YAML | Envoy proxy configuration. | 42 |
| `infra/filebeat/filebeat.yml` | YAML | Filebeat log shipping configuration. | 17 |
| `infra/grafana/dashboards/spicegarden.json` | JSON | JSON data file. | 72 |
| `infra/grafana/provisioning/dashboards/provider.yml` | YAML | Grafana dashboard/provisioning configuration. | 11 |
| `infra/grafana/provisioning/datasources/datasources.yml` | YAML | Grafana dashboard/provisioning configuration. | 15 |
| `infra/k8s/backend-deployment.yaml` | YAML | Kubernetes manifest file. | 53 |
| `infra/k8s/cdn-ingress.yaml` | YAML | Kubernetes manifest file. | 35 |
| `infra/k8s/configmap.yaml` | YAML | Kubernetes manifest file. | 18 |
| `infra/k8s/postgres-ha.yaml` | YAML | Kubernetes manifest file. | 152 |
| `infra/k8s/production-hardened.yaml` | YAML | Kubernetes manifest file. | 376 |
| `infra/k8s/redis-cluster.yaml` | YAML | Kubernetes manifest file. | 184 |
| `infra/k8s/secrets.yaml` | YAML | Kubernetes manifest file. | 29 |
| `infra/k8s/staging.yaml` | YAML | Kubernetes manifest file. | 140 |
| `infra/opensearch/index-templates/spicegarden-logs.json` | JSON | JSON data file. | 78 |
| `infra/postgres/init.sql` | SQL | Database seed/query SQL file. | 56 |
| `infra/postgres/migrations/InitialSchema20240101000001__down.sql` | SQL | Database migration SQL file. | 102 |
| `infra/postgres/migrations/InitialSchema20240101000001__up.sql` | SQL | Database migration SQL file. | 1,030 |
| `infra/postgres/seed/001_restaurants_branches_menus.sql` | SQL | Database seed/query SQL file. | 93 |
| `infra/postgres/seed/002_test_users.sql` | SQL | Database seed/query SQL file. | 50 |
| `infra/prometheus/prometheus.dev.yml` | YAML | Prometheus metrics or alerting configuration. | 21 |
| `infra/prometheus/prometheus.yml` | YAML | Prometheus metrics or alerting configuration. | 21 |
| `infra/prometheus/rules/alerts.yml` | YAML | Prometheus metrics or alerting configuration. | 47 |
| `infra/prometheus/rules/slos.yml` | YAML | Prometheus metrics or alerting configuration. | 32 |
| `infra/scripts/autoscaling-validation.sh` | Script | Script: autoscaling validation. | 90 |
| `infra/scripts/backup-verification.sh` | Script | Script: backup verification. | 17 |
| `infra/scripts/backup.ps1` | Script | Script: backup. | 53 |
| `infra/scripts/backup.sh` | Script | Script: backup. | 37 |
| `infra/scripts/breaking-point.js` | JavaScript | Source file: breaking point. | 198 |
| `infra/scripts/chaos-runner.js` | JavaScript | Source file: chaos runner. | 443 |
| `infra/scripts/chaos-runner.sh` | Script | Script: chaos runner. | 258 |
| `infra/scripts/compile-protos.js` | JavaScript | Source file: compile protos. | 155 |
| `infra/scripts/compile-protos.sh` | Script | Script: compile protos. | 48 |
| `infra/scripts/deployment-check.js` | JavaScript | Source file: deployment check. | 99 |
| `infra/scripts/disaster-recovery.ps1` | Script | Script: disaster recovery. | 90 |
| `infra/scripts/disaster-recovery.sh` | Script | Script: disaster recovery. | 103 |
| `infra/scripts/docker-stability-check.sh` | Script | Script: docker stability check. | 121 |
| `infra/scripts/docker-stability-repair.ps1` | Script | Script: docker stability repair. | 108 |
| `infra/scripts/docker-stability-test.ps1` | Script | Script: docker stability test. | 146 |
| `infra/scripts/docker-stability-test.sh` | Script | Script: docker stability test. | 152 |
| `infra/scripts/failover-testing.sh` | Script | Script: failover testing. | 2 |
| `infra/scripts/fake-orders.js` | JavaScript | Source file: fake orders. | 149 |
| `infra/scripts/generate-secrets.ps1` | Script | Script: generate secrets. | 35 |
| `infra/scripts/legal-check.js` | JavaScript | Source file: legal check. | 59 |
| `infra/scripts/live-driver-simulation.js` | JavaScript | Source file: live driver simulation. | 133 |
| `infra/scripts/load-secrets.ps1` | Script | Script: load secrets. | 21 |
| `infra/scripts/load-secrets.sh` | Script | Script: load secrets. | 17 |
| `infra/scripts/penetration-tests.js` | JavaScript | Source file: penetration tests. | 190 |
| `infra/scripts/production-validation.ps1` | Script | Script: production validation. | 221 |
| `infra/scripts/production-validation.sh` | Script | Script: production validation. | 223 |
| `infra/scripts/quick-start.sh` | Script | Script: quick start. | 46 |
| `infra/scripts/restore.sh` | Script | Script: restore. | 41 |
| `infra/scripts/secrets-rotation.ps1.js` | JavaScript | Source file: secrets rotation.ps1. | 145 |
| `infra/scripts/security-audit-report.json` | JSON | Security audit report; score GOOD. | 10 |
| `infra/scripts/security-automation.js` | JavaScript | Source file: security automation. | 202 |
| `infra/scripts/security-tests.js` | JavaScript | Source file: security tests. | 240 |
| `infra/scripts/setup-secrets.sh` | Script | Script: setup secrets. | 78 |
| `infra/scripts/validate-env-consistency.js` | JavaScript | Source file: validate env consistency. | 261 |
| `infra/scripts/validate-secrets.js` | JavaScript | Source file: validate secrets. | 186 |
| `k8s/backend-deployment.yaml` | YAML | Kubernetes manifest file. | 87 |
| `legal/LEGAL_contributor-agreements.md` | Markdown | Contributor License Agreements — **Company:** SpiceGarden Technologies Private Limited **Date:** June 10, 2026 For individual contributors contributing to SpiceGarden: ``` CONTRIBUTOR LICENSE AGREEMENT I hereby gr | 59 |
| `legal/LEGAL_ip-ownership.md` | Markdown | Intellectual Property Ownership Document — **Company:** SpiceGarden Technologies Private Limited **Date:** June 10, 2026 **Version:** 1.0 **SpiceGarden** is the sole owner of all intellectual property created for the SpiceG | 84 |
| `legal/README.md` | Markdown | Legal Documentation — This directory contains legal documents for SpiceGarden. \| File \| Description \| \|------\|-------------\| \| `LEGAL_ip-ownership.md` \| Intellectual property ownership documentation \| \| | 36 |
| `package-lock.json` | JSON | JSON file. | 39,936 |
| `package.json` | Package manifest | Package manifest for `spicegarden` v0.0.0; 4 dependencies; scripts: dev, build, lint, format, test:unit, test:integration, test:e2e, test:all. | 28 |
| `packages/api-types/package.json` | Package manifest | Package manifest for `@spicegarden/api-types` v1.0.0; 4 dependencies; scripts: build, type-check, lint. | 21 |
| `packages/api-types/src/index.ts` | TypeScript | Type declaration for index. | 50 |
| `packages/api-types/tsconfig.json` | JSON | TypeScript config; extends none; src/**/*. | 20 |
| `packages/grpc-transport/package.json` | Package manifest | Package manifest. | 21 |
| `packages/grpc-transport/src/index.ts` | TypeScript | Source file: index. | 2 |
| `packages/grpc-transport/tsconfig.json` | JSON | TypeScript config; extends none; src/**/*. | 20 |
| `packages/proto/package.json` | Package manifest | Package manifest. | 21 |
| `packages/proto/src/constants.ts` | TypeScript | Constants file for constants. | 46 |
| `packages/proto/src/index.ts` | TypeScript | Source file: index. | 7 |
| `packages/proto/src/types.ts` | TypeScript | Type declaration for types. | 2 |
| `packages/proto/tsconfig.json` | JSON | TypeScript config; extends none; src/**/*. | 20 |
| `packages/shared/analytics.ts` | TypeScript | Source file: analytics. | 23 |
| `packages/shared/api.ts` | TypeScript | Source file: api. | 142 |
| `packages/shared/constants.ts` | TypeScript | Constants file for constants. | 3 |
| `packages/shared/dist/analytics.js` | Build artifact | Compiled or packaged artifact: analytics. | 3 |
| `packages/shared/dist/api.js` | Build artifact | Compiled or packaged artifact: api. | 112 |
| `packages/shared/dist/constants.js` | Build artifact | Compiled or packaged artifact: constants. | 6 |
| `packages/shared/dist/index.js` | Build artifact | Compiled or packaged artifact: index. | 20 |
| `packages/shared/dist/types.js` | Build artifact | Compiled or packaged artifact: types. | 3 |
| `packages/shared/index.ts` | TypeScript | Source file: index. | 3 |
| `packages/shared/package.json` | Package manifest | Package manifest for `@spicegarden/shared` v0.0.0; 1 dependencies; scripts: build, dev, lint, test:unit, test:integration, test:e2e, test:all. | 21 |
| `packages/shared/tsconfig.json` | JSON | TypeScript config; extends none; index.ts, analytics.ts. | 19 |
| `packages/shared/types.ts` | TypeScript | Type declaration for types. | 48 |
| `packages/ui/Button.d.ts` | TypeScript | Type declaration for Button.d. | 16 |
| `packages/ui/Button.js` | JavaScript | Source file: Button. | 62 |
| `packages/ui/Button.stories.tsx` | TypeScript | Source file: Button.stories. | 68 |
| `packages/ui/Button.tsx` | TypeScript | Source file: Button. | 96 |
| `packages/ui/Card.d.ts` | TypeScript | Type declaration for Card.d. | 11 |
| `packages/ui/Card.js` | JavaScript | Source file: Card. | 54 |
| `packages/ui/Card.stories.tsx` | TypeScript | Source file: Card.stories. | 49 |
| `packages/ui/Card.tsx` | TypeScript | Source file: Card. | 66 |
| `packages/ui/Cards.d.ts` | TypeScript | Type declaration for Cards.d. | 43 |
| `packages/ui/Cards.js` | JavaScript | Source file: Cards. | 307 |
| `packages/ui/Cards.tsx` | TypeScript | Source file: Cards. | 514 |
| `packages/ui/Dropdown.d.ts` | TypeScript | Type declaration for Dropdown.d. | 21 |
| `packages/ui/Dropdown.js` | JavaScript | Source file: Dropdown. | 119 |
| `packages/ui/Dropdown.stories.tsx` | TypeScript | Source file: Dropdown.stories. | 62 |
| `packages/ui/Dropdown.tsx` | TypeScript | Source file: Dropdown. | 150 |
| `packages/ui/ErrorBoundary.d.ts` | TypeScript | Type declaration for Error Boundary.d. | 21 |
| `packages/ui/ErrorBoundary.js` | JavaScript | Source file: Error Boundary. | 73 |
| `packages/ui/ErrorBoundary.tsx` | TypeScript | Source file: Error Boundary. | 61 |
| `packages/ui/FlowManager.d.ts` | TypeScript | Type declaration for Flow Manager.d. | 13 |
| `packages/ui/FlowManager.js` | JavaScript | Source file: Flow Manager. | 86 |
| `packages/ui/FlowManager.tsx` | TypeScript | Source file: Flow Manager. | 90 |
| `packages/ui/FoodCard.stories.tsx` | TypeScript | Source file: Food Card.stories. | 65 |
| `packages/ui/Input.d.ts` | TypeScript | Type declaration for Input.d. | 9 |
| `packages/ui/Input.js` | JavaScript | Source file: Input. | 81 |
| `packages/ui/Input.stories.tsx` | TypeScript | Source file: Input.stories. | 79 |
| `packages/ui/Input.tsx` | TypeScript | Source file: Input. | 89 |
| `packages/ui/LoadingStates.d.ts` | TypeScript | Type declaration for Loading States.d. | 21 |
| `packages/ui/LoadingStates.js` | JavaScript | Source file: Loading States. | 144 |
| `packages/ui/LoadingStates.tsx` | TypeScript | Source file: Loading States. | 235 |
| `packages/ui/LottieSuccessAnimation.d.ts` | TypeScript | Type declaration for Lottie Success Animation.d. | 11 |
| `packages/ui/LottieSuccessAnimation.js` | JavaScript | Source file: Lottie Success Animation. | 20 |
| `packages/ui/LottieSuccessAnimation.tsx` | TypeScript | Source file: Lottie Success Animation. | 51 |
| `packages/ui/MapCard.stories.tsx` | TypeScript | Source file: Map Card.stories. | 40 |
| `packages/ui/MenuCard.stories.tsx` | TypeScript | Source file: Menu Card.stories. | 41 |
| `packages/ui/Modal.d.ts` | TypeScript | Type declaration for Modal.d. | 16 |
| `packages/ui/Modal.js` | JavaScript | Source file: Modal. | 162 |
| `packages/ui/Modal.stories.tsx` | TypeScript | Source file: Modal.stories. | 46 |
| `packages/ui/Modal.tsx` | TypeScript | Source file: Modal. | 205 |
| `packages/ui/OTPInput.d.ts` | TypeScript | Type declaration for OTPInput.d. | 15 |
| `packages/ui/OTPInput.js` | JavaScript | Source file: OTPInput. | 107 |
| `packages/ui/OTPInput.stories.tsx` | TypeScript | Source file: OTPInput.stories. | 42 |
| `packages/ui/OTPInput.tsx` | TypeScript | Source file: OTPInput. | 119 |
| `packages/ui/ReviewCard.stories.tsx` | TypeScript | Source file: Review Card.stories. | 18 |
| `packages/ui/SearchInput.d.ts` | TypeScript | Type declaration for Search Input.d. | 7 |
| `packages/ui/SearchInput.js` | JavaScript | Source file: Search Input. | 72 |
| `packages/ui/SearchInput.stories.tsx` | TypeScript | Source file: Search Input.stories. | 36 |
| `packages/ui/SearchInput.tsx` | TypeScript | Source file: Search Input. | 59 |
| `packages/ui/Skeleton.d.ts` | TypeScript | Type declaration for Skeleton.d. | 18 |
| `packages/ui/Skeleton.js` | JavaScript | Source file: Skeleton. | 83 |
| `packages/ui/Skeleton.tsx` | TypeScript | Source file: Skeleton. | 117 |
| `packages/ui/SkeletonTemplates.d.ts` | TypeScript | Type declaration for Skeleton Templates.d. | 23 |
| `packages/ui/SkeletonTemplates.js` | JavaScript | Source file: Skeleton Templates. | 70 |
| `packages/ui/SkeletonTemplates.stories.tsx` | TypeScript | Source file: Skeleton Templates.stories. | 36 |
| `packages/ui/SkeletonTemplates.tsx` | TypeScript | Source file: Skeleton Templates. | 126 |
| `packages/ui/Stepper.d.ts` | TypeScript | Type declaration for Stepper.d. | 16 |
| `packages/ui/Stepper.js` | JavaScript | Source file: Stepper. | 63 |
| `packages/ui/Stepper.stories.tsx` | TypeScript | Source file: Stepper.stories. | 51 |
| `packages/ui/Stepper.tsx` | TypeScript | Source file: Stepper. | 102 |
| `packages/ui/Toast.d.ts` | TypeScript | Type declaration for Toast.d. | 25 |
| `packages/ui/Toast.js` | JavaScript | Source file: Toast. | 143 |
| `packages/ui/Toast.tsx` | TypeScript | Source file: Toast. | 173 |
| `packages/ui/TrackingCard.stories.tsx` | TypeScript | Source file: Tracking Card.stories. | 48 |
| `packages/ui/__tests__/Button.test.js` | JavaScript | Test file for Button.test. | 49 |
| `packages/ui/__tests__/Button.test.tsx` | TypeScript | Test file for Button.test. | 41 |
| `packages/ui/__tests__/Card.test.js` | JavaScript | Test file for Card.test. | 41 |
| `packages/ui/__tests__/FlowManager.test.js` | JavaScript | Test file for Flow Manager.test. | 105 |
| `packages/ui/__tests__/Input.test.js` | JavaScript | Test file for Input.test. | 39 |
| `packages/ui/__tests__/Input.test.tsx` | TypeScript | Test file for Input.test. | 37 |
| `packages/ui/__tests__/LoadingStates.test.tsx` | TypeScript | Test file for Loading States.test. | 93 |
| `packages/ui/__tests__/LottieSuccessAnimation.test.js` | JavaScript | Test file for Lottie Success Animation.test. | 44 |
| `packages/ui/__tests__/Skeleton.test.js` | JavaScript | Test file for Skeleton.test. | 64 |
| `packages/ui/__tests__/useFlow.test.js` | JavaScript | Test file for use Flow.test. | 88 |
| `packages/ui/__tests__/useFlow.test.tsx` | TypeScript | Test file for use Flow.test. | 86 |
| `packages/ui/analytics.d.ts` | TypeScript | Type declaration for analytics.d. | 10 |
| `packages/ui/analytics.js` | JavaScript | Source file: analytics. | 61 |
| `packages/ui/analytics.ts` | TypeScript | Source file: analytics. | 72 |
| `packages/ui/icons.css` | CSS | Styles for icons. | 23 |
| `packages/ui/icons/admin/AdminIcons.d.ts` | TypeScript | Type declaration for Admin Icons.d. | 6 |
| `packages/ui/icons/admin/AdminIcons.js` | JavaScript | Source file: Admin Icons. | 25 |
| `packages/ui/icons/admin/AdminIcons.tsx` | TypeScript | Source file: Admin Icons. | 67 |
| `packages/ui/icons/commerce/CartIcon.d.ts` | TypeScript | Type declaration for Cart Icon.d. | 4 |
| `packages/ui/icons/commerce/CartIcon.js` | JavaScript | Source file: Cart Icon. | 12 |
| `packages/ui/icons/commerce/CartIcon.tsx` | TypeScript | Source file: Cart Icon. | 3 |
| `packages/ui/icons/commerce/OrderIcon.d.ts` | TypeScript | Type declaration for Order Icon.d. | 4 |
| `packages/ui/icons/commerce/OrderIcon.js` | JavaScript | Source file: Order Icon. | 12 |
| `packages/ui/icons/commerce/OrderIcon.tsx` | TypeScript | Source file: Order Icon. | 3 |
| `packages/ui/icons/commerce/PaymentIcon.d.ts` | TypeScript | Type declaration for Payment Icon.d. | 4 |
| `packages/ui/icons/commerce/PaymentIcon.js` | JavaScript | Source file: Payment Icon. | 12 |
| `packages/ui/icons/commerce/PaymentIcon.tsx` | TypeScript | Source file: Payment Icon. | 3 |
| `packages/ui/icons/commerce/WalletIcon.d.ts` | TypeScript | Type declaration for Wallet Icon.d. | 5 |
| `packages/ui/icons/commerce/WalletIcon.js` | JavaScript | Source file: Wallet Icon. | 13 |
| `packages/ui/icons/commerce/WalletIcon.tsx` | TypeScript | Source file: Wallet Icon. | 3 |
| `packages/ui/icons/delivery/DeliveryIcon.d.ts` | TypeScript | Type declaration for Delivery Icon.d. | 4 |
| `packages/ui/icons/delivery/DeliveryIcon.js` | JavaScript | Source file: Delivery Icon. | 12 |
| `packages/ui/icons/delivery/DeliveryIcon.tsx` | TypeScript | Source file: Delivery Icon. | 3 |
| `packages/ui/icons/index.d.ts` | TypeScript | Type declaration for index.d. | 66 |
| `packages/ui/icons/index.js` | JavaScript | Source file: index. | 40 |
| `packages/ui/icons/index.ts` | TypeScript | Source file: index. | 40 |
| `packages/ui/icons/kitchen/FireIcon.d.ts` | TypeScript | Type declaration for Fire Icon.d. | 5 |
| `packages/ui/icons/kitchen/FireIcon.js` | JavaScript | Source file: Fire Icon. | 13 |
| `packages/ui/icons/kitchen/FireIcon.tsx` | TypeScript | Source file: Fire Icon. | 3 |
| `packages/ui/icons/kitchen/KitchenIcon.d.ts` | TypeScript | Type declaration for Kitchen Icon.d. | 4 |
| `packages/ui/icons/kitchen/KitchenIcon.js` | JavaScript | Source file: Kitchen Icon. | 12 |
| `packages/ui/icons/kitchen/KitchenIcon.tsx` | TypeScript | Source file: Kitchen Icon. | 3 |
| `packages/ui/icons/navigation/HomeIcon.d.ts` | TypeScript | Type declaration for Home Icon.d. | 4 |
| `packages/ui/icons/navigation/HomeIcon.js` | JavaScript | Navigation configuration/types for Home Icon. | 12 |
| `packages/ui/icons/navigation/HomeIcon.tsx` | TypeScript | Navigation configuration/types for Home Icon. | 3 |
| `packages/ui/icons/navigation/ProfileIcon.d.ts` | TypeScript | Type declaration for Profile Icon.d. | 4 |
| `packages/ui/icons/navigation/ProfileIcon.js` | JavaScript | Navigation configuration/types for Profile Icon. | 12 |
| `packages/ui/icons/navigation/ProfileIcon.tsx` | TypeScript | Navigation configuration/types for Profile Icon. | 3 |
| `packages/ui/icons/navigation/SearchIcon.d.ts` | TypeScript | Type declaration for Search Icon.d. | 4 |
| `packages/ui/icons/navigation/SearchIcon.js` | JavaScript | Navigation configuration/types for Search Icon. | 12 |
| `packages/ui/icons/navigation/SearchIcon.tsx` | TypeScript | Navigation configuration/types for Search Icon. | 3 |
| `packages/ui/icons/system/LocationIcon.d.ts` | TypeScript | Type declaration for Location Icon.d. | 4 |
| `packages/ui/icons/system/LocationIcon.js` | JavaScript | Source file: Location Icon. | 15 |
| `packages/ui/icons/system/LocationIcon.tsx` | TypeScript | Source file: Location Icon. | 25 |
| `packages/ui/icons/system/NotificationIcon.d.ts` | TypeScript | Type declaration for Notification Icon.d. | 4 |
| `packages/ui/icons/system/NotificationIcon.js` | JavaScript | Source file: Notification Icon. | 12 |
| `packages/ui/icons/system/NotificationIcon.tsx` | TypeScript | Source file: Notification Icon. | 3 |
| `packages/ui/icons/system/RatingIcon.d.ts` | TypeScript | Type declaration for Rating Icon.d. | 4 |
| `packages/ui/icons/system/RatingIcon.js` | JavaScript | Source file: Rating Icon. | 12 |
| `packages/ui/icons/system/RatingIcon.tsx` | TypeScript | Source file: Rating Icon. | 3 |
| `packages/ui/icons/types.d.ts` | TypeScript | Type declaration for types.d. | 7 |
| `packages/ui/icons/types.js` | JavaScript | Type declaration for types. | 3 |
| `packages/ui/icons/types.ts` | TypeScript | Type declaration for types. | 7 |
| `packages/ui/index.d.ts` | TypeScript | Type declaration for index.d. | 11 |
| `packages/ui/index.js` | JavaScript | Source file: index. | 39 |
| `packages/ui/index.ts` | TypeScript | Source file: index. | 21 |
| `packages/ui/jest.setup.d.ts` | TypeScript | Type declaration for jest.setup.d. | 2 |
| `packages/ui/jest.setup.js` | JavaScript | Source file: jest.setup. | 13 |
| `packages/ui/jest.setup.ts` | TypeScript | Source file: jest.setup. | 10 |
| `packages/ui/package.json` | Package manifest | Package manifest for `@spicegarden/ui` v0.1.0; 1 dependencies; scripts: build, lint, test:unit, test:integration, test:e2e, test:all. | 26 |
| `packages/ui/sentry.client.d.ts` | TypeScript | Type declaration for sentry.client.d. | 3 |
| `packages/ui/sentry.client.js` | JavaScript | Source file: sentry.client. | 50 |
| `packages/ui/sentry.client.ts` | TypeScript | Source file: sentry.client. | 15 |
| `packages/ui/sentry.d.ts` | TypeScript | Type declaration for sentry.d. | 14 |
| `packages/ui/tokens.d.ts` | TypeScript | Type declaration for tokens.d. | 129 |
| `packages/ui/tokens.js` | JavaScript | Source file: tokens. | 98 |
| `packages/ui/tokens.ts` | TypeScript | Source file: tokens. | 95 |
| `packages/ui/tsconfig.json` | JSON | TypeScript config; extends none; src/**/*.ts, src/**/*.tsx, *.ts, *.tsx, *.stories.tsx. | 22 |
| `packages/ui/tsconfig.tsbuildinfo` | TypeScript cache | TypeScript incremental build cache. | 1 |
| `packages/ui/useFlow.d.ts` | TypeScript | Type declaration for use Flow.d. | 24 |
| `packages/ui/useFlow.js` | JavaScript | Source file: use Flow. | 75 |
| `packages/ui/useFlow.ts` | TypeScript | Source file: use Flow. | 92 |
| `packages/ux/phase-1/00_overview.md` | Markdown | 00 — Overview (UX Philosophy + Enterprise Rules) — - **Fast Ordering**: user can place an order in **< 30 seconds**. - **Minimal Friction**: reduce taps/clicks; favor action-based navigation. - **Real-Time Feedback**: every action | 48 |
| `packages/ux/phase-1/01_figma_workspace_structure.md` | Markdown | 01 — Figma Project Structure (Workspace + Pages) — **Food Delivery System** - 01 Design System - 02 Consumer Website - 03 Customer Mobile App - 04 Restaurant Dashboard - 05 Delivery Partner App - 06 Admin Panel - 07 Motion Assets - | 51 |
| `packages/ux/phase-1/02_design_system.md` | Markdown | 02 — Design System (Tokens + Styles) — - Use **semantic tokens** (preferred) for UI usage. - Derive semantic tokens from base brand tokens. - Food Orange: `#FF5A1F` - Dark: `#111827` - Background: `#F9FAFB` - White: `#F | 109 |
| `packages/ux/phase-1/03_motion_design_system.md` | Markdown | 03 — Motion Design System (Premium + Lottie) — - Premium, Apple-like continuity. - No gimmicks. - Motion must communicate state changes. - **Micro**: 150–200ms - **Standard**: 250–350ms - **Page transitions**: 400–500ms - `ease | 79 |
| `packages/ux/phase-1/04_customer_journey.md` | Markdown | 04 — Customer Journey Flow (First-Time + Enterprise) — 1. **Open app** 2. **Splash screen** (animated logo) 3. **Onboarding** (value proposition + quick steps) 4. **Choose location** 5. **Sign up** 6. **Permission requests** - Location | 44 |
| `packages/ux/phase-1/05_customer_app_information_architecture.md` | Markdown | 05 — Customer App Information Architecture — - **Home** - **Search** - **Orders** - **Subscription** - **Profile** - All screens must define: - primary CTA - back behavior - deep-link entry point(s) - Search should always off | 36 |
| `packages/ux/phase-1/06_customer_app_screen_architecture.md` | Markdown | 06 — Customer App Screen Architecture (100–150 baseline) — > This is a taxonomy + state model. Total screens will expand when you add loading/empty/error/reduced-motion variants. Each screen should be represented as variants: - Loading - E | 155 |
| `packages/ux/phase-1/07_delivery_partner_screen_architecture.md` | Markdown | 07 — Delivery Partner Screen Architecture (40+) — Include loading/empty/error/offline/reduced-motion across all screens. --- 1. Orders (queue) 2. Map 3. Earnings 4. Profile --- 1. Today’s earnings 2. Online/Offline toggle 3. Accep | 78 |
| `packages/ux/phase-1/08_restaurant_dashboard_screen_architecture.md` | Markdown | 08 — Restaurant / Vendor Panel Screen Architecture (Kitchen-First) — 1. Dashboard overview 2. Live orders (new) 3. Pending orders list 4. Preparing orders list 5. Cooking orders list 6. Ready for pickup list 7. Completed orders 8. Cancelled orders 9 | 51 |
| `packages/ux/phase-1/09_admin_panel_screen_architecture.md` | Markdown | 09 — Admin Panel Screen Architecture — 1. Revenue dashboard 2. Orders overview 3. Active drivers 4. User growth chart 5. Platform health widget 6. All orders list 7. Order detail 8. Status management 9. Refunds & credit | 52 |
| `packages/ux/phase-1/10_landing_pages.md` | Markdown | 10 — Landing Pages (Customer + Admin/Restaurant) — Purpose: Convert visitors into buyers. Sections (in order): 1. Hero - brand logo - primary CTA (Download app / Order now) - hero motion: hero particles 2. Popular dishes - curated | 45 |
| `packages/ux/phase-1/11_component_library_spec.md` | Markdown | 11 — Figma Component Library Spec — 1. Buttons 2. Cards 3. Modals 4. Search 5. Inputs 6. OTP 7. Food cards 8. Menu cards 9. Map cards 10. Tracking cards 11. Review cards 12. Charts/Tables (for web dashboards) 13. Not | 149 |
| `packages/ux/phase-1/12_developer_handoff_checklist.md` | Markdown | 12 — Developer Handoff Checklist (Pixel Perfect) — - [x] Semantic color tokens for light + dark - [x] Typography styles with font sizes, weights, line-heights - [x] Spacing tokens: 8px grid only - [x] Radii: button/card/input/conta | 33 |
| `playwright.config.ts` | TypeScript | Configuration source for playwright.config. | 33 |
| `scripts/add-icon-imports.js` | JavaScript | Source file: add icon imports. | 52 |
| `scripts/add-imports.js` | JavaScript | Source file: add imports. | 59 |
| `scripts/build-launcher.ps1` | Script | Script: build launcher. | 36 |
| `scripts/build-launcher.sh` | Script | Script: build launcher. | 44 |
| `scripts/clean-any.js` | JavaScript | Source file: clean any. | 28 |
| `scripts/clean-any.ts` | TypeScript | Source file: clean any. | 30 |
| `scripts/cloc.js` | JavaScript | Source file: cloc. | 205 |
| `scripts/commit.js` | JavaScript | Source file: commit. | 26 |
| `scripts/count-loc.js` | JavaScript | Source file: count loc. | 147 |
| `scripts/db.sh` | Script | Script: db. | 453 |
| `scripts/debug-delivery.js` | JavaScript | Source file: debug delivery. | 16 |
| `scripts/debug-delivery2.js` | JavaScript | Source file: debug delivery2. | 16 |
| `scripts/fix-delivery-final.js` | JavaScript | Source file: fix delivery final. | 67 |
| `scripts/fix-delivery-partner.js` | JavaScript | Source file: fix delivery partner. | 48 |
| `scripts/fix-emojis-v2.js` | JavaScript | Source file: fix emojis v2. | 268 |
| `scripts/fix-emojis.js` | JavaScript | Source file: fix emojis. | 123 |
| `scripts/fix-remaining.js` | JavaScript | Source file: fix remaining. | 23 |
| `scripts/replace-emojis.js` | JavaScript | Source file: replace emojis. | 102 |
| `scripts/replace-emojis2.js` | JavaScript | Source file: replace emojis2. | 254 |
| `scripts/start-dev.cmd` | Script | Script: start dev. | 56 |
| `scripts/update-readme.js` | JavaScript | Source file: update readme. | 647 |
| `scripts/verify-emojis.js` | JavaScript | Source file: verify emojis. | 57 |
| `ux/PHASE_1_COMPLETE.md` | Markdown | UX Phase 1 - Status — Deliver complete Figma UX architecture + enterprise UI/UX system via markdown spec. - [x] All 12 UX documents created in `ux/phase-1/` (copied from packages/ux/phase-1) - [x] **Fro | 173 |
| `ux/phase-1/00_overview.md` | Markdown | 00 — Overview (UX Philosophy + Enterprise Rules) — - **Fast Ordering**: user can place an order in **< 30 seconds**. - **Minimal Friction**: reduce taps/clicks; favor action-based navigation. - **Real-Time Feedback**: every action | 48 |
| `ux/phase-1/01_figma_workspace_structure.md` | Markdown | 01 — Figma Project Structure (Workspace + Pages) — **Food Delivery System** - 01 Design System - 02 Consumer Website - 03 Customer Mobile App - 04 Restaurant Dashboard - 05 Delivery Partner App - 06 Admin Panel - 07 Motion Assets - | 51 |
| `ux/phase-1/02_design_system.md` | Markdown | 02 — Design System (Tokens + Styles) — - Use **semantic tokens** (preferred) for UI usage. - Derive semantic tokens from base brand tokens. - Food Orange: `#FF5A1F` - Dark: `#111827` - Background: `#F9FAFB` - White: `#F | 109 |
| `ux/phase-1/03_motion_design_system.md` | Markdown | 03 — Motion Design System (Premium + Lottie) — - Premium, Apple-like continuity. - No gimmicks. - Motion must communicate state changes. - **Micro**: 150–200ms - **Standard**: 250–350ms - **Page transitions**: 400–500ms - `ease | 79 |
| `ux/phase-1/04_customer_journey.md` | Markdown | 04 — Customer Journey Flow (First-Time + Enterprise) — 1. **Open app** 2. **Splash screen** (animated logo) 3. **Onboarding** (value proposition + quick steps) 4. **Choose location** 5. **Sign up** 6. **Permission requests** - Location | 44 |
| `ux/phase-1/05_customer_app_information_architecture.md` | Markdown | 05 — Customer App Information Architecture — - **Home** - **Search** - **Orders** - **Subscription** - **Profile** - All screens must define: - primary CTA - back behavior - deep-link entry point(s) - Search should always off | 36 |
| `ux/phase-1/06_customer_app_screen_architecture.md` | Markdown | 06 — Customer App Screen Architecture (100–150 baseline) — > This is a taxonomy + state model. Total screens will expand when you add loading/empty/error/reduced-motion variants. Each screen should be represented as variants: - Loading - E | 155 |
| `ux/phase-1/07_delivery_partner_screen_architecture.md` | Markdown | 07 — Delivery Partner Screen Architecture (40+) — Include loading/empty/error/offline/reduced-motion across all screens. --- 1. Orders (queue) 2. Map 3. Earnings 4. Profile --- 1. Today’s earnings 2. Online/Offline toggle 3. Accep | 78 |
| `ux/phase-1/08_restaurant_dashboard_screen_architecture.md` | Markdown | 08 — Restaurant / Vendor Panel Screen Architecture (Kitchen-First) — 1. Dashboard overview 2. Live orders (new) 3. Pending orders list 4. Preparing orders list 5. Cooking orders list 6. Ready for pickup list 7. Completed orders 8. Cancelled orders 9 | 51 |
| `ux/phase-1/09_admin_panel_screen_architecture.md` | Markdown | 09 — Admin Panel Screen Architecture — 1. Revenue dashboard 2. Orders overview 3. Active drivers 4. User growth chart 5. Platform health widget 6. All orders list 7. Order detail 8. Status management 9. Refunds & credit | 52 |
| `ux/phase-1/10_landing_pages.md` | Markdown | 10 — Landing Pages (Customer + Admin/Restaurant) — Purpose: Convert visitors into buyers. Sections (in order): 1. Hero - brand logo - primary CTA (Download app / Order now) - hero motion: hero particles 2. Popular dishes - curated | 45 |
| `ux/phase-1/11_component_library_spec.md` | Markdown | 11 — Figma Component Library Spec — 1. Buttons 2. Cards 3. Modals 4. Search 5. Inputs 6. OTP 7. Food cards 8. Menu cards 9. Map cards 10. Tracking cards 11. Review cards 12. Charts/Tables (for web dashboards) 13. Not | 149 |
| `ux/phase-1/12_developer_handoff_checklist.md` | Markdown | 12 — Developer Handoff Checklist (Pixel Perfect) — - [x] Semantic color tokens for light + dark - [x] Typography styles with font sizes, weights, line-heights - [x] Spacing tokens: 8px grid only - [x] Radii: button/card/input/conta | 33 |
| `ux/phase-1/README.md` | Markdown | Phase 1 - Complete Figma UX Architecture — This directory contains the complete UX specification for SpiceGarden's Phase 1 design system. \| File \| Description \| \|------\|-------------\| \| `00_overview.md` \| UX philosophy + en | 76 |
| `ux/phase-2/COMPLETION_SUMMARY.md` | Markdown | Phase 2 Completion Summary — - ✅ **Auth**: Login, signup, JWT storage/refresh, logout, password reset - ✅ **Home/Search**: Homepage with listings, search with filters, category browsing, restaurant cards with | 49 |
| `ux/phase-2/DONE.md` | Markdown | Phase 2 Complete — All core user flows specified in the UX Phase 2 TODO have been implemented: ✅ **D1 Customer Web**: Auth, Home/Search, Restaurant/Menu, Cart/Checkout, Tracking, Profile/Orders ✅ **D | 12 |
| `ux/phase-2/OPTIONAL_COMPLETIONS.md` | Markdown | Phase 2 Optional Refinements Completed — - [x] Added social login buttons (Google/Facebook) to the login/signup page (placeholders, not functional) - [x] Added customization options (special instructions field) when addin | 20 |
| `ux/phase-2/PHASE_2_COMPLETE.md` | Markdown | UX PHASE 2 - FULLY COMPLETED — - [x] Auth: Complete (login, signup, JWT, logout, password reset) - [x] Home/Search: Complete (listings, search, filters, cards, loading states, banners) - [x] Restaurant/Menu: Com | 57 |
| `ux/phase-2/TODO.md` | Markdown | UX_PHASE_2_TODO.md — Phase 2: Implement core user flows based on the Figma UX architecture from Phase 1. Priority order: - [x] Auth - [x] Home/Search - [x] Restaurant/Menu - [x] Cart/Checkout - [x] Tra | 173 |

---

© 2026 SpiceGarden. All rights reserved.
