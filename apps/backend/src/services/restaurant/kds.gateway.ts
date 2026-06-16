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

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
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
