# SPICEGARDEN SYSTEM DISCOVERY REPORT
**Release Baseline:** `v1.0.0-rc1` | **Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`
**Date/Time:** 2026-09-30T13:42:38.026Z | **Runtime:** Node.js 22 LTS

---

## 1. Executive Summary & Monorepo Topology
SpiceGarden is an enterprise-grade, multi-tenant multi-application food delivery SaaS monorepo.
The system comprises **12 workspaces** (6 full frontend applications, 1 core backend API service, and 5 foundational shared packages).

### Monorepo Workspaces Inventory
| Workspace | Path | Framework / Stack | Target Port | Status |
| :--- | :--- | :--- | :--- | :--- |
| **@spicegarden/backend** | `apps/backend` | NestJS 11 / Express / TypeORM / Redis | 3001 | DISCOVERED |
| **@spicegarden/customer-web** | `apps/customer-web` | Next.js 15.5.18 (Pages Router) | 3002 | DISCOVERED |
| **@spicegarden/restaurant-dashboard** | `apps/restaurant-dashboard` | Next.js 15.5.18 (Pages Router) | 3003 | DISCOVERED |
| **@spicegarden/super-admin** | `apps/super-admin` | Next.js 15.5.18 (Pages Router) | 3004 | DISCOVERED |
| **@spicegarden/customer-mobile** | `apps/customer-mobile` | React Native / Expo 56 / Web SPA | 3005 | DISCOVERED |
| **@spicegarden/delivery-partner** | `apps/delivery-partner` | React Native / Expo 56 / Web SPA | 3006 | DISCOVERED |
| **spicegarden-launcher** | `apps/launcher` | Electron 42 / Webpack 5 / React 19 | 3007 | DISCOVERED |
| **@spicegarden/api-types** | `packages/api-types` | Shared DTOs & TypeScript Interfaces | N/A | DISCOVERED |
| **@spicegarden/grpc-transport** | `packages/grpc-transport` | gRPC Client/Server Transport Layer | N/A | DISCOVERED |
| **@spicegarden/proto** | `packages/proto` | Protocol Buffers Schemas | N/A | DISCOVERED |
| **@spicegarden/shared** | `packages/shared` | Cryptography, Validation, Constants | N/A | DISCOVERED |
| **@spicegarden/ui** | `packages/ui` | Design Tokens, UI Components, Icons | N/A | DISCOVERED |

---

## 2. Comprehensive Frontend Application & Route Discovery (44 Routes)

### A. Customer Web (`apps/customer-web` — Port 3002) — 21 Routes
1. `/` — Homepage with active restaurants, promotional banners, and quick category filters
2. `/menu` — Full menu catalog with live price calculation and spice level badges
3. `/search` — Elastic full-text multi-restaurant and dish search with real-time autocompletion
4. `/restaurant` — Single restaurant details page with categorized menu and operational hours
5. `/offers` — Active promotional coupon codes and discount voucher wallet
6. `/auth` — Customer login and registration modal/page with OTP integration
7. `/auth/callback` — OAuth 2.0 social callback handler
8. `/reset-password` — Password recovery and reset submission workflow
9. `/cart` — Cart items manager, modifier selection, and subtotal calculation
10. `/checkout` — Multi-step checkout with address selection, tip slider, and payment gateway launcher
11. `/tracking` — Live real-time map tracking with driver GPS interpolation and ETA counter
12. `/order-details` — Invoice, delivery breakdown, receipt download, and cancellation trigger
13. `/history` — Paginated historical orders with re-order quick action
14. `/profile` — User account management, dietary preferences, and notification toggles
15. `/addresses` — Saved addresses CRUD (Home, Work, Other) with GPS coordinates
16. `/payment-methods` — Tokenized card manager and saved UPI IDs
17. `/wallet` — SpiceGarden loyalty credits, wallet balance, and top-up screen
18. `/subscriptions` — SpiceGarden Gourmet pass / premium subscription tier management
19. `/notifications` — In-app notification center and real-time alerts
20. `/legal/terms` — Terms of Service and legal disclosures
21. `/legal/privacy` — Privacy Policy and data governance compliance notices

### B. Restaurant Dashboard / KDS (`apps/restaurant-dashboard` — Port 3003) — 8 Routes
1. `/` — Main Kitchen Display System (KDS) with live incoming, preparing, ready tickets & inventory tabs
2. `/onboarding` — Merchant portal onboarding root
3. `/onboarding/business` — Business entity, trade name, and legal entity details
4. `/onboarding/documents` — FSSAI license, tax certificates, and document upload
5. `/onboarding/gst` — GSTIN verification and tax configuration
6. `/onboarding/menu` — Digital menu builder and dish category setup
7. `/onboarding/pricing` — Commission structure and surge pricing rules
8. `/onboarding/payout` — Bank account verification and settlement frequency

### C. Super Admin Portal (`apps/super-admin` — Port 3004) — 12 Routes
1. `/` — Executive dashboard (Platform GMV, active deliveries, branch status, fraud blocks)
2. `/analytics` — Cross-platform performance analytics and sales metrics
3. `/analytics/customers` — Customer acquisition cost, retention cohorts, and LTV analysis
4. `/analytics/top-dishes` — Product catalog analytics, top sellers, and margin reports
5. `/driver-fleet/overview` — Real-time fleet monitor, active riders, battery & GPS telemetry
6. `/driver-fleet/earnings` — Driver payouts, distance allowances, and incentive calculations
7. `/driver-fleet/incentives` — Peak-hour surge bonus and milestone configuration
8. `/driver-fleet/penalties` — SLA violation logs, late delivery deductions, and dispute resolution
9. `/driver-fleet/shifts` — Shift scheduling, zone assignments, and attendance rosters
10. `/loyalty` — Loyalty tier rules, point multiplier engine, and referral campaigns
11. `/loyalty/coupons` — Global coupon management, discount codes, and budget caps
12. `/loyalty/referrals` — User referral tree, attribution rules, and reward issuance

### D. Customer Mobile Web SPA (`apps/customer-mobile` — Port 3005) — 1 App / Multi-screen
- Root SPA (`/`): Home Screen, Menu Navigation, Cart Drawer, Checkout Sheet, Order Status Tracking, Profile Drawer.

### E. Delivery Partner Web SPA (`apps/delivery-partner` — Port 3006) — 1 App / Multi-screen
- Root SPA (`/`): Shift Status (Online/Offline), Incoming Order Modal, Turn-by-Turn Pickup Navigation, Arrived at Restaurant, Order Pickup Confirmation, Turn-by-Turn Delivery Navigation, OTP Verification, Shift Summary.

### F. Launcher Electron Renderer (`apps/launcher` — Port 3007) — 1 App / Multi-screen
- Root Dashboard (`/`): 8-service manager (Backend, Frontends, PostgreSQL, Redis, PgBouncer, OpenSearch, Prometheus, Grafana), Service Health Monitors, Secrets Manager, Port Conflict Resolver, One-Click Logs.

---

## 3. Database Entities & Schemas
Discovered 16 authoritative entities managed via TypeORM with automated migrations:
- **User**: Authentication, password hash, role-based access, email verification, phone verification.
- **Session**: Refresh tokens, IP tracking, device fingerprints, expiration timestamps.
- **Order**: State machine (`CREATED`, `ACCEPTED`, `PREPARING`, `READY`, `DISPATCHED`, `DELIVERED`, `CANCELLED`), monetary subtotals, taxes, delivery fee, discounts.
- **OrderItem**: Menu item foreign keys, modifiers, quantity, unit price, spice level notes.
- **Restaurant**: Merchant profile, geolocation (`lat`/`lng`), operating hours, rating, operational state.
- **MenuItem**: Catalog entity, pricing, dietary flags (Veg, Non-Veg, Vegan, Gluten-Free), stock status.
- **Driver**: Delivery partner profile, vehicle type, rating, current location coordinates, active order pointer.
- **DriverShift**: Shift start/end, active minutes, break times, accepted/rejected order counters.
- **Payment**: Payment intent ID, provider reference (Stripe/Razorpay/COD), status, currency, raw webhook log.
- **Refund**: Refund intent ID, order reference, amount, reason, ledger settlement status.
- **Wallet**: User balance ledger, promotional credits, audit journal.
- **Address**: Saved physical locations, reverse-geocoded string, delivery notes.
- **Review**: Order rating (1-5 stars), food quality rating, delivery partner rating, comments.
- **SupportTicket**: Ticket category (`refund`, `support`, `fraud`), priority, resolution audit.
- **AuditLog**: Immutability log for administrative overrides, financial ledger changes, and role escalations.
- **Coupon**: Code, discount percentage/flat amount, min basket size, max discount cap, usage quota.

---

## 4. Background Queues & Distributed Workers (BullMQ)
- **order-processing**: High-priority queue ensuring atomic inventory decrements and transactional order status transitions.
- **driver-assignment**: Geospatial indexing queue computing Haversine distance and route ETA for rider matching.
- **notifications**: Low-latency multi-channel dispatch queue with exponential backoff retry.
- **ledger-reconciliation**: Financial settlement and double-entry bookkeeping queue.
- **data-retention**: Background cron job cleaning expired sessions and archival logs.

---

## 5. Security & Authentication Architecture
- **Auth Mechanisms**: JWT access tokens (RS256/HS256) with short expiration (15m) + secure HTTP-only refresh tokens.
- **CSRF Protection**: Double-submit cookie with cryptographic validation.
- **Rate Limiting**: Multi-tier Redis-backed rate limiting with in-memory fallback protecting auth, checkout, and search.
- **Data Protection**: AES-256 field-level encryption for PII, TLS 1.3 enforced across all web routes, parameterized SQL queries preventing SQLi.

---
**Discovery Status:** COMPLETE & VERIFIED.
