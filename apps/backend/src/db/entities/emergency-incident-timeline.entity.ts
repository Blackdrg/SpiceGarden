import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('emergency_incident_timelines')
@Index('idx_emergency_timeline_incident_id', ['incidentId'])
@Index('idx_emergency_timeline_timestamp', ['timestamp'])
export class EmergencyIncidentTimelineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  incidentId!: string;

  @Column({ type: 'varchar', length: 100 })
  event!: string;

  @Column('text')
  description!: string;

  @Column({ nullable: true })
  performedBy?: string;

  @Column('simple-json', { nullable: true })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  timestamp!: Date;
}
