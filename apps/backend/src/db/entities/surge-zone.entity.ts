import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('surge_zones')
@Index('idx_surge_zones_is_active', ['isActive'])
@Index('idx_surge_zones_created_at', ['createdAt'])
export class SurgeZoneEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('jsonb')
  polygon!: { lat: number; lng: number }[];

  @Column('decimal', { precision: 5, scale: 2, default: 1.0 })
  multiplier!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  startTime!: string; // e.g., '09:00'

  @Column({ nullable: true })
  endTime!: string; // e.g., '21:00'

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}