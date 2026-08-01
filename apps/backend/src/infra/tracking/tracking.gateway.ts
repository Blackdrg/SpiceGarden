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
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from '../../db/entities/notification.entity';
import { randomString } from '../../../shared/random.utils';
import { NotificationStatus } from '../../db/entities/notification-status.enum';
import { isAllowedOrigin } from '../../security/cors-origin';

const MAX_HTTP_BUFFER_SIZE = Number(process.env.WS_MAX_HTTP_BUFFER_SIZE || 1024);
const WS_RATE_LIMIT_MAX = Number(process.env.WS_RATE_LIMIT_MAX || 10);
const WS_RATE_LIMIT_WINDOW_MS = Number(process.env.WS_RATE_LIMIT_WINDOW_MS || 60000);
const ROOM_PATTERN = /^[a-zA-Z0-9:_-]{1,128}$/;
const DRIVER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const MAX_ACK_MESSAGES_PER_CLIENT = 500;
const MSG_QUEUE_TTL_MS = Number(process.env.WS_MSG_QUEUE_TTL_MS || 60000);

export enum SocketNamespace {
  TRACKING = '/tracking',
  KDS = '/kds',
  ADMIN = '/admin',
  DRIVER = '/driver',
}

interface LocationUpdate {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

interface AcknowledgedMessage {
  id: string;
  event: string;
  data: any;
  timestamp: Date;
  ack?: boolean;
}

interface SocketConnection {
  id: string;
  namespace?: string;
  userId?: string;
  lastPing?: Date;
  acknowledgedMessages: Map<string, AcknowledgedMessage>;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: isAllowedOrigin,
    credentials: true,
  },
  namespace: '/',
  maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE,
  allowEIO3: false,
  pingInterval: 10000,
  pingTimeout: 20000,
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private readonly connectedClients = new Map<string, SocketConnection>();
  private readonly connectionAttempts = new Map<string, { count: number; resetAt: number }>();
  private readonly messageQueue = new Map<string, AcknowledgedMessage[]>();
  private readonly pendingAcks = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void; timeout: NodeJS.Timeout }>();
  private readonly driverLastSeen = new Map<string, number>();
  private readonly ackTimeoutMs: number;
  private readonly cleanupIntervals: NodeJS.Timeout[] = [];

  constructor(
    private configService: ConfigService,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {
    this.ackTimeoutMs = this.configService.get<number>('WS_ACK_TIMEOUT_MS', 5000);
    const connectionAttemptInterval = setInterval(() => this.cleanupStaleConnectionAttempts(), WS_RATE_LIMIT_WINDOW_MS);
    const messageQueueInterval = setInterval(() => this.cleanupStaleMessageQueue(), MSG_QUEUE_TTL_MS);
    this.cleanupIntervals.push(connectionAttemptInterval, messageQueueInterval);
    for (const interval of this.cleanupIntervals) {
      (interval as { unref?: () => void }).unref?.();
    }
  }

  onModuleDestroy() {
    for (const interval of this.cleanupIntervals) {
      clearInterval(interval);
    }
    this.cleanupIntervals.length = 0;
  }

  handleConnection(client: Socket) {
    if (!this.isConnectionAllowed(client)) {
      client.disconnect(true);
      return;
    }

    const origin = client.handshake.headers.origin;
    if (typeof origin === 'string' && !isAllowedOrigin(origin)) {
      client.disconnect(true);
      return;
    }

    const namespace = client.nsp.name;
    this.connectedClients.set(client.id, {
      id: client.id,
      namespace,
      acknowledgedMessages: new Map(),
    });
    this.logger.log(`Client ${client.id} connected to ${namespace}`);
    
    client.emit('connected', { status: 'ok', serverTime: Date.now() });
  }

  handleDisconnect(client: Socket) {
    this.cleanupPendingAcks(client.id);
    this.connectedClients.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  private isConnectionAllowed(client: Socket): boolean {
    const now = Date.now();
    const forwardedFor = client.handshake.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim();
    const key = forwardedIp || client.handshake.address || client.id;
    const current = this.connectionAttempts.get(key);

    if (!current || now >= current.resetAt) {
      this.connectionAttempts.set(key, { count: 1, resetAt: now + WS_RATE_LIMIT_WINDOW_MS });
      return true;
    }

    if (current.count >= WS_RATE_LIMIT_MAX) {
      this.logger.warn(`Rejected websocket connection from ${key}: rate limit exceeded`);
      return false;
    }

    current.count += 1;
    this.connectionAttempts.set(key, current);
    return true;
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const conn = this.connectedClients.get(client.id);
    if (conn) {
      conn.lastPing = new Date();
    }
    return { status: 'pong', serverTime: Date.now() };
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    if (typeof data.room !== 'string' || !ROOM_PATTERN.test(data.room)) {
      return { error: 'Invalid room' };
    }

    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room ${data.room}`);
    return { status: 'joined', room: data.room };
  }

  @SubscribeMessage('ack')
  handleAcknowledgement(@MessageBody() data: { messageId: string }, @ConnectedSocket() client: Socket) {
    const conn = this.connectedClients.get(client.id);
    if (conn && conn.acknowledgedMessages.has(data.messageId)) {
      conn.acknowledgedMessages.get(data.messageId)!.ack = true;
      
      const pending = this.pendingAcks.get(data.messageId);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve({ status: 'acknowledged' });
        this.pendingAcks.delete(data.messageId);
      }
    }
    return { status: 'ack_received' };
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: AcknowledgedMessage,
    @ConnectedSocket() client: Socket
  ) {
    const conn = this.connectedClients.get(client.id);
    if (!conn) return { error: 'Not connected' };

    data.timestamp = new Date();
    if (conn.acknowledgedMessages.size >= MAX_ACK_MESSAGES_PER_CLIENT) {
      const oldestKey = conn.acknowledgedMessages.keys().next().value;
      if (oldestKey) {
        conn.acknowledgedMessages.delete(oldestKey);
      }
    }
    conn.acknowledgedMessages.set(data.id, data);

    if (data.ack) {
      const ackResult = await new Promise((resolve, reject) => {
        const ackTimeout = setTimeout(() => {
          this.pendingAcks.delete(data.id);
          resolve({ status: 'timeout', message: 'Acknowledgement timeout' });
        }, this.ackTimeoutMs);
        (ackTimeout as { unref?: () => void }).unref?.();
        this.pendingAcks.set(data.id, {
          resolve,
          reject,
          timeout: ackTimeout,
        });
      });
      return ackResult;
    }

    return { status: 'received' };
  }

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(@MessageBody() data: LocationUpdate, @ConnectedSocket() client: Socket) {
    if (typeof data.driverId !== 'string' || !DRIVER_ID_PATTERN.test(data.driverId) || !this.isValidLocation(data)) {
      return { error: 'Invalid location data' };
    }

    const messageId = `loc_${Date.now()}_${randomString(9)}`;
    const topic = `tracking:${data.driverId}`;
    
    this.server.to(topic).emit('locationUpdate', {
      ...data,
      timestamp: new Date().toISOString(),
      messageId,
    });

    this.driverLastSeen.set(data.driverId, Date.now());
    this.checkOfflineTimeout(data.driverId);
    
    return { status: 'ok', messageId };
  }

  @SubscribeMessage('kdsUpdate')
  async handleKDSUpdate(@MessageBody() data: { orderId: string; status: string; branchId: string; timestamp?: Date }) {
    if (typeof data.orderId !== 'string' || typeof data.status !== 'string' || typeof data.branchId !== 'string' || !ROOM_PATTERN.test(data.branchId)) {
      return { error: 'Invalid KDS update' };
    }

    const messageId = `kds_${Date.now()}_${randomString(9)}`;
    const topic = `kds:${data.branchId}`;
    
    this.server.to(topic).emit('kdsUpdate', {
      ...data,
      timestamp: data.timestamp || new Date(),
      messageId,
    });
    
    return { status: 'ok', messageId };
  }

  @SubscribeMessage('driverEvent')
  async handleDriverEvent(@MessageBody() data: { driverId: string; orderId?: string; event: string }) {
    if (typeof data.driverId !== 'string' || !DRIVER_ID_PATTERN.test(data.driverId) || typeof data.event !== 'string') {
      return { error: 'Invalid driver event' };
    }

    const messageId = `drv_${Date.now()}_${randomString(9)}`;
    const topic = `driver:${data.driverId}`;
    
    this.server.to(topic).emit('driverEvent', { 
      ...data, 
      timestamp: new Date().toISOString(),
      messageId,
    });
    
    return { status: 'ok', messageId };
  }

  async publish(topic: string, data: any, requireAck: boolean = false): Promise<any> {
    const messageId = `pub_${Date.now()}_${randomString(9)}`;
    
    if (requireAck) {
      return this.waitForAcknowledgement(`${topic}`, { ...data, messageId });
    }
    
    this.server.emit(topic, { ...data, messageId });
    return { status: 'sent', messageId };
  }

  async publishToRoom(room: string, data: any, requireAck: boolean = false): Promise<any> {
    if (typeof room !== 'string' || !ROOM_PATTERN.test(room)) {
      return { error: 'Invalid room' };
    }

    const messageId = `room_${Date.now()}_${randomString(9)}`;
    
    if (requireAck) {
      return this.waitForAcknowledgement(`room:${room}`, { ...data, messageId });
    }
    
    this.server.to(room).emit(room, { ...data, messageId });
    return { status: 'sent', messageId };
  }

  getActiveConnections(): number {
    return this.server.engine.clientsCount;
  }

  getNamespaceStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.connectedClients.forEach((client) => {
      const ns = client.namespace || 'any';
      stats[ns] = (stats[ns] || 0) + 1;
    });
    return stats;
  }

  private isValidLocation(data: LocationUpdate): boolean {
    return (
      typeof data.driverId === 'string' &&
      typeof data.lat === 'number' &&
      typeof data.lng === 'number' &&
      data.lat >= -90 &&
      data.lat <= 90 &&
      data.lng >= -180 &&
      data.lng <= 180
    );
  }

  private checkOfflineTimeout(driverId: string): void {
    const now = Date.now();
    const lastSeen = this.driverLastSeen.get(driverId);
    if (!lastSeen) return;

    const offlineDuration = now - lastSeen;
    const timeoutMs = 30000;

    if (offlineDuration > timeoutMs) {
      this.logger.warn(`Driver ${driverId} offline for ${Math.floor(offlineDuration / 1000)}s, marking unavailable`);
      this.server.to(`driver:${driverId}`).emit('driver:status', {
        driverId,
        status: 'offline',
        offlineDuration,
      });
    }
  }

  private async waitForAcknowledgement(roomOrTopic: string, data: any): Promise<any> {
    const messageId = data.messageId;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingAcks.delete(messageId);
        resolve({ status: 'timeout', messageId });
      }, this.ackTimeoutMs);
      (timeout as { unref?: () => void }).unref?.();
      this.pendingAcks.set(messageId, { resolve, reject, timeout });
      this.server.to(roomOrTopic).emit('message', data);
    });
  }

  private cleanupPendingAcks(clientId: string) {
    const conn = this.connectedClients.get(clientId);
    if (!conn) return;
    for (const [messageId, message] of conn.acknowledgedMessages.entries()) {
      if (!message.ack) {
        conn.acknowledgedMessages.delete(messageId);
      }
      const pending = this.pendingAcks.get(messageId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingAcks.delete(messageId);
      }
    }
  }

  private cleanupStaleConnectionAttempts(): void {
    const now = Date.now();
    for (const [key, entry] of this.connectionAttempts.entries()) {
      if (now >= entry.resetAt) {
        this.connectionAttempts.delete(key);
      }
    }
  }

  private cleanupStaleMessageQueue(): void {
    const now = Date.now();
    for (const [driverId, queue] of this.messageQueue.entries()) {
      const filtered = queue.filter((msg) => {
        if (!msg.timestamp) return false;
        return now - msg.timestamp.getTime() < MSG_QUEUE_TTL_MS;
      });
      if (filtered.length === 0) {
        this.messageQueue.delete(driverId);
      } else {
        this.messageQueue.set(driverId, filtered);
      }
    }
  }

  async getQueuedMessages(driverId: string): Promise<AcknowledgedMessage[]> {
    return this.messageQueue.get(driverId) || [];
  }

  async requeueUndeliveredMessages(driverId: string, messageIds: string[]) {
    const queue = this.messageQueue.get(driverId) || [];
    const conn = this.connectedClients.get(driverId);
    
    if (conn) {
    const messageIdSet = new Set(messageIds);
    const undelivered = Array.from(conn.acknowledgedMessages.values())
      .filter(m => messageIdSet.has(m.id) && !m.ack);
      
      queue.push(...undelivered);
      this.messageQueue.set(driverId, queue);
    }
  }
}