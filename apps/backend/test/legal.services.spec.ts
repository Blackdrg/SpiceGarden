import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { ConsentService } from '../src/legal/consent.service';
import { AgreementService } from '../src/legal/agreement.service';
import { RetentionService } from '../src/legal/retention.service';
import { LegalDocumentService } from '../src/legal/legal-document.service';
import { DataSubjectRequestService } from '../src/legal/data-subject-request.service';
import { LegalIntegrityService } from '../src/legal/integrity.service';
import { ComplianceAuditService } from '../src/legal/compliance-audit.service';
import { GrievanceService } from '../src/legal/grievance.service';
import { SecurityCenterService } from '../src/legal/security-center.service';
import { LegalNotificationService } from '../src/legal/legal-notification.service';
import { LegalEncryptionService } from '../src/legal/legal-encryption.service';

import { CookieConsentEntity } from '../src/legal/entities/cookie-consent.entity';
import { ConsentLogEntity } from '../src/legal/entities/consent-log.entity';
import { CookieRegistryEntity } from '../src/legal/entities/cookie-registry.entity';
import { AgreementEntity } from '../src/legal/entities/agreement.entity';
import { AgreementAcceptanceEntity } from '../src/legal/entities/agreement-acceptance.entity';
import { RetentionPolicyEntity } from '../src/legal/entities/retention-policy.entity';
import { DataRetentionJobEntity } from '../src/legal/entities/data-retention-job.entity';
import { LegalDocumentEntity } from '../src/legal/entities/legal-document.entity';
import { LegalVersionEntity } from '../src/legal/entities/legal-version.entity';
import { LegalAcceptanceEntity } from '../src/legal/entities/legal-acceptance.entity';
import { DataSubjectRequestEntity } from '../src/legal/entities/data-subject-request.entity';
import { DataExportEntity } from '../src/legal/entities/data-export.entity';
import { SecurityIncidentEntity } from '../src/legal/entities/security-incident.entity';
import { GrievanceEntity } from '../src/legal/entities/grievance.entity';
import { ComplianceAuditEntity } from '../src/legal/entities/compliance-audit.entity';

import {
  ConsentCategory,
  Regulation,
  DataRequestType,
  DataRequestStatus,
  ExportFormat,
  AgreementParty,
  DocumentStatus,
  ApprovalStatus,
} from '../src/legal/entities/legal.enums';

const repo = (): any => ({
  findOne: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
  create: jest.fn((x) => ({ ...x })),
  save: jest.fn(async (x: any) => (Array.isArray(x) ? x : { id: 'id-1', ...x })),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
});

describe('Legal Module Services', () => {
  let consent: ConsentService;
  let agreement: AgreementService;
  let retention: RetentionService;
  let documents: LegalDocumentService;
  let dsr: DataSubjectRequestService;
  let integrity: LegalIntegrityService;
  let audit: ComplianceAuditService;
  let grievance: GrievanceService;
  let security: SecurityCenterService;

  const consentRepo: any = repo();
  const logRepo: any = repo();
  const registryRepo: any = repo();
  const agreementRepo: any = repo();
  const acceptanceRepo: any = repo();
  const policyRepo: any = repo();
  const jobRepo: any = repo();
  const docRepo: any = repo();
  const versionRepo: any = repo();
  const acceptanceDocRepo: any = repo();
  const requestRepo: any = repo();
  const exportRepo: any = repo();
  const incidentRepo: any = repo();
  const grievanceRepo: any = repo();
  const complianceAuditRepo: any = repo();

  const dataSource: any = { getRepository: jest.fn(() => repo()) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsentService,
        AgreementService,
        RetentionService,
        LegalDocumentService,
        DataSubjectRequestService,
        LegalIntegrityService,
        ComplianceAuditService,
        GrievanceService,
        SecurityCenterService,
        { provide: LegalNotificationService, useValue: { notify: jest.fn(), notifyGrievance: jest.fn(), notifyRequestUpdate: jest.fn() } },
        { provide: LegalEncryptionService, useValue: { encrypt: jest.fn((x: any) => x), decrypt: jest.fn((x: any) => x), isEncrypted: jest.fn().mockReturnValue(false) } },
        { provide: getRepositoryToken(CookieConsentEntity), useValue: consentRepo },
        { provide: getRepositoryToken(ConsentLogEntity), useValue: logRepo },
        { provide: getRepositoryToken(CookieRegistryEntity), useValue: registryRepo },
        { provide: getRepositoryToken(AgreementEntity), useValue: agreementRepo },
        { provide: getRepositoryToken(AgreementAcceptanceEntity), useValue: acceptanceRepo },
        { provide: getRepositoryToken(RetentionPolicyEntity), useValue: policyRepo },
        { provide: getRepositoryToken(DataRetentionJobEntity), useValue: jobRepo },
        { provide: getRepositoryToken(LegalDocumentEntity), useValue: docRepo },
        { provide: getRepositoryToken(LegalVersionEntity), useValue: versionRepo },
        { provide: getRepositoryToken(LegalAcceptanceEntity), useValue: acceptanceDocRepo },
        { provide: getRepositoryToken(DataSubjectRequestEntity), useValue: requestRepo },
        { provide: getRepositoryToken(DataExportEntity), useValue: exportRepo },
        { provide: getRepositoryToken(SecurityIncidentEntity), useValue: incidentRepo },
        { provide: getRepositoryToken(GrievanceEntity), useValue: grievanceRepo },
        { provide: getRepositoryToken(ComplianceAuditEntity), useValue: complianceAuditRepo },
        { provide: 'DATA_SOURCE', useValue: dataSource },
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    consent = module.get(ConsentService);
    agreement = module.get(AgreementService);
    retention = module.get(RetentionService);
    documents = module.get(LegalDocumentService);
    dsr = module.get(DataSubjectRequestService);
    integrity = module.get(LegalIntegrityService);
    audit = module.get(ComplianceAuditService);
    grievance = module.get(GrievanceService);
    security = module.get(SecurityCenterService);
  });

  describe('IntegrityService', () => {
    it('signs and verifies payloads', () => {
      const payload = { a: 1, b: 'two' };
      const sig = integrity.sign(payload);
      expect(typeof sig).toBe('string');
      expect(integrity.verify(payload, sig)).toBe(true);
      expect(integrity.verify({ a: 2 }, sig)).toBe(false);
      expect(integrity.hashContent(payload)).toBe(integrity.hashContent(payload));
    });
  });

  describe('ComplianceAuditService', () => {
    it('records and lists audits', async () => {
      complianceAuditRepo.create.mockImplementation((x: any) => ({ id: 'a1', ...x }));
      complianceAuditRepo.save.mockResolvedValue({ id: 'a1' });
      complianceAuditRepo.find.mockResolvedValue([{ id: 'a1', category: 'c' }]);
      const rec = await audit.record({ action: 'x', category: 'c', actorId: 'u1' });
      expect(rec.id).toBe('a1');
      const list = await audit.list({ category: 'c' });
      expect(list).toHaveLength(1);
    });

    it('detects tampering', async () => {
      const payload = { action: 'act', category: 'c', actorId: 'u', entityType: 't', entityId: 'e', metadata: {}, createdAt: new Date() };
      const fake = { id: 'x', ...payload, signature: integrity.sign(payload) };
      complianceAuditRepo.find.mockResolvedValue([fake]);
      const res = await audit.scanForTampering(10);
      expect(res.checked).toBe(1);
      expect(res.tampered).toBe(0);
    });
  });

  describe('ConsentService', () => {
    it('rejects consent without identity', async () => {
      await expect(consent.recordConsent({ region: Regulation.GDPR } as any)).rejects.toThrow();
    });

    it('records and deactivates prior consent', async () => {
      const prior = { id: 'old', active: true, save: jest.fn() };
      consentRepo.findOne.mockResolvedValue(prior);
      consentRepo.create.mockReturnValue({ id: 'new', active: true });
      consentRepo.save.mockImplementation(async (x: any) => x);
      const res = await consent.recordConsent({
        userId: 'u1',
        region: Regulation.GDPR,
        analytics: true,
        marketing: false,
      } as any);
      expect(res.id).toBe('new');
      expect(prior.active).toBe(false);
    });

    it('withdraws active consent', async () => {
      const active = { id: 'c1', active: true, save: jest.fn(async function (this: any) { return this; }) };
      consentRepo.findOne.mockResolvedValue(active);
      const res = await consent.withdrawConsent('c1', 'u1');
      expect(res.active).toBe(false);
    });

    it('returns active consent', async () => {
      consentRepo.findOne.mockResolvedValue({ id: 'c1', active: true });
      const res = await consent.getActiveConsent('u1', true);
      expect(res?.id).toBe('c1');
    });

    it('lists consent logs and registry', async () => {
      logRepo.find.mockResolvedValue([{ id: 'l1' }]);
      registryRepo.find.mockResolvedValue([{ name: 'session' }]);
      expect(await consent.getConsentLogs({})).toHaveLength(1);
      expect(await consent.getCookieRegistry()).toHaveLength(1);
    });
  });

  describe('AgreementService', () => {
    it('creates a draft agreement with version 1', async () => {
      agreementRepo.findOne.mockResolvedValue(null);
      agreementRepo.create.mockImplementation((x: any) => ({ id: 'a1', ...x }));
      agreementRepo.save.mockResolvedValue({ id: 'a1', version: 1 });
      const res = await agreement.create({
        party: AgreementParty.MERCHANT,
        type: 'merchant_agreement',
        title: 'Merchant Agreement',
        content: 'body',
      });
      expect(res.version).toBe(1);
    });

    it('increments version on existing agreement', async () => {
      agreementRepo.findOne.mockResolvedValue({ id: 'a0', version: 2 });
      agreementRepo.create.mockImplementation((x: any) => ({ id: 'a1', ...x }));
      agreementRepo.save.mockResolvedValue({ id: 'a1', version: 3 });
      const res = await agreement.create({
        party: AgreementParty.DRIVER,
        type: 'driver_agreement',
        title: 'Driver Agreement',
        content: 'body',
      });
      expect(res.version).toBe(3);
    });

    it('approves and publishes an agreement', async () => {
      agreementRepo.findOne.mockResolvedValue({ id: 'a1', status: DocumentStatus.DRAFT, approvalStatus: ApprovalStatus.PENDING, save: jest.fn(async function (this: any) { return this; }) });
      agreementRepo.save.mockImplementation(async (x: any) => x);
      const approved = await agreement.approve('a1', 'admin');
      expect(approved.status).toBe(DocumentStatus.PUBLISHED);
      expect(approved.approvalStatus).toBe(ApprovalStatus.APPROVED);
    });

    it('gets current published agreement', async () => {
      agreementRepo.findOne.mockResolvedValue({ id: 'a1', status: DocumentStatus.PUBLISHED });
      expect(await agreement.getCurrent(AgreementParty.MERCHANT, 'merchant_agreement')).toBeTruthy();
    });

    it('accepts an agreement with a signature', async () => {
      agreementRepo.findOne.mockResolvedValue({ id: 'a1', status: DocumentStatus.PUBLISHED, version: 1, party: AgreementParty.MERCHANT });
      let stored: any;
      acceptanceRepo.create.mockImplementation((x: any) => ({ id: 'acc1', ...x }));
      acceptanceRepo.save.mockImplementation(async (x: any) => { stored = x; return x; });
      acceptanceRepo.findOne.mockImplementation(async () => stored);
      const acc = await agreement.accept('a1', { userId: 'u1', partyId: 'p1', partyType: 'merchant' }, { ipAddress: '1.2.3.4' });
      expect(acc.id).toBe('acc1');
      expect(await agreement.verifyAcceptance('acc1')).toBe(true);
    });

    it('lists agreements and acceptances', async () => {
      agreementRepo.find.mockResolvedValue([{ id: 'a1' }]);
      acceptanceRepo.find.mockResolvedValue([{ id: 'acc1' }]);
      expect(await agreement.list({ party: AgreementParty.MERCHANT })).toHaveLength(1);
      expect(await agreement.listAcceptances({ agreementId: 'a1' })).toHaveLength(1);
    });
  });

  describe('RetentionService', () => {
    it('seeds default policies', async () => {
      policyRepo.findOne.mockResolvedValue(null);
      policyRepo.save.mockResolvedValue({ id: 'p1' });
      const created = await retention.seedDefaults();
      expect(created).toBeGreaterThan(0);
    });

    it('skips existing categories on seed', async () => {
      policyRepo.find.mockResolvedValue([
        { id: 'e1', key: 'orders' },
        { id: 'e2', key: 'invoices' },
        { id: 'e3', key: 'chats' },
        { id: 'e4', key: 'notifications' },
        { id: 'e5', key: 'audit_logs' },
        { id: 'e6', key: 'sessions' },
        { id: 'e7', key: 'otp' },
        { id: 'e8', key: 'driver_gps' },
        { id: 'e9', key: 'restaurant_data' },
        { id: 'e10', key: 'analytics' },
        { id: 'e11', key: 'marketing' },
        { id: 'e12', key: 'emails' },
        { id: 'e13', key: 'payments' },
        { id: 'e14', key: 'refunds' },
        { id: 'e15', key: 'wallet' },
        { id: 'e16', key: 'loyalty' },
        { id: 'e17', key: 'support_tickets' },
        { id: 'e18', key: 'deleted_accounts' },
      ]);
      const created = await retention.seedDefaults();
      expect(created).toBe(0);
    });

    it('lists policies and jobs', async () => {
      policyRepo.find.mockResolvedValue([{ id: 'p1' }]);
      jobRepo.find.mockResolvedValue([{ id: 'j1' }]);
      expect(await retention.listPolicies()).toHaveLength(1);
      expect((await retention.listJobs({})).length).toBe(1);
    });

    it('runs a retention policy', async () => {
      const dsRepo = {
        count: jest.fn().mockResolvedValue(3),
        createQueryBuilder: jest.fn(() => ({
          delete: () => ({ where: () => ({ execute: () => Promise.resolve({ affected: 2 }) }) }),
          update: () => ({ set: () => ({ where: () => ({ execute: () => Promise.resolve({ affected: 2 }) }) }) }),
        })),
      };
      dataSource.getRepository.mockReturnValue(dsRepo);
      policyRepo.findOne.mockResolvedValue({ id: 'p1', key: 'orders', dataType: 'order', action: 'archive', retentionDays: 3650, enabled: true, legalHoldCapable: false });
      jobRepo.create.mockImplementation((x: any) => ({ id: 'j1', ...x }));
      jobRepo.save.mockImplementation(async (x: any) => x);
      const job = await retention.runPolicy('orders');
      expect(job.id).toBe('j1');
      expect(job.status).toBe('completed');
    });
  });

  describe('LegalDocumentService', () => {
    it('creates document and version', async () => {
      docRepo.create.mockImplementation((x: any) => ({ id: 'd1', ...x }));
      docRepo.save.mockResolvedValue({ id: 'd1' });
      versionRepo.create.mockImplementation((x: any) => ({ id: 'v1', ...x }));
      versionRepo.save.mockResolvedValue({ id: 'v1' });
      const doc = await documents.createDocument({
        type: 'privacy_policy' as any,
        title: 'Privacy Policy',
        language: 'en',
        sections: [{ id: 's1', heading: 'H', body: 'B', order: 1 }],
      } as any);
      expect(doc.id).toBe('d1');
    });

    it('publishes a version and marks document current', async () => {
      versionRepo.findOne.mockResolvedValue({ id: 'v1', documentId: 'd1', approvalStatus: ApprovalStatus.APPROVED });
      docRepo.findOne.mockResolvedValue({ id: 'd1' });
      docRepo.save.mockImplementation(async (x: any) => x);
      versionRepo.save.mockImplementation(async (x: any) => x);
      const pub = await documents.publishVersion('v1', 'admin');
      expect(pub.workflowState).toBe('published');
    });

    it('rolls back to a prior version', async () => {
      versionRepo.findOne.mockResolvedValue({ id: 'v1', documentId: 'd1', version: 1, approvalStatus: ApprovalStatus.APPROVED });
      docRepo.findOne.mockResolvedValue({ id: 'd1' });
      versionRepo.find.mockResolvedValue([{ id: 'v0', version: 0, documentId: 'd1' }]);
      versionRepo.create.mockImplementation((x: any) => ({ id: 'v2', ...x }));
      versionRepo.save.mockResolvedValue({ id: 'v2' });
      const rolled = await documents.rollback('d1', 'v1', 'admin');
      expect(rolled.id).toBe('v2');
    });

    it('rejects publishing an unapproved version', async () => {
      versionRepo.findOne.mockResolvedValue({ id: 'v1', approvalStatus: ApprovalStatus.PENDING });
      await expect(documents.publishVersion('v1', 'admin')).rejects.toThrow();
    });
  });

  describe('DataSubjectRequestService', () => {
    it('creates a request and computes SLA', async () => {
      requestRepo.findOne.mockResolvedValue(null);
      requestRepo.create.mockImplementation((x: any) => ({ id: 'r1', ...x }));
      requestRepo.save.mockImplementation(async (x: any) => x);
      const req = await dsr.createRequest({ userId: 'u1', type: DataRequestType.ACCESS, regulation: Regulation.GDPR });
      expect(req.id).toBe('r1');
      expect(req.slaDays).toBe(30);
    });

    it('rejects duplicate pending requests', async () => {
      requestRepo.findOne.mockResolvedValue({ id: 'existing' });
      await expect(dsr.createRequest({ userId: 'u1', type: DataRequestType.ACCESS, regulation: Regulation.GDPR })).rejects.toThrow();
    });

    it('reviews, processes, completes a request', async () => {
      requestRepo.findOne.mockResolvedValue({ id: 'r1', status: DataRequestStatus.PENDING, save: jest.fn(async function (this: any) { return this; }) });
      requestRepo.save.mockImplementation(async (x: any) => x);
      await dsr.review('r1', 'admin', 'approve');
      await dsr.startProcessing('r1');
      const done = await dsr.complete('r1', 'ok');
      expect(done.status).toBe(DataRequestStatus.COMPLETED);
    });

    it('cancels a pending request', async () => {
      requestRepo.findOne.mockResolvedValue({ id: 'r1', userId: 'u1', status: DataRequestStatus.PENDING, save: jest.fn(async function (this: any) { return this; }) });
      requestRepo.save.mockImplementation(async (x: any) => x);
      const cancelled = await dsr.cancel('r1', 'u1', 'no longer needed');
      expect(cancelled.status).toBe(DataRequestStatus.CANCELLED);
    });

    it('flags breached SLAs', async () => {
      const past = new Date(Date.now() - 1000);
      requestRepo.find.mockResolvedValue([{ id: 'r1', slaDeadline: past, status: DataRequestStatus.PENDING }]);
      expect((await dsr.findBreachedSlas()).length).toBe(1);
    });

    it('creates and finalizes an export', async () => {
      let stored: any;
      exportRepo.create.mockImplementation((x: any) => ({ id: 'e1', ...x }));
      exportRepo.save.mockImplementation(async (x: any) => { stored = x; return x; });
      exportRepo.findOne.mockImplementation(async () => stored);
      const exp = await dsr.createExport('u1', { format: ExportFormat.JSON, regulation: Regulation.GDPR });
      expect(exp.id).toBe('e1');
      const fin = await dsr.finalizeExport('e1', { downloadUrl: '/x', sizeBytes: 10 });
      expect(fin.status).toBe(DataRequestStatus.COMPLETED);
    });

    it('generates CSV and PDF export content', async () => {
      exportRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1', format: ExportFormat.CSV });
      const csv = await dsr.generateExportContent('e1');
      expect(csv.contentType).toBe('text/csv');
      exportRepo.findOne.mockResolvedValue({ id: 'e2', userId: 'u1', format: ExportFormat.PDF });
      const pdf = await dsr.generateExportContent('e2');
      expect(pdf.contentType).toBe('application/pdf');
      exportRepo.findOne.mockResolvedValue({ id: 'e3', userId: 'u1', format: ExportFormat.JSON });
      const json = await dsr.generateExportContent('e3');
      expect(json.contentType).toBe('application/json');
    });
  });

  describe('GrievanceService', () => {
    it('creates a grievance and returns officer/consent manager', async () => {
      grievanceRepo.create.mockImplementation((x: any) => ({ id: 'g1', ...x }));
      grievanceRepo.save.mockImplementation(async (x: any) => x);
      const g = await grievance.create({ userId: 'u1', regulation: 'dpdp', subject: 's', description: 'd' });
      expect(g.id).toBe('g1');
      expect(grievance.getOfficer()).toHaveProperty('email');
      expect(grievance.getConsentManager()).toHaveProperty('endpoint');
    });

    it('lists grievances', async () => {
      grievanceRepo.find.mockResolvedValue([{ id: 'g1' }]);
      expect(await grievance.list()).toHaveLength(1);
    });
  });

  describe('SecurityCenterService', () => {
    it('lists incidents and creates one', async () => {
      incidentRepo.find.mockResolvedValue([{ id: 'i1' }]);
      incidentRepo.create.mockImplementation((x: any) => ({ id: 'i2', ...x }));
      incidentRepo.save.mockResolvedValue({ id: 'i2' });
      expect(await security.listIncidents()).toHaveLength(1);
      const inc = await security.reportIncident({ title: 'X', description: 'incident', severity: 'high' as any });
      expect(inc.id).toBe('i2');
    });
  });
});
