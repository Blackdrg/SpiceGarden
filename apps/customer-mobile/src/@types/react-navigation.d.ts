declare module '@react-navigation/native' {
  import React from 'react';
  export const NavigationContainer: React.FC<{ children: React.ReactNode }>;
  export function useNavigation(): {
    navigate: (name: string, params?: any) => void;
    replace: (name: string) => void;
    goBack: () => void;
    dispatch: () => void;
  };
}

declare module '@react-navigation/native-stack' {
  import React from 'react';
  export const createStackNavigator: () => {
    Navigator: React.FC<{ screenOptions?: any; children?: React.ReactNode }>;
    Screen: React.FC<{ name: string; component: React.FC; options?: any }>;
  };
  export interface NativeStackScreenProps<ParamList extends {}, RouteName extends keyof ParamList = keyof ParamList> {
    navigation: {
      navigate: (name: string, params?: any) => void;
      replace: (name: string) => void;
      goBack: () => void;
      dispatch: () => void;
    };
    route: {
      params: ParamList[RouteName];
    };
  }
  export interface NativeStackNavigationProp<ParamList extends {}> {
    navigate: (name: string, params?: any) => void;
    replace: (name: string) => void;
    goBack: () => void;
    dispatch: () => void;
  }
}

declare module '@react-navigation/bottom-tabs' {
  import React from 'react';
  export const createBottomTabNavigator: () => {
    Navigator: React.FC<{ screenOptions?: any; children?: React.ReactNode }>;
    Screen: React.FC<{ name: string; component: React.FC; options?: any }>;
  };
}

declare module '@react-navigation/stack' {
  import React from 'react';
  export const createStackNavigator: () => {
    Navigator: React.FC<{ screenOptions?: any; children?: React.ReactNode }>;
    Screen: React.FC<{ name: string; component: React.FC; options?: any }>;
  };
  export interface StackNavigationProp<ParamList extends {}> {
    navigate: (name: string, params?: any) => void;
    replace: (name: string) => void;
    goBack: () => void;
    dispatch: () => void;
  }
}

declare module '@expo/vector-icons' {
  import React from 'react';
  export const Ionicons: React.FC<{ name: string; size: number; color?: string }>;
}