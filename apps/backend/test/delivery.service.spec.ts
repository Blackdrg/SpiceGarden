import { describe, expect, it, jest } from '@jest/globals';
import { DeliveryService } from '../src/services/delivery/delivery.service';

function createDeliveryService() {
  return Object.create(DeliveryService.prototype) as DeliveryService;
}

describe('DeliveryService core delivery logic', () => {
  const service = createDeliveryService();

  it('calculates traffic-aware ETA and distance from the geo service', () => {
    (service as any).geoService = {
      calculateDistance: jest.fn().mockReturnValue(12),
      predictETA: jest.fn().mockReturnValue({ distance: 12, duration: 24 }),
    } as any;

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
    (service as any).geoService = {
      calculateDistance: jest.fn().mockReturnValue(5),
      predictETA: jest.fn().mockReturnValue({ distance: 5, duration: 10 }),
    } as any;

    const normal = service.calculateTrafficAwareRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, 30);
    const rush = service.calculateTrafficAwareRoute({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, 10);

    expect(normal.trafficFactor).toBeGreaterThanOrEqual(0.5);
    expect(normal.trafficFactor).toBeLessThanOrEqual(3);
    expect(rush.trafficFactor).toBeGreaterThanOrEqual(normal.trafficFactor);
  });

  it('registers drivers with pending KYC and zero-balance wallet', async () => {
    const driverRepo = { create: jest.fn((data: any) => data), save: jest.fn().mockReturnValue(Promise.resolve({ id: 'driver-1', kycStatus: 'pending' } as any)) };
    const walletRepo = { create: jest.fn((data: any) => data), save: jest.fn().mockReturnValue(Promise.resolve({ id: 'wallet-1', balance: 0 } as any)) };
    (service as any).driverRepo = driverRepo;
    (service as any).walletRepo = walletRepo;

    const result = await service.registerDriver('user-1', { fullName: 'Driver' }) as any;

    expect(result.kycStatus).toBe('pending');
    expect(walletRepo.create).toHaveBeenCalledWith({ userId: 'user-1', balance: 0 });
    expect(walletRepo.save).toHaveBeenCalled();
  });
});
