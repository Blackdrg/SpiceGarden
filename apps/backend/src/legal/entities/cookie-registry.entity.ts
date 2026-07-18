import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ConsentCategory } from './legal.enums';

@Entity('cookie_registry')
@Index('idx_cookie_registry_name', ['name'], { unique: true })
export class CookieRegistryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 30, default: ConsentCategory.NECESSARY })
  category!: ConsentCategory;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  provider!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  purpose!: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  duration!: string;

  @Column({ type: 'varchar', length: 20, default: 'first_party' })
  type!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'varchar', length: 40, default: '1.0.0' })
  scanVersion!: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastScannedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
