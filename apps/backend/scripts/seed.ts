import { DataSource } from 'typeorm';
import { BusinessSeederService } from '../src/services/restaurant/business.seeder';

async function runSeed() {
  console.log('Running backend seed script...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'spicegarden',
    password: process.env.DB_PASS || 'spicegarden_dev_password',
    database: process.env.DB_NAME || 'spicegarden',
    entities: ['apps/backend/src/db/entities/*.ts'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    const seeder = new BusinessSeederService(dataSource);
    await seeder.seedAll();
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();