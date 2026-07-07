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
export declare class OrderProcessor {
    private readonly orderRepo;
    private readonly notificationService;
    private readonly logger;
    constructor(orderRepo: Repository<OrderEntity>, notificationService: NotificationService);
    processOrderLifecycle(data: OrderLifecycleJob, job?: Job<OrderLifecycleJob>): Promise<void>;
}
export {};
