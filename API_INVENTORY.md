# API Inventory
Generated: 2026-06-16T01:10:40+05:30

## Verification Source
Grep of route decorator patterns across apps/backend/src/ controllers.

## Confidence Level
MEDIUM — 263 route decorators detected via pattern matching; exact list requires full ts-node scan.

## NOT VERIFIED
Exact endpoint list with auth requirements and guard details (requires running ts-node on the compiled module).

---

## Endpoint Method Distribution

| Method | Count |
| :--- | ---: |
| GET | 128 |
| POST | 99 |
| PUT | 29 |
| DELETE | 5 |
| PATCH | 2 |
| **Total** | **263** |

## Controller Inventory

| Controller | Estimated Routes |
| :--- | ---: |
| kitchen.controller.ts | 25 |
| compliance.controller.ts | 21 |
| restaurant-ops.controller.ts | 17 |
| driver-assignment.controller.ts | 15 |
| driver.controller.ts | 11 |
| driver-fleet.controller.ts | 11 |
| wallet.controller.ts | 10 |
| loyalty.controller.ts | 10 |
| onboarding.controller.ts | 9 |
| driver-ops.controller.ts | 9 |
| support.controller.ts | 8 |
| analytics.controller.ts | 8 |
| business-engine.controller.ts | 8 |
| user-profile.controller.ts | 8 |
| refund.controller.ts | 7 |
| notification-queue.controller.ts | 7 |
| maps.controller.ts | 6 |
| payment-provider.controller.ts | 6 |
| chargeback.controller.ts | 5 |
| restaurant.controller.ts | 5 |
| finance.controller.ts | 5 |
| apis.controller.ts | NOT VERIFIED |

## WebSocket Events (from Gateway Files)

| Gateway | Namespace | Events |
| :--- | :--- | :--- |
| TrackingGateway | /tracking, /kds, /admin, /driver | ping, join, ack, message, updateLocation, kdsUpdate, driverEvent |
| KdsGateway | kds | newOrder, updatePrepStatus, orderStatusUpdated |

## Frontend API Consumption (Verified)

| App | API Base URL |
| :--- | :--- |
| customer-web | NEXT_PUBLIC_API_URL || http://localhost:3001/api |
| delivery-partner | API_BASE_URL / NEXT_PUBLIC_API_URL / https://api.spicegarden.com / http://localhost:3001 |
| super-admin | NEXT_PUBLIC_API_URL || http://localhost:3001/api |
| restaurant-dashboard | http://localhost:3001 (Socket.IO) |

---

## 2026-06-17 Repository-Wide Audit Update

**Generated:** 2026-06-17T21:30+05:30  
**Method:** Append-only audit update; historical API inventory preserved.

### Endpoint Count

The 2026-06-17 scan supersedes the older 263-count estimate because it scans tracked controller files and excludes generated artifacts.

| Metric | Count |
| :--- | ---: |
| REST endpoint decorators | 259 |
| Controller files | 41 |
| GET endpoints | 124 |
| POST endpoints | 99 |
| PUT endpoints | 29 |
| PATCH endpoints | 2 |
| DELETE endpoints | 5 |

### Guard Evidence

- `JwtAuthGuard`, `RolesGuard`, and `ThrottlerGuard` are present in backend security modules.
- The audit scan found 41 controller files.
- 106 REST endpoints are in controller files with no guard evidence from the scan.

### Representative API Domains

| Domain | Evidence |
| :--- | :--- |
| Auth | `apps/backend/src/services/auth/auth.controller.ts`, `auth.service.ts` |
| Users | `apps/backend/src/controllers/user.controller.ts` |
| Orders | `apps/backend/src/controllers/order.controller.ts`, `driver.controller.ts`, `driver-assignment.controller.ts` |
| Restaurants | `apps/backend/src/controllers/restaurant/*.controller.ts` |
| Payments | `apps/backend/src/controllers/payments.controller.ts`, `payment-provider.controller.ts`, `payments/webhook.controller.ts` |
| Wallets | `apps/backend/src/controllers/wallet.controller.ts` |
| Refunds | `apps/backend/src/controllers/refund.controller.ts` |
| Chargebacks | `apps/backend/src/controllers/chargeback.controller.ts` |
| Support | `apps/backend/src/controllers/support.controller.ts` |
| Search | `apps/backend/src/controllers/search.controller.ts` |
| Loyalty | `apps/backend/src/controllers/loyalty.controller.ts` |
| Notifications | `apps/backend/src/controllers/notifications/*.controller.ts` |
| Kitchen | `apps/backend/src/controllers/kitchen.controller.ts` |
| Finance | `apps/backend/src/controllers/finance.controller.ts` |
| Metrics | `apps/backend/src/metrics/metrics.controller.ts` |

### API Security Notes

- The auth controller is throttled at 10 requests per 60 seconds by `security.module.ts`.
- `apps/backend/src/security/cors-origin.ts` rejects wildcard origins and normalizes `CORS_ALLOWED_ORIGINS`.
- Webhook endpoints are public by design and should be verified for signature validation at runtime.
