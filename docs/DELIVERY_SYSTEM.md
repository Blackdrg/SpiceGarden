# Delivery System

## Architecture

The delivery system manages the complete delivery lifecycle from driver assignment to order completion, with real-time tracking, ETA intelligence, and comprehensive driver management.

## Module Structure

**Backend Modules:**
- `apps/backend/src/services/delivery/` - Delivery service module
- `apps/backend/src/services/delivery/driver-ops.module.ts` - Driver operations
- `apps/backend/src/modules/driver-assignment/` - Intelligent driver dispatch
- `apps/backend/src/infra/tracking/tracking.gateway.ts` - WebSocket tracking gateway

**Frontend:**
- `apps/delivery-partner/` - Driver mobile app (Expo React Native)

## Driver Management

### Driver Registration & Onboarding

**File:** `apps/backend/src/services/delivery/driver-onboarding.service.ts`

**KYC Documents Required:**
1. Driver's License
2. Aadhar Card
3. PAN Card
4. Vehicle RC
5. Insurance Certificate

**Entity:** `driver-document.entity.ts`
```sql
type VARCHAR(50) (license/aadhar/pan/vehicle_rc/insurance)
status VARCHAR(50) (pending/approved/rejected)
document_number VARCHAR(100)
issue_date DATE
expiry_date DATE
document_url VARCHAR(512)
verified_by UUID
verified_at TIMESTAMP
remarks TEXT
```

### Driver Entity

**File:** `apps/backend/src/db/entities/driver.entity.ts`

```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL (references users)
license_number VARCHAR(50) UNIQUE
vehicle_number VARCHAR(50)
vehicle_type VARCHAR(50) (motorcycle/bicycle/car)
kyc_status VARCHAR(50) (pending/approved/rejected)
is_online BOOLEAN DEFAULT false
is_available BOOLEAN DEFAULT true
current_location JSONB (lat, lng)
rating DECIMAL(3,2) DEFAULT 5.0
total_deliveries INTEGER DEFAULT 0
total_earnings DECIMAL(12,2) DEFAULT 0
```

### Driver Availability Toggle

**Endpoint:** `POST /drivers/:id/availability`
**Body:** `{ isAvailable: boolean }`

Updates:
- `is_online` status
- `is_available` for dispatch
- Redis cache for quick lookup

### Driver Shifts

**Entity:** `driver-shift.entity.ts`

```sql
status VARCHAR(50) (scheduled/ongoing/completed/cancelled)
start_time TIMESTAMP
end_time TIMESTAMP
start_location JSONB
end_location JSONB
total_orders INTEGER DEFAULT 0
total_earnings DECIMAL(12,2) DEFAULT 0
total_distance DECIMAL(8,2) DEFAULT 0
```

## Driver Assignment

### Assignment Module

**File:** `apps/backend/src/modules/driver-assignment/driver-assignment.module.ts`

### Assignment Logic

**File:** `apps/backend/src/modules/driver-assignment/driver-assignment.service.ts`

1. **Filter available drivers** - Online + available + not at max capacity
2. **Proximity calculation** - Haversine distance from driver to restaurant
3. **ETA estimation** - `ETAIntelligenceService.calculateETA()`
4. **Score ranking** - Based on:
   - Distance proximity
   - Driver rating
   - Current load
   - Vehicle type compatibility
5. **Assignment creation** - `DriverAssignmentEntity` with status `assigned`

### Assignment States

| Status | Description |
|--------|-------------|
| `assigned` | Driver assigned, awaiting acceptance |
| `accepted` | Driver accepted assignment |
| `picked_up` | Driver picked up order |
| `on_the_way` | En route to customer |
| `delivered` | Order delivered |
| `cancelled` | Assignment cancelled |

**Entity:** `driver-assignment.entity.ts`
```sql
order_id UUID REFERENCES orders(id)
driver_id UUID REFERENCES drivers(id)
status VARCHAR(50) DEFAULT 'assigned'
assigned_at TIMESTAMP DEFAULT NOW()
accepted_at TIMESTAMP
picked_up_at TIMESTAMP
delivered_at TIMESTAMP
cancelled_at TIMESTAMP
cancel_reason TEXT
```

### ETA Intelligence

**File:** `apps/backend/src/modules/driver-assignment/eta-intelligence.service.ts`

Factors:
- Historical delivery times
- Current traffic patterns
- Distance to restaurant
- Distance to customer
- Restaurant prep time
- Weather conditions (if integrated)

## Real-time Tracking

### Tracking Gateway

**File:** `apps/backend/src/infra/tracking/tracking.gateway.ts`

**Namespaces:**
- `/tracking` - Customer tracking
- `/kds` - Kitchen display
- `/admin` - Admin dashboard
- `/driver` - Driver-specific events

**Location Update Flow:**
1. Driver app sends `updateLocation` event
2. Gateway validates coordinates (lat: -90 to 90, lng: -180 to 180)
3. Validates driverId format
4. Broadcasts to `tracking:{driverId}` room
5. Customer web app receives `locationUpdate`

### Delivery Partner Mobile App

**File:** `apps/delivery-partner/src/services/location.service.ts`

**Location Tracking:**
- `requestLocationPermission()` - Foreground location request
- `getCurrentLocation()` - Single GPS fix
- `watchPosition()` - Continuous streaming with configurable:
  - Accuracy (high/balanced/low)
  - Distance interval
  - Time interval

**Dual-write pattern:**
1. Socket.IO emit: `updateLocation` event
2. HTTP POST: `/api/drivers/{id}/location`

### Customer Tracking

**File:** `apps/customer-web/src/hooks/useTracking.ts`

- Socket.IO subscription to `tracking:{driverId}`
- Status timeline: placed → preparing → ready → pickedup → delivered
- Map integration (when MapCard available)

## Driver Scoring & Incentives

### Driver Score Entity

**File:** `apps/backend/src/db/entities/driver-score.entity.ts`

```sql
overall_score DECIMAL(3,2) DEFAULT 5.0
delivery_score DECIMAL(3,2)
behavior_score DECIMAL(3,2)
punctuality_score DECIMAL(3,2)
total_ratings INTEGER DEFAULT 0
period VARCHAR(20) (weekly/monthly/quarterly)
```

### Driver Incentives

**Entity:** `driver-incentive.entity.ts`

```sql
type VARCHAR(50) (on_time_bonus/peak_hour/hourly_guarantee/referral)
amount DECIMAL(10,2) NOT NULL
status VARCHAR(50) (pending/approved/paid/cancelled)
criteria JSONB (conditions for earning)
earned_at TIMESTAMP
```

### Driver Penalties

**Entity:** `driver-penalty.entity.ts`

```sql
type VARCHAR(50) (cancellation/delay/behavior/no_show)
amount DECIMAL(10,2) NOT NULL
reason TEXT
status VARCHAR(50) (pending/active/resolved)
```

### Driver Fraud Detection

**Entity:** `driver-fraud.entity.ts`

**Detection Types:**
- Fake delivery confirmation
- Location spoofing
- Order manipulation
- Collusion with restaurants
- Repeated cancellations

**Severity Levels:** low, medium, high, critical

```sql
type VARCHAR(50) NOT NULL
severity VARCHAR(20) DEFAULT 'medium'
description TEXT
detected_at TIMESTAMP DEFAULT NOW()
resolved_at TIMESTAMP
resolved_by UUID
status VARCHAR(50) DEFAULT 'open'
metadata JSONB
```

## Delivery SLA

### SLA Configuration

**Entity:** `delivery-sla.entity.ts`

Per-restaurant SLA settings:
- `prep_time_sla` - Kitchen preparation time limit
- `delivery_sla` - Total delivery time limit

### SLA Alerts

**Entity:** `sla-alert.entity.ts`

```sql
type VARCHAR(50) (prep_breach/delivery_breach)
threshold_min INTEGER
actual_time INTEGER
severity VARCHAR(20) (low/medium/high/critical)
resolved BOOLEAN DEFAULT false
```

## Delivery API Endpoints

### Assignment

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/delivery/assign` | JwtAuthGuard | Assign driver to order |
| GET | `/delivery/orders/:id/assignment` | JwtAuthGuard | Get assignment details |

### Driver Operations

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/drivers/onboarding` | None | Driver registration |
| GET | `/drivers/me` | JwtAuthGuard | Get driver profile |
| POST | `/drivers/:id/availability` | JwtAuthGuard | Toggle availability |
| GET | `/drivers/:id/earnings` | JwtAuthGuard | Earnings summary |
| POST | `/orders/:id/accept` | JwtAuthGuard | Accept assignment |
| POST | `/orders/:id/reject` | JwtAuthGuard | Reject assignment |
| PUT | `/orders/:id/status` | JwtAuthGuard | Update delivery status |
| POST | `/orders/:id/verify-otp` | JwtAuthGuard | OTP verification |

### WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `updateLocation` | Client→Server | `{ driverId, lat, lng, heading?, speed? }` | Driver position update |
| `locationUpdate` | Server→Client | `{ driverId, lat, lng, timestamp, messageId }` | Broadcast to tracking room |
| `orderAssigned` | Server→Client | `{ orderId, driverId, restaurant, customer }` | New assignment notification |
| `orderCancelled` | Server→Client | `{ orderId, reason }` | Assignment cancellation |
| `driverEvent` | Server→Client | `{ driverId, orderId?, event }` | Generic driver event |

## Delivery Status Timeline

```
ORDER_PLACED
    ↓
PAYMENT_CONFIRMED
    ↓
RESTAURANT_ACCEPTED (Kitchen preparing)
    ↓
PREPARING
    ↓
READY
    ↓
READY_FOR_PICKUP
    ↓
DRIVER_ASSIGNED (Socket.IO notify driver)
    ↓ [Driver accepts]
PICKED_UP (OTP verified at restaurant)
    ↓ [Driver en route]
ON_THE_WAY (Customer sees real-time location)
    ↓ [Driver arrives]
DELIVERED (OTP verified at customer)
    ↓
COMPLETED
```

## Driver Earnings

**Entity:** `wallet.entity.ts` + `wallet-transaction.entity.ts`

**Earnings Sources:**
1. Delivery fee (base rate)
2. Distance bonus
3. Peak hour incentive
4. On-time delivery bonus
5. Customer tip

**Earnings Tracking:**
- Available balance (withdrawable)
- Pending balance (in transit)
- Weekly summary
- Lifetime total

**Endpoint:** `GET /drivers/:id/earnings`

```json
{
  "availableBalance": 1250.00,
  "pendingBalance": 350.00,
  "lifetimeEarnings": 45600.00,
  "weeklyEarnings": 2100.00,
  "todayEarnings": 450.00
}
```

## OTP System for Delivery

### Pickup OTP

1. Restaurant marks order READY
2. System generates 6-digit OTP
3. OTP stored hashed in `otp.entity.ts`
4. Driver receives OTP via notification
5. Driver enters OTP at pickup
6. `POST /orders/:id/verify-otp` validates
7. Order status → PICKED_UP

### Delivery OTP

1. Driver arrives at customer
2. Customer receives OTP via push/SMS
3. Driver enters OTP
4. System validates
5. Order status → DELIVERED

### OTP Entity

**File:** `apps/backend/src/db/entities/otp.entity.ts`

```sql
phone VARCHAR(20)
email VARCHAR(255)
otp_hash VARCHAR(255) (hashed)
type VARCHAR(50) (login/registration/password_reset/pickup/delivery)
expires_at TIMESTAMP
attempts INTEGER DEFAULT 0
```

## Surge Zones

**Entity:** `surge-zone.entity.ts`

```sql
polygon JSONB (GPS coordinates defining zone)
multiplier DECIMAL(3,2) DEFAULT 1.0
reason VARCHAR(255)
active BOOLEAN DEFAULT true
starts_at TIMESTAMP
ends_at TIMESTAMP
```

Dynamic pricing based on:
- Demand density
- Driver availability
- Time of day
- Weather conditions

## Delivery Partner App Features

### Services

**File:** `apps/delivery-partner/src/services/delivery-api.service.ts`

| Method | HTTP | Purpose |
|--------|------|---------|
| `login()` | POST /api/auth/login | Driver authentication |
| `registerDriver()` | POST /api/drivers/onboarding | KYC registration |
| `getProfile()` | GET /api/drivers/me | Profile fetch |
| `toggleOnline()` | POST /api/drivers/:id/availability | Online/offline |
| `getEarnings()` | GET /api/drivers/:id/earnings | Earnings summary |
| `acceptOrder()` | POST /api/orders/:orderId/accept | Accept delivery |
| `rejectOrder()` | POST /api/orders/:orderId/reject | Reject delivery |
| `updateOrderStatus()` | PUT /api/orders/:orderId/status | Status transitions |
| `verifyOTP()` | POST /api/orders/:orderId/verify-otp | OTP verification |
| `reportIssue()` | POST /api/orders/:id/issues | Report delivery issues |

### Location Service

**File:** `apps/delivery-partner/src/services/location.service.ts`

- Expo-location integration
- Permission handling
- Continuous GPS streaming
- Configurable accuracy/distance/time intervals

### WebSocket Service

Features:
- Auto-reconnection with exponential backoff
- 10 reconnection attempts
- 1-30s jitter between attempts
- Message queue during disconnection
- Token-based authentication
