import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LegalDocumentService } from '../src/legal/legal-document.service';
import { LegalIntegrityService } from '../src/legal/integrity.service';
import { ComplianceAuditService } from '../src/legal/compliance-audit.service';
import { LegalNotificationService } from '../src/legal/legal-notification.service';

import { LegalDocumentEntity } from '../src/legal/entities/legal-document.entity';
import { LegalVersionEntity } from '../src/legal/entities/legal-version.entity';
import { LegalAcceptanceEntity } from '../src/legal/entities/legal-acceptance.entity';
import { ComplianceAuditEntity } from '../src/legal/entities/compliance-audit.entity';

import { ApprovalStatus, DocumentStatus } from '../src/legal/entities/legal.enums';

const repo = (): any => ({
  findOne: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
  create: jest.fn((x: any) => ({ id: 'id-1', ...x })),
  save: jest.fn(async (x: any) => (Array.isArray(x) ? x : { id: 'id-1', ...x })),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
});

describe('LegalDocumentService', () => {
  let svc: LegalDocumentService;
  const docRepo: any = repo();
  const versionRepo: any = repo();
  const acceptanceRepo: any = repo();
  const complianceAuditRepo: any = repo();
  const dataSource: any = { getRepository: jest.fn(() => repo()) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalDocumentService,
        LegalIntegrityService,
        ComplianceAuditService,
        { provide: LegalNotificationService, useValue: { notify: jest.fn(), notifyGrievance: jest.fn(), notifyRequestUpdate: jest.fn() } },
        { provide: getRepositoryToken(LegalDocumentEntity), useValue: docRepo },
        { provide: getRepositoryToken(LegalVersionEntity), useValue: versionRepo },
        { provide: getRepositoryToken(LegalAcceptanceEntity), useValue: acceptanceRepo },
        { provide: getRepositoryToken(ComplianceAuditEntity), useValue: complianceAuditRepo },
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    svc = module.get(LegalDocumentService);
  });

  it('rejects duplicate document types', async () => {
    docRepo.findOne.mockResolvedValue({ id: 'd1' });
    await expect(svc.createDocument({ type: 'privacy_policy' as any, title: 'P', sections: [] } as any)).rejects.toThrow(BadRequestException);
  });

  it('creates a document with defaults', async () => {
    docRepo.findOne.mockResolvedValue(null);
    docRepo.create.mockImplementation((x: any) => ({ id: 'd1', ...x }));
    docRepo.save.mockImplementation(async (x: any) => x);
    const doc = await svc.createDocument({ type: 'privacy_policy' as any, title: 'P', sections: [{ id: 's1', heading: 'h', body: 'b', order: 1 }] } as any);
    expect(doc.status).toBe(DocumentStatus.DRAFT);
    expect(doc.ownerRole).toBe('super_admin');
  });

  it('lists documents with filters', async () => {
    docRepo.find.mockResolvedValue([{ id: 'd1', status: DocumentStatus.PUBLISHED }]);
    expect(await svc.listDocuments({ status: DocumentStatus.PUBLISHED })).toHaveLength(1);
    expect(await svc.listDocuments()).toHaveLength(1);
  });

  it('throws on missing document', async () => {
    docRepo.findOne.mockResolvedValue(null);
    await expect(svc.getDocument('nope' as any)).rejects.toThrow(NotFoundException);
  });

  it('creates a version', async () => {
    docRepo.findOne.mockResolvedValue({ id: 'd1', type: 'privacy_policy', currentVersion: 1, defaultLanguage: 'en' });
    versionRepo.findOne.mockResolvedValue(null);
    versionRepo.create.mockImplementation((x: any) => ({ id: 'v1', ...x }));
    versionRepo.save.mockImplementation(async (x: any) => x);
    const v = await svc.createVersion('d1', { title: 'T', sections: [], language: 'en' } as any);
    expect(v.version).toBe(2);
    expect(v.approvalStatus).toBe(ApprovalStatus.PENDING);
  });

  it('lists and gets versions', async () => {
    versionRepo.find.mockResolvedValue([{ id: 'v1' }]);
    expect(await svc.listVersions('d1')).toHaveLength(1);
    versionRepo.findOne.mockResolvedValue({ id: 'v1' });
    expect(await svc.getVersion('v1')).toBeTruthy();
    versionRepo.findOne.mockResolvedValue(null);
    await expect(svc.getVersion('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns null when no published version', async () => {
    docRepo.findOne.mockResolvedValue({ id: 'd1', type: 'privacy_policy' });
    versionRepo.findOne.mockResolvedValue(null);
    expect(await svc.getPublishedVersion('privacy_policy' as any)).toBeNull();
  });

  it('publishes an approved version and marks prior superseded', async () => {
    versionRepo.findOne.mockResolvedValue({ id: 'v2', documentId: 'd1', version: 2, approvalStatus: ApprovalStatus.APPROVED, language: 'en' });
    docRepo.findOne.mockResolvedValue({ id: 'd1' });
    versionRepo.find.mockResolvedValue([{ id: 'v1', documentId: 'd1', language: 'en', approvalStatus: ApprovalStatus.APPROVED }]);
    versionRepo.save.mockImplementation(async (x: any) => x);
    docRepo.save.mockImplementation(async (x: any) => x);
    const pub = await svc.publishVersion('v2', 'admin');
    expect(pub.workflowState).toBe('published');
  });

  it('accepts a document version and withdraws', async () => {
    versionRepo.findOne.mockResolvedValue({ id: 'v1', documentId: 'd1', version: 1 });
    docRepo.findOne.mockResolvedValue({ id: 'd1', type: 'privacy_policy' });
    acceptanceRepo.create.mockImplementation((x: any) => ({ id: 'a1', ...x }));
    acceptanceRepo.save.mockImplementation(async (x: any) => x);
    const acc = await svc.acceptDocument('u1', 'd1', 'v1', { ipAddress: '1.1.1.1' });
    expect(acc.id).toBe('a1');

    acceptanceRepo.findOne.mockResolvedValue({ id: 'a1', userId: 'u1', withdrawn: false, save: jest.fn(async function (this: any) { return this; }) });
    const w = await svc.withdrawAcceptance('a1', 'u1');
    expect(w.withdrawn).toBe(true);
  });

  it('withdrawAcceptance throws when not found', async () => {
    acceptanceRepo.findOne.mockResolvedValue(null);
    await expect(svc.withdrawAcceptance('a1', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('getUserAcceptances and hasAcceptedCurrent', async () => {
    acceptanceRepo.find.mockResolvedValue([{ id: 'a1', userId: 'u1', documentId: 'd1', version: 1, withdrawn: false }]);
    expect(await svc.getUserAcceptances('u1')).toHaveLength(1);
    docRepo.findOne.mockResolvedValue({ id: 'd1', type: 'privacy_policy' });
    versionRepo.findOne.mockResolvedValue({ id: 'v1', documentId: 'd1', version: 1, approvalStatus: ApprovalStatus.APPROVED, language: 'en' });
    acceptanceRepo.findOne.mockResolvedValue({ id: 'a1', userId: 'u1', documentId: 'd1', version: 1, withdrawn: false });
    expect(await svc.hasAcceptedCurrent('u1', 'privacy_policy' as any)).toBe(true);
  });
});
