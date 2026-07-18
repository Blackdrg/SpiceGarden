import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrivacyController } from '../src/legal/privacy.controller';
import { LegalController } from '../src/legal/legal.controller';
import { AgreementController } from '../src/legal/agreement.controller';
import { RetentionController } from '../src/legal/retention.controller';
import { ComplianceAdminController } from '../src/legal/compliance-admin.controller';
import { SecurityCenterController } from '../src/legal/security-center.controller';
import { DataSubjectRequestService } from '../src/legal/data-subject-request.service';
import { ConsentService } from '../src/legal/consent.service';
import { GrievanceService } from '../src/legal/grievance.service';
import { LegalDocumentService } from '../src/legal/legal-document.service';
import { RetentionService } from '../src/legal/retention.service';
import { AgreementService } from '../src/legal/agreement.service';
import { ComplianceAuditService } from '../src/legal/compliance-audit.service';
import { SecurityCenterService } from '../src/legal/security-center.service';

const userReq = (sub: string, role = 'customer' as any) => ({ user: { sub, role }, ip: '127.0.0.1', headers: { 'user-agent': 'test' } }) as any;

describe('Legal Controllers', () => {
  let dsr: any, consent: any, grievance: any, documents: any, retention: any, agreement: any, audit: any, security: any;
  let privacy: PrivacyController, legal: LegalController, agree: AgreementController, ret: RetentionController, admin: ComplianceAdminController, sec: SecurityCenterController;

  beforeEach(() => {
    dsr = { createRequest: jest.fn(), listRequests: jest.fn().mockResolvedValue([]), getRequest: jest.fn(), cancel: jest.fn(), review: jest.fn(), createExport: jest.fn(), listExports: jest.fn().mockResolvedValue([]), buildExportPayload: jest.fn().mockResolvedValue({ sections: { a: [] }, exportedAt: 'now' }), getExport: jest.fn(), generateExportContent: jest.fn().mockResolvedValue({ content: 'x', contentType: 'application/json', filename: 'f.json' }), findBreachedSlas: jest.fn().mockResolvedValue([]) };
    consent = { getActiveConsent: jest.fn(), withdrawConsent: jest.fn(), getConsentLogs: jest.fn().mockResolvedValue([]), recordConsent: jest.fn(), getCookieRegistry: jest.fn().mockResolvedValue([]) };
    grievance = { create: jest.fn(), getOfficer: jest.fn().mockReturnValue({ name: 'o', email: 'e', phone: 'p' }), getConsentManager: jest.fn().mockReturnValue({ name: 'c', email: 'e' }), list: jest.fn().mockResolvedValue([]) };
    documents = { listDocuments: jest.fn().mockResolvedValue([]), getPublishedVersion: jest.fn(), getDocument: jest.fn(), listVersions: jest.fn().mockResolvedValue([]), createDocument: jest.fn(), createVersion: jest.fn(), approveVersion: jest.fn(), publishVersion: jest.fn(), rollback: jest.fn(), acceptDocument: jest.fn(), getUserAcceptances: jest.fn(), hasAcceptedCurrent: jest.fn(), getVersion: jest.fn().mockResolvedValue({ documentId: 'd1' }) };
    retention = { seedDefaults: jest.fn().mockResolvedValue(3), listPolicies: jest.fn().mockResolvedValue([]), listJobs: jest.fn().mockResolvedValue([]) };
    agreement = { getCurrent: jest.fn(), create: jest.fn(), approve: jest.fn(), list: jest.fn().mockResolvedValue([]), accept: jest.fn(), listAcceptances: jest.fn().mockResolvedValue([]), verifyAcceptance: jest.fn().mockResolvedValue(true) };
    audit = { list: jest.fn().mockResolvedValue([]), scanForTampering: jest.fn().mockResolvedValue({ checked: 0, tampered: 0 }) };
    security = { listIncidents: jest.fn().mockResolvedValue([]), reportIncident: jest.fn(), publicIncidents: jest.fn().mockResolvedValue([]), getIncident: jest.fn(), updateIncident: jest.fn() };
    privacy = new PrivacyController(dsr, consent, grievance);
    legal = new LegalController(documents, consent, { seedAll: jest.fn() } as any, retention, audit);
    agree = new AgreementController(agreement);
    ret = new RetentionController(retention);
    admin = new ComplianceAdminController(retention, dsr, consent, audit, security, grievance, agreement, documents);
    sec = new SecurityCenterController(security);
  });

  describe('PrivacyController', () => {
    it('forbids acting on another user', async () => {
      await expect(privacy.createRequest(userReq('a'), { userId: 'b', type: 'access', regulation: 'gdpr' } as any)).rejects.toThrow(ForbiddenException);
    });
    it('creates a request for self', async () => {
      dsr.createRequest.mockResolvedValue({ id: 'r1' });
      const r = await privacy.createRequest(userReq('a'), { userId: 'a', type: 'access', regulation: 'gdpr' } as any);
      expect(r.id).toBe('r1');
    });
    it('lists requests as admin without ownership filter', async () => {
      await privacy.listRequests(userReq('a', 'admin'), { page: 1, limit: 10 } as any);
      expect(dsr.listRequests).toHaveBeenCalledWith(expect.objectContaining({ userId: undefined }));
    });
    it('forbids viewing another user request', async () => {
      dsr.getRequest.mockResolvedValue({ userId: 'b' });
      await expect(privacy.getRequest(userReq('a'), 'r1')).rejects.toThrow(ForbiddenException);
    });
    it('builds export preview', async () => {
      const p = await privacy.preview(userReq('a'), 'a');
      expect(p.sections).toContain('a');
    });
    it('downloads export with ownership', async () => {
      const res: any = { setHeader: jest.fn(), send: jest.fn() };
      dsr.getExport.mockResolvedValue({ userId: 'a' });
      await privacy.downloadExport(userReq('a'), 'e1', res);
      expect(res.send).toHaveBeenCalledWith('x');
    });
    it('dashboards for user', async () => {
      const d = await privacy.dashboard(userReq('a'), 'a');
      expect(d.userId).toBe('a');
    });
    it('submits DPDP grievance', async () => {
      grievance.create.mockReturnValue({ id: 'g1' });
      const g = await privacy.grievance(userReq('a'), { subject: 's', description: 'd' });
      expect(g.id).toBe('g1');
    });
    it('DPDP officer info', async () => {
      const info = await privacy.dpdpInfo();
      expect(info.officer.email).toBe('e');
    });
  });

  describe('LegalController', () => {
    it('lists legal center', async () => {
      documents.listDocuments.mockResolvedValue([{ type: 'privacy_policy', status: 'published', currentVersion: 1, updatedAt: new Date() }]);
      const c = await legal.legalCenter();
      expect(c.categories.length).toBeGreaterThan(0);
      expect(c.documents.length).toBe(1);
    });
    it('delegates consent logs to the consent service', async () => {
      const logs = await legal.consentLogs(undefined, undefined, { page: 1, limit: 10 } as any);
      expect(consent.getConsentLogs).toHaveBeenCalled();
      expect(logs).toEqual([]);
    });
  });

  describe('AgreementController', () => {
    it('gets current agreement', async () => {
      agreement.getCurrent.mockResolvedValue({ id: 'a1' });
      expect(await agree.getCurrent('merchant' as any, 'merchant_agreement')).toBeTruthy();
    });
    it('accepts agreement', async () => {
      agreement.accept.mockResolvedValue({ id: 'acc1' });
      const a = await agree.accept({ user: { sub: 'a' }, headers: { 'user-agent': 'x' } } as any, { agreementId: 'a1', userId: 'a', partyId: 'p', partyType: 'merchant' });
      expect(a.id).toBe('acc1');
    });
    it('verifies acceptance', async () => {
      expect(await agree.verify('acc1')).toEqual({ acceptanceId: 'acc1', valid: true });
    });
  });

  describe('RetentionController', () => {
    it('seeds defaults', async () => {
      const r = await legal.seedRetention();
      expect(r.created).toBe(3);
    });
  });

  describe('ComplianceAdminController', () => {
    it('returns overview', async () => {
      const o = await admin.overview();
      expect(o.generatedAt).toBeDefined();
    });
    it('returns gdpr/dpdp/deletion/export queues', async () => {
      expect((await admin.gdprRequests({ page: 1, limit: 10 } as any)).length).toBe(0);
      expect((await admin.dpdpRequests({ page: 1, limit: 10 } as any)).length).toBe(0);
      expect((await admin.deletionQueue()).length).toBe(0);
      expect((await admin.exportQueue()).length).toBe(0);
    });
    it('returns retention/consent/audit/holds/agreements/events', async () => {
      expect((await admin.retentionStatus()).policies).toBeDefined();
      expect((await admin.consentLogs()).length).toBe(0);
      expect((await admin.auditLogs()).length).toBe(0);
      expect((await admin.legalHolds()).length).toBe(0);
      expect((await admin.merchantAgreements()).length).toBe(0);
      expect((await admin.driverAgreements()).length).toBe(0);
      expect((await admin.securityEvents()).length).toBe(0);
    });
    it('runs integrity scan', async () => {
      const s = await admin.integrityScan();
      expect(s.checked).toBe(0);
    });
  });

  describe('SecurityCenterController', () => {
    it('lists incidents', async () => {
      expect((await sec.listIncidents()).length).toBe(0);
    });
    it('lists public incidents and single incident', async () => {
      security.listIncidents.mockResolvedValue([{ id: 'i1' }]);
      security.getIncident.mockResolvedValue({ id: 'i1' });
      expect((await sec.publicIncidents()).length).toBe(1);
      await sec.getIncident('i1');
      expect(security.getIncident).toHaveBeenCalledWith('i1');
    });
    it('reports an incident', async () => {
      security.reportIncident.mockResolvedValue({ id: 'i2' });
      const inc = await sec.reportIncident({ ip: '1.2.3.4', headers: { 'user-agent': 'x' } } as any, { title: 'X', description: 'd', severity: 'high' } as any);
      expect(inc.id).toBe('i2');
    });
    it('updates an incident', async () => {
      security.updateIncident.mockResolvedValue({ id: 'i2', status: 'resolved' });
      const u = await sec.updateIncident('i2', { status: 'resolved' } as any);
      expect(u.status).toBe('resolved');
    });
  });

  describe('LegalController admin + consent', () => {
    it('creates and versions documents', async () => {
      documents.createDocument.mockResolvedValue({ id: 'd1' });
      documents.createVersion.mockResolvedValue({ id: 'v1' });
      expect((await legal.createDocument({} as any)).id).toBe('d1');
      expect((await legal.createVersion('d1', {} as any)).id).toBe('v1');
    });
    it('approves/publishes/rollbacks versions', async () => {
      documents.approveVersion.mockResolvedValue({ id: 'v1' });
      documents.publishVersion.mockResolvedValue({ id: 'v1' });
      documents.rollback.mockResolvedValue({ id: 'v1' });
      expect((await legal.approveVersion('v1', { approverId: 'a', notes: 'ok' } as any)).id).toBe('v1');
      expect((await legal.publishVersion('v1', { approverId: 'a' } as any)).id).toBe('v1');
      expect((await legal.rollback('v1', { approverId: 'a' } as any)).id).toBe('v1');
    });
    it('accepts document and lists my/required acceptances', async () => {
      documents.acceptDocument.mockResolvedValue({ id: 'a1' });
      documents.getUserAcceptances.mockResolvedValue([{ id: 'a1' }]);
      documents.listDocuments.mockResolvedValue([{ type: 'privacy_policy', status: 'published', requiresAcceptance: true, currentVersion: 1 }]);
      documents.hasAcceptedCurrent.mockResolvedValue(false);
      expect((await legal.acceptDocument(userReq('a') as any, { documentId: 'd1', versionId: 'v1' } as any)).id).toBe('a1');
      expect((await legal.myAcceptances(userReq('a') as any)).length).toBe(1);
      const req = await legal.requiredAcceptances(userReq('a') as any);
      expect(req.pending.length).toBe(1);
    });
    it('returns document (published) and version history', async () => {
      documents.getPublishedVersion.mockResolvedValue({ document: { type: 'privacy_policy' }, version: { version: 1, title: 'T', sections: [], summary: 's', language: 'en' } });
      documents.getDocument.mockResolvedValue({ type: 'privacy_policy' });
      documents.listVersions.mockResolvedValue([{ id: 'v1', version: 1, title: 'T', approvalStatus: 'approved', language: 'en' }]);
      expect((await legal.getDocument('privacy_policy' as any)).version).toBe(1);
      expect((await legal.versionHistory('privacy_policy' as any)).versions.length).toBe(1);
    });
    it('records and withdraws consent, active consent, registry', async () => {
      consent.recordConsent.mockResolvedValue({ id: 'c1', region: 'eu', consentVersion: '1.0' });
      consent.withdrawConsent.mockResolvedValue({ id: 'c1' });
      consent.getActiveConsent.mockResolvedValue({ id: 'c1' });
      const r = await legal.recordConsent({ ip: '1.1.1.1', headers: { 'user-agent': 'x' } } as any, { region: 'eu', consentVersion: '1.0', analytics: true, necessary: true } as any);
      expect(r.consentId).toBe('c1');
      expect((await legal.withdrawConsent({ ip: '1.1.1.1' } as any, 'c1', { userId: 'a' })).id).toBe('c1');
      expect((await legal.getActiveConsent('a'))?.id).toBe('c1');
      expect((await legal.getActiveConsent(undefined, 't'))?.id).toBe('c1');
      expect((await legal.cookieRegistry()).length).toBe(0);
    });
    it('seeds documents and retention', async () => {
      (legal as any).seedService = { seedAll: jest.fn().mockResolvedValue({ created: 18, published: 18 }) };
      const s = await legal.seed();
      expect(s.created).toBe(18);
    });
  });

  describe('PrivacyController remaining branches', () => {
    it('createExport, listExports, cancel, review, getRequest owner, listRequests self', async () => {
      dsr.createExport.mockResolvedValue({ id: 'e1' });
      dsr.listExports.mockResolvedValue([{ id: 'e1' }]);
      dsr.cancel.mockResolvedValue({ id: 'r1', status: 'cancelled' });
      dsr.review.mockResolvedValue({ id: 'r1', status: 'approved' });
      dsr.getRequest.mockResolvedValue({ userId: 'a' });
      expect((await privacy.createExport(userReq('a'), { userId: 'a', regulation: 'gdpr', format: 'json' } as any)).id).toBe('e1');
      expect((await privacy.listExports(userReq('a'), 'a')).length).toBe(1);
      expect((await privacy.cancel(userReq('a'), 'r1', { reason: 'x' })).status).toBe('cancelled');
      expect((await privacy.review('r1', { reviewerId: 'admin', decision: 'approve' } as any)).status).toBe('approved');
      expect((await privacy.getRequest(userReq('a'), 'r1')).userId).toBe('a');
      await privacy.listRequests(userReq('a'), { page: 1, limit: 10 } as any);
      expect(dsr.listRequests).toHaveBeenCalled();
    });
  });

  describe('RetentionController', () => {
    it('lists policies and jobs', async () => {
      retention.listPolicies.mockResolvedValue([{ id: 'p1' }]);
      retention.listJobs.mockResolvedValue([{ id: 'j1' }]);
      expect((await ret.policies()).length).toBe(1);
      expect((await ret.jobs(undefined, { page: 1, limit: 10 } as any)).length).toBe(1);
    });
  });
});
