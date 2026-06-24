import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyService } from '../src/services/payments/idempotency.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyEntity } from '../src/services/payments/idempotency.entity';

describe('IdempotencyService', () => {
  let service: IdempotencyService;

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyService,
        { provide: getRepositoryToken(IdempotencyEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(IdempotencyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateOrCreate', () => {
    it('should return not-duplicate for empty key', async () => {
      const result = await service.validateOrCreate('', 'op', 'user-1', {});
      expect(result.isDuplicate).toBe(false);
      expect(result.response).toBeUndefined();
    });

    it('should return existing response for completed request', async () => {
      mockRepo.findOne.mockResolvedValue({
        isCompleted: true,
        responsePayload: { orderId: 'order-1' },
      });
      const result = await service.validateOrCreate('key-1', 'place_order', 'user-1', {});
      expect(result.isDuplicate).toBe(true);
      expect(result.response).toEqual({ orderId: 'order-1' });
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { key: 'key-1', operation: 'place_order' } });
    });

    it('should create idempotency record for new key', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({ key: 'k', operation: 'op', isCompleted: false });
      mockRepo.save.mockImplementation((entity: any) => Promise.resolve(entity));

      const result = await service.validateOrCreate('k', 'op', 'user-1', { foo: 'bar' });
      expect(result.isDuplicate).toBe(false);
      expect(mockRepo.create).toHaveBeenCalledWith({
        key: 'k',
        operation: 'op',
        userId: 'user-1',
        requestPayload: { foo: 'bar' },
        isCompleted: false,
      });
    });

    it('should use anonymous userId when null provided', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({ key: 'k', operation: 'op', isCompleted: false });
      mockRepo.save.mockImplementation((entity: any) => Promise.resolve(entity));

      await service.validateOrCreate('k', 'op', null, {});
      expect(mockRepo.create).toHaveBeenCalledWith({
        key: 'k',
        operation: 'op',
        userId: 'anonymous',
        requestPayload: {},
        isCompleted: false,
      });
    });
  });

  describe('complete', () => {
    it('should mark request as completed with response', async () => {
      mockRepo.update.mockResolvedValue({} as any);
      await service.complete('key-1', 'op', { orderId: 'ord-1' }, 200);
      expect(mockRepo.update).toHaveBeenCalledWith(
        { key: 'key-1', operation: 'op' },
        expect.objectContaining({
          responsePayload: { orderId: 'ord-1' },
          statusCode: 200,
          isCompleted: true,
        }),
      );
    });

    it('should default to statusCode 200', async () => {
      mockRepo.update.mockResolvedValue({} as any);
      await service.complete('key-1', 'op', { ok: true });
      const callArgs = (mockRepo.update as jest.Mock).mock.calls[0][1];
      expect(callArgs.statusCode).toBe(200);
    });
  });

  describe('getRecentRequests', () => {
    it('should count recent requests', async () => {
      mockRepo.count.mockResolvedValue(3);
      const count = await service.getRecentRequests('user-1', 'place_order', 120000);
      expect(count).toBe(3);
      expect(mockRepo.count.mock.calls[0][0]).toMatchObject({
        where: {
          userId: 'user-1',
          operation: 'place_order',
        },
      });
    });

    it('should return 0 when no recent requests', async () => {
      mockRepo.count.mockResolvedValue(0);
      const count = await service.getRecentRequests('user-1', 'place_order', 0);
      expect(count).toBe(0);
    });
  });
});
