declare module '@react-native-community/geolocation' {
  interface GeoOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    distanceFilter?: number;
  }
  interface GeoPosition {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }
  interface GeoError {
    code: number;
    message: string;
    PERMISSION_DENIED: number;
    POSITION_UNAVAILABLE: number;
    TIMEOUT: number;
  }
  const _Geolocation: {
    getCurrentPosition: (
      success: (position: GeoPosition) => void,
      error?: (error: GeoError) => void,
      options?: GeoOptions
    ) => void;
    watchPosition: (
      success: (position: GeoPosition) => void,
      error?: (error: GeoError) => void,
      options?: GeoOptions
    ) => number;
    clearWatch: (watchId: number) => void;
    stopObserving: () => void;
    requestAuthorization: () => void;
    getCurrentPositionWithHeaders: (
      success: (position: GeoPosition) => void,
      error?: (error: GeoError) => void,
      options?: GeoOptions & { headers?: Record<string, string> }
    ) => void;
  };
  export default _Geolocation;
}

declare module 'react-native-background-timer' {
  const BackgroundTimer: {
    start: () => void;
    stopBackgroundTimer: () => void;
    runBackgroundTimer: (callback: () => void, delay: number) => void;
    stopBackgroundTimer: (callbackId?: string) => void;
    value: number;
  };
  export default BackgroundTimer;
}

declare const AppState: {
  addEventListener: (event: 'change', handler: (status: AppStateStatus) => void) => { remove: () => void };
  currentState: AppStateStatus;
};

declare type AppStateStatus = 'active' | 'background' | 'inactive' | 'extension' | 'unknown';

interface NativeAppState {
  AppState: typeof AppState;
  AppStateStatus: AppStateStatus;
}

declare module 'react-native' {
  export { AppState, AppStateStatus };
  const AppState: typeof AppState;
  type AppStateStatus = AppStateStatus;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    multiRemove: (keys: string[]) => Promise<void>;
  };
  export default AsyncStorage;
}

declare global {
  var process: {
    env: {
      API_BASE_URL?: string;
      NEXT_PUBLIC_API_URL?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
    };
  } | undefined;
}