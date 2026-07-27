import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Request } from 'express';
import { ComplianceAuditEntity } from './entities/compliance-audit.entity';
import { LegalIntegrityService } from './integrity.service';

export interface ComplianceAuditInput {
  action: string;
  category: string;
  actorId?: string | null;
  actorRole?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, any>;
}

@Injectable()
export class ComplianceAuditService {
  private readonly logger = new Logger(ComplianceAuditService.name);

  constructor(
    @InjectRepository(ComplianceAuditEntity)
    private readonly repo: Repository<ComplianceAuditEntity>,
    private readonly integrity: LegalIntegrityService,
  ) {}

  async record(input: ComplianceAuditInput, request?: Request | null): Promise<ComplianceAuditEntity> {
    const ip = input.ipAddress || (request ? (request.ip || request.socket?.remoteAddress || null) : null);
    const record = this.repo.create({
      action: input.action,
      category: input.category,
      actorId: input.actorId ?? null,
      actorRole: input.actorRole ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      ipAddress: ip,
      metadata: input.metadata ?? {},
    } as DeepPartial<ComplianceAuditEntity>);

    const signature = this.integrity.sign({
      action: record.action,
      category: record.category,
      actorId: record.actorId,
      entityType: record.entityType,
      entityId: record.entityId,
      metadata: record.metadata,
      createdAt: record.createdAt,
    });
    record.signature = signature;
    record.contentHash = this.integrity.hashContent(record.metadata || {});

    try {
      const saved = await this.repo.save(record);
      this.logger.log(`Compliance audit: ${input.action} / ${input.category} by ${input.actorId || 'system'}`);
      return saved;
    } catch (error) {
      this.logger.error('Failed to write compliance audit record', error as Error);
      return record;
    }
  }

  async verifyIntegrity(record: ComplianceAuditEntity): Promise<boolean> {
    return this.integrity.verify(
      {
        action: record.action,
        category: record.category,
        actorId: record.actorId,
        entityType: record.entityType,
        entityId: record.entityId,
        metadata: record.metadata,
        createdAt: record.createdAt,
      },
      record.signature || '',
    );
  }

  async list(filter: {
    category?: string;
    actorId?: string;
    entityType?: string;
    entityId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ComplianceAuditEntity[]> {
    const where: Record<string, any> = {};
    if (filter.category) where.category = filter.category;
    if (filter.actorId) where.actorId = filter.actorId;
    if (filter.entityType) where.entityType = filter.entityType;
    if (filter.entityId) where.entityId = filter.entityId;
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      take: filter.limit ?? 100,
      skip: filter.offset ?? 0,
    });
  }

  async scanForTampering(limit = 500): Promise<{ checked: number; tampered: number; ids: string[] }> {
    const records = await this.repo.find({ order: { createdAt: 'DESC' }, take: limit });
    const results = await Promise.all(records.map(record => this.verifyIntegrity(record)));
    const tamperedIds: string[] = [];
    const tamperedRecords = records.filter((r, i) => !results[i] && !r.tampered);
    await Promise.all(tamperedRecords.map(r => this.repo.update(r.id, { tampered: true })));
    tamperedIds.push(...tamperedRecords.map(r => r.id));
    return { checked: records.length, tampered: tamperedIds.length, ids: tamperedIds };
  }
}
