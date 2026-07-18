import { LegalSeedService } from '../src/legal/legal-seed.service';
import { LegalDocumentService } from '../src/legal/legal-document.service';
import { RetentionService } from '../src/legal/retention.service';

describe('LegalSeedService', () => {
  const makeService = () => {
    const calls = { created: 0, versioned: 0, approved: 0, published: 0 };
    const documentService: any = {
      getDocument: jest.fn().mockResolvedValue(null),
      createDocument: jest.fn().mockImplementation(async () => {
        calls.created++;
        return { id: `doc-${calls.created}` };
      }),
      createVersion: jest.fn().mockImplementation(async () => {
        calls.versioned++;
        return { id: `ver-${calls.versioned}` };
      }),
      approveVersion: jest.fn().mockImplementation(async () => {
        calls.approved++;
        return {};
      }),
      publishVersion: jest.fn().mockImplementation(async () => {
        calls.published++;
        return {};
      }),
    };
    const retentionService: any = { seedDefaults: jest.fn().mockResolvedValue(18) };
    const svc = new LegalSeedService(documentService, retentionService);
    return { svc, calls, documentService };
  };

  it('seeds all production legal documents and publishes each', async () => {
    const { svc, calls } = makeService();
    const result = await svc.seedAll('system');
    expect(result.created).toBeGreaterThanOrEqual(18);
    expect(result.published).toBe(result.created);
    expect(calls.versioned).toBe(result.created);
    expect(calls.approved).toBe(result.created);
  });

  it('skips documents that already exist', async () => {
    const { svc, documentService } = makeService();
    documentService.getDocument = jest.fn().mockResolvedValue({ id: 'existing' });
    const result = await svc.seedAll('system');
    expect(result.created).toBe(0);
    expect(documentService.createDocument).not.toHaveBeenCalled();
  });

  it('seedAll is idempotent when called twice', async () => {
    const { svc, documentService } = makeService();
    await svc.seedAll('system');
    documentService.getDocument = jest.fn().mockResolvedValue({ id: 'existing' });
    const second = await svc.seedAll('system');
    expect(second.created).toBe(0);
  });

  it('onModuleInit seeds without throwing on failure', async () => {
    const { svc, documentService } = makeService();
    documentService.createDocument = jest.fn().mockRejectedValue(new Error('db down'));
    await expect(svc.onModuleInit()).resolves.toBeUndefined();
  });
});
