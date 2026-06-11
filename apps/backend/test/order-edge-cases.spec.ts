import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../src/services/order/order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from '../src/db/entities/order.entity';
import { DriverAssignmentEntity } from '../src/db/entities/driver-assignment.entity';
import { PaymentService } from '../src/services/payments/payments.service';
import { NotificationService } from '../src/services/notifications/notification.service';
import { RetryService } from '../src/services/payments/retry.service';
import { IdempotencyService } from '../src/services/payments/idempotency.service';
import { ProductionNotificationService } from '../src/services/notifications/production-notification.service';
import { LoggingService } from '../src/logging/logging.service';
import { NotificationPreferencesService } from '../src/services/notifications/notification-preferences.service';
import { OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrderService Edge Cases', () => {
  let service: OrderService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: getRepositoryToken(DriverAssignmentEntity), useValue: mockDriverAssignmentRepo },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: RetryService, useValue: mockServices.retryService },
        { provide: IdempotencyService, useValue: mockServices.idempotency },
        { provide: ProductionNotificationService, useValue: mockServices.productionNotification },
        { provide: LoggingService, useValue: mockServices.loggingService },
        { provide: NotificationPreferencesService, useValue: mockServices.prefsService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);

    jest.clearAllMocks();
  });

  describe('checkDuplicateOrder', () => {
    it('should return true when duplicate order exists within window', async () => {
      const now = new Date();
      const duplicateOrder = { 
        userId: 'user1', 
        restaurantId: 'rest1', 
        status: OrderStatus.PLACED,
        createdAt: now,
        itemsHash: 'hash123',
      } as OrderEntity;
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
        status: OrderStatus.PLACED,
        createdAt: oldDate,
        itemsHash: 'hash123',
      } as OrderEntity;
      mockOrderRepo.findOne.mockResolvedValue(duplicateOrder);

      const result = await service.checkDuplicateOrder('user1', 'rest1', 'hash123', 5);
      expect(result).toBe(false);
    });
  });

  describe('cancelOrderAtomic', () => {
    it('should cancel order in transaction with locking', async () => {
      const order = { id: 'ord1', userId: 'user1', status: OrderStatus.DRIVER_ASSIGNED, orderNumber: 'ORD-123' } as OrderEntity;
      
      mockDataSource.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue(order),
          save: jest.fn().mockResolvedValue({ ...order, status: OrderStatus.CANCELLED }),
        });
      });

      const result = await service.cancelOrderAtomic('ord1', 'customer', 'Changed mind');
      expect(mockDataSource.manager.transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when order already delivered', async () => {
      const order = { id: 'ord1', userId: 'user1', status: OrderStatus.DELIVERED } as OrderEntity;
      
      mockDataSource.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue(order),
          save: jest.fn().mockResolvedValue(order),
        });
      });

      await expect(service.cancelOrderAtomic('ord1', 'customer', 'Changed mind')).rejects.toThrow(BadRequestException);
    });
  });

  describe('partialRefund', () => {
    it('should process partial refund for valid order', async () => {
      const order = {
        id: 'ord1',
        userId: 'user1',
        status: OrderStatus.ON_THE_WAY,
        grandTotal: 100,
        paymentStatus: PaymentStatus.COMPLETED,
      } as OrderEntity;

      mockOrderRepo.findOne.mockResolvedValue(order);
      mockPaymentService.refundPayment.mockResolvedValue({ id: 'refund1' });
      mockOrderRepo.save.mockResolvedValue({ ...order, refundedAmount: 50 });

      await service.partialRefund('ord1', 50, 'Partial item issue');
      expect(mockPaymentService.refundPayment).toHaveBeenCalledWith('ord1', 50, 'user1', expect.stringContaining('Partial'));
    });

    it('should throw BadRequestException for invalid amount', async () => {
      await expect(service.partialRefund('ord1', -10, 'Test')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for ineligible status', async () => {
      const order = {
        id: 'ord1',
        userId: 'user1',
        status: OrderStatus.PLACED,
        grandTotal: 100,
        paymentStatus: PaymentStatus.COMPLETED,
      } as OrderEntity;

      mockOrderRepo.findOne.mockResolvedValue(order);

      await expect(service.partialRefund('ord1', 50, 'Test')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when already fully refunded', async () => {
      const order = {
        id: 'ord1',
        userId: 'user1',
        status: OrderStatus.ON_THE_WAY,
        grandTotal: 100,
        paymentStatus: PaymentStatus.REFUNDED,
      } as OrderEntity;

      mockOrderRepo.findOne.mockResolvedValue(order);

      await expect(service.partialRefund('ord1', 50, 'Test')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when refund exceeds remaining amount', async () => {
      const order = {
        id: 'ord1',
        userId: 'user1',
        status: OrderStatus.ON_THE_WAY,
        grandTotal: 100,
        refundedAmount: 90,
        paymentStatus: PaymentStatus.COMPLETED,
      } as OrderEntity;

      mockOrderRepo.findOne.mockResolvedValue(order);

      await expect(service.partialRefund('ord1', 50, 'Test')).rejects.toThrow('exceeds remaining refundable');
    });
  });

  describe('handleKitchenDelay', () => {
    it('should send notification for delays over 30 minutes', async () => {
      const order = { id: 'ord1', userId: 'user1', status: OrderStatus.PREPARING, orderNumber: 'ORD-123' } as OrderEntity;
      
      mockOrderRepo.findOne.mockResolvedValue(order);

      await service.handleKitchenDelay('ord1', 45);
      expect(mockNotificationService.sendPush).toHaveBeenCalledWith(
        'user1',
        'Kitchen Delay Alert',
        expect.stringContaining('45 minutes'),
        expect.objectContaining({ orderId: 'ord1' })
      );
    });

    it('should not send notification for short delays', async () => {
      const order = { id: 'ord1', userId: 'user1', status: OrderStatus.PREPARING } as OrderEntity;
      
      mockOrderRepo.findOne.mockResolvedValue(order);

      await service.handleKitchenDelay('ord1', 20);
      expect(mockNotificationService.sendPush).not.toHaveBeenCalled();
    });
  });

  describe('reassignOrder', () => {
    it('should reassign order and clear driver', async () => {
      const order = { id: 'ord1', userId: 'user1', status: OrderStatus.DRIVER_ASSIGNED, driverId: 'driver1', orderNumber: 'ORD-123' } as OrderEntity;
      
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockDriverAssignmentRepo.findOne.mockResolvedValue({ id: 'assign1', driverId: 'driver1' } as any);
      mockDriverAssignmentRepo.save.mockResolvedValue({} as any);
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