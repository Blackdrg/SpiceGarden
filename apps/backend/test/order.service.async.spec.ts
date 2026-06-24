import { describe, expect, it, jest } from '@jest/globals';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { OrderService } from '../src/services/order/order.service';
import { OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';
import * as crypto from 'crypto';

function createOrderService() {
  return Object.create(OrderService.prototype) as any;
}

function createOrder(overrides: Partial<any> = {}): any {
  return {
    id: 'order-1',
    userId: 'user-1',
    restaurantId: 'rest-1',
    orderNumber: 'ORD-001',
    status: OrderStatus.PLACED,
    paymentStatus: PaymentStatus.PENDING,
    subtotal: 100,
    tax: 18,
    deliveryFee: 20,
    discount: 0,
    tip: 0,
    grandTotal: 138,
    deliveryAddressId: 'addr-1',
    driverId: undefined,
    createdAt: new Date('2026-06-21'),
    updatedAt: new Date('2026-06-21'),
    ...overrides,
  };
}

function anyMock(): any {
  return jest.fn();
}

describe('OrderService async methods coverage', () => {
  let service: any;

  beforeEach(() => {
    service = createOrderService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('applyOrderStatusTransition', () => {
    it('should throw NotFoundException when order not found', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.applyOrderStatusTransition('missing', OrderStatus.PAYMENT_CONFIRMED, 'customer')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should apply transition and persist', async () => {
      const order = createOrder();
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(order);
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.transitionOrderStatus = jest.fn((o: any, s: any) => ({ ...o, status: s }));

      const result = await service.applyOrderStatusTransition('order-1', OrderStatus.PAYMENT_CONFIRMED, 'customer');
      expect(result.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
      expect(service.orderRepo.save).toHaveBeenCalled();
    });
  });

  describe('placeOrder', () => {
    function setupPlaceOrder() {
      service.orderRepo = { save: anyMock() };
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.idempotency = { validateOrCreate: (jest.fn() as any).mockResolvedValue({ isDuplicate: false }) } as any;
      service.loggingService = { secureError: jest.fn() };
    }

    it('should throw when userId missing', async () => {
      setupPlaceOrder();
      await expect(service.placeOrder({ grandTotal: 100 } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw when restaurantId missing', async () => {
      setupPlaceOrder();
      await expect(service.placeOrder({ userId: 'u1', grandTotal: 100 } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw when grandTotal missing', async () => {
      setupPlaceOrder();
      await expect(service.placeOrder({ userId: 'u1', restaurantId: 'r1' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw for empty items', async () => {
      setupPlaceOrder();
      await expect(service.placeOrder({ userId: 'u1', restaurantId: 'r1', grandTotal: 100, items: [] } as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw for totals mismatch', async () => {
      setupPlaceOrder();
      await expect(
        service.placeOrder({
          userId: 'u1', restaurantId: 'r1', grandTotal: 100,
          items: [{ id: 'i1', name: 'n', price: 10, quantity: 1 }],
          subtotal: 50, tax: 10, deliveryFee: 10,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should place order and return entity', async () => {
      setupPlaceOrder();

      const result = await service.placeOrder({
        userId: 'u1', restaurantId: 'r1', grandTotal: 138,
        items: [{ id: 'i1', name: 'Biryani', price: 120, quantity: 1 }],
        subtotal: 100, tax: 18, deliveryFee: 20,
      });

      expect(result.status).toBe(OrderStatus.PLACED);
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(result.orderNumber).toContain('ORD-');
      expect(service.orderRepo.save).toHaveBeenCalled();
    });

    it('should return cached idempotent response', async () => {
      setupPlaceOrder();
      service.idempotency = { validateOrCreate: (jest.fn() as any).mockResolvedValue({ isDuplicate: true, response: { id: 'existing' } }) } as any;

      const result = await service.placeOrder({
        userId: 'u1', restaurantId: 'r1', grandTotal: 138,
        items: [{ id: 'i1', name: 'Biryani', price: 120, quantity: 1 }],
        subtotal: 100, tax: 18, deliveryFee: 20,
      }, 'idem-key');

      expect(result.id).toBe('existing');
    });

    it('should throw ConflictException for duplicate key error', async () => {
      setupPlaceOrder();
      const dupErr = new Error('duplicate key') as any;
      dupErr.code = '23505';
      service.orderRepo.save.mockRejectedValue(dupErr);

      await expect(service.placeOrder({
        userId: 'u1', restaurantId: 'r1', grandTotal: 138,
        items: [{ id: 'i1', name: 'Biryani', price: 120, quantity: 1 }],
        subtotal: 100, tax: 18, deliveryFee: 20,
      })).rejects.toThrow(ConflictException);
    });
  });

  describe('confirmPayment', () => {
    it('should throw NotFoundException when order not found', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.confirmPayment('missing', 'pay-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when already confirmed', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ paymentStatus: PaymentStatus.COMPLETED }));
      await expect(service.confirmPayment('order-1', 'pay-1')).rejects.toThrow(ConflictException);
    });

    it('should confirm payment and notify customer', async () => {
      const order = createOrder();
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(order);
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.paymentService = { confirmPayment: (jest.fn() as any).mockResolvedValue({ id: 'pi_xxx' }) } as any;
      service.notificationService = { sendPush: jest.fn() };

      const result = await service.confirmPayment('order-1', 'pay-1', { id: 'req_1' });
      expect(result.paymentStatus).toBe(PaymentStatus.COMPLETED);
      expect(result.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
      expect(service.notificationService.sendPush).toHaveBeenCalledWith('user-1', 'Payment Confirmed', expect.any(String), { orderId: 'order-1' });
    });

    it('should mark payment FAILED and persist on confirmPayment error', async () => {
      const order = createOrder();
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(order);
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.paymentService = { confirmPayment: (jest.fn() as any).mockRejectedValue(new Error('card declined')) } as any;
      service.loggingService = { secureError: jest.fn() };

      await expect(service.confirmPayment('order-1', 'pay-1')).rejects.toThrow('card declined');
      expect(order.paymentStatus).toBe(PaymentStatus.FAILED);
      expect(service.orderRepo.save).toHaveBeenCalled();
    });
  });

  describe('handleWebhookDelayed', () => {
    it('should throw NotFoundException when order missing', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.handleWebhookDelayed('order-1', 'pay-1')).rejects.toThrow(NotFoundException);
    });

    it('should return order if already COMPLETED', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ paymentStatus: PaymentStatus.COMPLETED }));
      const result = await service.handleWebhookDelayed('order-1', 'pay-1');
      expect(result.paymentStatus).toBe(PaymentStatus.COMPLETED);
    });

    it('should return order if FAILED', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ paymentStatus: PaymentStatus.FAILED }));
      const result = await service.handleWebhookDelayed('order-1', 'pay-1');
      expect(result.paymentStatus).toBe(PaymentStatus.FAILED);
    });

    it('should call confirmPayment for PENDING payment', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ paymentStatus: PaymentStatus.PENDING }));
      const confirmPaymentMock = (jest.fn() as any).mockResolvedValue({ id: 'order-1', paymentStatus: PaymentStatus.COMPLETED });
      service.confirmPayment = confirmPaymentMock;

      const result = await service.handleWebhookDelayed('order-1', 'pay-1');
      expect(confirmPaymentMock).toHaveBeenCalledWith('order-1', 'pay-1');
      expect(result.paymentStatus).toBe(PaymentStatus.COMPLETED);
    });
  });

  describe('refundAfterDispatch', () => {
    it('should throw NotFoundException when order missing', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.refundAfterDispatch('order-1', 'reason')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for ineligible status', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ status: OrderStatus.PREPARING }));
      await expect(service.refundAfterDispatch('order-1', 'reason')).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when already refunded', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ status: OrderStatus.ON_THE_WAY, paymentStatus: PaymentStatus.REFUNDED }));
      await expect(service.refundAfterDispatch('order-1', 'reason')).rejects.toThrow(ConflictException);
    });

    it('should process refund and notify customer', async () => {
      const order = createOrder({ status: OrderStatus.ON_THE_WAY });
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(order);
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.paymentService = { refundPayment: (jest.fn() as any).mockResolvedValue({ id: 'ref-1' }) };
      service.notificationService = { sendPush: jest.fn() };
      service.loggingService = { secureError: jest.fn() };

      const result = await service.refundAfterDispatch('order-1', 'changed mind');
      expect(result.paymentStatus).toBe(PaymentStatus.REFUNDED);
      expect(service.notificationService.sendPush).toHaveBeenCalled();
    });
  });

  describe('cancelByDriver', () => {
    it('should throw NotFoundException when order missing', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.cancelByDriver('missing', 'driver-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when driver not assigned', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ driverId: 'other-driver' }));
      await expect(service.cancelByDriver('order-1', 'driver-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-cancellable status', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ driverId: 'driver-1', status: OrderStatus.DELIVERED }));
      await expect(service.cancelByDriver('order-1', 'driver-1')).rejects.toThrow(BadRequestException);
    });

    it('should cancel, clear driverId, save, and notify', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ driverId: 'driver-1', status: OrderStatus.ON_THE_WAY }));
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.notificationService = { sendPush: jest.fn() };

      const result = await service.cancelByDriver('order-1', 'driver-1');
      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(result.driverId).toBe('');
      expect(service.orderRepo.save).toHaveBeenCalled();
      expect(service.notificationService.sendPush).toHaveBeenCalled();
    });
  });

  describe('cancelByKitchen', () => {
    it('should throw NotFoundException when order missing', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.cancelByKitchen('missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for delivered order', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ status: OrderStatus.DELIVERED }));
      await expect(service.cancelByKitchen('order-1')).rejects.toThrow(BadRequestException);
    });

    it('should cancel RESTAURANT_ACCEPTED order', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ status: OrderStatus.RESTAURANT_ACCEPTED }));
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.notificationService = { sendPush: jest.fn() };

      const result = await service.cancelByKitchen('order-1');
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should cancel PREPARING order', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ status: OrderStatus.PREPARING }));
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.notificationService = { sendPush: jest.fn() };

      const result = await service.cancelByKitchen('order-1');
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('preventDoubleDispatch', () => {
    it('should throw NotFoundException when order missing', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.preventDoubleDispatch('order-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when driver already assigned', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ driverId: 'driver-1', status: OrderStatus.DRIVER_ASSIGNED }));
      await expect(service.preventDoubleDispatch('order-1')).rejects.toThrow(ConflictException);
    });

    it('should return order for dispatch when no driver assigned', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder());
      const result = await service.preventDoubleDispatch('order-1');
      expect(result.id).toBe('order-1');
    });
  });

  describe('retryOrder', () => {
    it('should throw NotFoundException when order missing', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.retryOrder('missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-failed payment', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ paymentStatus: PaymentStatus.COMPLETED }));
      await expect(service.retryOrder('order-1')).rejects.toThrow(BadRequestException);
    });

    it('should reset to PLACED/PENDING for failed payment', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ paymentStatus: PaymentStatus.FAILED }));
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.loggingService = { secureError: jest.fn() };

      const result = await service.retryOrder('order-1');
      expect(result.status).toBe(OrderStatus.PLACED);
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
    });
  });

  describe('resolveStuckPreparingState', () => {
    it('should rescue stuck orders and notify customers', async () => {
      const order = createOrder({ status: OrderStatus.PREPARING });
      service.orderRepo = { find: anyMock(), save: anyMock() };
      service.orderRepo.find.mockResolvedValue([order]);
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.notificationService = { sendPush: jest.fn() };

      const result = await service.resolveStuckPreparingState();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(OrderStatus.RESTAURANT_ACCEPTED);
      expect(service.notificationService.sendPush).toHaveBeenCalled();
    });

    it('should handle save errors per order gracefully', async () => {
      service.orderRepo = { find: anyMock() };
      service.orderRepo.find.mockResolvedValue([createOrder({ status: OrderStatus.PREPARING })]);
      service.loggingService = { secureError: jest.fn() };
      service.orderRepo.save = anyMock();
      service.orderRepo.save.mockRejectedValue(new Error('db error'));

      const result = await service.resolveStuckPreparingState();
      expect(result).toHaveLength(0);
      expect(service.loggingService.secureError).toHaveBeenCalled();
    });
  });

  describe('checkDuplicateOrder', () => {
    it('should return false when no duplicate found', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      const result = await service.checkDuplicateOrder('user-1', 'rest-1', 'hash-abc', 5);
      expect(result).toBe(false);
    });

    it('should return true when a recent duplicate exists', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ createdAt: new Date() }));
      const result = await service.checkDuplicateOrder('user-1', 'rest-1', 'hash-abc', 5);
      expect(result).toBe(true);
    });
  });

  describe('cancelOrderAtomic', () => {
    it('should throw NotFoundException when order missing in transaction', async () => {
      service.orderRepo = {
        manager: {
          transaction: jest.fn(async (cb: any) => {
            const mgr = { findOne: anyMock(), save: anyMock() };
            mgr.findOne.mockResolvedValue(null);
            return cb(mgr);
          }),
        },
      };
      await expect(service.cancelOrderAtomic('missing', 'user', 'reason')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for delivered in transaction', async () => {
      service.orderRepo = {
        manager: {
          transaction: jest.fn(async (cb: any) => {
            const mgr = { findOne: anyMock(), save: anyMock() };
            mgr.findOne.mockResolvedValue(createOrder({ status: OrderStatus.DELIVERED }));
            return cb(mgr);
          }),
        },
      };
      await expect(service.cancelOrderAtomic('order-1', 'user', 'reason')).rejects.toThrow(BadRequestException);
    });

    it('should cancel order atomically', async () => {
      const saveMock = anyMock();
      saveMock.mockImplementation((o: any) => Promise.resolve({ ...createOrder(), status: OrderStatus.CANCELLED }));
      service.orderRepo = {
        manager: {
          transaction: jest.fn(async (cb: any) => {
            const mgr = { findOne: anyMock(), save: saveMock };
            mgr.findOne.mockResolvedValue(createOrder());
            return cb(mgr);
          }),
        },
      };

      const result = await service.cancelOrderAtomic('order-1', 'actor', 'reason');
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('partialRefund', () => {
    it('should throw BadRequestException for zero amount', async () => {
      service.orderRepo = { findOne: anyMock() };
      await expect(service.partialRefund('order-1', 0, 'reason')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when order missing', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.partialRefund('order-1', 50, 'reason')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for PREPARING order', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ status: OrderStatus.PREPARING }));
      await expect(service.partialRefund('order-1', 50, 'reason')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when already refunded', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ paymentStatus: PaymentStatus.REFUNDED }));
      await expect(service.partialRefund('order-1', 50, 'reason')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount exceeds remaining', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder({ grandTotal: 100, refundedAmount: 80 }));
      await expect(service.partialRefund('order-1', 50, 'reason')).rejects.toThrow(BadRequestException);
    });

    it('should process partial refund for valid input', async () => {
      const order = createOrder({ status: OrderStatus.ON_THE_WAY, grandTotal: 200, refundedAmount: 0 });
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(order);
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.paymentService = { refundPayment: (jest.fn() as any).mockResolvedValue({ id: 'ref-1' }) };

      const result = await service.partialRefund('order-1', 50, 'reason');
      expect(result.refundedAmount).toBe(50);
      expect(service.paymentService.refundPayment).toHaveBeenCalledWith('order-1', 50, 'user-1', 'reason');
    });
  });

  describe('handleKitchenDelay', () => {
    it('should not notify for short delays', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder());
      service.notificationService = { sendPush: jest.fn() };
      await service.handleKitchenDelay('order-1', 10);
      expect(service.notificationService.sendPush).not.toHaveBeenCalled();
    });

    it('should notify for delays exceeding 30 minutes', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder());
      service.notificationService = { sendPush: jest.fn() };
      await service.handleKitchenDelay('order-1', 45);
      expect(service.notificationService.sendPush).toHaveBeenCalledWith(
        'user-1', 'Kitchen Delay Alert',
        expect.stringContaining('delayed by 45 minutes'),
        { orderId: 'order-1' },
      );
    });

    it('should return undefined when order not found', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.handleKitchenDelay('missing', 45)).resolves.toBeUndefined();
    });
  });

  describe('reassignOrder', () => {
    it('should return false when order not found', async () => {
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      const result = await service.reassignOrder('missing', 'driver-2', 'reason');
      expect(result).toBe(false);
    });

    it('should reassign and update existing assignment record', async () => {
      const order = createOrder({ driverId: 'driver-1' });
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(order);
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.driverAssignmentRepo = {
        findOne: anyMock(),
        save: jest.fn().mockImplementation((o: any) => Promise.resolve(o)),
      };
      service.driverAssignmentRepo.findOne.mockResolvedValue({ id: 'a1', status: 'assigned' });
      service.notificationService = { sendPush: jest.fn() };

      const result = await service.reassignOrder('order-1', 'driver-2', 'driver unavailable');
      expect(result).toBe(true);
      expect(order.driverId).toBe('');
      expect(service.notificationService.sendPush).toHaveBeenCalled();
    });

    it('should work when no prior assignment record exists', async () => {
      const order = createOrder({ driverId: '' });
      service.orderRepo = { findOne: anyMock(), save: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(order);
      service.orderRepo.save.mockImplementation((o: any) => Promise.resolve(o));
      service.driverAssignmentRepo = { findOne: anyMock() };
      service.driverAssignmentRepo.findOne.mockResolvedValue(null);
      service.notificationService = { sendPush: jest.fn() };

      const result = await service.reassignOrder('order-1', 'driver-2', 'reason');
      expect(result).toBe(true);
    });
  });

  describe('getOrderWithLock', () => {
    it('should throw NotFoundException when order missing', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(null);
      await expect(service.getOrderWithLock('missing')).rejects.toThrow(NotFoundException);
    });

    it('should return order with pessimistic_write lock option', async () => {
      service.orderRepo = { findOne: anyMock() };
      service.orderRepo.findOne.mockResolvedValue(createOrder());
      const result = await service.getOrderWithLock('order-1');
      expect(result.id).toBe('order-1');
      expect(service.orderRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
    });
  });
});
