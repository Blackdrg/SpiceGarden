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

@Injectable()
@WebSocketGateway({
  namespace: 'kds',
  cors: { origin: isAllowedOrigin, credentials: true },
})
export class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(KdsGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const branchId = client.handshake.query.branchId;
    if (branchId) {
      client.join(`branch:${branchId}`);
      this.logger.log(`Kitchen staff joined branch: ${branchId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Kitchen staff disconnected: ${client.id}`);
  }

  // Notify kitchen of a new order
  notifyNewOrder(branchId: string, order: any) {
    this.server.to(`branch:${branchId}`).emit('newOrder', order);
  }

  @SubscribeMessage('updatePrepStatus')
  handleStatusUpdate(@MessageBody() data: { orderId: string; status: string; branchId: string }) {
    this.logger.log(`Order ${data.orderId} status updated to ${data.status} by kitchen`);
    // Broadcast update to other kitchen staff and customer app
    this.server.to(`branch:${data.branchId}`).emit('orderStatusUpdated', data);
  }
}
