import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrievanceEntity } from './entities';
import { GrievanceStatus } from './entities/grievance.entity';
import { ComplianceAuditService } from './compliance-audit.service';
import { LegalEncryptionService } from './legal-encryption.service';

export interface CreateGrievanceInput {
  userId?: string;
  regulation?: string;
  subject: string;
  description: string;
  complainantName?: string;
  complainantEmail?: string;
  complainantPhone?: string;
}

@Injectable()
export class GrievanceService {
  private readonly logger = new Logger(GrievanceService.name);
  private readonly dpdpOfficer = {
    name: 'Data Protection Grievance Officer',
    email: 'grievance@spicegarden.com',
    phone: '+91-0000000000',
    designation: 'Grievance Officer (DPDP Act 2023)',
  };

  constructor(
    @InjectRepository(GrievanceEntity)
    private readonly repo: Repository<GrievanceEntity>,
    private readonly audit: ComplianceAuditService,
    private readonly encryption: LegalEncryptionService,
  ) {}

  getOfficer() {
    return this.dpdpOfficer;
  }

  getConsentManager() {
    return {
      name: 'SpiceGarden Consent Manager',
      endpoint: 'https://spicegarden.com/api/consent/manager',
      registeredWith: 'India Data Protection Board (provisional)',
    };
  }

  private decryptEntity(g: GrievanceEntity): GrievanceEntity {
    if (g && this.encryption.isEncrypted(g.description)) {
      try {
        g.description = this.encryption.decrypt(g.description);
      } catch {
        /* keep ciphertext if decryption fails */
      }
    }
    return g;
  }

  async create(input: CreateGrievanceInput): Promise<GrievanceEntity> {
    const grievance = this.repo.create({
      userId: input.userId,
      regulation: input.regulation || 'dpdp',
      subject: input.subject,
      description: this.encryption.encrypt(input.description),
      status: GrievanceStatus.OPEN,
      complainantName: input.complainantName,
      complainantEmail: input.complainantEmail,
      complainantPhone: input.complainantPhone,
      assignedOfficerId: this.dpdpOfficer.email,
      slaDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    const saved = await this.repo.save(grievance);
    await this.audit.record({
      action: 'grievance_created',
      category: 'dpdp',
      actorId: input.userId,
      entityType: 'grievances',
      entityId: saved.id,
    });
    return saved;
  }

  async list(filter?: { status?: GrievanceStatus; userId?: string }): Promise<GrievanceEntity[]> {
    const where: Record<string, any> = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.userId) where.userId = filter.userId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } }).then((rows) => rows.map((r) => this.decryptEntity(r)));
  }

  async get(id: string): Promise<GrievanceEntity> {
    const grievance = await this.repo.findOne({ where: { id } });
    if (!grievance) throw new NotFoundException('Grievance not found');
    return this.decryptEntity(grievance);
  }

  async resolve(
    id: string,
    resolution: string,
    officerId: string,
  ): Promise<GrievanceEntity> {
    const grievance = await this.get(id);
    grievance.status = GrievanceStatus.RESOLVED;
    grievance.resolution = resolution;
    grievance.assignedOfficerId = officerId;
    grievance.resolvedAt = new Date();
    const saved = await this.repo.save(grievance);
    await this.audit.record({
      action: 'grievance_resolved',
      category: 'dpdp',
      actorId: officerId,
      entityType: 'grievances',
      entityId: saved.id,
    });
    return saved;
  }
}
