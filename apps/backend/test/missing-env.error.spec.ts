import { describe, expect, it } from '@jest/globals';
import { MissingEnvError, isPlaceholderValue, getRequiredSecret, requireSecrets, requireEnv, requireOneOf } from '../src/common/errors/missing-env.error';

describe('MissingEnvError', () => {
  it('creates error without hint', () => {
    const err = new MissingEnvError('API_KEY');
    expect(err.key).toBe('API_KEY');
    expect(err.hint).toBeUndefined();
    expect(err.message).toBe('Required environment variable "API_KEY" is missing');
    expect(err.name).toBe('MissingEnvError');
  });

  it('creates error with hint', () => {
    const err = new MissingEnvError('DB_URL', 'Add connection string to .env');
    expect(err.key).toBe('DB_URL');
    expect(err.hint).toBe('Add connection string to .env');
    expect(err.message).toBe('Required environment variable "DB_URL" is missing — Add connection string to .env');
  });
});

describe('isPlaceholderValue', () => {
  it('returns true for undefined', () => {
    expect(isPlaceholderValue(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isPlaceholderValue('')).toBe(true);
  });

  it('returns true for whitespace only', () => {
    expect(isPlaceholderValue('   ')).toBe(true);
  });

  it('returns true for CHANGE_ME', () => {
    expect(isPlaceholderValue('CHANGE_ME')).toBe(true);
  });

  it('returns true for sk_test_placeholder', () => {
    expect(isPlaceholderValue('sk_test_placeholder')).toBe(true);
  });

  it('returns true for rzp_test_placeholder', () => {
    expect(isPlaceholderValue('rzp_test_placeholder')).toBe(true);
  });

  it('returns true for whsec_test_placeholder', () => {
    expect(isPlaceholderValue('whsec_test_placeholder')).toBe(true);
  });

  it('returns true for test_placeholder', () => {
    expect(isPlaceholderValue('test_placeholder')).toBe(true);
  });

  it('returns true for <fill', () => {
    expect(isPlaceholderValue('<fill me in>')).toBe(true);
  });

  it('returns true for <must replace', () => {
    expect(isPlaceholderValue('<must replace>')).toBe(true);
  });

  it('returns true for placeholder (case-insensitive)', () => {
    expect(isPlaceholderValue('PLACEHOLDER')).toBe(true);
  });

  it('returns true for secret_here (case-insensitive)', () => {
    expect(isPlaceholderValue('SECRET_HERE')).toBe(true);
  });

  it('returns true for mixed case marker', () => {
    expect(isPlaceholderValue('Change_Me')).toBe(true);
  });

  it('returns true for strings containing test_placeholder substring', () => {
    expect(isPlaceholderValue('some_value_test_placeholder_more')).toBe(true);
  });

  it('returns false for real values', () => {
    expect(isPlaceholderValue('sk_live_abc123')).toBe(false);
    expect(isPlaceholderValue('postgres://user:pass@host:5432/db')).toBe(false);
  });

  it('returns false for numeric strings', () => {
    expect(isPlaceholderValue('12345')).toBe(false);
  });
});

describe('getRequiredSecret', () => {
  const mockConfig = {
    get: jest.fn(),
  } as any;

  it('returns valid non-placeholder value', () => {
    mockConfig.get.mockReturnValue('sk_live_abc123');
    expect(getRequiredSecret(mockConfig, 'STRIPE_KEY')).toBe('sk_live_abc123');
  });

  it('throws MissingEnvError for placeholder value', () => {
    mockConfig.get.mockReturnValue('sk_test_placeholder');
    expect(() => getRequiredSecret(mockConfig, 'STRIPE_KEY')).toThrow('Required environment variable "STRIPE_KEY" is missing');
    expect(() => getRequiredSecret(mockConfig, 'STRIPE_KEY')).toThrow('Set a real, non-placeholder value before starting the server.');
  });

  it('throws MissingEnvError for undefined value', () => {
    mockConfig.get.mockReturnValue(undefined);
    expect(() => getRequiredSecret(mockConfig, 'STRIPE_KEY')).toThrow('Required environment variable "STRIPE_KEY" is missing');
  });
});

describe('requireSecrets', () => {
  const mockConfig = {
    get: jest.fn(),
  } as any;

  it('passes when all secrets are valid', () => {
    mockConfig.get.mockReturnValue('real_value');
    expect(() => requireSecrets(['KEY1', 'KEY2'], mockConfig)).not.toThrow();
  });

  it('throws on first invalid secret', () => {
    mockConfig.get.mockReturnValue('placeholder');
    expect(() => requireSecrets(['KEY1', 'KEY2'], mockConfig)).toThrow('Required environment variable "KEY1" is missing');
  });
});

describe('requireEnv', () => {
  const mockConfig = {
    get: jest.fn(),
  } as any;

  it('passes when all env vars are set', () => {
    mockConfig.get.mockReturnValue('some_value');
    expect(() => requireEnv(['PORT', 'HOST'], mockConfig)).not.toThrow();
  });

  it('throws MissingEnvError for missing value', () => {
    mockConfig.get.mockReturnValue(undefined);
    expect(() => requireEnv(['PORT'], mockConfig)).toThrow('Required environment variable "PORT" is missing');
  });

  it('throws MissingEnvError for empty string', () => {
    mockConfig.get.mockReturnValue('');
    expect(() => requireEnv(['PORT'], mockConfig)).toThrow('Required environment variable "PORT" is missing');
  });

  it('throws MissingEnvError for whitespace-only string', () => {
    mockConfig.get.mockReturnValue('   ');
    expect(() => requireEnv(['PORT'], mockConfig)).toThrow('Required environment variable "PORT" is missing');
  });
});

describe('requireOneOf', () => {
  const mockConfig = {
    get: jest.fn(),
  } as any;

  it('returns first valid value', () => {
    mockConfig.get.mockReturnValue('real_value');
    expect(requireOneOf(['KEY1', 'KEY2'], mockConfig)).toBe('real_value');
  });

  it('falls back to second valid value', () => {
    mockConfig.get.mockImplementation((key: string) => {
      if (key === 'KEY1') return undefined;
      return 'real_value_key2';
    });
    expect(requireOneOf(['KEY1', 'KEY2'], mockConfig)).toBe('real_value_key2');
  });

  it('throws when no valid values found', () => {
    mockConfig.get.mockReturnValue(undefined);
    expect(() => requireOneOf(['KEY1', 'KEY2'], mockConfig)).toThrow('KEY1 or KEY2');
  });

  it('skips placeholder values', () => {
    mockConfig.get.mockImplementation((key: string) => {
      if (key === 'KEY1') return 'sk_test_placeholder';
      if (key === 'KEY2') return 'sk_live_abc123';
      return undefined;
    });
    expect(requireOneOf(['KEY1', 'KEY2'], mockConfig)).toBe('sk_live_abc123');
  });

  it('throws when all values are placeholders', () => {
    mockConfig.get.mockImplementation((key: string) => {
      if (key === 'KEY1') return 'sk_test_placeholder';
      if (key === 'KEY2') return 'placeholder';
      return undefined;
    });
    expect(() => requireOneOf(['KEY1', 'KEY2'], mockConfig)).toThrow('KEY1 or KEY2');
  });

  it('skips empty strings', () => {
    mockConfig.get.mockImplementation((key: string) => {
      if (key === 'KEY1') return '';
      if (key === 'KEY2') return 'real_value';
      return undefined;
    });
    expect(requireOneOf(['KEY1', 'KEY2'], mockConfig)).toBe('real_value');
  });
});
