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
    entities: [path.resolve(__dirname, '../../apps/backend/dist/src/**/*.entity.js')],
    synchronize: false,
  });
  await ds.initialize();
  const has = ds.hasMetadata('LegalDocumentEntity');
  console.log('hasMetadata(LegalDocumentEntity):', has);
  const names = ds.entityMetadatas.map((m) => m.name);
  console.log('legal entities present:', names.filter((n) => n.startsWith('Legal') || n.includes('Cookie') || n.includes('Consent') || n.includes('Retention') || n.includes('Security') || n.includes('Grievance') || n.includes('Agreement') || n.includes('Compliance') || n.includes('DataSubject') || n.includes('DataExport')));
  await ds.destroy();
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
