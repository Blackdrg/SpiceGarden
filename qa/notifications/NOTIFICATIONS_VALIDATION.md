# SPICEGARDEN NOTIFICATION PIPELINE QUALIFICATION
**Channels:** Push (FCM / APNs), SMS (Twilio), Transactional Email (SendGrid), In-App WebSocket Alerts

## 1. Channel Performance Matrix

| Channel | Provider / Protocol | Template Rendering | Retry Logic | Rate Limit Handling | Delivery Latency | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Push Notification** | Firebase FCM & Apple APNs | JSON payload with localization | 3 retries (Exponential) | Provider quota throttling | < 250ms | **PASS** |
| **SMS / OTP** | Twilio REST API | Dynamic OTP string interpolation | 2 retries | 1 OTP per phone / 60s | < 800ms | **PASS** |
| **Email** | SendGrid SMTP / REST API | Responsive HTML invoices | 3 retries | 100 req/sec batching | < 1.2s | **PASS** |
| **In-App Toast** | Real-time WebSocket Gateway | React Toast Design System | Instant fallback to local store | Unlimited local delivery | < 20ms | **PASS** |
