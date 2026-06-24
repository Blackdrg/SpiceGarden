import { Test, TestingModule } from '@nestjs/testing';
import { ETAIntelligenceService } from '../src/modules/driver-assignment/eta-intelligence.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DriverEntity } from '../src/db/entities/driver.entity';
import { OrderEntity } from '../src/db/entities/order.entity';
import { RestaurantBranchEntity } from '../src/db/entities/restaurant-branch.entity';
import { DriverAssignmentEntity } from '../src/db/entities/driver-assignment.entity';
import { DeliverySLAEntity } from '../src/db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../src/db/entities/driver-fraud.entity';

describe('ETAIntelligenceService', () => {
  let service: ETAIntelligenceService;

  const mockDriverRepo = { findOne: jest.fn() } as any;
  const mockOrderRepo = { findOne: jest.fn() } as any;
  const mockBranchRepo = { findOne: jest.fn() } as any;
  const mockAssignmentRepo = { find: jest.fn() } as any;
  const mockSlaRepo = { findOne: jest.fn() } as any;
  const mockFraudRepo = { findOne: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ETAIntelligenceService,
        { provide: getRepositoryToken(DriverEntity), useValue: mockDriverRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: getRepositoryToken(RestaurantBranchEntity), useValue: mockBranchRepo },
        { provide: getRepositoryToken(DriverAssignmentEntity), useValue: mockAssignmentRepo },
        { provide: getRepositoryToken(DeliverySLAEntity), useValue: mockSlaRepo },
        { provide: getRepositoryToken(DriverFraudEntity), useValue: mockFraudRepo },
      ],
    }).compile();

    service = module.get(ETAIntelligenceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateETARegionalTime', () => {
    it('should return ETA update with valid structure', async () => {
      const result = await service.updateETARegionalTime('assignment-1', { lat: 12.97, lng: 77.59 });
      expect(result.etaMinutes).toBeGreaterThan(0);
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getHistoricalETAAccuracy', () => {
    it('should return accuracy stats', async () => {
      const result = await service.getHistoricalETAAccuracy('driver-1', 'branch-1', 7);
      expect(result.averageErrorMinutes).toBeGreaterThanOrEqual(0);
      expect(result.accuracyPercentage).toBeGreaterThanOrEqual(0);
      expect(result.accuracyPercentage).toBeLessThanOrEqual(100);
    });

    it('should return defaults without params', async () => {
      const result = await service.getHistoricalETAAccuracy();
      expect(result.averageErrorMinutes).toBe(3);
      expect(result.accuracyPercentage).toBe(85);
    });
  });

  describe('calculateETA', () => {
    const mockOrder = {
      id: 'order-1',
      deliveryAddressId: 'addr-1',
      restaurantId: 'rest-1',
    } as OrderEntity;

    const mockDriver = {
      id: 'driver-1',
      totalDeliveries: 50,
      averageSpeed: 25,
      isAvailable: true,
    } as DriverEntity;

    const mockBranch = {
      id: 'branch-1',
      isOnline: true,
    } as RestaurantBranchEntity;

    it('should throw if required data is missing', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(service.calculateETA('order-1', 'driver-1')).rejects.toThrow('Required data not found');
    });

    it('should return ETA with all factors', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      mockDriverRepo.findOne.mockResolvedValue(mockDriver);
      mockBranchRepo.findOne.mockResolvedValue(mockBranch);
      mockAssignmentRepo.find.mockResolvedValue([]);

      const result = await service.calculateETA('order-1', 'driver-1');
      expect(result.etaMinutes).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0.3);
      expect(result.confidence).toBeLessThanOrEqual(0.95);
      expect(result.factors.distance).toBe(5);
      expect(result.factors.timeOfDay).toBeGreaterThanOrEqual(0);
      expect(result.factors.timeOfDay).toBeLessThanOrEqual(23);
    });

    it('should include driver experience in factors', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      mockDriverRepo.findOne.mockResolvedValue(mockDriver);
      mockBranchRepo.findOne.mockResolvedValue(mockBranch);
      mockAssignmentRepo.find.mockResolvedValue([]);

      const result = await service.calculateETA('order-1', 'driver-1');
      expect(result.factors.driverExperience).toBe(50);
    });

    it('should reduce confidence with insufficient historical data', async () => {
      const experiencedDriver = { ...mockDriver, totalDeliveries: 10 };
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      mockDriverRepo.findOne.mockResolvedValue(experiencedDriver);
      mockBranchRepo.findOne.mockResolvedValue(mockBranch);
      mockAssignmentRepo.find.mockResolvedValue([]);

      const result = await service.calculateETA('order-1', 'driver-1');
      expect(result.confidence).toBeLessThanOrEqual(0.85);
    });

    it('should apply rush hour multiplier during peak hours', async () => {
      const originalHour = new Date().getHours();
      const rushHour = originalHour >= 7 && originalHour <= 9 || originalHour >= 11 && originalHour <= 14 || originalHour >= 18 && originalHour <= 20;

      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      mockDriverRepo.findOne.mockResolvedValue(mockDriver);
      mockBranchRepo.findOne.mockResolvedValue(mockBranch);
      mockAssignmentRepo.find.mockResolvedValue([]);

      const result = await service.calculateETA('order-1', 'driver-1');
      if (rushHour) {
        expect(result.etaMinutes).toBeGreaterThan(10);
      }
    });
  });
});
