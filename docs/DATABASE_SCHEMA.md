# Database Schema

## PostgreSQL Schema

### Core Tables

#### users
```sql
id UUID PRIMARY KEY
email VARCHAR(255) UNIQUE
phone VARCHAR(20) UNIQUE
password_hash VARCHAR(255) NOT NULL
full_name VARCHAR(255)
profile_image VARCHAR(512)
role user_role ENUM ('customer', 'restaurant', 'kitchen_staff', 'delivery_partner', 'admin', 'super_admin', 'support_staff', 'finance_staff')
status user_status ENUM ('active', 'inactive', 'suspended')
email_verified BOOLEAN DEFAULT false
phone_verified BOOLEAN DEFAULT false
created_at TIMESTAMP
updated_at TIMESTAMP
deleted_at TIMESTAMP (soft delete)
```

**Entity:** `apps/backend/src/db/entities/user.entity.ts`

#### orders
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
restaurant_id UUID REFERENCES restaurants(id)
branch_id UUID REFERENCES restaurant_branches(id)
driver_id UUID
otp_code VARCHAR(10)
order_number VARCHAR(50) UNIQUE
status order_status ENUM ('pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled')
payment_status payment_status ENUM ('pending', 'completed', 'failed', 'refunded')
payment_intent_id VARCHAR(255)
subtotal DECIMAL(10,2)
tax DECIMAL(10,2)
delivery_fee DECIMAL(10,2)
discount DECIMAL(10,2)
tip DECIMAL(10,2)
grand_total DECIMAL(10,2)
refunded_amount DECIMAL(10,2) DEFAULT 0
coupon_id UUID
delivery_address_id UUID
delivered_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Entity:** `apps/backend/src/db/entities/order.entity.ts`
**Relationships:** hasMany OrderItemEntity, hasOne GSTDetailEntity, belongsTo RestaurantBranchEntity

#### order_items
```sql
id UUID PRIMARY KEY
order_id UUID REFERENCES orders(id)
menu_item_id UUID REFERENCES menu_items(id)
name VARCHAR(255)
price DECIMAL(10,2)
quantity INTEGER
addons JSONB
special_instructions TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Entity:** `apps/backend/src/db/entities/order-item.entity.ts`

#### restaurants
```sql
id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
slug VARCHAR(255) UNIQUE
description TEXT
address TEXT
phone VARCHAR(20)
email VARCHAR(255)
is_active BOOLEAN DEFAULT true
rating DECIMAL(3,2) DEFAULT 0
total_ratings INTEGER DEFAULT 0
cuisine_type VARCHAR(100)
delivery_time_min INTEGER
min_order DECIMAL(10,2)
commission_rate DECIMAL(5,2)
gst_number VARCHAR(50)
pan_number VARCHAR(20)
fssai_license VARCHAR(50)
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Entity:** `apps/backend/src/db/entities/restaurant.entity.ts`

#### restaurant_branches
```sql
id UUID PRIMARY KEY
restaurant_id UUID REFERENCES restaurants(id)
branch_name VARCHAR(255) NOT NULL
address TEXT NOT NULL
location JSONB (lat, lng)
phone VARCHAR(20)
email VARCHAR(255)
opening_time TIME
closing_time TIME
is_online BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Entity:** `apps/backend/src/db/entities/restaurant-branch.entity.ts`

### Menu System Tables

#### menu_categories
```sql
id UUID PRIMARY KEY
branch_id UUID REFERENCES restaurant_branches(id)
name VARCHAR(255) NOT NULL
description TEXT
sort_order INTEGER DEFAULT 0
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### menu_items
```sql
id UUID PRIMARY KEY
category_id UUID REFERENCES menu_categories(id)
name VARCHAR(255) NOT NULL
description TEXT
base_price DECIMAL(10,2) NOT NULL
image_url VARCHAR(512)
is_veg BOOLEAN DEFAULT true
spice_level INTEGER DEFAULT 0
status VARCHAR(50) DEFAULT 'available'
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### menu_addons
```sql
id UUID PRIMARY KEY
menu_item_id UUID REFERENCES menu_items(id)
name VARCHAR(255) NOT NULL
description TEXT
extra_price DECIMAL(10,2) DEFAULT 0
is_required BOOLEAN DEFAULT false
max_quantity INTEGER DEFAULT 1
sort_order INTEGER DEFAULT 0
created_at TIMESTAMP
```

#### menu_variants
```sql
id UUID PRIMARY KEY
menu_item_id UUID REFERENCES menu_items(id)
name VARCHAR(255) NOT NULL
description TEXT
price_adjustment DECIMAL(10,2) DEFAULT 0
is_default BOOLEAN DEFAULT false
sort_order INTEGER DEFAULT 0
created_at TIMESTAMP
```

#### menu_item_availability
```sql
id UUID PRIMARY KEY
menu_item_id UUID REFERENCES menu_items(id)
day_of_week INTEGER NOT NULL
available_from TIME
available_to TIME
is_available BOOLEAN DEFAULT true
UNIQUE (menu_item_id, day_of_week)
```

#### menu_moderation
```sql
id UUID PRIMARY KEY
menu_item_id UUID REFERENCES menu_items(id)
status VARCHAR(50) DEFAULT 'pending'
reason TEXT
moderated_by UUID
moderated_at TIMESTAMP
action VARCHAR(50)
notes TEXT
created_at TIMESTAMP
```

### Delivery Ecosystem Tables

#### drivers
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
license_number VARCHAR(50) UNIQUE
vehicle_number VARCHAR(50)
vehicle_type VARCHAR(50) DEFAULT 'motorcycle'
kyc_status VARCHAR(50) DEFAULT 'pending'
is_online BOOLEAN DEFAULT false
is_available BOOLEAN DEFAULT true
current_location JSONB
rating DECIMAL(3,2) DEFAULT 5.0
total_deliveries INTEGER DEFAULT 0
total_earnings DECIMAL(12,2) DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Entity:** `apps/backend/src/db/entities/driver.entity.ts`

#### driver_assignments
```sql
id UUID PRIMARY KEY
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

**Entity:** `apps/backend/src/db/entities/driver-assignment.entity.ts`

#### driver_documents
```sql
id UUID PRIMARY KEY
driver_id UUID REFERENCES drivers(id)
type VARCHAR(50) NOT NULL (license/aadhar/pan/vehicle_rc/insurance)
status VARCHAR(50) DEFAULT 'pending'
document_number VARCHAR(100)
issue_date DATE
expiry_date DATE
document_url VARCHAR(512)
verified_by UUID
verified_at TIMESTAMP
remarks TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### driver_shifts
```sql
id UUID PRIMARY KEY
driver_id UUID REFERENCES drivers(id)
status VARCHAR(50) DEFAULT 'scheduled'
start_time TIMESTAMP
end_time TIMESTAMP
start_location JSONB
end_location JSONB
total_orders INTEGER DEFAULT 0
total_earnings DECIMAL(12,2) DEFAULT 0
total_distance DECIMAL(8,2) DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### driver_scores
```sql
id UUID PRIMARY KEY
driver_id UUID REFERENCES drivers(id)
overall_score DECIMAL(3,2) DEFAULT 5.0
delivery_score DECIMAL(3,2)
behavior_score DECIMAL(3,2)
punctuality_score DECIMAL(3,2)
total_ratings INTEGER DEFAULT 0
period VARCHAR(20)
calculated_at TIMESTAMP
```

#### driver_fraud
```sql
id UUID PRIMARY KEY
driver_id UUID REFERENCES drivers(id)
type VARCHAR(50) NOT NULL
severity VARCHAR(20) DEFAULT 'medium'
description TEXT
detected_at TIMESTAMP
resolved_at TIMESTAMP
resolved_by UUID
status VARCHAR(50) DEFAULT 'open'
metadata JSONB
```

#### driver_incentives
```sql
id UUID PRIMARY KEY
driver_id UUID REFERENCES drivers(id)
type VARCHAR(50) NOT NULL
amount DECIMAL(10,2) NOT NULL
status VARCHAR(50) DEFAULT 'pending'
description TEXT
criteria JSONB
earned_at TIMESTAMP
```

#### driver_penalties
```sql
id UUID PRIMARY KEY
driver_id UUID REFERENCES drivers(id)
type VARCHAR(50) NOT NULL
amount DECIMAL(10,2) NOT NULL
reason TEXT
status VARCHAR(50) DEFAULT 'pending'
created_at TIMESTAMP
```

### Payment Tables

#### payment_methods
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
type payment_method_type ENUM ('card', 'bank_account', 'wallet', 'upi')
provider VARCHAR(50) (stripe, razorpay)
token VARCHAR(255) (tokenized payment method)
last_four VARCHAR(4)
expiry_month INTEGER
expiry_year INTEGER
is_default BOOLEAN DEFAULT false
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### payment_disputes
```sql
id UUID PRIMARY KEY
payment_id UUID
order_id UUID REFERENCES orders(id)
user_id UUID REFERENCES users(id)
type VARCHAR(50) (chargeback, dispute)
status VARCHAR(50)
amount DECIMAL(10,2)
reason TEXT
evidence JSONB
resolved_at TIMESTAMP
resolved_by UUID
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### stripe_webhooks
```sql
id UUID PRIMARY KEY
stripe_event_id VARCHAR(255) UNIQUE
event_type VARCHAR(100)
processed BOOLEAN DEFAULT false
payload JSONB
processed_at TIMESTAMP
error TEXT
```

#### webhook_retry_queue
```sql
id UUID PRIMARY KEY
gateway VARCHAR(50)
event_type VARCHAR(100)
payload JSONB
attempts INTEGER DEFAULT 0
max_attempts INTEGER DEFAULT 5
next_retry_at TIMESTAMP
last_error TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### idempotency_keys
```sql
id UUID PRIMARY KEY
key VARCHAR(255) UNIQUE NOT NULL
operation VARCHAR(100)
user_id UUID REFERENCES users(id)
request_hash VARCHAR(255)
response JSONB
expires_at TIMESTAMP
created_at TIMESTAMP
```

#### payment_events
```sql
id UUID PRIMARY KEY
payment_id UUID
order_id UUID REFERENCES orders(id)
status VARCHAR(50)
amount DECIMAL(10,2)
gateway VARCHAR(50)
metadata JSONB
created_at TIMESTAMP
```

#### payment_fraud
```sql
id UUID PRIMARY KEY
payment_id UUID
order_id UUID REFERENCES orders(id)
user_id UUID REFERENCES users(id)
risk_score DECIMAL(5,2)
reasons JSONB
ip_address VARCHAR(45)
user_agent TEXT
status VARCHAR(50)
created_at TIMESTAMP
```

### Wallet Tables

#### wallets
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id) UNIQUE
balance DECIMAL(12,2) DEFAULT 0
pending_balance DECIMAL(12,2) DEFAULT 0
currency VARCHAR(3) DEFAULT 'INR'
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Entity:** `apps/backend/src/db/entities/wallet.entity.ts`

#### wallet_transactions
```sql
id UUID PRIMARY KEY
wallet_id UUID REFERENCES wallets(id)
order_id UUID REFERENCES orders(id)
type VARCHAR(50) (credit, debit, refund, hold)
amount DECIMAL(12,2)
description TEXT
reference_id VARCHAR(255)
status VARCHAR(50) (pending, completed, failed)
created_at TIMESTAMP
```

**Entity:** `apps/backend/src/db/entities/wallet-transaction.entity.ts`

### Customer Engagement Tables

#### coupons
```sql
id UUID PRIMARY KEY
code VARCHAR(50) UNIQUE NOT NULL
name VARCHAR(255)
description TEXT
type VARCHAR(50) (percentage, fixed)
value DECIMAL(10,2)
min_order_amount DECIMAL(10,2)
max_discount DECIMAL(10,2)
valid_from TIMESTAMP
valid_until TIMESTAMP
usage_limit INTEGER
used_count INTEGER DEFAULT 0
per_user_limit INTEGER
applicable_cuisines JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### coupon_usage
```sql
id UUID PRIMARY KEY
coupon_id UUID REFERENCES coupons(id)
user_id UUID REFERENCES users(id)
order_id UUID REFERENCES orders(id)
discount_amount DECIMAL(10,2)
used_at TIMESTAMP
```

#### referrals
```sql
id UUID PRIMARY KEY
referrer_id UUID REFERENCES users(id)
referred_id UUID REFERENCES users(id)
code VARCHAR(50) UNIQUE
status VARCHAR(50) (pending, completed, expired)
reward_amount DECIMAL(10,2)
created_at TIMESTAMP
completed_at TIMESTAMP
```

#### subscriptions
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id) UNIQUE
plan VARCHAR(50) (prime, weekly_meal)
status VARCHAR(50) (active, cancelled, expired)
start_date TIMESTAMP
end_date TIMESTAMP
auto_renew BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

### GST & Finance Tables

#### gst_details
```sql
id UUID PRIMARY KEY
order_id UUID REFERENCES orders(id)
hsn_sac_code VARCHAR(50)
cgst_rate DECIMAL(5,2)
sgst_rate DECIMAL(5,2)
igst_rate DECIMAL(5,2)
cess_rate DECIMAL(5,2)
cgst_amount DECIMAL(10,2)
sgst_amount DECIMAL(10,2)
igst_amount DECIMAL(10,2)
total_tax DECIMAL(10,2)
invoice_number VARCHAR(50)
created_at TIMESTAMP
```

#### hsn_sac_codes
```sql
id UUID PRIMARY KEY
code VARCHAR(20) UNIQUE NOT NULL
description TEXT NOT NULL
cgst_rate DECIMAL(5,2) DEFAULT 0
sgst_rate DECIMAL(5,2) DEFAULT 0
igst_rate DECIMAL(5,2) DEFAULT 0
cess_rate DECIMAL(5,2) DEFAULT 0
effective_from DATE
effective_to DATE
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### ledger_entries
```sql
id UUID PRIMARY KEY
type VARCHAR(50) (order_payment, refund, payout, commission, tax)
amount DECIMAL(12,2)
currency VARCHAR(3) DEFAULT 'INR'
reference_type VARCHAR(50)
reference_id UUID
user_id UUID REFERENCES users(id)
restaurant_id UUID REFERENCES restaurants(id)
balance_after DECIMAL(12,2)
metadata JSONB
created_at TIMESTAMP
```

#### payout_reports
```sql
id UUID PRIMARY KEY
restaurant_id UUID REFERENCES restaurants(id)
period_start TIMESTAMP
period_end TIMESTAMP
total_orders INTEGER
total_revenue DECIMAL(12,2)
total_commission DECIMAL(12,2)
net_payout DECIMAL(12,2)
status VARCHAR(50)
generated_at TIMESTAMP
```

#### commission_rules
```sql
id UUID PRIMARY KEY
restaurant_id UUID REFERENCES restaurants(id)
rate DECIMAL(5,2)
type VARCHAR(50) (percentage, fixed)
min_amount DECIMAL(10,2)
max_amount DECIMAL(10,2)
valid_from TIMESTAMP
valid_to TIMESTAMP
created_at TIMESTAMP
```

### Kitchen & Inventory Tables

#### inventory_items
```sql
id UUID PRIMARY KEY
branch_id UUID REFERENCES restaurant_branches(id)
name VARCHAR(255) NOT NULL
unit VARCHAR(50)
current_stock DECIMAL(10,2)
min_stock DECIMAL(10,2)
max_stock DECIMAL(10,2)
unit_cost DECIMAL(10,2)
supplier_id UUID REFERENCES suppliers(id)
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### inventory_alerts
```sql
id UUID PRIMARY KEY
inventory_item_id UUID REFERENCES inventory_items(id)
type VARCHAR(50) (low_stock, expiry, spoilage)
severity VARCHAR(20)
message TEXT
resolved BOOLEAN DEFAULT false
created_at TIMESTAMP
resolved_at TIMESTAMP
```

#### batches
```sql
id UUID PRIMARY KEY
branch_id UUID REFERENCES restaurant_branches(id)
name VARCHAR(255)
status VARCHAR(50) (active, completed, cancelled)
prepared_at TIMESTAMP
completed_at TIMESTAMP
created_at TIMESTAMP
```

#### food_prep
```sql
id UUID PRIMARY KEY
batch_id UUID REFERENCES batches(id)
menu_item_id UUID REFERENCES menu_items(id)
quantity INTEGER
notes TEXT
prepared_by UUID REFERENCES users(id)
prepared_at TIMESTAMP
```

#### kitchen_sla
```sql
id UUID PRIMARY KEY
branch_id UUID REFERENCES restaurant_branches(id)
order_id UUID REFERENCES orders(id)
prep_sla_min INTEGER
actual_prep_time INTEGER
status VARCHAR(50) (met, breached)
created_at TIMESTAMP
```

#### recipes
```sql
id UUID PRIMARY KEY
menu_item_id UUID REFERENCES menu_items(id)
inventory_item_id UUID REFERENCES inventory_items(id)
quantity DECIMAL(10,2)
unit VARCHAR(50)
created_at TIMESTAMP
```

#### suppliers
```sql
id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
contact_email VARCHAR(255)
contact_phone VARCHAR(20)
address TEXT
gst_number VARCHAR(50)
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### branch_control
```sql
id UUID PRIMARY KEY
branch_id UUID REFERENCES restaurant_branches(id)
is_kitchen_enabled BOOLEAN DEFAULT true
max_concurrent_orders INTEGER
auto_accept_orders BOOLEAN DEFAULT false
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Support & Compliance Tables

#### support_tickets
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
order_id UUID REFERENCES orders(id)
type VARCHAR(50) (refund, complaint, inquiry, fraud)
priority VARCHAR(20) (low, medium, high, critical)
status VARCHAR(50) (open, in_progress, resolved, closed)
subject VARCHAR(255)
description TEXT
assigned_to UUID REFERENCES users(id)
resolved_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### disputes
```sql
id UUID PRIMARY KEY
payment_id UUID
order_id UUID REFERENCES orders(id)
user_id UUID REFERENCES users(id)
type VARCHAR(50) (chargeback, dispute)
status VARCHAR(50)
amount DECIMAL(10,2)
reason TEXT
evidence JSONB
resolved_at TIMESTAMP
resolved_by UUID
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### audit_logs
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
action VARCHAR(100)
resource_type VARCHAR(100)
resource_id UUID
changes JSONB
ip_address VARCHAR(45)
user_agent TEXT
created_at TIMESTAMP
```

#### data_export_requests
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
status VARCHAR(50) (pending, processing, completed, failed)
format VARCHAR(20) (json, csv)
requested_at TIMESTAMP
completed_at TIMESTAMP
download_url VARCHAR(512)
```

#### deletion_requests
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
status VARCHAR(50) (pending, processing, completed, rejected)
reason TEXT
requested_at TIMESTAMP
completed_at TIMESTAMP
processed_by UUID REFERENCES users(id)
```

### System Tables

#### sessions
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
token_hash VARCHAR(255) UNIQUE
device_name VARCHAR(255)
device_type VARCHAR(50)
ip_address VARCHAR(45)
user_agent TEXT
expires_at TIMESTAMP
created_at TIMESTAMP
last_used_at TIMESTAMP
```

**Entity:** `apps/backend/src/db/entities/session.entity.ts`

#### otps
```sql
id UUID PRIMARY KEY
phone VARCHAR(20)
email VARCHAR(255)
otp_hash VARCHAR(255)
type VARCHAR(50) (login, registration, password_reset)
expires_at TIMESTAMP
attempts INTEGER DEFAULT 0
created_at TIMESTAMP
```

#### user_devices
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
device_id VARCHAR(255) UNIQUE
device_name VARCHAR(255)
device_type VARCHAR(50)
fingerprint VARCHAR(255)
last_seen_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### device_fingerprints
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
fingerprint_hash VARCHAR(255) UNIQUE
browser_data JSONB
ip_address VARCHAR(45)
location JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### notifications
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
type VARCHAR(50) (push, sms, email, in_app)
channel VARCHAR(50)
title VARCHAR(255)
body TEXT
data JSONB
status notification_status ENUM ('queued', 'sent', 'delivered', 'failed', 'read')
priority VARCHAR(20)
sent_at TIMESTAMP
delivered_at TIMESTAMP
read_at TIMESTAMP
created_at TIMESTAMP
```

**Entity:** `apps/backend/src/db/entities/notification.entity.ts`

#### notification_preferences
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id) UNIQUE
push_enabled BOOLEAN DEFAULT true
email_enabled BOOLEAN DEFAULT true
sms_enabled BOOLEAN DEFAULT true
in_app_enabled BOOLEAN DEFAULT true
order_updates BOOLEAN DEFAULT true
promotions BOOLEAN DEFAULT true
payment_alerts BOOLEAN DEFAULT true
delivery_updates BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### notification_analytics
```sql
id UUID PRIMARY KEY
notification_id UUID REFERENCES notifications(id)
event_type VARCHAR(50) (sent, delivered, opened, clicked)
channel VARCHAR(50)
timestamp TIMESTAMP
metadata JSONB
```

#### delivery_sla
```sql
id UUID PRIMARY KEY
restaurant_id UUID REFERENCES restaurants(id)
prep_time_sla INTEGER DEFAULT 15 (minutes)
delivery_sla INTEGER DEFAULT 45 (minutes)
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### sla_alerts
```sql
id UUID PRIMARY KEY
order_id UUID REFERENCES orders(id)
type VARCHAR(50) (prep_breach, delivery_breach)
threshold_min INTEGER
actual_time INTEGER
severity VARCHAR(20)
resolved BOOLEAN DEFAULT false
created_at TIMESTAMP
```

#### holiday_schedules
```sql
id UUID PRIMARY KEY
restaurant_id UUID REFERENCES restaurants(id)
date DATE
reason VARCHAR(255)
is_closed BOOLEAN DEFAULT false
created_at TIMESTAMP
```

#### surge_zones
```sql
id UUID PRIMARY KEY
polygon JSONB
multiplier DECIMAL(3,2) DEFAULT 1.0
reason VARCHAR(255)
active BOOLEAN DEFAULT true
starts_at TIMESTAMP
ends_at TIMESTAMP
created_at TIMESTAMP
```

#### refunds
```sql
id UUID PRIMARY KEY
order_id UUID REFERENCES orders(id)
user_id UUID REFERENCES users(id)
amount DECIMAL(10,2)
reason TEXT
status VARCHAR(50) (pending, approved, rejected, processed)
processed_by UUID REFERENCES users(id)
processed_at TIMESTAMP
created_at TIMESTAMP
```

#### refund_approvals
```sql
id UUID PRIMARY KEY
refund_id UUID REFERENCES refunds(id)
requested_by UUID REFERENCES users(id)
approved_by UUID REFERENCES users(id)
status VARCHAR(50) (pending, approved, rejected)
notes TEXT
created_at TIMESTAMP
```

#### commission_rules
```sql
id UUID PRIMARY KEY
restaurant_id UUID REFERENCES restaurants(id)
rate DECIMAL(5,2)
type VARCHAR(50)
min_amount DECIMAL(10,2)
max_amount DECIMAL(10,2)
valid_from TIMESTAMP
valid_to TIMESTAMP
created_at TIMESTAMP
```

#### restaurant_gst
```sql
id UUID PRIMARY KEY
restaurant_id UUID REFERENCES restaurants(id)
gst_number VARCHAR(50)
pan_number VARCHAR(20)
fssai_license VARCHAR(50)
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### restaurant_onboarding
```sql
id UUID PRIMARY KEY
restaurant_id UUID REFERENCES restaurants(id)
step INTEGER DEFAULT 0
data JSONB
status VARCHAR(50) (in_progress, completed, rejected)
created_at TIMESTAMP
updated_at TIMESTAMP
```

## Schema Migration

**File:** `infra/postgres/migrations/InitialSchema20240101000001__up.sql`

- Single initial migration (33048 bytes)
- Down migration available
- Seed data: `001_restaurants_branches_menus.sql`, `002_test_users.sql`

## Indexes

Not explicitly defined in migration files. TypeORM may create implicit indexes on:
- Foreign key columns
- Unique constraints (email, phone, slug, code)
- UUID primary keys (auto-indexed)

## MongoDB Collections

### Reviews Schema
File: `apps/backend/src/db/schemas/review.schema.ts`

```typescript
{
  _id: ObjectId,
  orderId: UUID,
  userId: UUID,
  restaurantId: UUID,
  rating: number (1-5),
  comment: string,
  images: string[],
  createdAt: Date,
  updatedAt: Date
}
```

### Audit Logs MongoDB
Additional audit logs stored in MongoDB for flexibility (different from PostgreSQL audit_logs).

## Redis Keys

### Rate Limit Keys
```
spicegarden:AUTH_OTP:{ip}
spicegarden:AUTH:{ip}
spicegarden:ORDERS:{ip}
spicegarden:API:{ip}
```

### Session Keys
```
session:{token_hash}
```

### BullMQ Keys
```
bull:order_lifecycle:uid:state
bull:driver_assignment:uid:state
bull:notifications:uid:state
bull:refunds:uid:state
bull:analytics:uid:state
```

### Cache Keys
(Application-level caching not explicitly implemented - Redis primarily used for rate limiting and BullMQ)
