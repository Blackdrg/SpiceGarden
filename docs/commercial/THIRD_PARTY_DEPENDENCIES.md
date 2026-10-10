# SpiceGarden — Third-Party Dependency & Vendor Service Inventory

## 1. Direct Framework & Library Dependencies

| Package / Library | Workspace / Area | Purpose | License |
|---|---|---|---|
| `@nestjs/core`, `@nestjs/common` | `apps/backend` | Enterprise Backend Framework | MIT |
| `typeorm` (`0.3.20`) | `apps/backend` | Relational ORM for PostgreSQL | MIT |
| `next` (`15.5.18`) | Web Applications | SSR/SSG React Web Framework | MIT |
| `react`, `react-dom` | All frontends | UI Rendering Engine | MIT |
| `expo`, `react-native` | Mobile Applications | Cross-Platform Mobile Engine | MIT |
| `ioredis` | `apps/backend` | Redis Client | MIT |
| `bullmq` | `apps/backend` | Redis Message & Job Queue | MIT |
| `socket.io` | `apps/backend` | Real-time WebSocket Protocol | MIT |
| `argon2`, `bcrypt` | `apps/backend` | Password Hashing | MIT |
| `helmet`, `hpp` | `apps/backend` | HTTP Header & Parameter Security | MIT |
| `@sentry/node`, `@sentry/react` | Backend & Web | Error & Telemetry Tracking | MIT / Apache-2.0 / BSD |
| `prom-client` | `apps/backend` | Prometheus Metrics Exporter | Apache-2.0 |
| `class-validator`, `class-transformer` | All packages | DTO Validation & Serialization | MIT |

## 2. External Cloud Services & APIs

| Provider | Service Domain | Implementation Status | Credential Configuration |
|---|---|---|---|
| **Stripe** | Credit Card / Online Payments | Implemented & Contract Verified | Requires `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET` |
| **Razorpay** | UPI / Netbanking Payments | Implemented & Contract Verified | Requires `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` |
| **Firebase (FCM)** | Android & Web Push Notifications | Implemented & Contract Verified | Requires `FCM_SERVER_KEY` |
| **Apple (APNs)** | iOS Push Notifications | Implemented & Contract Verified | Requires `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_PRIVATE_KEY` |
| **SendGrid** | Transactional Email | Implemented & Contract Verified | Requires `SENDGRID_API_KEY` |
| **Twilio** | SMS Verification & OTPs | Implemented & Contract Verified | Requires `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN` |
| **Google Maps** | Geocoding & Distance Calculation | Implemented & Fallback Supported | Requires `GOOGLE_MAPS_API_KEY` (Haversine math fallback included) |
| **Sentry** | APM & Error Monitoring | Implemented | Requires `SENTRY_DSN` |
