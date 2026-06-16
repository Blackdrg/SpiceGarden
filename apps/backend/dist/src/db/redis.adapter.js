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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisAdapter = class RedisAdapter {
    configService;
    client = null;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        await this.connect();
    }
    async connect() {
        const host = this.configService.get('REDIS_HOST') || 'localhost';
        const port = this.configService.get('REDIS_PORT') || 6379;
        const password = this.configService.get('REDIS_PASSWORD') || undefined;
        try {
            this.client = new ioredis_1.default({
                host,
                port,
                password: password || undefined,
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => Math.min(times * 100, 2000),
            });
            this.client.on('connect', () => {
                console.log(`Redis connected successfully at ${host}:${port}`);
            });
            this.client.on('error', (err) => {
                console.error('Redis connection error:', err);
            });
            await this.client.ping();
            console.log('Redis ping successful');
        }
        catch (e) {
            console.warn('ioredis not installed or Redis unavailable, using fallback mode');
            this.client = null;
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
    }
    async get(key) {
        if (!this.client)
            return null;
        try {
            return await this.client.get(key);
        }
        catch (e) {
            console.error('Redis GET error:', e);
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.client)
            return;
        try {
            if (ttl) {
                await this.client.setex(key, ttl, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (e) {
            console.error('Redis SET error:', e);
        }
    }
    async del(key) {
        if (!this.client)
            return;
        try {
            await this.client.del(key);
        }
        catch (e) {
            console.error('Redis DEL error:', e);
        }
    }
    async exists(key) {
        if (!this.client)
            return false;
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (e) {
            return false;
        }
    }
    async incr(key) {
        if (!this.client)
            return 0;
        try {
            return await this.client.incr(key);
        }
        catch (e) {
            return 0;
        }
    }
};
exports.RedisAdapter = RedisAdapter;
exports.RedisAdapter = RedisAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisAdapter);
