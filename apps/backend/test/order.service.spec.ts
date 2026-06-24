import { describe, expect, it } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { OrderService } from '../src/services/order/order.service';
import { Order, OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';

function createOrderService() {
  return Object.create(OrderService.prototype) as OrderService;
}

function createOrder(overrides: Partial<Order> = {}): Order {
  const now = new Date('2026-06-21T00:00:00.000Z');
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
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('OrderService core commerce validation', () => {
  const service = createOrderService();

  it('accepts valid order items and rejects invalid item shapes', () => {
    expect(() => service.validateOrderItems([
      { id: 'item-1', name: 'Biryani', price: 249, quantity: 2 },
    ])).not.toThrow();

    expect(() => service.validateOrderItems([])).toThrow(BadRequestException);
    expect(() => service.validateOrderItems([{ id: '', name: 'Biryani', price: 249, quantity: 1 }])).toThrow(BadRequestException);
    expect(() => service.validateOrderItems([{ id: 'item-1', name: '', price: 249, quantity: 1 }])).toThrow(BadRequestException);
    expect(() => service.validateOrderItems([{ id: 'item-1', name: 'Biryani', price: -1, quantity: 1 }])).toThrow(BadRequestException);
    expect(() => service.validateOrderItems([{ id: 'item-1', name: 'Biryani', price: 249, quantity: 0 }])).toThrow(BadRequestException);
  });

  it('validates checkout totals against subtotal, tax, and delivery fee', () => {
    expect(() => service.validateOrderTotals({
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      grandTotal: 138,
      subtotal: 100,
      tax: 18,
      deliveryFee: 20,
    })).not.toThrow();

    expect(() => service.validateOrderTotals({
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      grandTotal: 137.99,
      subtotal: 100,
      tax: 18,
      deliveryFee: 20,
    })).not.toThrow();

    expect(() => service.validateOrderTotals({
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      grandTotal: 130,
      subtotal: 100,
      tax: 18,
      deliveryFee: 20,
    })).toThrow(BadRequestException);
    expect(() => service.validateOrderTotals({
      userId: 'user-1',
      restaurantId: 'restaurant-1',
      grandTotal: 0,
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
    })).toThrow(BadRequestException);
  });

  it('enforces allowed order lifecycle transitions and rejects invalid jumps', () => {
    const order = createOrder();

    service.transitionOrderStatus(order, OrderStatus.PAYMENT_CONFIRMED, 'customer');
    expect(order.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
    expect(order.updatedAt).toBeInstanceOf(Date);

    service.transitionOrderStatus(order, OrderStatus.RESTAURANT_ACCEPTED, 'restaurant');
    service.transitionOrderStatus(order, OrderStatus.PREPARING, 'restaurant');
    service.transitionOrderStatus(order, OrderStatus.READY_FOR_PICKUP, 'restaurant');
    service.transitionOrderStatus(order, OrderStatus.DRIVER_ASSIGNED, 'dispatcher');
    service.transitionOrderStatus(order, OrderStatus.PICKED_UP, 'driver-1');
    service.transitionOrderStatus(order, OrderStatus.ON_THE_WAY, 'driver-1');
    service.transitionOrderStatus(order, OrderStatus.DELIVERED, 'driver-1');

    expect(order.status).toBe(OrderStatus.DELIVERED);
    expect(order.deliveredAt).toBeInstanceOf(Date);
    expect(() => service.transitionOrderStatus(order, OrderStatus.PREPARING, 'admin')).toThrow(BadRequestException);
  });

  it('allows same-state retries without changing lifecycle semantics', () => {
    const order = createOrder({ status: OrderStatus.ON_THE_WAY });

    const result = service.transitionOrderStatus(order, OrderStatus.ON_THE_WAY, 'driver-1');

    expect(result.status).toBe(OrderStatus.ON_THE_WAY);
  });
});
