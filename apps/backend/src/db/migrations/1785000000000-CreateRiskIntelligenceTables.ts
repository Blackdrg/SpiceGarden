import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRiskIntelligenceTables1785000000000 implements MigrationInterface {
  name = 'CreateRiskIntelligenceTables1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'risk_zones',
        columns: [
          { name: 'id', type: 'uuid', default: 'uuid_generate_v4()', isPrimary: true },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'zone_type', type: 'varchar', length: '50', default: "'radius'" },
          { name: 'polygon', type: 'jsonb', isNullable: true },
          { name: 'center_lat', type: 'decimal', precision: 10, scale: 8, isNullable: true },
          { name: 'center_lng', type: 'decimal', precision: 11, scale: 8, isNullable: true },
          { name: 'radius_meters', type: 'integer', default: 500 },
          { name: 'risk_score', type: 'integer', default: 0 },
          { name: 'crime_category', type: 'varchar', length: '100', isNullable: true },
          { name: 'severity', type: 'varchar', length: '50', default: "'low'" },
          { name: 'active_time_start', type: 'varchar', length: '5', isNullable: true },
          { name: 'active_time_end', type: 'varchar', length: '5', isNullable: true },
          { name: 'active_days', type: 'jsonb', default: "'[]'" },
          { name: 'reason', type: 'text', isNullable: true },
          { name: 'verification_source', type: 'varchar', length: '255', isNullable: true },
          { name: 'admin_notes', type: 'text', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'expires_at', type: 'timestamp', isNullable: true },
          { name: 'created_by', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );
    await queryRunner.createIndex('risk_zones', new (TableIndex as any)({ name: 'idx_risk_zones_is_active', columnNames: ['is_active'] }));
    await queryRunner.createIndex('risk_zones', new (TableIndex as any)({ name: 'idx_risk_zones_risk_score', columnNames: ['risk_score'] }));

    await queryRunner.createTable(
      new Table({
        name: 'risk_events',
        columns: [
          { name: 'id', type: 'uuid', default: 'uuid_generate_v4()', isPrimary: true },
          { name: 'risk_zone_id', type: 'uuid', isNullable: true },
          { name: 'event_type', type: 'varchar', length: '100' },
          { name: 'severity', type: 'varchar', length: '50', default: "'info'" },
          { name: 'description', type: 'text' },
          { name: 'user_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'driver_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'order_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'location_lat', type: 'decimal', precision: 10, scale: 8, isNullable: true },
          { name: 'location_lng', type: 'decimal', precision: 11, scale: 8, isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );
    await queryRunner.createIndex('risk_events', new (TableIndex as any)({ name: 'idx_risk_events_zone', columnNames: ['risk_zone_id'] }));
    await queryRunner.createIndex('risk_events', new (TableIndex as any)({ name: 'idx_risk_events_created', columnNames: ['created_at'] }));

    await queryRunner.createTable(
      new Table({
        name: 'driver_incidents',
        columns: [
          { name: 'id', type: 'uuid', default: 'uuid_generate_v4()', isPrimary: true },
          { name: 'driver_id', type: 'varchar', length: '255' },
          { name: 'order_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'risk_zone_id', type: 'uuid', isNullable: true },
          { name: 'incident_type', type: 'varchar', length: '100' },
          { name: 'severity', type: 'varchar', length: '50', default: "'low'" },
          { name: 'description', type: 'text' },
          { name: 'location_lat', type: 'decimal', precision: 10, scale: 8, isNullable: true },
          { name: 'location_lng', type: 'decimal', precision: 11, scale: 8, isNullable: true },
          { name: 'status', type: 'varchar', length: '50', default: "'open'" },
          { name: 'resolved_at', type: 'timestamp', isNullable: true },
          { name: 'resolved_by', type: 'varchar', length: '255', isNullable: true },
          { name: 'resolution_notes', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );
    await queryRunner.createIndex('driver_incidents', new (TableIndex as any)({ name: 'idx_driver_incidents_driver', columnNames: ['driver_id'] }));
    await queryRunner.createIndex('driver_incidents', new (TableIndex as any)({ name: 'idx_driver_incidents_status', columnNames: ['status'] }));

    await queryRunner.createTable(
      new Table({
        name: 'risk_notifications',
        columns: [
          { name: 'id', type: 'uuid', default: 'uuid_generate_v4()', isPrimary: true },
          { name: 'risk_zone_id', type: 'uuid', isNullable: true },
          { name: 'recipient_id', type: 'varchar', length: '255' },
          { name: 'recipient_type', type: 'varchar', length: '50', default: "'driver'" },
          { name: 'notification_type', type: 'varchar', length: '100' },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'message', type: 'text' },
          { name: 'location_lat', type: 'decimal', precision: 10, scale: 8, isNullable: true },
          { name: 'location_lng', type: 'decimal', precision: 11, scale: 8, isNullable: true },
          { name: 'is_read', type: 'boolean', default: false },
          { name: 'is_acknowledged', type: 'boolean', default: false },
          { name: 'is_sos', type: 'boolean', default: false },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );
    await queryRunner.createIndex('risk_notifications', new (TableIndex as any)({ name: 'idx_risk_notifications_recipient', columnNames: ['recipient_id', 'recipient_type'] }));
    await queryRunner.createIndex('risk_notifications', new (TableIndex as any)({ name: 'idx_risk_notifications_read', columnNames: ['is_read'] }));

    await queryRunner.createTable(
      new Table({
        name: 'fraud_blacklist',
        columns: [
          { name: 'id', type: 'uuid', default: 'uuid_generate_v4()', isPrimary: true },
          { name: 'entity_type', type: 'varchar', length: '50' },
          { name: 'entity_value', type: 'varchar', length: '255' },
          { name: 'ban_type', type: 'varchar', length: '50', default: "'soft'" },
          { name: 'reason', type: 'text', isNullable: true },
          { name: 'evidence', type: 'jsonb', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'expires_at', type: 'timestamp', isNullable: true },
          { name: 'created_by', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );
    await queryRunner.createIndex('fraud_blacklist', new (TableIndex as any)({ name: 'idx_fraud_blacklist_entity', columnNames: ['entity_type', 'entity_value'] }));
    await queryRunner.createIndex('fraud_blacklist', new (TableIndex as any)({ name: 'idx_fraud_blacklist_active', columnNames: ['is_active'] }));

    await queryRunner.createTable(
      new Table({
        name: 'payment_qr_codes',
        columns: [
          { name: 'id', type: 'uuid', default: 'uuid_generate_v4()', isPrimary: true },
          { name: 'qr_type', type: 'varchar', length: '50', default: "'dynamic'" },
          { name: 'upi_id', type: 'varchar', length: '255' },
          { name: 'upi_name', type: 'varchar', length: '255' },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'currency', type: 'varchar', length: '10', default: "'INR'" },
          { name: 'order_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'payment_intent_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'qr_data', type: 'text' },
          { name: 'qr_image_url', type: 'varchar', length: '1024', isNullable: true },
          { name: 'status', type: 'varchar', length: '50', default: "'pending'" },
          { name: 'expires_at', type: 'timestamp', isNullable: true },
          { name: 'paid_at', type: 'timestamp', isNullable: true },
          { name: 'payment_ref', type: 'varchar', length: '255', isNullable: true },
          { name: 'gateway', type: 'varchar', length: '50', default: "'razorpay'" },
          { name: 'attempts', type: 'integer', default: 0 },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );
    await queryRunner.createIndex('payment_qr_codes', new (TableIndex as any)({ name: 'idx_payment_qr_order', columnNames: ['order_id'] }));
    await queryRunner.createIndex('payment_qr_codes', new (TableIndex as any)({ name: 'idx_payment_qr_status', columnNames: ['status'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payment_qr_codes');
    await queryRunner.dropTable('fraud_blacklist');
    await queryRunner.dropTable('risk_notifications');
    await queryRunner.dropTable('driver_incidents');
    await queryRunner.dropTable('risk_events');
    await queryRunner.dropTable('risk_zones');
  }
}
