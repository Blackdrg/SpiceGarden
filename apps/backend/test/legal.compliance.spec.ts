import { LegalEncryptionService } from '../src/legal/legal-encryption.service';
import { LegalNotificationService } from '../src/legal/legal-notification.service';
import { RetentionService } from '../src/legal/retention.service';

describe('LegalEncryptionService', () => {
  const make = () =>
    new LegalEncryptionService({ get: (k: string) => (k === 'ENCRYPTION_SECRET' ? 'test-secret' : undefined) } as any);

  it('round-trips plaintext', () => {
    const svc = make();
    const secret = 'confidential agreement body';
    const enc = svc.encrypt(secret);
    expect(enc.startsWith('v1:')).toBe(true);
    expect(enc).not.toContain(secret);
    expect(svc.decrypt(enc)).toBe(secret);
  });

  it('round-trips JSON', () => {
    const svc = make();
    const obj = { a: 1, b: 'two', c: { d: true } };
    const enc = svc.encryptJson(obj);
    expect(svc.decryptJson(enc)).toEqual(obj);
  });

  it('detects encrypted payloads', () => {
    const svc = make();
    expect(svc.isEncrypted(svc.encrypt('x'))).toBe(true);
    expect(svc.isEncrypted('plain')).toBe(false);
    expect(svc.isEncrypted(null)).toBe(false);
  });

  it('fails to decrypt tampered payloads', () => {
    const svc = make();
    const enc = svc.encrypt('secret');
    const tampered = enc.slice(0, -2) + (enc.endsWith('aa') ? 'bb' : 'aa');
    expect(() => svc.decrypt(tampered)).toThrow();
  });
});

describe('LegalNotificationService', () => {
  it('persists a legal notification record', async () => {
    const saved: any[] = [];
    const repo: any = {
      create: (x: any) => ({ ...x, id: 'n1' }),
      save: jest.fn(async (x: any) => {
        saved.push(x);
        return x;
      }),
    };
    const svc = new LegalNotificationService({ getRepository: () => repo } as any, repo as any);
    await svc.notify({
      userId: 'u1',
      event: 'policy_updated',
      title: 'Policy updated',
      body: 'Please review',
      metadata: { type: 'privacy_policy' },
    });
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(saved[0].recipientId).toBe('u1');
    expect(saved[0].payload.title).toBe('Policy updated');
  });

  it('does not throw when persistence fails', async () => {
    const repo: any = {
      create: (x: any) => x,
      save: jest.fn().mockRejectedValue(new Error('db down')),
    };
    const svc = new LegalNotificationService({ getRepository: () => repo } as any, repo as any);
    await expect(
      svc.notify({ userId: 'u1', event: 'deletion_completed', title: 't', body: 'b' }),
    ).resolves.toBeUndefined();
  });
});

describe('RetentionService table mapping', () => {
  it('resolves known data categories to physical tables', () => {
    expect(RetentionService.resolveTableName('order')).toBe('orders');
    expect(RetentionService.resolveTableName('notification')).toBe('notifications');
    expect(RetentionService.resolveTableName('session')).toBe('user_sessions');
    expect(RetentionService.resolveTableName('audit_log')).toBe('audit_logs');
  });

  it('returns null for unknown data categories', () => {
    expect(RetentionService.resolveTableName('does_not_exist')).toBeNull();
  });
});

describe('DataSubjectRequestService deletion behaviour', () => {
  const buildService = () => {
    const deleted: Record<string, number> = {};
    const dataSource: any = {
      getRepository: (table: string) => ({
        createQueryBuilder: () => ({
          delete: () => ({ where: () => ({ execute: async () => ({ affected: (deleted[table] = (deleted[table] || 0) + 2) }) }) }),
          update: () => ({ set: () => ({ where: () => ({ execute: async () => ({ affected: 1 }) }) }) }),
        }),
        softDelete: jest.fn().mockResolvedValue({}),
      }),
    };
    const requestRepo: any = {
      create: (x: any) => x,
      save: jest.fn(async (x: any) => x),
      findOne: jest.fn(),
    };
    const exportRepo: any = { create: (x: any) => x, save: jest.fn(async (x: any) => x), findOne: jest.fn() };
    const svc: any = new (require('../src/legal/data-subject-request.service').DataSubjectRequestService)(
      requestRepo,
      exportRepo,
      dataSource,
      { record: jest.fn().mockResolvedValue({}) } as any,
      { sign: () => 'sig', verify: () => true, hashContent: () => 'h' } as any,
      { notify: jest.fn().mockResolvedValue(undefined) } as any,
    );
    return { svc, deleted };
  };

  it('executes deletion across multiple stores for a DELETE request', async () => {
    const { svc, deleted } = buildService();
    const result = await svc.executeDeletion('user-123', 'gdpr');
    expect(deleted['user_sessions']).toBeGreaterThan(0);
    expect(deleted['notifications']).toBeGreaterThan(0);
    expect(result.deletedRecords).toBeGreaterThan(0);
  });

  it('complete() triggers deletion and emits a notification for DELETE', async () => {
    const { svc } = buildService();
    const request: any = {
      id: 'r1',
      userId: 'user-123',
      type: 'delete',
      regulation: 'gdpr',
      reviewerId: 'admin',
    };
    svc.getRequest = jest.fn().mockResolvedValue(request);
    const notifications = require('../src/legal/legal-notification.service');
    const notify = jest.spyOn(svc.notifications, 'notify');
    const saved = await svc.complete('r1', 'done');
    expect(saved.status).toBe('completed');
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-123', event: 'deletion_completed' }),
    );
  });
});
