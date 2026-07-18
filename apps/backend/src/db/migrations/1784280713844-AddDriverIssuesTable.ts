import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDriverIssuesTable1784280713844 implements MigrationInterface {
    name = 'AddDriverIssuesTable1784280713844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "driver_issues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "driverId" character varying NOT NULL, "orderId" character varying, "issue" character varying NOT NULL, "details" text NOT NULL, "status" character varying NOT NULL DEFAULT 'reported', "resolvedAt" TIMESTAMP, "resolvedBy" character varying, "resolutionNotes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8c6f0776187a6e7c4e88b2d3c8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_driver_issues_driver_id" ON "driver_issues" ("driverId") `);
        await queryRunner.query(`CREATE INDEX "idx_driver_issues_order_id" ON "driver_issues" ("orderId") `);
        await queryRunner.query(`CREATE INDEX "idx_driver_issues_status" ON "driver_issues" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_driver_issues_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_driver_issues_order_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_driver_issues_driver_id"`);
        await queryRunner.query(`DROP TABLE "driver_issues"`);
    }
}
