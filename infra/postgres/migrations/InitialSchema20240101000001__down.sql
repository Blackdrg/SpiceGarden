-- InitialSchema20240101000001
-- ROLLBACK: Drops all objects created by InitialSchema20240101000001__up.sql
-- WARNING: This drops all data. Only use for dev/test environments.

-- Drop indexes first
DROP INDEX IF EXISTS idx_coupons_code CASCADE;
DROP INDEX IF EXISTS idx_wallet_transactions_wallet_id CASCADE;
DROP INDEX IF EXISTS idx_wallets_user_id CASCADE;
DROP INDEX IF EXISTS idx_users_phone CASCADE;
DROP INDEX IF EXISTS idx_users_email CASCADE;
DROP INDEX IF EXISTS idx_driver_assignments_driver_id CASCADE;
DROP INDEX IF EXISTS idx_driver_assignments_order_id CASCADE;
DROP INDEX IF EXISTS idx_restaurant_branches_restaurant_id CASCADE;
DROP INDEX IF EXISTS idx_menu_items_status CASCADE;
DROP INDEX IF EXISTS idx_menu_items_category_id CASCADE;
DROP INDEX IF EXISTS idx_order_items_order_id CASCADE;
DROP INDEX IF EXISTS idx_orders_restaurant_id CASCADE;
DROP INDEX IF EXISTS idx_orders_created_at CASCADE;
DROP INDEX IF EXISTS idx_orders_status CASCADE;
DROP INDEX IF EXISTS idx_orders_user_id CASCADE;

-- Drop tables (order matters for FK constraints)
DROP TABLE IF EXISTS webhook_retry_queue CASCADE;
DROP TABLE IF EXISTS idempotency CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS gst_details CASCADE;
DROP TABLE IF EXISTS holiday_schedules CASCADE;
DROP TABLE IF EXISTS commission_rules CASCADE;
DROP TABLE IF EXISTS payout_reports CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS refund_approvals CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS payment_disputes CASCADE;
DROP TABLE IF EXISTS stripe_webhooks CASCADE;
DROP TABLE IF EXISTS payment_webhooks CASCADE;
DROP TABLE IF EXISTS payment_fraud CASCADE;
DROP TABLE IF EXISTS payment_validation_events CASCADE;
DROP TABLE IF EXISTS payment_events CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS restaurant_onboarding CASCADE;
DROP TABLE IF EXISTS notification_analytics CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS surge_zones CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS inventory_alerts CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS branch_controls CASCADE;
DROP TABLE IF EXISTS sla_alerts CASCADE;
DROP TABLE IF EXISTS delivery_sla CASCADE;
DROP TABLE IF EXISTS kitchen_sla CASCADE;
DROP TABLE IF EXISTS food_prep CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS driver_penalties CASCADE;
DROP TABLE IF EXISTS driver_incentives CASCADE;
DROP TABLE IF EXISTS driver_fraud CASCADE;
DROP TABLE IF EXISTS driver_scores CASCADE;
DROP TABLE IF EXISTS driver_shifts CASCADE;
DROP TABLE IF EXISTS driver_assignments CASCADE;
DROP TABLE IF EXISTS driver_documents CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS menu_moderation CASCADE;
DROP TABLE IF EXISTS menu_item_availability CASCADE;
DROP TABLE IF EXISTS hsn_sac_codes CASCADE;
DROP TABLE IF EXISTS menu_variants CASCADE;
DROP TABLE IF EXISTS menu_addons CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS restaurant_gst CASCADE;
DROP TABLE IF EXISTS restaurant_branches CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS device_fingerprints CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS coupon_usages CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS user_payment_methods CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS driver_kYC_status CASCADE;
DROP TYPE IF EXISTS driver_document_type CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
