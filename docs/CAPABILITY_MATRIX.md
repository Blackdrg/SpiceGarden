# Capability Matrix

**Date:** 2026-06-23

---

## Platform Capabilities

| Capability | Implementation Status | Test Status | Runtime Status | Evidence |
| ---------- | ------------------- | ----------- | -------------- | -------- |
| Authentication | ✅ Implemented | ✅ Tests pass | ⚠️ Local only | `apps/backend/src/services/auth/` |
| RBAC (roles) | ⚠️ Partial | ✅ Tests pass | ⚠️ Unverified | `apps/backend/src/security/roles.guard.ts` |
| User accounts | ✅ Implemented | ✅ Tests pass | ⚠️ Unverified | user.entity.ts |
| Restaurant catalog | ✅ Implemented | ✅ Tests pass | ⚠️ Unverified | restaurant.controller.ts |
| Menu management | ✅ Implemented | ✅ Tests pass | ⚠️ Unverified | menu-item.entity.ts |
| Search/filter | ⚠️ Partial | ⚠️ Limited | ⚠️ Unverified | customer-web/src/pages/search.tsx |
| Cart | ⚠️ Partial | ⚠️ Limited | ⚠️ Unverified | customer-web/src/pages/cart.tsx |
| Checkout | ⚠️ Partial | ⚠️ Limited | ⚠️ Unverified | customer-web/src/pages/checkout.tsx |
| Payment integration | ⚠️ Partial | ✅ Tests mock | ❌ No live validation | stripe-gateway.service.ts, razorpay-gateway.service.ts |
| Refunds | ✅ Implemented | ✅ Tests pass | ⚠️ Unverified | refund.service.ts |
| Wallet system | ✅ Implemented | ✅ Tests pass | ⚠️ Unverified | wallet.service.ts |
| Delivery assignment | ⚠️ Partial | ✅ Tests pass | ⚠️ Unverified | driver-assignment.service.ts |
| Live tracking | ⚠️ Partial | ⚠️ Partial | ❌ No live validation | tracking.gateway.ts |
| Notifications (email/SMS) | ⚠️ Partial | ⚠️ Partial | ❌ No provider validation | notification.service.ts |
| Push notifications (FCM/APNs) | ❌ Blocked | ❌ No tests | ❌ No validation | FCM_SERVER_KEY missing |
| Reviews/ratings | ⚠️ Partial | ⚠️ Limited | ⚠️ Unverified | review entities exist |
| Analytics | ⚠️ Partial | ⚠️ Limited | ⚠️ Unverified | analytics module exists |
| GST/Tax logic | ⚠️ Partial | ✅ Tests pass | ⚠️ Unverified | tax-reporting.service.ts |
| Compliance logging | ⚠️ Partial | ✅ Tests pass | ⚠️ Unverified | compliance.service.ts |
| Audit logging | ⚠️ Partial | ✅ Tests pass | ⚠️ Unverified | audit.service.ts |
| Observability | ⚠️ Partial | ⚠️ Partial | ❌ Docker blocked | Prometheus/Grafana configs |
| Real-time sockets | ⚠️ Partial | ⚠️ Limited | ❌ No live validation | tracking.gateway.ts, socket.io |
| Background jobs/queues | ⚠️ Partial | ⚠️ Limited | ❌ Redis blocked | BullMQ + RedisRateLimitStore |
| gRPC transport | ❌ Stubbed | ❌ No tests | ❌ Quarantined | `GrpcTransportUnavailableError` |

---

## Status Legend

- ✅ Implemented & verified — code exists, tests pass
- ⚠️ Implemented but runtime-unverified — code/tests exist, no live proof
- ❌ Partial / scaffolded — incomplete implementation
- ⚠️ Blocked — requires infrastructure/runtime