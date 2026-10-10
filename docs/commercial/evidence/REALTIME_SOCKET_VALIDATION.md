# Realtime & WebSocket / Socket.IO Validation — SpiceGarden RC-1.0.0

**Repository:** SpiceGarden Multi-Tenant Food Delivery Monorepo  
**Release Candidate:** `v1.0.0-rc1` / RC-1.0.0  
**Audit Date:** 2026-09-29  

---

## 1. Architecture & Gateway Implementation

* **Gateway:** `TrackingGateway` (`@nestjs/websockets`, `@nestjs/platform-socket.io`, Socket.IO server `v4.8.3`).
* **Adapter / PubSub:** Redis Pub/Sub adapter enabled for horizontal multi-pod clustering across Kubernetes API pods.
* **Authentication:** Handshake authentication using JWT bearer token extraction from query params or connection headers. Unauthenticated connection attempts are immediately rejected.
* **Room-Based Isolation:**
  - `restaurant:{restaurantId}`: Dedicated room for KDS order alerts and kitchen updates.
  - `order:{orderId}`: Dedicated room for customer live driver tracking.
  - `driver:{driverId}`: Dedicated room for individual dispatch offers and alerts.

---

## 2. Event Registry & Flow Verification

| Event Name | Direction | Payload Schema | Authorization / Room | Validation Status |
|---|---|---|---|---|
| `subscribe_order` | Client → Server | `{ orderId: string }` | Customer / Admin owning the order | **VERIFIED** (`tracking.gateway.unit.spec.ts`) |
| `location_update` | Driver → Server | `{ orderId, driverId, lat, lng, heading, speed }` | Authenticated Driver assigned to order | **VERIFIED** (`tracking.gateway.unit.spec.ts`) |
| `driver:location_update` | Server → Customer | `{ orderId, lat, lng, eta, heading }` | `order:{orderId}` room subscribers | **VERIFIED** (`tracking.gateway.unit.spec.ts`) |
| `order:status_changed` | Server → All | `{ orderId, status, timestamp, eta }` | `order:{orderId}` & `restaurant:{restaurantId}` | **VERIFIED** (`order-kds.integration.spec.ts`) |
| `order:new` | Server → Kitchen | `{ orderId, items, customerName, total }` | `restaurant:{restaurantId}` room | **VERIFIED** (`order-kds.integration.spec.ts`) |

---

## 3. Disconnect & Reconnect Resilience

1. **Heartbeat & Ping/Pong:** Default Socket.IO 25s ping interval with 20s timeout configured.
2. **Buffer & Replay:** Driver location messages update Redis latest coordinate KV store; on client reconnect, the latest known position is immediately delivered upon re-subscribing.
3. **Unauthorized Subscription Protection:** Attempting to join an arbitrary `order:{id}` room without a valid JWT matching the order's customer ID or assigned driver ID returns an authorization error and disconnects the client.
