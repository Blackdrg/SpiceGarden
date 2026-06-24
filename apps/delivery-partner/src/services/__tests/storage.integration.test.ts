jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearDriverData,
  getDriverProfile,
  getEarningsHistory,
  saveDriverProfile,
  saveEarningsHistory,
} from '../storage.service';

const profile = {
  id: 'driver-123',
  name: 'Raj Kumar',
  email: 'raj.kumar@spicegarden.com',
  phone: '+91 98765 43210',
  vehicle: 'Bajaj Dominar 400 | DL8CAB 7890',
  licenseNumber: 'DL-XXXX-XXXX-XX',
  rating: 4.8,
  totalDeliveries: 421,
  memberSince: 'Jan 2024',
  isVerified: true,
};

const earnings = [
  { date: '2026-06-15', amount: 1200, orders: 8, bonus: 150 },
  { date: '2026-06-16', amount: 900, orders: 6, bonus: 0 },
];

describe('Delivery Partner storage integration', () => {
  beforeEach(() => {
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
  });

  it('persists and restores driver profile', async () => {
    await saveDriverProfile(profile);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('sg_driver_data', JSON.stringify(profile));

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(profile));
    await expect(getDriverProfile()).resolves.toEqual(profile);
  });

  it('persists and restores earnings history', async () => {
    await saveEarningsHistory(earnings);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('sg_earnings_history', JSON.stringify(earnings));

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(earnings));
    await expect(getEarningsHistory()).resolves.toEqual(earnings);
  });

  it('clears driver and earnings records', async () => {
    await clearDriverData();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('sg_driver_data');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('sg_earnings_history');
  });
});
