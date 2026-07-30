import { MigrationInterface, QueryRunner } from "typeorm";

export class EnablePostGISAndAddSpatialIndexes1750500000000 implements MigrationInterface {
    name = 'EnablePostGISAndAddSpatialIndexes1750500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_restaurant_branches_location_gist" ON "restaurant_branches" USING GIST ((ST_MakePoint(CAST(SUBSTRING("location" FROM '\\(([^ ]+)') AS float), CAST(SUBSTRING("location" FROM ' ([^)]+)') AS float))::geography))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_restaurant_branches_location_gist"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS postgis`);
    }
}
