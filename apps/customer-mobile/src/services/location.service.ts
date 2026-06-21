import * as Location from 'expo-location';

export type MobileLocationPoint = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

export type MobileLocationPermissionStatus = Location.PermissionStatus;

export async function requestMobileLocationPermission(): Promise<MobileLocationPermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status;
}

export async function getCurrentMobileLocation(): Promise<MobileLocationPoint> {
  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
  };
}
