import AsyncStorage from '@react-native-async-storage/async-storage';
import { deliveryApi, type DriverProfile } from '../delivery-api.service';

const profile: DriverProfile = {
  id: 'driver-123',
  name: 'Raj Kumar',
  email: 'raj.kumar@spicegarden.com',
  phone: '+91 98765 43210',
  vehicleType: 'Bike',
  licenseNumber: 'DL-001',
  vehicleNumber: 'PB01AB1234',
  rating: 4.8,
  totalDeliveries: 101,
  isOnline: true,
  isAvailable: true,
  kycStatus: 'approved',
};

const earnings = {
  availableBalance: 1200,
  pendingBalance: 300,
  lifetimeEarnings: 98000,
  weeklyEarnings: 8200,
  todayEarnings: 1200,
};

describe('Delivery Partner API e2e flow', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
      if (key === 'driver_token') return 'driver-token';
      if (key === 'driver_id') return 'driver-123';
      return null;
    });
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    await deliveryApi.logout();
  });

  it('logs in, stores credentials, fetches earnings, and logs out', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation((async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/api/auth/login')) {
        return {
          ok: true,
          json: async () => ({ access_token: 'driver-token', driverId: 'driver-123' }),
        } as Response;
      }
      if (url.endsWith('/api/drivers/me')) {
        return {
          ok: true,
          json: async () => profile,
        } as Response;
      }
      if (url.endsWith('/api/drivers/driver-123/earnings')) {
        return {
          ok: true,
          json: async () => earnings,
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    }) as typeof fetch);

    const loginResult = await deliveryApi.login('driver@example.com', 'password');
    const earningsResult = await deliveryApi.getEarnings('driver-123');
    await deliveryApi.logout();

    expect(loginResult.token).toBe('driver-token');
    expect(loginResult.driverId).toBe('driver-123');
    expect(loginResult.profile).toEqual(profile);
    expect(earningsResult).toEqual(earnings);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('driver_token', 'driver-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('driver_id', 'driver-123');
  });
});
