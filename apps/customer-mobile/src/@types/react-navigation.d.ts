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
  export type NativeStackRouteProp<ParamList extends object, RouteName extends keyof ParamList> = {
    key: string;
    name: RouteName;
    params: ParamList[RouteName];
  };
  export type NativeStackNavigationProp<ParamList extends object, RouteName extends keyof ParamList = keyof ParamList> = {
    navigate: (screen: RouteName, params?: ParamList[RouteName]) => void;
    replace: (screen: RouteName, params?: ParamList[RouteName]) => void;
    goBack: () => void;
    dispatch: () => void;
  };
  export type NativeStackScreenProps<ParamList extends object, RouteName extends keyof ParamList> = {
    navigation: NativeStackNavigationProp<ParamList, RouteName>;
    route: NativeStackRouteProp<ParamList, RouteName>;
  };
  export const createStackNavigator: () => {
    Navigator: React.FC<{ screenOptions?: any; children?: React.ReactNode }>;
    Screen: React.FC<{ name: string; component: React.FC; options?: any }>;
  };
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