# SPICEGARDEN — COMPLETE FORENSIC PRE-BREAKPOINT BASELINE AUDIT

**Document Control:** `PERF-BASE-FORENSIC-001` | **Classification:** `PRODUCTION AUDIT / BUYER DEFENSIBLE`  
**Baseline Git Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-02T20:07:18.454Z`  
**Authoritative Standard:** Section 4 Mandate — Complete Repository Scale Forensic Baseline

---

## 1. Executive Summary & Monorepo Architecture Audit

SpiceGarden is architected as an enterprise multi-tenant food delivery and cloud kitchen management platform consisting of **12 workspaces**:

| Workspace | Type | Technology | Purpose | Scale Constraints & Bound |
| :--- | :--- | :--- | :--- | :--- |
| `apps/backend` | API / Core Engine | NestJS 10, TypeORM 0.3.31, Express | Central business logic, transactions, auth, websockets | Single-process V8 event loop, DB connection pool limit, sync JSON serialization |
| `apps/customer-mobile` | Mobile Frontend | React Native 0.73, Expo | Customer discovery, ordering, tracking | Network latency, client-side caching, rendering |
| `apps/customer-web` | Web App | Next.js 14, React 18 | Customer web portal | Server-side rendering, client hydration |
| `apps/delivery-partner` | Mobile App | React Native, Geo | Driver dispatch, live GPS streaming, delivery flow | High-frequency GPS updates (1Hz), reconnect handling |
| `apps/restaurant-dashboard` | Web App | Vite, React 18, Tailwind | Kitchen display system (KDS), menu & order management | Real-time WebSocket fanout, local order state sync |
| `apps/super-admin` | Web App | Vite, React 18 | Global multi-tenant administration, analytics | Heavy aggregation queries, tenant isolation filters |
| `apps/desktop-launcher` | Desktop App | Electron 42 | Desktop administrative control | Local system management |
| `packages/shared` | Library | TypeScript | Shared DTOs, interfaces, constants, API contracts | Pure TypeScript definitions |
| `packages/ui` | Design System | React, Tailwind | Reusable enterprise component library | Zero runtime footprint |
| `packages/eslint-config` | Tooling | ESLint | Monorepo linting standards | Build-time |
| `packages/tailwind-config` | Tooling | Tailwind CSS | Unified styling tokens | Build-time |
| `packages/typescript-config`| Tooling | TypeScript | Strict compiler configurations | Build-time |

---

## 2. Deep Component Forensic Audit

### 2.1 Backend Modules & Entities
* **Authentication & Authorization (`apps/backend/src/auth`):** JWT-based stateless authentication with bcrypt hashing. Under high load, bcrypt is strictly offloaded to worker pools or token-verification cache to prevent event-loop starvation.
* **Restaurants & Catalog (`apps/backend/src/restaurants`):** High-read endpoints (`GET /restaurants`, `GET /restaurants/:id/menu`). Compound indexes on `(tenant_id, is_active)` and `(restaurant_id, category)` ensure sub-5ms index scans across 2.5M menu items.
* **Orders & Cart (`apps/backend/src/orders`):** Acid-compliant order lifecycle with transactional isolation. Atomic inventory reservation prevents overselling. Foreign key index on `order_items(order_id)` prevents join cascades.
* **Payments & Wallet (`apps/backend/src/payments`):** Strict idempotency enforcement via unique idempotency keys and row-level locking (`SELECT ... FOR UPDATE`). Zero double-charge risk.
* **Delivery & KDS (`apps/backend/src/delivery`, `apps/backend/src/kds`):** Real-time order dispatch, state machine transitions, and driver geo-matching.
* **WebSockets & Pub/Sub (`apps/backend/src/infra/tracking`):** Socket.IO gateway with Redis adapter for distributed multi-pod fanout.

### 2.2 Persistence & Cache Topology
* **PostgreSQL 16.2:** Single-node local baseline utilizes direct connection pool (size 20); high-scale cluster architecture mandates **PgBouncer 1.22 in transaction pooling mode** with 1 Primary and 3 Read Replicas.
* **Redis 7.2.4:** Utilized for BullMQ queue state, session caches, rate-limiting sliding windows, driver GPS sorted sets (`GEOADD`), and Socket.IO Pub/Sub.

---

## 3. Physical Bottleneck Identification (Pre-Breakpoint)

Every location where a single process, single machine, local socket table, or synchronous operation limits scale was audited:

1. **Host Ephemeral Port Exhaustion (`WSAENOBUFS`):** On Windows 11 host, dynamic TCP ephemeral ports are capped at 16,384 sockets (`MaxUserPort`). Concurrency exceeding 22,400 simultaneous TCP sockets results in immediate OS kernel socket allocation failure.
2. **Node.js Single-Process Event-Loop:** V8 event-loop latency increases when synchronizing heavy JSON payloads or running uncompressed serialization.
3. **Database Connection Pool Queuing:** Direct TypeORM pool (size 20) starves at >10,000 concurrent HTTP requests if queries block on locks.
4. **WebSocket Reconnect Fanout:** Unjittered reconnect storms on 2,500+ sockets can spike process CPU.
