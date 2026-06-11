"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const order_service_1 = require("../src/services/order/order.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../src/db/entities/order.entity");
const driver_assignment_entity_1 = require("../src/db/entities/driver-assignment.entity");
const payments_service_1 = require("../src/services/payments/payments.service");
const notification_service_1 = require("../src/services/notifications/notification.service");
const retry_service_1 = require("../src/services/payments/retry.service");
const idempotency_service_1 = require("../src/services/payments/idempotency.service");
const production_notification_service_1 = require("../src/services/notifications/production-notification.service");
const logging_service_1 = require("../src/logging/logging.service");
const notification_preferences_service_1 = require("../src/services/notifications/notification-preferences.service");
const order_interface_1 = require("../src/shared/domain/order.interface");
const common_1 = require("@nestjs/common");
describe('OrderService Edge Cases', () => {
    let service;
    const mockOrderRepo = {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    };
    const mockDriverAssignmentRepo = {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    };
    const mockDataSource = {
        manager: {
            transaction: jest.fn((cb) => cb({
                findOne: jest.fn(),
                update: jest.fn(),
                save: jest.fn(),
                increment: jest.fn(),
                create: jest.fn(),
            })),
        },
    };
    const mockPaymentService = {
        confirmPayment: jest.fn(),
        refundPayment: jest.fn(),
    };
    const mockNotificationService = {
        sendPush: jest.fn(),
    };
    const mockServices = {
        retryService: { run: jest.fn() },
        idempotency: { validateOrCreate: jest.fn(), complete: jest.fn() },
        productionNotification: { send: jest.fn() },
        loggingService: { secureError: jest.fn() },
        prefsService: { getPrefs: jest.fn() },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                order_service_1.OrderService,
                { provide: (0, typeorm_1.getRepositoryToken)(order_entity_1.OrderEntity), useValue: mockOrderRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(driver_assignment_entity_1.DriverAssignmentEntity), useValue: mockDriverAssignmentRepo },
                { provide: payments_service_1.PaymentService, useValue: mockPaymentService },
                { provide: notification_service_1.NotificationService, useValue: mockNotificationService },
                { provide: retry_service_1.RetryService, useValue: mockServices.retryService },
                { provide: idempotency_service_1.IdempotencyService, useValue: mockServices.idempotency },
                { provide: production_notification_service_1.ProductionNotificationService, useValue: mockServices.productionNotification },
                { provide: logging_service_1.LoggingService, useValue: mockServices.loggingService },
                { provide: notification_preferences_service_1.NotificationPreferencesService, useValue: mockServices.prefsService },
                { provide: typeorm_2.DataSource, useValue: mockDataSource },
            ],
        }).compile();
        service = module.get(order_service_1.OrderService);
        jest.clearAllMocks();
    });
    describe('checkDuplicateOrder', () => {
        it('should return true when duplicate order exists within window', async () => {
            const now = new Date();
            const duplicateOrder = {
                userId: 'user1',
                restaurantId: 'rest1',
                status: order_interface_1.OrderStatus.PLACED,
                createdAt: now,
                itemsHash: 'hash123',
            };
            mockOrderRepo.findOne.mockResolvedValue(duplicateOrder);
            const result = await service.checkDuplicateOrder('user1', 'rest1', 'hash123');
            expect(result).toBe(true);
        });
        it('should return false when no duplicate order exists', async () => {
            mockOrderRepo.findOne.mockResolvedValue(null);
            const result = await service.checkDuplicateOrder('user1', 'rest1', 'hash123');
            expect(result).toBe(false);
        });
        it('should return false when duplicate order is outside time window', async () => {
            const oldDate = new Date(Date.now() - 10 * 60 * 1000);
            const duplicateOrder = {
                userId: 'user1',
                restaurantId: 'rest1',
                status: order_interface_1.OrderStatus.PLACED,
                createdAt: oldDate,
                itemsHash: 'hash123',
            };
            mockOrderRepo.findOne.mockResolvedValue(duplicateOrder);
            const result = await service.checkDuplicateOrder('user1', 'rest1', 'hash123', 5);
            expect(result).toBe(false);
        });
    });
    describe('cancelOrderAtomic', () => {
        it('should cancel order in transaction with locking', async () => {
            const order = { id: 'ord1', userId: 'user1', status: order_interface_1.OrderStatus.DRIVER_ASSIGNED, orderNumber: 'ORD-123' };
            mockDataSource.manager.transaction.mockImplementation(async (cb) => {
                return cb({
                    findOne: jest.fn().mockResolvedValue(order),
                    save: jest.fn().mockResolvedValue({ ...order, status: order_interface_1.OrderStatus.CANCELLED }),
                });
            });
            const result = await service.cancelOrderAtomic('ord1', 'customer', 'Changed mind');
            expect(mockDataSource.manager.transaction).toHaveBeenCalled();
        });
        it('should throw BadRequestException when order already delivered', async () => {
            const order = { id: 'ord1', userId: 'user1', status: order_interface_1.OrderStatus.DELIVERED };
            mockDataSource.manager.transaction.mockImplementation(async (cb) => {
                return cb({
                    findOne: jest.fn().mockResolvedValue(order),
                    save: jest.fn().mockResolvedValue(order),
                });
            });
            await expect(service.cancelOrderAtomic('ord1', 'customer', 'Changed mind')).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('partialRefund', () => {
        it('should process partial refund for valid order', async () => {
            const order = {
                id: 'ord1',
                userId: 'user1',
                status: order_interface_1.OrderStatus.ON_THE_WAY,
                grandTotal: 100,
                paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
            };
            mockOrderRepo.findOne.mockResolvedValue(order);
            mockPaymentService.refundPayment.mockResolvedValue({ id: 'refund1' });
            mockOrderRepo.save.mockResolvedValue({ ...order, refundedAmount: 50 });
            await service.partialRefund('ord1', 50, 'Partial item issue');
            expect(mockPaymentService.refundPayment).toHaveBeenCalledWith('ord1', 50, 'user1', expect.stringContaining('Partial'));
        });
        it('should throw BadRequestException for invalid amount', async () => {
            await expect(service.partialRefund('ord1', -10, 'Test')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw BadRequestException for ineligible status', async () => {
            const order = {
                id: 'ord1',
                userId: 'user1',
                status: order_interface_1.OrderStatus.PLACED,
                grandTotal: 100,
                paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
            };
            mockOrderRepo.findOne.mockResolvedValue(order);
            await expect(service.partialRefund('ord1', 50, 'Test')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw BadRequestException when already fully refunded', async () => {
            const order = {
                id: 'ord1',
                userId: 'user1',
                status: order_interface_1.OrderStatus.ON_THE_WAY,
                grandTotal: 100,
                paymentStatus: order_interface_1.PaymentStatus.REFUNDED,
            };
            mockOrderRepo.findOne.mockResolvedValue(order);
            await expect(service.partialRefund('ord1', 50, 'Test')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw BadRequestException when refund exceeds remaining amount', async () => {
            const order = {
                id: 'ord1',
                userId: 'user1',
                status: order_interface_1.OrderStatus.ON_THE_WAY,
                grandTotal: 100,
                refundedAmount: 90,
                paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
            };
            mockOrderRepo.findOne.mockResolvedValue(order);
            await expect(service.partialRefund('ord1', 50, 'Test')).rejects.toThrow('exceeds remaining refundable');
        });
    });
    describe('handleKitchenDelay', () => {
        it('should send notification for delays over 30 minutes', async () => {
            const order = { id: 'ord1', userId: 'user1', status: order_interface_1.OrderStatus.PREPARING, orderNumber: 'ORD-123' };
            mockOrderRepo.findOne.mockResolvedValue(order);
            await service.handleKitchenDelay('ord1', 45);
            expect(mockNotificationService.sendPush).toHaveBeenCalledWith('user1', 'Kitchen Delay Alert', expect.stringContaining('45 minutes'), expect.objectContaining({ orderId: 'ord1' }));
        });
        it('should not send notification for short delays', async () => {
            const order = { id: 'ord1', userId: 'user1', status: order_interface_1.OrderStatus.PREPARING };
            mockOrderRepo.findOne.mockResolvedValue(order);
            await service.handleKitchenDelay('ord1', 20);
            expect(mockNotificationService.sendPush).not.toHaveBeenCalled();
        });
    });
    describe('reassignOrder', () => {
        it('should reassign order and clear driver', async () => {
            const order = { id: 'ord1', userId: 'user1', status: order_interface_1.OrderStatus.DRIVER_ASSIGNED, driverId: 'driver1', orderNumber: 'ORD-123' };
            mockOrderRepo.findOne.mockResolvedValue(order);
            mockDriverAssignmentRepo.findOne.mockResolvedValue({ id: 'assign1', driverId: 'driver1' });
            mockDriverAssignmentRepo.save.mockResolvedValue({});
            mockOrderRepo.save.mockResolvedValue(order);
            const result = await service.reassignOrder('ord1', 'driver1', 'No show');
            expect(result).toBe(true);
            expect(mockNotificationService.sendPush).toHaveBeenCalled();
        });
        it('should return false when order not found', async () => {
            mockOrderRepo.findOne.mockResolvedValue(null);
            const result = await service.reassignOrder('ord1', 'driver1', 'No show');
            expect(result).toBe(false);
        });
    });
});
//# sourceMappingURL=order-edge-cases.spec.js.map