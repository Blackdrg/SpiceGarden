declare module '@react-navigation/native' {
  import React from 'react';
  export const NavigationContainer: React.FC<{ children: React.ReactNode }>;
  export interface NativeStackScreenProps<ParamList extends {}, RouteName extends keyof ParamList = keyof ParamList> {}
}

declare module '@react-navigation/native-stack' {
  import React from 'react';
  import { NativeStackScreenProps } from '@react-navigation/native';
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
}

declare module '@expo/vector-icons' {
  import React from 'react';
  export const Ionicons: React.FC<{ name: string; size: number; color?: string }>;
}
