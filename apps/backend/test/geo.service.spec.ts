import { Test, TestingModule } from '@nestjs/testing';
import { GeoService } from '../src/services/geo/geo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RestaurantEntity } from '../src/db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../src/db/entities/restaurant-branch.entity';
import { DriverEntity } from '../src/db/entities/driver.entity';
import { OrderEntity } from '../src/db/entities/order.entity';

describe('GeoService', () => {
  let service: GeoService;

  const mockBranchRepo = {
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
  } as unknown as Repository<any>;

  const mockQb = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
  };

  const mockRestaurantRepo = {} as Repository<any>;
  const mockDriverRepo = {} as Repository<any>;
  const mockOrderRepo = {} as Repository<any>;
  const mockDataSource = {} as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeoService,
        { provide: getRepositoryToken(RestaurantEntity), useValue: mockRestaurantRepo },
        { provide: getRepositoryToken(RestaurantBranchEntity), useValue: mockBranchRepo },
        { provide: getRepositoryToken(DriverEntity), useValue: mockDriverRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get(GeoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateDistance', () => {
    it('should return 0 for same point', () => {
      const point = { lat: 12.9716, lng: 77.5946 };
      expect(service.calculateDistance(point, point)).toBeCloseTo(0, 5);
    });

    it('should calculate distance between two points', () => {
      const p1 = { lat: 12.9716, lng: 77.5946 };
      const p2 = { lat: 28.7041, lng: 77.1025 };
      const dist = service.calculateDistance(p1, p2);
      expect(dist).toBeGreaterThan(1500);
      expect(dist).toBeLessThan(2000);
    });

    it('should be symmetric', () => {
      const p1 = { lat: 40.7128, lng: -74.006 };
      const p2 = { lat: 51.5074, lng: -0.1278 };
      expect(service.calculateDistance(p1, p2)).toBeCloseTo(service.calculateDistance(p2, p1), 5);
    });
  });

  describe('predictETA', () => {
    it('should calculate ETA for 10km', () => {
      const result = service.predictETA(10);
      expect(result.eta).toBeGreaterThan(0);
      expect(result.distance).toBe(10);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should apply 20% buffer', () => {
      const result = service.predictETA(30, 30);
      const raw = (30 / 30) * 60;
      const expected = Math.ceil(raw + raw * 0.2);
      expect(result.eta).toBe(expected);
    });

    it('should use custom speed', () => {
      const result = service.predictETA(60, 60);
      const raw = (60 / 60) * 60;
      expect(result.duration).toBeCloseTo(Math.ceil(raw), 0);
    });
  });

  describe('findNearestBranchForOrder', () => {
    it('should return null if no branches', async () => {
      mockBranchRepo.find = jest.fn().mockResolvedValue([]);
      const result = await service.findNearestBranchForOrder('r1', { lat: 12.97, lng: 77.59 });
      expect(result).toBeNull();
    });

    it('should return nearest branch', async () => {
      const branches = [
        { id: 'b1', location: { lat: 12.98, lng: 77.60 } },
        { id: 'b2', location: { lat: 13.00, lng: 77.70 } },
      ];
      mockBranchRepo.find = jest.fn().mockResolvedValue(branches);
      const result = await service.findNearestBranchForOrder('r1', { lat: 12.97, lng: 77.59 });
      expect(result).toBeDefined();
      expect(result!.id).toBe('b1');
    });
  });

  describe('findNearbyBranches', () => {
    it('should return branches within radius', async () => {
      mockBranchRepo.createQueryBuilder = jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { branch: { id: 'b1' }, distance: 2000 },
          { branch: { id: 'b2' }, distance: 5000 },
        ]),
      })) as any;

      const result = await service.findNearbyBranches({ lat: 12.97, lng: 77.59 }, 5, 10);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('b1');
      expect(result[0].distance).toBe(2);
    });

    it('should apply custom radius and limit', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockBranchRepo.createQueryBuilder = jest.fn(() => qb) as any;

      await service.findNearbyBranches({ lat: 12.97, lng: 77.59 }, 10, 5);

      expect(qb.limit).toHaveBeenCalledWith(5);
    });

    it('should return empty array when no branches match', async () => {
      mockBranchRepo.createQueryBuilder = jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      })) as any;

      const result = await service.findNearbyBranches({ lat: 12.97, lng: 77.59 });
      expect(result).toEqual([]);
    });
  });

  describe('findAvailableDrivers', () => {
    it('should return drivers within radius', async () => {
      mockDriverRepo.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { driver: { id: 'd1', driverId: 'DRV-1' } },
          { driver: { id: 'd2', driverId: 'DRV-2' } },
        ]),
      })) as any;

      const result = await service.findAvailableDrivers({ lat: 12.97, lng: 77.59 }, 5, 10);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('d1');
    });

    it('should return empty array when no drivers match', async () => {
      mockDriverRepo.createQueryBuilder = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      })) as any;

      const result = await service.findAvailableDrivers({ lat: 12.97, lng: 77.59 });
      expect(result).toEqual([]);
    });

    it('should apply custom radius and limit', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockDriverRepo.createQueryBuilder = jest.fn(() => qb) as any;

      await service.findAvailableDrivers({ lat: 12.97, lng: 77.59 }, 8, 15);

      expect(qb.limit).toHaveBeenCalledWith(15);
    });
  });

  describe('calculateDeliveryRoute', () => {
    it('should return ETA prediction', async () => {
      const result = await service.calculateDeliveryRoute(
        { lat: 12.9716, lng: 77.5946 },
        { lat: 12.9800, lng: 77.6000 },
      );
      expect(result.eta).toBeGreaterThan(0);
      expect(result.distance).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });
  });
});
