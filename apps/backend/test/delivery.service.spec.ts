import { describe, expect, it, jest } from '@jest/globals';
import { DeliveryService } from '../src/services/delivery/delivery.service';

function createDeliveryService() {
  return Object.create(DeliveryService.prototype) as any;
}

describe('DeliveryService core delivery logic', () => {
  let service: any;

  beforeEach(() => {
    service = createDeliveryService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    try {
      (jest as any).useRealTimers();
    } catch {}
  });

  it('calculates traffic-aware ETA and distance from the geo service', () => {
    service.geoService = {
      calculateDistance: jest.fn().mockReturnValue(12),
      predictETA: jest.fn().mockReturnValue({ distance: 12, duration: 24 }),
    };

    const result = service.calculateTrafficAwareRoute(
      { lat: 12.9716, lng: 77.5946 },
      { lat: 12.9352, lng: 77.6245 },
      40,
    );

    expect(result.distance).toBe(12);
    expect(result.duration).toBeGreaterThan(0);
    expect(result.eta).toBeGreaterThanOrEqual(result.duration);
    expect(result.trafficFactor).toBeGreaterThanOrEqual(0.5);
    expect(result.trafficFactor).toBeLessThanOrEqual(3);
  });

  it('uses bounded traffic factors during rush hours', () => {
    service.geoService = {
      calculateDistance: jest.fn().mockReturnValue(5),
      predictETA: jest.fn().mockReturnValue({ distance: 5, duration: 10 }),
    };

    const normal = service.calculateTrafficAwareRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, 30);
    const rush = service.calculateTrafficAwareRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, 10);

    expect(normal.trafficFactor).toBeGreaterThanOrEqual(0.5);
    expect(normal.trafficFactor).toBeLessThanOrEqual(3);
    expect(rush.trafficFactor).toBeGreaterThanOrEqual(normal.trafficFactor);
  });

  it('uses default historical speed when not provided', () => {
    service.geoService = {
      calculateDistance: jest.fn().mockReturnValue(5),
      predictETA: jest.fn().mockReturnValue({ distance: 5, duration: 10 }),
    };

    const result = service.calculateTrafficAwareRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });

    expect(result.distance).toBe(5);
    expect(result.duration).toBeGreaterThan(0);
    expect(result.trafficFactor).toBeGreaterThanOrEqual(0.5);
  });

  it('returns 1.5 traffic factor during morning rush hours', () => {
    service.geoService = {
      calculateDistance: jest.fn().mockReturnValue(5),
      predictETA: jest.fn().mockReturnValue({ distance: 5, duration: 10 }),
    };

    (jest as any).useFakeTimers('modern');
    (jest as any).setSystemTime(new Date('2026-06-24T02:30:00.000Z').getTime());

    const result = service.calculateTrafficAwareRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });

    expect(result.trafficFactor).toBe(1.5);
  });

  it('returns 1.3 traffic factor during lunch rush hours', () => {
    service.geoService = {
      calculateDistance: jest.fn().mockReturnValue(5),
      predictETA: jest.fn().mockReturnValue({ distance: 5, duration: 10 }),
    };

    (jest as any).useFakeTimers('modern');
    (jest as any).setSystemTime(new Date('2026-06-24T07:30:00.000Z').getTime());

    const result = service.calculateTrafficAwareRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });

    expect(result.trafficFactor).toBe(1.3);
  });

  it('returns 1.7 traffic factor during evening rush hours', () => {
    service.geoService = {
      calculateDistance: jest.fn().mockReturnValue(5),
      predictETA: jest.fn().mockReturnValue({ distance: 5, duration: 10 }),
    };

    (jest as any).useFakeTimers('modern');
    (jest as any).setSystemTime(new Date('2026-06-24T12:30:00.000Z').getTime());

    const result = service.calculateTrafficAwareRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });

    expect(result.trafficFactor).toBe(1.7);
  });

  it('returns 1.0 traffic factor during normal hours', () => {
    service.geoService = {
      calculateDistance: jest.fn().mockReturnValue(5),
      predictETA: jest.fn().mockReturnValue({ distance: 5, duration: 10 }),
    };

    (jest as any).useFakeTimers('modern');
    (jest as any).setSystemTime(new Date('2026-06-24T05:30:00.000Z').getTime());

    const result = service.calculateTrafficAwareRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });

    expect(result.trafficFactor).toBe(1.0);
  });

  it('registers drivers with pending KYC and zero-balance wallet', async () => {
    const driverRepo = { create: jest.fn(), save: jest.fn() } as any;
    const walletRepo = { create: jest.fn(), save: jest.fn() } as any;
    driverRepo.create.mockReturnValue({});
    driverRepo.save.mockReturnValue({ id: 'driver-1', kycStatus: 'pending' });
    walletRepo.create.mockReturnValue({});
    walletRepo.save.mockReturnValue({ id: 'wallet-1', balance: 0 });
    service.driverRepo = driverRepo;
    service.walletRepo = walletRepo;

    const result = await service.registerDriver('user-1', { fullName: 'Driver' });

    expect(result.kycStatus).toBe('pending');
    expect(walletRepo.create).toHaveBeenCalledWith({ userId: 'user-1', balance: 0 });
    expect(walletRepo.save).toHaveBeenCalled();
  });

  it('updates driver location', async () => {
    const driverRepo = { update: jest.fn() } as any;
    driverRepo.update.mockResolvedValue({ affected: 1 });
    service.driverRepo = driverRepo;

    await service.updateLocation('driver-1', 12.97, 77.59);

    expect(driverRepo.update).toHaveBeenCalledWith('driver-1', {
      currentLocation: { lat: 12.97, lng: 77.59 },
    });
  });

  it('finds available drivers within radius', async () => {
    const qb: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: (jest.fn() as any).mockResolvedValue([{ id: 'd1' }]),
    };
    const driverRepo = { createQueryBuilder: jest.fn().mockReturnValue(qb) } as any;
    service.driverRepo = driverRepo;

    const result = await service.findAvailableDrivers(12.97, 77.59, 5);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('d1');
  });

  it('assigns order to driver and sets status', async () => {
    const orderRepo = { update: jest.fn() } as any;
    orderRepo.update.mockResolvedValue({ affected: 1 });
    service.orderRepo = orderRepo;

    await service.assignOrderToDriver('order-1', 'driver-1');

    expect(orderRepo.update).toHaveBeenCalledWith('order-1', {
      driverId: 'driver-1',
      status: 'driver_assigned',
    });
  });

  it('calculates score components when driver exists', async () => {
    const driverRepo = { findOne: jest.fn() } as any;
    driverRepo.findOne.mockResolvedValue({ id: 'd1', rating: 4.2 });
    service.driverRepo = driverRepo;

    const result = await service.calculateScoreComponents('d1');

    expect(result.overallScore).toBe(4.2);
    expect(result.onTimeRate).toBe(0);
    expect(result.acceptanceRate).toBe(0);
  });

  it('calculates positive rates when driver has total deliveries', async () => {
    const driverRepo = { findOne: jest.fn() } as any;
    driverRepo.findOne.mockResolvedValue({ id: 'd1', rating: 4.5, totalDeliveries: 100 });
    service.driverRepo = driverRepo;

    const result = await service.calculateScoreComponents('d1');

    expect(result.overallScore).toBe(4.5);
    expect(result.onTimeRate).toBeCloseTo(0.95, 1);
    expect(result.acceptanceRate).toBeCloseTo(0.90, 1);
    expect(result.cancellationRate).toBeCloseTo(0.05, 1);
  });

  it('throws NotFoundException when driver does not exist', async () => {
    const driverRepo = { findOne: jest.fn() } as any;
    driverRepo.findOne.mockResolvedValue(null);
    service.driverRepo = driverRepo;

    await expect(service.calculateScoreComponents('nonexistent')).rejects.toThrow('Driver not found');
  });
});
