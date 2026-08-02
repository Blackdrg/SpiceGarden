import { describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyService } from '../../../src/services/emergency/emergency.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyIncidentEntity, EmergencyIncidentStatus, EmergencySeverity } from '../../../src/db/entities/emergency-incident.entity';
import { EmergencyContactEntity } from '../../../src/db/entities/emergency-contact.entity';
import { EmergencyIncidentTimelineEntity } from '../../../src/db/entities/emergency-incident-timeline.entity';
import { RiskZoneEntity } from '../../../src/db/entities/risk-zone.entity';
import { RiskEventEntity } from '../../../src/db/entities/risk-event.entity';
import { DriverEntity } from '../../../src/db/entities/driver.entity';
import { AuditService } from '../../../src/audit/audit.service';
import { NotificationService } from '../../../src/services/notifications/notification.service';
import { RiskZoneService } from '../../../src/services/risk/risk-zone.service';
import { TrackingGateway } from '../../../src/infra/tracking/tracking.gateway';
import { ConfigService } from '@nestjs/config';
import { In, MoreThanOrEqual } from 'typeorm';

describe('EmergencyService', () => {
  let service: EmergencyService;
  let incidentRepo: jest.Mocked<Repository<EmergencyIncidentEntity>>;
  let contactRepo: jest.Mocked<Repository<EmergencyContactEntity>>;
  let timelineRepo: jest.Mocked<Repository<EmergencyIncidentTimelineEntity>>;
  let riskZoneRepo: jest.Mocked<Repository<RiskZoneEntity>>;
   let riskEventRepo: jest.Mocked<Repository<RiskEventEntity>>;
  let driverRepo: jest.Mocked<Repository<DriverEntity>>;
  let mockRiskZoneService: Partial<RiskZoneService>;
  let mockAuditService: Partial<AuditService>;
  let mockNotificationService: Partial<NotificationService>;
  let mockTrackingGateway: Partial<TrackingGateway>;

  beforeEach(async () => {
    incidentRepo = {
      create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn().mockResolvedValue([]), count: jest.fn(), countBy: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]), skip: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(),
      })) as any,
    } as any;
    contactRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn().mockResolvedValue([]), count: jest.fn() } as any;
    timelineRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn().mockResolvedValue([]) } as any;
    riskZoneRepo = { find: jest.fn(), findOne: jest.fn(), createQueryBuilder: jest.fn() } as any;
    riskEventRepo = { create: jest.fn(), save: jest.fn() } as any;
    driverRepo = { find: jest.fn().mockResolvedValue([]), findOne: jest.fn() } as any;

    mockRiskZoneService = {
      isPointInRiskZone: jest.fn().mockResolvedValue(null),
      recordRiskEvent: jest.fn().mockResolvedValue({ id: 'e1', createdAt: new Date() } as any),
    };
    mockAuditService = { log: jest.fn().mockResolvedValue({ id: 'a1', action: '' } as any) };
    mockNotificationService = {
      sendPush: jest.fn().mockResolvedValue({ success: true }),
      sendSMS: jest.fn().mockResolvedValue({ success: true }),
    };
    mockTrackingGateway = {
      publishToRoom: jest.fn().mockResolvedValue({ status: 'sent', messageId: 'msg1' }),
      publish: jest.fn().mockResolvedValue({ status: 'sent', messageId: 'msg1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmergencyService,
        { provide: getRepositoryToken(EmergencyIncidentEntity), useValue: incidentRepo },
        { provide: getRepositoryToken(EmergencyContactEntity), useValue: contactRepo },
        { provide: getRepositoryToken(EmergencyIncidentTimelineEntity), useValue: timelineRepo },
        { provide: getRepositoryToken(RiskZoneEntity), useValue: riskZoneRepo },
         { provide: getRepositoryToken(RiskEventEntity), useValue: riskEventRepo },
         { provide: getRepositoryToken(DriverEntity), useValue: driverRepo },
        { provide: RiskZoneService, useValue: mockRiskZoneService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TrackingGateway, useValue: mockTrackingGateway },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get(EmergencyService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('should create SOS incident', async () => {
    const dto = {
      driverId: 'driver-1', orderId: 'order-1', latitude: 19.07, longitude: 72.88, deviceBattery: 85,
      address: '123 Test St', city: 'Mumbai', state: 'MH', country: 'India', restaurantId: 'rest-1', customerId: 'cust-1',
    };
    incidentRepo.findOne = jest.fn().mockResolvedValue(null);
    incidentRepo.save = jest.fn().mockResolvedValue({
      id: 'inc-1', incidentNumber: 'SOS-202607-1234', driverId: 'driver-1', status: 'open' as EmergencyIncidentStatus,
      severity: EmergencySeverity.MEDIUM, latitude: 19.07, longitude: 72.88, createdAt: new Date(), updatedAt: new Date(),
      restaurantId: 'rest-1', customerId: 'cust-1',
    } as any);

    const result = await service.createSos(dto as any, null, 'driver-1');
    expect(result).toBeDefined();
    expect(result.incidentNumber).toContain('SOS-');
    expect(incidentRepo.save).toHaveBeenCalled();
    expect(mockAuditService.log).toHaveBeenCalledWith('sos_incident_created', expect.any(String), 'EmergencyIncident', 'inc-1', expect.any(Object), null);
    expect(mockNotificationService.sendPush).toHaveBeenCalled();
  });

  it('should throw for duplicate active SOS', async () => {
    const dto = {
      driverId: 'driver-1', latitude: 19.07, longitude: 72.88, deviceBattery: 85,
    };
    const activeIncident = {
      id: 'inc-1', incidentNumber: 'SOS-202607-0001', driverId: 'driver-1', status: 'open' as EmergencyIncidentStatus,
      updatedAt: new Date(),
    };
    incidentRepo.findOne = jest.fn().mockResolvedValue(activeIncident);

    await expect(service.createSos(dto as any, null)).rejects.toThrow('Active emergency already exists');
  });

  it('should upgrade severity when in risk zone', async () => {
    const dto = {
      driverId: 'driver-1', latitude: 19.07, longitude: 72.88, deviceBattery: 85,
    };
    const riskZone = { id: 'rz-1', name: 'High Risk', riskScore: 90, severity: 'critical' as any };
    mockRiskZoneService.isPointInRiskZone = jest.fn().mockResolvedValue(riskZone as any);
    incidentRepo.findOne = jest.fn().mockResolvedValue(null);
    incidentRepo.save = jest.fn().mockResolvedValue({
      id: 'inc-1', incidentNumber: 'SOS-202607-1234', driverId: 'driver-1', status: 'open' as EmergencyIncidentStatus,
      severity: EmergencySeverity.CRITICAL, latitude: 19.07, longitude: 72.88, createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await service.createSos(dto as any, null, 'driver-1');
    expect(result.severity).toBe(EmergencySeverity.CRITICAL);
    expect(mockRiskZoneService.recordRiskEvent).toHaveBeenCalled();
  });

  it('should update incident location', async () => {
    const existingIncident = {
      id: 'inc-1', status: 'acknowledged' as EmergencyIncidentStatus, latitude: 19.07, longitude: 72.88,
      driverId: 'driver-1', updatedAt: new Date(),
    };
    incidentRepo.findOne = jest.fn().mockResolvedValue(existingIncident);
    incidentRepo.save = jest.fn().mockResolvedValue(existingIncident);
    timelineRepo.save = jest.fn().mockResolvedValue({ id: 'tl-1' } as any);

    const result = await service.updateLocation({ incidentId: 'inc-1', latitude: 19.08, longitude: 72.89 } as any, null, 'driver-1');
    expect(result).toBeDefined();
    expect(mockTrackingGateway.publishToRoom).toHaveBeenCalled();
  });

  it('should reject location update on resolved incident', async () => {
    incidentRepo.findOne = jest.fn().mockResolvedValue({ id: 'inc-1', status: 'resolved' as EmergencyIncidentStatus });

    await expect(service.updateLocation({ incidentId: 'inc-1', latitude: 19.08, longitude: 72.89 } as any, null)).rejects.toThrow('Cannot update location');
  });

  it('should transition incident status with valid flow', async () => {
    const incident = {
      id: 'inc-1', incidentNumber: 'SOS-202607-0001', status: 'open' as EmergencyIncidentStatus, driverId: 'driver-1',
      createdAt: new Date(), updatedAt: new Date(),
    };
    incidentRepo.findOne = jest.fn().mockResolvedValue(incident);
    incidentRepo.save = jest.fn().mockResolvedValue({ ...incident, status: 'acknowledged' as EmergencyIncidentStatus });
    timelineRepo.save = jest.fn().mockResolvedValue({ id: 'tl-1' } as any);

    const result = await service.updateIncidentStatus('inc-1', { status: 'acknowledged' }, null, 'admin-1');
    expect(result.status).toBe('acknowledged' as EmergencyIncidentStatus);
  });

  it('should reject invalid status transition', async () => {
    const incident = { id: 'inc-1', status: 'resolved' as EmergencyIncidentStatus };
    incidentRepo.findOne = jest.fn().mockResolvedValue(incident);

    await expect(service.updateIncidentStatus('inc-1', { status: 'open' }, null)).rejects.toThrow('Invalid status transition');
  });

  it('should create emergency contact', async () => {
    contactRepo.create = jest.fn().mockReturnValue({ driverId: 'driver-1', name: 'John', phone: '+919876543210' } as any);
    contactRepo.save = jest.fn().mockResolvedValue({ id: 'contact-1', driverId: 'driver-1', name: 'John' } as any);

    const result = await service.createEmergencyContact({
      driverId: 'driver-1', name: 'John', relationship: 'spouse', phone: '+919876543210', priority: 1,
    });
    expect(result).toBeDefined();
    expect(contactRepo.save).toHaveBeenCalled();
  });

  it('should get driver contacts', async () => {
    contactRepo.find = jest.fn().mockResolvedValue([{ id: 'c1', driverId: 'd1', priority: 1 } as any]);

    const result = await service.getDriverContacts('d1');
    expect(result).toHaveLength(1);
  });

  it('should get incident by id', async () => {
    incidentRepo.findOne = jest.fn().mockResolvedValue({ id: 'inc-1' } as any);
    const result = await service.getIncident('inc-1');
    expect(result.id).toBe('inc-1');
  });

  it('should throw for non-existing incident', async () => {
    incidentRepo.findOne = jest.fn().mockResolvedValue(null);
    await expect(service.getIncident('missing')).rejects.toThrow();
  });

  it('should return dashboard stats', async () => {
    incidentRepo.count = jest.fn().mockResolvedValue(10);
    timelineRepo.find = jest.fn().mockResolvedValue([]);
    incidentRepo.find = jest.fn().mockResolvedValue([]);

    const stats = await service.getDashboardStats();
    expect(stats.totalIncidents).toBeDefined();
    expect(stats.openIncidents).toBeDefined();
    expect(stats.incidentsBySeverity).toBeDefined();
  });

  it('should list incidents with filters', async () => {
    (incidentRepo.createQueryBuilder as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    });

    const result = await service.getIncidents({ status: 'open' } as any);
    expect(result).toBeDefined();
    expect(result.total).toBe(0);
  });

  describe('rankNearestDrivers', () => {
    it('returns an empty array when no drivers are available', async () => {
      driverRepo.find = jest.fn().mockResolvedValue([]);

      const result = await service.rankNearestDrivers(19.076, 72.88, 5);
      expect(result).toEqual([]);
    });

    it('ranks drivers by haversine distance from the incident', async () => {
      driverRepo.find = jest.fn().mockResolvedValue([
        { id: 'drv-1', currentLocation: { lat: 19.10, lng: 72.85 }, rating: 4.5, averageSpeed: 40, fraudScore: 0 } as any,
        { id: 'drv-2', currentLocation: { lat: 19.076, lng: 72.883 }, rating: 4.2, averageSpeed: 40, fraudScore: 0 } as any,
        { id: 'drv-3', currentLocation: { lat: 19.072, lng: 72.881 }, rating: 4.8, averageSpeed: 40, fraudScore: 0 } as any,
      ]);

      const result = await service.rankNearestDrivers(19.07, 72.88, 10);

      expect(result).toHaveLength(3);
      expect(result[0].driverId).toBe('drv-3');
      expect(result[1].driverId).toBe('drv-2');
      expect(result[2].driverId).toBe('drv-1');
      expect(result[0].distanceKm).toBeLessThan(result[1].distanceKm);
      for (const r of result) {
        expect(r.distanceKm).toBeGreaterThan(0);
        expect(r.etaMinutes).toBeGreaterThanOrEqual(1);
        expect(r.rating).toBeDefined();
      }
    });

    it('breaks ties by fraud score ascending', async () => {
      driverRepo.find = jest.fn().mockResolvedValue([
        { id: 'drv-fraud', currentLocation: { lat: 19.071, lng: 72.880 }, rating: 4.0, averageSpeed: 40, fraudScore: 7.5 } as any,
        { id: 'drv-clean', currentLocation: { lat: 19.071, lng: 72.880 }, rating: 4.0, averageSpeed: 40, fraudScore: 1.0 } as any,
      ]);

      const result = await service.rankNearestDrivers(19.07, 72.88, 10);

      expect(result).toHaveLength(2);
      expect(result[0].driverId).toBe('drv-clean');
    });

    it('respects the limit parameter', async () => {
      driverRepo.find = jest.fn().mockResolvedValue([
        { id: 'drv-1', currentLocation: { lat: 19.10, lng: 72.85 }, rating: 4.5, averageSpeed: 40, fraudScore: 0 } as any,
        { id: 'drv-2', currentLocation: { lat: 19.076, lng: 72.883 }, rating: 4.2, averageSpeed: 40, fraudScore: 0 } as any,
        { id: 'drv-3', currentLocation: { lat: 19.072, lng: 72.881 }, rating: 4.8, averageSpeed: 40, fraudScore: 0 } as any,
      ]);

      const result = await service.rankNearestDrivers(19.07, 72.88, 2);
      expect(result).toHaveLength(2);
      expect(result[0].driverId).toBe('drv-3');
    });

    it('excludes drivers without valid currentLocation', async () => {
      driverRepo.find = jest.fn().mockResolvedValue([
        { id: 'drv-nolocation', currentLocation: null, rating: 4.5, averageSpeed: 40, fraudScore: 0 } as any,
        { id: 'drv-1', currentLocation: { lat: 19.08, lng: 72.87 }, rating: 4.2, averageSpeed: 40, fraudScore: 0 } as any,
      ]);

      const result = await service.rankNearestDrivers(19.07, 72.88, 10);

      expect(result).toHaveLength(1);
      expect(result[0].driverId).toBe('drv-1');
    });
  });
});
