"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueueService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const notification_status_enum_1 = require("../../../db/entities/notification-status.enum");
let NotificationQueueService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationQueueService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationQueueService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        notificationRepo;
        configService;
        notificationService;
        queueService;
        logger = new common_1.Logger(NotificationQueueService.name);
        constructor(notificationRepo, configService, notificationService, queueService) {
            this.notificationRepo = notificationRepo;
            this.configService = configService;
            this.notificationService = notificationService;
            this.queueService = queueService;
        }
        /**
         * Queue a notification for reliable delivery
         */
        async queueNotification(recipientId, recipientType, notificationType, payload, provider, options = {}) {
            const notification = this.notificationRepo.create({
                recipientId,
                recipientType,
                notificationType,
                payload,
                provider,
                status: notification_status_enum_1.NotificationStatus.PENDING,
                maxAttempts: options.maxAttempts || 3,
                callbackUrl: options.callbackUrl,
                metadata: options.metadata || {},
            });
            const savedNotification = await this.notificationRepo.save(notification);
            // Process the queue
            await this.processNotificationQueue();
            return savedNotification;
        }
        /**
         * Process the notification queue
         */
        async processNotificationQueue() {
            // Get pending notifications that are ready to be processed
            const notifications = await this.notificationRepo.find({
                where: [
                    { status: notification_status_enum_1.NotificationStatus.PENDING },
                    { status: notification_status_enum_1.NotificationStatus.RETRYING, nextAttemptAt: (0, typeorm_1.LessThanOrEqual)(new Date()) }
                ],
                order: { createdAt: 'ASC' },
                take: 10 // Process in batches
            });
            for (const notification of notifications) {
                try {
                    await this.processNotification(notification);
                }
                catch (error) {
                    this.logger.error(`Failed to process notification ${notification.id}:`, error);
                }
            }
        }
        /**
         * Process a single notification
         */
        async processNotification(notification) {
            // Mark as processing
            notification.status = notification_status_enum_1.NotificationStatus.PROCESSING;
            notification.lastAttemptAt = new Date();
            notification.attemptCount += 1;
            await this.notificationRepo.save(notification);
            try {
                let result;
                // Send notification based on type and provider
                switch (notification.notificationType) {
                    case 'push':
                        if (notification.provider === 'fcm') {
                            result = await this.notificationService.sendPush(notification.recipientId, notification.payload.title, notification.payload.body, notification.payload.data);
                        }
                        else if (notification.provider === 'apns') {
                            result = await this.notificationService.sendAPNs(notification.recipientId, notification.payload.title, notification.payload.body, notification.payload.data);
                        }
                        break;
                    case 'sms':
                        if (notification.provider === 'twilio') {
                            result = await this.notificationService.sendSMS(notification.recipientId, notification.payload.body);
                        }
                        break;
                    case 'email':
                        if (notification.provider === 'sendgrid') {
                            result = await this.notificationService.sendEmail(notification.recipientId, notification.payload.subject, notification.payload.template, notification.payload.context);
                        }
                        break;
                }
                // Check if successful
                if (result?.success) {
                    notification.status = notification_status_enum_1.NotificationStatus.SENT;
                    notification.completedAt = new Date();
                    // Call callback URL if provided
                    if (notification.callbackUrl) {
                        await this.queueService.enqueue('NOTIFICATION_CALLBACK', {
                            notificationId: notification.id,
                            status: 'sent',
                            url: notification.callbackUrl,
                            data: { result }
                        });
                    }
                }
                else {
                    throw new Error(result?.error || 'Unknown error');
                }
            }
            catch (error) {
                notification.errorInfo = {
                    message: error?.message || 'Unknown error',
                    code: error?.code || 'UNKNOWN_ERROR',
                    providerResponse: error?.response || null
                };
                // Check if we should retry
                if (notification.attemptCount < (notification.maxAttempts || 3)) {
                    notification.status = notification_status_enum_1.NotificationStatus.RETRYING;
                    // Exponential backoff: 1 minute, 2 minutes, 4 minutes, etc.
                    const delayMinutes = Math.pow(2, notification.attemptCount - 1);
                    notification.nextAttemptAt = new Date(Date.now() + (delayMinutes * 60 * 1000));
                }
                else {
                    notification.status = notification_status_enum_1.NotificationStatus.FAILED;
                    notification.completedAt = new Date();
                    // Call callback URL if provided for failed notifications
                    if (notification.callbackUrl) {
                        await this.queueService.enqueue('NOTIFICATION_CALLBACK', {
                            notificationId: notification.id,
                            status: 'failed',
                            url: notification.callbackUrl,
                            data: { error: notification.errorInfo }
                        });
                    }
                }
            }
            finally {
                await this.notificationRepo.save(notification);
            }
        }
        /**
         * Get notification by ID
         */
        async getNotificationById(id) {
            const notification = await this.notificationRepo.findOne({ where: { id } });
            if (!notification) {
                throw new common_1.NotFoundException(`Notification ${id} not found`);
            }
            return notification;
        }
        /**
         * Get notifications by status
         */
        async getNotificationsByStatus(status) {
            return await this.notificationRepo.find({
                where: { status },
                order: { createdAt: 'DESC' }
            });
        }
        /**
         * Get notifications for a recipient
         */
        async getNotificationsForRecipient(recipientId, recipientType) {
            return await this.notificationRepo.find({
                where: { recipientId, recipientType },
                order: { createdAt: 'DESC' }
            });
        }
        /**
         * Cancel a notification
         */
        async cancelNotification(id) {
            const notification = await this.notificationRepo.findOne({ where: { id } });
            if (!notification) {
                throw new common_1.NotFoundException(`Notification ${id} not found`);
            }
            notification.status = notification_status_enum_1.NotificationStatus.CANCELLED;
            notification.completedAt = new Date();
            await this.notificationRepo.save(notification);
        }
        /**
         * Get notification statistics
         */
        async getNotificationStats() {
            const [pending, processing, sent, failed, retrying, cancelled] = await Promise.all([
                this.notificationRepo.count({ where: { status: notification_status_enum_1.NotificationStatus.PENDING } }),
                this.notificationRepo.count({ where: { status: notification_status_enum_1.NotificationStatus.PROCESSING } }),
                this.notificationRepo.count({ where: { status: notification_status_enum_1.NotificationStatus.SENT } }),
                this.notificationRepo.count({ where: { status: notification_status_enum_1.NotificationStatus.FAILED } }),
                this.notificationRepo.count({ where: { status: notification_status_enum_1.NotificationStatus.RETRYING } }),
                this.notificationRepo.count({ where: { status: notification_status_enum_1.NotificationStatus.CANCELLED } }),
            ]);
            const total = pending + processing + sent + failed + retrying + cancelled;
            return {
                total,
                pending,
                processing,
                sent,
                failed,
                retrying,
                cancelled,
                successRate: total > 0 ? (sent / total) * 100 : 0,
                failureRate: total > 0 ? (failed / total) * 100 : 0
            };
        }
    };
    return NotificationQueueService = _classThis;
})();
exports.NotificationQueueService = NotificationQueueService;
