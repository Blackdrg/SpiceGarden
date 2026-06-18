import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { isAllowedOrigin } from '../../security/cors-origin';

const MAX_HTTP_BUFFER_SIZE = Number(process.env.WS_MAX_HTTP_BUFFER_SIZE || 1024);
const WS_RATE_LIMIT_MAX = Number(process.env.WS_RATE_LIMIT_MAX || 10);
const WS_RATE_LIMIT_WINDOW_MS = Number(process.env.WS_RATE_LIMIT_WINDOW_MS || 60000);
const BRANCH_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

@Injectable()
@WebSocketGateway({
  namespace: 'kds',
  maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE,
  allowEIO3: false,
  cors: { origin: isAllowedOrigin, credentials: true },
})
export class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(KdsGateway.name);
  private readonly connectionAttempts = new Map<string, { count: number; resetAt: number }>();

  @WebSocketServer()
  server!: Server;

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

    const branchId = client.handshake.query.branchId;
    if (typeof branchId === 'string' && BRANCH_ID_PATTERN.test(branchId)) {
      client.join(`branch:${branchId}`);
      this.logger.log(`Kitchen staff joined branch: ${branchId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Kitchen staff disconnected: ${client.id}`);
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
      this.logger.warn(`Rejected KDS websocket connection from ${key}: rate limit exceeded`);
      return false;
    }

    current.count += 1;
    this.connectionAttempts.set(key, current);
    return true;
  }

  // Notify kitchen of a new order
  notifyNewOrder(branchId: string, order: any) {
    if (!BRANCH_ID_PATTERN.test(branchId)) {
      this.logger.warn(`Rejected KDS notification for invalid branch: ${branchId}`);
      return;
    }

    this.server.to(`branch:${branchId}`).emit('newOrder', order);
  }

  @SubscribeMessage('updatePrepStatus')
  handleStatusUpdate(@MessageBody() data: { orderId: string; status: string; branchId: string }) {
    if (
      typeof data.orderId !== 'string' ||
      typeof data.status !== 'string' ||
      typeof data.branchId !== 'string' ||
      !BRANCH_ID_PATTERN.test(data.branchId)
    ) {
      return { error: 'Invalid prep status update' };
    }

    this.logger.log(`Order ${data.orderId} status updated to ${data.status} by kitchen`);
    // Broadcast update to other kitchen staff and customer app
    this.server.to(`branch:${data.branchId}`).emit('orderStatusUpdated', data);
  }
}
