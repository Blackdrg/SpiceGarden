import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import { LocaleProvider } from './src/constants/i18n';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import HistoryScreen from './src/screens/HistoryScreen';

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = 'html{text-size-adjust:100%;}';
  document.head.appendChild(style);
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const lightNavigationTheme = {
  dark: false,
  colors: {
    primary: '#FF5A1F',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    notification: '#FF5A1F',
  },
};

function AppNavigator() {
  return (
    <NavigationContainer theme={lightNavigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' } }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="OrderDetails" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FF5A1F',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size, fontWeight: '700' }}>H</Text>
        )
      }} />
      <Tab.Screen name="Search" component={HomeScreen} options={{
        tabBarLabel: 'Search',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size, fontWeight: '700' }}>S</Text>
        )
      }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{
        tabBarLabel: 'Cart',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size, fontWeight: '700' }}>C</Text>
        )
      }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size, fontWeight: '700' }}>P</Text>
        )
      }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <AppNavigator />
    </LocaleProvider>
  );
}