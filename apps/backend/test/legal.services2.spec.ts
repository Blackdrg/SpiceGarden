import { AgreementService } from '../src/legal/agreement.service';
import { GrievanceService } from '../src/legal/grievance.service';
import { SecurityCenterService } from '../src/legal/security-center.service';
import { LegalEncryptionService } from '../src/legal/legal-encryption.service';

const encryption = () =>
  new LegalEncryptionService({ get: () => 'test-secret' } as any);

describe('AgreementService encryption', () => {
  const build = () => {
    const repo: any = {
      findOne: jest.fn(),
      create: (x: any) => x,
      save: jest.fn(async (x: any) => x),
      find: jest.fn().mockResolvedValue([]),
    };
    const acceptanceRepo: any = { create: (x: any) => x, save: jest.fn(async (x: any) => x), find: jest.fn().mockResolvedValue([]) };
    const integrity: any = { sign: () => 'sig', verify: () => true, hashContent: () => 'h' };
    const svc: any = new AgreementService(
      repo,
      acceptanceRepo,
      integrity,
      { record: jest.fn().mockResolvedValue({}) } as any,
      encryption(),
    );
    return { svc, repo };
  };

  it('encrypts agreement content on create and decrypts on read', async () => {
    const { svc, repo } = build();
    repo.findOne.mockResolvedValue(null);
    const created: any = await svc.create({
      party: 'merchant' as any,
      type: 'merchant_agreement',
      title: 'Merchant Agreement',
      content: 'confidential merchant terms',
    });
    expect(created.content).not.toContain('confidential merchant terms');
    expect(svc['encryption'].isEncrypted(created.content)).toBe(true);

    const stored = { ...created, content: created.content };
    repo.findOne.mockResolvedValue(stored);
    const fetched: any = await svc.get('a1');
    expect(fetched.content).toBe('confidential merchant terms');
  });

  it('list() returns decrypted agreements', async () => {
    const { svc, repo } = build();
    const enc = encryption().encrypt('terms');
    repo.find.mockResolvedValue([{ id: 'a', content: enc, party: 'driver' }]);
    const out: any = await svc.list();
    expect(out[0].content).toBe('terms');
  });
});

describe('GrievanceService encryption', () => {
  const build = () => {
    const repo: any = {
      create: (x: any) => x,
      save: jest.fn(async (x: any) => x),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
    };
    const svc: any = new GrievanceService(
      repo,
      { record: jest.fn().mockResolvedValue({}) } as any,
      encryption(),
    );
    return { svc, repo };
  };

  it('encrypts description on create and decrypts on list', async () => {
    const { svc, repo } = build();
    await svc.create({ subject: 's', description: 'private grievance text' });
    const saved = repo.save.mock.calls[0][0];
    expect(svc['encryption'].isEncrypted(saved.description)).toBe(true);
    repo.find.mockResolvedValue([{ description: saved.description, status: 'open' }]);
    const listed: any = await svc.list();
    expect(listed[0].description).toBe('private grievance text');
  });
});

describe('SecurityCenterService content', () => {
  const svc: any = new SecurityCenterService(
    { create: () => ({}), count: jest.fn().mockResolvedValue(0) } as any,
    { sign: () => 's', verify: () => true, hashContent: () => 'h' } as any,
    { record: jest.fn().mockResolvedValue({}) } as any,
  );

  it('exposes incident response policy', () => {
    const p = svc.getIncidentResponsePolicy();
    expect(p.phases.length).toBeGreaterThan(0);
    expect(p.phases[0].sla).toBeTruthy();
  });

  it('exposes patch policy with severity SLAs', () => {
    const p = svc.getPatchPolicy();
    expect(p.severitySlas.critical).toBe('24h');
  });

  it('exposes encryption policy', () => {
    const p = svc.getEncryptionPolicy();
    expect(p.atRest).toContain('AES-256-GCM');
  });

  it('exposes SOC reports and FAQs', () => {
    expect(svc.getSocReports().length).toBeGreaterThan(0);
    expect(svc.getSecurityFaqs().length).toBeGreaterThan(0);
  });

  it('generates a security report', async () => {
    const report = await svc.generateSecurityReport();
    expect(report.totalIncidents).toBeDefined();
    expect(report.compliance).toContain('PCI DSS SAQ A');
  });
});
