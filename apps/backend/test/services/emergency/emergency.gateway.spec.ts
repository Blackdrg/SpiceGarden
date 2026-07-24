import { describe, it, expect, beforeEach } from '@jest/globals';
import { EmergencyGateway } from '../../../src/services/emergency/emergency.gateway';
import { EmergencyIncidentEntity, EmergencyIncidentStatus } from '../../../src/db/entities/emergency-incident.entity';
import { EmergencyService } from '../../../src/services/emergency/emergency.service';
import { isAllowedOrigin } from '../../../src/security/cors-origin';

jest.mock('../../../src/security/cors-origin', () => ({
  isAllowedOrigin: jest.fn(() => true),
}));

const createMockServer = () => ({
  emit: jest.fn(),
  to: jest.fn().mockReturnValue({ emit: jest.fn() }),
  engine: { clientsCount: 0 },
});

const createMockClient = (id = 'client-1') => ({
  id,
  handshake: { headers: { origin: 'http://localhost:3000' } },
  join: jest.fn(),
  disconnect: jest.fn(),
});

describe('EmergencyGateway unit tests', () => {
  let gateway: EmergencyGateway;
  let mockEmergencyService: Partial<EmergencyService>;
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    jest.clearAllMocks();
    (isAllowedOrigin as jest.Mock).mockReturnValue(true);
    mockServer = createMockServer();
    mockEmergencyService = {} as any;

    gateway = new EmergencyGateway(mockEmergencyService as EmergencyService);
    (gateway as any).server = mockServer;
  });

  it('should be defined', () => { expect(gateway).toBeDefined(); });

  it('handleConnection should accept valid origins', () => {
    const client = createMockClient();
    gateway.handleConnection(client as any);
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('handleDisconnect should work without errors', () => {
    const client = createMockClient();
    gateway.handleDisconnect(client as any);
  });

  it('handleJoinIncident should join room', async () => {
    const client = createMockClient();
    const result = await gateway.handleJoinIncident({ incidentId: 'inc-1' }, client as any);
    expect(result.status).toBe('joined');
  });

  it('handleJoinIncident should reject invalid incidentId', async () => {
    const client = createMockClient();
    const result = await gateway.handleJoinIncident({ incidentId: '<script>' }, client as any);
    expect(result.error).toBeDefined();
  });

  it('handleAcknowledgeIncident should return acknowledgement', async () => {
    const client = createMockClient();
    const result = await gateway.handleAcknowledgeIncident({ incidentId: 'inc-1' }, client as any);
    expect(result.status).toBe('acknowledged');
  });

  it('handleLocationUpdate should broadcast to room', () => {
    const client = createMockClient();
    gateway.handleLocationUpdate({ incidentId: 'inc-1', lat: 19.07, lng: 72.88 }, client as any);
    expect(mockServer.to).toHaveBeenCalledWith('emergency:incident:inc-1');
  });

  it('broadcastIncidentCreated should emit to all clients', () => {
    const incident = { id: 'inc-1', incidentNumber: 'SOS-202607-0001', status: EmergencyIncidentStatus.OPEN, driverId: 'driver-1' } as EmergencyIncidentEntity;
    gateway.broadcastIncidentCreated(incident);
    expect(mockServer.emit).toHaveBeenCalledWith('incident.created', expect.any(Object));
  });

  it('broadcastIncidentUpdated should emit to incident room', () => {
    const incident = { id: 'inc-1', incidentNumber: 'SOS-202607-0001', status: 'acknowledged' as EmergencyIncidentStatus } as EmergencyIncidentEntity;
    gateway.broadcastIncidentUpdated(incident);
    expect(mockServer.to).toHaveBeenCalledWith('emergency:incident:inc-1');
  });

  it('broadcastLocationUpdate should emit to incident room', () => {
    gateway.broadcastLocationUpdate('inc-1', 19.07, 72.88);
    expect(mockServer.to).toHaveBeenCalledWith('emergency:incident:inc-1');
  });

  it('broadcastAdminAcknowledged should emit to incident room', () => {
    const incident = { id: 'inc-1' } as EmergencyIncidentEntity;
    gateway.broadcastAdminAcknowledged(incident);
    expect(mockServer.to).toHaveBeenCalledWith('emergency:incident:inc-1');
  });

  it('broadcastIncidentResolved should emit to incident room', () => {
    const incident = { id: 'inc-1' } as EmergencyIncidentEntity;
    gateway.broadcastIncidentResolved(incident);
    expect(mockServer.to).toHaveBeenCalledWith('emergency:incident:inc-1');
  });
});
