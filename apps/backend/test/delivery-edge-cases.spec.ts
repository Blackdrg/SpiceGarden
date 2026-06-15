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
});