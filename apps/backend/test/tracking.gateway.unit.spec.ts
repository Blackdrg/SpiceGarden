import { describe, it, expect, beforeEach } from '@jest/globals';
import { TrackingGateway } from '../src/infra/tracking/tracking.gateway';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

const createMockConfigService = (ackTimeout = 5000): ConfigService => ({
  get: jest.fn().mockReturnValue(ackTimeout),
} as unknown as ConfigService);

const createMockRepo = (): any => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
}) as unknown as Repository<any>;

const buildGateway = (ackTimeout = 5000) => {
  const gateway = new TrackingGateway(
    createMockConfigService(ackTimeout),
    createMockRepo(),
  );
  return gateway;
};

describe('TrackingGateway unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidLocation', () => {
    it('should accept valid location data', () => {
      const gateway = buildGateway();
      const data = { driverId: 'd1', lat: 30.7, lng: 76.8, speed: 40, heading: 90, timestamp: Date.now() } as any;
      expect((gateway as any).isValidLocation(data)).toBe(true);
    });

    it('should reject missing driverId', () => {
      const gateway = buildGateway();
      const data = { lat: 30.7, lng: 76.8 } as any;
      expect((gateway as any).isValidLocation(data)).toBe(false);
    });

    it('should reject non-number latitude', () => {
      const gateway = buildGateway();
      expect((gateway as any).isValidLocation({ driverId: 'd1', lat: 'abc', lng: 76.8 } as any)).toBe(false);
    });

    it('should reject out-of-range latitude', () => {
      const gateway = buildGateway();
      expect((gateway as any).isValidLocation({ driverId: 'd1', lat: 100, lng: 76.8 } as any)).toBe(false);
    });

    it('should reject out-of-range longitude', () => {
      const gateway = buildGateway();
      expect((gateway as any).isValidLocation({ driverId: 'd1', lat: 30.7, lng: -200 } as any)).toBe(false);
    });
  });

  describe('isConnectionAllowed - rate limiting', () => {
    it('should allow first connection from new IP', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        handshake: { headers: {}, address: '10.0.0.1' } as any,
      } as any;
      expect((gateway as any).isConnectionAllowed(client)).toBe(true);
    });

    it('should reject after max attempts', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        handshake: { headers: {}, address: '10.0.0.1' } as any,
      } as any;
      for (let i = 0; i < 10; i++) {
        (gateway as any).isConnectionAllowed(client);
      }
      expect((gateway as any).isConnectionAllowed(client)).toBe(false);
    });

    it('should use x-forwarded-for as connection key', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        handshake: {
          headers: { 'x-forwarded-for': '203.0.113.5, 198.51.100.1' },
          address: '10.0.0.1',
        } as any,
      } as any;
      expect((gateway as any).isConnectionAllowed(client)).toBe(true);
    });

    it('should reset rate limit after window expires', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        handshake: {
          headers: {},
          address: '10.0.0.1',
        } as any,
      } as any;
      for (let i = 0; i < 10; i++) {
        (gateway as any).isConnectionAllowed(client);
      }
      expect((gateway as any).isConnectionAllowed(client)).toBe(false);

      jest.useFakeTimers();
      jest.advanceTimersByTime(60001);
      expect((gateway as any).isConnectionAllowed(client)).toBe(true);
      jest.useRealTimers();
    });
  });

  describe('getNamespaceStats', () => {
    it('should return counts per namespace', () => {
      const gateway = buildGateway();
      (gateway as any).server = {
        engine: { clientsCount: 5 },
      } as any;
      (gateway as any).connectedClients.set('c1', { id: 'c1', namespace: '/tracking', acknowledgedMessages: new Map() });
      (gateway as any).connectedClients.set('c2', { id: 'c2', namespace: '/tracking', acknowledgedMessages: new Map() });
      (gateway as any).connectedClients.set('c3', { id: 'c3', namespace: '/kds', acknowledgedMessages: new Map() });

      const stats = (gateway as any).getNamespaceStats();
      expect(stats['/tracking']).toBe(2);
      expect(stats['/kds']).toBe(1);
    });
  });

  describe('getQueuedMessages', () => {
    it('should return empty array when no messages queued', async () => {
      const gateway = buildGateway();
      const result = await (gateway as any).getQueuedMessages('d1');
      expect(result).toEqual([]);
    });

    it('should return queued messages for driver', async () => {
      const gateway = buildGateway();
      (gateway as any).messageQueue.set('d1', [{ id: 'm1', event: 'test' }]);
      const result = await (gateway as any).getQueuedMessages('d1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('m1');
    });
  });

  describe('requeueUndeliveredMessages', () => {
    it('should requeue unacknowledged messages', async () => {
      const gateway = buildGateway();
      const connId = 'd1';
      (gateway as any).connectedClients.set(connId, {
        id: connId,
        acknowledgedMessages: new Map([
          ['m1', { id: 'm1', ack: false }],
          ['m2', { id: 'm2', ack: true }],
        ]),
      });
      await (gateway as any).requeueUndeliveredMessages(connId, ['m1', 'm2']);

      const queue = (gateway as any).messageQueue.get(connId) || [];
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe('m1');
    });

    it('should not requeue when driver has no connection', async () => {
      const gateway = buildGateway();
      await (gateway as any).requeueUndeliveredMessages('missing', ['m1']);
      expect((gateway as any).messageQueue.has('missing')).toBe(false);
    });
  });

  describe('handlePing', () => {
    it('should respond with pong and update lastPing for connected client', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        emit: jest.fn(),
      } as any;
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/tracking',
        acknowledgedMessages: new Map(),
      });

      const result = (gateway as any).handlePing(client);
      expect(result.status).toBe('pong');
      expect(result.serverTime).toBeGreaterThan(0);

      const conn = (gateway as any).connectedClients.get('c1');
      expect(conn.lastPing).toBeInstanceOf(Date);
    });

    it('should handle ping for disconnected client', () => {
      const gateway = buildGateway();
      const client = {
        id: 'unknown',
        emit: jest.fn(),
      } as any;
      const result = (gateway as any).handlePing(client);
      expect(result.status).toBe('pong');
    });
  });

  describe('handleJoin', () => {
    it('should join valid room', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        join: jest.fn(),
        emit: jest.fn(),
      } as any;
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/tracking',
        acknowledgedMessages: new Map(),
      });

      const result = (gateway as any).handleJoin({ room: 'order_123' }, client);
      expect(result.status).toBe('joined');
      expect(result.room).toBe('order_123');
      expect(client.join).toHaveBeenCalledWith('order_123');
    });

    it('should reject invalid room with error', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        join: jest.fn(),
        emit: jest.fn(),
      } as any;
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/tracking',
        acknowledgedMessages: new Map(),
      });

      const result = (gateway as any).handleJoin({ room: '../etc/passwd' }, client);
      expect(result.error).toBe('Invalid room');
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handleAcknowledgement', () => {
    it('should resolve pending ack when message is acknowledged', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        emit: jest.fn(),
      } as any;
      const messageId = 'msg-1';
      const resolveFn = jest.fn();
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/tracking',
        acknowledgedMessages: new Map([[messageId, { id: messageId, ack: false }]]),
      });
      (gateway as any).pendingAcks.set(messageId, { resolve: resolveFn, reject: jest.fn(), timeout: 1 });

      (gateway as any).handleAcknowledgement({ messageId }, client);
      expect(resolveFn).toHaveBeenCalledWith({ status: 'acknowledged' });
      expect((gateway as any).pendingAcks.has(messageId)).toBe(false);
    });

    it('should do nothing when message not found in acknowledged list', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        emit: jest.fn(),
      } as any;

      const result = (gateway as any).handleAcknowledgement({ messageId: 'unknown' }, client);
      expect(result.status).toBe('ack_received');
    });
  });

  describe('getActiveConnections', () => {
    it('should return server client count', () => {
      const gateway = buildGateway();
      (gateway as any).server = {
        engine: { clientsCount: 42 },
      } as any;
      expect((gateway as any).getActiveConnections()).toBe(42);
    });
  });

  describe('handleDisconnect', () => {
    it('should cleanup pending acks and connected clients', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        emit: jest.fn(),
      } as any;
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/tracking',
        acknowledgedMessages: new Map([['msg-1', { id: 'msg-1', event: 'test', ack: false, timestamp: new Date() }]]),
      });
      (gateway as any).pendingAcks.set('msg-1', { resolve: jest.fn(), reject: jest.fn(), timeout: 1 });

      (gateway as any).handleDisconnect(client);
      expect((gateway as any).connectedClients.has('c1')).toBe(false);
      expect((gateway as any).pendingAcks.has('msg-1')).toBe(false);
    });
  });

  describe('handleConnection', () => {
    it('should register client and emit connected event', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        nsp: { name: '/tracking' },
        handshake: {
          headers: { origin: 'http://localhost:3002' },
          address: '10.0.0.1',
        } as any,
        emit: jest.fn(),
      } as any;
      (gateway as any).isConnectionAllowed = jest.fn().mockReturnValue(true);

      (gateway as any).handleConnection(client);

      expect((gateway as any).connectedClients.has('c1')).toBe(true);
      expect(client.emit).toHaveBeenCalledWith('connected', expect.objectContaining({ status: 'ok' }));
    });

    it('should disconnect client when origin is not allowed', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        nsp: { name: '/tracking' },
        handshake: {
          headers: { origin: 'http://evil.com' },
          address: '10.0.0.1',
        } as any,
        disconnect: jest.fn(),
        emit: jest.fn(),
      } as any;
      (gateway as any).isConnectionAllowed = jest.fn().mockReturnValue(true);

      (gateway as any).handleConnection(client);

      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('should disconnect when connection rate limited', () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        nsp: { name: '/tracking' },
        handshake: {
          headers: { origin: 'http://localhost:3002' },
          address: '10.0.0.1',
        } as any,
        disconnect: jest.fn(),
        emit: jest.fn(),
      } as any;
      (gateway as any).isConnectionAllowed = jest.fn().mockReturnValue(false);

      (gateway as any).handleConnection(client);

      expect(client.disconnect).toHaveBeenCalledWith(true);
      expect((gateway as any).connectedClients.has('c1')).toBe(false);
    });
  });

  describe('handleKDSUpdate', () => {
    it('should broadcast KDS update for valid request', async () => {
      const gateway = buildGateway();
      const client = {
        id: 'c1',
        join: jest.fn(),
      } as any;
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/kds',
        acknowledgedMessages: new Map(),
      });
      (gateway as any).server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;

      const result = await (gateway as any).handleKDSUpdate(
        { orderId: 'ord-1', status: 'preparing', branchId: 'branch-1' },
        client
      );

      expect(result.status).toBe('ok');
      expect((gateway as any).server.to).toHaveBeenCalledWith('kds:branch-1');
    });

    it('should reject invalid KDS update', async () => {
      const gateway = buildGateway();
      const result = await (gateway as any).handleKDSUpdate(
        { orderId: 'ord-1', status: 'preparing' },
        { id: 'c1' } as any
      );
      expect(result.error).toBe('Invalid KDS update');
    });
  });

  describe('handleDriverEvent', () => {
    it('should broadcast driver event for valid request', async () => {
      const gateway = buildGateway();
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/driver',
        acknowledgedMessages: new Map(),
      });
      (gateway as any).server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;

      const result = await (gateway as any).handleDriverEvent(
        { driverId: 'driver-1', event: 'accepted' } as any,
        { id: 'c1' } as any
      );

      expect(result.status).toBe('ok');
      expect((gateway as any).server.to).toHaveBeenCalledWith('driver:driver-1');
    });

    it('should reject invalid driver event', async () => {
      const gateway = buildGateway();
      const result = await (gateway as any).handleDriverEvent(
        { event: 'accepted' } as any,
        { id: 'c1' } as any
      );
      expect(result.error).toBe('Invalid driver event');
    });
  });

  describe('publishToRoom', () => {
    it('should publish to valid room', async () => {
      const gateway = buildGateway();
      (gateway as any).server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;

      const result = await (gateway as any).publishToRoom('room-1', { hello: true });

      expect(result.status).toBe('sent');
      expect((gateway as any).server.to).toHaveBeenCalledWith('room-1');
    });

    it('should reject invalid room', async () => {
      const gateway = buildGateway();
      const result = await (gateway as any).publishToRoom('../etc/passwd', { hello: true });
      expect(result.error).toBe('Invalid room');
    });
  });

  describe('checkOfflineTimeout', () => {
    it('should not throw when checking offline timeout', () => {
      const gateway = buildGateway();
      expect(() => (gateway as any).checkOfflineTimeout('driver-1')).not.toThrow();
    });
  });

  describe('handleLocationUpdate', () => {
    it('should broadcast location update and check offline timeout', async () => {
      const gateway = buildGateway();
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/tracking',
        acknowledgedMessages: new Map(),
      });
      (gateway as any).server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;
      (gateway as any).checkOfflineTimeout = jest.fn();

      const result = await (gateway as any).handleLocationUpdate(
        { driverId: 'driver-1', lat: 30.7, lng: 76.8, speed: 40 },
        { id: 'c1' } as any
      );

      expect(result.status).toBe('ok');
      expect(result.messageId).toBeDefined();
      expect((gateway as any).server.to).toHaveBeenCalledWith('tracking:driver-1');
      expect((gateway as any).checkOfflineTimeout).toHaveBeenCalledWith('driver-1');
    });

    it('should reject invalid location data', async () => {
      const gateway = buildGateway();
      const result = await (gateway as any).handleLocationUpdate(
        { driverId: 'driver-1', lat: 'invalid', lng: 76.8 },
        { id: 'c1' } as any
      );
      expect(result.error).toBe('Invalid location data');
    });
  });

  describe('publish', () => {
    it('should emit message to default topic', async () => {
      const gateway = buildGateway();
      (gateway as any).server = {
        emit: jest.fn(),
      } as any;

      const result = await (gateway as any).publish('notifications', { message: 'hello' });

      expect(result.status).toBe('sent');
      expect(result.messageId).toBeDefined();
      expect((gateway as any).server.emit).toHaveBeenCalled();
    });
  });

  describe('handleMessage', () => {
    it('should reject when client not connected', async () => {
      const gateway = buildGateway();

      const result = await (gateway as any).handleMessage(
        { id: 'msg-1', event: 'test' } as any,
        { id: 'unknown' } as any
      );

      expect(result.error).toBe('Not connected');
    });

    it('should store message and return received when no ack required', async () => {
      const gateway = buildGateway();
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/tracking',
        acknowledgedMessages: new Map(),
      });

      const result = await (gateway as any).handleMessage(
        { id: 'msg-1', event: 'test', ack: false } as any,
        { id: 'c1' } as any
      );

      expect(result.status).toBe('received');
      const conn = (gateway as any).connectedClients.get('c1');
      expect(conn.acknowledgedMessages.has('msg-1')).toBe(true);
    });

    it('should timeout acknowledgement when not resolved in time', async () => {
      const gateway = buildGateway(1);
      (gateway as any).connectedClients.set('c1', {
        id: 'c1',
        namespace: '/tracking',
        acknowledgedMessages: new Map(),
      });

      const result = await (gateway as any).handleMessage(
        { id: 'msg-timeout', event: 'test', ack: true } as any,
        { id: 'c1' } as any
      );

      expect(result.status).toBe('timeout');
    });
  });
});
