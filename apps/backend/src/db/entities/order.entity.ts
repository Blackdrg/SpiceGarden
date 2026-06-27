import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, ManyToOne, Index } from 'typeorm';
import { OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';
import { OrderItemEntity } from './order-item.entity';
import { GSTDetailEntity } from './gst-detail.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';

@Entity('orders')
@Index('idx_orders_user_id', ['userId'])
@Index('idx_orders_restaurant_id', ['restaurantId'])
@Index('idx_orders_driver_id', ['driverId'])
@Index('idx_orders_status', ['status'])
@Index('idx_orders_user_status', ['userId', 'status'])
@Index('idx_orders_restaurant_status', ['restaurantId', 'status'])
@Index('idx_orders_created_at', ['createdAt'])
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items!: OrderItemEntity[];

  @Column()
  userId!: string;

  @Column()
  restaurantId!: string;

  @Column({ nullable: true })
  branchId!: string;

  @ManyToOne(() => RestaurantBranchEntity)
  branch?: RestaurantBranchEntity;

  @Column({ nullable: true })
  driverId!: string;

  @Column({ nullable: true })
  otpCode!: string;

  @Column()
  orderNumber!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PLACED })
  status!: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Column({ nullable: true })
  paymentIntentId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  deliveryFee!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  discount!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tip!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  grandTotal!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  refundedAmount!: number;

  @Column({ nullable: true })
  couponId!: string;

  @Column()
  deliveryAddressId!: string;

  @Column({ nullable: true })
  deliveredAt!: Date;

  @OneToOne(() => GSTDetailEntity, gstDetail => gstDetail.order)
  gstDetail?: GSTDetailEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}