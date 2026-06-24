import * as Location from 'expo-location';

export type LocationPoint = {
  lat: number;
  lng: number;
  accuracy?: number | null;
  speed?: number | null;
};

export type LocationPermissionStatus = 'granted' | 'denied' | 'pending';

export type LocationWatchOptions = {
  accuracy?: Location.Accuracy;
  distanceInterval?: number;
  timeInterval?: number;
};

export type LocationWatcher = {
  remove: () => void;
};

function toLocationPoint(position: Location.LocationObject): LocationPoint {
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    speed: position.coords.speed,
  };
}

export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') return 'granted';
  return 'denied';
}

export async function getCurrentLocation(options: LocationWatchOptions = {}): Promise<LocationPoint> {
  const position = await Location.getCurrentPositionAsync(options);
  return toLocationPoint(position);
}

export async function watchLocation(
  onLocation: (location: LocationPoint) => void,
  onError: (error: Error) => void,
  options: LocationWatchOptions = {},
): Promise<LocationWatcher> {
  const subscription = await Location.watchPositionAsync(options, (position) => {
    try {
      onLocation(toLocationPoint(position));
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  });

  return {
    remove: () => {
      subscription.remove();
    },
  };
}
