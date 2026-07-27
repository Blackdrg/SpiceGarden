import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  LegalDocumentEntity,
  LegalVersionEntity,
  LegalAcceptanceEntity,
} from './entities';
import {
  LegalDocumentType,
  DocumentStatus,
  ApprovalStatus,
} from './entities/legal.enums';
import { LegalIntegrityService } from './integrity.service';
import { ComplianceAuditService } from './compliance-audit.service';
import { LegalNotificationService } from './legal-notification.service';

export interface CreateDocumentInput {
  type: LegalDocumentType;
  title: string;
  slug?: string;
  ownerRole?: string;
  requiresAcceptance?: boolean;
  multiLanguage?: boolean;
  defaultLanguage?: string;
}

export interface CreateVersionInput {
  title: string;
  sections: { id: string; title: string; content: string; order: number }[];
  summary?: string;
  language?: string;
  changeNotes?: string;
  authorId?: string;
  effectiveDate?: string | Date;
}

@Injectable()
export class LegalDocumentService {
  private readonly logger = new Logger(LegalDocumentService.name);

  constructor(
    @InjectRepository(LegalDocumentEntity)
    private readonly docRepo: Repository<LegalDocumentEntity>,
    @InjectRepository(LegalVersionEntity)
    private readonly versionRepo: Repository<LegalVersionEntity>,
    @InjectRepository(LegalAcceptanceEntity)
    private readonly acceptanceRepo: Repository<LegalAcceptanceEntity>,
    private readonly integrity: LegalIntegrityService,
    private readonly audit: ComplianceAuditService,
    private readonly notifications: LegalNotificationService,
  ) {}

  async createDocument(input: CreateDocumentInput): Promise<LegalDocumentEntity> {
    const existing = await this.docRepo.findOne({ where: { type: input.type } });
    if (existing) {
      throw new BadRequestException(`Document of type ${input.type} already exists`);
    }
    const doc = this.docRepo.create({
      type: input.type,
      title: input.title,
      slug: input.slug || input.type,
      ownerRole: input.ownerRole || 'super_admin',
      requiresAcceptance: input.requiresAcceptance ?? true,
      multiLanguage: input.multiLanguage ?? true,
      defaultLanguage: input.defaultLanguage || 'en',
      status: DocumentStatus.DRAFT,
      currentVersion: 0,
      approvalStatus: ApprovalStatus.PENDING,
      workflowState: 'draft',
    });
    const saved = await this.docRepo.save(doc);
    await this.audit.record({
      action: 'document_created',
      category: 'legal_document',
      actorId: input.ownerRole,
      entityType: 'legal_documents',
      entityId: saved.id,
      metadata: { type: input.type },
    });
    return saved;
  }

  async listDocuments(filter?: { status?: DocumentStatus; type?: LegalDocumentType }): Promise<LegalDocumentEntity[]> {
    const where: Record<string, any> = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.type) where.type = filter.type;
    return this.docRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getDocument(type: LegalDocumentType): Promise<LegalDocumentEntity> {
    const doc = await this.docRepo.findOne({ where: { type } });
    if (!doc) throw new NotFoundException(`Document ${type} not found`);
    return doc;
  }

  async createVersion(documentId: string, input: CreateVersionInput): Promise<LegalVersionEntity> {
    const doc = await this.docRepo.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    const lastVersion = await this.versionRepo.findOne({
      where: { documentId, language: input.language || doc.defaultLanguage },
      order: { version: 'DESC' },
    });
    const nextVersion = (lastVersion?.version ?? doc.currentVersion) + 1;

    const contentHash = this.integrity.hashContent({
      title: input.title,
      sections: input.sections,
      language: input.language || doc.defaultLanguage,
    });

    const version = this.versionRepo.create({
      documentId,
      documentType: doc.type,
      version: nextVersion,
      approvalStatus: ApprovalStatus.PENDING,
      title: input.title,
      sections: input.sections,
      summary: input.summary,
      language: input.language || doc.defaultLanguage,
      changeNotes: input.changeNotes,
      authorId: input.authorId,
      effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : undefined,
      contentHash,
      workflowState: 'draft',
    });
    version.signature = this.integrity.sign({ documentId, version: nextVersion, contentHash });
    const saved = await this.versionRepo.save(version);
    await this.audit.record({
      action: 'version_created',
      category: 'legal_document',
      actorId: input.authorId,
      entityType: 'legal_versions',
      entityId: saved.id,
      metadata: { documentId, version: nextVersion },
    });
    return saved;
  }

  async listVersions(documentId: string, language?: string): Promise<LegalVersionEntity[]> {
    const where: Record<string, any> = { documentId };
    if (language) where.language = language;
    return this.versionRepo.find({ where, order: { version: 'DESC' } });
  }

  async getVersion(versionId: string): Promise<LegalVersionEntity> {
    const version = await this.versionRepo.findOne({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Version not found');
    return version;
  }

  async getPublishedVersion(
    type: LegalDocumentType,
    language = 'en',
  ): Promise<{ document: LegalDocumentEntity; version: LegalVersionEntity } | null> {
    const doc = await this.docRepo.findOne({ where: { type } });
    if (!doc) return null;
    const version = await this.versionRepo.findOne({
      where: { documentId: doc.id, language, approvalStatus: ApprovalStatus.APPROVED },
      order: { version: 'DESC' },
    });
    if (!version) return null;
    return { document: doc, version };
  }

  async approveVersion(
    versionId: string,
    approverId: string,
    notes?: string,
  ): Promise<LegalVersionEntity> {
    const version = await this.versionRepo.findOne({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Version not found');
    version.approvalStatus = ApprovalStatus.APPROVED;
    version.approverId = approverId;
    version.approvedAt = new Date();
    version.workflowState = 'approved';
    if (notes) version.changeNotes = `${version.changeNotes || ''}\nApproval: ${notes}`.trim();
    const saved = await this.versionRepo.save(version);
    await this.audit.record({
      action: 'version_approved',
      category: 'legal_document',
      actorId: approverId,
      entityType: 'legal_versions',
      entityId: saved.id,
      metadata: { documentId: saved.documentId, version: saved.version },
    });
    return saved;
  }

  async publishVersion(versionId: string, approverId: string): Promise<LegalVersionEntity> {
    const version = await this.versionRepo.findOne({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Version not found');
    if (version.approvalStatus !== ApprovalStatus.APPROVED) {
      throw new BadRequestException('Cannot publish a version that is not approved');
    }
    const doc = await this.docRepo.findOne({ where: { id: version.documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    const priorPublished = await this.versionRepo.findOne({
      where: { documentId: doc.id, language: version.language, approvalStatus: ApprovalStatus.APPROVED },
      order: { version: 'DESC' },
    });
    if (priorPublished && priorPublished.id !== version.id) {
      priorPublished.workflowState = 'superseded';
      await this.versionRepo.save(priorPublished);
    }

    version.workflowState = 'published';
    version.effectiveDate = version.effectiveDate || new Date();
    const savedVersion = await this.versionRepo.save(version);

    doc.currentVersion = version.version;
    doc.status = DocumentStatus.PUBLISHED;
    doc.approvalStatus = ApprovalStatus.APPROVED;
    doc.approverId = approverId;
    doc.approvedAt = new Date();
    doc.workflowState = 'published';
    await this.docRepo.save(doc);

    await this.audit.record({
      action: 'version_published',
      category: 'legal_document',
      actorId: approverId,
      entityType: 'legal_versions',
      entityId: savedVersion.id,
      metadata: { documentId: doc.id, version: savedVersion.version, type: doc.type },
    });

    if (doc.requiresAcceptance) {
      await this.notifyPolicyUpdate(doc, savedVersion);
    }
    return savedVersion;
  }

  private async notifyPolicyUpdate(
    doc: LegalDocumentEntity,
    version: LegalVersionEntity,
  ): Promise<void> {
    try {
      const acceptances = await this.acceptanceRepo.find({
        where: { documentType: doc.type, withdrawn: false },
        take: 5000,
      });
      const userIds = Array.from(new Set(acceptances.flatMap((a) => a.userId ? [a.userId] : [])));
      await Promise.all(userIds.map((userId) => this.notifications.notify({
        userId,
        event: 'policy_updated',
        title: `${doc.title} updated`,
        body: `We've updated ${doc.title} (v${version.version}). Please review the changes to stay compliant.`,
        metadata: { type: doc.type, version: version.version },
      })));
    } catch (error) {
      this.logger.warn(`Policy update notification skipped: ${(error as Error).message}`);
    }
  }

  async rollback(documentId: string, targetVersionId: string, actorId: string): Promise<LegalVersionEntity> {
    const doc = await this.docRepo.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    const target = await this.versionRepo.findOne({ where: { id: targetVersionId, documentId } });
    if (!target) throw new NotFoundException('Target version not found');
    return this.publishVersion(target.id, actorId);
  }

  async acceptDocument(
    userId: string,
    documentId: string,
    versionId: string,
    ctx: { ipAddress?: string; userAgent?: string; method?: string },
  ): Promise<LegalAcceptanceEntity> {
    const version = await this.versionRepo.findOne({ where: { id: versionId, documentId } });
    if (!version) throw new NotFoundException('Version not found');
    const doc = await this.docRepo.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    const acceptance = this.acceptanceRepo.create({
      userId,
      documentId,
      versionId,
      version: version.version,
      documentType: doc.type,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      acceptanceMethod: ctx.method || 'click_accept',
      acceptedAt: new Date(),
    });
    acceptance.signature = this.integrity.sign({ userId, documentId, versionId, version: version.version });
    const saved = await this.acceptanceRepo.save(acceptance);
    await this.audit.record({
      action: 'document_accepted',
      category: 'legal_acceptance',
      actorId: userId,
      entityType: 'legal_acceptances',
      entityId: saved.id,
      ipAddress: ctx.ipAddress,
      metadata: { documentId, version: version.version, type: doc.type },
    });
    return saved;
  }

  async getUserAcceptances(userId: string, documentType?: string): Promise<LegalAcceptanceEntity[]> {
    const where: Record<string, any> = { userId, withdrawn: false };
    if (documentType) where.documentType = documentType;
    return this.acceptanceRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async hasAcceptedCurrent(userId: string, type: LegalDocumentType): Promise<boolean> {
    const published = await this.getPublishedVersion(type);
    if (!published) return false;
    const acceptance = await this.acceptanceRepo.findOne({
      where: { userId, documentId: published.document.id, version: published.version.version, withdrawn: false },
    });
    return !!acceptance;
  }

  async withdrawAcceptance(acceptanceId: string, userId: string): Promise<LegalAcceptanceEntity> {
    const acceptance = await this.acceptanceRepo.findOne({ where: { id: acceptanceId, userId } });
    if (!acceptance) throw new NotFoundException('Acceptance not found');
    acceptance.withdrawn = true;
    acceptance.withdrawnAt = new Date();
    const saved = await this.acceptanceRepo.save(acceptance);
    await this.audit.record({
      action: 'acceptance_withdrawn',
      category: 'legal_acceptance',
      actorId: userId,
      entityType: 'legal_acceptances',
      entityId: saved.id,
    });
    return saved;
  }
}
