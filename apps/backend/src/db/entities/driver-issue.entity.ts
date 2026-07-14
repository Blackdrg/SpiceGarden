import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DriverIssueStatus {
  REPORTED = 'reported',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('driver_issues')
export class DriverIssueEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  driverId!: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column()
  issue!: string;

  @Column('text')
  details!: string;

  @Column({ type: 'varchar', enum: DriverIssueStatus, default: DriverIssueStatus.REPORTED })
  status!: DriverIssueStatus;

  @Column({ nullable: true })
  resolvedAt!: Date;

  @Column({ nullable: true })
  resolvedBy!: string;

  @Column({ nullable: true })
  resolutionNotes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
