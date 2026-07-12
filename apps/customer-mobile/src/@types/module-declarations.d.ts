declare module 'expo-haptics' {
  export enum NotificationFeedbackType {
    Error = 'Error',
    Warning = 'Warning',
    Success = 'Success',
  }
  export enum ImpactFeedbackStyle {
    Light = 'Light',
    Medium = 'Medium',
    Heavy = 'Heavy',
    Rigid = 'Rigid',
    Soft = 'Soft',
  }
  export function notificationAsync(type: NotificationFeedbackType): Promise<void>;
  export function selectionAsync(): Promise<void>;
  export function impactAsync(style: ImpactFeedbackStyle): Promise<void>;
}

declare module 'react-native-root-toast' {
  export interface ToastOptions {
    duration?: number;
    position?: number;
    shadow?: boolean;
    animation?: boolean;
    hideOnPress?: boolean;
    delay?: number;
    backgroundColor?: string;
    textColor?: string;
    opacity?: number;
    shadowColor?: string;
    backgroundColorAndroid?: string;
    textColorAndroid?: string;
  }
  const Toast: {
    show(message: string, options?: ToastOptions): unknown;
    hide(toast: unknown): void;
    durations: { LONG: number; SHORT: number };
    positions: { BOTTOM: number; TOP: number; CENTER: number };
  };
  export default Toast;
}

declare module '@react-navigation/native' {
  import * as React from 'react';
  export function useNavigation<RootParamList extends object = object>(): {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    replace: (screen: string) => void;
    goBack: () => void;
    getState: () => Readonly<{
      key: string;
      index: number;
      routeNames: string[];
      type: string;
      stale: false;
    }>;
  };
  export function useRoute(): {
    params: Record<string, unknown>;
    name: string;
    key: string;
  };
  export type NavigationProp<RootParamList extends object = object> = unknown;
  export type ParamListBase = object;
}

declare module '@react-navigation/native-stack' {
  import * as React from 'react';
  export type NativeStackRouteProp<ParamList extends object, RouteName extends keyof ParamList> = {
    key: string;
    name: RouteName;
    params: ParamList[RouteName];
  };
  export type NativeStackNavigationProp<ParamList extends object, RouteName extends keyof ParamList> = {
    navigate: (screen: RouteName, params?: ParamList[RouteName]) => void;
    replace: (screen: RouteName, params?: ParamList[RouteName]) => void;
    goBack: () => void;
    getState: () => Readonly<{
      key: string;
      index: number;
      routeNames: string[];
      type: string;
      stale: false;
    }>;
  };
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    multiRemove(keys: string[]): Promise<void>;
  };
  export default AsyncStorage;
}

declare module '../components/SkeletonLoader' {
  import * as React from 'react';
  const Skeleton: React.FC<unknown>;
  export default Skeleton;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
