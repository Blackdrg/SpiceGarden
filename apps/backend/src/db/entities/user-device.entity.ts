import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_devices')
@Index('idx_user_devices_user_active', ['userId', 'isActive'])
export class UserDeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column({ nullable: true })
  fcmToken!: string;

  @Column({ nullable: true })
  apnsToken!: string;

  @Column({ nullable: true })
  deviceName!: string;

  @Column({ nullable: true })
  deviceType!: string;

  @Column({ nullable: true })
  userAgent!: string;

  @Column({ nullable: true })
  ipAddress!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
