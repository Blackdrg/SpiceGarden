# SpiceGarden Feature Matrix

**Version:** 0.0.0  
**Last Updated:** 2026-06-27  
**Source:** Verified against actual implementation

---

## Feature Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete — implements end-to-end, wired, tested |
| 🟡 | Partial — partial implementation, some gaps |
| 🔴 | Missing — not implemented or placeholder |

---

## Backend Features

| Feature | Status | Notes |
|---------|--------|-------|
| User registration | ✅ | Email/phone validation, argon2 password |
| User login | ✅ | JWT + session cookies |
| User logout | ✅ | Session revocation |
| Password reset | ✅ | OTP-based 3-step flow |
| Social login (Google) | ✅ | OAuth2 callback |
| Social login (Facebook) | ✅ | OAuth2 callback |
| Profile management | ✅ | CRUD via UserProfileService |
| Address management | ✅ | CRUD with spatial indexing |
| Payment method management | ✅ | Card/UPI CRUD |
| Device fingerprinting | ✅ | Trusted device tracking |
| Session management | ✅ | Device + IP tracking |
| Soft delete users | ✅ | `softDelete` column |
| Order placement | ✅ | Full validation, idempotency |
| Order status transitions | ✅ | 8-step lifecycle engine |
| Order cancellation | ✅ | Atomic cancellation |
| Order history | ✅ | Paginated, filtered |
| Partial refunds | ✅ | Per-item refund support |
| Order batching | ✅ | Batch mode in KDS |
| Stripe payments | ✅ | Full gateway integration |
| Razorpay payments | ✅ | Full gateway integration |
| COD payments | ⚠️ | Mock implementation |
| Payment webhooks | ✅ | Stripe + Razorpay signature verification |
| Payment idempotency | ✅ | 5-min staleness keys |
| Payment retry | ✅ | Exponential backoff |
| Fraud detection | ✅ | Velocity, patterns, card testing |
| Chargebacks | ✅ | Stripe dispute retrieval |
| Refund approvals | ✅ | Manager approval workflow |
| Wallet CRUD | ✅ | Atomic transactions |
| Wallet compensation | ✅ | Reconciliation support |
| Restaurant search | ✅ | Full-text + nearby (spatial) |
| Restaurant onboarding | ✅ | 6-step wizard |
| Menu moderation | ✅ | AI flags + human review |
| Menu customization | ✅ | Variants, addons |
| HSN/SAC GST codes | ✅ | Per-item mapping |
| GST calculation | ✅ | CGST/SGST/IGST splitting |
| GST invoice | ✅ | Generated per order |
| GST validation | ✅ | GSTIN format validation |
| Kitchen display system | ✅ | Real-time WebSocket gateway |
| Batch recipes | ✅ | Prep-time tracking |
| Food prep logging | ✅ | Quality check support |
| Inventory management | ✅ | Stock, wastage, cost |
| SLA monitoring | ✅ | Kitchen + delivery SLA |
| Driver registration | ✅ | KYC flow |
| Driver onboarding | ✅ | Document upload |
| Driver assignment | ✅ | Algorithm-based dispatch |
| Batch driver assignment | ✅ | Multiple orders per driver |
| Driver reassignment | ✅ | With reason tracking |
| Driver ETA | ✅ | Traffic-aware calculation |
| Driver fraud detection | ✅ | GPS spoofing, fake delivery |
| Driver shift management | ✅ | Start/end tracking |
| Driver earnings | ✅ | Earnings + deductions |
| Driver incentives | ✅ | Bonus system |
| Driver penalties | ✅ | Issuance + dispute |
| Driver scoring | ✅ | On-time, acceptance, cancellation |
| Driver payout | ✅ | Via Stripe Connect/Razorpay |
| Push notifications (FCM) | ✅ | Firebase Cloud Messaging |
| Push notifications (APNs) | ✅ | Apple Push Notification Service |
| SMS notifications (Twilio) | ✅ | Twilio OTP + alerts |
| Email notifications (SendGrid) | ✅ | SMTP + SendGrid fallback |
| Notification preferences | ✅ | Per-channel toggle |
| Notification queue | ✅ | BullMQ retry mechanism |
| Notification analytics | ✅ | Delivery tracking |
| KDS WebSocket | ✅ | Real-time order updates |
| Driver tracking WebSocket | ✅ | Real-time location |
| Admin real-time updates | ✅ | Stats, orders, revenue |
| Analytics top dishes | ✅ | Revenue + volume ranking |
| Analytics churn | ✅ | Customer churn prediction |
| Analytics repeat users | ✅ | Retention analysis |
| Analytics conversion | ✅ | Funnel analysis |
| Analytics heatmap | ✅ | Delivery density |
| Analytics peak hours | ✅ | Demand patterns |
| Loyalty coupons | ✅ | CRUD + apply |
| Referral system | ✅ | Code generation + processing |
| Cashback | ✅ | Processing + history |
| Support tickets | ✅ | Routing + escalation |
| Dispute management | ✅ | Raise, review, escalate |
| Payment reconciliation | ✅ | Payments, payouts, drivers |
| Tax reporting | ✅ | GST report generation |
| Audit logging | ✅ | Auth, payment, wallet events |
| GDPR erasure | ✅ | Scheduled deletion |
| Data export | ✅ | Multiple formats |
| Compliance checks | ✅ | SOC2, PCI-DSS validation |
| Secrets rotation | ✅ | Periodic rotation |
| Rate limiting | ✅ | Per-route + Redis-backed |
| CSRF protection | ✅ | Double-submit cookie |
| APNs notifications | ✅ | ES256 JWT generation |
| Financial ledger | ✅ | Double-entry bookkeeping |

---

## Frontend Features

### Customer Web (Next.js 15, 21 pages)

| Feature | Status | Notes |
|---------|--------|-------|
| Login/Register | ✅ | + Google/Facebook OAuth |
| Menu browsing | ✅ | Categories, restaurant pages |
| Cart management | ✅ | Redux cart slice |
| Checkout | ✅ | Address, payment, tip, promo codes |
| Order tracking | ✅ | Live WebSocket tracking |
| Order history | ✅ | Filter tabs, reorder |
| Order details | ✅ | SSR props |
| Address management | ✅ | CRUD via React Query |
| Payment methods | ✅ | Card/UPI CRUD |
| Wallet | ✅ | Balance, transactions |
| Profile | ✅ | Edit profile, logout |
| Password reset | ✅ | 3-step flow |
| Search | ✅ | Offline queue support |
| Subscriptions | ✅ | Prime + meal plans |
| Offers | ✅ | Promo codes, copy-to-clipboard |
| Notifications preferences | ✅ | Push/Email/SMS toggles |
| Offline support | ✅ | NetworkStatusContext + OfflineIndicator |
| Error boundaries | ✅ | Sentry ErrorBoundary |
| Request ID injection | ✅ | Next.js middleware |
| Sentry tracking | ✅ | Client + server |

### Restaurant Dashboard (Next.js 15)

| Feature | Status | Notes |
|---------|--------|-------|
| KDS order grid | ✅ | Real-time WebSocket updates |
| Batch mode | ✅ | Grouped by status |
| Inventory view | ✅ | Stock levels, low-stock warnings |
| Sound alerts | ✅ | Base64 WAV on new orders |
| Order prep timer | ✅ | DELAYED badge |
| Onboarding wizard | ✅ | 6-step stepper |
| Business registration | ✅ | Form with validation |
| GST configuration | ✅ | Step 3 of onboarding |
| Menu setup | ✅ | Step 4 of onboarding |
| Pricing config | ✅ | Step 5 of onboarding |
| Payout/bank details | ✅ | Step 6 of onboarding |
| Document upload | ❌ | Stub (not implemented) |

### Super Admin (Next.js 15)

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard overview | ✅ | 6 KPI cards, charts, live feed |
| Live orders | ✅ | Real-time table, KPIs |
| Branches/Kitchen monitoring | ✅ | Per-branch status |
| Support tickets | ✅ | Filter, actions |
| Fraud detection | ✅ | IP blocking, investigation |
| Refund management | ✅ | Approve/reject |
| Driver fleet overview | ✅ | KYC, ratings, deliveries |
| Driver earnings | ❌ | Stub (empty) |
| Driver shifts | ❌ | Stub (empty) |
| Driver incentives | ❌ | Stub (empty) |
| Loyalty coubons management | ❌ | UI placeholder |
| Loyalty referrals management | ❌ | UI placeholder |
| Analytics overview | ✅ | Conversion funnel, churn |
| Customer analytics | ✅ | Churn, repeat users |
| Top dishes | ✅ | Table with ranking |

### Customer Mobile (Expo React Native)

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (login/register) | ✅ | With animated transitions |
| Onboarding (4 slides) | ✅ | Stored to AsyncStorage |
| Home screen | ✅ | Restaurant list, pull-to-refresh |
| Search | ✅ | Filters, recent, skeleton |
| Cart | ✅ | Haptics, quantity controls |
| Checkout | ✅ | Address, payment, tip, promo |
| Order history | ✅ | OrderCard, OrderTabs |
| Profile | ✅ | Edit, logout |
| Addresses | ✅ | + location permission |
| Payment methods | ✅ | Card/UPI/Wallet |
| Notifications | ✅ | Push/Email/SMS toggles |
| Menu customization | ✅ | Add-ons, special instructions |
| Haptic feedback | ✅ | expo-haptics |
| Location services | ✅ | expo-location |
| Push notifications | ✅ | expo-notifications |
| i18n (7 locales) | ✅ | en-IN, hi, pa, mr, gu, ta, te |
| Tracking | ❌ | Placeholder (stub) |
| Restaurant menu | ⚠️ | Incomplete (stub) |

### Delivery Partner (Expo React Native)

| Feature | Status | Notes |
|---------|--------|-------|
| Login | ✅ | API-based |
| Profile | ✅ | Driver info display |
| Online/offline toggle | ✅ | State management |
| Incoming order card | ✅ | Accept/reject |
| Active delivery tracking | ✅ | 5-step progress |
| OTP verification | ✅ | 6-digit OTP auto-fill |
| Navigation to restaurant | ✅ | Maps integration |
| Navigation to customer | ✅ | Maps integration |
| Issue reporting | ✅ | 6 issue types |
| Earnings summary | ✅ | Today's earnings |
| Earnings history | ✅ | Stats grid |
| Performance metrics | ✅ | Accept/cancel rates |
| Shift schedule | ✅ | Start/end shift |
| Location tracking | ✅ | Socket.io + REST API |
| Order cancellation | ✅ | Via socket |
| Demo incoming order | ✅ | Test button |

---

## Shared Packages

| Package | Status | Notes |
|---------|--------|-------|
| `@spicegarden/ui` | ✅ | 22 components, 50+ icons, design tokens |
| `@spicegarden/shared` | 🟡 | API client + types, but hardcoded localhost |
| `@spicegarden/api-types` | ⚠️ | Only 3 interfaces, limited consumers |
| `@spicegarden/proto` | ❌ | Definitions only, no runtime |
| `@spicegarden/grpc-transport` | ❌ | Quarantined — always throws |

---

## Infrastructure & DevOps

| Feature | Status | Notes |
|---------|--------|-------|
| Docker Compose (13 services) | ✅ | Full dev stack |
| Kubernetes deployment | ✅ | Production-hardened manifests |
| HPA autoscaling | ✅ | 3-20 replicas |
| PodDisruptionBudget | ✅ | minAvailable: 2 |
| NetworkPolicy | ✅ | Restricted K8s |
| Security context | ✅ | readOnlyRootFilesystem, non-root |
| Probes | ✅ | Liveness, readiness, startup |
| Backup CronJob | ✅ | Daily at 2AM |
| Restore scripts | ✅ | Linux + Windows |
| Prometheus metrics | ✅ | /metrics endpoint |
| Grafana dashboards | ✅ | Main dashboard JSON |
| Alertmanager | ✅ | Slack + PagerDuty |
| Sentry error tracking | ✅ | Backend + 4 apps |
| CI/CD pipeline | ✅ | Build, test, deploy, ruby doctor |
