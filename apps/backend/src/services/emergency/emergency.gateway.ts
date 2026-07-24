import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EmergencyIncidentEntity, EmergencyIncidentStatus } from '../../db/entities/emergency-incident.entity';
import { EmergencyService } from './emergency.service';
import { isAllowedOrigin } from '../../security/cors-origin';

const ROOM_PATTERN = /^[a-zA-Z0-9:_-]{1,128}$/;

@Injectable()
@WebSocketGateway({
  cors: {
    origin: isAllowedOrigin,
    credentials: true,
  },
  namespace: '/emergency',
})
export class EmergencyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EmergencyGateway.name);

  constructor(private readonly emergencyService: EmergencyService) {}

  handleConnection(client: Socket) {
    const origin = client.handshake.headers.origin;
    if (typeof origin === 'string' && !isAllowedOrigin(origin)) {
      client.disconnect(true);
      return;
    }

    this.logger.log(`Client ${client.id} connected to emergency namespace`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected from emergency namespace`);
  }

  @SubscribeMessage('joinIncident')
  async handleJoinIncident(@MessageBody() data: { incidentId: string }, @ConnectedSocket() client: Socket) {
    if (typeof data.incidentId !== 'string' || !ROOM_PATTERN.test(data.incidentId)) {
      return { error: 'Invalid incidentId' };
    }

    client.join(`emergency:incident:${data.incidentId}`);
    this.logger.log(`Client ${client.id} joined emergency incident ${data.incidentId}`);
    return { status: 'joined', incidentId: data.incidentId };
  }

  @SubscribeMessage('acknowledgeIncident')
  async handleAcknowledgeIncident(@MessageBody() data: { incidentId: string }, @ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} acknowledged incident ${data.incidentId}`);
    return { status: 'acknowledged', incidentId: data.incidentId };
  }

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(@MessageBody() data: { incidentId: string; lat: number; lng: number; timestamp?: number }, @ConnectedSocket() client: Socket) {
    this.server.to(`emergency:incident:${data.incidentId}`).emit('driver.location', {
      incidentId: data.incidentId,
      lat: data.lat,
      lng: data.lng,
      timestamp: data.timestamp || Date.now(),
    });
    return { status: 'ok' };
  }

  async broadcastIncidentCreated(incident: EmergencyIncidentEntity) {
    this.server.emit('incident.created', { incident, timestamp: new Date().toISOString() });
  }

  async broadcastIncidentUpdated(incident: EmergencyIncidentEntity) {
    this.server.to(`emergency:incident:${incident.id}`).emit('incident.updated', { incident, timestamp: new Date().toISOString() });
  }

  async broadcastIncidentClosed(incident: EmergencyIncidentEntity) {
    this.server.to(`emergency:incident:${incident.id}`).emit('incident.closed', { incident, timestamp: new Date().toISOString() });
  }

  async broadcastLocationUpdate(incidentId: string, lat: number, lng: number) {
    this.server.to(`emergency:incident:${incidentId}`).emit('driver.location', {
      incidentId,
      lat,
      lng,
      timestamp: Date.now(),
    });
  }

  async broadcastAdminAcknowledged(incident: EmergencyIncidentEntity) {
    this.server.to(`emergency:incident:${incident.id}`).emit('admin.acknowledged', { incident, timestamp: new Date().toISOString() });
  }

  async broadcastIncidentResolved(incident: EmergencyIncidentEntity) {
    this.server.to(`emergency:incident:${incident.id}`).emit('incident.resolved', { incident, timestamp: new Date().toISOString() });
  }
}
