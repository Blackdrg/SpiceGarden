# Feature Capability Matrix

**Generated:** 2026-06-22
**Canonical source:** `docs/CANONICAL_PROJECT_STATE_2026-06-22.md`
**Purpose:** Map SpiceGarden capabilities to required status labels and distinguish repository presence from actual validation.

---

## 1. Status Key

| Status | Meaning |
|---|---|
| Implemented & verified | Code is present and command/runtime/test evidence validates the claim. |
| Implemented but runtime-unverified | Code exists and may build/test, but no runtime validation was completed. |
| Partial / scaffolded | Code exists but is incomplete, placeholder-like, or only partially functional. |
| Stubbed / placeholder | Intentional stub, quarantine, mock, or placeholder module. |
| Broken / failing | A command, gate, or threshold failed in current validation. |
| Blocked from validation | The claim cannot be validated because required external/runtime dependency is unavailable. |
| Not implemented | The capability is absent, not just unvalidated. |

---

## 2. Capability Matrix

| Capability | Status | Evidence | Notes |
|---|---|---|---|
| Backend app module registry | Implemented & verified | `apps/backend/src/app.module.ts:36-71` imports core domain modules. | Local runtime verified. |
| Backend health endpoint | Implemented & verified | `GET /health` returned HTTP 200. | Local runtime. |
| Backend metrics endpoint | Implemented & verified | `GET /metrics` returned HTTP 200 with Prometheus text. | Local runtime. |
| Authentication | Implemented & verified | Auth module/service/controller present; backend runtime and security tests passed. | Local runtime only. |
| Authorization / RBAC | Implemented but runtime-unverified | `apps/backend/src/security/roles.guard.ts`; backend tests pass. | Endpoint coverage not fully audited. |
| User accounts/profile | Implemented but runtime-unverified | User/profile/address/payment-method controllers and services present. | No full live flow validation. |
| Restaurant catalog | Implemented & verified | Restaurant services/controllers/entities present; reduced smoke browsed restaurants. | Local runtime only. |
| Search/filtering | Implemented but runtime-unverified | `apps/backend/src/services/search/` present. | No dedicated live search validation. |
| Cart | Implemented but runtime-unverified | Customer web cart page and services exist. | No live browser validation. |
| Checkout | Partial / scaffolded | `apps/customer-web/src/pages/checkout.tsx` and backend order/payment code exist. | No live checkout/payment validation. |
| Order lifecycle | Implemented & verified | `apps/backend/src/services/order/order.service.ts`; backend tests pass. | Local runtime only. |
| Payment intent/gateway | Partial / scaffolded | `apps/backend/src/services/payments/`; tests use mocks. | No live Stripe/Razorpay validation. |
| Payment webhooks | Implemented but runtime-unverified | Webhook controller/service present. | No live provider webhook validation. |
| Refund flow | Implemented & verified | `apps/backend/src/services/refund/`; backend tests pass. | Local runtime only. |
| Wallet system | Implemented & verified | `apps/backend/src/services/wallet/wallet.service.ts`; tests pass. | Local runtime only. |
| Delivery assignment | Implemented but runtime-unverified | `apps/backend/src/services/delivery/`, `apps/backend/src/modules/driver-assignment/`. | No live multi-device validation. |
| Driver ops/fleet | Implemented but runtime-unverified | Driver, driver-fleet, shift, penalty, incentive code present. | No runtime validation. |
| Live order tracking | Implemented but runtime-unverified | Backend tracking modules and customer mobile WebSocket service exist. | No live socket validation. |
| Kitchen display system | Implemented but runtime-unverified | Kitchen module/controller/service and restaurant dashboard pages exist. | No live KDS runtime validation. |
| Notifications | Partial / scaffolded | `apps/backend/src/services/notifications/` present. | No Twilio/FCM/SendGrid/APNS validation. |
| Reviews/ratings | Implemented but runtime-unverified | Review service/controller/entity present. | No dedicated live validation. |
| Admin analytics | Implemented but runtime-unverified | Analytics module/controller and super-admin pages exist. | No runtime dashboard validation. |
| GST/tax logic | Implemented but runtime-unverified | GST service/controller/entity present. | No live tax validation. |
| Finance/reconciliation | Implemented but runtime-unverified | Finance/reconciliation/tax reporting code present. | No live finance validation. |
| Support tickets | Implemented but runtime-unverified | Support service/controller/entity present. | No live support flow validation. |
| Compliance/GDPR/SOC2/PCI | Partial / scaffolded | Compliance module/services/entities present. | No external compliance validation. |
| Audit logging | Implemented but runtime-unverified | Audit module/service/entity present. | No runtime audit validation. |
| Observability metrics | Implemented & verified | Backend metrics endpoint returned 200; `apps/backend/src/main.ts:19-46`. | Prometheus/Grafana stack runtime blocked. |
| Alerting | Implemented but runtime-unverified | `infra/alertmanager/alertmanager.yml:1-33`. | Stack runtime blocked. |
| Socket.IO server | Implemented but runtime-unverified | Tracking/KDS gateway code present. | No live multi-client validation. |
| Background jobs/queues | Implemented but runtime-unverified | `apps/backend/src/infra/queue/`. | Redis runtime blocked. |
| gRPC transport | Stubbed / placeholder | `packages/grpc-transport/src/index.ts:1-16` throws unavailable error. | Quarantined. |
| Customer web UI | Implemented but runtime-unverified | 24 customer web page/API files. | No browser runtime validation. |
| Restaurant dashboard UI | Implemented but runtime-unverified | 11 restaurant dashboard page/API files. | No browser runtime validation. |
| Super admin UI | Implemented but runtime-unverified | 15 super-admin page/API files. | No browser runtime validation. |
| Customer mobile UI | Implemented but runtime-unverified | 15 customer mobile screens. | No device/emulator validation. |
| Customer mobile order service | Implemented but runtime-unverified | `apps/customer-mobile/src/services/order.service.ts:1-160`. | No live API validation from device. |
| Customer mobile WebSocket service | Implemented but runtime-unverified | `apps/customer-mobile/src/services/websocket.service.ts:1-160`. | No live socket validation. |
| Delivery partner location | Implemented but runtime-unverified | `apps/delivery-partner/src/services/location.service.ts:1-60` uses `expo-location`. | No device/emulator validation. |
| Delivery partner app | Implemented but runtime-unverified | Expo app and services present; `apps/delivery-partner/App.tsx` has pre-existing uncommitted changes. | No device runtime validation. |
| Launcher | Implemented but runtime-unverified | Electron workspace present. | No desktop runtime validation. |
| Docker Compose dev config | Implemented but runtime-unverified | `docker-compose -f compose.dev.yaml config` passed; 13 services. | Stack startup blocked by Docker daemon. |
| Docker Compose infra config | Implemented but runtime-unverified | `docker-compose -f compose.infra.yaml config` passed; 12 services. | Stack startup blocked by Docker daemon. |
| Docker runtime | Blocked from validation | `docker info` failed to connect to daemon. | Not a code failure in repo; environment blocker. |
| Kubernetes manifests | Implemented but runtime-unverified | `infra/k8s/production-hardened.yaml:1-180`. | Server validation blocked by no cluster. |
| Kubernetes deployment | Blocked from validation | `kubectl apply --dry-run=client` failed no API. | No reachable cluster. |
| Deployment validation script | Broken / failing | `node infra/scripts/deployment-check.js` failed with `ERROR: Cannot connect to cluster`. | Cluster unavailable. |
| CI/CD pipeline | Implemented but runtime-unverified | `.github/workflows/ci-cd.yml:1-168`. | Pipeline not executed here. |
| Security middleware | Implemented & verified | `apps/backend/src/main.ts:57-246`; security script passed. | Local runtime only. |
| Runtime security validation | Implemented & verified | `node infra/scripts/security-tests.js` found 0 vulnerabilities. | Normal backend mode only. |
| Penetration validation | Implemented & verified | `node infra/scripts/penetration-tests.js` found 0 issues. | Local runtime only. |
| Dependency audit | Broken / failing | `npm audit --audit-level=moderate` reported 33 vulnerabilities. | Dependency gate fails. |
| Secret validation | Blocked from validation | `node infra/scripts/validate-secrets.js` found 3/16 valid and 13 warnings. | Production provider secrets missing/insecure. |
| Reduced smoke load | Implemented & verified | 5-VU k6 smoke passed with p95 797.07ms. | Local reduced load only. |
| Default smoke load | Broken / failing | 50-VU smoke failed p95 6.3s vs <1500ms. | Latency threshold not met. |
| Full 10k/20k load | Blocked from validation | Not completed; earlier full load hit rate limiting. | Requires stable runtime and tuned load mode. |

---

## 3. Present in Repo vs Actually Validated

| Area | Present in repo | Actually validated |
|---|---|---|
| Backend modules/controllers/entities/services | Yes | Build/tests and local runtime for health/metrics/security. |
| Web routes | Yes | Build/lint/test gates only; no browser runtime. |
| Mobile screens/services | Yes | Build/lint/test gates only; no device/native runtime. |
| Payment provider integration | Yes | Mocked tests only; no live provider validation. |
| Notification provider integration | Yes | No live provider validation. |
| Docker Compose | Yes | Config render only; stack startup blocked. |
| Kubernetes | Yes | Static manifest evidence only; cluster validation blocked. |
| Prometheus/Grafana/Alertmanager | Yes | Backend metrics endpoint only; stack runtime blocked. |
| k6 load scripts | Yes | Reduced smoke pass; default smoke latency fail; full load not completed. |
| gRPC transport | Yes | Quarantined stub; not implemented. |

---

## 4. Confidence by Capability

| Confidence | Capabilities |
|---|---|
| High | Backend build/test, local health, metrics, CORS, method blocking, local security/penetration, reduced smoke register/browse. |
| Medium | Order/refund/wallet backend services, restaurant catalog, web/mobile code presence, compose/K8s config. |
| Low | Live payment providers, live notifications, full WebSocket tracking, Docker runtime, Kubernetes deployment, mobile native/device flows, full load capacity. |
| None | gRPC transport production implementation; it is explicitly quarantined. |

---

## 5. Feature Verdict

SpiceGarden has broad feature coverage and many implemented services, but only a subset is actually validated. The safe statement is: **backend and reduced local smoke flows are verified; most product, mobile, provider, Docker, Kubernetes, and full-load capabilities are present but not runtime-validated.**
