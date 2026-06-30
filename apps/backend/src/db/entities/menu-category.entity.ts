import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
import { MenuItemEntity } from './menu-item.entity';

@Entity('menu_categories')
export class MenuCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: 0 })
  sortOrder!: number;

  @Index('idx_menu_categories_branch_id')
  @ManyToOne(() => RestaurantBranchEntity, (branch) => branch.categories)
  branch!: RestaurantBranchEntity;

  @OneToMany(() => MenuItemEntity, (item) => item.category)
  items!: MenuItemEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
