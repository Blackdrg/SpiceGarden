import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <Text style={{ color, fontSize: size }}>H</Text>
        )
      }} />
      <Tab.Screen name="Search" component={HomeScreen} options={{
        tabBarLabel: 'Search',
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <Text style={{ color, fontSize: size }}>S</Text>
        )
      }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{
        tabBarLabel: 'Cart',
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <Text style={{ color, fontSize: size }}>C</Text>
        )
      }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }: { color: string; size: number }) => (
          <Text style={{ color, fontSize: size }}>P</Text>
        )
      }} />
    </Tab.Navigator>
  );
}

export default MainTabNavigator;
