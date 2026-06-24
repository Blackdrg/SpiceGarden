import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { VaultService } from '../src/security/vault.service';
import { ConfigService } from '@nestjs/config';

describe('VaultService', () => {
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((_key: string, defaultValue?: any) => defaultValue),
    } as unknown as ConfigService;
  });

  describe('getSecret', () => {
    it('should return fallback when vault disabled', async () => {
      const service = new VaultService(mockConfigService);
      const result = await service.getSecret('JWT_SECRET', 'fallback-value');
      expect(result).toBe('fallback-value');
    });

    it('should return cached value when available', async () => {
      const service = new VaultService(mockConfigService as any);
      (service as any).vaultEnabled = true;
      (service as any).cache.set('cached-key', { value: 'cached-value', timestamp: Date.now() });

      const result = await service.getSecret('cached-key', 'fallback-value');
      expect(result).toBe('cached-value');
    });

    it('should return fallback for missing cache key', async () => {
      const service = new VaultService(mockConfigService as any);
      (service as any).vaultEnabled = true;

      const result = await service.getSecret('missing-key', 'fallback-value');
      expect(result).toBe('fallback-value');
    });

    it('should return undefined for missing key without fallback', async () => {
      const service = new VaultService(mockConfigService as any);
      (service as any).vaultEnabled = true;

      const result = await service.getSecret<string | undefined>('missing-key');
      expect(result).toBeUndefined();
    });
  });

  describe('auditSecrets', () => {
    it('should identify missing and valid secrets', async () => {
      const service = new VaultService(mockConfigService as any);
      (service as any).vaultEnabled = false;

      const result = await service.auditSecrets();

      expect(result.missing.length).toBeGreaterThan(0);
      expect(result.valid).toEqual([]);
    });

    it('should validate process env fallback values', async () => {
      process.env.JWT_SECRET = 'valid-secret-key-at-least-32-chars-long';
      process.env.ENCRYPTION_SECRET = 'valid-encryption-key-32-characters';
      process.env.STRIPE_SECRET_KEY = 'sk_live_valid_stripe_key';
      process.env.RAZORPAY_KEY_SECRET = '';
      process.env.STRIPE_WEBHOOK_SECRET = '';
      process.env.RAZORPAY_WEBHOOK_SECRET = '';
      
      const service = new VaultService(mockConfigService as any);
      (service as any).vaultEnabled = false;

      const result = await service.auditSecrets();

      expect(result.valid).toContain('JWT_SECRET');

      delete process.env.JWT_SECRET;
      delete process.env.ENCRYPTION_SECRET;
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.RAZORPAY_KEY_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.RAZORPAY_WEBHOOK_SECRET;
    });

    it('should reject placeholder values', async () => {
      process.env.JWT_SECRET = 'CHANGE_ME';
      delete process.env.ENCRYPTION_SECRET;
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.RAZORPAY_KEY_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.RAZORPAY_WEBHOOK_SECRET;

      const service = new VaultService(mockConfigService as any);
      (service as any).vaultEnabled = false;

      const result = await service.auditSecrets();
      expect(result.missing).toContain('JWT_SECRET');

      delete process.env.JWT_SECRET;
    });
  });

  describe('isVaultConfigured', () => {
    it('should return false when vault disabled', () => {
      const service = new VaultService(mockConfigService);
      expect(service.isVaultConfigured()).toBe(false);
    });

    it('should return false when vault token missing', () => {
      const service = new VaultService(mockConfigService as any);
      (service as any).vaultEnabled = true;
      (service as any).vaultToken = '';
      expect(service.isVaultConfigured()).toBe(false);
    });

    it('should return true when vault enabled with token', () => {
      const service = new VaultService(mockConfigService as any);
      (service as any).vaultEnabled = true;
      (service as any).vaultToken = 'valid-token';
      expect(service.isVaultConfigured()).toBe(true);
    });
  });
});