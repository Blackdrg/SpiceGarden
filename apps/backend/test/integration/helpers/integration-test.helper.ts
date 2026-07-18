import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from '../../../src/db/entities-index';

export class IntegrationTestHelper {
  private static dataSource: DataSource | null = null;

  static async createDataSource(): Promise<DataSource> {
    if (this.dataSource && this.dataSource.isInitialized) {
      return this.dataSource;
    }

    this.dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities,
      synchronize: true,
      logging: false,
      dropSchema: true,
    });

    await this.dataSource.initialize();
    await this.dataSource.runMigrations();
    return this.dataSource;
  }

  static async closeDataSource(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = null;
    }
  }

  static async cleanDatabase(): Promise<void> {
    if (!this.dataSource) return;
    const entities = this.dataSource.entityMetadatas;
    for (const entity of entities) {
      const repo = this.dataSource.getRepository(entity.name);
      await repo.clear();
    }
  }
}
