# Analytics

## Architecture

SpiceGarden implements a comprehensive analytics system covering platform metrics, order analytics, revenue tracking, delivery heatmaps, and business intelligence for restaurants and admins.

## Analytics Module

**File:** `apps/backend/src/modules/analytics/analytics.module.ts`
**Controller:** `apps/backend/src/modules/analytics/analytics.controller.ts`
**Service:** `apps/backend/src/modules/analytics/analytics.service.ts`

## Analytics Endpoints

**File:** `apps/backend/src/modules/analytics/analytics.controller.ts`

### Platform Analytics

```
GET /analytics/platform
```

**Guard:** JwtAuthGuard + RolesGuard (ADMIN, SUPER_ADMIN)

**Metrics:**
- Total revenue (24h, 7d, 30d)
- Total orders
- Active users
- Active drivers
- Active restaurants
- Average order value
- Delivery success rate

### Order Analytics

```
GET /analytics/orders
```

**Metrics:**
- Order volume trends
- Status breakdown (placed, preparing, delivered, cancelled)
- Peak order times
- Average prep time
- Average delivery time
- Cancellation rate

### Revenue Analytics

```
GET /analytics/revenue
```

**Metrics:**
- Revenue by time period
- Revenue by restaurant
- Revenue by cuisine type
- Payment method breakdown
- Refund rate

### Delivery Heatmap

```
GET /analytics/heatmap
```

**Response:**
```json
{
  "heatmap": [
    { "lat": 28.6139, "lng": 77.2090, "count": 150, "intensity": "high" }
  ],
  "timeRange": "24h"
}
```

### Top Dishes

```
GET /analytics/top-dishes
```

**Response:**
```json
{
  "dishes": [
    { "name": "Butter Chicken", "orders": 1250, "revenue": 187500 },
    { "name": "Biryani", "orders": 980, "revenue": 147000 }
  ]
}
```

## Super Admin Analytics

**File:** `apps/super-admin/src/pages/index.tsx`

### Dashboard Tabs

#### Overview Tab

**Components:**
- `KPICard` - Platform KPIs with delta indicators
- `RevenueChart` - Recharts AreaChart for 24h revenue
- `Live Order Feed` - Real-time order list
- `System Alerts` - Branch health monitoring
- `Delivery Heatmap` - Density visualization

**WebSocket Events:**
- `statsUpdate` - Platform statistics
- `newOrderGlobal` - New order notification
- `deliveryHeatmap` - Heatmap data
- `revenueUpdate` - Revenue data

#### Orders Tab

- Live orders table
- Status filtering
- Order details drill-down

#### Branches Tab

- Kitchen monitoring grid
- Branch status (operational/delayed/critical)
- Prep time progress bars
- Driver coverage indicators
- View KDS / Dispatch Driver actions

#### Support Tab

- 4-column layout:
  - SupportTicketsPanel
  - RefundManagement
  - FraudDetection

### Charts (Recharts)

**File:** `apps/super-admin/src/pages/RevenueChart.tsx`

- `AreaChart` - Revenue over time
- `AreaChart` - Orders over time
- Dynamic data updates via WebSocket

## Customer Web Analytics

**File:** `apps/customer-web/src/analytics.ts`

### Event Tracking

| Event | Trigger | Properties |
|-------|---------|------------|
| `page_view` | Route change | page, referrer |
| `click` | Button click | element, location |
| `order_placed` | Order placed | orderId, total, itemCount |
| `payment_success` | Payment complete | amount, gateway |
| `payment_failed` | Payment error | reason, amount |
| `search` | Search performed | query, resultsCount |
| `add_to_cart` | Item added | itemId, quantity, price |
| `web_vital` | Performance metric | metric, value |

### Web Vitals

**File:** `packages/ui/analytics.ts`

Tracked via `useWebVitals()`:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

## Restaurant Dashboard Analytics

**File:** `apps/restaurant-dashboard/src/pages/index.tsx`

**Metrics Displayed:**
- Order count by status
- Average prep time
- Delay warnings
- Inventory alerts

## Business Intelligence

### Revenue Tracking

**Entity:** `ledger-entry.entity.ts`

```sql
type VARCHAR(50) (order_payment, refund, payout, commission, tax)
amount DECIMAL(12,2)
currency VARCHAR(3)
reference_type VARCHAR(50)
reference_id UUID
user_id UUID
restaurant_id UUID
balance_after DECIMAL(12,2)
metadata JSONB
```

### Payout Reports

**Entity:** `payout-report.entity.ts`

```sql
restaurant_id UUID
period_start TIMESTAMP
period_end TIMESTAMP
total_orders INTEGER
total_revenue DECIMAL(12,2)
total_commission DECIMAL(12,2)
net_payout DECIMAL(12,2)
status VARCHAR(50)
```

### Commission Tracking

**Entity:** `commission-rule.entity.ts`

```sql
restaurant_id UUID
rate DECIMAL(5,2)
type VARCHAR(50) (percentage, fixed)
min_amount DECIMAL(10,2)
max_amount DECIMAL(10,2)
valid_from TIMESTAMP
valid_to TIMESTAMP
```

### Tax Reporting

**File:** `apps/backend/src/services/finance/tax-reporting.service.ts`

- GST calculation per order
- HSN/SAC code mapping
- Invoice generation
- Period-based tax reports

## Analytics Queue

**Queue:** `ANALYTICS` (`analytics`)

**Purpose:** Batch analytics aggregation

**Status:** Defined in QUEUE_NAMES, no worker registered

## Prometheus Metrics

### Custom Metrics

**File:** `apps/backend/src/main.ts:32-45`

```typescript
const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by method, route, and status code.",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
```

### Metrics Endpoint

```
GET /metrics
```

**Content-Type:** `text/plain`

**Format:** Prometheus exposition format

### Default Metrics

```typescript
collectDefaultMetrics({ register: metricsRegistry });
```

Includes:
- Node.js process metrics
- Event loop metrics
- Memory metrics
- CPU metrics

## Grafana Dashboards

**File:** `infra/grafana/dashboards/spicegarden.json`

**Provisioned:**
- Datasources in `infra/grafana/provisioning/datasources/`
- Dashboards in `infra/grafana/dashboards/`

## Error Tracking (Sentry)

### Backend

**File:** `apps/backend/src/main.ts:156-165`

```typescript
const dsn = configService.get<string>("SENTRY_DSN");
if (dsn) {
  sentry.init({
    dsn,
    tracesSampleRate: 1.0,
  });
}
```

### Frontend

- `apps/restaurant-dashboard` - @sentry/nextjs
- `apps/super-admin` - @sentry/nextjs
- `apps/customer-web` - No Sentry (missing integration)

### Sentry Integration Points

| App | Integration | Error Boundary |
|------|-------------|----------------|
| backend | @sentry/node | Custom error handler |
| restaurant-dashboard | @sentry/nextjs | Sentry ErrorBoundary |
| super-admin | @sentry/nextjs | Sentry ErrorBoundary |
| customer-web | None | ErrorBoundary (local) |
| delivery-partner | None | None |
| customer-mobile | None | None |
| launcher | None | None |
