import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AgreementEntity,
  AgreementAcceptanceEntity,
} from './entities';
import {
  AgreementParty,
  ApprovalStatus,
  DocumentStatus,
} from './entities/legal.enums';
import { LegalIntegrityService } from './integrity.service';
import { ComplianceAuditService } from './compliance-audit.service';
import { LegalEncryptionService } from './legal-encryption.service';

export interface CreateAgreementInput {
  party: AgreementParty;
  type: string;
  title: string;
  content: string;
  clauses?: { id: string; title: string; text: string }[];
  language?: string;
  authorId?: string;
  effectiveDate?: string | Date;
  expiresAt?: string | Date;
  changeNotes?: string;
}

@Injectable()
export class AgreementService {
  private readonly logger = new Logger(AgreementService.name);

  constructor(
    @InjectRepository(AgreementEntity)
    private readonly repo: Repository<AgreementEntity>,
    @InjectRepository(AgreementAcceptanceEntity)
    private readonly acceptanceRepo: Repository<AgreementAcceptanceEntity>,
    private readonly integrity: LegalIntegrityService,
    private readonly audit: ComplianceAuditService,
    private readonly encryption: LegalEncryptionService,
  ) {}

  async create(input: CreateAgreementInput): Promise<AgreementEntity> {
    const last = await this.repo.findOne({
      where: { party: input.party, type: input.type },
      order: { version: 'DESC' },
    });
    const version = (last?.version ?? 0) + 1;
    const contentHash = this.integrity.hashContent({ content: input.content, clauses: input.clauses });
    const agreement = this.repo.create({
      party: input.party,
      type: input.type,
      title: input.title,
      version,
      status: DocumentStatus.DRAFT,
      approvalStatus: ApprovalStatus.PENDING,
      content: this.encryption.encrypt(input.content),
      clauses: input.clauses || [],
      language: input.language || 'en',
      authorId: input.authorId,
      effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : undefined,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      changeNotes: input.changeNotes,
      contentHash,
    });
    agreement.signatureTemplate = this.integrity.sign({ party: agreement.party, type: agreement.type, version, contentHash });
    const saved = await this.repo.save(agreement);
    await this.audit.record({
      action: 'agreement_created',
      category: 'agreement',
      actorId: input.authorId,
      entityType: 'agreements',
      entityId: saved.id,
      metadata: { party: input.party, type: input.type, version },
    });
    return saved;
  }

  async approve(id: string, approverId: string): Promise<AgreementEntity> {
    const agreement = await this.repo.findOne({ where: { id } });
    if (!agreement) throw new NotFoundException('Agreement not found');
    agreement.approvalStatus = ApprovalStatus.APPROVED;
    agreement.approverId = approverId;
    agreement.approvedAt = new Date();
    agreement.status = DocumentStatus.PUBLISHED;
    const saved = await this.repo.save(agreement);
    await this.audit.record({
      action: 'agreement_approved',
      category: 'agreement',
      actorId: approverId,
      entityType: 'agreements',
      entityId: saved.id,
    });
    return saved;
  }

  async list(filter?: { party?: AgreementParty; type?: string; status?: DocumentStatus }): Promise<AgreementEntity[]> {
    const where: Record<string, any> = {};
    if (filter?.party) where.party = filter.party;
    if (filter?.type) where.type = filter.type;
    if (filter?.status) where.status = filter.status;
    return (await this.repo.find({ where, order: { createdAt: 'DESC' } })).map((a) => this.decryptEntity(a));
  }

  async getCurrent(party: AgreementParty, type: string): Promise<AgreementEntity | null> {
    const found = await this.repo.findOne({
      where: { party, type, status: DocumentStatus.PUBLISHED, approvalStatus: ApprovalStatus.APPROVED },
      order: { version: 'DESC' },
    });
    return found ? this.decryptEntity(found) : null;
  }

  async get(id: string): Promise<AgreementEntity> {
    const agreement = await this.repo.findOne({ where: { id } });
    if (!agreement) throw new NotFoundException('Agreement not found');
    return this.decryptEntity(agreement);
  }

  private decryptEntity(agreement: AgreementEntity): AgreementEntity {
    if (agreement && this.encryption.isEncrypted(agreement.content)) {
      try {
        agreement.content = this.encryption.decrypt(agreement.content);
      } catch {
        /* keep ciphertext if decryption fails */
      }
    }
    return agreement;
  }

  async accept(
    agreementId: string,
    party: { userId?: string; partyId?: string; partyType: string },
    ctx: { ipAddress?: string; userAgent?: string; signature?: string },
  ): Promise<AgreementAcceptanceEntity> {
    const agreement = await this.get(agreementId);
    if (agreement.status !== DocumentStatus.PUBLISHED) {
      throw new BadRequestException('Agreement is not published');
    }
    const acceptedAt = new Date();
    const digitalSignature = this.integrity.sign({
      agreementId,
      userId: party.userId,
      partyId: party.partyId,
      version: agreement.version,
      timestamp: acceptedAt.toISOString(),
    });
    const acceptance = this.acceptanceRepo.create({
      agreementId,
      userId: party.userId,
      partyId: party.partyId,
      partyType: party.partyType,
      version: agreement.version,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      signature: ctx.signature,
      digitalSignature,
      acceptedAt,
    });
    const saved = await this.acceptanceRepo.save(acceptance);
    await this.audit.record({
      action: 'agreement_accepted',
      category: 'agreement',
      actorId: party.userId || party.partyId,
      entityType: 'agreement_acceptances',
      entityId: saved.id,
      metadata: { agreementId, version: agreement.version, party: agreement.party },
    });
    return saved;
  }

  async listAcceptances(filter: { agreementId?: string; userId?: string; partyId?: string }): Promise<AgreementAcceptanceEntity[]> {
    const where: Record<string, any> = {};
    if (filter.agreementId) where.agreementId = filter.agreementId;
    if (filter.userId) where.userId = filter.userId;
    if (filter.partyId) where.partyId = filter.partyId;
    return this.acceptanceRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async verifyAcceptance(acceptanceId: string): Promise<boolean> {
    const acceptance = await this.acceptanceRepo.findOne({ where: { id: acceptanceId } });
    if (!acceptance) return false;
    return this.integrity.verify(
      {
        agreementId: acceptance.agreementId,
        userId: acceptance.userId,
        partyId: acceptance.partyId,
        version: acceptance.version,
        timestamp: acceptance.acceptedAt?.toISOString(),
      },
      acceptance.digitalSignature || '',
    );
  }
}
