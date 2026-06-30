import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema20240101000001 implements MigrationInterface {
  name = "InitialSchema20240101000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('customer', 'restaurant', 'kitchen_staff', 'delivery_partner', 'admin', 'super_admin', 'support_staff', 'finance_staff');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE payment_method_type AS ENUM ('card', 'bank_account', 'wallet', 'upi');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE driver_kyc_status AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'customer',
        status VARCHAR(50) DEFAULT 'active',
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        profile_image VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        address TEXT,
        phone VARCHAR(20),
        description TEXT,
        cover_image VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS restaurant_branches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        branch_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        location POINT,
        opening_time TIME,
        closing_time TIME,
        is_online BOOLEAN DEFAULT true,
        restaurant_id UUID NOT NULL REFERENCES restaurants(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        branch_id UUID NOT NULL REFERENCES restaurant_branches(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        base_price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(500),
        is_veg BOOLEAN DEFAULT true,
        spice_level INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'available',
        category_id UUID NOT NULL REFERENCES menu_categories(id),
        hsn_sac_id UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id UUID NOT NULL,
        restaurant_id UUID NOT NULL REFERENCES restaurants(id),
        branch_id UUID REFERENCES restaurant_branches(id),
        driver_id UUID,
        otp_code VARCHAR(10),
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_intent_id VARCHAR(255),
        subtotal DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) DEFAULT 0,
        delivery_fee DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        delivery_address JSONB,
        special_instructions TEXT,
        estimated_delivery_time TIMESTAMP,
        actual_delivery_time TIMESTAMP,
        rating INTEGER,
        review TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id),
        menu_item_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        customizations JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL,
        license_number VARCHAR(100),
        vehicle_number VARCHAR(50),
        vehicle_type VARCHAR(50),
        kyc_status VARCHAR(50) DEFAULT 'pending',
        is_online BOOLEAN DEFAULT false,
        is_available BOOLEAN DEFAULT false,
        rating DECIMAL(3, 2) DEFAULT 0,
        current_location POINT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS driver_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        driver_id UUID NOT NULL REFERENCES drivers(id),
        order_id UUID NOT NULL REFERENCES orders(id),
        branch_id UUID REFERENCES restaurant_branches(id),
        assignment_type VARCHAR(50) DEFAULT 'single',
        batch_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'assigned',
        distance DECIMAL(10, 2),
        estimated_time_minutes DECIMAL(5, 2),
        accepted_at TIMESTAMP,
        picked_up_at TIMESTAMP,
        delivered_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL,
        balance DECIMAL(12, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'INR',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        wallet_id UUID NOT NULL REFERENCES wallets(id),
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(50) DEFAULT 'pending',
        reference_id VARCHAR(255),
        reference_type VARCHAR(100),
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        recipient_id UUID NOT NULL,
        recipient_type VARCHAR(50) NOT NULL,
        notification_type VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL,
        provider VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        attempt_count INTEGER DEFAULT 0,
        max_attempts INTEGER,
        last_attempt_at TIMESTAMP,
        next_attempt_at TIMESTAMP,
        completed_at TIMESTAMP,
        error_info JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver ON driver_assignments(driver_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_driver_assignments_order ON driver_assignments(order_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_driver_assignments_status ON driver_assignments(status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver_status ON driver_assignments(driver_id, status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_notifications_recipient_status ON notifications(recipient_id, status);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS wallet_transactions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS wallets CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS driver_assignments CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS drivers CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_items CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS menu_items CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS menu_categories CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS restaurant_branches CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS restaurants CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE;`);

    await queryRunner.query(`DROP TYPE IF EXISTS notification_status CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS driver_kyc_status CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method_type CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS order_status CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role CASCADE;`);
  }
}
