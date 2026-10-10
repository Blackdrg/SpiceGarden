# SPICEGARDEN — 500K REALISTIC MULTI-TENANT TRAFFIC PROFILE

## 1. Traffic Distribution & Workload Mix

To reflect real-world production food delivery operations, the 500K benchmark uses the established workload distribution across 6 distinct user journey flows:

| Workload Flow | Traffic Share (%) | Target Active VUs (at 500K) | Target RPS (Est. ~250k - 300k RPS) | Key Endpoints & Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **1. Catalog & Restaurant Browsing** | `45.0%` | `225,000` | ~120,000 RPS | `GET /api/v1/restaurants`<br>`GET /api/v1/restaurants/:id/menu` |
| **2. Search & Geo-Discovery** | `20.0%` | `100,000` | ~55,000 RPS | `GET /api/v1/restaurants/search?lat={x}&lng={y}&q={q}` |
| **3. Cart & Pricing Computation** | `10.0%` | `50,000` | ~27,000 RPS | `GET /api/v1/cart`<br>`POST /api/v1/cart/items` |
| **4. Checkout, Orders & Payment** | `8.0%` | `40,000` | ~22,000 RPS | `POST /api/v1/orders`<br>`POST /api/v1/payments/initiate` |
| **5. Live Order Tracking (WS)** | `14.0%` | `70,000` | ~38,000 WS conn/s | `GET /api/v1/orders/:id/tracking`<br>`WSS /socket.io/?transport=websocket` |
| **6. Merchant & Admin Operations** | `3.0%` | `15,000` | ~8,000 RPS | `GET /api/v1/admin/analytics`<br>`PATCH /api/v1/kitchen/orders/:id/status` |
| **Total Workload** | **100.0%** | **500,000 Active VUs** | **~270,000 RPS** | **Full System Surface** |

---

## 2. Multi-Tenant Distribution & Anti-Hotspotting Rules

A realistic benchmark must avoid concentrating traffic onto a single database partition or cache key:

1. **Tenant Distribution**:
   - Traffic distributed across **50 distinct tenant IDs** using a Zipfian distribution (80% traffic across top 20% tenants, 20% long-tail).
2. **Restaurant & Menu Distribution**:
   - Over **1,000 active restaurants** with distinct menu catalog structures.
3. **Hot-Row & Key Mitigation**:
   - Inventory locking utilizes fine-grained item-level row locks (`SELECT ... FOR UPDATE` on specific menu item rows, rather than table/restaurant-level locks).
   - Redis cache keys are hash-tagged per tenant (`{tenant:101}:menu:202`) ensuring uniform distribution across Redis cluster hash slots.
4. **Authentication & Session Tokens**:
   - Real JWT tokens signed with RS256, verified via local public key caching to avoid redundant cryptographic auth overhead.
