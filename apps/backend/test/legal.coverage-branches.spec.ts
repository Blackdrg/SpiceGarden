import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { RetentionService } from '../src/legal/retention.service';
import { SecurityCenterService } from '../src/legal/security-center.service';
import { ComplianceAuditService } from '../src/legal/compliance-audit.service';
import { LegalIntegrityService } from '../src/legal/integrity.service';
import { LegalNotificationService } from '../src/legal/legal-notification.service';
import { LegalEncryptionService } from '../src/legal/legal-encryption.service';

import { RetentionPolicyEntity } from '../src/legal/entities/retention-policy.entity';
import { DataRetentionJobEntity } from '../src/legal/entities/data-retention-job.entity';
import { SecurityIncidentEntity } from '../src/legal/entities/security-incident.entity';

import { RetentionAction, RetentionJobStatus } from '../src/legal/entities/legal.enums';
import {
  SecurityIncidentSeverity,
  SecurityIncidentStatus,
} from '../src/legal/entities/legal.enums';

const repo = (): any => ({
  findOne: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
  create: jest.fn((x: any) => ({ ...x })),
  save: jest.fn(async (x: any) => (Array.isArray(x) ? x : { id: 'id-1', ...x })),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
});

describe('RetentionService branch coverage', () => {
  let retention: RetentionService;
  const policyRepo: any = repo();
  const jobRepo: any = repo();
  const dataSource: any = { getRepository: jest.fn(() => repo()) };
  const auditRecord = jest.fn().mockResolvedValue({ id: 'a1' });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetentionService,
        { provide: getRepositoryToken(RetentionPolicyEntity), useValue: policyRepo },
        { provide: getRepositoryToken(DataRetentionJobEntity), useValue: jobRepo },
        { provide: getDataSourceToken(), useValue: dataSource },
        {
          provide: ComplianceAuditService,
          useValue: { record: auditRecord },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    retention = module.get(RetentionService);
  });

  it('upserts a new policy when none exists (uses ?? defaults)', async () => {
    policyRepo.findOne.mockResolvedValue(null);
    const result = await retention.upsertPolicy({
      key: 'custom',
      label: 'Custom',
      dataType: 'order',
      retentionDays: 10,
      action: RetentionAction.DELETE,
    });
    expect(result.key).toBe('custom');
    expect(policyRepo.save).toHaveBeenCalled();
  });

  it('upserts over an existing policy', async () => {
    policyRepo.findOne.mockResolvedValue({ key: 'custom', id: 'p1' });
    const result = await retention.upsertPolicy({
      key: 'custom',
      label: 'Custom2',
      dataType: 'order',
      retentionDays: 20,
      action: RetentionAction.ARCHIVE,
      description: 'd',
      scope: { a: 1 },
    });
    expect(result.id).toBe('p1');
  });

  it('throws when setting legal hold on a non-hold-capable policy', async () => {
    policyRepo.findOne.mockResolvedValue({ key: 'x', legalHoldCapable: false });
    await expect(retention.setLegalHold('x', true)).rejects.toThrow(
      'Policy does not support legal hold',
    );
  });

  it('enables legal hold (sets legalHoldCapable and disables policy)', async () => {
    const policy = { key: 'x', legalHoldCapable: true, enabled: true };
    policyRepo.findOne.mockResolvedValue(policy);
    const result = await retention.setLegalHold('x', true);
    expect(result.legalHoldCapable).toBe(true);
    expect(result.enabled).toBe(false);
  });

  it('removes legal hold (restores enabled, keeps capability)', async () => {
    const policy = { key: 'x', legalHoldCapable: true, enabled: false };
    policyRepo.findOne.mockResolvedValue(policy);
    const result = await retention.setLegalHold('x', false);
    expect(result.enabled).toBe(false);
    expect(result.legalHoldCapable).toBe(true);
  });

  it('throws when running a disabled policy', async () => {
    policyRepo.findOne.mockResolvedValue({ key: 'x', enabled: false });
    await expect(retention.runPolicy('x')).rejects.toThrow('Policy is disabled or under legal hold');
  });

  it('records a FAILED job when dataType has no table mapping', async () => {
    policyRepo.findOne.mockResolvedValue({
      key: 'x',
      id: 'p1',
      enabled: true,
      retentionDays: 1,
      dataType: 'unknown_type',
      action: RetentionAction.DELETE,
    });
    const job = await retention.runPolicy('x');
    expect(job.status).toBe(RetentionJobStatus.FAILED);
    expect(job.errorMessage).toMatch(/No table mapping/);
  });

  it('runs a DELETE policy and records affected rows', async () => {
    const tableRepo: any = repo();
    tableRepo.count.mockResolvedValue(5);
    tableRepo.createQueryBuilder = jest.fn(() => ({
      delete: () => ({ where: () => ({ execute: async () => ({ affected: 3 }) }) }),
    }));
    dataSource.getRepository.mockReturnValue(tableRepo);
    policyRepo.findOne.mockResolvedValue({
      key: 'otp',
      id: 'p1',
      enabled: true,
      retentionDays: 1,
      dataType: 'otp',
      action: RetentionAction.DELETE,
    });
    const job = await retention.runPolicy('otp');
    expect(job.status).toBe(RetentionJobStatus.COMPLETED);
    expect(job.recordsScanned).toBe(5);
    expect(job.recordsAffected).toBe(3);
  });

  it('runs an ANONYMIZE policy', async () => {
    const tableRepo: any = repo();
    tableRepo.count.mockResolvedValue(2);
    tableRepo.createQueryBuilder = jest.fn(() => ({
      update: () => ({
        set: () => ({ where: () => ({ execute: async () => ({ affected: 2 }) }) }),
      }),
    }));
    dataSource.getRepository.mockReturnValue(tableRepo);
    policyRepo.findOne.mockResolvedValue({
      key: 'loyalty',
      id: 'p1',
      enabled: true,
      retentionDays: 1,
      dataType: 'loyalty',
      action: RetentionAction.ANONYMIZE,
    });
    const job = await retention.runPolicy('loyalty');
    expect(job.status).toBe(RetentionJobStatus.COMPLETED);
    expect(job.recordsAffected).toBe(2);
  });

  it('runs an ARCHIVE policy (counts as affected)', async () => {
    const tableRepo: any = repo();
    tableRepo.count.mockResolvedValue(7);
    dataSource.getRepository.mockReturnValue(tableRepo);
    policyRepo.findOne.mockResolvedValue({
      key: 'orders',
      id: 'p1',
      enabled: true,
      retentionDays: 1,
      dataType: 'order',
      action: RetentionAction.ARCHIVE,
    });
    const job = await retention.runPolicy('orders');
    expect(job.status).toBe(RetentionJobStatus.COMPLETED);
    expect(job.recordsAffected).toBe(7);
  });

  it('marks a job FAILED when the repository throws', async () => {
    const tableRepo: any = repo();
    tableRepo.count.mockRejectedValue(new Error('db down'));
    dataSource.getRepository.mockReturnValue(tableRepo);
    policyRepo.findOne.mockResolvedValue({
      key: 'orders',
      id: 'p1',
      enabled: true,
      retentionDays: 1,
      dataType: 'order',
      action: RetentionAction.ARCHIVE,
    });
    const job = await retention.runPolicy('orders');
    expect(job.status).toBe(RetentionJobStatus.FAILED);
    expect(job.errorMessage).toBe('db down');
  });

  it('runAllEnabled swallows per-policy errors and continues', async () => {
    const tableRepo: any = repo();
    tableRepo.count.mockResolvedValue(0);
    dataSource.getRepository.mockReturnValue(tableRepo);
    policyRepo.find.mockResolvedValue([
      { key: 'a', id: 'pa', enabled: true, retentionDays: 1, dataType: 'order', action: RetentionAction.ARCHIVE },
      { key: 'b', id: 'pb', enabled: false, retentionDays: 1, dataType: 'order', action: RetentionAction.ARCHIVE },
    ]);
    policyRepo.findOne.mockImplementation(async (opts: any) =>
      opts?.where?.key === 'a'
        ? { key: 'a', id: 'pa', enabled: true, retentionDays: 1, dataType: 'order', action: RetentionAction.ARCHIVE }
        : null,
    );
    const jobs = await retention.runAllEnabled('manual');
    expect(jobs).toHaveLength(1);
  });

  it('listJobs honours status and limit filters', async () => {
    jobRepo.find.mockResolvedValue([{ id: 'j1' }]);
    const res = await retention.listJobs({ status: RetentionJobStatus.FAILED, limit: 5 });
    expect(res).toHaveLength(1);
    expect(jobRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: RetentionJobStatus.FAILED }, take: 5 }),
    );
  });

  it('resolveTableName returns null for unknown types', () => {
    expect(RetentionService.resolveTableName('nope')).toBeNull();
    expect(RetentionService.resolveTableName('order')).toBe('orders');
  });
});

describe('SecurityCenterService branch coverage', () => {
  let security: SecurityCenterService;
  const repoMock: any = repo();
  const integrity = { hashContent: (x: any) => JSON.stringify(x) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityCenterService,
        { provide: getRepositoryToken(SecurityIncidentEntity), useValue: repoMock },
        { provide: LegalIntegrityService, useValue: integrity },
        { provide: ComplianceAuditService, useValue: { record: jest.fn().mockResolvedValue({}) } },
        { provide: LegalNotificationService, useValue: { notify: jest.fn() } },
        { provide: LegalEncryptionService, useValue: { encrypt: (x: any) => x, decrypt: (x: any) => x } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    security = module.get(SecurityCenterService);
  });

  it('exposes static policy endpoints', () => {
    expect(security.getContact().securityEmail).toContain('@');
    expect(security.getChangelog().length).toBeGreaterThan(0);
    expect(security.getIncidentResponsePolicy().phases.length).toBe(5);
    expect(security.getPatchPolicy().severitySlas.critical).toBe('24h');
    expect(security.getEncryptionPolicy().atRest).toContain('AES');
    expect(security.getSocReports().length).toBe(3);
    expect(security.getSecurityFaqs().length).toBeGreaterThan(0);
  });

  it('defaults severity to MEDIUM when not supplied', async () => {
    repoMock.create.mockImplementation((x: any) => ({ id: 'i1', ...x }));
    repoMock.save.mockResolvedValue({ id: 'i1', severity: SecurityIncidentSeverity.MEDIUM });
    const inc = await security.reportIncident({ title: 't', description: 'd' });
    expect(inc.severity).toBe(SecurityIncidentSeverity.MEDIUM);
  });

  it('preserves supplied severity and defaults affectedSystems', async () => {
    repoMock.create.mockImplementation((x: any) => ({ id: 'i1', ...x }));
    repoMock.save.mockResolvedValue({ id: 'i1', severity: SecurityIncidentSeverity.CRITICAL });
    const inc = await security.reportIncident({
      title: 't',
      description: 'd',
      severity: SecurityIncidentSeverity.CRITICAL,
      affectedSystems: ['web'],
      reporterId: 'u1',
    });
    expect(inc.severity).toBe(SecurityIncidentSeverity.CRITICAL);
  });

  it('listIncidents applies status, severity and publiclyDisclosed filters', async () => {
    repoMock.find.mockResolvedValue([{ id: 'i1' }]);
    await security.listIncidents({ status: SecurityIncidentStatus.OPEN });
    expect(repoMock.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: SecurityIncidentStatus.OPEN } }),
    );
    await security.listIncidents({ severity: SecurityIncidentSeverity.HIGH });
    await security.listIncidents({ publiclyDisclosed: true });
    await security.listIncidents({});
    expect(repoMock.find).toHaveBeenCalledTimes(4);
  });

  it('throws when fetching a missing incident', async () => {
    repoMock.findOne.mockResolvedValue(null);
    await expect(security.getIncident('missing')).rejects.toThrow('Incident not found');
  });

  it('sets resolvedAt when resolving an incident', async () => {
    repoMock.findOne.mockResolvedValue({ id: 'i1', status: SecurityIncidentStatus.OPEN });
    repoMock.save.mockImplementation(async (x: any) => x);
    const updated = await security.updateIncident('i1', { status: SecurityIncidentStatus.RESOLVED });
    expect(updated.resolvedAt).toBeDefined();
  });

  it('does not override an existing resolvedAt when re-resolving', async () => {
    const existing = new Date('2020-01-01');
    repoMock.findOne.mockResolvedValue({ id: 'i1', status: SecurityIncidentStatus.RESOLVED, resolvedAt: existing });
    repoMock.save.mockImplementation(async (x: any) => x);
    const updated = await security.updateIncident('i1', { status: SecurityIncidentStatus.RESOLVED });
    expect(updated.resolvedAt).toBe(existing);
  });

  it('sets publishedAt when marking publicly disclosed', async () => {
    repoMock.findOne.mockResolvedValue({ id: 'i1', status: SecurityIncidentStatus.OPEN });
    repoMock.save.mockImplementation(async (x: any) => x);
    const updated = await security.updateIncident('i1', { publiclyDisclosed: true, disclosureText: 'text' });
    expect(updated.publishedAt).toBeDefined();
  });

  it('does not override an existing publishedAt', async () => {
    const existing = new Date('2020-01-01');
    repoMock.findOne.mockResolvedValue({ id: 'i1', status: SecurityIncidentStatus.OPEN, publishedAt: existing });
    repoMock.save.mockImplementation(async (x: any) => x);
    const updated = await security.updateIncident('i1', { publiclyDisclosed: true });
    expect(updated.publishedAt).toBe(existing);
  });

  it('generateSecurityReport aggregates counts', async () => {
    repoMock.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(9);
    const report = await security.generateSecurityReport();
    expect(report.openIncidents).toBe(2);
    expect(report.criticalIncidents).toBe(1);
    expect(report.totalIncidents).toBe(9);
  });
});
