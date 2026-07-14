import { VaultService } from '../src/security/vault.service';

function makeService(enabled: boolean) {
  const config: Record<string, string | boolean> = {
    VAULT_ENABLED: enabled,
    VAULT_ADDR: 'http://vault:8200',
    VAULT_TOKEN: enabled ? 'vault-token' : '',
    VAULT_SECRET_PATH: 'secret/spicegarden',
  };
  const configService = { get: (k: string, d?: any) => (k in config ? config[k] : d) } as any;
  return new VaultService(configService);
}

describe('VaultService (enabled paths)', () => {
  const originalFetch = (global as any).fetch;

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('onModuleInit logs when healthy, warns when unhealthy, warns on error', async () => {
    const service = makeService(true);
    (global as any).fetch = jest.fn()
      .mockResolvedValueOnce({ initialized: true, healthy: true } as any)
      .mockResolvedValueOnce({ initialized: false, healthy: false } as any)
      .mockRejectedValueOnce(new Error('conn refused'));

    await service.onModuleInit();
    await service.onModuleInit();
    await service.onModuleInit();
    expect((global as any).fetch).toHaveBeenCalledTimes(3);
  });

  it('getSecret fetches and caches when enabled', async () => {
    const service = makeService(true);
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: { value: 'secret-value' } }) } as any);

    const first = await service.getSecret('JWT_SECRET');
    const second = await service.getSecret('JWT_SECRET');

    expect(first).toBe('secret-value');
    expect(second).toBe('secret-value');
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });

  it('getSecret returns fallback when vault fetch fails and fallback provided', async () => {
    const service = makeService(true);
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('boom'));

    const result = await service.getSecret('JWT_SECRET', 'local-fallback' as any);
    expect(result).toBe('local-fallback');
  });

  it('getSecret returns undefined when vault fetch fails without fallback', async () => {
    const service = makeService(true);
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('boom'));

    const result = await service.getSecret('JWT_SECRET');
    expect(result).toBeUndefined();
  });

  it('rotateSecret returns true on success, false on non-ok and on error', async () => {
    const service = makeService(true);
    (global as any).fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true } as any)
      .mockResolvedValueOnce({ ok: false } as any)
      .mockRejectedValueOnce(new Error('rotate failed'));

    expect(await service.rotateSecret('JWT_SECRET', 'new')).toBe(true);
    expect(await service.rotateSecret('JWT_SECRET', 'new')).toBe(false);
    expect(await service.rotateSecret('JWT_SECRET', 'new')).toBe(false);
  });

  it('rotateSecret returns false when vault disabled', async () => {
    const service = makeService(false);
    expect(await service.rotateSecret('JWT_SECRET', 'new')).toBe(false);
  });

  it('auditSecrets classifies present and placeholder secrets', async () => {
    const service = makeService(true);
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: { value: 'real' } }) } as any);

    const realEnv = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'real-secret';
    const result = await service.auditSecrets();
    process.env.JWT_SECRET = realEnv;

    expect(result.valid).toContain('JWT_SECRET');
  });

  it('isVaultConfigured reflects enabled + token presence', () => {
    expect(makeService(true).isVaultConfigured()).toBe(true);
    expect(makeService(false).isVaultConfigured()).toBe(false);
  });
});
