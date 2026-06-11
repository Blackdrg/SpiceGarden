"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingGateway = exports.SocketNamespace = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
var SocketNamespace;
(function (SocketNamespace) {
    SocketNamespace["TRACKING"] = "/tracking";
    SocketNamespace["KDS"] = "/kds";
    SocketNamespace["ADMIN"] = "/admin";
    SocketNamespace["DRIVER"] = "/driver";
})(SocketNamespace || (exports.SocketNamespace = SocketNamespace = {}));
let TrackingGateway = (() => {
    let _classDecorators = [(0, common_1.Injectable)(), (0, websockets_1.WebSocketGateway)({
            cors: {
                origin: '*',
            },
            namespace: '/',
            pingInterval: 10000,
            pingTimeout: 20000,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _server_decorators;
    let _server_initializers = [];
    let _server_extraInitializers = [];
    let _handlePing_decorators;
    let _handleJoin_decorators;
    let _handleAcknowledgement_decorators;
    let _handleMessage_decorators;
    let _handleLocationUpdate_decorators;
    let _handleKDSUpdate_decorators;
    let _handleDriverEvent_decorators;
    var TrackingGateway = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _server_decorators = [(0, websockets_1.WebSocketServer)()];
            _handlePing_decorators = [(0, websockets_1.SubscribeMessage)('ping')];
            _handleJoin_decorators = [(0, websockets_1.SubscribeMessage)('join')];
            _handleAcknowledgement_decorators = [(0, websockets_1.SubscribeMessage)('ack')];
            _handleMessage_decorators = [(0, websockets_1.SubscribeMessage)('message')];
            _handleLocationUpdate_decorators = [(0, websockets_1.SubscribeMessage)('updateLocation')];
            _handleKDSUpdate_decorators = [(0, websockets_1.SubscribeMessage)('kdsUpdate')];
            _handleDriverEvent_decorators = [(0, websockets_1.SubscribeMessage)('driverEvent')];
            __esDecorate(this, null, _handlePing_decorators, { kind: "method", name: "handlePing", static: false, private: false, access: { has: obj => "handlePing" in obj, get: obj => obj.handlePing }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleJoin_decorators, { kind: "method", name: "handleJoin", static: false, private: false, access: { has: obj => "handleJoin" in obj, get: obj => obj.handleJoin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleAcknowledgement_decorators, { kind: "method", name: "handleAcknowledgement", static: false, private: false, access: { has: obj => "handleAcknowledgement" in obj, get: obj => obj.handleAcknowledgement }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleMessage_decorators, { kind: "method", name: "handleMessage", static: false, private: false, access: { has: obj => "handleMessage" in obj, get: obj => obj.handleMessage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleLocationUpdate_decorators, { kind: "method", name: "handleLocationUpdate", static: false, private: false, access: { has: obj => "handleLocationUpdate" in obj, get: obj => obj.handleLocationUpdate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleKDSUpdate_decorators, { kind: "method", name: "handleKDSUpdate", static: false, private: false, access: { has: obj => "handleKDSUpdate" in obj, get: obj => obj.handleKDSUpdate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _handleDriverEvent_decorators, { kind: "method", name: "handleDriverEvent", static: false, private: false, access: { has: obj => "handleDriverEvent" in obj, get: obj => obj.handleDriverEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: obj => "server" in obj, get: obj => obj.server, set: (obj, value) => { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TrackingGateway = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService = __runInitializers(this, _instanceExtraInitializers);
        notificationRepo;
        server = __runInitializers(this, _server_initializers, void 0);
        logger = (__runInitializers(this, _server_extraInitializers), new common_1.Logger(TrackingGateway.name));
        connectedClients = new Map();
        messageQueue = new Map();
        pendingAcks = new Map();
        ackTimeoutMs;
        constructor(configService, notificationRepo) {
            this.configService = configService;
            this.notificationRepo = notificationRepo;
            this.ackTimeoutMs = this.configService.get('WS_ACK_TIMEOUT_MS', 5000);
        }
        handleConnection(client) {
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
        handlePing(client) {
            const conn = this.connectedClients.get(client.id);
            if (conn) {
                conn.lastPing = new Date();
            }
            return { status: 'pong', serverTime: Date.now() };
        }
        handleJoin(data, client) {
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
            conn.acknowledgedMessages.set(data.id, data);
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
            if (!this.isValidLocation(data)) {
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
                const ns = client.namespace || 'unknown';
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
            for (const [messageId, pending] of this.pendingAcks.entries()) {
                clearTimeout(pending.timeout);
                pending.reject(new Error('Client disconnected'));
            }
            this.pendingAcks.clear();
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
    return TrackingGateway = _classThis;
})();
exports.TrackingGateway = TrackingGateway;
