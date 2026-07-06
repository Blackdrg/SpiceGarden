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
  import type { ParamListBase } from '@react-navigation/native';
  import type { TypedNavigator } from '@react-navigation/core';
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
  export type NativeStackNavigationOptions = {};
  export type NativeStackNavigationEventMap = {};
  export const createNativeStackNavigator: <ParamList extends ParamListBase>() => TypedNavigator<ParamList, any, NativeStackNavigationOptions, NativeStackNavigationEventMap, any>;
}

declare module '@react-navigation/bottom-tabs' {
  import type { ParamListBase } from '@react-navigation/native';
  import type { TypedNavigator } from '@react-navigation/core';
  export type BottomTabNavigationOptions = {};
  export type BottomTabNavigationEventMap = {};
  export const createBottomTabNavigator: <ParamList extends ParamListBase>() => TypedNavigator<ParamList, any, BottomTabNavigationOptions, BottomTabNavigationEventMap, any>;
}

declare module '@react-navigation/stack' {
  import type { ParamListBase } from '@react-navigation/native';
  import type { TypedNavigator } from '@react-navigation/core';
  export type StackNavigationOptions = {};
  export type StackNavigationEventMap = {};
  export const createStackNavigator: <ParamList extends ParamListBase>() => TypedNavigator<ParamList, any, StackNavigationOptions, StackNavigationEventMap, any>;
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