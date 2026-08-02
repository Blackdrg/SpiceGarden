# Privacy Policy

**Draft status:** FIRST DRAFT for human/legal review. This document is grounded in the actual codebase behavior of SpiceGarden (audited 2026-08-02) but is **not** a final legal instrument. It must be reviewed and signed off by a qualified lawyer before publication.

**Effective date:** [PLACEHOLDER — to be set by business owner]

**Company:** SpiceGarden Technologies [PLACEHOLDER — full legal entity name to be provided]
**Registered address:** [PLACEHOLDER — registered office address to be provided]
**Contact:** privacy@spicegarden.com | support@spicegarden.com

---

## 1. Introduction

SpiceGarden ("we", "us", "our") operates a food-ordering and delivery platform that connects customers, restaurants, and delivery partners. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information.

We are committed to compliance with:
- The **General Data Protection Regulation (GDPR)** (EU)
- The **California Consumer Privacy Act (CCPA / CPRA)** (California, USA)
- The **Digital Personal Data Protection Act, 2023 (DPDP Act)** (India)

**Data Fiduciary:** SpiceGarden Technologies [PLACEHOLDER]. For Indian users, we act as the Data Fiduciary under the DPDP Act.

---

## 2. Personal Information We Collect

### 2.1 Identity Data
- **Full name** — `user.entity.ts:14` (`fullName` column). Required for account creation.
- **Email address** — `user.entity.ts:17` (`email`, unique). Used for authentication, receipts, and communication.
- **Phone number** — `user.entity.ts:20` (`phone`, unique). Used for SMS-based 2FA, delivery coordination, and OTP.

### 2.2 Profile Data
- **Delivery addresses** — `address.entity.ts:15-29` (`addressLine`, `city`, `state`, `postalCode`, `label`).
- **Precise location** — `address.entity.ts:30-34` (`location: {lat, lng}`); `driver.entity.ts:41-45` (`currentLocation`); `restaurant-branch.entity.ts:35`.

### 2.3 Device Information
- **Device name and type** — `user-device.entity.ts:22-26`, `session.entity.ts:17-20`, `device-fingerprint.entity.ts:20-23`.
- **User agent** — `user-device.entity.ts:29`, `device-fingerprint.entity.ts:26`, `cookie-consent.entity.ts:55`.
- **IP address** — `user-device.entity.ts:32`, `session.entity.ts:23`, `device-fingerprint.entity.ts:29`, `audit-log.entity.ts:26`, `cookie-consent.entity.ts:52`.
- **Device fingerprint** — `device-fingerprint.entity.ts:17` (fingerprint string for fraud detection).

### 2.4 Authentication Data
- **Password hash** — `user.entity.ts:23` (`passwordHash`, hashed with argon2 `argon2@0.45.1` + bcrypt `bcrypt@6.0.0`).
- **Session tokens** — `session.entity.ts:26` (`refreshToken`). JWT access tokens (1-hour expiry) and refresh tokens (30-day expiry) stored in HttpOnly cookies (`access_token`, `refresh_token` at `auth.controller.ts:29-43`).
- **MFA** — `mfa.entity.ts` (TOTP secrets); `otp.entity.ts:3-54` (6-digit codes, 5 types: email/phone verification, login, password reset, delivery confirmation).
- **CSRF token** — `_csrf` cookie (`csrf.middleware.ts:47`).

### 2.5 Payment Information
- **Tokenized payment methods** — `payment-method.entity.ts:16-35` (`cardLast4`, `cardBrand`, `cardExpiry`, `upiId`, `externalPaymentMethodId`). **We never store full card numbers** — these are tokenized by our payment processors.
- **Wallet** — `wallet.entity.ts` (balance, currency); `wallet-transaction.entity.ts` (credit/debit history).
- **Bank account details** — `bank-account.entity.ts:29-113` (`accountHolderName`, `bankName`, `branchName`, `accountNumber`, `ifscCode`, `upiId`, KYC documents).

### 2.6 Order & Delivery Data
- **Order details** — `order.entity.ts:15-90` (`orderNumber`, `status`, `paymentStatus`, pricing, `deliveryAddressId`, `driverId`, `otpCode`, `deliveredAt`).
- **Order items** — `order-item.entity.ts` (name, quantity, price, tax breakdown, special instructions).
- **Real-time location** — `driver.entity.ts:41-45` (`currentLocation`, `lastLocationUpdate`).
- **Delivery OTP** — `order.entity.ts:38` (`otpCode`, 6-digit delivery confirmation).

### 2.7 Communication & Support Data
- **Support tickets** — `support-ticket.entity.ts:29-136` (`subject`, `category`, `priority`, `messages`, `attachments`, `satisfactionRating`).
- **Refund requests** — `refund.entity.ts`, `refund-approval.entity.ts`.

### 2.8 Marketing & Preferences
- **Notification preferences** — `notification-preference.entity.ts:5-39` (push/email/SMS toggles per category).
- **Coupon usage** — `coupon-usage.entity.ts` (redemption tracking).
- **Referrals** — `referral.entity.ts:21-69` (`code`, `referrerId`, `refereeId`, rewards).

### 2.9 Analytics & Diagnostics
- **Analytics events** — `analytics-event.entity.ts:18-42` (`type`, `userId`, `sessionId`, `properties`, `timestamp`). Collected via `packages/ui/analytics.ts` using `navigator.sendBeacon`. Event types: `page_view`, `click`, `order_placed`, `payment_success`, `payment_failed`, `search`, `add_to_cart`, `web_vital`, `flow_started`, `flow_step_completed`, `flow_completed`, `flow_error`, `navigation_change`.
- **Web vitals** — `packages/ui/analytics.ts:44-84` (LCP, FID, CLS metrics).
- **Crash logs & errors** — Captured by Sentry (`@sentry/node@10.68.0` in backend `main.ts:218-224`; `@sentry/nextjs@10.68.0` in web frontends; `@sentry/react-native@8.21.0` in mobile apps). Sentry captures stack traces, request URLs, error messages, device context, and (when `sendDefaultPii` is enabled) user info. **Currently `sendDefaultPii` is not set (defaults to `false`).**
- **Server metrics** — Prometheus metrics at `/metrics` (`main.ts:322-337`); OpenTelemetry traces (`otel.setup.ts`, `main.ts:226-228`).

### 2.10 Tax & Compliance Data
- **GST details** — `gst-detail.entity.ts` (taxable value, CGST/SGST/IGST); `restaurant-gst.entity.ts` (GSTIN, business details).
- **Cookie consent** — `cookie-consent.entity.ts:14-71` (per-category preferences, IP, user agent, region, consent version).
- **Data subject requests** — `data-subject-request.entity.ts` (access, deletion, portability requests).

### 2.11 AI Conversation History
- **Context memory** — `ai.service.ts:67-68` stores conversation history in an **in-process Map** (max 20 messages per session), **not persisted to disk or database**. Lost on process restart.
- **AI API calls** — `ai.service.ts:261-295` sends user message + system prompt to `https://api.openai.com/v1/chat/completions` (model: `gpt-4o-mini` by default). Embeddings sent to `https://api.openai.com/v1/embeddings`. Token budgets enforced per-user (`ai-control-plane.service.ts:49-106`).
- **RAG documents** — `ai.service.ts:66` stored in-process, not persisted.

### 2.12 Mobile-Specific Data
- **Push tokens** — `customer-mobile/App.tsx:150-162` (`Notifications.getExpoPushTokenAsync`).
- **Camera** — `customer-mobile/app.config.js:35` (`NSCameraUsageDescription`); `customer-mobile/app.config.js:58` (`android.permission.CAMERA`). Used for QR code payment scanning. **No images are stored.**
- **Photo library** — `customer-mobile/app.config.js:36` (`NSPhotoLibraryUsageDescription`); `customer-mobile/app.config.js:59-60` (storage permissions). Used for payment receipt upload.
- **Local storage** — `customer-mobile/src/constants/storage.keys.ts:2-11` (`CART`, `USER`, `AUTH_TOKEN`, `REFRESH_TOKEN`, `RECENT_SEARCHES`, etc.) via `@react-native-async-storage/async-storage` + `expo-secure-store`.
- **Deep links** — Schemes: `spicegarden`, `spicegarden-cash` (`app.config.js:91`); Android intent filters: `spicegarden://pay`, `spicegarden-cash://cod` (`app.config.js:96-99`); iOS universal links: `https://spicegarden.com/link` (`app.config.js:105`).

### 2.13 Data We Do NOT Collect
- **User reviews/ratings** — No review entity or submission endpoint exists (`apps/backend/src/db/entities/` has no `review.entity.ts`). Ratings are displayed-only from API aggregate data.
- **Favorites/Wishlist** — No favorites entity, table, or storage key exists.
- **Microphone, contacts, calendar, advertising ID** — Not requested in any `app.config.js` or `package.json`.

---

## 3. How We Use Your Information

| Purpose | Legal Basis | Data Categories |
|---------|-------------|----------------|
| Account creation & authentication | Contract | Name, email, phone, password hash |
| Order processing & delivery | Contract | Address, location, order details, payment info, device ID |
| Payment processing | Contract / Legal obligation | Payment methods (tokenized), bank account, wallet |
| Communication (SMS, email, push) | Contract / Consent | Phone, email, push token, notification prefs |
| Fraud prevention & security | Legitimate interests | Device fingerprint, IP, session, audit logs |
| Tax compliance & invoicing | Legal obligation | GST details, order amounts, bank details |
| Analytics & performance | Legitimate interests / Consent | Analytics events, web vitals, crash logs |
| Customer support | Contract / Legitimate interests | Support tickets, order history |
| AI features (chatbot, recommendations) | Contract / Consent | AI conversation history (in-memory), order history |
| Marketing communications | Consent | Email, phone, push token (opt-in only) |

---

## 4. Legal Bases (GDPR)

- **Contract:** To provide the service (orders, payments, delivery, authentication).
- **Legal obligation:** Tax records (10-year retention for orders/invoices/payments), KYC compliance.
- **Legitimate interests:** Fraud prevention, security monitoring, analytics (where not requiring explicit consent).
- **Consent:** Marketing communications, non-essential cookies, location tracking (when not essential for delivery), AI conversation processing.

---

## 5. Sharing Your Information

| Third Party | Purpose | Legal Basis | Data Categories |
|-------------|---------|-------------|----------------|
| Stripe, Inc. | Payment processing, payouts | Contract | Tokenized payment methods, bank account (for merchants) |
| Razorpay | Payment processing, payouts | Contract | Tokenized payment methods, payment webhooks |
| PhonePe | Payment processing | Contract | Payment request payloads |
| Paytm | Payment processing | Contract | Payment request payloads |
| Twilio | SMS delivery (OTP, delivery updates) | Contract | Phone number, OTP code |
| SendGrid / email provider | Transactional emails | Contract | Email address |
| Google Maps Platform | Geocoding, routing, live maps | Contract | Location coordinates, addresses |
| Firebase (FCM) | Push notifications | Contract | Push tokens, notification payloads |
| Apple (APNs) | Push notifications (iOS) | Contract | Push tokens, notification payloads |
| Sentry (Functional Software) | Error monitoring, crash reporting | Legitimate interests | Stack traces, error messages, device info, request URLs |
| OpenAI | AI chatbot, embeddings | Consent | Chat messages (user query + system prompt) |
| Prometheus/Grafana | Infrastructure monitoring | Legitimate interests | Aggregate metrics (no PII) |
| OpenTelemetry / Jaeger | Distributed tracing | Legitimate interests | Trace spans (request metadata, no PII when `sendDefaultPii=false`) |

**All payment processors are PCI-DSS compliant.** Card numbers are never stored on our servers.

---

## 6. Data Retention

Our retention schedules are defined in code at `retention.service.ts:19-38` and the Data Retention Policy. Summary:

| Data Category | Retention | Action | Source |
|--------------|-----------|--------|--------|
| Orders & Invoices | 10 years | Archive | `retention.service.ts:20-21` |
| Payments & Refunds | 10 years | Archive | `retention.service.ts:32-33` |
| Audit Logs | 3 years | Archive | `retention.service.ts:24` |
| Sessions & Devices | 90 days | Delete | `retention.service.ts:25` |
| OTP Codes | 24 hours | Delete | `retention.service.ts:26` |
| Driver GPS Location | 30 days | Delete | `retention.service.ts:27` |
| Restaurant Data | 5 years | Archive | `retention.service.ts:28` |
| Analytics Events | 18 months | Delete | `retention.service.ts:29` |
| Marketing Events | 2 years | Delete | `retention.service.ts:30` |
| Deleted Accounts | 7 years | Delete (tombstone) | `retention.service.ts:37` |
| User Account Data | 7 years post-deletion | Anonymize/Archive | `retention.service.ts:20` (orders) |

---

## 7. Your Rights

Depending on your jurisdiction, you have the right to:

- **Access** your personal data — via `POST /privacy/exports` and `GET /privacy/exports/:id/download` (`privacy.controller.ts:97-127`, `data-subject-request.service.ts:389-524`).
- **Rectification** — correct inaccurate data via support or `POST /privacy/requests` with type `correct` (`privacy.controller.ts:52`).
- **Erasure ("Right to be Forgotten")** — submit deletion request via `POST /privacy/requests` with type `delete` → `executeDeletion()` (`data-subject-request.service.ts:204-282`) soft-deletes the account and removes non-essential records.
- **Restriction of processing** — via `restrictProcessing()` (`data-subject-request.service.ts:327-341`).
- **Data portability** — download your data in JSON/CSV/PDF via `GET /privacy/exports/:exportId/download`.
- **Object** — opt out of marketing via notification preferences (`notification-preference.entity.ts`) or unsubscribe links.
- **Withdraw consent** — via the Cookie Consent Banner, `POST /legal/consent/:consentId/withdraw`, or the Privacy Dashboard.
- **Lodge a complaint** — with your local data protection authority.

**To exercise these rights:**
- Visit your **Privacy Dashboard** at `GET /privacy/dashboard/:userId` (`privacy.controller.ts:139-157`)
- Email **privacy@spicegarden.com**
- Submit a Data Subject Request via `POST /privacy/requests`

SLA: We respond within 30 days (15 days for consent withdrawal) per `data-subject-request.service.ts:29-37`.

---

## 8. International Transfers

Data may be transferred to and processed in countries other than your home country, including India and the United States (where our cloud infrastructure and third-party processors operate). We use Standard Contractual Clauses (EU Commission Implementing Decision 2021/914) and the DPDP Act's prescribed mechanisms for transfers outside India.

---

## 9. Children's Privacy

The platform is **not directed to children under 18**. We do not knowingly collect personal data from children under 18. During registration (`user.entity.ts`), users must confirm they are at least 18 years old (`terms.of.service` eligibility clause). If we learn we have collected data from a child, we will delete it.

**Age verification:** Currently enforced via self-declaration at signup. We recommend implementing a robust age-gate before launch in regulated markets.

---

## 10. Cookies and Similar Technologies

We use the following cookies and storage mechanisms:

| Name | Type | Purpose | Essential? |
|------|------|---------|------------|
| `access_token` | Cookie (HttpOnly) | JWT authentication | Yes |
| `refresh_token` | Cookie (HttpOnly) | Session renewal | Yes |
| `_csrf` | Cookie | CSRF protection | Yes |
| `sg_cookie_consent` | localStorage | Stores consent preferences | Yes (preference) |

Non-essential cookies (analytics, marketing, performance) are **opt-in**. Manage preferences via the Cookie Consent Banner or your Privacy Dashboard.

See the full **Cookie Policy** for details.

---

## 11. Security

- Data at rest: AES-256-GCM encryption (`legal-seed.service.ts:255`, `legal-encryption.service.ts`)
- Data in transit: TLS 1.2+ (enforced via `main.ts:240-259` helmet HSTS)
- Passwords: argon2 + bcrypt hashing (`argon2@0.45.1`, `bcrypt@6.0.0`)
- Access control: RBAC with `@Roles` and `@Permissions` decorators (`security/permissions.ts`)
- Rate limiting: `express-rate-limit` with Redis store (`main.ts:170-180`)
- Security headers: Helmet with CSP, HSTS, X-Frame-Options (`main.ts:240-259`)
- MFA: TOTP via `otplibrary@12.0.1`

See our **Security Policy** and **Responsible Disclosure Policy** for details.

---

## 12. Changes to This Policy

We may update this Privacy Policy. Material changes will be notified via:
- In-app notification
- Email to registered address
- Updated version number and effective date

Where consent is required, we will re-prompt for consent before the change takes effect.

---

## 13. Contact Us

- **Data Protection Officer (DPO):** privacy@spicegarden.com
- **Grievance Officer (DPDP Act 2023):** grievance@spicegarden.com | +91-0000000000 [PLACEHOLDER — real phone to be provided]
- **Postal address:** [PLACEHOLDER — registered office address]
- **Consent Manager:** https://spicegarden.com/api/consent/manager

---

## Grounding Checklist

| Claim | Codebase Evidence |
|-------|------------------|
| Name collected | `user.entity.ts:14` ✓ |
| Email collected | `user.entity.ts:17` ✓ |
| Phone collected | `user.entity.ts:20` ✓ |
| Addresses stored | `address.entity.ts:15-29` ✓ |
| Location data | `address.entity.ts:30-34`, `driver.entity.ts:41-45`, `restaurant-branch.entity.ts:35` ✓ |
| Device info | `user-device.entity.ts:22-26`, `device-fingerprint.entity.ts:20-23` ✓ |
| Tokenized payments | `payment-method.entity.ts:16-35` ✓ |
| Full cards never stored | Payment via Stripe `stripe@15.0.0`, Razorpay; only `cardLast4` kept ✓ |
| Wallet | `wallet.entity.ts`, `wallet-transaction.entity.ts` ✓ |
| Orders | `order.entity.ts`, `order-item.entity.ts` ✓ |
| Real-time driver GPS | `driver.entity.ts:41-45` ✓ |
| OTP/2FA | `otp.entity.ts:3-54`, `mfa.entity.ts` ✓ |
| Sessions/refresh tokens | `session.entity.ts:5-38`, `auth.controller.ts:29-43` ✓ |
| Cookies listed | `auth.controller.ts:29-43`, `csrf.middleware.ts:47` ✓ |
| Analytics events | `analytics-event.entity.ts:18-42`, `packages/ui/analytics.ts` ✓ |
| Crash logs (Sentry) | `main.ts:218-224`, `sentry.client.config.ts`, `App.tsx:28-32` ✓ |
| AI conversation data | `ai.service.ts:67-68`, `ai.service.ts:261-295` ✓ |
| Export endpoint | `privacy.controller.ts:97-127`, `data-subject-request.service.ts:389-524` ✓ |
| Deletion endpoint | `data-subject-request.service.ts:204-282`, `data-privacy.service.ts:118-152` ✓ |
| Consent recording | `consent.service.ts:64-130`, `legal.controller.ts:195-207` ✓ |
| Retention schedules | `retention.service.ts:19-38` ✓ |
| Grievance officer | `grievance.service.ts:22-27` ✓ |
| Children's age gate | Not enforced in code (self-declared only) — GAP flagged ✓ |
| No reviews collected | No `review.entity.ts` found — confirmed absent ✓ |
| No favorites collected | No favorites entity found — confirmed absent ✓ |
| Camera (mobile) | `customer-mobile/app.config.js:35,58` ✓ |
| Photos (mobile) | `customer-mobile/app.config.js:36,59-60` ✓ |
| Push tokens | `user-device.entity.ts:17-20`, `App.tsx:150-162` ✓ |
| DPDP officer | `grievance.service.ts:36-38` ✓ |
