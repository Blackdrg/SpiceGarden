import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DispatchEngineService } from '../src/modules/driver-assignment/dispatch-engine.service';
import { DriverEntity } from '../src/db/entities/driver.entity';
import { OrderEntity } from '../src/db/entities/order.entity';
import { RestaurantBranchEntity } from '../src/db/entities/restaurant-branch.entity';
import { DriverAssignmentEntity } from '../src/db/entities/driver-assignment.entity';
import { DeliverySLAEntity } from '../src/db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../src/db/entities/driver-fraud.entity';
import { DriverScoreEntity } from '../src/db/entities/driver-score.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

function makeManager(overrides: Record<string, any> = {}) {
  const manager = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((_e: any, o: any) => o),
    save: jest.fn(async (_e: any, o: any) => o),
    update: jest.fn(),
    ...overrides,
  };
  return manager;
}

describe('DispatchEngineService', () => {
  let service: DispatchEngineService;
  let dataSource: DataSource;
  let orderRepo: Repository<OrderEntity>;
  let driverRepo: Repository<DriverEntity>;
  let branchRepo: Repository<RestaurantBranchEntity>;
  let assignmentRepo: Repository<DriverAssignmentEntity>;
  let slaRepo: Repository<DeliverySLAEntity>;
  let fraudRepo: Repository<DriverFraudEntity>;

  const driver = { id: 'd1', rating: 4.5, fraudScore: 0, totalDeliveries: 100, averageSpeed: 25, currentLocation: { lat: 12.9, lng: 77.6 }, isOnline: true, kycStatus: 'approved', isFraudSuspicious: false } as DriverEntity;
  const branch = { id: 'b1', restaurant: { id: 'r1' }, location: { lat: 12.95, lng: 77.65 } } as RestaurantBranchEntity;
  const order = { id: 'o1', restaurantId: 'r1' } as OrderEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchEngineService,
        { provide: getRepositoryToken(DriverEntity), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(OrderEntity), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(RestaurantBranchEntity), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(DriverAssignmentEntity), useValue: { findOne: jest.fn(), find: jest.fn() } },
        { provide: getRepositoryToken(DeliverySLAEntity), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(DriverFraudEntity), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(DriverScoreEntity), useValue: { findOne: jest.fn() } },
        { provide: getDataSourceToken(), useValue: { transaction: jest.fn() } },
      ],
    }).compile();

    service = module.get<DispatchEngineService>(DispatchEngineService);
    dataSource = module.get<DataSource>(getDataSourceToken());
    orderRepo = module.get<Repository<OrderEntity>>(getRepositoryToken(OrderEntity));
    driverRepo = module.get<Repository<DriverEntity>>(getRepositoryToken(DriverEntity));
    branchRepo = module.get<Repository<RestaurantBranchEntity>>(getRepositoryToken(RestaurantBranchEntity));
    assignmentRepo = module.get<Repository<DriverAssignmentEntity>>(getRepositoryToken(DriverAssignmentEntity));
    slaRepo = module.get<Repository<DeliverySLAEntity>>(getRepositoryToken(DeliverySLAEntity));
    fraudRepo = module.get<Repository<DriverFraudEntity>>(getRepositoryToken(DriverFraudEntity));
  });

  function setupDispatch(orderVal: any, branchVal: any, drivers: any[]) {
    const manager = makeManager();
    manager.findOne.mockImplementation(async (entity: any) => {
      if (entity?.name === 'OrderEntity') return orderVal;
      if (entity?.name === 'RestaurantBranchEntity') return branchVal;
      if (entity?.name === 'DriverEntity') return drivers[0];
      return null;
    });
    manager.find.mockResolvedValue(drivers);
    (dataSource.transaction as jest.Mock).mockImplementation(async (cb: any) => cb(manager));
    return manager;
  }

  it('dispatches an order to the best available driver', async () => {
    setupDispatch(order, branch, [driver]);
    const assignment = await service.dispatchOrder('o1');
    expect(assignment.status).toBe('assigned');
    expect(assignment.driver.id).toBe('d1');
  });

  it('throws when order not found', async () => {
    setupDispatch(null, branch, [driver]);
    await expect(service.dispatchOrder('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when restaurant branch not found', async () => {
    setupDispatch(order, null, [driver]);
    await expect(service.dispatchOrder('o1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when no available drivers found', async () => {
    setupDispatch(order, branch, []);
    await expect(service.dispatchOrder('o1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('dispatches a batch delivery', async () => {
    const manager = makeManager();
    manager.findOne.mockImplementation(async (entity: any) => {
      if (entity?.name === 'DriverEntity') return driver;
      if (entity?.name === 'RestaurantBranchEntity') return branch;
      return null;
    });
    manager.find.mockResolvedValue([order]);
    (dataSource.transaction as jest.Mock).mockImplementation(async (cb: any) => cb(manager));

    const assignments = await service.assignBatchDelivery(['o1'], 'd1');
    expect(assignments.length).toBe(1);
    expect(assignments[0].assignmentType).toBe('batch');
  });

  it('reassigns an order to a new driver', async () => {
    const currentAssignment = { id: 'a1', driver: { id: 'd1' }, order, branch, assignmentType: 'single', distance: 3, estimatedTimeMinutes: 10, isPriority: false, status: 'assigned' };
    const manager = makeManager();
    manager.findOne.mockImplementation(async (entity: any, options: any) => {
      if (entity?.name === 'DriverAssignmentEntity') return currentAssignment;
      if (entity?.name === 'DriverEntity') return driver;
      return null;
    });
    (dataSource.transaction as jest.Mock).mockImplementation(async (cb: any) => cb(manager));

    const result = await service.reassignOrder('a1', 'd1', 'timeout');
    expect(result.status).toBe('assigned');
    expect(result.driver.id).toBe('d1');
    expect(currentAssignment.status).toBe('reassigned');
  });
});
