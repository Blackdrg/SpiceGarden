import { describe, expect, it, beforeEach } from '@jest/globals';
import { LoggingService, sanitizeForLog, sanitizeErrorMessage } from '../src/logging/logging.service';

describe('sanitizeForLog', () => {
  it('returns primitives unchanged', () => {
    expect(sanitizeForLog(null)).toBeNull();
    expect(sanitizeForLog(undefined)).toBeUndefined();
    expect(sanitizeForLog('hello')).toBe('hello');
    expect(sanitizeForLog(42)).toBe(42);
  });

  it('redacts sensitive keys', () => {
    const result = sanitizeForLog({ password: 'secret', name: 'ok', token: 'abc', apiKey: 'xyz' });
    expect(result).toEqual({ password: '[REDACTED]', name: 'ok', token: '[REDACTED]', apiKey: '[REDACTED]' });
  });

  it('redacts case-insensitively', () => {
    const result = sanitizeForLog({ PASSWORD: 'secret', AccessToken: 'abc' });
    expect(result).toEqual({ PASSWORD: '[REDACTED]', AccessToken: '[REDACTED]' });
  });

  it('redacts nested sensitive keys', () => {
    const result = sanitizeForLog({ user: { password: 'secret', name: 'ok' }, nested: { creditCard: '1234' } });
    expect(result).toEqual({
      user: { password: '[REDACTED]', name: 'ok' },
      nested: { creditCard: '[REDACTED]' },
    });
  });

  it('redacts sensitive keys in arrays', () => {
    const result = sanitizeForLog([{ secret: 'a' }, { cvv: '123' }]);
    expect(result).toEqual([{ secret: '[REDACTED]' }, { cvv: '[REDACTED]' }]);
  });
});

describe('sanitizeErrorMessage', () => {
  it('extracts message and stack from Error', () => {
    const error = new Error('something failed');
    error.stack = 'Error: something failed\n    at test';
    const result = sanitizeErrorMessage(error);
    expect(result.message).toBe('something failed');
    expect(result.stack).toBe('Error: something failed\n    at test');
  });

  it('converts non-Error to string', () => {
    expect(sanitizeErrorMessage('string error')).toEqual({ message: 'string error' });
    expect(sanitizeErrorMessage(123)).toEqual({ message: '123' });
    expect(sanitizeErrorMessage(null)).toEqual({ message: 'null' });
  });
});

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    service = new LoggingService('TestContext');
  });

  it('logs with default context', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    service.log('test message');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[LOG\] \[TestContext\] test message/));
    consoleSpy.mockRestore();
  });

  it('logs with overridden context', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    service.log('test message', 'CustomContext');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[LOG\] \[CustomContext\] test message/));
    consoleSpy.mockRestore();
  });

  it('errors with trace and context', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    service.error('err msg', 'stack trace', 'ErrContext');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[ERROR\] \[ErrContext\] err msg/), 'stack trace');
    consoleSpy.mockRestore();
  });

  it('warns with context', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    service.warn('warn msg', 'WarnContext');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[WARN\] \[WarnContext\] warn msg/));
    consoleSpy.mockRestore();
  });

  it('debugs with context', () => {
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
    service.debug('debug msg', 'DbgContext');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[DEBUG\] \[DbgContext\] debug msg/));
    consoleSpy.mockRestore();
  });

  it('verbose logs with context', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    service.verbose('verbose msg', 'VerboseContext');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[VERBOSE\] \[VerboseContext\] verbose msg/));
    consoleSpy.mockRestore();
  });

  it('secureError outputs sanitized message', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('db connection failed');
    service.secureError('operation failed', error, 'AppContext');
    const call = consoleSpy.mock.calls[0];
    expect(call[0]).toContain('[SECURE-ERROR]');
    expect(call[0]).toContain('operation failed');
    expect(call[0]).toContain('[AppContext]');
    expect(call[1]).toBe('db connection failed');
    consoleSpy.mockRestore();
  });
});
