import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseFailoverService } from '../src/db/database-failover.service';
import { DataSource } from 'typeorm';

describe('DatabaseFailoverService', () => {
  let service: DatabaseFailoverService;

  const mockDataSource = {
    query: jest.fn(),
    isInitialized: true,
    initialize: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseFailoverService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get(DatabaseFailoverService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    mockDataSource.isInitialized = true;
    mockDataSource.query.mockReset();
    mockDataSource.query.mockResolvedValue(1);
    mockDataSource.initialize.mockReset();
  });

  describe('getState', () => {
    it('should return initial state', () => {
      const state = service.getState();
      expect(state.isPrimaryDown).toBe(false);
      expect(state.degradedMode).toBe(false);
      expect(state.reconnectionAttempts).toBe(0);
      expect(state.lastSuccessfulConnection).toBeInstanceOf(Date);
    });

    it('should return a copy, not the internal state', () => {
      const state1 = service.getState();
      const state2 = service.getState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('isDegraded', () => {
    it('should return false initially', () => {
      expect(service.isDegraded()).toBe(false);
    });
  });

  describe('getFailoverDuration', () => {
    it('should return null when no failover started', () => {
      expect(service.getFailoverDuration()).toBeNull();
    });

    it('should return duration when failover is active', async () => {
      mockDataSource.query.mockRejectedValue(new Error('connection failed'));
      await service.performHealthCheck();
      const duration = service.getFailoverDuration();
      expect(duration).not.toBeNull();
      expect(typeof duration).toBe('number');
    });
  });

  describe('onModuleInit and onModuleDestroy', () => {
    it('should start health check on init and stop on destroy', async () => {
      const clearSpy = jest.spyOn(global, 'clearInterval');
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation((cb: any) => 123 as any);
      
      await service.onModuleInit();
      await service.onModuleDestroy();
      
      expect(setIntervalSpy).toHaveBeenCalled();
      expect(clearSpy).toHaveBeenCalledWith(123);
      
      setIntervalSpy.mockRestore();
      clearSpy.mockRestore();
    });
  });

  describe('performHealthCheck - degraded mode transitions', () => {
    it('should enter degraded mode when latency is high and primary is down', async () => {
      // First call rejects (simulate primary down), second resolves after delay
      mockDataSource.query
        .mockImplementationOnce(async () => { throw new Error('down'); })
        .mockImplementationOnce(async () => {
          await new Promise((resolve) => setTimeout(resolve, 1100));
          return 1;
        });
      
      await service.performHealthCheck();
      const result = await service.performHealthCheck();
      
      expect(result.healthy).toBe(true);
      expect(result.degraded).toBe(true);
    });

    it('should exit degraded mode when latency is low and primary was down', async () => {
      mockDataSource.query.mockRejectedValue(new Error('down'));
      await service.performHealthCheck();
      expect(service.isDegraded()).toBe(false);
      
      mockDataSource.query.mockResolvedValue(1);
      await service.performHealthCheck();
      expect(service.isDegraded()).toBe(false);
    });
  });

  describe('attemptReconnection - uninitialized datasource', () => {
    it('should initialize datasource before reconnecting when not initialized', async () => {
      mockDataSource.isInitialized = false;
      mockDataSource.initialize.mockResolvedValue(undefined);
      mockDataSource.query.mockResolvedValue(1);
      
      const result = await service.attemptReconnection();
      
      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('exitDegradedMode', () => {
    it('should reset state to healthy', async () => {
      mockDataSource.query.mockRejectedValue(new Error('down'));
      for (let i = 0; i < 10; i++) {
        await service.performHealthCheck();
      }
      expect(service.isDegraded()).toBe(true);
      
      mockDataSource.query.mockResolvedValue(1);
      await service.attemptReconnection();
      
      expect(service.getState().isPrimaryDown).toBe(false);
      expect(service.getState().degradedMode).toBe(false);
      expect(service.getState().reconnectionAttempts).toBe(0);
    });
  });

  describe('executeWithFallback', () => {
    it('should execute primary query when not degraded', async () => {
      const primary = jest.fn().mockResolvedValue('primary-result');
      const fallback = jest.fn().mockResolvedValue('fallback-result');
      const result = await service.executeWithFallback(primary, fallback);
      expect(result).toBe('primary-result');
      expect(primary).toHaveBeenCalled();
      expect(fallback).not.toHaveBeenCalled();
    });

    it('should execute fallback when degraded', async () => {
      const primary = jest.fn().mockRejectedValue(new Error('primary down'));
      const fallback = jest.fn().mockResolvedValue('fallback-result');
      mockDataSource.query.mockRejectedValue(new Error('connection failed'));
      for (let i = 0; i < 10; i++) {
        await service.performHealthCheck();
      }
      const result = await service.executeWithFallback(primary, fallback);
      expect(result).toBe('fallback-result');
      expect(fallback).toHaveBeenCalled();
    });

    it('should throw when both primary and fallback fail in degraded mode', async () => {
      const primary = jest.fn().mockRejectedValue(new Error('primary down'));
      const fallback = jest.fn().mockRejectedValue(new Error('fallback down'));
      mockDataSource.query.mockRejectedValue(new Error('connection failed'));
      for (let i = 0; i < 10; i++) {
        await service.performHealthCheck();
      }
      await expect(service.executeWithFallback(primary, fallback)).rejects.toThrow('Both primary and fallback queries failed');
    });

    it('should throw primary error when not degraded and max retries not reached', async () => {
      const primary = jest.fn().mockRejectedValue(new Error('primary error'));
      const fallback = jest.fn().mockResolvedValue('fallback-result');

      await expect(service.executeWithFallback(primary, fallback)).rejects.toThrow('primary error');
      expect(fallback).not.toHaveBeenCalled();
    });
  });

  describe('performHealthCheck', () => {
    it('should return healthy when query succeeds', async () => {
      mockDataSource.query.mockResolvedValue(1);
      const result = await service.performHealthCheck();
      expect(result.healthy).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should return unhealthy and mark degraded after max retries', async () => {
      mockDataSource.query.mockRejectedValue(new Error('connection failed'));
      for (let i = 0; i < 10; i++) {
        await service.performHealthCheck();
      }
      expect(service.isDegraded()).toBe(true);
    });
  });

  describe('attemptReconnection', () => {
    it('should return false when connection fails', async () => {
      mockDataSource.query.mockRejectedValue(new Error('still down'));
      (mockDataSource.initialize as jest.Mock).mockRejectedValue(new Error('init failed'));
      const result = await service.attemptReconnection();
      expect(result).toBe(false);
    });

    it('should return true when reconnection succeeds', async () => {
      mockDataSource.query.mockResolvedValue(1);
      const result = await service.attemptReconnection();
      expect(result).toBe(true);
    });
  });
});
