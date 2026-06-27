# Feature Matrix

This document provides a comprehensive feature inventory validated against actual source code. Every feature listed is confirmed implemented in the repository.

## Authentication & Authorization

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Email/Password Login | `AuthService.validateUser()` | `src/services/auth/auth.service.ts` | ACTIVE |
| Customer Registration | `AuthController.register()` | `src/services/auth/auth.controller.ts:58` | ACTIVE |
| JWT Token Refresh | `AuthController.refreshToken()` | `src/services/auth/auth.controller.ts:80` | ACTIVE |
| Session Management | `SessionEntity` with device tracking | `src/db/entities/session.entity.ts` | ACTIVE |
| OAuth2 Google | passport-google-oauth20 strategy | `src/services/auth/strategies/` | ACTIVE |
| OAuth2 Facebook | passport-facebook strategy | `src/services/auth/strategies/` | ACTIVE |
| Logout | Session revocation | `src/services/auth/auth.controller.ts` | ACTIVE |
| Password Hashing | argon2 primary + bcrypt fallback | `src/services/auth/auth.service.ts` | ACTIVE |
| OTP Verification | `OtpEntity` hashed storage | `src/db/entities/otp.entity.ts` | ACTIVE |
| Device Fingerprinting | `DeviceFingerprintEntity` | `src/db/entities/device-fingerprint.entity.ts` | ACTIVE |
| RBAC | 8 roles with permission mapping | `src/security/permissions.ts` | ACTIVE |
| PBAC | Fine-grained permission checks | `src/security/permission.guard.ts` | ACTIVE |
| RolesGuard | Controller/method level | `src/security/roles.guard.ts` | ACTIVE |
| PermissionGuard | Resource ownership check | `src/security/permission.guard.ts` | ACTIVE |

## Order Management

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Order Placement | Customer creates order | `src/services/order/order.service.ts` | ACTIVE |
| Item Validation | Min 1 item, positive quantity, valid IDs | `src/services/order/order.service.ts:48` | ACTIVE |
| Total Validation | Subtotal+tax+delivery = grandTotal | `src/services/order/order.service.ts:72` | ACTIVE |
| Status State Machine | 12 states with transition rules | `src/services/order/order.service.ts:96` | ACTIVE |
| Order History | Customer order list | `src/services/order/order.controller.ts` | ACTIVE |
| Order Details | Order detail view | `src/services/order/order.controller.ts` | ACTIVE |
| Order Cancellation | Customer/admin cancel | `src/services/order/order.service.ts` | ACTIVE |
| Order Tracking | Realtime tracking | `src/modules/orders/orders.controller.ts` | ACTIVE |
| Order Items | Line items with addons | `src/db/entities/order-item.entity.ts` | ACTIVE |
| GST Details | Per-order GST breakdown | `src/db/entities/gst-detail.entity.ts` | ACTIVE |
| Queue Processing | BullMQ ORDER_LIFECYCLE | `src/infra/queue/order.processor.ts` | ACTIVE |
| Order Search | Menu/restaurant search | `src/services/search/search.service.ts` | ACTIVE |

## Payment System

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Payment Intents | Stripe + Razorpay | `src/services/payments/payments.controller.ts` | ACTIVE |
| Payment Capture | Webhook-driven capture | `src/services/payments/payments.service.ts` | ACTIVE |
| Payment Confirmation | `POST /payments/confirm` | `src/services/payments/payments.controller.ts` | ACTIVE |
| Fraud Hardening | Pre-payment validation | `src/services/payments/fraud-hardening.service.ts` | ACTIVE |
| Retry Logic | Exponential backoff | `src/services/payments/retry.service.ts` | ACTIVE |
| Idempotency Keys | Request deduplication | `src/services/payments/idempotency.service.ts` | ACTIVE |
| Payment Hardening | Amount + webhook validation | `src/services/payments/payment-hardening.service.ts` | ACTIVE |
| Stripe Webhooks | Signature verified | `src/services/payments/webhook.controller.ts` | ACTIVE |
| Razorpay Webhooks | Signature verified | `src/services/payments/webhook.controller.ts` | ACTIVE |
| Webhook Retry Queue | `WebhookRetryQueueEntity` | `src/db/entities/webhook-retry-queue.entity.ts` | ACTIVE |
| COD Support | Cash on delivery gateway | `src/services/payments/cod.service.ts` | ACTIVE |
| Chargeback Management | Dispute handling module | `src/services/payments/chargeback/` | ACTIVE |
| Payment Methods CRUD | Multiple methods per user | `src/services/users/payment-methods.controller.ts` | ACTIVE |
| Gateway Selection | Configurable per request | `gateway-factory.service.ts` | ACTIVE |
| Reconciliation | Daily/weekly reports | `src/services/finance/reconciliation.service.ts` | ACTIVE |

## Restaurant Management

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Restaurant CRUD | Create/read/update | `src/services/restaurant/restaurant.controller.ts` | ACTIVE |
| Multi-branch Support | Branch management | `src/db/entities/restaurant-branch.entity.ts` | ACTIVE |
| Menu Categories | Hierarchical categories | `src/db/entities/menu-category.entity.ts` | ACTIVE |
| Menu Items | Items with pricing | `src/db/entities/menu-item.entity.ts` | ACTIVE |
| Menu Addons | Customizations | `src/db/entities/menu-addon.entity.ts` | ACTIVE |
| Menu Variants | Size/portion variants | `src/db/entities/menu-variant.entity.ts` | ACTIVE |
| Menu Moderation | Approval queue | `src/db/entities/menu-moderation.entity.ts` | ACTIVE |
| Day-of-week Availability | Per-item schedules | `src/db/entities/menu-item-availability.entity.ts` | ACTIVE |
| Restaurant Onboarding | Multi-step flow | `src/services/restaurant/onboarding.controller.ts` + frontend | ACTIVE |
| Business Metrics | Revenue, orders, commission | `src/services/restaurant/business-engine.controller.ts` | ACTIVE |
| Commission Management | Per-restaurant rates | `src/db/entities/commission-rule.entity.ts` | ACTIVE |
| Restaurant Operations | Accept/reject/ready orders | `src/services/restaurant/restaurant-ops.controller.ts` | ACTIVE |
| Cuisine Types | Categorization | `restaurants` table cuisine_type | ACTIVE |
| Veg/Non-veg Flag | Menu item flag | `menu_items.is_veg` | ACTIVE |
| Spice Level | 0-3 scale | `menu_items.spice_level` | ACTIVE |

## Kitchen Management

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Kitchen Display System | WebSocket KDS | `restaurant-dashboard/src/pages/index.tsx` | ACTIVE |
| Order Status Board | Status ribbon with counts | KDS component | ACTIVE |
| Batch Mode | Group by status | KDS batch toggle | ACTIVE |
| Delay Tracking | Elapsed vs estimated time | KDS component | ACTIVE |
| DELAYED Badge | Overtime indicator | KDS component | ACTIVE |
| Park Orders | Set aside orders | KDS park button | ACTIVE |
| Audio Alerts | Base64 WAV playback | KDS component | ACTIVE |
| Inventory Management | Stock tracking | `src/modules/kitchen/` | ACTIVE |
| Inventory Alerts | Low stock/expiary | `src/db/entities/inventory-alert.entity.ts` | ACTIVE |
| SLA Monitoring | Prep time tracking | `src/db/entities/kitchen-sla.entity.ts` | ACTIVE |
| Batch Production | Batch tracking | `src/db/entities/batch.entity.ts` | ACTIVE |
| Food Prep Logging | Preparation records | `src/db/entities/food-prep.entity.ts` | ACTIVE |
| Recipes/BOM | Bill of materials | `src/db/entities/recipe.entity.ts` | ACTIVE |
| Supplier Management | Supplier records | `src/db/entities/supplier.entity.ts` | ACTIVE |
| Branch Control | Max concurrent orders, auto-accept | `src/db/entities/branch-control.entity.ts` | ACTIVE |

## Delivery Operations

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Driver Onboarding | KYC document upload | `src/services/delivery/driver-onboarding.service.ts` | ACTIVE |
| Document Verification | License, Aadhar, PAN, RC, Insurance | `src/db/entities/driver-document.entity.ts` | ACTIVE |
| Driver Availability | Online/offline toggle | `src/services/delivery/driver-ops.controller.ts` | ACTIVE |
| Intelligent Assignment | Proximity + ETA + scoring | `src/modules/driver-assignment/` | ACTIVE |
| Driver Earnings | Available/pending/weekly/today | `src/services/delivery/` | ACTIVE |
| Shift Management | Scheduled/ongoing shifts | `src/db/entities/driver-shift.entity.ts` | ACTIVE |
| ETA Calculation | `ETAIntelligenceService` | `src/modules/driver-assignment/eta-intelligence.service.ts` | ACTIVE |
| Real-time Tracking | Socket.IO location updates | `src/infra/tracking/tracking.gateway.ts` | ACTIVE |
| OTP Verification | Pickup/delivery OTP | `otp.entity.ts` + delivery flow | ACTIVE |
| Driver Scoring | Delivery, behavior, punctuality | `src/db/entities/driver-score.entity.ts` | ACTIVE |
| Driver Incentives | Automatic evaluation | `src/db/entities/driver-incentive.entity.ts` | ACTIVE |
| Driver Penalties | Cancellation/delay/behavior | `src/db/entities/driver-penalty.entity.ts` | ACTIVE |
| Driver Fraud Detection | Pattern analysis | `src/db/entities/driver-fraud.entity.ts` | ACTIVE |
| Surge Zones | Dynamic pricing | `src/db/entities/surge-zone.entity.ts` | ACTIVE |

## Customer Features

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Restaurant Discovery | Home page listing | `apps/customer-web/src/pages/index.tsx` | ACTIVE |
| Search | Search screen with filters | `apps/customer-web/src/pages/search.tsx` | ACTIVE |
| Menu Browsing | Menu screen | `apps/customer-web/src/pages/menu.tsx` | ACTIVE |
| Customization | Addons/variants selection | `apps/customer-web/src/pages/menu.tsx` | ACTIVE |
| Cart Management | Quantity controls, bill summary | `apps/customer-web/src/pages/cart.tsx` | ACTIVE |
| Checkout | Payment + address + tip + promo | `apps/customer-web/src/pages/checkout.tsx` | ACTIVE |
| Order History | Status filter, reorder | `apps/customer-web/src/pages/history.tsx` | ACTIVE |
| Live Tracking | Status timeline + map | `apps/customer-web/src/pages/tracking.tsx` | ACTIVE |
| Address Management | CRUD addresses | `apps/customer-web/src/pages/addresses.tsx` | ACTIVE |
| Payment Methods | CRUD payment methods | `apps/customer-web/src/pages/payment-methods.tsx` | ACTIVE |
| Profile Management | View/edit profile | `apps/customer-web/src/pages/profile.tsx` | ACTIVE |
| Notifications | In-app notification center | `apps/customer-web/src/pages/notifications.tsx` | ACTIVE |
| Offers/Deals | Promotions page | `apps/customer-web/src/pages/offers.tsx` | ACTIVE |
| Subscriptions | Prime, weekly meal | `apps/customer-web/src/pages/subscriptions.tsx` | ACTIVE |
| Wallet | Balance + transactions | `apps/customer-web/src/pages/wallet.tsx` | ACTIVE |
| Offline Mode | Request queue | `useOfflineQueue` hook | ACTIVE |
| Auth Screens | Login/register | `apps/customer-web/src/pages/auth.tsx` | ACTIVE |
| Legal Pages | Privacy, Terms | `apps/customer-web/src/pages/legal/` | ACTIVE |
| Password Reset | Reset flow | `apps/customer-web/src/pages/reset-password.tsx` | ACTIVE |
| OAuth Callback | Google/FB callback | `apps/customer-web/src/pages/auth/callback.tsx` | ACTIVE |

## Admin Features

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Admin Dashboard | Overview with KPIs | `apps/super-admin/src/pages/index.tsx` | ACTIVE |
| Platform Metrics | Revenue, orders, users, drivers | `src/modules/analytics/` | ACTIVE |
| Live Order Feed | Realtime orders | Super-admin Orders tab | ACTIVE |
| Branch Monitoring | Kitchen status grid | Super-admin Branches tab | ACTIVE |
| Support Tickets | 4-column ticket management | Super-admin Support tab | ACTIVE |
| Refund Management | Refund approval flow | Super-admin RefundManagement | ACTIVE |
| Fraud Detection | Fraud ticket list | Super-admin FraudDetection | ACTIVE |
| Revenue Charts | Recharts AreaChart | Super-admin RevenueChart | ACTIVE |
| Delivery Heatmap | Density visualization | Super-admin + Analytics API | ACTIVE |
| User Management | List/update users | `src/services/admin/admin.controller.ts` | ACTIVE |
| Role Management | Change user roles | Admin endpoints | ACTIVE |
| System Health | Health endpoint | Admin endpoints | ACTIVE |

## Loyalty & Promotions

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Coupon System | Percentage/fixed, limits | `src/services/loyalty/loyalty.service.ts` | ACTIVE |
| Coupon Application | At checkout | `src/services/loyalty/loyalty.controller.ts` | ACTIVE |
| Referral Program | Unique codes, rewards | `src/db/entities/referral.entity.ts` | ACTIVE |
| Cashback Processing | Wallet credit | `src/services/loyalty/loyalty.service.ts` | ACTIVE |
| Subscription | Prime, weekly meal | `src/db/entities/subscription.entity.ts` | ACTIVE |

## Support & Disputes

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Support Tickets | Create/read/update | `src/services/support/support.controller.ts` | ACTIVE |
| Ticket Routing | Type + priority-based | `src/services/support/ticket-routing.service.ts` | ACTIVE |
| Payment Disputes | Chargeback tracking | `src/db/entities/payment-dispute.entity.ts` | ACTIVE |
| Dispute Resolution | Workflow | Dispute flow | ACTIVE |

## Compliance

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| GDPR/DPDP Data Export | JSON/CSV export | `src/compliance/` | ACTIVE |
| Data Deletion | User delete flow | `src/db/entities/deletion-request.entity.ts` | ACTIVE |
| Audit Logging | All actions logged | `src/db/entities/audit-log.entity.ts` | ACTIVE |

## Realtime Features

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Order Tracking | Socket.IO tracking | `TrackingGateway` + useTracking hook | ACTIVE |
| Kitchen Updates | KDS WebSocket | `KdsGateway` + restaurant-dashboard | ACTIVE |
| Admin Live Feed | Socket.IO admin | Super-admin WebSocket | ACTIVE |
| Driver Events | Real-time events | `TrackingGateway.driverEvent` | ACTIVE |
| Location Updates | GPS streaming | `TrackingGateway.updateLocation` | ACTIVE |
| Message Ack Protocol | Timeout-based | `TrackingGateway` ack system | ACTIVE |

## UI Component Library

| Feature | Implementation | File | Status |
|---------|---------------|------|--------|
| Button | 6 variants, 3 sizes | `packages/ui/Button.tsx` | ACTIVE |
| Card | 3 variants | `packages/ui/Card.tsx` | ACTIVE |
| Input | Labeled, error states | `packages/ui/Input.tsx` | ACTIVE |
| Dropdown | Custom select | `packages/ui/Dropdown.tsx` | ACTIVE |
| Modal | Accessible, animated | `packages/ui/Modal.tsx` | ACTIVE |
| BottomSheet | Mobile variant | `packages/ui/Modal.tsx` | ACTIVE |
| Toast | Context-based notification | `packages/ui/Toast.tsx` | ACTIVE |
| Stepper | Numeric increment/decrement | `packages/ui/Stepper.tsx` | ACTIVE |
| OTPInput | 4/6 digit, paste support | `packages/ui/OTPInput.tsx` | ACTIVE |
| SearchInput | Debounced search | `packages/ui/SearchInput.tsx` | ACTIVE |
| Skeleton | 3 variants | `packages/ui/Skeleton.tsx` | ACTIVE |
| SkeletonTemplates | Domain-specific | `packages/ui/SkeletonTemplates.tsx` | ACTIVE |
| LoadingStates | Empty/error/loading | `packages/ui/LoadingStates.tsx` | ACTIVE |
| LottieSuccessAnimation | SVG-based | `packages/ui/LottieSuccessAnimation.tsx` | ACTIVE |
| FlowManager | Multi-step wizard | `packages/ui/FlowManager.tsx` | ACTIVE |
| ErrorBoundary | Class-based boundary | `packages/ui/ErrorBoundary.tsx` | ACTIVE |
| FoodCard | Dish display | `packages/ui/Cards.tsx` | ACTIVE |
| MenuCard | 3 variants | `packages/ui/Cards.tsx` | ACTIVE |
| MapCard | Delivery ETA | `packages/ui/Cards.tsx` | ACTIVE |
| TrackingCard | Delivery status | `packages/ui/Cards.tsx` | ACTIVE |
| ReviewCard | Star + text | `packages/ui/Cards.tsx` | ACTIVE |
| useFlow Hook | Flow state management | `packages/ui/useFlow.ts` | ACTIVE |
| useReducedMotion | Motion preference | `packages/ui/tokens.ts` | ACTIVE |
| 19 Domain Icons | lucide-react wrappers | `packages/ui/icons/` | ACTIVE |
| Design Tokens | Complete token system | `packages/ui/tokens.ts` | ACTIVE |
| Analytics | trackEvent, useWebVitals | `packages/ui/analytics.ts` | ACTIVE |

## Infrastructure Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| Docker Compose | 13 services | ACTIVE |
| Kubernetes Manifests | 8 production-ready YAMLs | ACTIVE |
| Multi-stage Docker | All apps | ACTIVE |
| Health Checks | All services | ACTIVE |
| Resource Limits | CPU/memory | ACTIVE |
| Rolling Updates | K8s deployment | ACTIVE |
| HPA | 3-20 replicas | ACTIVE |
| PodDisruptionBudget | minAvailable:2 | ACTIVE |
| NetworkPolicy | Restricted ingress/egress | ACTIVE |
| Backup CronJob | Daily at 2AM | ACTIVE |
| TLS Support | cdn-ingress.yaml | ACTIVE |
| Security Context | runAsNonRoot, drop ALL caps | ACTIVE |
| Read-only Filesystem | All containers | ACTIVE |
| Prometheus Metrics | /metrics endpoint | ACTIVE |
| Grafana Dashboards | Provisioned | ACTIVE |
| Alertmanager | Slack + PagerDuty | ACTIVE |
| Sentry | Backend + 2 frontends | ACTIVE |
| OpenSearch | Log aggregation | ACTIVE |
| Filebeat | Log shipping | ACTIVE |
| 36 Operational Scripts | Backup, security, load, chaos | ACTIVE |

## Mobile Features

### Customer Mobile

| Feature | Implementation | Status |
|---------|---------------|--------|
| Login/Register | JWT + AsyncStorage | ACTIVE |
| Navigation | Native Stack + Bottom Tabs | ACTIVE |
| Restaurant Discovery | Home screen | ACTIVE |
| Search | Search screen | ACTIVE |
| Menu Browsing | Restaurant + MenuItem screens | ACTIVE |
| Customization | MenuItemCustomizationScreen | ACTIVE |
| Cart | Local state cart | ACTIVE |
| Checkout | Payment + address | ACTIVE |
| Address Management | CRUD addresses | ACTIVE |
| Payment Methods | CRUD payment methods | ACTIVE |
| Order History | History screen | ACTIVE |
| Order Details | OrderDetailsScreen | ACTIVE |
| Live Tracking | Socket.IO tracking | ACTIVE |
| Notifications | Push via expo-notifications | ACTIVE |
| i18n | 7 locales | ACTIVE |
| Offline Cache | AsyncStorage | ACTIVE |

### Delivery Partner

| Feature | Implementation | Status |
|---------|---------------|--------|
| Login | JWT + AsyncStorage | ACTIVE |
| Registration/KYC | Driver onboarding | ACTIVE |
| Toggle Online/Offline | Availability API | ACTIVE |
| Accept/Reject Orders | Delivery API | ACTIVE |
| Status Updates | Picked up / Delivered / Failed | ACTIVE |
| OTP Verification | Pickup/delivery OTP | ACTIVE |
| Earnings Dashboard | Summary API | ACTIVE |
| Location Tracking | expo-location | ACTIVE |
| WebSocket Events | orderAssigned, orderCancelled | ACTIVE |
| Dual-write Location | Socket.IO + HTTP | ACTIVE |
