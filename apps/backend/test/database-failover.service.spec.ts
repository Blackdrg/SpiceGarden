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
