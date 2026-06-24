import { describe, expect, it, beforeEach } from '@jest/globals';
import { DispatchEngineService } from '../src/modules/driver-assignment/dispatch-engine.service';

function createService() {
  const manager = {
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    create: jest.fn((entity: any, partial: any) => ({ ...partial })),
    save: jest.fn((...args: any[]) => Promise.resolve({ id: 'saved-1', ...(args[1] || args[0]) })),
  };
  const dataSource = {
    transaction: jest.fn((cb: any) => cb(manager)),
  };

  const service = Object.create(DispatchEngineService.prototype) as DispatchEngineService;
  Object.assign(service, {
    driverRepo: { findOne: jest.fn(), find: jest.fn() },
    orderRepo: { findOne: jest.fn(), update: jest.fn() },
    assignmentRepo: { create: jest.fn(), save: jest.fn() },
    branchRepo: { findOne: jest.fn() },
    scoreRepo: { findOne: jest.fn() },
    slaRepo: { findOne: jest.fn() },
    fraudRepo: { findOne: jest.fn() },
    dataSource,
  });

  return { service, manager, dataSource };
}

describe('DispatchEngineService', () => {
  let mocks: ReturnType<typeof createService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mocks = createService();
  });

  it('dispatches an order to the optimal available driver', async () => {
    const order = { id: 'order-1', restaurantId: 'rest-1', status: 'placed' };
    const branch = { id: 'branch-1', restaurant: { id: 'rest-1' } };
    const driver = { id: 'driver-1', rating: 4.8, totalDeliveries: 200, averageSpeed: 30, fraudScore: 10 };

    mocks.manager.findOne.mockResolvedValueOnce(order).mockResolvedValueOnce(branch);
    mocks.manager.find.mockResolvedValue([driver]);

    const result = await mocks.service.dispatchOrder('order-1');

    expect(result).toBeDefined();
    expect(mocks.manager.update).toHaveBeenCalledWith(
      expect.any(Function),
      'order-1',
      expect.objectContaining({ driverId: 'driver-1', status: 'driver_assigned' })
    );
  });

  it('throws when order is not found for dispatch', async () => {
    mocks.manager.findOne.mockResolvedValueOnce(null);

    await expect(mocks.service.dispatchOrder('missing')).rejects.toThrow('Order not found');
  });

  it('throws when restaurant branch is not found', async () => {
    const order = { id: 'order-1', restaurantId: 'rest-1', status: 'placed' };
    mocks.manager.findOne.mockResolvedValueOnce(order).mockResolvedValueOnce(null);

    await expect(mocks.service.dispatchOrder('order-1')).rejects.toThrow('Restaurant branch not found');
  });

  it('throws when no available drivers found', async () => {
    const order = { id: 'order-1', restaurantId: 'rest-1', status: 'placed' };
    const branch = { id: 'branch-1', restaurant: { id: 'rest-1' } };
    mocks.manager.findOne.mockResolvedValueOnce(order).mockResolvedValueOnce(branch);
    mocks.manager.find.mockResolvedValue([]);

    await expect(mocks.service.dispatchOrder('order-1')).rejects.toThrow('No available drivers found');
  });

  it('selects best driver by highest score', async () => {
    const order = { id: 'order-1', restaurantId: 'rest-1', status: 'placed' };
    const branch = { id: 'branch-1', restaurant: { id: 'rest-1' } };
    const driverA = { id: 'd1', rating: 3, totalDeliveries: 10, averageSpeed: 40, fraudScore: 20 };
    const driverB = { id: 'd2', rating: 5, totalDeliveries: 500, averageSpeed: 30, fraudScore: 10 };

    mocks.manager.findOne.mockResolvedValueOnce(order).mockResolvedValueOnce(branch);
    mocks.manager.find.mockResolvedValue([driverA, driverB]);

    const result = await mocks.service.dispatchOrder('order-1');

    expect(result).toBeDefined();
    expect(mocks.manager.update).toHaveBeenCalledWith(
      expect.any(Function),
      'order-1',
      expect.objectContaining({ driverId: 'd2', status: 'driver_assigned' })
    );
  });

  it('finds optimal drivers filtering by online approved status', async () => {
    const order = { id: 'order-1', restaurantId: 'rest-1', status: 'placed' };
    const branch = { id: 'branch-1', restaurant: { id: 'rest-1' } };
    const driver = { id: 'd1', isOnline: true, kycStatus: 'approved', isFraudSuspicious: false };

    mocks.manager.findOne.mockResolvedValueOnce(order).mockResolvedValueOnce(branch);
    mocks.manager.find.mockResolvedValue([driver]);

    const result = await mocks.service.dispatchOrder('order-1');

    expect(result).toBeDefined();
    expect(mocks.manager.find).toHaveBeenCalledWith(
      expect.any(Function),
      { where: { isOnline: true, kycStatus: 'approved', isFraudSuspicious: false } }
    );
  });

  it('assigns batch delivery for multiple orders', async () => {
    const driver = { id: 'driver-1' };
    const order1 = { id: 'order-1', restaurantId: 'rest-1' };
    const order2 = { id: 'order-2', restaurantId: 'rest-1' };
    const branch = { id: 'branch-1', restaurant: { id: 'rest-1' } };

    mocks.manager.findOne.mockResolvedValueOnce(driver).mockResolvedValueOnce(branch);
    mocks.manager.find.mockResolvedValue([order1, order2]);

    const result = await mocks.service.assignBatchDelivery(['order-1', 'order-2'], 'driver-1');

    expect(result).toHaveLength(2);
    expect(mocks.manager.update).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      'order-1',
      expect.objectContaining({ driverId: 'driver-1', status: 'driver_assigned' })
    );
  });

  it('throws on batch delivery when some orders missing', async () => {
    const driver = { id: 'driver-1' };
    const order1 = { id: 'order-1', restaurantId: 'rest-1' };

    mocks.manager.findOne.mockResolvedValueOnce(driver).mockResolvedValueOnce({ restaurant: { id: 'rest-1' } });
    mocks.manager.find.mockResolvedValue([order1]);

    await expect(mocks.service.assignBatchDelivery(['order-1', 'order-missing'], 'driver-1')).rejects.toThrow(
      'Some orders not found'
    );
  });

  it('reassigns order to a new driver', async () => {
    const currentAssignment = {
      id: 'assign-1',
      driver: { id: 'driver-old' },
      order: { id: 'order-1' },
      branch: { id: 'branch-1' },
      assignmentType: 'single',
      distance: 5,
      estimatedTimeMinutes: 30,
      isPriority: false,
      retryCount: 0,
      status: 'assigned',
    };
    const newDriver = { id: 'driver-new' };

    mocks.manager.findOne.mockResolvedValueOnce(currentAssignment).mockResolvedValueOnce(newDriver);

    const result = await mocks.service.reassignOrder('assign-1', 'driver-new', 'Driver unavailable');

    expect(result).toBeDefined();
    expect(mocks.manager.save).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      expect.objectContaining({ status: 'reassigned', reassignedFrom: 'driver-old', retryCount: 1 })
    );
    expect(mocks.manager.update).toHaveBeenCalledWith(
      expect.any(Function),
      'order-1',
      { driverId: 'driver-new' }
    );
  });

  it('throws on reassign when current assignment missing', async () => {
    mocks.manager.findOne.mockResolvedValue(null);

    await expect(mocks.service.reassignOrder('missing', 'driver-new', 'reason')).rejects.toThrow(
      'Assignment not found'
    );
  });

  it('throws on reassign when new driver missing', async () => {
    const currentAssignment = {
      id: 'assign-1',
      driver: { id: 'driver-old' },
      order: { id: 'order-1' },
      branch: { id: 'branch-1' },
      assignmentType: 'single',
      distance: 5,
      estimatedTimeMinutes: 30,
      isPriority: false,
      retryCount: 0,
      status: 'assigned',
    };
    mocks.manager.findOne.mockResolvedValueOnce(currentAssignment).mockResolvedValueOnce(null);

    await expect(mocks.service.reassignOrder('assign-1', 'driver-new', 'reason')).rejects.toThrow(
      'New driver not found'
    );
  });
});
