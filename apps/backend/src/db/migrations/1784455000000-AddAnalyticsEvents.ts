import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnalyticsEvents1784455000000 implements MigrationInterface {
    name = 'AddAnalyticsEvents1784455000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "analytics_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(64) NOT NULL, "userId" uuid, "sessionId" character varying(512), "properties" jsonb, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d643d67a09b55653e98616f421" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_analytics_events_user" ON "analytics_events" ("userId") `);
        await queryRunner.query(`CREATE INDEX "idx_analytics_events_created" ON "analytics_events" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "idx_analytics_events_type" ON "analytics_events" ("type") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_analytics_events_type"`);
        await queryRunner.query(`DROP INDEX "public"."idx_analytics_events_created"`);
        await queryRunner.query(`DROP INDEX "public"."idx_analytics_events_user"`);
        await queryRunner.query(`DROP TABLE "analytics_events"`);
    }

}
