import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  @ManyToOne(() => RestaurantBranchEntity, (branch) => branch.categories)
  branch!: RestaurantBranchEntity;

  @OneToMany(() => MenuItemEntity, (item) => item.category)
  items!: MenuItemEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
