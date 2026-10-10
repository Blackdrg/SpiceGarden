"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = __importDefault(require("ioredis"));
const common_1 = require("@nestjs/common");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    configService;
    logger = new common_1.Logger(RedisIoAdapter.name);
    adapterConstructor = null;
    pubClient = null;
    subClient = null;
    constructor(appOrHttpServer, configService) {
        super(appOrHttpServer);
        this.configService = configService;
    }
    async connectToRedis() {
        const redisUrl = this.configService?.get('REDIS_URL') ||
            process.env.REDIS_URL ||
            `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
        if (process.env.DISABLE_REDIS_ADAPTER === 'true' || process.env.LOCAL_DB === 'sqlite') {
            this.logger.log('Redis WebSocket adapter skipped (local/disabled mode)');
            return;
        }
        try {
            this.pubClient = new ioredis_1.default(redisUrl, {
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => Math.min(times * 100, 2000),
                lazyConnect: true,
            });
            this.subClient = this.pubClient.duplicate();
            await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
            this.adapterConstructor = (0, redis_adapter_1.createAdapter)(this.pubClient, this.subClient);
            this.logger.log(`Redis WebSocket adapter connected successfully to ${redisUrl}`);
        }
        catch (err) {
            this.logger.warn(`Failed to initialize Redis WebSocket adapter, falling back to default in-memory adapter: ${err?.message || String(err)}`);
            this.pubClient = null;
            this.subClient = null;
            this.adapterConstructor = null;
        }
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
        }
        return server;
    }
    async close() {
        if (this.pubClient) {
            await this.pubClient.quit().catch(() => undefined);
        }
        if (this.subClient) {
            await this.subClient.quit().catch(() => undefined);
        }
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
