import { describe, expect, it, beforeEach } from '@jest/globals';
import { DriverAssignmentService } from '../src/modules/driver-assignment/driver-assignment.service';

function createService() {
  const driverRepo = { findOne: jest.fn(), update: jest.fn(), find: jest.fn(), createQueryBuilder: jest.fn() };
  const orderRepo = { findOne: jest.fn() };
  const assignmentRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };
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

  return {
    service,
    driverRepo,
    orderRepo,
    assignmentRepo,
    branchRepo,
    scoreRepo,
    slaRepo,
    fraudRepo,
    dispatchEngine,
  };
}

describe('DriverAssignmentService uncovered methods', () => {
  let mocks: ReturnType<typeof createService>;

  beforeEach(() => {
    mocks = createService();
  });

  it('gets driver assignments with optional status filter', async () => {
    const assignments = [{ id: 'a1', status: 'assigned' }];
    mocks.assignmentRepo.find.mockResolvedValue(assignments);

    const result = await mocks.service.getDriverAssignments('driver-1', 'assigned');

    expect(result).toBe(assignments);
    expect(mocks.assignmentRepo.find).toHaveBeenCalledWith({
      where: { driver: { id: 'driver-1' }, status: 'assigned' },
      relations: { order: true, driver: true, branch: true },
      order: { createdAt: 'DESC' },
    });
  });

  it('gets driver assignments without status filter', async () => {
    const assignments = [{ id: 'a1' }, { id: 'a2' }];
    mocks.assignmentRepo.find.mockResolvedValue(assignments);

    const result = await mocks.service.getDriverAssignments('driver-1');

    expect(result).toBe(assignments);
    expect(mocks.assignmentRepo.find).toHaveBeenCalledWith({
      where: { driver: { id: 'driver-1' } },
      relations: { order: true, driver: true, branch: true },
      order: { createdAt: 'DESC' },
    });
  });

  it('gets order assignments', async () => {
    const assignments = [{ id: 'a1' }];
    mocks.assignmentRepo.find.mockResolvedValue(assignments);

    const result = await mocks.service.getOrderAssignments('order-1');

    expect(result).toBe(assignments);
    expect(mocks.assignmentRepo.find).toHaveBeenCalledWith({
      where: { order: { id: 'order-1' } },
      relations: { driver: true, branch: true },
      order: { createdAt: 'DESC' },
    });
  });

  it('updates assignment status', async () => {
    const assignment = { id: 'a1', status: 'assigned' };
    mocks.assignmentRepo.findOne.mockResolvedValue(assignment);
    mocks.assignmentRepo.save.mockImplementation(async (entity) => entity);

    const result = await mocks.service.updateAssignmentStatus('a1', 'picked_up', 15);

    expect(result.status).toBe('picked_up');
    expect(result.actualTimeMinutes).toBe(15);
  });

  it('sets actualTimeMinutes to 0 when delivered without explicit time', async () => {
    const assignment = { id: 'a1', status: 'picked_up', actualTimeMinutes: undefined };
    mocks.assignmentRepo.findOne.mockResolvedValue(assignment);
    mocks.assignmentRepo.save.mockImplementation(async (entity) => entity);

    const result = await mocks.service.updateAssignmentStatus('a1', 'delivered');

    expect(result.status).toBe('delivered');
    expect(result.actualTimeMinutes).toBe(0);
  });

  it('throws when updating status for missing assignment', async () => {
    mocks.assignmentRepo.findOne.mockResolvedValue(null);

    await expect(mocks.service.updateAssignmentStatus('missing', 'delivered')).rejects.toThrow(
      'Assignment not found'
    );
  });

  it('updates assignment route data', async () => {
    const assignment = { id: 'a1', status: 'assigned' };
    mocks.assignmentRepo.findOne.mockResolvedValue(assignment);
    mocks.assignmentRepo.save.mockImplementation(async (entity) => entity);

    const routeData = {
      start: { lat: 12.97, lng: 77.59 },
      end: { lat: 12.95, lng: 77.61 },
      waypoints: [{ lat: 12.96, lng: 77.60, timestamp: new Date() }],
    };

    const result = await mocks.service.updateAssignmentRoute('a1', routeData);

    expect(result.routeData).toBe(routeData);
  });

  it('throws when updating route for missing assignment', async () => {
    mocks.assignmentRepo.findOne.mockResolvedValue(null);

    await expect(
      mocks.service.updateAssignmentRoute('missing', { start: { lat: 0, lng: 0 }, end: { lat: 0, lng: 0 }, waypoints: [] })
    ).rejects.toThrow('Assignment not found');
  });

  it('records delivery SLA metrics', async () => {
    const driver = { id: 'driver-1' };
    const branch = { id: 'branch-1' };
    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.branchRepo.findOne.mockResolvedValue(branch);
    mocks.slaRepo.create.mockImplementation((partial: any) => ({ id: 'sla-1', ...partial }));
    mocks.slaRepo.save.mockImplementation(async (entity: any) => entity);

    const result = await mocks.service.recordDeliverySLA(
      'driver-1',
      'branch-1',
      'delivery_time',
      25,
      'minutes',
      30,
      'minutes',
      'per_delivery'
    );

    expect(result).toBeDefined();
    expect(mocks.slaRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ metricName: 'delivery_time', value: 25, unit: 'minutes' })
    );
  });

  it('throws on SLA when driver missing', async () => {
    mocks.driverRepo.findOne.mockResolvedValue(null);
    mocks.branchRepo.findOne.mockResolvedValue({ id: 'branch-1' });

    await expect(mocks.service.recordDeliverySLA('missing', 'branch-1', 'time', 10, 'min')).rejects.toThrow(
      'Driver or branch not found'
    );
  });

  it('gets delivery SLA metrics with filters', async () => {
    const metrics = [{ id: 'sla-1' }];
    mocks.slaRepo.find.mockResolvedValue(metrics);

    const result = await mocks.service.getDeliverySLAMetrics('driver-1', 'branch-1', 'delivery_time', 50);

    expect(result).toBe(metrics);
    expect(mocks.slaRepo.find).toHaveBeenCalledWith({
      where: { driver: { id: 'driver-1' }, branch: { id: 'branch-1' }, metricName: 'delivery_time' },
      order: { measuredAt: 'DESC' },
      take: 50,
    });
  });

  it('gets delivery SLA metrics without filters', async () => {
    const metrics = [{ id: 'sla-1' }, { id: 'sla-2' }];
    mocks.slaRepo.find.mockResolvedValue(metrics);

    const result = await mocks.service.getDeliverySLAMetrics();

    expect(result).toBe(metrics);
    expect(mocks.slaRepo.find).toHaveBeenCalledWith({
      where: {},
      order: { measuredAt: 'DESC' },
      take: 100,
    });
  });

  it('records fraud incident with low severity', async () => {
    const driver = { id: 'driver-1', fraudScore: 10 };
    const order = { id: 'order-1' };
    const branch = { id: 'branch-1' };
    const fraud = { id: 'fraud-1' };

    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.branchRepo.findOne.mockResolvedValue(branch);
    mocks.fraudRepo.create.mockReturnValue(fraud);
    mocks.fraudRepo.save.mockResolvedValue(fraud);
    mocks.driverRepo.update.mockResolvedValue({ affected: 1 });

    const result = await mocks.service.recordFraudIncident(
      'driver-1',
      'order-1',
      'branch-1',
      'late_delivery_abuse',
      { note: 'test' },
      'low'
    );

    expect(result).toBe(fraud);
    expect(mocks.driverRepo.update).toHaveBeenCalledWith('driver-1', expect.objectContaining({
      fraudScore: 15,
      isFraudSuspicious: false,
    }));
  });

  it('marks driver suspicious on high-severity fraud', async () => {
    const driver = { id: 'driver-1', fraudScore: 50 };
    const order = { id: 'order-1' };
    const branch = { id: 'branch-1' };
    const fraud = { id: 'fraud-1' };

    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.branchRepo.findOne.mockResolvedValue(branch);
    mocks.fraudRepo.create.mockReturnValue(fraud);
    mocks.fraudRepo.save.mockResolvedValue(fraud);
    mocks.driverRepo.update.mockResolvedValue({ affected: 1 });

    await mocks.service.recordFraudIncident('driver-1', 'order-1', 'branch-1', 'gps_spoofing', {}, 'high');

    expect(mocks.driverRepo.update).toHaveBeenCalledWith('driver-1', expect.objectContaining({
      fraudScore: 95,
      isFraudSuspicious: true,
    }));
  });

  it('throws on fraud incident when any entity missing', async () => {
    mocks.driverRepo.findOne.mockResolvedValue(null);
    mocks.orderRepo.findOne.mockResolvedValue({ id: 'order-1' });
    mocks.branchRepo.findOne.mockResolvedValue({ id: 'branch-1' });

    await expect(
      mocks.service.recordFraudIncident('missing', 'order-1', 'branch-1', 'fake_delivery', {}, 'medium')
    ).rejects.toThrow('Driver, order, or branch not found');
  });

  it('gets driver fraud history', async () => {
    const history = [{ id: 'fraud-1', fraudType: 'gps_spoofing' }];
    mocks.fraudRepo.find.mockResolvedValue(history);

    const result = await mocks.service.getDriverFraudHistory('driver-1');

    expect(result).toBe(history);
    expect(mocks.fraudRepo.find).toHaveBeenCalledWith({
      where: { driver: { id: 'driver-1' } },
      order: { createdAt: 'DESC' },
    });
  });

  it('delegates batch delivery to dispatch engine', async () => {
    mocks.dispatchEngine.assignBatchDelivery.mockResolvedValue([{ id: 'a1' }]);

    const result = await mocks.service.assignBatchDelivery(['order-1', 'order-2'], 'driver-1');

    expect(result).toHaveLength(1);
    expect(mocks.dispatchEngine.assignBatchDelivery).toHaveBeenCalledWith(['order-1', 'order-2'], 'driver-1');
  });

  it('delegates driver assignment to dispatch engine', async () => {
    mocks.dispatchEngine.dispatchOrder.mockResolvedValue({ id: 'a1', driver: { id: 'driver-1' } });

    const result = await mocks.service.assignDriverToOrder('order-1');

    expect(result.driver.id).toBe('driver-1');
    expect(mocks.dispatchEngine.dispatchOrder).toHaveBeenCalledWith('order-1');
  });

  it('returns available drivers within radius', async () => {
    const drivers = [{ id: 'd1', isOnline: true, kycStatus: 'approved', isFraudSuspicious: false }];
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(drivers),
    };
    mocks.driverRepo.createQueryBuilder = jest.fn().mockReturnValue(qb);

    const result = await mocks.service.getAvailableDrivers(12.97, 77.59, 5);

    expect(result).toBe(drivers);
    expect(mocks.driverRepo.createQueryBuilder).toHaveBeenCalledWith('driver');
  });

  it('creates default score when driver has no delivery history', async () => {
    const driver = { id: 'driver-1', rating: 4.5, totalDeliveries: 0, totalDistance: 0, averageSpeed: 0 };
    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.assignmentRepo.find.mockResolvedValue([]);
    mocks.scoreRepo.create.mockImplementation((partial: any) => ({ id: 'score-1', ...partial }));
    mocks.scoreRepo.save.mockImplementation(async (entity: any) => entity);

    const result = await mocks.service.updateDriverScore('driver-1');

    expect(result.overallScore).toBe(0);
    expect(result.customerRating).toBe(4.5);
    expect(mocks.scoreRepo.save).toHaveBeenCalled();
  });

  it('calculates driver score from delivery history', async () => {
    const driver = { id: 'driver-1', rating: 4.0, totalDeliveries: 50, totalDistance: 100, averageSpeed: 30 };
    const assignments = [
      { id: 'a1', actualTimeMinutes: 20, estimatedTimeMinutes: 25 },
      { id: 'a2', actualTimeMinutes: 30, estimatedTimeMinutes: 30 },
      { id: 'a3', actualTimeMinutes: 35, estimatedTimeMinutes: 25 },
    ];
    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.assignmentRepo.find.mockResolvedValue(assignments);
    mocks.assignmentRepo.count.mockResolvedValue(0);
    mocks.scoreRepo.findOne.mockResolvedValue(null);
    mocks.scoreRepo.create.mockImplementation((partial: any) => ({ id: 'score-1', ...partial }));
    mocks.scoreRepo.save.mockImplementation(async (entity: any) => entity);

    const result = await mocks.service.updateDriverScore('driver-1');

    expect(result.onTimeDeliveryRate).toBeCloseTo(66.66, 1);
    expect(result.acceptanceRate).toBe(95);
    expect(result.cancellationRate).toBe(0);
    expect(result.overallScore).toBeGreaterThan(0);
    expect(mocks.scoreRepo.save).toHaveBeenCalled();
  });

  it('updates existing driver score', async () => {
    const driver = { id: 'driver-1', rating: 4.0, totalDeliveries: 50, totalDistance: 100, averageSpeed: 30 };
    const existingScore = { id: 'score-1', driver: { id: 'driver-1' } };
    const assignments = [
      { id: 'a1', actualTimeMinutes: 20, estimatedTimeMinutes: 25 },
      { id: 'a2', actualTimeMinutes: 30, estimatedTimeMinutes: 30 },
    ];
    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.assignmentRepo.find.mockResolvedValue(assignments);
    mocks.assignmentRepo.count.mockResolvedValue(0);
    mocks.scoreRepo.findOne.mockResolvedValue(existingScore);
    mocks.scoreRepo.save.mockImplementation(async (entity: any) => entity);

    const result = await mocks.service.updateDriverScore('driver-1');

    expect(mocks.scoreRepo.create).not.toHaveBeenCalled();
    expect(mocks.scoreRepo.save).toHaveBeenCalled();
    expect(result.driver.id).toBe('driver-1');
  });

  it('throws when driver not found for score update', async () => {
    mocks.driverRepo.findOne.mockResolvedValue(null);

    await expect(mocks.service.updateDriverScore('missing')).rejects.toThrow('Driver not found');
  });

  it('calculates fraud score for medium severity with route deviation', async () => {
    const driver = { id: 'driver-1', fraudScore: 20 };
    const order = { id: 'order-1' };
    const branch = { id: 'branch-1' };
    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.branchRepo.findOne.mockResolvedValue(branch);
    mocks.driverRepo.update.mockResolvedValue({ affected: 1 });

    await mocks.service.recordFraudIncident('driver-1', 'order-1', 'branch-1', 'route_deviation', {}, 'medium');

    expect(mocks.driverRepo.update).toHaveBeenCalledWith('driver-1', expect.objectContaining({
      fraudScore: 38,
      isFraudSuspicious: false,
    }));
  });

  it('returns early when driver missing in fraud score update', async () => {
    mocks.driverRepo.findOne.mockResolvedValue(null);

    await (mocks.service as any).updateDriverFraudScore('missing', 'late_delivery_abuse', 'low');

    expect(mocks.driverRepo.update).not.toHaveBeenCalled();
  });

  it('calculates fraud score for default fraud type', async () => {
    const driver = { id: 'driver-1', fraudScore: 30 };
    const order = { id: 'order-1' };
    const branch = { id: 'branch-1' };
    mocks.driverRepo.findOne.mockResolvedValue(driver);
    mocks.orderRepo.findOne.mockResolvedValue(order);
    mocks.branchRepo.findOne.mockResolvedValue(branch);
    mocks.driverRepo.update.mockResolvedValue({ affected: 1 });

    await mocks.service.recordFraudIncident('driver-1', 'order-1', 'branch-1', 'other', {}, 'high');

    expect(mocks.driverRepo.update).toHaveBeenCalledWith('driver-1', expect.objectContaining({
      fraudScore: 60,
      isFraudSuspicious: false,
    }));
  });
});
