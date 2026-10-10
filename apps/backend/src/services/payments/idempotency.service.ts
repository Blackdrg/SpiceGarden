import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { IdempotencyEntity } from './idempotency.entity';

export interface IdempotencyOptions {
  headerName?: string;
}

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(
    @InjectRepository(IdempotencyEntity)
    private readonly idempotencyRepo: Repository<IdempotencyEntity>,
  ) {}

  async validateOrCreate(
    key: string,
    operation: string,
    userId: string | null,
    requestPayload: any
  ): Promise<{ isDuplicate: boolean; response?: any }> {
    if (!key) {
      return { isDuplicate: false };
    }

    const existing = await this.idempotencyRepo.findOne({
      where: { key, operation }
    });

    if (existing) {
      if (existing.isCompleted) {
        this.logger.warn(`Duplicate request detected for operation ${operation} with key ${key}`);
        return { isDuplicate: true, response: existing.responsePayload };
      }
      return { isDuplicate: true, response: existing.responsePayload };
    }

    try {
      const newKey = this.idempotencyRepo.create({
        key,
        operation,
        userId: userId || 'anonymous',
        requestPayload,
        isCompleted: false,
      });
      await this.idempotencyRepo.save(newKey);
      return { isDuplicate: false };
    } catch (err: any) {
      // If concurrent insert occurred on another pod (23505 unique violation)
      const duplicateRecord = await this.idempotencyRepo.findOne({
        where: { key, operation },
      });
      if (duplicateRecord) {
        this.logger.warn(`Concurrent duplicate request resolved for operation ${operation} with key ${key}`);
        return { isDuplicate: true, response: duplicateRecord.responsePayload };
      }
      throw err;
    }
  }

  async complete(
    key: string,
    operation: string,
    responsePayload: any,
    statusCode: number = 200
  ): Promise<void> {
    await this.idempotencyRepo.update(
      { key, operation },
      {
        responsePayload,
        statusCode,
        isCompleted: true,
        completedAt: new Date(),
      }
    );
  }

  async getRecentRequests(userId: string, operation: string, windowMs: number = 60000): Promise<number> {
    const since = new Date(Date.now() - windowMs);
    return this.idempotencyRepo.count({
      where: {
        userId,
        operation,
        createdAt: MoreThanOrEqual(since),
      }
    });
  }
}