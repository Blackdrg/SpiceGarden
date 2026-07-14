import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ETAIntelligenceService } from '../src/modules/driver-assignment/eta-intelligence.service';
import { DriverEntity } from '../src/db/entities/driver.entity';
import { OrderEntity } from '../src/db/entities/order.entity';
import { RestaurantBranchEntity } from '../src/db/entities/restaurant-branch.entity';
import { DriverAssignmentEntity } from '../src/db/entities/driver-assignment.entity';
import { DeliverySLAEntity } from '../src/db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../src/db/entities/driver-fraud.entity';

describe('ETAIntelligenceService', () => {
  let service: ETAIntelligenceService;
  let orderRepo: Repository<OrderEntity>;
  let driverRepo: Repository<DriverEntity>;
  let branchRepo: Repository<RestaurantBranchEntity>;
  let assignmentRepo: Repository<DriverAssignmentEntity>;

  const driver = { id: 'd1', totalDeliveries: 50, averageSpeed: 25, currentLocation: { lat: 12.9, lng: 77.6 } } as DriverEntity;
  const branch = { id: 'b1', restaurant: { id: 'r1' }, location: { lat: 12.95, lng: 77.65 } } as RestaurantBranchEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ETAIntelligenceService,
        { provide: getRepositoryToken(DriverEntity), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(OrderEntity), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(RestaurantBranchEntity), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(DriverAssignmentEntity), useValue: { find: jest.fn() } },
        { provide: getRepositoryToken(DeliverySLAEntity), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(DriverFraudEntity), useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get<ETAIntelligenceService>(ETAIntelligenceService);
    orderRepo = module.get<Repository<OrderEntity>>(getRepositoryToken(OrderEntity));
    driverRepo = module.get<Repository<DriverEntity>>(getRepositoryToken(DriverEntity));
    branchRepo = module.get<Repository<RestaurantBranchEntity>>(getRepositoryToken(RestaurantBranchEntity));
    assignmentRepo = module.get<Repository<DriverAssignmentEntity>>(getRepositoryToken(DriverAssignmentEntity));
  });

  it('throws when required data is missing', async () => {
    jest.spyOn(orderRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(driverRepo, 'findOne').mockResolvedValue(driver);
    jest.spyOn(branchRepo, 'findOne').mockResolvedValue(branch);
    await expect(service.calculateETA('o1', 'd1')).rejects.toThrow('Required data not found for ETA calculation');
  });

  it('calculates ETA with low recent-assignment confidence', async () => {
    const order = { id: 'o1', restaurantId: 'r1' } as OrderEntity;
    jest.spyOn(orderRepo, 'findOne').mockResolvedValue(order);
    jest.spyOn(driverRepo, 'findOne').mockResolvedValue(driver);
    jest.spyOn(branchRepo, 'findOne').mockResolvedValue(branch);
    jest.spyOn(assignmentRepo, 'find').mockResolvedValue([]);

    const result = await service.calculateETA('o1', 'd1');
    expect(result.etaMinutes).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(0.95);
    expect(result.factors.distance).toBeGreaterThan(0);
  });

  it('calculateDistance falls back to 5km when locations missing', async () => {
    const order = { id: 'o1', restaurantId: 'r1' } as OrderEntity;
    const noLocDriver = { id: 'd1', totalDeliveries: 50, averageSpeed: 25 } as DriverEntity;
    const noLocBranch = { id: 'b1', restaurant: { id: 'r1' } } as RestaurantBranchEntity;
    jest.spyOn(orderRepo, 'findOne').mockResolvedValue(order);
    jest.spyOn(driverRepo, 'findOne').mockResolvedValue(noLocDriver);
    jest.spyOn(branchRepo, 'findOne').mockResolvedValue(noLocBranch);
    jest.spyOn(assignmentRepo, 'find').mockResolvedValue([]);

    const result = await service.calculateETA('o1', 'd1');
    expect(result.factors.distance).toBe(5.0);
  });

  it('updateETARegionalTime returns a fixed estimate', async () => {
    const result = await service.updateETARegionalTime('a1', { lat: 1, lng: 2 });
    expect(result.etaMinutes).toBe(15);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('getHistoricalETAAccuracy returns summary stats', async () => {
    const result = await service.getHistoricalETAAccuracy('d1', 'b1', 7);
    expect(result.accuracyPercentage).toBe(85);
  });
});
