const { DataSource } = require('typeorm');
const path = require('path');

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'spicegarden',
    password: process.env.DB_PASS || 'spicegarden_dev',
    database: process.env.DB_NAME || 'spicegarden',
    synchronize: false,
    migrations: [path.resolve(__dirname, '../../apps/backend/dist/src/db/migrations/1784280713843-AddComplianceLegalTables.js')],
  });
  await ds.initialize();
  console.log('DataSource initialized, running migrations...');
  const result = await ds.runMigrations();
  console.log('Applied migrations:', result.map((m) => m.name));
  await ds.destroy();
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
