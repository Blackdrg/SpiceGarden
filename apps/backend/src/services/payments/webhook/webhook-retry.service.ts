import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, In } from 'typeorm';
import { WebhookRetryQueueEntity } from '../../../db/entities/webhook-retry-queue.entity';
import { randomFloat } from '../../../shared/random.utils';

export interface WebhookRetryJob {
  webhookId: string;
  gateway: string;
  eventType: string;
  payload: Record<string, any>;
  attempt: number;
  maxAttempts: number;
}

@Injectable()
export class WebhookRetryService {
  private readonly logger = new Logger(WebhookRetryService.name);

  constructor(
    @InjectRepository(WebhookRetryQueueEntity)
    private readonly retryRepo: Repository<WebhookRetryQueueEntity>,
  ) {}

  async enqueueWebhook(
    webhookId: string,
    gateway: string,
    eventType: string,
    payload: Record<string, any>,
    maxAttempts: number = 5,
  ): Promise<WebhookRetryQueueEntity> {
    const job = this.retryRepo.create({
      webhookId,
      gateway,
      eventType,
      payload,
      attempt: 0,
      maxAttempts,
      status: 'pending',
      scheduledAt: new Date(),
    });
    return await this.retryRepo.save(job);
  }

  async getNextJob(): Promise<WebhookRetryJob | null> {
    const now = new Date();
    const job = await this.retryRepo.findOne({
      where: {
        status: 'pending',
        scheduledAt: LessThan(now),
      },
      order: { scheduledAt: 'ASC' },
    });

    if (!job) return null;

    await this.retryRepo.update(job.id, { status: 'processing' });
    return {
      webhookId: job.webhookId,
      gateway: job.gateway,
      eventType: job.eventType,
      payload: job.payload,
      attempt: job.attempt + 1,
      maxAttempts: job.maxAttempts,
    };
  }

  async success(jobId: string): Promise<void> {
    await this.retryRepo.update(jobId, { status: 'succeeded', processedAt: new Date() });
  }

  async fail(jobId: string, error: string): Promise<void> {
    const job = await this.retryRepo.findOne({ where: { id: jobId } });
    if (!job) return;

    const nextAttempt = job.attempt + 1;
    const delay = this.calculateDelay(nextAttempt);

    if (nextAttempt >= job.maxAttempts) {
      await this.retryRepo.update(jobId, {
        status: 'discarded',
        lastError: error,
        processedAt: new Date(),
      });
      this.logger.error(`Webhook ${job.webhookId} discarded after ${job.maxAttempts} attempts: ${error}`);
    } else {
      const nextScheduled = new Date(Date.now() + delay);
      await this.retryRepo.update(jobId, {
        status: 'pending',
        attempt: nextAttempt,
        scheduledAt: nextScheduled,
        lastError: error,
      });
      this.logger.warn(`Webhook ${job.webhookId} retry scheduled for attempt ${nextAttempt}/${job.maxAttempts}`);
    }
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = 60000;
    const delay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = delay * 0.1 * randomFloat(1);
    return Math.min(delay + jitter, 1800000);
  }

  async getStats(): Promise<any> {
    const [pending, processing, succeeded, failed, discarded] = await Promise.all([
      this.retryRepo.count({ where: { status: 'pending' } }),
      this.retryRepo.count({ where: { status: 'processing' } }),
      this.retryRepo.count({ where: { status: 'succeeded' } }),
      this.retryRepo.count({
        where: {
          status: In(['pending', 'processing']),
          attempt: MoreThan(0),
        }
      }),
      this.retryRepo.count({ where: { status: 'discarded' } }),
    ]);

    return {
      pending,
      processing,
      succeeded,
      retrying: failed,
      discarded,
    };
  }

  async processRetryQueue(): Promise<void> {
    const maxBatchSize = 50;
    let processed = 0;

    while (processed < maxBatchSize) {
      const job = await this.getNextJob();
      if (!job) break;

      this.logger.log(`Processing webhook retry ${job.webhookId} (attempt ${job.attempt}/${job.maxAttempts})`);

      try {
        await this.processWebhookRetry(job);
        await this.success(job.webhookId);
        this.logger.log(`Webhook retry ${job.webhookId} succeeded on attempt ${job.attempt}`);
      } catch (error) {
        const errorMessage = (error as Error).message || 'Unknown processing error';
        this.logger.error(`Webhook retry ${job.webhookId} failed: ${errorMessage}`);
        await this.fail(job.webhookId, errorMessage);
      }

      processed++;
    }

    if (processed > 0) {
      this.logger.log(`Processed ${processed} webhook retry jobs`);
    }
  }

  private async processWebhookRetry(job: WebhookRetryJob): Promise<void> {
    const { gateway, eventType, payload } = job;

    switch (gateway) {
      case 'stripe':
        await this.handleStripeRetry(eventType, payload);
        break;
      case 'razorpay':
        await this.handleRazorpayRetry(eventType, payload);
        break;
      default:
        this.logger.warn(`Unknown gateway for retry: ${gateway}`);
        break;
    }
  }

  private async handleStripeRetry(eventType: string, payload: Record<string, any>): Promise<void> {
    this.logger.debug(`Processing Stripe webhook retry: ${eventType}`);
    if (eventType === 'payment_intent.succeeded') {
      const paymentIntentId = payload.data?.object?.id;
      if (paymentIntentId) {
        this.logger.log(`Stripe retry: confirming payment intent ${paymentIntentId}`);
      }
    } else if (eventType === 'charge.refunded') {
      const chargeId = payload.data?.object?.id;
      if (chargeId) {
        this.logger.log(`Stripe retry: processing refund for charge ${chargeId}`);
      }
    }
  }

  private async handleRazorpayRetry(eventType: string, payload: Record<string, any>): Promise<void> {
    this.logger.debug(`Processing Razorpay webhook retry: ${eventType}`);
    if (eventType === 'payment.authorized') {
      const paymentId = payload.payload?.payment?.entity?.id;
      if (paymentId) {
        this.logger.log(`Razorpay retry: authorizing payment ${paymentId}`);
      }
    } else if (eventType === 'payment.captured') {
      const paymentId = payload.payload?.payment?.entity?.id;
      if (paymentId) {
        this.logger.log(`Razorpay retry: confirming capture for payment ${paymentId}`);
      }
    }
  }
}
