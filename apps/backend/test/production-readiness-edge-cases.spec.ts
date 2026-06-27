import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { OrderProcessor } from '../src/infra/queue/order.processor';
import { OrderEntity } from '../src/db/entities/order.entity';
import { NotificationService } from '../src/services/notifications/notification.service';
import { PaymentService } from '../src/services/payments/payments.service';
import { RefundService, RefundRequestType } from '../src/services/refund/refund.service';
import { RefundEntity } from '../src/db/entities/refund.entity';
import { RefundApprovalEntity } from '../src/db/entities/refund-approval.entity';
import { OrderEntity as OrderModel } from '../src/db/entities/order.entity';
import { UserEntity } from '../src/db/entities/user.entity';
import { LedgerService } from '../src/modules/ledger/ledger.service';
import { ProductionNotificationService } from '../src/services/notifications/production-notification.service';
import { TrackingGateway } from '../src/infra/tracking/tracking.gateway';
import { NotificationEntity } from '../src/db/entities/notification.entity';
import { OrderService } from '../src/services/order/order.service';
import { OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';
import { RetryService } from '../src/services/payments/retry.service';
import { IdempotencyService } from '../src/services/payments/idempotency.service';
import { LoggingService } from '../src/logging/logging.service';
import { DriverAssignmentEntity } from '../src/db/entities/driver-assignment.entity';

const gateway = {
  getGatewayName: jest.fn(() => 'stripe'),
  createPaymentIntent: jest.fn(),
  confirmPayment: jest.fn(),
  refundPayment: jest.fn(),
  constructEvent: jest.fn(),
};

const configService = {
  get: jest.fn((key: string, fallback: unknown) => {
    if (key === 'REFUND_MANAGER_APPROVAL_THRESHOLD') return 1000;
    if (key === 'WS_ACK_TIMEOUT_MS') return 25;
    return fallback;
  }),
} as unknown as ConfigService;

const paymentGatewayFactory = {
  getGateway: jest.fn(() => gateway),
} as any;

const auditService = {
  logPaymentEvent: jest.fn().mockResolvedValue(undefined),
};

const ledgerService = {
  createTransaction: jest.fn().mockResolvedValue(undefined),
};

const notificationService = {
  notifyOrderUpdate: jest.fn().mockResolvedValue(undefined),
  sendPush: jest.fn().mockResolvedValue(undefined),
};

const paymentService = {
  confirmPayment: jest.fn(),
  refundPayment: jest.fn(),
} as any;

const retryService = {} as RetryService;

const idempotencyService = {
  validateOrCreate: jest.fn(),
  complete: jest.fn(),
} as unknown as IdempotencyService;

const productionNotification = {
  sendPaymentNotification: jest.fn().mockResolvedValue(undefined),
} as unknown as ProductionNotificationService;

const loggingService = {
  secureError: jest.fn(),
} as unknown as LoggingService;

function orderEntity(overrides: Partial<OrderModel> = {}): OrderModel {
  return {
    id: 'order-1',
    userId: 'user-1',
    restaurantId: 'restaurant-1',
    orderNumber: 'ORD-1',
    status: OrderStatus.PLACED,
    paymentStatus: PaymentStatus.PENDING,
    subtotal: 100,
    tax: 10,
    deliveryFee: 5,
    discount: 0,
    tip: 0,
    grandTotal: 115,
    deliveryAddressId: 'addr-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as OrderModel;
}

function refundApprovalEntity(overrides: Partial<RefundApprovalEntity> = {}): RefundApprovalEntity {
  return {
    id: 'approval-1',
    order: orderEntity({ status: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.COMPLETED }),
    refundAmount: 50,
    currency: 'USD',
    reason: 'late',
    requestedBy: 'user-1',
    requestType: RefundRequestType.CUSTOMER_REQUEST,
    approvalStatus: 'approved',
    requiresManagerApproval: false,
    ...overrides,
  } as RefundApprovalEntity;
}

describe('Production-readiness backend edge coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gateway.createPaymentIntent.mockResolvedValue({ id: 'pi_1', amount: 2500, currency: 'usd' });
    gateway.confirmPayment.mockResolvedValue({ id: 'pi_1', amount: 2500, currency: 'usd' });
    gateway.refundPayment.mockResolvedValue({ id: 're_1', amount: 2500, currency: 'usd' });
    gateway.constructEvent.mockImplementation(async (payload: Buffer) => JSON.parse(payload.toString()));
    paymentService.confirmPayment.mockResolvedValue({ id: 'pi_1', amount: 2500, currency: 'usd' });
    paymentService.refundPayment.mockResolvedValue({ id: 're_1', amount: 2500, currency: 'usd' });
  });

  describe('PaymentService', () => {
    it('rejects payment limits before calling the gateway', async () => {
      const service = new PaymentService(
        { get: jest.fn((key: string) => key === 'PAYMENT_MAX_SINGLE_AMOUNT' ? 100 : 50000) } as any,
        auditService as any,
        ledgerService as any,
        paymentGatewayFactory,
      );

      await expect(service.createPaymentIntent(101, 'usd', 'user-1')).rejects.toThrow(BadRequestException);
      expect(gateway.createPaymentIntent).not.toHaveBeenCalled();
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_intent_failed',
        'user-1',
        101,
        'usd',
        'any',
        '',
        false,
        undefined,
        'Payment amount exceeds maximum allowed: 100',
      );
    });

    it('keeps successful payment confirmation when ledger write fails', async () => {
      ledgerService.createTransaction.mockRejectedValueOnce(new Error('ledger down'));
      const service = new PaymentService(
        { get: jest.fn(() => 10000) } as any,
        auditService as any,
        ledgerService as any,
        paymentGatewayFactory,
      );

      const result = await service.confirmPayment('pi_1', 'user-1');

      expect(result.status).toBeUndefined();
      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'payment_confirmed',
        'user-1',
        25,
        'usd',
        'stripe',
        'pi_1',
        true,
        undefined,
      );
    });

    it('rejects refund amounts above the original payment', async () => {
      const service = new PaymentService(
        { get: jest.fn(() => 10000) } as any,
        auditService as any,
        ledgerService as any,
        paymentGatewayFactory,
      );

      await expect(service.refundPayment('pi_1', 30, 'user-1')).rejects.toThrow(BadRequestException);
      expect(gateway.refundPayment).not.toHaveBeenCalled();
    });

    it('logs webhook receipt with metadata user and amount', async () => {
      const service = new PaymentService(
        { get: jest.fn(() => 10000) } as any,
        auditService as any,
        ledgerService as any,
        paymentGatewayFactory,
      );

      await service.constructEvent(
        Buffer.from(JSON.stringify({ data: { object: { id: 'pi_1', amount: 1200, currency: 'usd', metadata: { userId: 'user-1' } } } })),
        'sig',
        'secret',
      );

      expect(auditService.logPaymentEvent).toHaveBeenCalledWith(
        'webhook_received',
        'user-1',
        12,
        'usd',
        'stripe',
        'pi_1',
        true,
        null,
      );
    });
  });

  describe('OrderProcessor', () => {
    const orderRepo = { findOne: jest.fn(), save: jest.fn() } as any;

    it('rejects lifecycle jobs without orderId or status', async () => {
      const processor = new OrderProcessor(orderRepo, notificationService as any);
      await expect(processor.processOrderLifecycle({ orderId: '', status: OrderStatus.PLACED })).rejects.toThrow('requires orderId and status');
    });

    it('throws when the order does not exist', async () => {
      const processor = new OrderProcessor(orderRepo, notificationService as any);
      orderRepo.findOne.mockResolvedValue(null);

      await expect(processor.processOrderLifecycle({ orderId: 'missing', status: OrderStatus.DELIVERED })).rejects.toThrow(NotFoundException);
    });

    it('does not save unchanged status but still notifies the user', async () => {
      const existing = orderEntity({ status: OrderStatus.DELIVERED });
      const processor = new OrderProcessor(orderRepo, notificationService as any);
      orderRepo.findOne.mockResolvedValue(existing);

      await processor.processOrderLifecycle({ orderId: 'order-1', status: OrderStatus.DELIVERED, userId: 'user-1' }, { id: 'job-1' } as any);

      expect(orderRepo.save).not.toHaveBeenCalled();
      expect(notificationService.notifyOrderUpdate).toHaveBeenCalledWith('user-1', 'order-1', OrderStatus.DELIVERED);
    });
  });

  describe('RefundService', () => {
    const repos = {
      refundRepo: { create: jest.fn((data: any) => data), save: jest.fn() } as any,
      refundApprovalRepo: { findOne: jest.fn(), save: jest.fn((approval: RefundApprovalEntity) => approval) } as any,
      orderRepo: { findOne: jest.fn(), save: jest.fn((order: OrderModel) => order) } as any,
      userRepo: { findOne: jest.fn() } as any,
    };

    it('prevents duplicate pending refund approvals for the same order', async () => {
      repos.orderRepo.findOne.mockResolvedValue(orderEntity({ status: OrderStatus.DELIVERED }));
      repos.userRepo.findOne.mockResolvedValue({ id: 'user-1' });
      repos.refundApprovalRepo.findOne.mockResolvedValue({ id: 'existing-pending' });
      const service = new RefundService(
        repos.refundRepo,
        repos.refundApprovalRepo,
        repos.orderRepo,
        repos.userRepo,
        paymentService as any,
        notificationService as any,
        ledgerService as any,
        productionNotification as any,
        configService,
      );

      await expect(service.createRefundRequest('order-1', 'user-1', 50, 'late')).rejects.toThrow(BadRequestException);
      expect(repos.refundApprovalRepo.save).not.toHaveBeenCalled();
    });

    it('marks approval failed when payment refund fails while preserving double-refund guard', async () => {
      const approval = refundApprovalEntity();
      const order = orderEntity({ id: 'order-1', status: OrderStatus.DELIVERED, paymentStatus: PaymentStatus.COMPLETED, paymentIntentId: 'pi_1' });
      const processor = { id: 'processor-1' };
      repos.refundApprovalRepo.findOne.mockResolvedValueOnce(approval).mockResolvedValueOnce(approval);
      repos.orderRepo.findOne.mockResolvedValue(order);
      repos.userRepo.findOne.mockResolvedValueOnce(processor).mockResolvedValueOnce({ id: 'user-1' });
      paymentService.refundPayment.mockRejectedValueOnce(new Error('gateway down'));
      const service = new RefundService(
        repos.refundRepo,
        repos.refundApprovalRepo,
        repos.orderRepo,
        repos.userRepo,
        paymentService as any,
        notificationService as any,
        ledgerService as any,
        productionNotification as any,
        configService,
      );

      await expect(service.processRefund('approval-1', 'processor-1')).rejects.toThrow(InternalServerErrorException);

      expect(approval.approvalStatus).toBe('failed');
      expect(repos.refundApprovalRepo.save).toHaveBeenCalledWith(approval);
      expect(order.paymentStatus).toBe(PaymentStatus.COMPLETED);
    });

    it('rejects processing an already processed approval', async () => {
      const approval = refundApprovalEntity({ approvalStatus: 'processed' });
      repos.refundApprovalRepo.findOne.mockResolvedValue(approval);
      repos.userRepo.findOne.mockResolvedValue({ id: 'processor-1' });
      const service = new RefundService(
        repos.refundRepo,
        repos.refundApprovalRepo,
        repos.orderRepo,
        repos.userRepo,
        paymentService as any,
        notificationService as any,
        ledgerService as any,
        productionNotification as any,
        configService,
      );

      await expect(service.processRefund('approval-1', 'processor-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('TrackingGateway', () => {
    it('rejects invalid room joins and invalid location updates', async () => {
      const client = {
        id: 'client-1',
        handshake: { headers: {}, address: '127.0.0.1' },
        nsp: { name: '/' },
        disconnect: jest.fn(),
        emit: jest.fn(),
        join: jest.fn(),
      } as any;
      const gatewayInstance = new TrackingGateway(configService, {} as Repository<NotificationEntity>);
      (gatewayInstance as any).connectedClients = new Map([['client-1', { id: 'client-1', acknowledgedMessages: new Map() }]] as any);

      expect(gatewayInstance.handleJoin({ room: '../bad' } as any, client)).toEqual({ error: 'Invalid room' });
      expect(await gatewayInstance.handleLocationUpdate({ driverId: 'bad driver', lat: 91, lng: 0 } as any, client)).toEqual({ error: 'Invalid location data' });
    });

    it('publishes to rooms and queues undelivered unacknowledged messages', async () => {
      const server = {
        engine: { clientsCount: 1 },
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
        emit: jest.fn(),
      } as any;
      const gatewayInstance = new TrackingGateway(configService, {} as Repository<NotificationEntity>);
      gatewayInstance.server = server;
      (gatewayInstance as any).connectedClients = new Map([['driver-1', { id: 'driver-1', acknowledgedMessages: new Map([['msg-1', { id: 'msg-1', event: 'ping', data: {}, timestamp: new Date(), ack: false }]]) }]] as any);

      const published = await gatewayInstance.publishToRoom('kitchen:branch-1', { status: 'ready' });
      expect(server.to).toHaveBeenCalledWith('kitchen:branch-1');
      expect(published.status).toBe('sent');

      await gatewayInstance.requeueUndeliveredMessages('driver-1', ['msg-1']);
      expect(await gatewayInstance.getQueuedMessages('driver-1')).toHaveLength(1);
      expect(gatewayInstance.getNamespaceStats()).toEqual({ any: 1 });
    });
  });

  describe('OrderService edge paths', () => {
    const orderRepo = {
      findOne: jest.fn(),
      save: jest.fn((order: OrderModel) => order),
      manager: { transaction: jest.fn(async (cb: any) => cb(orderEntity({ id: 'order-1' }))) },
    } as any;
    const driverAssignmentRepo = { findOne: jest.fn(), save: jest.fn() } as unknown as Repository<DriverAssignmentEntity>;
    const driverRepo = { findOne: jest.fn() } as any;
    const userRepo = { findOne: jest.fn() } as any;
    const branchRepo = { findOne: jest.fn() } as any;

    it('rejects invalid order totals before placement', async () => {
      const service = new OrderService(
        orderRepo,
        driverAssignmentRepo,
        driverRepo,
        userRepo,
        branchRepo,
        paymentService as any,
        notificationService as any,
        retryService,
        idempotencyService as any,
        productionNotification as any,
        loggingService,
      );

      expect(() => service.validateOrderTotals({ grandTotal: 10, subtotal: 5, tax: 2, deliveryFee: 2 } as any)).toThrow(BadRequestException);
    });

    it('detects duplicate recent placed orders', async () => {
      const service = new OrderService(
        orderRepo,
        driverAssignmentRepo,
        driverRepo,
        userRepo,
        branchRepo,
        paymentService as any,
        notificationService as any,
        retryService,
        idempotencyService as any,
        productionNotification as any,
        loggingService,
      );
      orderRepo.findOne.mockResolvedValue(orderEntity({ userId: 'user-1', restaurantId: 'restaurant-1', status: OrderStatus.PLACED, createdAt: new Date() }));

      await expect(service.checkDuplicateOrder('user-1', 'restaurant-1', 'hash', 5)).resolves.toBe(true);
    });

    it('prevents driver cancellation when driver is not assigned', async () => {
      const service = new OrderService(
        orderRepo,
        driverAssignmentRepo,
        driverRepo,
        userRepo,
        branchRepo,
        paymentService as any,
        notificationService as any,
        retryService,
        idempotencyService as any,
        productionNotification as any,
        loggingService,
      );
      orderRepo.findOne.mockResolvedValue(orderEntity({ id: 'order-1', driverId: 'driver-2', status: OrderStatus.DRIVER_ASSIGNED }));

      await expect(service.cancelByDriver('order-1', 'driver-1')).rejects.toThrow(BadRequestException);
    });

    it('rejects partial refunds above remaining refundable amount', async () => {
      const service = new OrderService(
        orderRepo,
        driverAssignmentRepo,
        driverRepo,
        userRepo,
        branchRepo,
        paymentService as any,
        notificationService as any,
        retryService,
        idempotencyService as any,
        productionNotification as any,
        loggingService,
      );
      orderRepo.findOne.mockResolvedValue(orderEntity({ id: 'order-1', status: OrderStatus.DELIVERED, grandTotal: 100, refundedAmount: 80 }));

      await expect(service.partialRefund('order-1', 25, 'partial')).rejects.toThrow(BadRequestException);
    });
  });
});
