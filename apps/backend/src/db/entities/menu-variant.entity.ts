import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';

@Entity('menu_variants')
export class MenuVariantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  menuItemId!: string;

  @ManyToOne(() => MenuItemEntity)
  menuItem!: MenuItemEntity;

  @Column('simple-json', { nullable: true })
  payload!: unknown;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('simple-json', { nullable: true })
  metadata!: unknown;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
