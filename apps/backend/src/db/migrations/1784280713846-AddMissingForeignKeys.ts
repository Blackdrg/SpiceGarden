import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingForeignKeys1784280713846 implements MigrationInterface {
    name = 'AddMissingForeignKeys1784280713846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Idempotent: only add FK/index if it does not already exist.
        await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints
              WHERE constraint_type='FOREIGN KEY' AND table_name='refund_approvals'
              AND constraint_name='FK_refund_approvals_order'
            ) THEN
              ALTER TABLE "refund_approvals" ADD CONSTRAINT "FK_refund_approvals_order"
                FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='refund_approvals' AND indexname='idx_refund_approvals_order_id') THEN
              CREATE INDEX "idx_refund_approvals_order_id" ON "refund_approvals" ("orderId");
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints
              WHERE constraint_type='FOREIGN KEY' AND table_name='disputes'
              AND constraint_name='FK_disputes_order'
            ) THEN
              ALTER TABLE "disputes" ADD CONSTRAINT "FK_disputes_order"
                FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name='coupon_usages' AND column_name='couponId'
              AND udt_name='uuid'
            ) THEN
              ALTER TABLE "coupon_usages" ALTER COLUMN "couponId" TYPE uuid USING "couponId"::uuid;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name='coupon_usages' AND column_name='userId'
              AND udt_name='uuid'
            ) THEN
              ALTER TABLE "coupon_usages" ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name='coupon_usages' AND column_name='orderId'
              AND udt_name='uuid'
            ) THEN
              ALTER TABLE "coupon_usages" ALTER COLUMN "orderId" TYPE uuid USING "orderId"::uuid;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints
              WHERE constraint_type='FOREIGN KEY' AND table_name='coupon_usages'
              AND constraint_name='FK_coupon_usages_coupon'
            ) THEN
              ALTER TABLE "coupon_usages" ADD CONSTRAINT "FK_coupon_usages_coupon"
                FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints
              WHERE constraint_type='FOREIGN KEY' AND table_name='coupon_usages'
              AND constraint_name='FK_coupon_usages_user'
            ) THEN
              ALTER TABLE "coupon_usages" ADD CONSTRAINT "FK_coupon_usages_user"
                FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints
              WHERE constraint_type='FOREIGN KEY' AND table_name='coupon_usages'
              AND constraint_name='FK_coupon_usages_order'
            ) THEN
              ALTER TABLE "coupon_usages" ADD CONSTRAINT "FK_coupon_usages_order"
                FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='coupon_usages' AND indexname='idx_coupon_usages_coupon_id') THEN
              CREATE INDEX "idx_coupon_usages_coupon_id" ON "coupon_usages" ("couponId");
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='coupon_usages' AND indexname='idx_coupon_usages_user_id') THEN
              CREATE INDEX "idx_coupon_usages_user_id" ON "coupon_usages" ("userId");
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='coupon_usages' AND indexname='idx_coupon_usages_order_id') THEN
              CREATE INDEX "idx_coupon_usages_order_id" ON "coupon_usages" ("orderId");
            END IF;
          END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_coupon_usages_order_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_coupon_usages_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_coupon_usages_coupon_id"`);
        await queryRunner.query(`ALTER TABLE "coupon_usages" DROP CONSTRAINT IF EXISTS "FK_coupon_usages_order"`);
        await queryRunner.query(`ALTER TABLE "coupon_usages" DROP CONSTRAINT IF EXISTS "FK_coupon_usages_user"`);
        await queryRunner.query(`ALTER TABLE "coupon_usages" DROP CONSTRAINT IF EXISTS "FK_coupon_usages_coupon"`);
        await queryRunner.query(`ALTER TABLE "disputes" DROP CONSTRAINT IF EXISTS "FK_disputes_order"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_refund_approvals_order_id"`);
        await queryRunner.query(`ALTER TABLE "refund_approvals" DROP CONSTRAINT IF EXISTS "FK_refund_approvals_order"`);
    }
}
