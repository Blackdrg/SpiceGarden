--InitialSchema20240101000001
-- Description: Core database schema for SpiceGarden (migrated from init.sql)
-- Created: 2024-01-01

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types (enums)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'restaurant', 'kitchen_staff', 'delivery_partner', 'admin', 'super_admin', 'support_staff', 'finance_staff');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
    CREATE TYPE payment_method_type AS ENUM ('card', 'bank_account', 'wallet', 'upi');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'driver_kYC_status') THEN
    CREATE TYPE driver_kYC_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'driver_document_type') THEN
    CREATE TYPE driver_document_type AS ENUM ('license', 'aadhar', 'pan', 'vehicle_rc', 'insurance');
  END IF;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    restaurant_id UUID REFERENCES restaurants(id),
    status VARCHAR(50) DEFAULT 'pending',
    total DECIMAL(10, 2),
    items JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Restaurant branches
CREATE TABLE IF NOT EXISTS restaurant_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    branch_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    location JSONB,
    opening_time TIME,
    closing_time TIME,
    is_online BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES restaurant_branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(512),
    is_veg BOOLEAN DEFAULT true,
    spice_level INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu addons
CREATE TABLE IF NOT EXISTS menu_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    extra_price DECIMAL(10, 2) DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    max_quantity INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Menu variants
CREATE TABLE IF NOT EXISTS menu_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- HSN/SAC codes
CREATE TABLE IF NOT EXISTS hsn_sac_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    cgst_rate DECIMAL(5, 2) DEFAULT 0,
    sgst_rate DECIMAL(5, 2) DEFAULT 0,
    igst_rate DECIMAL(5, 2) DEFAULT 0,
    cess_rate DECIMAL(5, 2) DEFAULT 0,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu item availability
CREATE TABLE IF NOT EXISTS menu_item_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    available_from TIME,
    available_to TIME,
    is_available BOOLEAN DEFAULT true,
    UNIQUE(menu_item_id, day_of_week)
);

-- Menu moderation
CREATE TABLE IF NOT EXISTS menu_moderation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    reason TEXT,
    moderated_by UUID,
    moderated_at TIMESTAMP,
    action VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    vehicle_number VARCHAR(50),
    vehicle_type VARCHAR(50) DEFAULT 'motorcycle',
    kyc_status VARCHAR(50) DEFAULT 'pending',
    is_online BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    current_location JSONB,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Driver documents
CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    document_url VARCHAR(512),
    verified_by UUID,
    verified_at TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Driver assignments
CREATE TABLE IF NOT EXISTS driver_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'assigned',
    assigned_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancel_reason TEXT
);

-- Driver shifts
CREATE TABLE IF NOT EXISTS driver_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'scheduled',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    start_location JSONB,
    end_location JSONB,
    total_orders INTEGER DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    total_distance DECIMAL(8, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Driver scores
CREATE TABLE IF NOT EXISTS driver_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    overall_score DECIMAL(3, 2) DEFAULT 5.0,
    delivery_score DECIMAL(3, 2),
    behavior_score DECIMAL(3, 2),
    punctuality_score DECIMAL(3, 2),
    total_ratings INTEGER DEFAULT 0,
    period VARCHAR(20),
    calculated_at TIMESTAMP DEFAULT NOW()
);

-- Driver fraud detection
CREATE TABLE IF NOT EXISTS driver_fraud (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    description TEXT,
    detected_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by UUID,
    status VARCHAR(50) DEFAULT 'open',
    metadata JSONB
);

-- Driver incentives
CREATE TABLE IF NOT EXISTS driver_incentives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    description TEXT,
    criteria JSONB,
    earned_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Driver penalties
CREATE TABLE IF NOT EXISTS driver_penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    penalty_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'issued',
    reason TEXT,
    order_id UUID,
    issued_by UUID,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    address_type VARCHAR(50) DEFAULT 'home',
    full_address TEXT NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    contact_number VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    location JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    current_balance DECIMAL(12, 2) DEFAULT 0,
    lifetime_earnings DECIMAL(12, 2) DEFAULT 0,
    lifetime_spent DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    balance_before DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- OTP verifications
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    identifier VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Session table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    refresh_token VARCHAR(512) NOT NULL,
    device_info JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_type VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- HSN/SAC GST details
CREATE TABLE IF NOT EXISTS gst_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    gst_number VARCHAR(20),
    business_name VARCHAR(255),
    business_address TEXT,
    place_of_supply VARCHAR(5),
    cgst_amount DECIMAL(12, 2) DEFAULT 0,
    sgst_amount DECIMAL(12, 2) DEFAULT 0,
    igst_amount DECIMAL(12, 2) DEFAULT 0,
    total_gst DECIMAL(12, 2) DEFAULT 0,
    hsn_sac_code VARCHAR(20),
    invoice_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Restaurant GST
CREATE TABLE IF NOT EXISTS restaurant_gst (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
    gst_number VARCHAR(20),
    pan_number VARCHAR(20),
    business_name VARCHAR(255),
    business_address TEXT,
    state_code VARCHAR(2) DEFAULT '27',
    gst_type VARCHAR(50) DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    scope VARCHAR(50) DEFAULT 'global',
    status VARCHAR(50) DEFAULT 'active',
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    applicable_restaurants JSONB,
    applicable_categories JSONB,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Coupon usages
CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES coupons(id),
    user_id UUID NOT NULL,
    order_id UUID NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    used_at TIMESTAMP DEFAULT NOW()
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL,
    referee_id UUID NOT NULL,
    code VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reward_type VARCHAR(50) DEFAULT 'wallet_cashback',
    reward_amount DECIMAL(10, 2) DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User devices
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    device_type VARCHAR(50),
    device_model VARCHAR(255),
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    push_token VARCHAR(512),
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Device fingerprints
CREATE TABLE IF NOT EXISTS device_fingerprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    fingerprint_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    first_seen_at TIMESTAMP DEFAULT NOW(),
    last_seen_at TIMESTAMP DEFAULT NOW()
);

-- Batch orders (for kitchen management)
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID,
    branch_id UUID REFERENCES restaurant_branches(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    quantity_produced DECIMAL(10, 2) NOT NULL,
    quantity_consumed DECIMAL(10, 2) DEFAULT 0,
    produced_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    prepared_by UUID,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Food prep tracking
CREATE TABLE IF NOT EXISTS food_prep (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'queued',
    prep_started_at TIMESTAMP,
    prep_completed_at TIMESTAMP,
    chef_id UUID,
    notes TEXT,
    estimated_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Kitchen SLA tracking
CREATE TABLE IF NOT EXISTS kitchen_sla (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES restaurant_branches(id) ON DELETE CASCADE,
    min_prep_time INTEGER DEFAULT 15,
    max_prep_time INTEGER DEFAULT 45,
    avg_prep_time DECIMAL(8, 2) DEFAULT 0,
    current_queue_size INTEGER DEFAULT 0,
    sla_target_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Delivery SLA
CREATE TABLE IF NOT EXISTS delivery_sla (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    min_prep_time INTEGER DEFAULT 15,
    max_prep_time INTEGER DEFAULT 45,
    avg_delivery_time INTEGER DEFAULT 30,
    sla_target_minutes INTEGER DEFAULT 60,
    current_month_avg DECIMAL(8, 2) DEFAULT 0,
    zone JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SLA alerts
CREATE TABLE IF NOT EXISTS sla_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES restaurant_branches(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'warning',
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Branch controls
CREATE TABLE IF NOT EXISTS branch_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID UNIQUE REFERENCES restaurant_branches(id) ON DELETE CASCADE,
    is_accepting_orders BOOLEAN DEFAULT true,
    auto_pause_threshold INTEGER DEFAULT 45,
    current_queue_count INTEGER DEFAULT 0,
    max_concurrent_orders INTEGER DEFAULT 50,
    last_order_at TIMESTAMP,
    paused_at TIMESTAMP,
    paused_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    gst_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    payment_terms VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES restaurant_branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku_code VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    unit VARCHAR(50),
    current_stock DECIMAL(10, 2) DEFAULT 0,
    min_stock_level DECIMAL(10, 2) DEFAULT 0,
    max_stock_level DECIMAL(10, 2),
    reorder_point DECIMAL(10, 2),
    unit_cost DECIMAL(10, 2),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    expiry_date DATE,
    batch_number VARCHAR(100),
    storage_location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory alerts
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info',
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    ingredients JSONB NOT NULL,
    prep_instructions TEXT,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER,
    serving_size INTEGER,
    nutritional_info JSONB,
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT true,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Surge zones
CREATE TABLE IF NOT EXISTS surge_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    zone JSONB NOT NULL,
    surge_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    reason VARCHAR(255),
    starts_at TIMESTAMP,
    ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    priority INTEGER DEFAULT 0,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    order_updates BOOLEAN DEFAULT true,
    promotions BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification analytics
CREATE TABLE IF NOT EXISTS notification_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    delivery_channel VARCHAR(50) NOT NULL,
    delivery_status VARCHAR(50) NOT NULL,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Restaurant onboarding
CREATE TABLE IF NOT EXISTS restaurant_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    step VARCHAR(50) DEFAULT 'business_registration',
    status VARCHAR(50) DEFAULT 'pending',
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 5,
    data JSONB,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Webhook retry queue
CREATE TABLE IF NOT EXISTS webhook_retry_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    next_retry_at TIMESTAMP,
    last_error TEXT,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment methods (infrastructure-driven)
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(100),
    last_four VARCHAR(4),
    brand VARCHAR(50),
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    tokenized_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment events
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    provider VARCHAR(50) DEFAULT 'stripe',
    amount DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payment validation events
CREATE TABLE IF NOT EXISTS payment_validation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    stripe_session_id VARCHAR(255),
    payment_intent_id VARCHAR(255),
    amount DECIMAL(12, 2),
    currency VARCHAR(3),
    failure_reason TEXT,
    metadata JSONB,
    validated_at TIMESTAMP DEFAULT NOW()
);

-- Payment fraud flags
CREATE TABLE IF NOT EXISTS payment_fraud (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    score DECIMAL(3, 2),
    signals JSONB,
    blocked BOOLEAN DEFAULT false,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payment webhooks
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stripe webhooks
CREATE TABLE IF NOT EXISTS stripe_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payment disputes
CREATE TABLE IF NOT EXISTS payment_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    user_id UUID NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id),
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    amount DECIMAL(12, 2),
    reason TEXT,
    evidence JSONB,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    resolution TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'raised',
    reason TEXT NOT NULL,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    resolution TEXT,
    refund_amount DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Refunds
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'requested',
    stripe_refund_id VARCHAR(255),
    processed_by UUID,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Refund approvals
CREATE TABLE IF NOT EXISTS refund_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_id UUID REFERENCES refunds(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL,
    approver_role VARCHAR(50) NOT NULL,
    comment TEXT,
    status VARCHAR(50) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ledger entries
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    debit_amount DECIMAL(12, 2) DEFAULT 0,
    credit_amount DECIMAL(12, 2) DEFAULT 0,
    balance_after DECIMAL(12, 2) NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payout reports
CREATE TABLE IF NOT EXISTS payout_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    gross_amount DECIMAL(12, 2) DEFAULT 0,
    commission_amount DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    net_amount DECIMAL(12, 2) DEFAULT 0,
    total_refunds DECIMAL(12, 2) DEFAULT 0,
    adjustments JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Commission rules
CREATE TABLE IF NOT EXISTS commission_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    value DECIMAL(5, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    effective_from TIMESTAMP,
    effective_to TIMESTAMP,
    conditions JSONB,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Holiday schedules
CREATE TABLE IF NOT EXISTS holiday_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES restaurant_branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    special_hours JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    selected_addons JSONB,
    selected_variants JSONB,
    special_instructions TEXT,
    spice_level INTEGER DEFAULT 0
);

-- Stripe-connected account linking (idempotency table)
CREATE TABLE IF NOT EXISTS idempotency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    status VARCHAR(50) DEFAULT 'processing',
    response JSONB,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_status ON menu_items(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_branches_restaurant_id ON restaurant_branches(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_order_id ON driver_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver_id ON driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
