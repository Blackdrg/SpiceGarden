# Application Package Matrix

**Date:** 2026-06-23

---

## Application Capabilities

| Application | Auth | Orders | Payments | Delivery | Notifications | Analytics | Wallet | Status |
| ----------- | ---- | ------ | -------- | -------- | ------------- | --------- | ------ | ------ |
| backend | ✅ | ✅ | ⚠️ Partial | ✅ | ⚠️ Partial | ✅ | ✅ | Implemented & tested |
| customer-web | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Implemented but runtime-unverified |
| restaurant-dashboard | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Implemented but runtime-unverified |
| super-admin | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Implemented but runtime-unverified |
| customer-mobile | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Implemented but runtime-unverified |
| delivery-partner | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Implemented but runtime-unverified |
| launcher | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Electron wrapper only |
| driver-app | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Stubbed |

---

## Shared Package Usage

| Package | Used By | Purpose | Status |
| ------- | ------- | ------- | ------ |
| `@spicegarden/ui` | customer-web, restaurant-dashboard, super-admin, customer-mobile, delivery-partner | Shared React components | ✅ Pass |
| `@spicegarden/shared` | backend, all frontends | Utility functions | ✅ Pass |
| `@spicegarden/api-types` | All apps | API contract types | ⚠️ Runtime-unverified |
| `@spicegarden/proto` | backend | Protobuf types | ⚠️ Runtime-unverified |
| `@spicegarden/grpc-transport` | None (quarantined) | gRPC transport stub | Stubbed |

---

## Backend Service Modules

| Service | Entity | Controller | Tests | Status |
| ------- | ------ | ---------- | ----- | ------ |
| auth | ✅ user, session | ✅ auth.controller | 6 suites | ✅ Pass |
| restaurant | ✅ restaurant, menu, branch | ✅ restaurant.controller | Tests present | ✅ Pass |
| order | ✅ order, order-item | ✅ order.controller | 2 suites | ✅ Pass |
| delivery | ✅ driver, assignment | ✅ delivery.controller | 2 suites | ✅ Pass |
| payments | ✅ payment, webhook, fraud | ✅ payments.controller | 4 suites | ⚠️ Partial |
| refund | ✅ refund, approval | ✅ refund.controller | 1 suite | ✅ Pass |
| wallet | ✅ wallet, transaction | ✅ wallet.controller | 2 suites | ✅ Pass |
| notifications | ✅ notification, preference | ⚠️ handler | ⚠️ Partial | ⚠️ Partial |
| GST | ✅ gst-detail, hsn-sac | ✅ gst.controller | 1 suite | ⚠️ Unverified |
| audit | ✅ audit-log | ⚠️ | 1 suite | ⚠️ Unverified |
| compliance | ✅ compliance-log | ⚠️ | 1 suite | ⚠️ Unverified |
| analytics | Various entities | ⚠️ | Tests present | ⚠️ Unverified |
| tracking | ✅ order | ✅ tracking.gateway | ⚠️ Unverified | ⚠️ Unverified |