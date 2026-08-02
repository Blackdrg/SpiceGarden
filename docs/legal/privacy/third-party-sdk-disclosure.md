# Third-Party SDK & Service Disclosure

**Draft status:** FIRST DRAFT for human/legal review. Grounded in actual `package.json` dependencies and code analysis. Must be reviewed by a qualified lawyer before publication.

**Effective date:** [PLACEHOLDER — to be set by business owner]

---

## 1. Error Monitoring & Crash Reporting

| SDK | Version | App | Files | Data Collected |
|-----|---------|-----|-------|----------------|
| `@sentry/node` | 10.68.0 | Backend | `main.ts:218-224`, `main.ts:9` | Unhandled exceptions, stack traces, request URLs, request headers (sanitized), Express errors via `setupExpressErrorHandler()`. `sendDefaultPii` not set → defaults to false (IP not auto-attached). |
| `@sentry/nextjs` | 10.68.0 | Customer Web, Restaurant Dashboard, Super Admin | `sentry.client.config.ts:1-10`, `sentry.config.ts:1-10`, `restaurant-dashboard/sentry.config.ts:21-28`, `super-admin/src/pages/_app.tsx:12-18` | Client-side JavaScript errors, React component stack traces, page view transactions, performance spans (tracesSampleRate: 0.05-0.1, super-admin: 0.0). No Sentry Replay or Feedback widget configured. |
| `@sentry/react-native` | 8.21.0 | Customer Mobile, Delivery Partner | `customer-mobile/App.tsx:28-32`, `delivery-partner/App.tsx:5-9` | Native crashes, JS errors, stack traces, device context (OS, model, battery, memory), transactions (tracesSampleRate: 1.0). No Replay or Profiling explicitly configured. |

**Sentry DSN** is configured via environment variable (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`). Data is transmitted to `https://sentry.io` (or a self-hosted Sentry instance if `SENTRY_DSN` points elsewhere).

**No automatic PII capture (`sendDefaultPii=false` by default):**
- IP addresses are not automatically attached to events
- Cookies are not captured
- Local variables are not attached unless explicitly set

---

## 2. Push Notifications

| SDK | Version | App | Files | Data Collected |
|-----|---------|-----|-------|----------------|
| `expo-notifications` | 56.0.17 | Customer Mobile, Delivery Partner | `customer-mobile/App.tsx:7,34-40,150-162`, `delivery-partner/App.tsx` | Push token (via `Notifications.getExpoPushTokenAsync`), notification response, device token |
| Firebase Cloud Messaging (FCM) | — | Customer Mobile | `app.config.js:85` (plugin) | FCM token, delivery receipts |
| Apple Push Notification Service (APNs) | — | Customer Mobile, Delivery Partner | `app.config.js:41` (aps-environment: production) | APNs token, delivery receipts |

Push tokens are stored in `UserDeviceEntity.fcmToken` / `apnsToken` (`user-device.entity.ts:17-20`).

---

## 3. Location Services

| SDK | Version | App | Files | Data Collected |
|-----|---------|-----|-------|----------------|
| `expo-location` | 56.0.17 | Customer Mobile | `app.config.js:30-32,56-57` | Precise GPS location (during active orders/shifts) |
| `expo-location` | 56.0.17 | Delivery Partner | `delivery-partner/app.config.js:24-26` | Precise GPS location (during active shifts) |

Location permissions are declared in `app.config.js` infoPlist entries (`NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`).

---

## 4. Secure Storage

| SDK | Version | App | Files | Data Stored |
|-----|---------|-----|-------|-------------|
| `expo-secure-store` | 56.0.0 | Customer Mobile, Delivery Partner | `app.config.js:87` (plugin) | Auth tokens, refresh tokens (encrypted at rest) |
| `@react-native-async-storage/async-storage` | 2.2.0 | Customer Mobile | `storage.keys.ts:2-11` | Cart, user profile cache, recent searches (not encrypted) |

**Storage keys in customer-mobile:**
- `spicegarden_cart` (`storage.keys.ts:2`)
- `spicegarden_user` (`storage.keys.ts:3`)
- `spicegarden_address` / `spicegarden_addresses` (`storage.keys.ts:4-5`)
- `spicegarden_orders_cache` (`storage.keys.ts:6`)
- `spicegarden_auth_token` (`storage.keys.ts:7`) — should use secure-store
- `spicegarden_refresh_token` (`storage.keys.ts:8`) — should use secure-store
- `spicegarden_recent_searches` (`storage.keys.ts:11`)

---

## 5. Payment Processing

| Provider | Integration | Files | Data Shared |
|----------|-------------|-------|-------------|
| Stripe | `stripe@15.0.0` (backend) | `webhook.service.ts:64`, `gateway-factory.service.ts` | Tokenized card data, payment intents, webhooks (signed via `STRIPE_WEBHOOK_SECRET`) |
| Razorpay | `razorpay` (backend) | `webhook.service.ts:66` | Payment payloads, webhook signatures |
| PhonePe | Custom (HMAC-SHA256) | `webhook.service.ts:68,180-201` | Payment request/response payloads |
| Paytm | Custom (checksum) | `webhook.service.ts:69,201-218` | Payment request/response payloads |

**Card data:** Full card numbers are never stored on SpiceGarden servers. Only `cardLast4`, `cardBrand`, `cardExpiry` tokens are kept in `PaymentMethodEntity` (`payment-method.entity.ts:16-35`). All card processing is handled by PCI-DSS compliant providers.

---

## 6. Communications

| Provider | SDK/Method | Files | Data Shared |
|----------|-----------|-------|-------------|
| Twilio | `twilio` (backend, via Twilio SDK) | Env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Phone numbers, OTP codes (6-digit, 24-hour expiry) |
| SendGrid / email provider | SMTP / SendGrid API | Env: `SMTP_PASS`, `SENDGRID_API_KEY` | Email addresses, email content |
| Firebase (FCM) | `expo-notifications` → FCM | `user-device.entity.ts:17` | Device tokens for push delivery |
| Apple (APNs) | Native APNs via Expo | `app.config.js:41` (`aps-environment: production`) | Device tokens for push delivery |

---

## 7. Mapping & Geolocation

| Provider | API Usage | Files | Data Shared |
|----------|-----------|-------|-------------|
| Google Maps Platform | Geocoding, reverse geocoding, directions, static maps | Env: `GOOGLE_MAPS_API_KEY`; `customer-web/src/pages/tracking.tsx` | Latitude/longitude coordinates, addresses, route waypoints |

---

## 8. Analytics (Self-Hosted)

| Tool | Type | Files | Data Collected |
|------|------|-------|---------------|
| In-house analytics | `packages/ui/analytics.ts` | `analytics-event.entity.ts:18-42`, `analytics.service.ts:10-48` | Page views, clicks, custom events (order_placed, payment_success, etc.), web vitals (LCP, FID, CLS). Sent via `navigator.sendBeacon` to `/api/analytics`. |
| Prometheus | Metrics | `metrics.service.ts`, `main.ts:322-337` | HTTP metrics, request duration, AI call counts, error counts. No PII. |
| OpenTelemetry | Tracing | `observability/otel.setup.ts`, `main.ts:226-228` | Request traces (method, path, duration, status code). No PII when `sendDefaultPii=false`. Export target: Jaeger (`@opentelemetry/exporter-trace-otlp-grpc`). |
| Grafana | Visualization | `docker-compose.yaml` | Dashboards consuming Prometheus metrics. No direct data collection. |

**No third-party analytics SDKs** (no Google Analytics, no Segment, no Amplitude, no Mixpanel, no TikTok Pixel, no Meta Pixel).

---

## 9. AI / Machine Learning

| Service | API/Method | Files | Data Shared |
|---------|-----------|-------|-------------|
| OpenAI | `https://api.openai.com/v1/chat/completions` | `ai.service.ts:261-295`, `ai-control-plane.service.ts:191-204` | User message + system prompt (max 200 tokens). Model: `gpt-4o-mini` (default). Fallback: `gpt-4o`, `gpt-3.5-turbo`. |
| OpenAI | `https://api.openai.com/v1/embeddings` | `ai.service.ts:318-328` | Text input for embedding generation. Model: `text-embedding-3-small`. |
| Optional Vector DB | Custom HTTP API | `ai.service.ts:392-402`, `ai.service.ts:474-489` | Embedding vectors + metadata. URL: `VECTOR_DB_URL` env var (not currently configured in most environments). |

**Context memory** (`ai.service.ts:67`) is stored in-process (RAM), max 20 messages per session, not persisted. **RAG documents** (`ai.service.ts:66`) are stored in-process, not persisted.

---

## 10. Data Processing Agreements

The following third-party services are expected to be covered by Data Processing Agreements (DPAs):
- Stripe (PCI-DSS, DPA available)
- Sentry (DPA available at sentry.io)
- Twilio (DPA available)
- SendGrid (DPA available)
- Google Cloud (GMP, DPA available)

---

## Source

Scanned from `package.json` files across all workspaces (root, `apps/*`, `packages/*`) and Sentry SDK initialization code. Full license inventory in `docs/legal/oss-licenses.csv`.
