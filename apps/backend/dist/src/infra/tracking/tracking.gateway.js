"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TrackingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingGateway = exports.SocketNamespace = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const notification_entity_1 = require("../../db/entities/notification.entity");
const cors_origin_1 = require("../../security/cors-origin");
const MAX_HTTP_BUFFER_SIZE = Number(process.env.WS_MAX_HTTP_BUFFER_SIZE || 1024);
const WS_RATE_LIMIT_MAX = Number(process.env.WS_RATE_LIMIT_MAX || 10);
const WS_RATE_LIMIT_WINDOW_MS = Number(process.env.WS_RATE_LIMIT_WINDOW_MS || 60000);
const ROOM_PATTERN = /^[a-zA-Z0-9:_-]{1,128}$/;
const DRIVER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const MAX_ACK_MESSAGES_PER_CLIENT = 500;
const MSG_QUEUE_TTL_MS = Number(process.env.WS_MSG_QUEUE_TTL_MS || 60000);
var SocketNamespace;
(function (SocketNamespace) {
    SocketNamespace["TRACKING"] = "/tracking";
    SocketNamespace["KDS"] = "/kds";
    SocketNamespace["ADMIN"] = "/admin";
    SocketNamespace["DRIVER"] = "/driver";
})(SocketNamespace || (exports.SocketNamespace = SocketNamespace = {}));
let TrackingGateway = TrackingGateway_1 = class TrackingGateway {
    configService;
    notificationRepo;
    server;
    logger = new common_1.Logger(TrackingGateway_1.name);
    connectedClients = new Map();
    connectionAttempts = new Map();
    messageQueue = new Map();
    pendingAcks = new Map();
    ackTimeoutMs;
    constructor(configService, notificationRepo) {
        this.configService = configService;
        this.notificationRepo = notificationRepo;
        this.ackTimeoutMs = this.configService.get('WS_ACK_TIMEOUT_MS', 5000);
        setInterval(() => this.cleanupStaleConnectionAttempts(), WS_RATE_LIMIT_WINDOW_MS);
        setInterval(() => this.cleanupStaleMessageQueue(), MSG_QUEUE_TTL_MS);
    }
    handleConnection(client) {
        if (!this.isConnectionAllowed(client)) {
            client.disconnect(true);
            return;
        }
        const origin = client.handshake.headers.origin;
        if (typeof origin === 'string' && !(0, cors_origin_1.isAllowedOrigin)(origin)) {
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
    handleDisconnect(client) {
        this.cleanupPendingAcks(client.id);
        this.connectedClients.delete(client.id);
        this.logger.log(`Client ${client.id} disconnected`);
    }
    isConnectionAllowed(client) {
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
    handlePing(client) {
        const conn = this.connectedClients.get(client.id);
        if (conn) {
            conn.lastPing = new Date();
        }
        return { status: 'pong', serverTime: Date.now() };
    }
    handleJoin(data, client) {
        if (typeof data.room !== 'string' || !ROOM_PATTERN.test(data.room)) {
            return { error: 'Invalid room' };
        }
        client.join(data.room);
        this.logger.log(`Client ${client.id} joined room ${data.room}`);
        return { status: 'joined', room: data.room };
    }
    handleAcknowledgement(data, client) {
        const conn = this.connectedClients.get(client.id);
        if (conn && conn.acknowledgedMessages.has(data.messageId)) {
            conn.acknowledgedMessages.get(data.messageId).ack = true;
            const pending = this.pendingAcks.get(data.messageId);
            if (pending) {
                clearTimeout(pending.timeout);
                pending.resolve({ status: 'acknowledged' });
                this.pendingAcks.delete(data.messageId);
            }
        }
        return { status: 'ack_received' };
    }
    async handleMessage(data, client) {
        const conn = this.connectedClients.get(client.id);
        if (!conn)
            return { error: 'Not connected' };
        data.timestamp = new Date();
        const conn = this.connectedClients.get(client.id);
        if (conn) {
            if (conn.acknowledgedMessages.size >= MAX_ACK_MESSAGES_PER_CLIENT) {
                const oldestKey = conn.acknowledgedMessages.keys().next().value;
                if (oldestKey) {
                    conn.acknowledgedMessages.delete(oldestKey);
                }
            }
            conn.acknowledgedMessages.set(data.id, data);
        }
        if (data.ack) {
            const ackResult = await new Promise((resolve, reject) => {
                this.pendingAcks.set(data.id, {
                    resolve,
                    reject,
                    timeout: setTimeout(() => {
                        this.pendingAcks.delete(data.id);
                        resolve({ status: 'timeout', message: 'Acknowledgement timeout' });
                    }, this.ackTimeoutMs),
                });
            });
            return ackResult;
        }
        return { status: 'received' };
    }
    async handleLocationUpdate(data, client) {
        if (typeof data.driverId !== 'string' || !DRIVER_ID_PATTERN.test(data.driverId) || !this.isValidLocation(data)) {
            return { error: 'Invalid location data' };
        }
        const messageId = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const topic = `tracking:${data.driverId}`;
        this.server.to(topic).emit('locationUpdate', {
            ...data,
            timestamp: new Date().toISOString(),
            messageId,
        });
        this.checkOfflineTimeout(data.driverId);
        return { status: 'ok', messageId };
    }
    async handleKDSUpdate(data) {
        if (typeof data.orderId !== 'string' || typeof data.status !== 'string' || typeof data.branchId !== 'string' || !ROOM_PATTERN.test(data.branchId)) {
            return { error: 'Invalid KDS update' };
        }
        const messageId = `kds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const topic = `kds:${data.branchId}`;
        this.server.to(topic).emit('kdsUpdate', {
            ...data,
            timestamp: data.timestamp || new Date(),
            messageId,
        });
        return { status: 'ok', messageId };
    }
    async handleDriverEvent(data) {
        if (typeof data.driverId !== 'string' || !DRIVER_ID_PATTERN.test(data.driverId) || typeof data.event !== 'string') {
            return { error: 'Invalid driver event' };
        }
        const messageId = `drv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const topic = `driver:${data.driverId}`;
        this.server.to(topic).emit('driverEvent', {
            ...data,
            timestamp: new Date().toISOString(),
            messageId,
        });
        return { status: 'ok', messageId };
    }
    async publish(topic, data, requireAck = false) {
        const messageId = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (requireAck) {
            return this.waitForAcknowledgement(`${topic}`, { ...data, messageId });
        }
        this.server.emit(topic, { ...data, messageId });
        return { status: 'sent', messageId };
    }
    async publishToRoom(room, data, requireAck = false) {
        if (typeof room !== 'string' || !ROOM_PATTERN.test(room)) {
            return { error: 'Invalid room' };
        }
        const messageId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (requireAck) {
            return this.waitForAcknowledgement(`room:${room}`, { ...data, messageId });
        }
        this.server.to(room).emit(room, { ...data, messageId });
        return { status: 'sent', messageId };
    }
    getActiveConnections() {
        return this.server.engine.clientsCount;
    }
    getNamespaceStats() {
        const stats = {};
        this.connectedClients.forEach((client) => {
            const ns = client.namespace || 'any';
            stats[ns] = (stats[ns] || 0) + 1;
        });
        return stats;
    }
    isValidLocation(data) {
        return (typeof data.driverId === 'string' &&
            typeof data.lat === 'number' &&
            typeof data.lng === 'number' &&
            data.lat >= -90 &&
            data.lat <= 90 &&
            data.lng >= -180 &&
            data.lng <= 180);
    }
    checkOfflineTimeout(driverId) {
        const timeout = 30000;
    }
    async waitForAcknowledgement(roomOrTopic, data) {
        const messageId = data.messageId;
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingAcks.delete(messageId);
                resolve({ status: 'timeout', messageId });
            }, this.ackTimeoutMs);
            this.pendingAcks.set(messageId, { resolve, reject, timeout });
            this.server.to(roomOrTopic).emit('message', data);
        });
    }
    cleanupPendingAcks(clientId) {
        const conn = this.connectedClients.get(clientId);
        if (!conn)
            return;
        for (const [messageId, message] of conn.acknowledgedMessages.entries()) {
            if (!message.ack) {
                conn.acknowledgedMessages.delete(messageId);
            }
        }
    }
    cleanupStaleConnectionAttempts() {
        const now = Date.now();
        for (const [key, entry] of this.connectionAttempts.entries()) {
            if (now >= entry.resetAt) {
                this.connectionAttempts.delete(key);
            }
        }
    }
    cleanupStaleMessageQueue() {
        const now = Date.now();
        for (const [driverId, queue] of this.messageQueue.entries()) {
            const filtered = queue.filter((msg) => now - msg.timestamp.getTime() < MSG_QUEUE_TTL_MS);
            if (filtered.length === 0) {
                this.messageQueue.delete(driverId);
            }
            else {
                this.messageQueue.set(driverId, filtered);
            }
        }
    }
    async getQueuedMessages(driverId) {
        return this.messageQueue.get(driverId) || [];
    }
    async requeueUndeliveredMessages(driverId, messageIds) {
        const queue = this.messageQueue.get(driverId) || [];
        const conn = this.connectedClients.get(driverId);
        if (conn) {
            const undelivered = Array.from(conn.acknowledgedMessages.values())
                .filter(m => messageIds.includes(m.id) && !m.ack);
            queue.push(...undelivered);
            this.messageQueue.set(driverId, queue);
        }
    }
};
exports.TrackingGateway = TrackingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TrackingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handlePing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ack'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleAcknowledgement", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateLocation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleLocationUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('kdsUpdate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleKDSUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('driverEvent'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackingGateway.prototype, "handleDriverEvent", null);
exports.TrackingGateway = TrackingGateway = TrackingGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: cors_origin_1.isAllowedOrigin,
            credentials: true,
        },
        namespace: '/',
        maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE,
        allowEIO3: false,
        pingInterval: 10000,
        pingTimeout: 20000,
    }),
    __param(1, (0, typeorm_2.InjectRepository)(notification_entity_1.NotificationEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_1.Repository])
], TrackingGateway);
