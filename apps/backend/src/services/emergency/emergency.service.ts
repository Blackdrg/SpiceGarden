import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { EmergencyIncidentEntity, EmergencyIncidentStatus, EmergencySeverity } from '../../db/entities/emergency-incident.entity';
import { EmergencyContactEntity } from '../../db/entities/emergency-contact.entity';
import { EmergencyIncidentTimelineEntity } from '../../db/entities/emergency-incident-timeline.entity';
import { RiskZoneEntity } from '../../db/entities/risk-zone.entity';
import { RiskEventEntity, RiskEventType, RiskEventSeverity } from '../../db/entities/risk-event.entity';
import { RiskZoneService } from '../risk/risk-zone.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationService } from '../notifications/notification.service';
import { TrackingGateway } from '../../infra/tracking/tracking.gateway';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { CreateSosDto, EmergencyLocationDto, UpdateIncidentStatusDto, CreateEmergencyContactDto, EmergencyIncidentFilterDto } from './emergency.dto';

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);
  private readonly sosCounter: { count: number; resetAt: number } = { count: 0, resetAt: Date.now() + 60000 };

  constructor(
    @InjectRepository(EmergencyIncidentEntity)
    private readonly incidentRepo: Repository<EmergencyIncidentEntity>,
    @InjectRepository(EmergencyContactEntity)
    private readonly contactRepo: Repository<EmergencyContactEntity>,
    @InjectRepository(EmergencyIncidentTimelineEntity)
    private readonly timelineRepo: Repository<EmergencyIncidentTimelineEntity>,
    @InjectRepository(RiskZoneEntity)
    private readonly riskZoneRepo: Repository<RiskZoneEntity>,
    @InjectRepository(RiskEventEntity)
    private readonly riskEventRepo: Repository<RiskEventEntity>,
    private readonly riskZoneService: RiskZoneService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly trackingGateway: TrackingGateway,
    private readonly configService: ConfigService,
  ) {}

  async createSos(dto: CreateSosDto, request: Request | null, performedBy: string | null = null): Promise<EmergencyIncidentEntity> {
    if (!performedBy) {
      performedBy = dto.driverId;
    }

    const duplicateCheck = await this.incidentRepo.findOne({
      where: {
        driverId: dto.driverId,
        status: In([EmergencyIncidentStatus.OPEN, EmergencyIncidentStatus.ACKNOWLEDGED, EmergencyIncidentStatus.IN_PROGRESS, EmergencyIncidentStatus.RESPONDED]),
      },
      order: { createdAt: 'DESC' },
    });

    if (duplicateCheck) {
      const now = Date.now();
      if (now < (duplicateCheck.updatedAt?.getTime() || 0) + 30000) {
        throw new BadRequestException(`Active emergency already exists: ${duplicateCheck.incidentNumber}`);
      }
    }

    const incidentNumber = this.generateIncidentNumber();
    const now = new Date();

    let severity = EmergencySeverity.MEDIUM;
    const riskZone = await this.riskZoneService.isPointInRiskZone(dto.latitude, dto.longitude);
    if (riskZone) {
      if (riskZone.severity === 'critical') severity = EmergencySeverity.CRITICAL;
      else if (riskZone.severity === 'high') severity = EmergencySeverity.HIGH;

      await this.riskZoneService.recordRiskEvent({
        eventType: RiskEventType.SOS_TRIGGERED,
        severity: riskZone.severity === 'critical' || riskZone.severity === 'high' ? RiskEventSeverity.CRITICAL : RiskEventSeverity.DANGER,
        description: `SOS triggered by driver ${dto.driverId} in risk zone: ${riskZone.name} (score: ${riskZone.riskScore})`,
        riskZoneId: riskZone.id,
        driverId: dto.driverId,
        orderId: dto.orderId,
        locationLat: dto.latitude,
        locationLng: dto.longitude,
        metadata: { incidentNumber, riskScore: riskZone.riskScore, zoneName: riskZone.name },
      });
    }

    const incident = this.incidentRepo.create({
      incidentNumber,
      driverId: dto.driverId,
      orderId: dto.orderId,
      restaurantId: dto.restaurantId,
      customerId: dto.customerId,
      status: EmergencyIncidentStatus.OPEN,
      severity,
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.address || '',
      city: dto.city || '',
      state: dto.state || '',
      country: dto.country || '',
      deviceBattery: dto.deviceBattery,
      networkType: dto.networkType || undefined,
      notes: dto.notes || {},
      metadata: { source: 'driver_app', triggeredAt: now.toISOString(), riskZoneId: riskZone?.id },
    });

    const saved = await this.incidentRepo.save(incident);

    await this.addTimelineEvent(saved.id, 'incident_created', `SOS incident created with number ${incidentNumber}`, performedBy!, { severity: saved.severity });

    await this.auditService.log('sos_incident_created', performedBy!, 'EmergencyIncident', saved.id, {
      incidentNumber: saved.incidentNumber,
      driverId: saved.driverId,
      orderId: saved.orderId,
      severity: saved.severity,
      latitude: saved.latitude,
      longitude: saved.longitude,
      riskZoneId: riskZone?.id,
    }, request);

    await this.publishIncidentEvent(saved, 'incident.created');

    if (saved.customerId) {
      await this.notificationService.sendPush(saved.customerId, 'Emergency SOS Active', `Emergency SOS activated for your order. Incident: ${incidentNumber}`, { incidentId: saved.id, incidentNumber: saved.incidentNumber });
    }

    await this.notifyOperationsTeam(saved);
    await this.notifyRestaurant(saved);
    await this.notifyDriverContacts(saved);

    const contacts = await this.contactRepo.find({ where: { driverId: dto.driverId } });
    for (const contact of contacts.slice(0, 3)) {
      if (contact.phone && contact.verified) {
        await this.notificationService.sendSMS(contact.phone, `EMERGENCY ALERT: Driver ${dto.driverId} has triggered SOS. Incident: ${incidentNumber}. Location: ${saved.latitude}, ${saved.longitude}`);
      }
    }

    this.logger.warn(`SOS incident created: ${incidentNumber} for driver ${dto.driverId} severity=${severity}`);
    return saved;
  }

  async updateLocation(dto: EmergencyLocationDto, request: Request | null, performedBy: string | null = null): Promise<EmergencyIncidentEntity> {
    const incident = await this.incidentRepo.findOne({ where: { id: dto.incidentId } });
    if (!incident) {
      throw new NotFoundException(`Emergency incident not found: ${dto.incidentId}`);
    }

    if (incident.status === EmergencyIncidentStatus.RESOLVED || incident.status === EmergencyIncidentStatus.CANCELLED || incident.status === EmergencyIncidentStatus.FALSE_ALARM) {
      throw new ForbiddenException(`Cannot update location for ${incident.status} incident`);
    }

    incident.latitude = dto.latitude;
    incident.longitude = dto.longitude;
    if (dto.accuracy !== undefined) incident.accuracy = dto.accuracy;
    if (dto.heading !== undefined) incident.heading = dto.heading;
    if (dto.speed !== undefined) incident.speed = dto.speed;
    if (dto.deviceBattery !== undefined) incident.deviceBattery = dto.deviceBattery;
    if (dto.networkType !== undefined) incident.networkType = dto.networkType;
    incident.metadata = incident.metadata || {};
    incident.metadata.lastLocationUpdate = new Date().toISOString();

    const saved = await this.incidentRepo.save(incident);

    const locationUpdate: Record<string, any> = {
      latitude: dto.latitude,
      longitude: dto.longitude,
    };
    if (dto.heading !== undefined) locationUpdate.heading = dto.heading;
    if (dto.speed !== undefined) locationUpdate.speed = dto.speed;
    if (dto.accuracy !== undefined) locationUpdate.accuracy = dto.accuracy;

    const performer = performedBy || saved.driverId;
    await this.addTimelineEvent(saved.id, 'location_updated', `GPS location updated: ${dto.latitude}, ${dto.longitude}`, performer, locationUpdate);

    await this.publishIncidentEvent(saved, 'driver.location');

    return saved;
  }

  async updateIncidentStatus(incidentId: string, dto: UpdateIncidentStatusDto, request: Request | null, performedBy: string | null = null): Promise<EmergencyIncidentEntity> {
    const incident = await this.incidentRepo.findOne({ where: { id: incidentId } });
    if (!incident) {
      throw new NotFoundException(`Emergency incident not found: ${incidentId}`);
    }

    const previousStatus = incident.status;
    const newStatus = dto.status as EmergencyIncidentStatus;

    if (!this.isValidTransition(previousStatus, newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${previousStatus} to ${newStatus}`);
    }

    incident.status = newStatus;
    if (dto.resolutionNotes) incident.resolutionNotes = dto.resolutionNotes;
    if (dto.notes) incident.notes = { ...incident.notes, ...dto.notes };
    if (newStatus === EmergencyIncidentStatus.RESOLVED || newStatus === EmergencyIncidentStatus.FALSE_ALARM || newStatus === EmergencyIncidentStatus.CANCELLED) {
      incident.closedAt = new Date();
      incident.resolvedBy = performedBy || undefined;
    }

    const saved = await this.incidentRepo.save(incident);

    const eventMap: Record<string, string> = {
      acknowledged: 'incident_acknowledged',
      responded: 'incident_responded',
      in_progress: 'incident_in_progress',
      resolved: 'incident_resolved',
      false_alarm: 'incident_marked_false_alarm',
      cancelled: 'incident_cancelled',
    };

    const performer = performedBy || null;
    await this.addTimelineEvent(saved.id, eventMap[newStatus] || 'status_changed', `Status changed from ${previousStatus} to ${newStatus}`, performer!, { previousStatus, newStatus, resolutionNotes: dto.resolutionNotes });

    await this.auditService.log(`sos_incident_${newStatus}`, performer!, 'EmergencyIncident', saved.id, {
      incidentNumber: saved.incidentNumber,
      previousStatus,
      newStatus,
      resolutionNotes: dto.resolutionNotes,
    }, request);

    const wsEventMap: Record<string, string> = {
      acknowledged: 'admin.acknowledged',
      responded: 'incident.updated',
      in_progress: 'incident.updated',
      resolved: 'incident.resolved',
      false_alarm: 'incident.closed',
      cancelled: 'incident.closed',
    };

    await this.publishIncidentEvent(saved, wsEventMap[newStatus] || 'incident.updated');

    if (newStatus === EmergencyIncidentStatus.RESOLVED) {
      await this.notificationService.sendPush(saved.driverId, 'SOS Resolved', `Emergency incident ${saved.incidentNumber} has been resolved.`, { incidentId: saved.id });
      if (saved.customerId) {
        await this.notificationService.sendPush(saved.customerId, 'Emergency Resolved', `Emergency for your order has been resolved. Incident: ${saved.incidentNumber}`, { incidentId: saved.id });
      }
    }

    return saved;
  }

  async getIncident(id: string): Promise<EmergencyIncidentEntity> {
    const incident = await this.incidentRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException(`Emergency incident not found: ${id}`);
    return incident;
  }

  async getIncidentTimeline(incidentId: string): Promise<EmergencyIncidentTimelineEntity[]> {
    await this.getIncident(incidentId);
    return this.timelineRepo.find({
      where: { incidentId },
      order: { timestamp: 'DESC' },
    });
  }

  async getIncidents(filters: EmergencyIncidentFilterDto): Promise<{ incidents: EmergencyIncidentEntity[]; total: number }> {
    const query = this.incidentRepo.createQueryBuilder('incident');

    if (filters.status) {
      query.andWhere('incident.status = :status', { status: filters.status });
    }
    if (filters.severity) {
      query.andWhere('incident.severity = :severity', { severity: filters.severity });
    }
    if (filters.driverId) {
      query.andWhere('incident.driverId = :driverId', { driverId: filters.driverId });
    }
    if (filters.restaurantId) {
      query.andWhere('incident.restaurantId = :restaurantId', { restaurantId: filters.restaurantId });
    }
    if (filters.city) {
      query.andWhere('incident.city ILIKE :city', { city: `%${filters.city}%` });
    }

    const [incidents, total] = await query
      .orderBy('incident.createdAt', 'DESC')
      .skip(filters.offset || 0)
      .take(filters.limit || 50)
      .getManyAndCount();

    return { incidents, total };
  }

  async createEmergencyContact(dto: CreateEmergencyContactDto): Promise<EmergencyContactEntity> {
    const contact = this.contactRepo.create({
      driverId: dto.driverId,
      name: dto.name,
      relationship: dto.relationship,
      phone: dto.phone,
      email: dto.email,
      priority: dto.priority,
      verified: false,
    });

    return this.contactRepo.save(contact);
  }

  async getDriverContacts(driverId: string): Promise<EmergencyContactEntity[]> {
    return this.contactRepo.find({
      where: { driverId },
      order: { priority: 'ASC' },
    });
  }

  async getDashboardStats(): Promise<{
    totalIncidents: number;
    openIncidents: number;
    criticalIncidents: number;
    resolved24h: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    incidentsBySeverity: Record<string, number>;
    incidentsByStatus: Record<string, number>;
    incidentsByCity: Record<string, number>;
  }> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalIncidents,
      openIncidents,
      criticalIncidents,
      resolved24h,
      allIncidents24h,
    ] = await Promise.all([
      this.incidentRepo.count(),
      this.incidentRepo.count({ where: { status: EmergencyIncidentStatus.OPEN } }),
      this.incidentRepo.count({
        where: {
          severity: EmergencySeverity.CRITICAL,
          status: In([EmergencyIncidentStatus.OPEN, EmergencyIncidentStatus.ACKNOWLEDGED, EmergencyIncidentStatus.IN_PROGRESS, EmergencyIncidentStatus.RESPONDED]),
        },
      }),
      this.incidentRepo.count({ where: { status: EmergencyIncidentStatus.RESOLVED, closedAt: MoreThanOrEqual(twentyFourHoursAgo) } }),
      this.incidentRepo.find({ where: { createdAt: MoreThanOrEqual(twentyFourHoursAgo) }, take: 500 }),
    ]);

    let totalResponseTime = 0;
    let responseCount = 0;
    let totalResolutionTime = 0;
    let resolutionCount = 0;

    for (const incident of allIncidents24h) {
      const timelines = await this.timelineRepo.find({
        where: { incidentId: incident.id, event: 'incident_acknowledged' },
        take: 1,
      });

      if (timelines.length > 0) {
        const ackTime = timelines[0].timestamp.getTime() - incident.createdAt.getTime();
        totalResponseTime += ackTime;
        responseCount++;
      }

      if (incident.closedAt) {
        const resolutionTime = incident.closedAt.getTime() - incident.createdAt.getTime();
        totalResolutionTime += resolutionTime;
        resolutionCount++;
      }
    }

    const incidentsBySeverity: Record<string, number> = {};
    const incidentsByStatus: Record<string, number> = {};
    const incidentsByCity: Record<string, number> = {};

    for (const incident of allIncidents24h) {
      incidentsBySeverity[incident.severity] = (incidentsBySeverity[incident.severity] || 0) + 1;
      incidentsByStatus[incident.status] = (incidentsByStatus[incident.status] || 0) + 1;
      if (incident.city) {
        incidentsByCity[incident.city] = (incidentsByCity[incident.city] || 0) + 1;
      }
    }

    return {
      totalIncidents,
      openIncidents,
      criticalIncidents,
      resolved24h,
      avgResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
      avgResolutionTime: resolutionCount > 0 ? totalResolutionTime / resolutionCount : 0,
      incidentsBySeverity,
      incidentsByStatus,
      incidentsByCity,
    };
  }

  private generateIncidentNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;

    if (now.getTime() >= this.sosCounter.resetAt) {
      this.sosCounter.count = Math.floor(Math.random() * 100);
      this.sosCounter.resetAt = now.getTime() + 60000;
    }
    this.sosCounter.count++;
    const seq = String(this.sosCounter.count).padStart(4, '0');

    return `SOS-${year}${month}-${seq}`;
  }

  private async addTimelineEvent(incidentId: string, event: string, description: string, performedBy: string, metadata: Record<string, any> = {}): Promise<EmergencyIncidentTimelineEntity> {
    const timeline = this.timelineRepo.create({
      incidentId,
      event,
      description,
      performedBy,
      metadata: { ...metadata, timestamp: new Date().toISOString() },
    });
    return this.timelineRepo.save(timeline);
  }

  private async publishIncidentEvent(incident: EmergencyIncidentEntity, eventName: string): Promise<void> {
    try {
      const topic = `emergency:incident:${incident.id}`;
      this.trackingGateway.publishToRoom(`emergency:admin`, { event: eventName, incident, timestamp: new Date().toISOString() });
      this.trackingGateway.publishToRoom(topic, { event: eventName, incident, timestamp: new Date().toISOString() });

      if (incident.restaurantId) {
        this.trackingGateway.publishToRoom(`emergency:restaurant:${incident.restaurantId}`, { event: eventName, incident, timestamp: new Date().toISOString() });
      }
    } catch (error) {
      this.logger.error(`WebSocket publish failed for ${eventName}:`, error);
    }
  }

  private async notifyOperationsTeam(incident: EmergencyIncidentEntity): Promise<void> {
    const message = `EMERGENCY SOS: ${incident.incidentNumber} - Driver: ${incident.driverId}`;
    this.logger.log(`Notify operations: ${message}`);
    this.trackingGateway.publishToRoom('emergency:operations', { type: 'sos_alert', incident, message });
  }

  private async notifyRestaurant(incident: EmergencyIncidentEntity): Promise<void> {
    if (incident.restaurantId) {
      const message = `Emergency SOS active for your order. Incident: ${incident.incidentNumber}`;
      this.trackingGateway.publishToRoom(`emergency:restaurant:${incident.restaurantId}`, { type: 'sos_alert', incident, message });
      this.logger.log(`Notified restaurant ${incident.restaurantId} about SOS ${incident.incidentNumber}`);
    }
  }

  private async notifyDriverContacts(incident: EmergencyIncidentEntity): Promise<void> {
    const contacts = await this.contactRepo.find({ where: { driverId: incident.driverId } });
    this.logger.log(`Found ${contacts.length} emergency contacts for driver ${incident.driverId}`);
  }

  private isValidTransition(from: EmergencyIncidentStatus, to: EmergencyIncidentStatus): boolean {
    const allowed: Record<EmergencyIncidentStatus, EmergencyIncidentStatus[]> = {
      [EmergencyIncidentStatus.OPEN]: [EmergencyIncidentStatus.ACKNOWLEDGED, EmergencyIncidentStatus.CANCELLED, EmergencyIncidentStatus.FALSE_ALARM],
      [EmergencyIncidentStatus.ACKNOWLEDGED]: [EmergencyIncidentStatus.RESPONDED, EmergencyIncidentStatus.CANCELLED, EmergencyIncidentStatus.FALSE_ALARM],
      [EmergencyIncidentStatus.RESPONDED]: [EmergencyIncidentStatus.IN_PROGRESS, EmergencyIncidentStatus.CANCELLED, EmergencyIncidentStatus.FALSE_ALARM],
      [EmergencyIncidentStatus.IN_PROGRESS]: [EmergencyIncidentStatus.RESOLVED, EmergencyIncidentStatus.CANCELLED, EmergencyIncidentStatus.FALSE_ALARM],
      [EmergencyIncidentStatus.RESOLVED]: [],
      [EmergencyIncidentStatus.FALSE_ALARM]: [],
      [EmergencyIncidentStatus.CANCELLED]: [],
    };

    return (allowed[from] || []).includes(to);
  }
}
