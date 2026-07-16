import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Worker, Job, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
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

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly connection: IORedis | null = null;
  private readonly queues = new Map<QueueName, Queue>();
  private readonly workers = new Map<QueueName, Worker>();
  private redisAvailable = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly orderProcessor: OrderProcessor,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://127.0.0.1:6379';
      this.connection = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
      this.registerWorker(QUEUE_NAMES.ORDER_LIFECYCLE, async (job) => this.orderProcessor.processOrderLifecycle(job.data, job));
      this.redisAvailable = true;
    } catch (error) {
      this.logger.warn('Redis unavailable. Queue operations will fail until Redis is reachable.');
    }
  }

  async enqueue<TData extends Record<string, unknown> = Record<string, unknown>>(
    queueName: QueueName,
    data: TData,
    options: QueueEnqueueOptions = {},
  ): Promise<Job<TData>> {
    const queue = this.getQueue(queueName);
    const jobOptions: JobsOptions = {
      attempts: options.attempts ?? 3,
      backoff: {
        type: 'exponential',
        delay: options.backoffDelay ?? 1000,
      },
      removeOnComplete: { age: 86400, count: 1000 },
      removeOnFail: { age: 86400, count: 1000 },
    };

    if (options.delay !== undefined) {
      jobOptions.delay = options.delay;
    }
    if (options.priority !== undefined) {
      jobOptions.priority = options.priority;
    }
    if (options.jobId) {
      jobOptions.jobId = options.jobId;
    }

    return queue.add(queueName, data, jobOptions);
  }

  async enqueueOrderLifecycle(data: {
    orderId: string;
    status: OrderStatus;
    userId?: string;
  }): Promise<Job<typeof data>> {
    if (!data.orderId) {
      throw new BadRequestException('Order lifecycle job requires orderId');
    }
    if (!Object.values(OrderStatus).includes(data.status)) {
      throw new BadRequestException('Invalid order status');
    }

    return this.enqueue(QUEUE_NAMES.ORDER_LIFECYCLE, data, {
      jobId: `order-lifecycle:${data.orderId}:${data.status}`,
    });
  }

  getQueue(queueName: QueueName): Queue {
    if (!this.redisAvailable || !this.connection) {
      throw new InternalServerErrorException('Queue operations require Redis. Please start Redis and restart the application.');
    }
    const existing = this.queues.get(queueName);
    if (existing) {
      return existing;
    }

    const queue = new Queue(queueName, { connection: this.connection });
    this.queues.set(queueName, queue);
    return queue;
  }

  async getQueueStats(queueName: QueueName): Promise<QueueStats> {
    const queue = this.getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed, paused: 0 };
  }

  async drainQueue(queueName: QueueName): Promise<void> {
    await this.getQueue(queueName).drain();
  }

  private registerWorker(queueName: QueueName, processor: (job: Job) => Promise<void>): void {
    const worker = new Worker(queueName, processor, {
      connection: this.connection,
      concurrency: Number(this.configService.get<number>('QUEUE_CONCURRENCY') || 5),
      lockDuration: 60000,
    });

    worker.on('completed', (job) => {
      this.logger.log(`Queue job completed: ${queueName}:${job.id}`);
    });

    worker.on('failed', (job, error) => {
      this.logger.error(`Queue job failed: ${queueName}:${job?.id ?? 'unknown'}`, error.stack);
    });

    this.workers.set(queueName, worker);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled([...this.workers.values()].map((worker) => worker.close()));
    await Promise.allSettled([...this.queues.values()].map((queue) => queue.close()));
    if (this.connection) {
      await this.connection.quit();
    }
  }
}
