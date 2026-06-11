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
  export type NativeStackScreenProps<ParamList extends object, RouteName extends keyof ParamList> = {
    navigation: NativeStackNavigationProp<ParamList, RouteName>;
    route: NativeStackRouteProp<ParamList, RouteName>;
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

declare module 'react-native' {
  import * as React from 'react';
  export const View: React.FC<unknown>;
  export const Text: React.FC<unknown>;
  export const FlatList: React.FC<unknown>;
  export const TouchableOpacity: React.FC<unknown>;
  export const StyleSheet: {
    create: (styles: Record<string, unknown>) => Record<string, unknown>;
  };
  export const ActivityIndicator: React.FC<unknown>;
  export const TextInput: React.FC<unknown>;
  export const Image: React.FC<unknown>;
  export const ScrollView: React.FC<unknown>;
  export const Easing: {
    out: (easingFn: (value: number) => number) => (value: number) => number;
    quad: (value: number) => number;
  };
  interface AnimatedTimingResult {
    start: (callback?: (finished?: boolean) => void) => void;
  }
  interface AnimatedConfig {
    toValue: number;
    duration: number;
    easing?: (value: number) => number;
    useNativeDriver: boolean;
  }
  interface AnimatedStatic {
    Value: unknown;
    timing(value: unknown, config: AnimatedConfig): AnimatedTimingResult;
    parallel(anims: AnimatedTimingResult[]): AnimatedTimingResult;
    sequence: (anims: AnimatedTimingResult[]) => AnimatedTimingResult;
    View: React.FC<unknown>;
  }
  export const Animated: AnimatedStatic;
}

declare module '@spicegarden/ui' {
  export const DESIGN_TOKENS: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      elevated: string;
      textPrimary: string;
      textSecondary: string;
      textInverse: string;
      success: string;
      danger: string;
      warning: string;
      premium: string;
      border: string;
      dangerDark: string;
      neutral: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    typography: {
      fontFamily: string;
    };
    radius: {
      sm: number;
      md: number;
      button: number;
      input: number;
      card: number;
      container: number;
      full: number;
    };
    motion: {
      micro: number;
      standard: number;
      page: number;
    };
  };
}

declare module '../components/SkeletonLoader' {
  import * as React from 'react';
  const Skeleton: React.FC<unknown>;
  export default Skeleton;
}