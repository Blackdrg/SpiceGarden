import { LoggingService, sanitizeForLog, sanitizeErrorMessage } from '../src/logging/logging.service';

describe('logging.service', () => {
  const spies: jest.SpyInstance[] = [];

  beforeEach(() => {
    spies.push(jest.spyOn(console, 'log').mockImplementation(() => undefined));
    spies.push(jest.spyOn(console, 'error').mockImplementation(() => undefined));
    spies.push(jest.spyOn(console, 'warn').mockImplementation(() => undefined));
    spies.push(jest.spyOn(console, 'debug').mockImplementation(() => undefined));
  });
  afterEach(() => spies.forEach((s) => s.mockRestore()));

  it('sanitizeForLog returns primitives and null unchanged', () => {
    expect(sanitizeForLog(null)).toBeNull();
    expect(sanitizeForLog(5)).toBe(5);
    expect(sanitizeForLog('x')).toBe('x');
  });

  it('sanitizeForLog redacts sensitive keys and recurses into objects', () => {
    const input = {
      name: 'bob',
      password: 'secret',
      nested: { apiKey: 'k', note: 'ok' },
      list: [{ token: 't' }],
    };
    const out = sanitizeForLog(input);
    expect(out.password).toBe('[REDACTED]');
    expect(out.name).toBe('bob');
    expect(out.nested.apiKey).toBe('[REDACTED]');
    expect(out.nested.note).toBe('ok');
    expect(out.list[0].token).toBe('[REDACTED]');
  });

  it('sanitizeErrorMessage returns message and stack for Error', () => {
    const err = new Error('boom');
    const result = sanitizeErrorMessage(err);
    expect(result.message).toBe('boom');
    expect(typeof result.stack).toBe('string');
  });

  it('sanitizeErrorMessage stringifies non-Error values', () => {
    expect(sanitizeErrorMessage('plain')).toEqual({ message: 'plain' });
  });

  it('LoggingService uses provided context over default', () => {
    const ls = new LoggingService('Default');
    ls.log('hi');
    ls.log('hi', 'Override');
    expect(console.log).toHaveBeenNthCalledWith(1, expect.stringContaining('[Default]'));
    expect(console.log).toHaveBeenNthCalledWith(2, expect.stringContaining('[Override]'));
  });

  it('LoggingService warn/debug/verbose/error/secureError emit with context', () => {
    const ls = new LoggingService('Ctx');
    ls.warn('w');
    ls.debug('d');
    ls.verbose('v');
    ls.error('e', 'trace');
    ls.secureError('sec', new Error('inner'));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('[Ctx]'));
    expect(console.debug).toHaveBeenCalledWith(expect.stringContaining('[Ctx]'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[Ctx]'));
    expect(console.error).toHaveBeenCalledTimes(2);
  });
});
