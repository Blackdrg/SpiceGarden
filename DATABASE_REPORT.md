# Database Report

Generated: 2026-06-17T21:30+05:30  
Evidence: `apps/backend/src/db/db.module.ts`, `apps/backend/src/db/entities/*.entity.ts`, compose files, Kubernetes manifests.

## Database Engines

| Engine | Use | Evidence |
| :--- | :--- | :--- |
| PostgreSQL | Primary TypeORM relational store | `DbModule.forRoot(TypeOrmModule.forRoot(...))` |
| MongoDB | Review collection | `MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/spicegarden')` |
| Redis | Queue and optional rate-limit store | `QueueModule`, `security.module.ts`, compose manifests |

## PostgreSQL Entities

| Domain | Entity files |
| :--- | :--- |
| Auth/session | `user.entity.ts`, `session.entity.ts` |
| Customer data | `address.entity.ts`, `payment-method.entity.ts` |
| Restaurants | `restaurant.entity.ts`, `restaurant-business.entity.ts`, `restaurant-onboarding.entity.ts`, `restaurant-operation.entity.ts`, `restaurant-menu.entity.ts`, `restaurant-menu-category.entity.ts`, `restaurant-menu-item.entity.ts`, `restaurant-menu-item-customization-option.entity.ts`, `restaurant-menu-item-customization-option-group.entity.ts`, `restaurant-customization.entity.ts`, `restaurant-customization-option.entity.ts`, `restaurant-customization-option-group.entity.ts` |
| Orders | `order.entity.ts`, `order-item.entity.ts`, `order-status-history.entity.ts`, `driver-assignment.entity.ts`, `kitchen-order.entity.ts`, `kitchen-order-item.entity.ts`, `kitchen-order-status-history.entity.ts` |
| Payments | `payment.entity.ts`, `payment-provider.entity.ts`, `refund.entity.ts`, `chargeback.entity.ts` |
| Finance | `finance-record.entity.ts`, `finance-ledger-entry.entity.ts`, `finance-ledger.entity.ts`, `gst-report.entity.ts`, `gst-setting.entity.ts`, `gst-rule.entity.ts` |
| Wallet | `wallet.entity.ts`, `wallet-transaction.entity.ts` |
| Loyalty | `loyalty-point.entity.ts`, `loyalty-transaction.entity.ts`, `loyalty-tier.entity.ts`, `loyalty-campaign.entity.ts`, `loyalty-campaign-rule.entity.ts` |
| Support | `support-ticket.entity.ts`, `support-message.entity.ts` |
| Search/maps | `search-query.entity.ts`, `map-route.entity.ts`, `map-location.entity.ts` |
| Reviews | `review.entity.ts` |
| Admin | `admin-audit-log.entity.ts` |
| Driver | `driver.entity.ts`, `driver-fleet.entity.ts`, `driver-ops.entity.ts` |

## Database Module Evidence

`apps/backend/src/db/db.module.ts` imports:

- TypeORM for PostgreSQL with `entities`, `synchronize: true`, `logging: true`.
- Mongoose for MongoDB reviews.
- Entity imports for 40 PostgreSQL entities plus `ReviewSchema`.

## Schema Gaps

- `synchronize: true` is enabled in `db.module.ts`, which is convenient for development but should not be used in production.
- `logging: true` is enabled in `db.module.ts`, which can expose sensitive query values in logs.
- Entity files define relations and columns, but no migration files were found in the repository scan.

## Infrastructure Evidence

| File | Evidence |
| :--- | :--- |
| `compose.yaml` | PostgreSQL, Redis, Mongo services |
| `compose.dev.yaml` | PostgreSQL, Redis, Mongo plus Prometheus, Grafana, OpenSearch, Alertmanager |
| `compose.infra.yaml` | PostgreSQL, Redis, Mongo plus observability, Filebeat, Sentry, secrets |
| `infra/k8s/production-hardened.yaml` | PostgreSQL PVC and backend ConfigMap/Secret references |
| `infra/k8s/staging.yaml` | Staging service configuration |

## Database Readiness

- The schema surface is broad and covers the main SpiceGarden domains.
- Production readiness is limited by lack of verified migrations, `synchronize: true`, and enabled SQL logging.
