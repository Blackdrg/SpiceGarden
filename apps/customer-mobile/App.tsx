import React, { useEffect, useRef } from 'react';
import { Text, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import WalletScreen from './src/screens/WalletScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SupportScreen from './src/screens/SupportScreen';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
  debug: false,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Payment" component={PaymentMethodsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
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
  const notificationListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener>>();
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener>>();

  useEffect(() => {
    registerForPushNotificationsAsync();

    const checkSentryConsent = async () => {
      try {
        const consentJson = await AsyncStorage.getItem('sg_consent');
        if (consentJson) {
          const consent = JSON.parse(consentJson) as { analytics: boolean };
          if (consent.analytics) {
            Sentry.init({
              dsn: process.env.SENTRY_DSN,
              tracesSampleRate: 1.0,
              debug: false,
            });
          }
        }
      } catch {
        // Keep crash-only mode if consent check fails
      }
    };
    checkSentryConsent();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });

    const handleDeepLink = (event: { url: string }) => {
      const { host, path, scheme } = Linking.parse(event.url);
      console.log('Deep link received:', scheme, host, path);

      if (host === 'pay') {
        console.log('Navigating to payment flow from deep link');
      } else if (host === 'cod') {
        console.log('Navigating to COD confirmation from deep link');
      }
    };

    const linkingListener = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
      linkingListener.remove();
    };
  }, []);

  return (
    <LocaleProvider>
      <AppNavigator />
    </LocaleProvider>
  );
}

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return;
  }
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'spicegarden-customer';
  const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
  console.log('Push token:', pushToken.data);
}