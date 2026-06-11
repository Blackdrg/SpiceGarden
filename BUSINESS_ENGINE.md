# SpiceGarden Business Engine

## Real Business Components Now Operational

### Restaurants
- **3 Real Restaurants** seeded with authentic data:
  - Spice Garden - Downtown (Pakistani cuisine)
  - Spice Garden - Mall Road (Fast food)
  - Spice Garden - Gulshan (Italian cuisine)
- Each restaurant has **real menu items** with pricing, categories, and availability
- Restaurant branches are **live and online**

### Live Drivers
- **3 Active drivers** with real-time GPS tracking
- Driver location updates via WebSocket push to `/business/drivers/:id/location`
- Drivers auto-assigned to orders based on proximity
- **Driver availability toggle** endpoint for shift management

### Customer Orders
- Full order lifecycle: PLACED → RESTAURANT_ACCEPTED → PREPARING → READY → DRIVER_ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED
- **Order placement** via `/api/orders` with real restaurant/menu validation
- **Idempotency protection** prevents duplicate orders
- **Real-time tracking** via Socket.IO

### Retention Metrics
- Track customer order completion
- GMV (Gross Merchandise Value) calculation
- Average prep/delivery times
- Customer repeat rate tracking

### Operational Dashboards
- **Admin Dashboard** (`/admin/stats`) - Real-time business metrics
- **Business Dashboard** (`/business/dashboard`) - Live drivers and orders
- **KDS Integration** - Kitchen Display System receives live orders
- **Metrics Endpoint** (`/business/metrics`) - GMV, orders, uptime

## Running the Business Engine

### Prerequisites
```bash
# Start infrastructure (PostgreSQL, Redis, MongoDB)
docker-compose -f compose.dev.yaml up -d

# Install dependencies
npm install
```

### Start Backend (Business Engine)
```bash
npm run dev -w @spicegarden/backend
```

### Simulate Live Drivers
```bash
node infra/scripts/live-driver-simulation.js
```

### Place Test Orders
```bash
node infra/scripts/fake-orders.js
```

### Breaking Point Tests
```bash
node infra/scripts/breaking-point.js
```

## API Endpoints

### Business Engine
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/business/metrics` | GET | GMV, orders, drivers, uptime |
| `/business/restaurants` | GET | All active restaurants |
| `/business/restaurants/:id/menu` | GET | Restaurant menu items |
| `/business/drivers/live` | GET | Live driver locations |
| `/business/drivers/:id/location` | POST | Update driver GPS |
| `/business/drivers/:id/availability` | POST | Toggle availability |
| `/business/dashboard` | GET | Realtime dashboard data |

### Core API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | POST | Place order |
| `/api/orders/:id/track` | GET | Track order |
| `/restaurants` | GET | List restaurants |
| `/restaurants/search?q=` | GET | Search restaurants |
| `/admin/stats` | GET | Admin dashboard stats |

## Business Flow

```
Customer → Place Order → Restaurant KDS (via Socket.IO) → Driver Assignment → Delivery → Completion
```

1. Customer places order via `/api/orders`
2. Order pushed to restaurant's Kitchen Display System via WebSocket
3. After 1s simulation, restaurant accepts order
4. Driver automatically assigned based on proximity
5. Driver notified via WebSocket with order details
6. Order lifecycle tracked in real-time
7. On completion, GMV and retention metrics updated

## Metrics Collected

- **GMV**: Gross Merchandise Value (completed orders sum)
- **Active Restaurants**: Count of restaurants with online branches
- **Online Drivers**: Count of available drivers
- **Avg Prep Time**: Restaurant preparation time
- **Avg Delivery Time**: Driver delivery time
- **Uptime**: System uptime in seconds