declare module 'expo-notifications' {
  export interface ExpoPushToken {
    data: string;
    type: 'expo';
  }

  export interface Notification {
    date: number;
    request: {
      identifier: string;
      content: {
        title: string;
        body: string;
        data?: Record<string, unknown>;
      };
    };
  }

  export interface NotificationResponse {
    notification: Notification;
  }

  export interface AndroidNotificationPriority {
    MAX: number;
    HIGH: number;
    DEFAULT: number;
    LOW: number;
    MIN: number;
  }

  export interface AndroidImportance {
    MAX: number;
    HIGH: number;
    DEFAULT: number;
    LOW: number;
    MIN: number;
    NONE: number;
  }

  export const AndroidImportance: AndroidImportance;

  export interface PermissionStatus {
    granted: 'granted';
    denied: 'denied';
    undetermined: 'undetermined';
  }

  export const getPermissionsAsync: () => Promise<{ status: keyof PermissionStatus | 'granted' | 'denied' | 'undetermined' }>;
  export const requestPermissionsAsync: () => Promise<{ status: keyof PermissionStatus | 'granted' | 'denied' | 'undetermined' }>;
  export const getExpoPushTokenAsync: () => Promise<ExpoPushToken>;
  export const scheduleNotificationAsync: (options: {
    content: {
      title: string;
      body: string;
      data?: Record<string, unknown>;
      sound?: string;
    };
    trigger: null | Date | number;
  }) => Promise<string>;
  export const setNotificationHandler: (handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldShowBanner: boolean;
      shouldShowList: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }) => void;
  export const setNotificationChannelAsync: (
    channelId: string,
    channel: {
      name: string;
      importance: number;
      vibrationPattern?: number[];
      lightColor?: string;
      sound?: string | null;
    }
  ) => Promise<string>;
  export const addNotificationReceivedListener: (
    handler: (notification: Notification) => void
  ) => { remove: () => void };
  export const addNotificationResponseReceivedListener: (
    handler: (response: NotificationResponse) => void
  ) => { remove: () => void };

  export type NotificationBehavior = {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldShowBanner: boolean;
      shouldShowList: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  };
}