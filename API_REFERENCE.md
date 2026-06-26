# API Reference

**Date:** 2026-06-26
**Scope:** SpiceGarden API Endpoints
**Classification:** Evidence-based

## Note

**API endpoints extracted from source code analysis.** Runtime verification requires running backend.

## Authentication

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| POST | /auth/signup | Public | auth.controller.ts |
| POST | /auth/login | Public | auth.controller.ts |
| POST | /auth/otp | Rate Limited | auth.controller.ts |
| GET | /auth/callback | Public | OAuth handlers |

## Orders

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| POST | /orders | JWT | order.controller.ts |
| GET | /orders/:id | JWT | order.controller.ts |
| PATCH | /orders/:id/status | JWT + Permission | order.controller.ts |
| POST | /orders/:id/cancel | JWT + Role | order.controller.ts |

## Restaurants

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| GET | /restaurants | Public | restaurant.controller.ts |
| GET | /restaurants/:id | Public | restaurant.controller.ts |
| POST | /restaurants | JWT + Restaurant Role | restaurant.controller.ts |
| PUT | /restaurants/:id/menu | JWT + Restaurant Role | restaurant.controller.ts |

## Payments

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| POST | /payments | JWT | payments.controller.ts |
| POST | /payments/webhook | Public (verified) | webhook.controller.ts |
| POST | /payments/verify | JWT | payments.controller.ts |
| POST | /refunds | JWT + Admin | refund.controller.ts |

## Wallets

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| GET | /wallet | JWT | wallet.controller.ts |
| POST | /wallet/credit | JWT + Admin | wallet.controller.ts |
| POST | /wallet/debit | JWT | wallet.controller.ts |

## Delivery

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| GET | /delivery/eta | Public | delivery.controller.ts |
| POST | /delivery/assign | JWT + Admin | driver.controller.ts |
| GET | /tracking/:orderId | JWT | tracking.gateway.ts |

## Drivers

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| GET | /drivers/online | JWT + Admin | driver.controller.ts |
| POST | /drivers/:id/location | JWT + Driver | driver.controller.ts |
| GET | /driver-fleet/shifts | JWT + Driver | driver-fleet service |

## Notifications

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| GET | /notifications | JWT | notification controller |
| PATCH | /notifications/:id/read | JWT | notification controller |
| GET | /notifications/preferences | JWT | notification-preferences |

## Loyalty

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| GET | /loyalty/balance | JWT | loyalty.controller.ts |
| POST | /loyalty/redeem | JWT | loyalty.controller.ts |

## Support

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| POST | /support/tickets | JWT | support.controller.ts |
| GET | /support/tickets | JWT | support.controller.ts |

## Analytics

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| GET | /analytics | JWT + Admin | analytics module |
| GET | /analytics/orders | JWT + Admin | analytics module |

## Admin

| Method | Route | Auth | Handler |
|--------|-------|------|---------|
| GET | /admin/stats | JWT + Super Admin | apis.controller.ts |
| GET | /admin/users | JWT + Admin | admin module |

## Health & Monitoring

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | /health | Public | Health check |
| GET | /metrics | Public | Prometheus metrics |

## WebSocket Endpoints

| Path | Purpose |
|------|--------|
| /tracking | Real-time order tracking |
| /kds | Kitchen display updates |

## gRPC Services

| Service | Port | Purpose |
|---------|------|---------|
| order-service | 50051 | Order gRPC API |
| auth-service | 50051 | Auth gRPC API |

## Security Headers (Runtime)

When running, backend applies:
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

## Rate Limiting

| Endpoint | Max Requests | Window |
|----------|--------------|--------|
| /auth/otp | 3 | 10 minutes |
| /auth/ | 5 | 15 minutes |
| /orders | 10 | 15 minutes |
| /api/ | 100 | 15 minutes |

## NOT VERIFIED

- Actual endpoint availability (requires running backend)
- Request/response schemas
- Swagger/OpenAPI documentation
- API versioning strategy