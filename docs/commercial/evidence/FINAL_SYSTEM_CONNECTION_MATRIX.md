# Final System Connection Matrix & Graph — SpiceGarden RC-1.0.0

**Repository:** SpiceGarden Multi-Tenant Food Delivery Monorepo  
**Release Candidate:** `v1.0.0-rc1` / RC-1.0.0  
**Audit Date:** 2026-09-29  

---

## 1. Verified Architecture Connection Graph

```
                   ┌───────────────────────────────────────┐
                   │ Customer Web / Customer Mobile / KDS │
                   │  Super Admin / Delivery Partner App   │
                   └──────────────────┬────────────────────┘
                                      │ HTTP / REST / WebSocket
                                      ▼
                   ┌───────────────────────────────────────┐
                   │    NestJS API Gateway / Backend       │
                   └─────┬────────────┬────────────┬───────┘
                         │            │            │
            ┌────────────┼────────────┼────────────┼────────────┐
            │            │            │            │            │
            ▼            ▼            ▼            ▼            ▼
     ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────┐ ┌───────────┐
     │PostgreSQL │ │   Redis   │ │  MongoDB  │ │ Stripe │ │  FCM/APNs │
     │  (ACID)   │ │ (Pub/Sub) │ │ (Audits)  │ │Razorpay│ │  Twilio   │
     └───────────┘ └─────┬─────┘ └───────────┘ └────────┘ └───────────┘
                         │
                         ▼
                   ┌───────────┐
                   │  BullMQ   │
                   │  Workers  │
                   └─────┬─────┘
                         │
                         ▼
             ┌───────────────────────┐
             │ Socket.IO Dispatcher  │
             │  (Realtime Broadcast) │
             └───────────┬───────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │ Customer Live Tracker │
             │   & Kitchen Display   │
             └───────────────────────┘
```

---

## 2. Component Connection Classification Matrix

| Connection Path | Protocol / Driver | Implementation Entity | Status | Evidence Document |
|---|---|---|---|---|
| Customer Web → Backend REST API | HTTP / Axios | `@spicegarden/api-types` contracts | **VERIFIED** | `API_FRONTEND_CONTRACT_AUDIT.md` |
| Customer Mobile → Backend REST API | HTTP / Fetch | React Native API clients | **VERIFIED** | `MOBILE_RUNTIME_VALIDATION.md` |
| Restaurant KDS → Backend REST API | HTTP / Next.js | `useKDS` hook & KitchenController | **VERIFIED** | `API_FRONTEND_CONTRACT_AUDIT.md` |
| Super Admin → Backend REST API | HTTP / Next.js | `AdminController` & DTOs | **VERIFIED** | `API_FRONTEND_CONTRACT_AUDIT.md` |
| Backend → PostgreSQL 15+ | TCP / TypeORM | Connection Pool & Data Source | **VERIFIED** | `DATABASE_INTEGRATION_VALIDATION.md` |
| Backend → Redis 7+ | TCP / `ioredis` | Rate limiter & Session Store | **VERIFIED** | `DATABASE_INTEGRATION_VALIDATION.md` |
| Backend → MongoDB 7+ | TCP / Mongoose | `AuditService` & Event Store | **VERIFIED** | `DATABASE_INTEGRATION_VALIDATION.md` |
| Backend → BullMQ Job Workers | Redis Queues | `order-queue`, `refund-queue` | **VERIFIED** | `DATABASE_INTEGRATION_VALIDATION.md` |
| Backend → Socket.IO Gateway | WebSocket / WS | `TrackingGateway` & Redis adapter | **VERIFIED** | `REALTIME_SOCKET_VALIDATION.md` |
| Backend → Stripe / Razorpay | HTTPS / SDK | `GatewayFactoryService` & Webhooks | **VERIFIED (IN-CODE)** | `PAYMENT_INTEGRATION_VALIDATION.md` |
| Backend → FCM / Twilio / SendGrid | HTTPS / SDK | `ProductionNotificationService` | **VERIFIED (IN-CODE)** | `NOTIFICATION_INTEGRATION_VALIDATION.md` |
