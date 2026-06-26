import { Test, TestingModule } from '@nestjs/testing';
import { EnhancedDeliveryService } from '../src/services/delivery/enhanced-delivery.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../src/db/entities/driver.entity';
import { OrderEntity } from '../src/db/entities/order.entity';
import { BatchEntity } from '../src/db/entities/batch.entity';
import { DriverAssignmentEntity } from '../src/db/entities/driver-assignment.entity';
import { GeoService } from '../src/services/geo/geo.service';
import { OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';

describe('EnhancedDeliveryService Edge Cases', () => {
  let service: EnhancedDeliveryService;

  const mockDriverRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDriverQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(() => {
    mockDriverRepo.createQueryBuilder.mockReturnValue(mockDriverQueryBuilder);
  });

  const mockOrderRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockBatchRepo = {
    findOne: jest.fn(),
  };

  const mockDriverAssignmentRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };

  const mockGeoService = {
    calculateDistance: jest.fn().mockReturnValue(5),
    predictETA: jest.fn().mockReturnValue({ eta: 20, distance: 5, duration: 15 }),
  };

  const mockDataSource = {
    manager: {
      transaction: jest.fn((cb) => cb({
        update: jest.fn().mockResolvedValue(undefined),
        findOne: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({}),
        increment: jest.fn(),
      })),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnhancedDeliveryService,
        { provide: getRepositoryToken(DriverEntity), useValue: mockDriverRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: getRepositoryToken(BatchEntity), useValue: mockBatchRepo },
        { provide: getRepositoryToken(DriverAssignmentEntity), useValue: mockDriverAssignmentRepo },
        { provide: GeoService, useValue: mockGeoService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<EnhancedDeliveryService>(EnhancedDeliveryService);

    jest.clearAllMocks();
    mockDriverQueryBuilder.getMany.mockResolvedValue(undefined);
    mockGeoService.calculateDistance.mockReturnValue(5);
    mockGeoService.predictETA.mockReturnValue({ eta: 20, distance: 5, duration: 15 });
  });

  describe('detectFakeGPS', () => {
    it('should detect invalid GPS coordinates', () => {
      const result = service.detectFakeGPS('driver1', { lat: null, lng: null } as any, 30);
      expect(result.isFake).toBe(true);
      expect(result.reason).toContain('Invalid GPS coordinates');
    });

    it('should detect unrealistic speed', () => {
      const result = service.detectFakeGPS('driver1', { lat: 30.7, lng: 76.7 }, 200);
      expect(result.isFake).toBe(true);
      expect(result.reason).toContain('Unrealistic speed');
    });

    it('should detect GPS staleness with speed', () => {
      const staleLocation = {
        lat: 30.7,
        lng: 76.7,
        timestamp: (Date.now() - 60000).toString(),
      };
      
      const result = service.detectFakeGPS('driver1', staleLocation, 50);
      expect(result.isFake).toBe(true);
      expect(result.reason).toContain('GPS staleness');
    });

    it('should pass valid GPS data', () => {
      const validLocation = { lat: 30.7, lng: 76.7, timestamp: Date.now().toString() };
      const result = service.detectFakeGPS('driver1', validLocation, 50);
      expect(result.isFake).toBe(false);
    });
  });

  describe('verifyDriverLocation', () => {
    it('should return verified true for nearby location', async () => {
      const driver = {
        id: 'driver1',
        currentLocation: { lat: 30.7, lng: 76.7 },
        lastLocationUpdate: new Date(),
      } as DriverEntity;

      mockDriverRepo.findOne.mockResolvedValue(driver);
      mockGeoService.calculateDistance.mockReturnValue(0.5);

      const result = await service.verifyDriverLocation('driver1', { lat: 30.71, lng: 76.71 });
      expect(result.verified).toBe(true);
    });

    it('should flag distant location', async () => {
      const driver = {
        id: 'driver1',
        currentLocation: { lat: 30.7, lng: 76.7 },
        lastLocationUpdate: new Date(Date.now() - 5 * 60000),
      } as DriverEntity;

      mockDriverRepo.findOne.mockResolvedValue(driver);
      mockGeoService.calculateDistance.mockReturnValue(50);

      const result = await service.verifyDriverLocation('driver1', { lat: 30.71, lng: 76.71 });
      expect(result.verified).toBe(false);
    });
  });

  describe('detectRouteManipulation', () => {
    it('should detect suspicious route deviations', async () => {
      const assignment = {
        id: 'a1',
        routeData: {
          start: { lat: 30.7, lng: 76.7 },
          end: { lat: 30.8, lng: 76.8 },
          waypoints: [
            { lat: 30.7, lng: 76.7, timestamp: new Date(Date.now() - 30000) },
            { lat: 35.0, lng: 77.0, timestamp: new Date(Date.now() - 20000) },
            { lat: 30.8, lng: 76.8, timestamp: new Date() },
          ],
        },
        distance: 5,
      } as DriverAssignmentEntity;

      mockDriverAssignmentRepo.findOne.mockResolvedValue(assignment);
      mockGeoService.calculateDistance
        .mockImplementationOnce(() => 10)
        .mockImplementationOnce(() => 10)
        .mockReturnValue(5);

      const result = await service.detectRouteManipulation('a1');
      expect(result.suspicious).toBe(true);
    });

    it('should return not suspicious for normal route', async () => {
      const assignment = {
        id: 'a1',
        routeData: {
          start: { lat: 30.7, lng: 76.7 },
          end: { lat: 30.8, lng: 76.8 },
          waypoints: [
            { lat: 30.71, lng: 76.71, timestamp: new Date(Date.now() - 30000) },
            { lat: 30.75, lng: 76.75, timestamp: new Date(Date.now() - 20000) },
            { lat: 30.8, lng: 76.8, timestamp: new Date() },
          ],
        },
        distance: 5,
      } as DriverAssignmentEntity;

      mockDriverAssignmentRepo.findOne.mockResolvedValue(assignment);
      mockGeoService.calculateDistance
        .mockImplementationOnce(() => 2)
        .mockImplementationOnce(() => 2)
        .mockReturnValue(5);

      const result = await service.detectRouteManipulation('a1');
      expect(result.suspicious).toBe(false);
    });

    it('should return not suspicious when no waypoints', async () => {
      mockDriverAssignmentRepo.findOne.mockResolvedValue(null);

      const result = await service.detectRouteManipulation('a1');
      expect(result.suspicious).toBe(false);
    });
  });

  describe('handleDriverNoShowAutomatic', () => {
    it('should update driver flags and order status', async () => {
      const driver = {
        id: 'driver1',
        failureCount: 2,
        isFraudSuspicious: false,
        fraudFlags: {},
      } as DriverEntity;

      const order = { id: 'ord1', status: OrderStatus.PICKED_UP } as OrderEntity;

      mockDriverRepo.findOne.mockResolvedValue(driver);
      mockDriverAssignmentRepo.findOne.mockResolvedValue({ id: 'assign1' } as DriverAssignmentEntity);

      await service.handleDriverNoShowAutomatic('driver1', 'ord1', 'assign1');

      expect(mockDataSource.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('autoReassignOnNoShow', () => {
    it('should reassign order to available driver', async () => {
      const order = { id: 'ord1', status: OrderStatus.CANCELLED } as OrderEntity;

      mockOrderRepo.findOne.mockResolvedValue(order);
      mockDriverQueryBuilder.getMany.mockResolvedValue([
        { id: 'driver2', rating: 4.5, isFraudSuspicious: false } as DriverEntity,
      ]);

      const result = await service.autoReassignOnNoShow('ord1', 'driver1');
      expect(result).toBe(true);
    });

    it('should return false when order not in cancelled state', async () => {
      const order = { id: 'ord1', status: OrderStatus.ON_THE_WAY } as OrderEntity;
      
      mockOrderRepo.findOne.mockResolvedValue(order);

      const result = await service.autoReassignOnNoShow('ord1', 'driver1');
      expect(result).toBe(false);
    });
  });

  describe('registerDriver', () => {
    it('should register driver with pending KYC', async () => {
      mockDriverRepo.create.mockReturnValue({ id: 'driver1', userId: 'user1', kycStatus: 'pending' });
      mockDriverRepo.save.mockResolvedValue({ id: 'driver1', kycStatus: 'pending' });

      const result = await service.registerDriver('user1', { fullName: 'Test Driver' }) as any;

      expect(mockDriverRepo.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user1', kycStatus: 'pending' }));
      expect(result.kycStatus).toBe('pending');
    });
  });

  describe('updateLocation', () => {
    it('should update driver location and timestamp', async () => {
      mockDriverRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateLocation('driver1', 30.7, 76.8);

      expect(mockDriverRepo.update).toHaveBeenCalledWith('driver1', expect.objectContaining({
        currentLocation: { lat: 30.7, lng: 76.8 },
      }));
      expect(mockDriverRepo.update.mock.calls[0][1].lastLocationUpdate).toBeInstanceOf(Date);
    });
  });

  describe('findAvailableDrivers', () => {
    it('should query approved online drivers within radius', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'd1', rating: 4.8 }]),
      };
      mockDriverRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAvailableDrivers(30.7, 76.8, 5);

      expect(qb.andWhere).toHaveBeenCalledWith('driver.isFraudSuspicious = :suspicious', { suspicious: false });
      expect(result).toHaveLength(1);
    });
  });

  describe('assignOrderToDriver', () => {
    it('should assign order via transaction', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ id: 'ord1' } as OrderEntity);

      await service.assignOrderToDriver('ord1', 'driver1');

      expect(mockDataSource.manager.transaction).toHaveBeenCalled();
    });

    it('should throw when order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(service.assignOrderToDriver('ord1', 'missing')).rejects.toThrow('Order not found');
    });
  });

  describe('calculateTrafficAwareRoute', () => {
    it('should calculate route with normal traffic', () => {
      mockGeoService.calculateDistance.mockReturnValue(10);
      mockGeoService.predictETA.mockReturnValue({ distance: 10, duration: 20 });

      const result = service.calculateTrafficAwareRoute(
        { lat: 30.7, lng: 76.8 },
        { lat: 30.8, lng: 76.9 },
        30
      );

      expect(result.distance).toBe(10);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.eta).toBeGreaterThan(0);
      expect(result.trafficFactor).toBeGreaterThanOrEqual(0.5);
    });

    it('should apply rush hour traffic factor', () => {
      mockGeoService.calculateDistance.mockReturnValue(10);
      mockGeoService.predictETA.mockReturnValue({ distance: 10, duration: 20 });

      const result = service.calculateTrafficAwareRoute(
        { lat: 30.7, lng: 76.8 },
        { lat: 30.8, lng: 76.9 }
      );

      const hour = new Date().getHours();
      if (hour >= 7 && hour <= 9) {
        expect(result.trafficFactor).toBeGreaterThanOrEqual(1.5);
      }
    });
  });

  describe('getSurgeMultiplier', () => {
    it('should return 1.0 when no active surge zones', () => {
      mockGeoService.calculateDistance.mockReturnValue(100);

      const result = service.getSurgeMultiplier({ lat: 0, lng: 0 });

      expect(result).toBe(1.0);
    });
  });

  describe('calculateSurgeForOrder', () => {
    it('should return max of surge and time factor', async () => {
      mockGeoService.calculateDistance.mockReturnValue(0);

      const result = await service.calculateSurgeForOrder('ord1', { lat: 30.7333, lng: 76.7794 });

      const hour = new Date().getHours();
      const timeSurge = service.getTimeOfDayTrafficFactor();
      expect(result).toBeGreaterThanOrEqual(timeSurge);
    });
  });

  describe('handleFailedDelivery', () => {
    it('should cancel order and update driver failure count', async () => {
      const driver = { id: 'driver1', failureCount: 1, isFraudSuspicious: false };
      const order = { id: 'ord1', status: OrderStatus.DRIVER_ASSIGNED } as OrderEntity;
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockDriverRepo.findOne.mockResolvedValue(driver);
      mockDriverAssignmentRepo.find.mockResolvedValue([]);

      await service.handleFailedDelivery('ord1', 'driver1', 'no_show');

      expect(mockDataSource.manager.transaction).toHaveBeenCalled();
    });

    it('should not flag driver for customer_unavailable', async () => {
      const driver = { id: 'driver1', failureCount: 1, isFraudSuspicious: false };
      const order = { id: 'ord1', status: OrderStatus.DRIVER_ASSIGNED } as OrderEntity;
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockDriverRepo.findOne.mockResolvedValue(driver);
      mockDriverAssignmentRepo.find.mockResolvedValue([]);

      await service.handleFailedDelivery('ord1', 'driver1', 'customer_unavailable', 'customer_unavailable');

      expect(mockDataSource.manager.transaction).toHaveBeenCalled();
    });
  });

  describe('reassignOrder', () => {
    it('should find best driver and reassign', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ id: 'ord1' } as OrderEntity);
      mockDriverQueryBuilder.getMany.mockResolvedValue([
        { id: 'd1', rating: 3.5, isFraudSuspicious: false } as DriverEntity,
        { id: 'd2', rating: 4.8, isFraudSuspicious: false } as DriverEntity,
      ]);

      const result = await service.reassignOrder(30.7, 76.8, 'ord1');

      expect(result).toBe(true);
    });

    it('should return false when no available drivers', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ id: 'ord1' } as OrderEntity);
      mockDriverQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.reassignOrder(30.7, 76.8, 'ord1');

      expect(result).toBe(false);
    });
  });

  describe('validateGeoFence', () => {
    it('should return true when driver is within geofence', async () => {
      const driver = { id: 'd1', currentLocation: { lat: 30.7, lng: 76.8 } } as DriverEntity;
      mockDriverRepo.findOne.mockResolvedValue(driver);
      mockGeoService.calculateDistance.mockReturnValue(0.5);

      const result = await service.validateGeoFence('d1', 30.7, 76.8, 1);

      expect(result).toBe(true);
    });

    it('should return false when driver is outside geofence', async () => {
      const driver = { id: 'd1', currentLocation: { lat: 30.7, lng: 76.8 } } as DriverEntity;
      mockDriverRepo.findOne.mockResolvedValue(driver);
      mockGeoService.calculateDistance.mockReturnValue(10);

      const result = await service.validateGeoFence('d1', 30.7, 76.8, 1);

      expect(result).toBe(false);
    });

    it('should return false when driver location unavailable', async () => {
      mockDriverRepo.findOne.mockResolvedValue({ id: 'd1' } as DriverEntity);

      const result = await service.validateGeoFence('d1', 30.7, 76.8, 1);

      expect(result).toBe(false);
    });
  });

  describe('rerouteDriver', () => {
    it('should update assignment status when assignment exists', async () => {
      mockDriverAssignmentRepo.findOne.mockResolvedValue({ id: 'a1' } as DriverAssignmentEntity);
      mockGeoService.calculateDistance.mockReturnValue(5);
      mockDriverAssignmentRepo.update.mockResolvedValue({});

      await service.rerouteDriver('driver1', 'ord1', { lat: 30.8, lng: 76.9 }, 'traffic');

      expect(mockDriverAssignmentRepo.update).toHaveBeenCalledWith('a1', { status: 'assigned' });
    });

    it('should do nothing when assignment not found', async () => {
      mockDriverAssignmentRepo.findOne.mockResolvedValue(null);

      await service.rerouteDriver('driver1', 'ord1', { lat: 30.8, lng: 76.9 }, 'traffic');

      expect(mockDriverAssignmentRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('handleDriverNoShow', () => {
    it('should flag driver after 2 recent no-shows', async () => {
      const driver = {
        id: 'd1',
        failureCount: 2,
        isFraudSuspicious: false,
        fraudFlags: {},
      } as DriverEntity;
      const assignments = [
        { id: 'a1', status: 'failed', failureReason: 'no_show' },
        { id: 'a2', status: 'failed', failureReason: 'no_show' },
      ] as any[];

      mockDriverRepo.findOne.mockResolvedValue(driver);
      mockDriverAssignmentRepo.find.mockResolvedValue(assignments);
      mockDriverRepo.update.mockResolvedValue({});

      await (service as any).handleDriverNoShow('d1');

      expect(mockDriverRepo.update).toHaveBeenCalledWith('d1', expect.objectContaining({ isFraudSuspicious: true }));
    });
  });

  describe('calculateDeliveryIncentives', () => {
    it('should calculate incentive based on completed deliveries', async () => {
      const driver = { id: 'd1', rating: 4.5 } as DriverEntity;
      mockDriverRepo.findOne.mockResolvedValue(driver);
      mockDriverAssignmentRepo.count.mockResolvedValue(5);

      const result = await service.calculateDeliveryIncentives('d1');

      expect(result.totalIncentive).toBe(75);
      expect(result.breakdown.on_time_bonus).toBe(75);
    });

    it('should return zero for missing driver', async () => {
      mockDriverRepo.findOne.mockResolvedValue(null);

      const result = await service.calculateDeliveryIncentives('missing');

      expect(result.totalIncentive).toBe(0);
      expect(result.breakdown).toEqual({});
    });
  });

  describe('getSurgeMultiplier - active zone', () => {
    it('should return surge multiplier when in active surge zone', () => {
      const zone = { active: true, center: { lat: 0, lng: 0 }, radiusKm: 5, surgeMultiplier: 2.5 };
      (service as any).surgeZones = new Map([['zone1', zone]]);
      mockGeoService.calculateDistance.mockReturnValue(3);

      const result = service.getSurgeMultiplier({ lat: 0, lng: 0 });

      expect(result).toBe(2.5);
    });
  });

  describe('handleFailedDelivery - missing order', () => {
    it('should throw when order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(service.handleFailedDelivery('missing', 'driver1', 'no_show')).rejects.toThrow('Order not found');
    });
  });

  describe('detectFakeGPS - non-finite coordinates', () => {
    it('should detect non-finite GPS coordinates', () => {
      const result = service.detectFakeGPS('driver1', { lat: NaN, lng: 76.7 } as any, 50);
      expect(result.isFake).toBe(true);
      expect(result.reason).toContain('Invalid GPS coordinates');
    });
  });

  describe('verifyDriverLocation - no current location', () => {
    it('should return false when driver has no current location', async () => {
      const driver = { id: 'd1', currentLocation: undefined } as unknown as DriverEntity;
      mockDriverRepo.findOne.mockResolvedValue(driver);

      const result = await service.verifyDriverLocation('d1', { lat: 30.7, lng: 76.8 });

      expect(result.verified).toBe(false);
      expect(result.reason).toBe('Driver location unavailable');
    });
  });
});