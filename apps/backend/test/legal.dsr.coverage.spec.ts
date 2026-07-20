import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { DataSubjectRequestService } from '../src/legal/data-subject-request.service';
import { ComplianceAuditService } from '../src/legal/compliance-audit.service';
import { LegalIntegrityService } from '../src/legal/integrity.service';
import { LegalNotificationService } from '../src/legal/legal-notification.service';

import { DataSubjectRequestEntity } from '../src/legal/entities/data-subject-request.entity';
import { DataExportEntity } from '../src/legal/entities/data-export.entity';

import {
  DataRequestType,
  DataRequestStatus,
  Regulation,
  ExportFormat,
} from '../src/legal/entities/legal.enums';

const repo = (): any => ({
  findOne: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
  create: jest.fn((x: any) => ({ ...x })),
  save: jest.fn(async (x: any) => (Array.isArray(x) ? x : { id: 'id-1', ...x })),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
});

describe('DataSubjectRequestService branch coverage', () => {
  let dsr: DataSubjectRequestService;
  const requestRepo: any = repo();
  const exportRepo: any = repo();
  const notify = jest.fn().mockResolvedValue(undefined);
  const auditRecord = jest.fn().mockResolvedValue({});
  const integrity = { sign: (x: any) => JSON.stringify(x), verify: () => true };
  const tableRepo: any = repo();
  tableRepo.createQueryBuilder = jest.fn(() => ({
    delete: () => ({ where: () => ({ execute: async () => ({ affected: 1 }) }) }),
    update: () => ({ set: () => ({ where: () => ({ execute: async () => ({ affected: 1 }) }) }) }),
  }));
  const dataSource: any = { getRepository: jest.fn(() => tableRepo) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSubjectRequestService,
        { provide: getRepositoryToken(DataSubjectRequestEntity), useValue: requestRepo },
        { provide: getRepositoryToken(DataExportEntity), useValue: exportRepo },
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: ComplianceAuditService, useValue: { record: auditRecord } },
        { provide: LegalIntegrityService, useValue: integrity },
        { provide: LegalNotificationService, useValue: { notify } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    dsr = module.get(DataSubjectRequestService);
  });

  it('rejects a duplicate pending request of the same type', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'dup' });
    await expect(
      dsr.createRequest({ userId: 'u1', type: DataRequestType.ACCESS, regulation: Regulation.GDPR }),
    ).rejects.toThrow('A pending request of this type already exists');
  });

  it('uses the provided slaDays when given', async () => {
    requestRepo.findOne.mockResolvedValue(null);
    requestRepo.create.mockImplementation((x: any) => ({ id: 'r1', ...x }));
    const res = await dsr.createRequest({
      userId: 'u1',
      type: DataRequestType.ACCESS,
      regulation: Regulation.GDPR,
      slaDays: 12,
      reason: 'r',
      requestedBy: 'admin',
      metadata: { a: 1 },
    });
    expect(res.slaDays).toBe(12);
    expect(res.requestedBy).toBe('admin');
  });

  it('falls back to SLA map then default 30 when type unknown', async () => {
    requestRepo.findOne.mockResolvedValue(null);
    requestRepo.create.mockImplementation((x: any) => ({ id: 'r1', ...x }));
    const res = await dsr.createRequest({
      userId: 'u1',
      type: 'weird_type' as DataRequestType,
      regulation: Regulation.CCPA,
    });
    expect(res.slaDays).toBe(30);
    expect(res.requestedBy).toBe('u1');
    expect(res.metadata).toEqual({});
  });

  it('listRequests builds where clauses from every filter', async () => {
    requestRepo.find.mockResolvedValue([{ id: 'r1' }]);
    await dsr.listRequests({ userId: 'u1', status: DataRequestStatus.PENDING, type: DataRequestType.DELETE, regulation: Regulation.GDPR, limit: 10, offset: 5 });
    expect(requestRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1', status: DataRequestStatus.PENDING, type: DataRequestType.DELETE, regulation: Regulation.GDPR },
        take: 10,
        skip: 5,
      }),
    );
  });

  it('getRequest throws when missing', async () => {
    requestRepo.findOne.mockResolvedValue(null);
    await expect(dsr.getRequest('missing')).rejects.toThrow('Request not found');
  });

  it('review rejects a non-reviewable request', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'r1', status: DataRequestStatus.COMPLETED });
    await expect(dsr.review('r1', 'rev', 'approve')).rejects.toThrow('not in a reviewable state');
  });

  it('review approves and records dsr_approved', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'r1', status: DataRequestStatus.PENDING });
    requestRepo.save.mockImplementation(async (x: any) => x);
    const res = await dsr.review('r1', 'rev', 'approve', 'ok');
    expect(res.status).toBe(DataRequestStatus.APPROVED);
    expect(res.reviewNotes).toBe('ok');
  });

  it('review rejects and records dsr_rejected', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'r1', status: DataRequestStatus.IN_REVIEW });
    requestRepo.save.mockImplementation(async (x: any) => x);
    const res = await dsr.review('r1', 'rev', 'reject');
    expect(res.status).toBe(DataRequestStatus.REJECTED);
    expect(res.reviewNotes).toBeNull();
  });

  it('startProcessing requires approval', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'r1', status: DataRequestStatus.PENDING });
    await expect(dsr.startProcessing('r1')).rejects.toThrow('must be approved before processing');
  });

  it('startProcessing transitions APPROVED to PROCESSING', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'r1', status: DataRequestStatus.APPROVED });
    requestRepo.save.mockImplementation(async (x: any) => x);
    const res = await dsr.startProcessing('r1');
    expect(res.status).toBe(DataRequestStatus.PROCESSING);
  });

  it('complete DELETE path runs deletion and notifies deletion_completed', async () => {
    requestRepo.findOne.mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      type: DataRequestType.DELETE,
      regulation: Regulation.GDPR,
      reviewerId: 'rev',
      status: DataRequestStatus.PROCESSING,
    });
    requestRepo.save.mockImplementation(async (x: any) => x);
    const res = await dsr.complete('r1');
    expect(res.status).toBe(DataRequestStatus.COMPLETED);
    expect(res.resultSummary).toMatch(/Deleted .*personal-data records/);
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ event: 'deletion_completed' }));
  });

  it('complete RESTRICT path restricts processing and notifies privacy_request_completed', async () => {
    requestRepo.findOne.mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      type: DataRequestType.RESTRICT,
      regulation: Regulation.GDPR,
      status: DataRequestStatus.PROCESSING,
    });
    requestRepo.save.mockImplementation(async (x: any) => x);
    const res = await dsr.complete('r1', 'custom summary');
    expect(res.resultSummary).toBe('custom summary');
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ event: 'privacy_request_completed' }));
  });

  it('complete OBJECT path notifies with the request type', async () => {
    requestRepo.findOne.mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      type: DataRequestType.OBJECT,
      regulation: Regulation.GDPR,
      status: DataRequestStatus.PROCESSING,
    });
    requestRepo.save.mockImplementation(async (x: any) => x);
    await dsr.complete('r1');
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ event: 'privacy_request_completed' }));
  });

  it('executeDeletion aggregates deleted and anonymized records', async () => {
    const res = await dsr.executeDeletion('u1', Regulation.DPDP);
    expect(res.deletedRecords).toBeGreaterThan(0);
    expect(res.anonymizedRecords).toBeGreaterThan(0);
    expect(res.details.account).toBe(1);
  });

  it('cancel raises NotFound when the user is not the requester', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'r1', userId: 'other', requestedBy: 'other' });
    await expect(dsr.cancel('r1', 'u1', 'x')).rejects.toThrow('Request not found');
  });

  it('cancel rejects non-cancellable statuses', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'r1', userId: 'u1', requestedBy: 'u1', status: DataRequestStatus.COMPLETED });
    await expect(dsr.cancel('r1', 'u1', 'x')).rejects.toThrow('Only pending/in-review requests can be cancelled');
  });

  it('cancel succeeds for the requester with a default reason', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'r1', userId: 'u1', requestedBy: 'u1', status: DataRequestStatus.PENDING });
    requestRepo.save.mockImplementation(async (x: any) => x);
    const res = await dsr.cancel('r1', 'u1');
    expect(res.status).toBe(DataRequestStatus.CANCELLED);
    expect(res.cancellationReason).toBe('User requested cancellation');
  });

  it('getSlaStatus reports breached and not-breached correctly', async () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
    requestRepo.findOne.mockResolvedValueOnce({ id: 'r1', slaDeadline: future });
    const ok = await dsr.getSlaStatus('r1');
    expect(ok.breached).toBe(false);
    requestRepo.findOne.mockResolvedValueOnce({ id: 'r2', slaDeadline: new Date(Date.now() - 1000) });
    const breached = await dsr.getSlaStatus('r2');
    expect(breached.breached).toBe(true);
  });

  it('getSlaStatus handles missing deadline', async () => {
    requestRepo.findOne.mockResolvedValue({ id: 'r1', slaDeadline: undefined });
    const res = await dsr.getSlaStatus('r1');
    expect(res.breached).toBe(true);
    expect(res.hoursRemaining).toBe(0);
  });

  it('findBreachedSlas filters open requests past deadline', async () => {
    requestRepo.find.mockResolvedValue([
      { id: 'a', slaDeadline: new Date(Date.now() - 1000) },
      { id: 'b', slaDeadline: new Date(Date.now() + 100000) },
    ]);
    const res = await dsr.findBreachedSlas();
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('a');
  });

  it('createExport applies defaults for regulation/format/scope', async () => {
    exportRepo.create.mockImplementation((x: any) => ({ id: 'e1', ...x }));
    const res = await dsr.createExport('u1', {});
    expect(res.regulation).toBe(Regulation.GDPR);
    expect(res.format).toBe(ExportFormat.JSON);
    expect(res.scope).toEqual({});
  });

  it('finalizeExport sets provided fields and notifies export_ready', async () => {
    exportRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1', format: ExportFormat.JSON, expiresAt: new Date() });
    exportRepo.save.mockImplementation(async (x: any) => x);
    const res = await dsr.finalizeExport('e1', { filePath: '/p', downloadUrl: '/d', sizeBytes: 10 });
    expect(res.status).toBe(DataRequestStatus.COMPLETED);
    expect(res.filePath).toBe('/p');
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ event: 'export_ready' }));
  });

  it('finalizeExport uses null defaults when not provided', async () => {
    exportRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1', format: ExportFormat.JSON, expiresAt: null });
    exportRepo.save.mockImplementation(async (x: any) => x);
    const res = await dsr.finalizeExport('e1', {});
    expect(res.filePath).toBeNull();
    expect(res.downloadUrl).toBeNull();
    expect(res.sizeBytes).toBe(0);
  });

  it('getExport throws when missing', async () => {
    exportRepo.findOne.mockResolvedValue(null);
    await expect(dsr.getExport('missing')).rejects.toThrow('Export not found');
  });

  it('generateExportContent renders CSV, PDF and JSON', async () => {
    const payload = {
      userId: 'u1',
      exportedAt: '2026-01-01',
      sections: {
        profile: [{ name: 'n', value: 'v' }],
        orders: [{ total: 10 }],
      },
      integritySignature: 'sig',
    };
    jest.spyOn(dsr, 'buildExportPayload').mockResolvedValue(payload as any);

    exportRepo.findOne.mockResolvedValue({ id: 'e-json', userId: 'u1', format: ExportFormat.JSON });
    const json = await dsr.generateExportContent('e-json');
    expect(json.contentType).toBe('application/json');
    expect(json.filename).toBe('spicegarden-data-export-u1.json');

    exportRepo.findOne.mockResolvedValue({ id: 'e-csv', userId: 'u1', format: ExportFormat.CSV });
    const csv = await dsr.generateExportContent('e-csv');
    expect(csv.contentType).toBe('text/csv');
    expect(csv.content).toContain('section,field,value');
    expect(csv.content).toContain('profile,name');

    exportRepo.findOne.mockResolvedValue({ id: 'e-pdf', userId: 'u1', format: ExportFormat.PDF });
    const pdf = await dsr.generateExportContent('e-pdf');
    expect(pdf.contentType).toBe('application/pdf');
    expect(pdf.content).toContain('PROFILE');
  });

  it('buildExportPayload collects sections and signs payload', async () => {
    tableRepo.find.mockResolvedValue([{ id: 'row1' }]);
    const payload = await dsr.buildExportPayload('u1');
    expect(payload.userId).toBe('u1');
    expect(payload.sections.users).toHaveLength(1);
    expect(payload.integritySignature).toBeDefined();
  });
});
