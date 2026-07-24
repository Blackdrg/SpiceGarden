import { MigrationInterface, QueryRunner, Table, Index, TableIndex } from 'typeorm';

export class CreateEmergencySosTables1901010100001 implements MigrationInterface {
  name = 'CreateEmergencySosTables1901010100001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'emergency_incidents',
        columns: [
          { name: 'id', type: 'uuid', default: 'uuid_generate_v4()', isPrimary: true },
          { name: 'incident_number', type: 'varchar', length: '50' },
          { name: 'driver_id', type: 'varchar', length: '255' },
          { name: 'order_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'restaurant_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'customer_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'status', type: 'varchar', length: '50', default: "'open'" },
          { name: 'severity', type: 'varchar', length: '50', default: "'medium'" },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'closed_at', type: 'timestamp', isNullable: true },
          { name: 'latitude', type: 'decimal', precision: 10, scale: 8, isNullable: true },
          { name: 'longitude', type: 'decimal', precision: 11, scale: 8, isNullable: true },
          { name: 'accuracy', type: 'decimal', precision: 6, scale: 2, isNullable: true },
          { name: 'heading', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'speed', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'city', type: 'varchar', length: '100', isNullable: true },
          { name: 'state', type: 'varchar', length: '100', isNullable: true },
          { name: 'country', type: 'varchar', length: '100', isNullable: true },
          { name: 'device_battery', type: 'integer', isNullable: true },
          { name: 'network_type', type: 'varchar', length: '50', isNullable: true },
          { name: 'notes', type: 'jsonb', isNullable: true },
          { name: 'resolved_by', type: 'varchar', length: '255', isNullable: true },
          { name: 'resolution_notes', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
        ],
      }),
      true
    );
    await queryRunner.createIndex('emergency_incidents', new (TableIndex as any)({ name: 'idx_emergency_incidents_driver_id', columnNames: ['driver_id'] }));
    await queryRunner.createIndex('emergency_incidents', new (TableIndex as any)({ name: 'idx_emergency_incidents_status', columnNames: ['status'] }));
    await queryRunner.createIndex('emergency_incidents', new (TableIndex as any)({ name: 'idx_emergency_incidents_severity', columnNames: ['severity'] }));
    await queryRunner.createIndex('emergency_incidents', new (TableIndex as any)({ name: 'idx_emergency_incidents_created_at', columnNames: ['created_at'] }));
    await queryRunner.createIndex('emergency_incidents', new (TableIndex as any)({ name: 'idx_emergency_incidents_incident_number', columnNames: ['incident_number'], isUnique: true }));
    await queryRunner.createIndex('emergency_incidents', new (TableIndex as any)({ name: 'idx_emergency_incidents_order_id', columnNames: ['order_id'] }));
    await queryRunner.createIndex('emergency_incidents', new (TableIndex as any)({ name: 'idx_emergency_incidents_restaurant_id', columnNames: ['restaurant_id'] }));

    await queryRunner.createTable(
      new Table({
        name: 'emergency_contacts',
        columns: [
          { name: 'id', type: 'uuid', default: 'uuid_generate_v4()', isPrimary: true },
          { name: 'driver_id', type: 'varchar', length: '255' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'relationship', type: 'varchar', length: '100' },
          { name: 'phone', type: 'varchar', length: '50' },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'priority', type: 'integer', default: 0 },
          { name: 'verified', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );
    await queryRunner.createIndex('emergency_contacts', new (TableIndex as any)({ name: 'idx_emergency_contacts_driver_id', columnNames: ['driver_id'] }));
    await queryRunner.createIndex('emergency_contacts', new (TableIndex as any)({ name: 'idx_emergency_contacts_priority', columnNames: ['priority'] }));
    await queryRunner.createIndex('emergency_contacts', new (TableIndex as any)({ name: 'idx_emergency_contacts_driver_priority', columnNames: ['driver_id', 'priority'] }));

    await queryRunner.createTable(
      new Table({
        name: 'emergency_incident_timelines',
        columns: [
          { name: 'id', type: 'uuid', default: 'uuid_generate_v4()', isPrimary: true },
          { name: 'incident_id', type: 'uuid' },
          { name: 'event', type: 'varchar', length: '100' },
          { name: 'description', type: 'text' },
          { name: 'performed_by', type: 'varchar', length: '255', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'timestamp', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );
    await queryRunner.createIndex('emergency_incident_timelines', new (TableIndex as any)({ name: 'idx_emergency_timeline_incident_id', columnNames: ['incident_id'] }));
    await queryRunner.createIndex('emergency_incident_timelines', new (TableIndex as any)({ name: 'idx_emergency_timeline_timestamp', columnNames: ['timestamp'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('emergency_incident_timelines');
    await queryRunner.dropTable('emergency_contacts');
    await queryRunner.dropTable('emergency_incidents');
  }
}
