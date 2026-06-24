import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderStatus } from '../../shared/domain/order.interface';
import { NotificationService } from '../../services/notifications/notification.service';

interface OrderLifecycleJob {
  orderId: string;
  status: OrderStatus;
  userId?: string;
}

@Injectable()
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async processOrderLifecycle(data: OrderLifecycleJob, job?: Job<OrderLifecycleJob>): Promise<void> {
    const { orderId, status, userId } = data;

    if (!orderId || !status) {
      throw new Error('Order lifecycle job requires orderId and status');
    }

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.status !== status) {
      order.status = status;
      order.updatedAt = new Date();
      await this.orderRepo.save(order);
    }

    if (userId) {
      await this.notificationService.notifyOrderUpdate(userId, orderId, status);
    }

    this.logger.log(`Processed order lifecycle job ${job?.id ?? orderId}: ${status}`);
  }
}
