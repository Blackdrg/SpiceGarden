import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductionIndexes202406280001 implements MigrationInterface {
  name = "AddProductionIndexes202406280001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Menu items - frequently queried by category, status, name
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_menu_items_status ON menu_items(status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);`);

    // Drivers - frequently queried by userId, kycStatus, availability
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_drivers_kyc_status ON drivers(kyc_status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_drivers_is_online ON drivers(is_online);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_drivers_is_available ON drivers(is_available);`);

    // Wallets - queried by userId
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);`);

    // Order items - queried by orderId
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`);

    // Menu categories - queried by branch
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_menu_categories_branch_id ON menu_categories(branch_id);`);

    // Refunds - queried by orderId, userId, status
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(requested_by);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);`);

    // Payment disputes - queried by orderId, status
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_disputes_order_id ON payment_disputes(order_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON payment_disputes(status);`);

    // Restaurant GST - queried by restaurantId
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_restaurant_gst_restaurant_id ON restaurant_gst(restaurant_id);`);

    // Inventory items - queried by branch, low stock threshold
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock_threshold ON inventory_items(low_stock_threshold);`);

    // Surge zones - queried by isActive, createdAt
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_surge_zones_is_active ON surge_zones(is_active);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_surge_zones_created_at ON surge_zones(created_at);`);

    // Subscriptions - queried by userId, status
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);`);

    // GST details - queried by orderId
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_gst_details_order_id ON gst_details(order_id);`);

    // Referrals - queried by referrer, referee, code
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_referrals_referee_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_referrals_referrer_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gst_details_order_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_subscriptions_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_subscriptions_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_surge_zones_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_surge_zones_is_active;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_inventory_items_low_stock_threshold;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_restaurant_gst_restaurant_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payment_disputes_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payment_disputes_order_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_refunds_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_refunds_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_refunds_order_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_menu_categories_branch_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_order_items_order_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_wallets_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_drivers_is_available;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_drivers_is_online;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_drivers_kyc_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_drivers_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_menu_items_name;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_menu_items_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_menu_items_category_id;`);
  }
}
