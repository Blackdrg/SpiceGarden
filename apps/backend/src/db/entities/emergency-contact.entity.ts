import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('emergency_contacts')
@Index('idx_emergency_contacts_driver_id', ['driverId'])
@Index('idx_emergency_contacts_priority', ['priority'])
@Index('idx_emergency_contacts_driver_priority', ['driverId', 'priority'])
export class EmergencyContactEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  driverId!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  relationship!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ default: 0 })
  priority!: number;

  @Column({ default: false })
  verified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt!: Date;
}
