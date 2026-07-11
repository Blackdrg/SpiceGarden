import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderStatus } from '../../shared/domain/order.interface';
import { QUEUE_NAMES } from '../../shared/contracts/queues';
import { OrderProcessor } from './order.processor';
export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export interface QueueEnqueueOptions {
    jobId?: string;
    attempts?: number;
    backoffDelay?: number;
    delay?: number;
    priority?: number;
}
interface QueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
}
export declare class QueueService implements OnModuleDestroy {
    private readonly configService;
    private readonly orderProcessor;
    private readonly orderRepo;
    private readonly logger;
    private readonly connection;
    private readonly queues;
    private readonly workers;
    private redisAvailable;
    constructor(configService: ConfigService, orderProcessor: OrderProcessor, orderRepo: Repository<OrderEntity>);
    enqueue<TData extends Record<string, unknown> = Record<string, unknown>>(queueName: QueueName, data: TData, options?: QueueEnqueueOptions): Promise<Job<TData>>;
    enqueueOrderLifecycle(data: {
        orderId: string;
        status: OrderStatus;
        userId?: string;
    }): Promise<Job<typeof data>>;
    getQueue(queueName: QueueName): Queue;
    getQueueStats(queueName: QueueName): Promise<QueueStats>;
    drainQueue(queueName: QueueName): Promise<void>;
    private registerWorker;
    onModuleDestroy(): Promise<void>;
}
export {};
