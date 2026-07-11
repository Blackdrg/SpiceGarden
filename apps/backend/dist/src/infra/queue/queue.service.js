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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
const queues_1 = require("../../shared/contracts/queues");
const order_processor_1 = require("./order.processor");
let QueueService = QueueService_1 = class QueueService {
    configService;
    orderProcessor;
    orderRepo;
    logger = new common_1.Logger(QueueService_1.name);
    connection = null;
    queues = new Map();
    workers = new Map();
    redisAvailable = false;
    constructor(configService, orderProcessor, orderRepo) {
        this.configService = configService;
        this.orderProcessor = orderProcessor;
        this.orderRepo = orderRepo;
        try {
            const redisUrl = this.configService.get('REDIS_URL') || 'redis://localhost:6379';
            this.connection = new ioredis_1.default(redisUrl, {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
            });
            this.registerWorker(queues_1.QUEUE_NAMES.ORDER_LIFECYCLE, async (job) => this.orderProcessor.processOrderLifecycle(job.data, job));
            this.redisAvailable = true;
        }
        catch (error) {
            this.logger.warn('Redis unavailable. Queue operations will fail until Redis is reachable.');
        }
    }
    async enqueue(queueName, data, options = {}) {
        const queue = this.getQueue(queueName);
        const jobOptions = {
            attempts: options.attempts ?? 3,
            backoff: {
                type: 'exponential',
                delay: options.backoffDelay ?? 1000,
            },
            removeOnComplete: { age: 86400, count: 1000 },
            removeOnFail: { age: 86400, count: 1000 },
        };
        if (options.delay !== undefined) {
            jobOptions.delay = options.delay;
        }
        if (options.priority !== undefined) {
            jobOptions.priority = options.priority;
        }
        if (options.jobId) {
            jobOptions.jobId = options.jobId;
        }
        return queue.add(queueName, data, jobOptions);
    }
    async enqueueOrderLifecycle(data) {
        if (!data.orderId) {
            throw new common_1.BadRequestException('Order lifecycle job requires orderId');
        }
        if (!Object.values(order_interface_1.OrderStatus).includes(data.status)) {
            throw new common_1.BadRequestException('Invalid order status');
        }
        return this.enqueue(queues_1.QUEUE_NAMES.ORDER_LIFECYCLE, data, {
            jobId: `order-lifecycle:${data.orderId}:${data.status}`,
        });
    }
    getQueue(queueName) {
        if (!this.redisAvailable || !this.connection) {
            throw new Error('Queue operations require Redis. Please start Redis and restart the application.');
        }
        const existing = this.queues.get(queueName);
        if (existing) {
            return existing;
        }
        const queue = new bullmq_1.Queue(queueName, { connection: this.connection });
        this.queues.set(queueName, queue);
        return queue;
    }
    async getQueueStats(queueName) {
        const queue = this.getQueue(queueName);
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
        ]);
        return { waiting, active, completed, failed, delayed, paused: 0 };
    }
    async drainQueue(queueName) {
        await this.getQueue(queueName).drain();
    }
    registerWorker(queueName, processor) {
        const worker = new bullmq_1.Worker(queueName, processor, {
            connection: this.connection,
            concurrency: Number(this.configService.get('QUEUE_CONCURRENCY') || 5),
            lockDuration: 60000,
        });
        worker.on('completed', (job) => {
            this.logger.log(`Queue job completed: ${queueName}:${job.id}`);
        });
        worker.on('failed', (job, error) => {
            this.logger.error(`Queue job failed: ${queueName}:${job?.id ?? 'unknown'}`, error.stack);
        });
        this.workers.set(queueName, worker);
    }
    async onModuleDestroy() {
        await Promise.allSettled([...this.workers.values()].map((worker) => worker.close()));
        await Promise.allSettled([...this.queues.values()].map((queue) => queue.close()));
        if (this.connection) {
            await this.connection.quit();
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        order_processor_1.OrderProcessor,
        typeorm_2.Repository])
], QueueService);
