import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
import { RestaurantGSTEntity } from './restaurant-gst.entity';

@Entity('restaurants')
@Index('idx_restaurants_slug', ['slug'])
@Index('idx_restaurants_status', ['status'])
@Index('idx_restaurants_created_at', ['createdAt'])
export class RestaurantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ unique: true, nullable: true })
  slug!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  logoUrl!: string;

  @Column({ nullable: true })
  bannerUrl!: string;

  @Column({ default: 'active' })
  status!: string;

   @OneToMany(() => RestaurantBranchEntity, (branch) => branch.restaurant)
   branches!: RestaurantBranchEntity[];

   @OneToOne(() => RestaurantGSTEntity, gstDetail => gstDetail.restaurant)
   gstDetail?: RestaurantGSTEntity;

  @Column({ nullable: true })
  stripeAccountId!: string;

  @Column({ nullable: true })
  razorpayFundAccountId!: string;

  @Column('simple-json', { nullable: true })
  location?: { lat: number; lng: number };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
