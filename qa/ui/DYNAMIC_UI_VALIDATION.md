# SPICEGARDEN DYNAMIC UI & LIVE DATA BINDING VALIDATION
**Standard:** Verify that primary dynamic production workflows reflect authoritative database / WebSocket state.

## 1. Pipeline Verification Matrix

| Page / Operational View | State Source | API Endpoint / WS Channel | Verified Dynamic Propagation | Zero Fake Mocks Verified | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer Order Tracking (Web)** | PostgreSQL `orders` + Redis GPS | WebSocket: `/ws/tracking` | Driver coordinates update map car icon smoothly every 5s | Confirmed: Bound to real GPS coords | **PASS** |
| **Customer Cart Subtotal** | In-Memory Redux + Server Sync | API: `POST /orders/quote` | Recomputes discounts, GST, and delivery tier upon item add | Confirmed: Real price computation | **PASS** |
| **Kitchen Display System (KDS)**| PostgreSQL `orders` + BullMQ | WebSocket: `/ws/kds` | New tickets slide onto board instantly on customer checkout | Confirmed: Zero hardcoded mock orders | **PASS** |
| **KDS Stock Availability** | PostgreSQL `menu_items` | API: `PUT /kitchen/inventory` | Toggling stock off instantly grays out item on Customer Web | Confirmed: Direct DB state reflection | **PASS** |
| **Driver Shift & Order Dispatch**| Redis Geo + BullMQ Dispatcher | WebSocket: `/ws/orders` | Order prompt pops up on rider screen when nearby | Confirmed: Bound to real driver ID | **PASS** |
| **Super Admin Executive Metrics**| Redis Aggregation + Postgres | API: `GET /admin/stats` | GMV, order volume, active drivers reflect live numbers | Confirmed: Real database aggregation | **PASS** |
| **Fraud Block Register** | Redis Velocity Cache + Postgres | API: `GET /admin/fraud/rules` | Blocks suspicious accounts exceeding rate limits in real-time| Confirmed: Real fraud rule engine | **PASS** |
| **Loyalty Wallet Balance** | PostgreSQL `wallets` + Ledger | API: `GET /wallet` | Balance increments on refund and decrements on redemption | Confirmed: Double-entry ledger bound | **PASS** |

## 2. Scope & Exception Notes
- Core transaction workflows (checkout, KDS, admin stats, driver shift) are live connected.
- Static fallback data is retained for standalone menu browse routes (e.g. `customer-web/restaurant.tsx`) for offline resiliency.
- Native mobile `TrackingScreen` and `OrderDetailsScreen` in `customer-mobile` remain developmental prototypes in RC1.

**Conclusion:** Primary web operational flows reflect dynamic database/WebSocket state as documented.
