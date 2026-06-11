import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('data_exports')
export class DataExportRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, default: 'self_service' })
  regulation!: string;

  @Column({ type: 'varchar', length: 50 })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  exportUrl!: string;

  @Column({ type: 'jsonb', nullable: true })
  filePath!: string;

  @Column({ type: 'jsonb', nullable: true })
  exportFormat!: string;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'date', nullable: true })
  completedAt!: Date;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column({ unique: true })
  userId!: string;
}
