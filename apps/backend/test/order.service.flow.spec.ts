import { describe, expect, it, beforeEach } from '@jest/globals';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { OrderService } from '../src/services/order/order.service';
import { OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';

function createOrder(overrides: any = {}) {
  return {
    id: 'order-1',
    userId: 'user-1',
    restaurantId: 'restaurant-1',
    orderNumber: 'ORD-TEST-001',
    status: OrderStatus.PLACED,
    paymentStatus: PaymentStatus.PENDING,
    subtotal: 100,
    tax: 18,
    deliveryFee: 20,
    discount: 0,
    tip: 0,
    grandTotal: 138,
    deliveryAddressId: 'address-1',
    createdAt: new Date('2026-06-21T00:00:00.000Z'),
    updatedAt: new Date('2026-06-21T00:00:00.000Z'),
    ...overrides,
  };
}

function createService() {
  const orderRepo = { findOne: jest.fn(), save: jest.fn() };
  const driverAssignmentRepo = { findOne: jest.fn(), save: jest.fn() };
  const paymentService = { confirmPayment: jest.fn(), refundPayment: jest.fn() };
  const notificationService = { sendPush: jest.fn() };
  const retryService = { executeWithRetry: jest.fn() };
  const idempotency = { validateOrCreate: jest.fn(), complete: jest.fn() };
  const productionNotification = { sendPaymentNotification: jest.fn() };
  const loggingService = { secureError: jest.fn() };

  const service = Object.create(OrderService.prototype) as OrderService;
  Object.assign(service, {
    orderRepo,
    driverAssignmentRepo,
    paymentService,
    notificationService,
    retryService,
    idempotency,
    productionNotification,
    loggingService,
  });

  return { service, orderRepo, driverAssignmentRepo, paymentService, notificationService, idempotency, loggingService };
}

describe('OrderService high-risk flow methods', () => {
  let mocks: ReturnType<typeof createService>;

  beforeEach(() => {
    mocks = createService();
  });

  it('places an order and records idempotency completion', async () => {
    mocks.idempotency.validateOrCreate.mockResolvedValue({ isDuplicate: false });
    mocks.orderRepo.save.mockResolvedValue(createOrder({ id: 'saved-order' }));

    const result = await mocks.service.placeOrder({
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      grandTotal: 138,
      subtotal: 100,
      tax: 18,
      deliveryFee: 20,
    }, 'idem-1');

    expect(result.id).toBe('saved-order');
    expect(mocks.idempotency.validateOrCreate).toHaveBeenCalledWith(
      'idem-1',
      'place_order',
      'user-1',
      { restaurantId: 'restaurant-1', grandTotal: 138 },
    );
    expect(mocks.idempotency.complete).toHaveBeenCalledWith('idem-1', 'place_order', expect.objectContaining({ id: 'saved-order' }));
  });

  it('returns duplicate idempotent order responses without creating a second order', async () => {
    mocks.idempotency.validateOrCreate.mockResolvedValue({ isDuplicate: true, response: createOrder({ id: 'duplicate-order' }) });

    const result = await mocks.service.placeOrder({
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      grandTotal: 138,
      subtotal: 100,
      tax: 18,
      deliveryFee: 20,
    }, 'idem-1');

    expect(result.id).toBe('duplicate-order');
    expect(mocks.orderRepo.save).not.toHaveBeenCalled();
  });

  it('confirms payment and advances order status', async () => {
    const order = createOrder();
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.paymentService.confirmPayment.mockResolvedValue({ id: 'pi_1', amount: 13800, currency: 'usd', status: 'succeeded' });
    mocks.orderRepo.save.mockResolvedValue(order);

    const result = await mocks.service.confirmPayment('order-1', 'pi_1');

    expect(result.paymentStatus).toBe(PaymentStatus.COMPLETED);
    expect(result.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
    expect(mocks.notificationService.sendPush).toHaveBeenCalledWith('user-1', 'Payment Confirmed', expect.stringContaining('confirmed'), { orderId: 'order-1' });
  });

  it('marks payment failed when confirmation throws', async () => {
    const order = createOrder();
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.paymentService.confirmPayment.mockRejectedValue(new Error('gateway timeout'));
    mocks.orderRepo.save.mockResolvedValue(order);

    await expect(mocks.service.confirmPayment('order-1', 'pi_1')).rejects.toThrow('gateway timeout');

    expect(order.paymentStatus).toBe(PaymentStatus.FAILED);
    expect(mocks.loggingService.secureError).toHaveBeenCalled();
  });

  it('rejects duplicate payment confirmation', async () => {
    mocks.orderRepo.findOne.mockResolvedValue(createOrder({ paymentStatus: PaymentStatus.COMPLETED }));

    await expect(mocks.service.confirmPayment('order-1', 'pi_1')).rejects.toThrow(ConflictException);
    expect(mocks.paymentService.confirmPayment).not.toHaveBeenCalled();
  });

  it('processes refund after dispatch and notifies the customer', async () => {
    const order = createOrder({ status: OrderStatus.ON_THE_WAY });
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.paymentService.refundPayment.mockResolvedValue({ id: 're_1', amount: 13800, currency: 'usd', status: 'succeeded' });
    mocks.orderRepo.save.mockResolvedValue(order);

    const result = await mocks.service.refundAfterDispatch('order-1', 'Customer requested refund');

    expect(result.paymentStatus).toBe(PaymentStatus.REFUNDED);
    expect(mocks.notificationService.sendPush).toHaveBeenCalledWith('user-1', 'Refund Initiated', expect.stringContaining('Customer requested refund'), { orderId: 'order-1' });
  });

  it('rejects refund for ineligible order status', async () => {
    mocks.orderRepo.findOne.mockResolvedValue(createOrder({ status: OrderStatus.PLACED }));

    await expect(mocks.service.refundAfterDispatch('order-1', 'Customer requested refund')).rejects.toThrow(BadRequestException);
  });

  it('allows only assigned driver cancellation and clears driver assignment', async () => {
    const order = createOrder({ status: OrderStatus.DRIVER_ASSIGNED, driverId: 'driver-1' });
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.orderRepo.save.mockResolvedValue(order);

    const result = await mocks.service.cancelByDriver('order-1', 'driver-1');

    expect(result.status).toBe(OrderStatus.CANCELLED);
    expect(result.driverId).toBe('');
    expect(mocks.notificationService.sendPush).toHaveBeenCalled();
  });

  it('rejects cancellation by an unassigned driver', async () => {
    mocks.orderRepo.findOne.mockResolvedValue(createOrder({ status: OrderStatus.DRIVER_ASSIGNED, driverId: 'driver-1' }));

    await expect(mocks.service.cancelByDriver('order-1', 'driver-2')).rejects.toThrow(BadRequestException);
  });

  it('retries only failed-payment orders', async () => {
    const order = createOrder({ paymentStatus: PaymentStatus.FAILED });
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.orderRepo.save.mockResolvedValue(order);

    const result = await mocks.service.retryOrder('order-1');

    expect(result.status).toBe(OrderStatus.PLACED);
    expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
  });

  it('rejects retry for non-failed payments', async () => {
    mocks.orderRepo.findOne.mockResolvedValue(createOrder({ paymentStatus: PaymentStatus.PENDING }));

    await expect(mocks.service.retryOrder('order-1')).rejects.toThrow(BadRequestException);
  });
});
