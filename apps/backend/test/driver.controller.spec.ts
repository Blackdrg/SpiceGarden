import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDriverController } from '../src/controllers/driver.controller';
import { OrderEntity } from '../src/db/entities/order.entity';
import { DriverEntity } from '../src/db/entities/driver.entity';
import { DriverAssignmentEntity } from '../src/db/entities/driver-assignment.entity';
import { DriverIssueEntity } from '../src/db/entities/driver-issue.entity';
import { DataSource } from 'typeorm';
import { TrackingGateway } from '../src/infra/tracking/tracking.gateway';
import { NotificationService } from '../src/services/notifications/notification.service';
import { WalletService } from '../src/services/wallet/wallet.service';
import { OrderStatus } from '../src/shared/domain/order.interface';
import { UserRole } from '../src/shared/domain/user.interface';
import { VerifyOtpDto } from '../src/controllers/driver.dto';

describe('OrderDriverController', () => {
  let controller: OrderDriverController;
  let orderRepo: jest.Mocked<Repository<OrderEntity>>;
  let driverRepo: jest.Mocked<Repository<DriverEntity>>;
  let assignmentRepo: jest.Mocked<Repository<DriverAssignmentEntity>>;
  let issueRepo: jest.Mocked<Repository<DriverIssueEntity>>;
  let trackingGateway: jest.Mocked<TrackingGateway>;
  let notificationService: jest.Mocked<NotificationService>;
  let walletService: jest.Mocked<WalletService>;

  const mockDataSource = { manager: { transaction: jest.fn() } } as any;
  const mockAssignment = {
    id: 'assignment-1',
    order: {
      id: 'order-1',
      otpCode: '123456',
      paymentStatus: 'pending',
      paymentIntentId: 'cod_123',
      grandTotal: 500,
      userId: 'user-1',
    } as any,
  };

  beforeEach(async () => {
    orderRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as any;
    driverRepo = {
      findOne: jest.fn(),
    } as any;
    assignmentRepo = {
      findOne: jest.fn(),
    } as any;
    issueRepo = {
      findOne: jest.fn(),
    } as any;
    trackingGateway = {
      publishToRoom: jest.fn(),
      server: { emit: jest.fn() },
    } as any;
    notificationService = {
      notifyDeliveryLifecycle: jest.fn(),
      notifyOrderUpdate: jest.fn(),
    } as any;
    walletService = {
      confirmCODCollection: jest.fn(),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        { provide: getRepositoryToken(OrderEntity), useValue: orderRepo },
        { provide: getRepositoryToken(DriverEntity), useValue: driverRepo },
        { provide: getRepositoryToken(DriverAssignmentEntity), useValue: assignmentRepo },
        { provide: getRepositoryToken(DriverIssueEntity), useValue: issueRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: TrackingGateway, useValue: trackingGateway },
        { provide: NotificationService, useValue: notificationService },
        { provide: WalletService, useValue: walletService },
        OrderDriverController,
      ],
    }).compile();

    controller = module.get<OrderDriverController>(OrderDriverController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('verifyOTP', () => {
    it('should return invalid when assignment not found', async () => {
      assignmentRepo.findOne.mockResolvedValue(null as any);

      const result = await controller.verifyOTP('order-1', { otp: '123456' } as VerifyOtpDto, { user: { id: 'driver-1', role: UserRole.DELIVERY_PARTNER } } as any);

      expect(result.valid).toBe(false);
    });

    it('should return invalid when OTP does not match', async () => {
      assignmentRepo.findOne.mockResolvedValue(mockAssignment as any);

      const result = await controller.verifyOTP('order-1', { otp: '000000' } as VerifyOtpDto, { user: { id: 'driver-1', role: UserRole.DELIVERY_PARTNER } } as any);

      expect(result.valid).toBe(false);
    });

    it('should mark order delivered and confirm COD when OTP matches', async () => {
      assignmentRepo.findOne.mockResolvedValue(mockAssignment as any);
      orderRepo.update.mockResolvedValue({ affected: 1 } as any);
      walletService.confirmCODCollection.mockResolvedValue({} as any);

      const result = await controller.verifyOTP('order-1', { otp: '123456' } as VerifyOtpDto, { user: { id: 'driver-1', role: UserRole.DELIVERY_PARTNER } } as any);

      expect(result.valid).toBe(true);
      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(orderRepo.update).toHaveBeenCalledWith('order-1', {
        status: OrderStatus.DELIVERED,
        deliveredAt: expect.any(Date),
      });
      expect(walletService.confirmCODCollection).toHaveBeenCalledWith('order-1', 500, 'driver-1');
    });

    it('should emit WebSocket event when COD confirmation fails', async () => {
      assignmentRepo.findOne.mockResolvedValue(mockAssignment as any);
      orderRepo.update.mockResolvedValue({ affected: 1 } as any);
      walletService.confirmCODCollection.mockRejectedValue(new Error('Wallet error'));

      const result = await controller.verifyOTP('order-1', { otp: '123456' } as VerifyOtpDto, { user: { id: 'driver-1', role: UserRole.DELIVERY_PARTNER } } as any);

      expect(result.valid).toBe(true);
      expect(trackingGateway.server.emit).toHaveBeenCalledWith(
        'order.status',
        expect.objectContaining({
          orderId: 'order-1',
          status: OrderStatus.DELIVERED,
        })
      );
    });

    it('should skip COD confirmation for non-COD orders', async () => {
      const nonCodAssignment = {
        ...mockAssignment,
        order: { ...mockAssignment.order, paymentStatus: 'paid', paymentIntentId: 'pay_123' },
      };
      assignmentRepo.findOne.mockResolvedValue(nonCodAssignment as any);
      orderRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.verifyOTP('order-1', { otp: '123456' } as VerifyOtpDto, { user: { id: 'driver-1', role: UserRole.DELIVERY_PARTNER } } as any);

      expect(result.valid).toBe(true);
      expect(walletService.confirmCODCollection).not.toHaveBeenCalled();
    });
  });
});
