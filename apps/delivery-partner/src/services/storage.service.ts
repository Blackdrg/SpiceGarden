import AsyncStorage from '@react-native-async-storage/async-storage';

const DRIVER_STORAGE_KEY = 'sg_driver_data';

interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  licenseNumber: string;
  rating: number;
  totalDeliveries: number;
  memberSince: string;
  isVerified: boolean;
}

interface EarningsHistory {
  date: string;
  amount: number;
  orders: number;
  bonus: number;
}

const defaultProfile: DriverProfile = {
  id: 'driver-001',
  name: 'Raj Kumar',
  email: 'raj.kumar@spicegarden.com',
  phone: '+91 98765 43210',
  vehicle: 'Bajaj Dominar 400 | DL8CAB 7890',
  licenseNumber: 'DL-XXXX-XXXX-XX',
  rating: 4.8,
  totalDeliveries: 420,
  memberSince: 'Jan 2024',
  isVerified: true,
};

export async function saveDriverProfile(profile: DriverProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(DRIVER_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save driver profile:', error);
  }
}

export async function getDriverProfile(): Promise<DriverProfile> {
  try {
    const data = await AsyncStorage.getItem(DRIVER_STORAGE_KEY);
    return data ? JSON.parse(data) : defaultProfile;
  } catch (error) {
    console.error('Failed to get driver profile:', error);
    return defaultProfile;
  }
}

export async function saveEarningsHistory(history: EarningsHistory[]): Promise<void> {
  try {
    await AsyncStorage.setItem('sg_earnings_history', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save earnings history:', error);
  }
}

export async function getEarningsHistory(): Promise<EarningsHistory[]> {
  try {
    const data = await AsyncStorage.getItem('sg_earnings_history');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get earnings history:', error);
    return [];
  }
}

export async function clearDriverData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRIVER_STORAGE_KEY);
    await AsyncStorage.removeItem('sg_earnings_history');
  } catch (error) {
    console.error('Failed to clear driver data:', error);
  }
}