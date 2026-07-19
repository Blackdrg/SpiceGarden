import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export type AnalyticsEventType =
  | 'page_view'
  | 'click'
  | 'order_placed'
  | 'payment_success'
  | 'payment_failed'
  | 'search'
  | 'add_to_cart'
  | 'web_vital'
  | 'flow_started'
  | 'flow_step_completed'
  | 'flow_completed'
  | 'flow_error'
  | 'navigation_change';

@Entity('analytics_events')
@Index('idx_analytics_events_type', ['type'])
@Index('idx_analytics_events_created', ['createdAt'])
@Index('idx_analytics_events_user', ['userId'])
export class AnalyticsEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  type!: AnalyticsEventType;

  @Column({ type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  sessionId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  properties?: Record<string, unknown> | null;

  @Column({ type: 'timestamp', default: () => 'now()' })
  timestamp!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
