import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CookieConsentEntity,
  ConsentLogEntity,
  CookieRegistryEntity,
} from './entities';
import { ConsentCategory, Regulation } from './entities/legal.enums';
import { ComplianceAuditService } from './compliance-audit.service';
import { LegalIntegrityService } from './integrity.service';

export interface ConsentPreferences {
  necessary?: boolean;
  analytics?: boolean;
  marketing?: boolean;
  performance?: boolean;
  functional?: boolean;
  preference?: boolean;
}

export interface RecordConsentInput {
  userId?: string;
  anonymousToken?: string;
  region: Regulation;
  language?: string;
  consentVersion?: string;
  analytics?: boolean;
  marketing?: boolean;
  performance?: boolean;
  functional?: boolean;
  preference?: boolean;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  source?: string;
}

const ALL_CATEGORIES: ConsentCategory[] = [
  ConsentCategory.NECESSARY,
  ConsentCategory.ANALYTICS,
  ConsentCategory.MARKETING,
  ConsentCategory.PERFORMANCE,
  ConsentCategory.FUNCTIONAL,
  ConsentCategory.PREFERENCE,
];

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);
  private readonly defaultVersion = '1.0.0';

  constructor(
    @InjectRepository(CookieConsentEntity)
    private readonly consentRepo: Repository<CookieConsentEntity>,
    @InjectRepository(ConsentLogEntity)
    private readonly logRepo: Repository<ConsentLogEntity>,
    @InjectRepository(CookieRegistryEntity)
    private readonly registryRepo: Repository<CookieRegistryEntity>,
    private readonly audit: ComplianceAuditService,
    private readonly integrity: LegalIntegrityService,
  ) {}

  async recordConsent(input: RecordConsentInput): Promise<CookieConsentEntity> {
    if (!input.userId && !input.anonymousToken) {
      throw new Error('Either userId or anonymousToken is required');
    }
    const preferenceFor = (key: 'analytics' | 'marketing' | 'performance' | 'functional' | 'preference') =>
      Boolean((input as any)[key]);

    const prior = await this.consentRepo.findOne({
      where: input.userId
        ? { userId: input.userId, active: true }
        : { anonymousToken: input.anonymousToken, active: true },
    });
    if (prior) {
      prior.active = false;
      if (input.userId) prior.withdrawnAt = new Date();
      await this.consentRepo.save(prior);
    }

    const consent = this.consentRepo.create({
      userId: input.userId,
      anonymousToken: input.anonymousToken,
      region: input.region,
      language: input.language || 'en',
      necessary: true,
      analytics: preferenceFor('analytics'),
      marketing: preferenceFor('marketing'),
      performance: preferenceFor('performance'),
      functional: preferenceFor('functional'),
      preference: preferenceFor('preference'),
      consentVersion: input.consentVersion || this.defaultVersion,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      consentMethod: input.method || 'banner',
      active: true,
    });
    const saved = await this.consentRepo.save(consent);

    for (const category of ALL_CATEGORIES) {
      const granted = category === ConsentCategory.NECESSARY ? true : Boolean((consent as any)[category]);
      await this.logRepo.save(
        this.logRepo.create({
          userId: consent.userId,
          anonymousToken: consent.anonymousToken,
          consentId: consent.id,
          category,
          granted,
          region: consent.region,
          consentVersion: consent.consentVersion,
          action: input.anonymousToken ? 'anonymous_consent' : 'consent_set',
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          source: input.source || 'cookie_consent',
          metadata: { method: input.method || 'banner' },
        } as any),
      );
    }

    await this.audit.record({
      action: 'consent_recorded',
      category: 'consent',
      actorId: input.userId,
      entityType: 'cookie_consents',
      entityId: saved.id,
      ipAddress: input.ipAddress,
      metadata: { region: input.region, analytics: saved.analytics, marketing: saved.marketing },
    });
    return saved;
  }

  async withdrawConsent(consentId: string, userId?: string): Promise<CookieConsentEntity> {
    const consent = await this.consentRepo.findOne({ where: { id: consentId } });
    if (!consent) throw new NotFoundException('Consent not found');
    if (userId && consent.userId && consent.userId !== userId) {
      throw new NotFoundException('Consent not found');
    }
    consent.active = false;
    consent.withdrawnAt = new Date();
    const saved = await this.consentRepo.save(consent);

    await this.logRepo.save(
      this.logRepo.create({
        userId: consent.userId,
        anonymousToken: consent.anonymousToken,
        consentId: consent.id,
        category: ConsentCategory.NECESSARY,
        granted: false,
        region: consent.region,
        consentVersion: consent.consentVersion,
        action: 'consent_withdrawn',
        ipAddress: consent.ipAddress,
        userAgent: consent.userAgent,
        source: 'preference_center',
      } as any),
    );

    await this.audit.record({
      action: 'consent_withdrawn',
      category: 'consent',
      actorId: consent.userId,
      entityType: 'cookie_consents',
      entityId: saved.id,
    });
    return saved;
  }

  async getActiveConsent(userIdOrToken: string, isUserId = true): Promise<CookieConsentEntity | null> {
    return this.consentRepo.findOne({
      where: isUserId
        ? { userId: userIdOrToken, active: true }
        : { anonymousToken: userIdOrToken, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getConsentLogs(filter: {
    userId?: string;
    consentId?: string;
    category?: ConsentCategory;
    limit?: number;
    offset?: number;
  }): Promise<ConsentLogEntity[]> {
    const where: Record<string, any> = {};
    if (filter.userId) where.userId = filter.userId;
    if (filter.consentId) where.consentId = filter.consentId;
    if (filter.category) where.category = filter.category;
    return this.logRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: filter.limit ?? 100,
      skip: filter.offset ?? 0,
    });
  }

  async getCookieRegistry(): Promise<CookieRegistryEntity[]> {
    return this.registryRepo.find({ where: { active: true }, order: { category: 'ASC', name: 'ASC' } });
  }

  async upsertCookieRegistry(entry: Partial<CookieRegistryEntity> & { name: string }): Promise<CookieRegistryEntity> {
    const existing = await this.registryRepo.findOne({ where: { name: entry.name } });
    if (existing) {
      Object.assign(existing, entry, { lastScannedAt: new Date() });
      return this.registryRepo.save(existing);
    }
    const created = this.registryRepo.create({ ...entry, lastScannedAt: new Date() });
    return this.registryRepo.save(created);
  }

  async scanCookies(detected: { name: string; category?: ConsentCategory }[]): Promise<{ new: number; updated: number }> {
    let created = 0;
    let updated = 0;
    for (const cookie of detected) {
      const existing = await this.registryRepo.findOne({ where: { name: cookie.name } });
      const res = await this.upsertCookieRegistry({
        name: cookie.name,
        category: cookie.category || ConsentCategory.NECESSARY,
        scanVersion: this.defaultVersion,
      });
      if (!existing) created++;
      else updated++;
    }
    return { new: created, updated: updated };
  }

  async verifyConsentIntegrity(consent: CookieConsentEntity): Promise<boolean> {
    return this.integrity.verify(
      { id: consent.id, userId: consent.userId, version: consent.consentVersion },
      consent.id,
    );
  }
}
