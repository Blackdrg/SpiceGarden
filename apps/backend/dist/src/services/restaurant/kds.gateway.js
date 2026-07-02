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
var KdsGateway_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KdsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const cors_origin_1 = require("../../security/cors-origin");
const MAX_HTTP_BUFFER_SIZE = Number(process.env.WS_MAX_HTTP_BUFFER_SIZE || 1024);
const WS_RATE_LIMIT_MAX = Number(process.env.WS_RATE_LIMIT_MAX || 10);
const WS_RATE_LIMIT_WINDOW_MS = Number(process.env.WS_RATE_LIMIT_WINDOW_MS || 60000);
const BRANCH_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
let KdsGateway = KdsGateway_1 = class KdsGateway {
    logger = new common_1.Logger(KdsGateway_1.name);
    connectionAttempts = new Map();
    server;
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
        const branchId = client.handshake.query.branchId;
        if (typeof branchId === 'string' && BRANCH_ID_PATTERN.test(branchId)) {
            client.join(`branch:${branchId}`);
            this.logger.log(`Kitchen staff joined branch: ${branchId}`);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Kitchen staff disconnected: ${client.id}`);
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
            this.logger.warn(`Rejected KDS websocket connection from ${key}: rate limit exceeded`);
            return false;
        }
        current.count += 1;
        this.connectionAttempts.set(key, current);
        return true;
    }
    notifyNewOrder(branchId, order) {
        if (!BRANCH_ID_PATTERN.test(branchId)) {
            this.logger.warn(`Rejected KDS notification for invalid branch: ${branchId}`);
            return;
        }
        this.server.to(`branch:${branchId}`).emit('newOrder', order);
    }
    handleStatusUpdate(data) {
        if (typeof data.orderId !== 'string' ||
            typeof data.status !== 'string' ||
            typeof data.branchId !== 'string' ||
            !BRANCH_ID_PATTERN.test(data.branchId)) {
            return { error: 'Invalid prep status update' };
        }
        this.logger.log(`Order ${data.orderId} status updated to ${data.status} by kitchen`);
        this.server.to(`branch:${data.branchId}`).emit('orderStatusUpdated', data);
    }
};
exports.KdsGateway = KdsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], KdsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('updatePrepStatus'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KdsGateway.prototype, "handleStatusUpdate", null);
exports.KdsGateway = KdsGateway = KdsGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: 'kds',
        maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE,
        allowEIO3: false,
        cors: { origin: cors_origin_1.isAllowedOrigin, credentials: true },
    })
], KdsGateway);
