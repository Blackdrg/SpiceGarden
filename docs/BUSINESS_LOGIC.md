# Business Logic

## Core Business Domains

### 1. Order Management

**Module:** `apps/backend/src/services/order/`

#### Order Placement Rules

1. **Minimum 1 item required** - `validateOrderItems()` checks `items.length > 0`
2. **Positive quantity** - Each item must have `quantity >= 1` (integer)
3. **Valid item references** - Each item must have non-empty `id` and `name`
4. **Positive price** - Each item price must be non-negative finite number
5. **Grand total must match** - `subtotal + tax + deliveryFee` must equal `grandTotal` within 0.01 tolerance
6. **Non-negative totals** - subtotal, tax, deliveryFee must be >= 0
7. **Positive grandTotal** - grandTotal must be > 0

#### Order Status Transitions

```
PLACED → PAYMENT_CONFIRMED | RESTAURANT_ACCEPTED | CANCELLED
PAYMENT_CONFIRMED → RESTAURANT_ACCEPTED | CANCELLED
RESTAURANT_ACCEPTED → PREPARING | CANCELLED
PREPARING → READY | CANCELLED
READY → READY_FOR_PICKUP | CANCELLED
READY_FOR_PICKUP → DRIVER_ASSIGNED | CANCELLED
DRIVER_ASSIGNED → PICKED_UP | CANCELLED
PICKED_UP → ON_THE_WAY | CANCELLED
ON_THE_WAY → DELIVERED | CANCELLED
```

### 2. Restaurant Operations

**Module:** `apps/backend/src/services/restaurant/`

#### Restaurant Management
- Multi-branch support
- Cuisine type categorization
- Commission rate configuration (per-restaurant override via `commission_rule`)
- Active/inactive toggle
- Rating system (auto-calculated)

#### Menu Management
- Hierarchical: Category → Item → Addon/Variant
- Veg/non-veg flag with spice level
- Day-of-week availability schedules
- Moderation queue (pending/rejected/approved)
- Image hosting (URL-based)

#### Kitchen Display System (KDS)
- HTML SPECIFICATIONS:
  - Flat grid or batch sections (grouped by status)
  - Delay tracking vs estimated prep time
  - DELAYED badge when prep exceeds SLA
  - Park orders feature
  - Audio alerts for new orders (base64 WAV)
- WebSocket events: `newOrder`, `inventoryAlert`

### 3. Kitchen Operations

**Module:** `apps/backend/src/modules/kitchen/`

#### Kitchen SLA Monitoring

**Entity:** `kitchen-sla.entity.ts`
- Preptime SLA per branch (default 15 min)
- Breach detection
- SLA alerts

**Entity:** `delivery-sla.entity.ts`
- Delivery SLA configuration per restaurant
- SLA alerts

**Entity:** `branch-control.entity.ts`
- `max_concurrent_orders` - Queue limit per branch
- `auto_accept_orders` - Auto-accept toggle
- `is_kitchen_enabled` - Disable kitchen

#### Inventory

**Entity:** `inventory-item.entity.ts`
- Current stock, min/max thresholds
- Unit cost tracking
- Supplier relationship

**Entity:** `inventory-alert.entity.ts`
- Low stock, expiry, spoilage alerts
- Resolution tracking

**Entity:** `recipe.entity.ts`
- Bills of Materials per menu item
- Auto-decrement inventory on order

**Entity:** `batch.entity.ts`
- Batch production tracking
- Preparation logging

### 4. Delivery Operations

**Module:** `apps/backend/src/services/delivery/`

#### Driver Assignment Logic

**Module:** `apps/backend/src/modules/driver-assignment/`

1. **Availability filter** - Only online + available drivers
2. **Proximity matching** - Nearest available driver
3. **ETA calculation** - Via `ETAIntelligenceService`
4. **Fleet preferences** - Driver type, vehicle type
5. **Fraud check** - Driver fraud score

#### Driver Lifecycle

**Registration:**
- KYC document upload (license, aadhar, pan, vehicle_rc, insurance)
- Document verification workflow
- Training/completion status

**Shift Management:**
- Scheduled/ongoing/completed shifts
- Earnings per shift
- Distance tracking

**Scoring System:**
- **Overall score** (Base: 5.0)
- **Delivery score** - On-time, accuracy
- **Behavior score** - Customer feedback
- **Punctuality score** - SLA adherence

**Incentives & Penalties:**
- Automatic incentive evaluation
- Penalty triggers (cancellations, delays, behavior issues)
- Net earnings calculation

**Fraud Detection:**
- Pattern analysis (route manipulation, fake deliveries)
- Severity levels: low/medium/high/critical
- Auto-suspension triggers

### 5. Payment Business Rules

**Module:** `apps/backend/src/services/payments/`

#### Payment Processing

1. **Primary gateway:** Stripe (default)
2. **Secondary gateway:** Razorpay (India/INR)
3. **Fallback:** COD
4. **Gateway selection:** Configurable per request, defaults to env var
5. **Idempotency:** Required for all payment intents
6. **Fraud check:** Pre-payment validation
7. **Retry logic:** Exponential backoff, configurable max

#### Refund Rules

- Refund requires approval (admin/finance staff)
- Refund amount validated against order total
- Wallet credited if applicable
- Payment gateway refund initiated
- Notification sent to customer

### 6. Wallet Business Rules

**Module:** `apps/backend/src/services/wallet/`

#### Wallet Operations

1. **Dual balance system:** Available + Pending
2. **Double-payment prevention:** Idempotency + idempotency keys
3. **COD integration:** COD collections credited to wallet
4. **Refund credits:** Wallet credited on refund
5. **Driver payouts:** Automatic payout processing

#### Wallet Transactions

**Entity:** `wallet-transaction.entity.ts`
- Type: credit/debit/refund/hold
- Status: pending/completed/failed
- Reference ID for reconciliation

### 7. Loyalty & Promotions

**Module:** `apps/backend/src/services/loyalty/`

#### Coupon Rules
- Percentage or fixed amount
- Minimum order value check
- Usage limits (total + per user)
- Cuisine-specific applicability
- Validity period enforcement
- Auto-application at checkout

#### Referral Rules
- Unique referral codes
- Reward on first completed order of referred user
- Status tracking (pending/completed/expired)

### 12. GST & Tax

**Module:** `apps/backend/src/services/fst/billing/`

#### GST Rules

1. **HSN/SAC codes:** Central registry with CGST/SGST/IGST/CESS rates
2. **Effective date ranges:** Tax rates change over time
3. **Per-order GST breakdown:** Stored in `gst-details` table
4. **Invoice generation:** Unique invoice numbers per order
5. **Reconciliation:** GST amounts track financial ledger

#### Taxable Events

- Order placement (CGST + SGST for intra-state, IGST for inter-state)
- Delivery fee taxable
- Tip taxable (if applicable)

### 9. Notifications

**Module:** `apps/backend/src/services/notifications/`

#### Notification Preferences

**Entity:** `notification-preference.entity.ts`
- Push, email, SMS, in-app toggles (per-channel)
- Category toggles (order updates, promotions, payment alerts, delivery updates)
- User-specific overrides

#### Notification Flow

1. Event triggers notification creation
2. Preference check (channel + category)
3. Queue for dispatch (BullMQ)
4. Channel-specific delivery:
   - Push: FCM (Android) / APNs (iOS)
   - SMS: Twilio
   - Email: SendGrid
5. Status tracking: queued → sent → delivered → read → failed

### 10. Support & Disputes

**Module:** `apps/backend/src/services/support/`

#### Ticket Routing
- Type-based routing (refund, complaint, inquiry, fraud)
- Priority-based routing (low, medium, high, critical)
- Auto-assignment to available staff

#### Dispute Management
- Payment chargeback tracking
- Evidence collection (JSONB store)
- Resolution workflow (Pending → Under_Review → Resolved/Lost)
- Routing to admin/finance

### 11. Compliance

**Module:** `apps/backend/src/compliance/`

#### GDPR/DPDP Features
- Data export requests (JSON/CSV)
- Data deletion requests
- Audit trail for compliance actions

#### Access Control
- Role-based route guards
- Permission-based enforcement
- Session tracking with device correlation
