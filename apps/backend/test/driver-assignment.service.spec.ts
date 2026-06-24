import { describe, expect, it, beforeEach } from '@jest/globals';
import { DriverAssignmentService } from '../src/modules/driver-assignment/driver-assignment.service';

function createService() {
  const driverRepo = { findOne: jest.fn(), update: jest.fn() };
  const orderRepo = { findOne: jest.fn() };
  const assignmentRepo = { findOne: jest.fn(), find: jest.fn(), count: jest.fn(), save: jest.fn() };
  const branchRepo = { findOne: jest.fn() };
  const scoreRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const slaRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn() };
  const fraudRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn() };
  const dataSource = { manager: { transaction: jest.fn() } };
  const dispatchEngine = { dispatchOrder: jest.fn(), assignBatchDelivery: jest.fn(), reassignOrder: jest.fn() };
  const etaIntelligence = { estimateETA: jest.fn() };

  const service = Object.create(DriverAssignmentService.prototype) as DriverAssignmentService;
  Object.assign(service, {
    driverRepo,
    orderRepo,
    assignmentRepo,
    branchRepo,
    scoreRepo,
    slaRepo,
    fraudRepo,
    dataSource,
    dispatchEngine,
    etaIntelligence,
  });

  return { service, driverRepo, orderRepo, assignmentRepo, branchRepo, scoreRepo, slaRepo, fraudRepo, dispatchEngine };
}

describe('DriverAssignmentService dispatch and fraud controls', () => {
  let mocks: ReturnType<typeof createService>;

  beforeEach(() => {
    mocks = createService();
  });

  it('delegates order assignment to the dispatch engine', async () => {
    const assignment = { id: 'assignment-1', status: 'assigned' };
    mocks.dispatchEngine.dispatchOrder.mockResolvedValue(assignment);

    await expect(mocks.service.assignDriverToOrder('order-1')).resolves.toBe(assignment);
    expect(mocks.dispatchEngine.dispatchOrder).toHaveBeenCalledWith('order-1');
  });

  it('calculates weighted driver score from recent deliveries', async () => {
    const driver = { id: 'driver-1', rating: 4.5, totalDeliveries: 120, totalDistance: 1200, averageSpeed: 32 };
    const assignments = [
      { id: 'a1', status: 'delivered', actualTimeMinutes: 25, estimatedTimeMinutes: 30 },
      { id: 'a2', status: 'delivered', actualTimeMinutes: 40, estimatedTimeMinutes: 30 },
    ];

    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.assignmentRepo.find.mockResolvedValue(assignments);
    mocks.assignmentRepo.count.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    mocks.scoreRepo.findOne.mockResolvedValue(null);
    mocks.scoreRepo.create.mockReturnValue({ driver });
    mocks.scoreRepo.save.mockResolvedValue({ driver, overallScore: 3.55 });

    const result = await mocks.service.updateDriverScore('driver-1');

    expect(result.overallScore).toBe(3.55);
    expect(mocks.scoreRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      driver,
      overallScore: 3.55,
      onTimeDeliveryRate: 50,
      acceptanceRate: 95,
      cancellationRate: 50,
      customerRating: 4.5,
    }));
  });

  it('records fraud incidents and updates suspicious driver flags', async () => {
    const driver = { id: 'driver-1', fraudScore: 10, isFraudSuspicious: false };
    const order = { id: 'order-1' };
    const branch = { id: 'branch-1' };
    const fraud = { id: 'fraud-1' };

    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.branchRepo.findOne.mockResolvedValue(branch);
    mocks.fraudRepo.create.mockReturnValue(fraud);
    mocks.fraudRepo.save.mockResolvedValue(fraud);
    mocks.driverRepo.update.mockResolvedValue({ affected: 1 });

    const result = await mocks.service.recordFraudIncident('driver-1', 'order-1', 'branch-1', 'fake_delivery', { note: 'test' }, 'high');

    expect(result).toBe(fraud);
    expect(mocks.driverRepo.update).toHaveBeenCalledWith('driver-1', expect.objectContaining({
      fraudScore: 55,
      isFraudSuspicious: false,
      lastFraudCheck: expect.any(Date),
    }));
  });

  it('marks drivers suspicious when fraud score reaches the threshold', async () => {
    const driver = { id: 'driver-1', fraudScore: 60, isFraudSuspicious: false };
    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.orderRepo.findOne.mockResolvedValue({ id: 'order-1' });
    mocks.branchRepo.findOne.mockResolvedValue({ id: 'branch-1' });
    mocks.fraudRepo.create.mockReturnValue({ id: 'fraud-1' });
    mocks.fraudRepo.save.mockResolvedValue({ id: 'fraud-1' });
    mocks.driverRepo.update.mockResolvedValue({ affected: 1 });

    await (mocks.service as any).recordFraudIncident('driver-1', 'order-1', 'branch-1', 'gps_spoofing', {}, 'high');

    expect(mocks.driverRepo.update).toHaveBeenCalledWith('driver-1', expect.objectContaining({
      fraudScore: 100,
      isFraudSuspicious: true,
    }));
  });
});
