# SPICEGARDEN CROSS-SYSTEM TRANSACTION TRACE
**Release Baseline:** `v1.0.0-rc1` | **Trace ID:** `TRC-ORDER-79428-QUAL`
**Transaction Under Test:** End-to-End Customer Order Creation, Kitchen Acceptance, Driver Dispatch, Real-Time Telemetry & Final Settlement

---

## 1. Trace Lifecycle Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Web/Mobile)
    participant API as Backend API (Port 3001)
    participant DB as PostgreSQL (Primary)
    participant Redis as Redis / BullMQ
    participant Kitchen as Kitchen Display System (Port 3003)
    actor Driver as Delivery Partner (Port 3006)
    participant Admin as Super Admin (Port 3004)

    Customer->>API: 1. POST /orders (Basket: 2 items, ₹649.00)
    API->>DB: 2. BEGIN TRANSACTION -> Lock Inventory -> Insert Order #79428
    API->>Redis: 3. BullMQ Job 'order-processing' created
    API->>Customer: 4. HTTP 201 Created (OrderID: 79428, Status: CREATED)
    
    Redis->>API: 5. Worker processes job -> Broadcast 'order:created' via WebSocket
    API->>Kitchen: 6. WS Event -> KDS updates ticket list in real-time
    
    Kitchen->>API: 7. PUT /kitchen/orders/79428/status (Status: PREPARING)
    API->>DB: 8. UPDATE orders SET status='PREPARING'
    API->>Customer: 9. WS Event -> Customer Tracking page displays 'Kitchen is preparing your food'
    
    Kitchen->>API: 10. PUT /kitchen/orders/79428/status (Status: READY)
    API->>Redis: 11. BullMQ 'driver-assignment' matches nearby Driver RIDER-104
    API->>Driver: 12. Push Notification + In-App Modal: Incoming Delivery
    
    Driver->>API: 13. POST /driver/orders/accept (OrderID: 79428)
    API->>DB: 14. UPDATE orders SET driver_id='RIDER-104', status='DISPATCHED'
    API->>Customer: 15. WS Event -> Rider assigned, live map polyline rendered
    
    loop GPS Telemetry Every 5s
        Driver->>API: 16. POST /driver/location (lat: 12.9716, lng: 77.5946)
        API->>Redis: 17. Update Geospatial Index
        API->>Customer: 18. WS Event -> Smooth car icon movement on tracking map
    end
    
    Driver->>API: 19. POST /driver/orders/deliver (OTP: 4892)
    API->>DB: 20. UPDATE orders SET status='DELIVERED' -> COMMIT
    API->>Admin: 21. Ledger updated, GMV +₹649.00, Merchant payout credited
    API->>Customer: 22. Delivered animation + Receipt available
```

---

## 2. Multi-System State Verification Matrix

| Subsystem / Layer | Expected State | Actual State | Verified In | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Customer UI (Port 3002)** | Live status switches CREATED -> PREPARING -> READY -> DISPATCHED -> DELIVERED | Exact status updated without manual reload | Playwright Chromium Browser Session | **PASS** |
| **Backend API (Port 3001)** | HTTP 201 on create, 200 on transitions with idempotent token | All status codes and validation payloads compliant | Jest Integration Suite | **PASS** |
| **PostgreSQL Database** | Atomic row created in `orders`, foreign keys in `order_items`, status = `DELIVERED` | Record verified in DB with consistent timestamps | TypeORM Transaction Test | **PASS** |
| **Redis Cache / BullMQ** | Jobs enqueued, processed, and evicted upon completion without deadlocks | 0 lingering stalled jobs, memory stable | BullMQ Worker Test | **PASS** |
| **Kitchen KDS (Port 3003)** | Ticket arrives on KDS board, audio ping triggers, moves to Completed column | Real-time DOM reaction verified | KDS Automated E2E Suite | **PASS** |
| **Delivery App (Port 3006)** | Shift online, order modal pops up, turn-by-turn routing, OTP validation | OTP match validated, completion logged | Delivery Flow E2E Suite | **PASS** |
| **Super Admin (Port 3004)** | Order appears in Live Orders, GMV card increments, ledger entry balanced | Admin dashboard metrics reflect transaction | Admin Analytics E2E Suite | **PASS** |

**Conclusion:** Transaction consistency preserved across individual test suites with zero state divergence or orphan records.

## 3. Authoritative Release Boundary
- Individual application integration paths (Customer UI, Backend API, PostgreSQL, Redis, BullMQ, Kitchen KDS, Delivery Partner, Super Admin) were directly validated where documented.
- Simultaneous multi-application synchronization was qualified through fixture/mock-assisted integration evidence and is NOT equivalent to unrestricted live production cross-application E2E validation.
