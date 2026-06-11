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
exports.NotificationQueueController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let NotificationQueueController = (() => {
    let _classDecorators = [(0, common_1.Controller)('notification-queue')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _queueNotification_decorators;
    let _getNotificationById_decorators;
    let _getNotificationsByStatus_decorators;
    let _getNotificationsForRecipient_decorators;
    let _cancelNotification_decorators;
    let _getNotificationStats_decorators;
    let _processNotificationQueue_decorators;
    var NotificationQueueController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _queueNotification_decorators = [(0, common_1.Post)('queue'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Queue a notification for reliable delivery' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification queued successfully' }), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            recipientId: { type: 'string' },
                            recipientType: { type: 'string', enum: ['user', 'device', 'email', 'phone'] },
                            notificationType: { type: 'string', enum: ['push', 'sms', 'email', 'apns'] },
                            payload: { type: 'object' },
                            provider: { type: 'string', enum: ['fcm', 'twilio', 'sendgrid', 'apns'] },
                            maxAttempts: { type: 'number' },
                            callbackUrl: { type: 'string' },
                            metadata: { type: 'object' }
                        },
                        required: ['recipientId', 'recipientType', 'notificationType', 'payload', 'provider']
                    }
                })];
            _getNotificationById_decorators = [(0, common_1.Get)(':id'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get notification by ID' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification retrieved successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }), (0, swagger_1.ApiParam)({ name: 'id', type: 'string' })];
            _getNotificationsByStatus_decorators = [(0, common_1.Get)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get notifications by status' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }), (0, swagger_1.ApiQuery)({ name: 'status', type: 'string', required: false })];
            _getNotificationsForRecipient_decorators = [(0, common_1.Get)('recipient/:recipientId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get notifications for a recipient' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }), (0, swagger_1.ApiParam)({ name: 'recipientId', type: 'string' }), (0, swagger_1.ApiQuery)({ name: 'recipientType', type: 'string', required: true })];
            _cancelNotification_decorators = [(0, common_1.Post)(':id/cancel'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Cancel a notification' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification cancelled successfully' }), (0, swagger_1.ApiParam)({ name: 'id', type: 'string' })];
            _getNotificationStats_decorators = [(0, common_1.Get)('stats/overview'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get notification statistics' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification statistics retrieved successfully' })];
            _processNotificationQueue_decorators = [(0, common_1.Post)('process'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Process the notification queue' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification queue processed successfully' })];
            __esDecorate(this, null, _queueNotification_decorators, { kind: "method", name: "queueNotification", static: false, private: false, access: { has: obj => "queueNotification" in obj, get: obj => obj.queueNotification }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getNotificationById_decorators, { kind: "method", name: "getNotificationById", static: false, private: false, access: { has: obj => "getNotificationById" in obj, get: obj => obj.getNotificationById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getNotificationsByStatus_decorators, { kind: "method", name: "getNotificationsByStatus", static: false, private: false, access: { has: obj => "getNotificationsByStatus" in obj, get: obj => obj.getNotificationsByStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getNotificationsForRecipient_decorators, { kind: "method", name: "getNotificationsForRecipient", static: false, private: false, access: { has: obj => "getNotificationsForRecipient" in obj, get: obj => obj.getNotificationsForRecipient }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _cancelNotification_decorators, { kind: "method", name: "cancelNotification", static: false, private: false, access: { has: obj => "cancelNotification" in obj, get: obj => obj.cancelNotification }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getNotificationStats_decorators, { kind: "method", name: "getNotificationStats", static: false, private: false, access: { has: obj => "getNotificationStats" in obj, get: obj => obj.getNotificationStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processNotificationQueue_decorators, { kind: "method", name: "processNotificationQueue", static: false, private: false, access: { has: obj => "processNotificationQueue" in obj, get: obj => obj.processNotificationQueue }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            NotificationQueueController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        notificationQueueService = __runInitializers(this, _instanceExtraInitializers);
        constructor(notificationQueueService) {
            this.notificationQueueService = notificationQueueService;
        }
        async queueNotification(body) {
            return await this.notificationQueueService.queueNotification(body.recipientId, body.recipientType, body.notificationType, body.payload, body.provider, {
                maxAttempts: body.maxAttempts,
                callbackUrl: body.callbackUrl,
                metadata: body.metadata
            });
        }
        async getNotificationById(id) {
            return await this.notificationQueueService.getNotificationById(id);
        }
        async getNotificationsByStatus(status) {
            if (status) {
                return await this.notificationQueueService.getNotificationsByStatus(status);
            }
            // Return all notifications if no status specified
            return await this.notificationQueueService.getNotificationsByStatus(null);
        }
        async getNotificationsForRecipient(recipientId, recipientType) {
            return await this.notificationQueueService.getNotificationsForRecipient(recipientId, recipientType);
        }
        async cancelNotification(id) {
            await this.notificationQueueService.cancelNotification(id);
            return { success: true };
        }
        async getNotificationStats() {
            return await this.notificationQueueService.getNotificationStats();
        }
        async processNotificationQueue() {
            await this.notificationQueueService.processNotificationQueue();
            return { success: true };
        }
    };
    return NotificationQueueController = _classThis;
})();
exports.NotificationQueueController = NotificationQueueController;
