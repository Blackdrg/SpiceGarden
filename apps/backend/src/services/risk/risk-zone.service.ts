import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { RiskZoneEntity, RiskSeverity, ZoneType } from '../../db/entities/risk-zone.entity';
import { RiskEventEntity, RiskEventType, RiskEventSeverity } from '../../db/entities/risk-event.entity';
import { RiskNotificationEntity } from '../../db/entities/risk-notification.entity';
import { AuditService } from '../../audit/audit.service';
import { NotificationService } from '../notifications/notification.service';
import { ConfigService } from '@nestjs/config';

export interface CreateRiskZoneDto {
  name: string;
  description?: string;
  zoneType?: ZoneType;
  polygon?: { lat: number; lng: number }[];
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  riskScore?: number;
  crimeCategory?: string;
  severity?: RiskSeverity;
  activeTimeStart?: string;
  activeTimeEnd?: string;
  activeDays?: string[];
  reason?: string;
  verificationSource?: string;
  adminNotes?: string;
  expiresAt?: Date;
  createdBy?: string;
}

export interface Point {
  lat: number;
  lng: number;
}

@Injectable()
export class RiskZoneService {
  private readonly logger = new Logger(RiskZoneService.name);

  constructor(
    @InjectRepository(RiskZoneEntity)
    private readonly riskZoneRepo: Repository<RiskZoneEntity>,
    @InjectRepository(RiskEventEntity)
    private readonly riskEventRepo: Repository<RiskEventEntity>,
    @InjectRepository(RiskNotificationEntity)
    private readonly notificationRepo: Repository<RiskNotificationEntity>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async createRiskZone(dto: CreateRiskZoneDto): Promise<RiskZoneEntity> {
    if (!dto.name) {
      throw new BadRequestException('Zone name is required');
    }

    if (dto.zoneType === ZoneType.POLYGON && (!dto.polygon || dto.polygon.length < 3)) {
      throw new BadRequestException('Polygon zone requires at least 3 points');
    }

    if (dto.zoneType === ZoneType.RADIUS && (!dto.centerLat || !dto.centerLng)) {
      throw new BadRequestException('Radius zone requires center coordinates');
    }

    const zone = this.riskZoneRepo.create({
      name: dto.name,
      description: dto.description,
      zoneType: dto.zoneType || ZoneType.RADIUS,
      polygon: dto.polygon,
      centerLat: dto.centerLat,
      centerLng: dto.centerLng,
      radiusMeters: dto.radiusMeters || 500,
      riskScore: Math.min(100, Math.max(0, dto.riskScore || 0)),
      crimeCategory: dto.crimeCategory,
      severity: dto.severity || RiskSeverity.LOW,
      activeTimeStart: dto.activeTimeStart,
      activeTimeEnd: dto.activeTimeEnd,
      activeDays: dto.activeDays || [],
      reason: dto.reason,
      verificationSource: dto.verificationSource,
      adminNotes: dto.adminNotes,
      expiresAt: dto.expiresAt,
      createdBy: dto.createdBy,
    });

    const saved = await this.riskZoneRepo.save(zone);

    await this.auditService.log('risk_zone_created', dto.createdBy || 'system', 'RiskZone', saved.id, {
      name: saved.name,
      riskScore: saved.riskScore,
      severity: saved.severity,
    });

    this.logger.log(`Risk zone created: ${saved.name} (score: ${saved.riskScore})`);
    return saved;
  }

  async getRiskZones(filters?: { active?: boolean; minScore?: number; severity?: RiskSeverity }): Promise<RiskZoneEntity[]> {
    const query = this.riskZoneRepo.createQueryBuilder('zone');

    if (filters?.active !== undefined) {
      query.andWhere('zone.isActive = :active', { active: filters.active });
    }

    if (filters?.minScore !== undefined) {
      query.andWhere('zone.riskScore >= :minScore', { minScore: filters.minScore });
    }

    if (filters?.severity) {
      query.andWhere('zone.severity = :severity', { severity: filters.severity });
    }

    return query.orderBy('zone.riskScore', 'DESC').getMany();
  }

  async getRiskZone(id: string): Promise<RiskZoneEntity> {
    const zone = await this.riskZoneRepo.findOne({ where: { id } });
    if (!zone) {
      throw new NotFoundException(`Risk zone not found: ${id}`);
    }
    return zone;
  }

  async updateRiskZone(id: string, dto: Partial<CreateRiskZoneDto>): Promise<RiskZoneEntity> {
    const zone = await this.getRiskZone(id);

    if (dto.name) zone.name = dto.name;
    if (dto.description !== undefined) zone.description = dto.description;
    if (dto.zoneType) zone.zoneType = dto.zoneType;
    if (dto.polygon) zone.polygon = dto.polygon;
    if (dto.centerLat !== undefined) zone.centerLat = dto.centerLat;
    if (dto.centerLng !== undefined) zone.centerLng = dto.centerLng;
    if (dto.radiusMeters) zone.radiusMeters = dto.radiusMeters;
    if (dto.riskScore !== undefined) zone.riskScore = Math.min(100, Math.max(0, dto.riskScore));
    if (dto.crimeCategory !== undefined) zone.crimeCategory = dto.crimeCategory;
    if (dto.severity) zone.severity = dto.severity;
    if (dto.activeTimeStart !== undefined) zone.activeTimeStart = dto.activeTimeStart;
    if (dto.activeTimeEnd !== undefined) zone.activeTimeEnd = dto.activeTimeEnd;
    if (dto.activeDays) zone.activeDays = dto.activeDays;
    if (dto.reason !== undefined) zone.reason = dto.reason;
    if (dto.verificationSource !== undefined) zone.verificationSource = dto.verificationSource;
    if (dto.adminNotes !== undefined) zone.adminNotes = dto.adminNotes;
    if (dto.expiresAt !== undefined) zone.expiresAt = dto.expiresAt;

    return this.riskZoneRepo.save(zone);
  }

  async deactivateRiskZone(id: string): Promise<RiskZoneEntity> {
    const zone = await this.getRiskZone(id);
    zone.isActive = false;
    return this.riskZoneRepo.save(zone);
  }

  async deleteRiskZone(id: string): Promise<void> {
    const zone = await this.getRiskZone(id);
    await this.riskZoneRepo.remove(zone);
  }

  async isPointInRiskZone(lat: number, lng: number): Promise<RiskZoneEntity | null> {
    const zones = await this.riskZoneRepo.find({ where: { isActive: true } });
    const now = new Date();
    const currentDay = now.getDay().toString();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const zone of zones) {
      if (zone.expiresAt && zone.expiresAt < now) {
        continue;
      }

      if (zone.activeTimeStart && zone.activeTimeEnd) {
        if (currentTime < zone.activeTimeStart || currentTime > zone.activeTimeEnd) {
          continue;
        }
      }

      if (zone.activeDays && zone.activeDays.length > 0 && !zone.activeDays.includes(currentDay)) {
        continue;
      }

      if (zone.zoneType === ZoneType.RADIUS) {
        if (this.isWithinRadius(lat, lng, zone.centerLat!, zone.centerLng!, zone.radiusMeters!)) {
          return zone;
        }
      } else if (zone.zoneType === ZoneType.POLYGON) {
        if (this.isWithinPolygon(lat, lng, zone.polygon || [])) {
          return zone;
        }
      }
    }

    return null;
  }

  async checkAddressRisk(addressId: string, lat: number, lng: number): Promise<{
    isRiskZone: boolean;
    codAllowed: boolean;
    zone?: RiskZoneEntity;
    reason?: string;
  }> {
    const zone = await this.isPointInRiskZone(lat, lng);

    if (!zone) {
      return { isRiskZone: false, codAllowed: true };
    }

    const codThreshold = this.configService.get<number>('RISK_COD_THRESHOLD', 50);
    const codBlocked = zone.riskScore >= codThreshold;

    if (codBlocked) {
      await this.recordRiskEvent({
        eventType: RiskEventType.COD_RESTRICTED,
        severity: RiskEventSeverity.WARNING,
        description: `COD restricted for address in risk zone: ${zone.name} (score: ${zone.riskScore})`,
        orderId: addressId,
        locationLat: lat,
        locationLng: lng,
        riskZoneId: zone.id,
        metadata: { zoneName: zone.name, riskScore: zone.riskScore, severity: zone.severity },
      });

      await this.notificationService.sendPush(
        'admin',
        'COD Restricted',
        `COD has been restricted in risk zone: ${zone.name}. Reason: ${zone.reason || 'High risk area'}`,
        { zoneId: zone.id }
      );

      return {
        isRiskZone: true,
        codAllowed: false,
        zone,
        reason: zone.reason || `High risk area (Risk Score: ${zone.riskScore}/100)`,
      };
    }

    return {
      isRiskZone: true,
      codAllowed: true,
      zone,
      reason: `Caution: This area has been flagged. Risk Score: ${zone.riskScore}/100`,
    };
  }

  async recordRiskEvent(data: {
    eventType: RiskEventType;
    severity?: RiskEventSeverity;
    description: string;
    riskZoneId?: string;
    userId?: string;
    driverId?: string;
    orderId?: string;
    locationLat?: number;
    locationLng?: number;
    metadata?: Record<string, any>;
  }): Promise<RiskEventEntity> {
    const event = this.riskEventRepo.create({
      eventType: data.eventType,
      severity: data.severity || RiskEventSeverity.INFO,
      description: data.description,
      riskZoneId: data.riskZoneId,
      userId: data.userId,
      driverId: data.driverId,
      orderId: data.orderId,
      locationLat: data.locationLat,
      locationLng: data.locationLng,
      metadata: data.metadata,
    });

    return this.riskEventRepo.save(event);
  }

  async getRiskEvents(filters?: { zoneId?: string; driverId?: string; userId?: string }): Promise<RiskEventEntity[]> {
    const query = this.riskEventRepo.createQueryBuilder('event');

    if (filters?.zoneId) {
      query.andWhere('event.riskZoneId = :zoneId', { zoneId: filters.zoneId });
    }
    if (filters?.driverId) {
      query.andWhere('event.driverId = :driverId', { driverId: filters.driverId });
    }
    if (filters?.userId) {
      query.andWhere('event.userId = :userId', { userId: filters.userId });
    }

    return query.orderBy('event.createdAt', 'DESC').limit(200).getMany();
  }

  async getRiskStats(): Promise<{
    totalZones: number;
    activeZones: number;
    criticalZones: number;
    totalEvents24h: number;
    totalEvents7d: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
  }> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalZones,
      activeZones,
      criticalZones,
      events24h,
      events7d,
      allEvents7d,
    ] = await Promise.all([
      this.riskZoneRepo.count(),
      this.riskZoneRepo.count({ where: { isActive: true } }),
      this.riskZoneRepo.count({ where: { isActive: true, severity: RiskSeverity.CRITICAL } }),
      this.riskEventRepo.count({ where: { createdAt: MoreThanOrEqual(oneDayAgo) } }),
      this.riskEventRepo.count({ where: { createdAt: MoreThanOrEqual(sevenDaysAgo) } }),
      this.riskEventRepo.find({ where: { createdAt: MoreThanOrEqual(sevenDaysAgo) }, take: 500 }),
    ]);

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};

    for (const event of allEvents7d) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    }

    return {
      totalZones,
      activeZones,
      criticalZones,
      totalEvents24h: events24h,
      totalEvents7d: events7d,
      eventsByType,
      eventsBySeverity,
    };
  }

  private isWithinRadius(lat: number, lng: number, centerLat: number, centerLng: number, radiusMeters: number): boolean {
    const R = 6371e3;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat - centerLat);
    const dLng = toRad(lng - centerLng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(centerLat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c <= radiusMeters;
  }

  private isWithinPolygon(lat: number, lng: number, polygon: { lat: number; lng: number }[]): boolean {
    let inside = false;
    const n = polygon.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      const intersect = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  async checkDriverInRiskZone(driverId: string, lat: number, lng: number): Promise<{
    inRiskZone: boolean;
    zone?: RiskZoneEntity;
    shouldWarn: boolean;
  }> {
    const zone = await this.isPointInRiskZone(lat, lng);

    if (!zone) {
      return { inRiskZone: false, shouldWarn: false };
    }

    await this.recordRiskEvent({
      eventType: RiskEventType.DRIVER_WARNED,
      severity: zone.severity === RiskSeverity.CRITICAL ? RiskEventSeverity.CRITICAL : RiskEventSeverity.WARNING,
      description: `Driver ${driverId} entered risk zone: ${zone.name} (score: ${zone.riskScore}, severity: ${zone.severity})`,
      riskZoneId: zone.id,
      driverId,
      locationLat: lat,
      locationLng: lng,
      metadata: { zoneName: zone.name, crimeCategory: zone.crimeCategory, reason: zone.reason },
    });

    const shouldSendNotification = zone.riskScore >= 40;

    if (shouldSendNotification) {
      await this.notificationService.sendPush(
        driverId,
        `Safety Alert: ${zone.name}`,
        this.buildDriverWarningMessage(zone),
        { zoneId: zone.id, riskScore: zone.riskScore, severity: zone.severity, lat, lng }
      );
    }

    return {
      inRiskZone: true,
      zone,
      shouldWarn: zone.riskScore >= 30,
    };
  }

  private buildDriverWarningMessage(zone: RiskZoneEntity): string {
    const templates: Record<string, string> = {
      high: `Caution: You are entering a high-risk area (${zone.crimeCategory}). ${zone.reason || 'Please stay alert.'}`,
      critical: `Warning: You are entering a CRITICAL risk zone! ${zone.crimeCategory}. Consider contacting support if you feel unsafe.`,
    };

    return templates[zone.severity] || `Alert: You are in a risk area. Risk score: ${zone.riskScore}/100. Please stay alert.`;
  }
}
