import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from './src/navigation/types';
import { LocaleProvider } from './src/constants/i18n';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import OrderDetailsScreen from './src/screens/OrderDetailsScreen';
import RestaurantScreen from './src/screens/RestaurantScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import AddressesScreen from './src/screens/AddressesScreen';
import LegalScreen from './src/screens/LegalScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = 'html{text-size-adjust:100%;}';
  document.head.appendChild(style);
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Address" component={AddressesScreen} />
        <Stack.Screen name="Legal" component={LegalScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>H</Text>
        )
      }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{
        tabBarLabel: 'Search',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>S</Text>
        )
      }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{
        tabBarLabel: 'Cart',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>C</Text>
        )
      }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>P</Text>
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