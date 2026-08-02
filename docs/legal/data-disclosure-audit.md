# Data Disclosure Audit — Section N

**Status:** DONE — factual audit completed against the live codebase at `D:\SpiceGarden`.
**Purpose:** This table is the single source of truth for data collected across all SpiceGarden apps. It is the factual input referenced by Section B (Privacy Documents), Section C (Apple App Store Privacy Questionnaire & Nutrition Labels), and Section D (Google Play Data Safety Form).

**Last audited:** 2026-08-02

---

## Audit Method

Every row below was verified by reading actual source files — entities, service methods, SDK initialization calls, and storage mechanisms. `file:line` references point to the specific code that collects, stores, or transmits each data category. Claims of "No" mean the codebase was searched (grep across all `.ts`/`.tsx` files in the relevant app) and no collection mechanism exists.

**Apps audited:**
- Backend: `apps/backend/src/` (NestJS, TypeScript, TypeORM, PostgreSQL)
- Customer Web: `apps/customer-web/src/` (Next.js 15, React 19)
- Restaurant Dashboard: `apps/restaurant-dashboard/src/` (Next.js 15)
- Super Admin: `apps/super-admin/src/` (Next.js 15)
- Customer Mobile: `apps/customer-mobile/` (Expo/React Native)
- Delivery Partner: `apps/delivery-partner/` (Expo/React Native)

---

## Data Disclosure Table

| # | Category | Collected? | Evidence (file:line) | Purpose | Shared w/ Third Party? | Retention |
|---|----------|------------|---------------------|---------|----------------------|-----------|
| 1 | **Name (full name)** | Yes | `apps/backend/src/db/entities/user.entity.ts:14` — `fullName` column | Account identification, order attribution | No | 7 years after account deletion (soft-deleted tombstone retained per `retention.service.ts:37`) |
| 2 | **Email address** | Yes | `user.entity.ts:17` — `email` column (unique); also `restaurant-gst.entity.ts:44`, `bank-account.entity.ts` | Authentication, communication, receipts, account recovery | Transactional email provider (SendGrid) and email service for order confirmations | 7 years after account deletion |
| 3 | **Phone number** | Yes | `user.entity.ts:20` — `phone` column (unique); also `restaurant-gst.entity.ts:47` | SMS-based 2FA, delivery coordination, password reset, OTP | SMS provider (Twilio) for OTP delivery | 7 years after account deletion |
| 4 | **Physical address (delivery)** | Yes | `address.entity.ts:15-29` — `addressLine`, `city`, `state`, `postalCode`; `order.entity.ts:77` — `deliveryAddressId` | Order delivery | No | 5 years (archive) per `retention.service.ts:28` |
| 5 | **Precise location (GPS)** | Yes | `address.entity.ts:30-34` — `location: {lat, lng}`; `driver.entity.ts:41-45` — `currentLocation: {lat, lng}`; `restaurant-branch.entity.ts:35` — `location`; `customer-mobile/app.config.js:30-32` (iOS location perms); `delivery-partner/app.config.js:24-26` | Restaurant discovery, delivery routing, driver dispatch, live tracking | Google Maps (geocoding/routing via `GOOGLE_MAPS_API_KEY`), Expo Location SDK | Driver GPS: 30 days (`retention.service.ts:27`); Address location: 5 years (archive) |
| 6 | **Device ID / Device info** | Yes | `user-device.entity.ts:22-26` — `deviceName`, `deviceType`; `session.entity.ts:17-20` — `deviceName`, `deviceType`; `device-fingerprint.entity.ts:20-23` — `deviceName`, `deviceType`, `userAgent`; `audit-log.entity.ts:26` — `ipAddress`; `customer-mobile`: `@react-native-async-storage` + `expo-device` indirectly | Security, fraud detection, session management, device recognition | No | Sessions: 90 days (`retention.service.ts:25`); Devices: 90 days; Device fingerprints: retained with account |
| 7 | **Payment information** | Yes | `payment-method.entity.ts:16-35` — `type`, `cardLast4`, `cardBrand`, `cardExpiry`, `upiId`, `externalPaymentMethodId` (tokenized); `wallet.entity.ts:16-20` — `balance`, `currency`; Payment processed via Stripe/Razorpay/PhonePe/Paytm | Payment processing and wallet management | Payment processors: Stripe, Razorpay, PhonePe, Paytm (card numbers never stored server-side; only last-4 / tokens kept) | Payment tokens/methods: 10 years (archive) per `retention.service.ts:32`; Wallet transactions: 5 years (archive) per `retention.service.ts:34` |
| 8 | **Order history** | Yes | `order.entity.ts:15-90` — all fields including `grandTotal`, `status`, `deliveryAddressId`, `paymentStatus`; `order-item.entity.ts:7-78` — items, prices, tax breakdown, instructions | Order fulfillment, history, support | No | 10 years (archive) per `retention.service.ts:20` |
| 9 | **Search history** | Yes (mobile only) | `customer-mobile/src/constants/storage.keys.ts:11` — `RECENT_SEARCHES` (AsyncStorage); `customer-web/src/pages/tracking.tsx:47` — `sessionStorage.getItem('lastOrderId')` | Product discovery, search UX | No | Mobile: local AsyncStorage (encrypted via expo-secure-store for auth tokens); Web search: session storage (cleared on tab close) |
| 10 | **Favorites / Wish List** | No | Searched `apps/backend/src/db/entities/*.entity.ts`, `apps/customer-web/src/`, `apps/customer-mobile/src/` — no favorites entity, table, or API. "Favourite" appears only as UI copy in `customer-web/src/pages/auth.tsx:112` and `customer-mobile/src/screens/AuthScreen.tsx:129` | N/A | N/A | Not applicable — not collected |
| 11 | **Shopping cart** | Yes | `customer-mobile/src/constants/storage.keys.ts:2` — `CART` (AsyncStorage); `customer-web/src/redux/` (Redux store for cart state) | Order placement | No | Session/cart: local storage / Redux state; cleared after checkout or on session end |
| 12 | **Push notification tokens** | Yes | `user-device.entity.ts:17-20` — `fcmToken`, `apnsToken`; `notification.entity.ts:16` — `recipientId`; `customer-mobile/App.tsx:150-162` — `Notifications.getExpoPushTokenAsync`; `customer-mobile/app.config.js:25` (`POST_NOTIFICATIONS`); `delivery-partner/App.tsx` — similar pattern | Push delivery notifications | FCM (Firebase), APNs (Apple) | 90 days (tied to sessions/devices per `retention.service.ts:25`) |
| 13 | **Crash logs / crash reports** | Yes | `apps/backend/src/main.ts:218-224` — `@sentry/node` init with DSN, `tracesSampleRate: 1.0`; `customer-web/sentry.client.config.ts:1-10` — `@sentry/nextjs` with DSN, `tracesSampleRate: 0.05`, `profilesSampleRate: 0.05`; `super-admin/src/pages/_app.tsx:12-18` — `@sentry/nextjs`, `tracesSampleRate: 0.0`; `customer-mobile/App.tsx:28-32` — `@sentry/react-native@8.21.0`, `tracesSampleRate: 1.0`; `delivery-partner/App.tsx:5-9` — same | Error monitoring, crash reporting, performance | Sentry (hosted at sentry.io / self-hosted Sentry instance) | Per Sentry data retention (90 days default); `retention.service.ts` does not govern this |
| 14 | **Analytics events** | Yes | `analytics-event.entity.ts:18-42` — DB table `analytics_events` with `type`, `userId`, `sessionId`, `properties`, `timestamp`; `packages/ui/analytics.ts:4-23` — `sendAnalyticsEvent` via `navigator.sendBeacon` to `/api/analytics`; `packages/ui/analytics.ts:29-42` — `trackPageView`; `packages/ui/analytics.ts:44-84` — web vitals (LCP, FID, CLS); `customer-web/src/analytics.ts:1-19` — page_view events; `super-admin/src/pages/_app.tsx:40` — trackEvent page_view | Product analytics, funnel analysis, performance | None (self-hosted PostgreSQL); Sentry receives tracing data separately | 18 months (`retention.service.ts:29`) |
| 15 | **Diagnostics / performance metrics** | Yes | `packages/ui/analytics.ts:7-22` — `web_vital` events (LCP, FID, CLS); `apps/backend/src/metrics/metrics.service.ts` — Prometheus metrics endpoint at `/metrics` (main.ts:322-337); OpenTelemetry (`otel.setup.ts`, `otelSDK.start()` at main.ts:226-228); `apps/backend/src/observability/` | Performance monitoring, observability | None for frontend web vitals; Prometheus/Grafana self-hosted for backend; OpenTelemetry can export to Jaeger | Prometheus: configured via retention; OTel spans: ephemeral (in-memory); Web vitals: 18 months |
| 16 | **Authentication info (JWT, refresh tokens)** | Yes | `session.entity.ts:5-38` — `refreshToken`, `expiresAt`, `isActive`; Backend: JWT access tokens (stateless, 1-hour expiry per auth.controller.ts:29-35); `access_token` & `refresh_token` cookies (HttpOnly, Secure, SameSite=Lax); `customer-mobile/src/constants/storage.keys.ts:7-8` — `AUTH_TOKEN`, `REFRESH_TOKEN` (expo-secure-store) | Authentication, session management | No | Sessions: 90 days (`retention.service.ts:25`); Access tokens: 1 hour; Refresh tokens: 30 days (cookie maxAge per auth.controller.ts:26) |
| 17 | **Camera access** | Yes (mobile only) | `customer-mobile/app.config.js:35` — `NSCameraUsageDescription`; `customer-mobile/app.config.js:58` — `android.permission.CAMERA` | QR code scanning for payments | No | Not stored — camera access is runtime only, no images persisted |
| 18 | **Photos / media library** | Yes (mobile only) | `customer-mobile/app.config.js:36` — `NSPhotoLibraryUsageDescription`; `customer-mobile/app.config.js:60` — `android.permission.READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`; `delivery-partner/app.config.js` — not present (no photo permissions) | Upload payment receipts | No | Not stored — images are uploaded to backend and not retained on device after upload |
| 19 | **Reviews / ratings** | No (user-generated) | Searched all entity files and frontend code — no `review.entity.ts` exists. Ratings are **displayed** (aggregate) from API in `customer-web/src/pages/index.tsx:18`, `history.tsx:20`, `search.tsx:12`, `restaurant.tsx:28` and `customer-mobile` screens, but no user review submission mechanism exists in backend or frontend. | N/A | N/A | Not applicable — not collected |
| 20 | **AI conversation history** | Yes (in-memory only) | `ai.service.ts:67` — `contextMemory: Map<string, ChatMessage[]>` (in-process, not persisted to DB); `ai.service.ts:499-508` — `addContextMemory` stores max 20 messages per sessionId; `ai.service.ts:66` — `ragDocuments: RAGDocument[]` (in-process); `ai.service.ts:261-295` — `callOpenAI` sends user message + system prompt to `https://api.openai.com/v1/chat/completions`; `ai.service.ts:318-328` — embeddings sent to `https://api.openai.com/v1/embeddings` | Customer support chatbot, demand forecasting, recommendations | OpenAI (API calls for chatbot/embeddings); Optional vector DB (Qdrant/Pinecone-like API at `VECTOR_DB_URL`) | Context memory: in-memory only (lost on restart); not persisted; RAG documents: in-memory only |
| 21 | **Delivery tracking** | Yes | `order.entity.ts:34-35` — `driverId`, `otpCode`; `order.entity.ts:79-80` — `deliveredAt`; `driver.entity.ts:41-45` — `currentLocation`, `lastLocationUpdate`; `customer-web/src/pages/tracking.tsx` — live tracking UI; `customer-mobile` — `useTracking` hook | Real-time delivery status, proof of delivery | Google Maps (live tracking map) | Order delivery data: 10 years (archive); Driver live location: 30 days (`retention.service.ts:27`) |
| 22 | **MFA / 2FA data** | Yes | `mfa.entity.ts` — TOTP secret (encrypted); `otp.entity.ts:3-54` — `code` (6-digit), `type` (login, password_reset, email/phone verification, delivery confirmation), `expiresAt`; `user.entity.ts:41` — `isMfaEnabled` | Account security, identity verification | No | OTP: 1 day (`retention.service.ts:26`); MFA setup: retained with account |
| 23 | **Bank account details** | Yes | `bank-account.entity.ts:29-113` — `accountHolderName`, `bankName`, `branchName`, `accountNumber`, `ifscCode`, `upiId`, `kycDocuments` (PAN card, address proof, cancelled cheque, business proof); linked to `restaurant.entity.ts` and `driver.entity.ts` | Payout settlement for restaurant partners and delivery partners | Payment processors (Stripe Connect, Razorpay) for disbursements | 5 years (archive) per `retention.service.ts:28` |
| 24 | **Tax / GST details** | Yes | `gst-detail.entity.ts:4-51` — `taxableValue`, CGST/SGST/IGST rate & amount, `placeOfSupply`; `restaurant-gst.entity.ts:3-54` — `gstin`, `legalNameOfBusiness`, `address`, `stateCode`, `email`, `phone` | Tax compliance, invoicing | No | 10 years (archive, per `retention.service.ts:20-21`) |
| 25 | **Support ticket data** | Yes | `support-ticket.entity.ts:29-136` — `subject`, `category`, `priority`, `messages`, `attachments`, `satisfactionRating`; linked to `UserEntity` | Customer support | Email provider (for support email routing) | 3 years (archive) per `retention.service.ts:36` |
| 26 | **Wallet balance & transactions** | Yes | `wallet.entity.ts:5-27` — `balance`, `currency`; `wallet-transaction.entity.ts:9-33` — `type` (credit/debit), `amount`, `description`, `referenceId` | Wallet balance, transaction history | No | 5 years (archive) per `retention.service.ts:34` |
| 27 | **Consent records** | Yes | `cookie-consent.entity.ts:14-71` — consent preferences per category (necessary, analytics, marketing, performance, functional, preference), `ipAddress`, `userAgent`, `consentVersion`, `region`; `consent-log.entity.ts` — audit trail of consent changes; `CookieConsentBanner.tsx` (customer-web) records consent via `legalApi.recordConsent` | Legal compliance (GDPR, CCPA, DPDP) | No | Consent records retained for audit trail; no explicit retention period coded (operational default: indefinite until user deletion) |

---

## Data Categories NOT Collected (verified absent)

| Category | Search Result | Finding |
|----------|--------------|---------|
| User reviews/ratings (submission) | Grepped `*.entity.ts`, `review*.*`, `rating` in all `src/` | No review entity or submission endpoint exists; ratings are displayed-only from third-party or API aggregate data |
| Favorites/Wishlist | Grepped `favorite*`, `wishlist` in all `src/` | No entity, service, or storage key for favorites |
| Microphone access | Grepped `microphone`, `audio` in all `package.json` and `app.config.*` | Not requested or used |
| Contacts list | Grepped `contacts`, `react-native-contacts` in all `package.json` | Not requested or used |
| Biometric data storage | Grepped `biometric`, `fingerprint` (not device fingerprint entity) | `device-fingerprint.entity.ts` stores device fingerprint strings, not biometric data |
| Advertising ID | Grepped `advertisingId`, `adId` in all `src/` | Not collected |
| Email content | Grepped `email.*body`, `email.*content` in services | Only metadata (addresses for sending); email body content is not stored |
| Clipboard data | Grepped `clipboard` in all `src/` | Not accessed |
| Calendar | Grepped `calendar` | Not accessed |

---

## Sentry Data Capture Details (grounding for "crash logs" row)

| App | SDK | File | DSN Source | Features Enabled | PII Captured |
|-----|-----|------|-----------|-----------------|--------------|
| Backend | `@sentry/node@10.68.0` | `main.ts:218-224` | `SENTRY_DSN` env | Errors, transactions (tracesSampleRate: 1.0), Express error handler | `sendDefaultPii` not set → defaults to `false` (IP not auto-captured) |
| Customer Web | `@sentry/nextjs@10.68.0` | `sentry.client.config.ts:1-10`, `sentry.config.ts` | `NEXT_PUBLIC_SENTRY_DSN`/`SENTRY_DSN` env | Errors, transactions (0.05), profiling (0.05) | No Replay, no Feedback widget |
| Super Admin | `@sentry/nextjs@10.68.0` | `_app.tsx:12-18` | `NEXT_PUBLIC_SENTRY_DSN` env | Errors, `ErrorBoundary`; tracesSampleRate: 0.0 (disabled) | No performance data sent |
| Restaurant Dashboard | `@sentry/nextjs@10.68.0` | `sentry.config.ts:21-28` | `NEXT_PUBLIC_SENTRY_DSN`/`SENTRY_DSN` | Errors, transactions (0.05) | No Replay |
| Customer Mobile | `@sentry/react-native@8.21.0` | `App.tsx:28-32` | `SENTRY_DSN` env | Errors, transactions (tracesSampleRate: 1.0) | `sendDefaultPii` defaults to `false` |
| Delivery Partner | `@sentry/react-native@8.21.0` | `App.tsx:5-9` | `SENTRY_DSN` env | Errors, transactions (tracesSampleRate: 1.0) | `sendDefaultPii` defaults to `false` |

---

## Analytics Data Details (grounding for "analytics events" row)

Analytics events are sent to `AnalyticsIngestController` at `POST /analytics/events` (`analytics-ingest.controller.ts:10-26`), which calls `AnalyticsService.trackEvent()` (`analytics.service.ts:31-42`). Events are stored in the `analytics_events` table (`analytics-event.entity.ts`).

Event types collected: `page_view`, `click`, `order_placed`, `payment_success`, `payment_failed`, `search`, `add_to_cart`, `web_vital`, `flow_started`, `flow_step_completed`, `flow_completed`, `flow_error`, `navigation_change`.

**Note:** The analytics event ingestion endpoint does NOT check consent status before recording events. This is a compliance gap flagged below.

---

## Cookie Inventory (grounding for Cookie Policy)

| Cookie Name | Type | Purpose | Set By | HttpOnly | SameSite | Secure | Expires |
|-------------|------|---------|--------|----------|----------|--------|---------|
| `access_token` | Auth | JWT access token for authentication | `auth.controller.ts:29` | Yes | Lax | Yes (prod) | 1 hour |
| `refresh_token` | Auth | JWT refresh token for session renewal | `auth.controller.ts:37` | Yes | Lax | Yes (prod) | 30 days (configurable) |
| `_csrf` | Security | CSRF protection token | `csrf.middleware.ts:47` | No | Strict | Yes (prod) | 1 hour |
| `sg_cookie_consent` | Preference | Stores consent preferences | `useCookieConsent.ts:62` (localStorage, not a cookie) | N/A | N/A | N/A | Persistent (localStorage) |

---

## Key Gaps Identified

1. **Analytics not consent-gated** — `packages/ui/analytics.ts:4-23` sends events via `sendBeacon` without checking consent preferences. The `CookieConsentBanner` records consent but does not gate analytics collection (`analytics-ingest.controller.ts:26-27` accepts all events unconditionally).
2. **Sentry not consent-gated** — All Sentry SDK initializations occur at app startup without checking user consent.
3. **No review submission feature** — Ratings displayed but not collected (confirmed absent).
4. **Deep links registered but not wired** — See Section L (deep-link audit).
5. **AI conversation history is in-memory only** — Not persisted to disk/DB; lost on process restart.
