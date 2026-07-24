import { describe, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyController } from '../../../src/services/emergency/emergency.controller';
import { EmergencyService } from '../../../src/services/emergency/emergency.service';
import { JwtAuthGuard } from '../../../src/security/jwt-auth.guard';
import { RolesGuard } from '../../../src/security/roles.guard';

describe('EmergencyController unit tests', () => {
  let controller: EmergencyController;
  let mockEmergencyService: Partial<EmergencyService>;

  beforeEach(async () => {
    mockEmergencyService = {
      createSos: jest.fn(), updateLocation: jest.fn(),
      getIncident: jest.fn(), getIncidentTimeline: jest.fn(), getIncidents: jest.fn(),
      updateIncidentStatus: jest.fn(), createEmergencyContact: jest.fn(),
      getDriverContacts: jest.fn(), getDashboardStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyController],
      providers: [{ provide: EmergencyService, useValue: mockEmergencyService }],
    }).compile();

    controller = module.get(EmergencyController);
  });

  it('should be defined', () => { expect(controller).toBeDefined(); });

  it('triggerSos should call emergency service', async () => {
    mockEmergencyService.createSos = jest.fn().mockResolvedValue({ id: 'inc-1', incidentNumber: 'SOS-202607-0001' });
    const req = { user: { sub: 'driver-1', id: 'driver-1' } };
    const dto = { driverId: 'driver-1', latitude: 19.07, longitude: 72.88, deviceBattery: 80 };

    const result = await controller.triggerSos(dto as any, req as any);
    expect(result.success).toBe(true);
    expect(result.data.incidentNumber).toBe('SOS-202607-0001');
  });

  it('updateLocation should call emergency service', async () => {
    mockEmergencyService.updateLocation = jest.fn().mockResolvedValue({ id: 'inc-1' });
    const req = { user: { sub: 'driver-1' } };
    const dto = { incidentId: 'inc-1', latitude: 19.08, longitude: 72.89 };

    const result = await controller.updateLocation(dto as any, req as any);
    expect(result.success).toBe(true);
  });

  it('getIncident should return incident', async () => {
    mockEmergencyService.getIncident = jest.fn().mockResolvedValue({ id: 'inc-1' });
    const result = await controller.getIncident('inc-1');
    expect(result.id).toBe('inc-1');
  });

  it('getIncidentTimeline should return timeline', async () => {
    mockEmergencyService.getIncidentTimeline = jest.fn().mockResolvedValue([{ event: 'incident_created' } as any]);
    const result = await controller.getIncidentTimeline('inc-1');
    expect(result).toHaveLength(1);
  });

  it('getIncidents should return filtered list', async () => {
    mockEmergencyService.getIncidents = jest.fn().mockResolvedValue({ incidents: [], total: 0 });
    const result = await controller.getIncidents({ status: 'open' } as any);
    expect(result.total).toBe(0);
  });

  it('updateIncidentStatus should transition incident', async () => {
    mockEmergencyService.updateIncidentStatus = jest.fn().mockResolvedValue({ id: 'inc-1', status: 'acknowledged' });
    const req = { user: { sub: 'admin-1' } };
    const dto = { status: 'acknowledged' };

    const result = await controller.updateIncidentStatus('inc-1', dto, req as any);
    expect(result.success).toBe(true);
  });

  it('createContact should create emergency contact', async () => {
    mockEmergencyService.createEmergencyContact = jest.fn().mockResolvedValue({ id: 'c1', driverId: 'd1' });
    const dto = { driverId: 'd1', name: 'John', relationship: 'spouse', phone: '+919876543210', priority: 1 };

    const result = await controller.createContact(dto as any);
    expect(result.id).toBe('c1');
  });

  it('getContacts should return contacts for driver', async () => {
    mockEmergencyService.getDriverContacts = jest.fn().mockResolvedValue([{ id: 'c1' }]);
    const result = await controller.getContacts('driver-1');
    expect(result).toHaveLength(1);
  });

  it('getDashboard should return stats', async () => {
    mockEmergencyService.getDashboardStats = jest.fn().mockResolvedValue({ totalIncidents: 0, openIncidents: 0 });
    const result = await controller.getDashboard();
    expect(result.totalIncidents).toBe(0);
  });
});
