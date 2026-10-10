import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { MenuCategoryEntity } from './menu-category.entity';
import { HSNSACEntity } from './hsn-sac.entity';
import { MenuAddonEntity } from './menu-addon.entity';

@Entity('menu_items')
export class MenuItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_menu_items_name')
  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice!: number;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column({ default: true })
  isVeg!: boolean;

  @Column({ default: 0 })
  spiceLevel!: number;

  @Index('idx_menu_items_status')
  @Column({ default: 'available' })
  status!: string;

  @Index('idx_menu_items_category_id')
  @ManyToOne(() => MenuCategoryEntity, (category) => category.items)
  category!: MenuCategoryEntity;

  @Column({ nullable: true })
  hsnSacId?: string; // Reference to HSN/SAC code

  @ManyToOne(() => HSNSACEntity, { nullable: true })
  hsnSac?: HSNSACEntity;

  @OneToMany(() => MenuAddonEntity, (addon) => addon.menuItem)
  addons?: MenuAddonEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
