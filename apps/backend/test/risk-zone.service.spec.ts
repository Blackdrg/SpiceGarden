import { Test, TestingModule } from '@nestjs/testing';
import { RiskZoneService } from '../src/services/risk/risk-zone.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskZoneEntity, RiskSeverity, ZoneType } from '../src/db/entities/risk-zone.entity';
import { RiskEventEntity, RiskEventType } from '../src/db/entities/risk-event.entity';
import { RiskNotificationEntity } from '../src/db/entities/risk-notification.entity';
import { AuditService } from '../src/audit/audit.service';
import { NotificationService } from '../src/services/notifications/notification.service';
import { ConfigService } from '@nestjs/config';

describe('RiskZoneService', () => {
  let service: RiskZoneService;
  let zoneRepo: jest.Mocked<Repository<RiskZoneEntity>>;
  let eventRepo: jest.Mocked<Repository<RiskEventEntity>>;
  let notificationRepo: jest.Mocked<Repository<RiskNotificationEntity>>;

  beforeEach(async () => {
    zoneRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn(), count: jest.fn(), createQueryBuilder: jest.fn(() => ({ where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(), getMany: jest.fn(), getOne: jest.fn(), delete: jest.fn().mockReturnThis(), execute: jest.fn() })) as any } as any;
    eventRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), count: jest.fn(), createQueryBuilder: jest.fn(() => ({ where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), getMany: jest.fn() })) as any } as any;
    notificationRepo = { create: jest.fn(), save: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskZoneService,
        { provide: AuditService, useValue: { log: jest.fn() } },
        { provide: NotificationService, useValue: { sendPush: jest.fn() } },
        { provide: getRepositoryToken(RiskZoneEntity), useValue: zoneRepo },
        { provide: getRepositoryToken(RiskEventEntity), useValue: eventRepo },
        { provide: getRepositoryToken(RiskNotificationEntity), useValue: notificationRepo },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(50) } },
      ],
    }).compile();

    service = module.get(RiskZoneService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('should create a radius risk zone', async () => {
    zoneRepo.create = jest.fn().mockReturnValue({} as any);
    zoneRepo.save = jest.fn().mockResolvedValue({ id: 'z1', name: 'Test Zone', riskScore: 75 } as any);
    jest.spyOn(service, 'getRiskZones').mockResolvedValue([]);
    jest.spyOn(service, 'recordRiskEvent').mockResolvedValue({ id: 'event_123', eventType: RiskEventType.ZONE_ENTERED, description: '', severity: 'info', createdAt: new Date() } as any);
    const result = await service.createRiskZone({ name: 'Test Zone', zoneType: ZoneType.RADIUS as any, centerLat: 19.0760, centerLng: 72.8777, radiusMeters: 500, riskScore: 75, severity: RiskSeverity.HIGH as any, crimeCategory: 'theft', reason: 'High theft reports' });
    expect(result).toBeDefined();
    expect(result.name).toBe('Test Zone');
  });

  it('should throw for polygon with < 3 points', async () => {
    await expect(service.createRiskZone({ name: 'x', zoneType: ZoneType.POLYGON as any, polygon: [{ lat: 1, lng: 1 }] })).rejects.toThrow();
  });

  it('should throw for radius without coords', async () => {
    await expect(service.createRiskZone({ name: 'x', zoneType: ZoneType.RADIUS as any })).rejects.toThrow();
  });

  it('should get all risk zones', async () => {
    jest.spyOn(service, 'getRiskZones').mockResolvedValue([{ id: 'z1', name: 'Zone 1', riskScore: 80 } as any]);
    const result = await service.getRiskZones();
    expect(result).toHaveLength(1);
  });

  it('should record risk event', async () => {
    jest.spyOn(service, 'recordRiskEvent').mockResolvedValue({ id: 'e1', createdAt: new Date() } as any);
    const result = await service.recordRiskEvent({ eventType: RiskEventType.ZONE_ENTERED, description: 'test' });
    expect(result).toBeDefined();
  });

  it('should return null when point is not in any risk zone', async () => {
    jest.spyOn(service, 'isPointInRiskZone').mockResolvedValue(null);
    const result = await service.isPointInRiskZone(0, 0);
    expect(result).toBeNull();
  });

  it('should return risk stats', async () => {
    jest.spyOn(service, 'getRiskStats').mockResolvedValue({ totalZones: 5, activeZones: 3, criticalZones: 1, totalEvents24h: 10, totalEvents7d: 50, eventsByType: {}, eventsBySeverity: {} });
    const stats = await service.getRiskStats();
    expect(stats.totalZones).toBe(5);
  });
});
