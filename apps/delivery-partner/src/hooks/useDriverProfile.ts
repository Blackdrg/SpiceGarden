import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

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

export function useDriverProfile() {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem('sg_driver_data');
      setProfile(data ? JSON.parse(data) : null);
    } catch (error) {
      console.error('Failed to load driver profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (newProfile: DriverProfile) => {
    try {
      await AsyncStorage.setItem('sg_driver_data', JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Failed to save driver profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, loading, saveProfile, reload: loadProfile };
}