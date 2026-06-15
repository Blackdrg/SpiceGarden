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
| :--- | :---: |
| GET | 128 |
| POST | 99 |
| PUT | 29 |
| DELETE | 5 |
| PATCH | 2 |
| **Total** | **263** |

## Controller Inventory

| Controller | Estimated Routes |
| :--- | :---: |
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
