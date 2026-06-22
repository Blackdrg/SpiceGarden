import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { RetryService } from '../src/services/payments/retry.service';

function createService() {
  const idempotencyRepo = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  } as any;
  const configService = {
    get: jest.fn((key: string, fallback: number) => {
      const map: Record<string, number> = {
        PAYMENT_RETRY_MAXATTEMPTS: 3,
        PAYMENT_RETRY_BASEDELAYMS: 100,
        PAYMENT_RETRY_MAXDELAYMS: 500,
        PAYMENT_RETRY_BACKOFFMULTIPLIER: 2,
        PAYMENT_RETRY_JITTERFACTOR: 0,
      };
      return map[key] ?? fallback;
    }),
  } as any;

  const service = new RetryService(configService, idempotencyRepo);
  return { service, configService, idempotencyRepo };
}

describe('RetryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns default config when no env overrides', () => {
    const count = jest.fn();
    const configService = {
      get: jest.fn((key: string, fallback: number) => fallback),
    } as any;
    const service = new RetryService(configService, count as any);
    expect(service.getConfig('maxAttempts')).toBe(5);
    expect(service.getConfig('baseDelayMs')).toBe(1000);
    expect(service.getConfig('maxDelayMs')).toBe(30000);
    expect(service.getConfig('backoffMultiplier')).toBe(2);
    expect(service.getConfig('jitterFactor')).toBe(0.1);
  });

  it('retries a retryable error and eventually succeeds', async () => {
    const { service } = createService();
    const operation = jest.fn() as any;
    operation.mockRejectedValueOnce(new Error('api_connection_error'));
    operation.mockRejectedValueOnce(new Error('api_timeout'));
    operation.mockResolvedValue('ok');

    const result = await service.executeWithRetry(operation, 'test-op');

    expect(result.success).toBe(true);
    expect(result.result).toBe('ok');
    expect(result.attempts).toBe(3);
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('gives up after max attempts and returns failure', async () => {
    const { service } = createService();
    const operation = jest.fn() as any;
    operation.mockRejectedValue(new Error('api_connection_error'));

    const result = await service.executeWithRetry(operation, 'test-op');

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3);
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-retryable errors', async () => {
    const { service } = createService();
    const operation = jest.fn() as any;
    operation.mockRejectedValue(new Error('card_declined'));

    const result = await service.executeWithRetry(operation, 'test-op');

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(1);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('identifies retryable error by type field', async () => {
    const { service } = createService();
    const err = new Error('network down') as Error & { type?: string };
    err.type = 'api_connection_error';
    const operation = jest.fn() as any;
    operation.mockRejectedValue(err);

    const result = await service.executeWithRetry(operation, 'type-test');

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3);
  });

  it('returns immediately on first success', async () => {
    const { service } = createService();
    const operation = jest.fn() as any;
    operation.mockResolvedValue('first-try');

    const result = await service.executeWithRetry(operation, 'fast-op');

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('includes context metadata in operation name', async () => {
    const { service } = createService();
    const operation = jest.fn() as any;
    operation.mockRejectedValue(new Error('temporary_failure'));

    const result = await service.executeWithRetry(operation, 'payment-retry', { userId: 'u1', orderId: 'o1' });

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3);
  });

  it('getRetryableFailedPayments builds correct query', async () => {
    const { service, idempotencyRepo } = createService();
    const mockQueryBuilder: any = {};
    mockQueryBuilder.where = jest.fn().mockReturnThis();
    mockQueryBuilder.andWhere = jest.fn().mockReturnThis();
    mockQueryBuilder.orderBy = jest.fn().mockReturnThis();
    mockQueryBuilder.limit = jest.fn().mockReturnThis();
    mockQueryBuilder.getMany = (jest.fn() as any).mockResolvedValue([]);
    idempotencyRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    await service.getRetryableFailedPayments();

    expect(idempotencyRepo.createQueryBuilder).toHaveBeenCalledWith('id');
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('id.operation = :op', { op: 'create_payment_intent' });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('id.isCompleted = :completed', { completed: false });
    expect(mockQueryBuilder.limit).toHaveBeenCalledWith(100);
  });

  it('cleanupStaleRetries returns affected count', async () => {
    const { service, idempotencyRepo } = createService();
    const mockQueryBuilder: any = {};
    mockQueryBuilder.delete = jest.fn().mockReturnThis();
    mockQueryBuilder.where = jest.fn().mockReturnThis();
    mockQueryBuilder.andWhere = jest.fn().mockReturnThis();
    mockQueryBuilder.execute = (jest.fn() as any).mockResolvedValue({ affected: 5 });
    idempotencyRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const count = await service.cleanupStaleRetries();

    expect(count).toBe(5);
    expect(mockQueryBuilder.delete).toHaveBeenCalled();
  });

  it('getRetryStats aggregates counts correctly', async () => {
    const { service, idempotencyRepo } = createService();
    idempotencyRepo.count.mockResolvedValueOnce(10);
    idempotencyRepo.count.mockResolvedValueOnce(2);
    idempotencyRepo.count.mockResolvedValueOnce(0);
    const mockQb: any = {};
    mockQb.where = jest.fn().mockReturnThis();
    mockQb.andWhere = jest.fn().mockReturnThis();
    mockQb.getCount = (jest.fn() as any).mockResolvedValue(3);
    idempotencyRepo.createQueryBuilder.mockReturnValue(mockQb);

    const stats = await service.getRetryStats();

    expect(stats.pendingRetries).toBe(10);
    expect(stats.completedRetries).toBe(3);
    expect(stats.failedRetries).toBe(3);
    expect(stats.retryAttemptsLastHour).toBe(2);
  });
});
